import * as tf from '@tensorflow/tfjs-node';
import { createBirdSoundModel, compileModel, saveModel, ModelConfig, ModelMetrics, calculateTopKAccuracy } from './model';
import { DataGenerator, DataSplit, BirdClass } from './dataLoader';
import { DEFAULT_CONFIG } from './audioProcessor';
import * as fs from 'fs';
import * as path from 'path';

export interface TrainingConfig {
  epochs: number;
  batchSize: number;
  learningRate: number;
  earlyStoppingPatience: number;
  checkpointPath: string;
  logPath: string;
}

export interface EpochMetrics {
  epoch: number;
  trainLoss: number;
  trainAccuracy: number;
  valLoss: number;
  valAccuracy: number;
  valTop3Accuracy: number;
  duration: number;
}

export interface TrainingHistory {
  epochs: EpochMetrics[];
  bestEpoch: number;
  bestValAccuracy: number;
  testMetrics?: ModelMetrics;
}

export class TrainingLogger {
  private logPath: string;
  private logs: string[] = [];

  constructor(logPath: string) {
    this.logPath = logPath;
    this.log('Training started at ' + new Date().toISOString());
  }

  log(message: string): void {
    const timestamp = new Date().toISOString();
    const logLine = `[${timestamp}] ${message}`;
    this.logs.push(logLine);
    console.log(logLine);
  }

  logEpoch(metrics: EpochMetrics): void {
    this.log(
      `Epoch ${metrics.epoch}: ` +
      `train_loss=${metrics.trainLoss.toFixed(4)}, ` +
      `train_acc=${metrics.trainAccuracy.toFixed(4)}, ` +
      `val_loss=${metrics.valLoss.toFixed(4)}, ` +
      `val_acc=${metrics.valAccuracy.toFixed(4)}, ` +
      `val_top3_acc=${metrics.valTop3Accuracy.toFixed(4)}, ` +
      `duration=${metrics.duration.toFixed(2)}s`
    );
  }

  async save(): Promise<void> {
    await fs.promises.writeFile(this.logPath, this.logs.join('\n'));
  }
}

export class EarlyStopping {
  private patience: number;
  private bestValue: number = -Infinity;
  private counter: number = 0;
  private bestWeights: tf.NamedTensorMap | null = null;

  constructor(patience: number) {
    this.patience = patience;
  }

  check(model: tf.LayersModel, currentValue: number): boolean {
    if (currentValue > this.bestValue) {
      this.bestValue = currentValue;
      this.counter = 0;
      this.bestWeights = {};
      for (const layer of model.layers) {
        const weights = layer.getWeights();
        this.bestWeights[layer.name] = weights.map(w => w.clone());
      }
      return false;
    }
    
    this.counter++;
    return this.counter >= this.patience;
  }

  restoreBestWeights(model: tf.LayersModel): void {
    if (this.bestWeights) {
      for (const layer of model.layers) {
        const savedWeights = this.bestWeights[layer.name];
        if (savedWeights) {
          layer.setWeights(savedWeights);
        }
      }
    }
  }

  dispose(): void {
    if (this.bestWeights) {
      for (const weights of Object.values(this.bestWeights)) {
        if (Array.isArray(weights)) {
          weights.forEach(w => w.dispose());
        }
      }
    }
  }
}

export async function trainEpoch(
  model: tf.LayersModel,
  dataGenerator: DataGenerator
): Promise<{ loss: number; accuracy: number }> {
  let totalLoss = 0;
  let totalAccuracy = 0;
  let numBatches = 0;

  dataGenerator.reset();

  let batch = await dataGenerator.nextBatch();
  while (batch) {
    const { xs, ys } = batch;
    
    const history = await model.fit(xs, ys, {
      epochs: 1,
      verbose: 0,
    });
    
    totalLoss += history.history.loss[0] as number;
    totalAccuracy += history.history.acc[0] as number;
    numBatches++;
    
    xs.dispose();
    ys.dispose();
    
    batch = await dataGenerator.nextBatch();
  }

  return {
    loss: totalLoss / numBatches,
    accuracy: totalAccuracy / numBatches,
  };
}

export async function evaluateModel(
  model: tf.LayersModel,
  dataGenerator: DataGenerator
): Promise<ModelMetrics & { top3Accuracy: number }> {
  let totalLoss = 0;
  let totalAccuracy = 0;
  let numBatches = 0;
  
  const allPredictions: number[][] = [];
  const allLabels: number[][] = [];

  dataGenerator.reset();

  let batch = await dataGenerator.nextBatch();
  while (batch) {
    const { xs, ys } = batch;
    
    const [loss, accuracy] = model.evaluate(xs, ys) as tf.Scalar[];
    totalLoss += loss.dataSync()[0];
    totalAccuracy += accuracy.dataSync()[0];
    
    const predictions = model.predict(xs) as tf.Tensor2D;
    allPredictions.push(...predictions.arraySync());
    allLabels.push(...ys.arraySync());
    
    predictions.dispose();
    loss.dispose();
    accuracy.dispose();
    xs.dispose();
    ys.dispose();
    
    numBatches++;
    batch = await dataGenerator.nextBatch();
  }

  const predTensor = tf.tensor2d(allPredictions);
  const labelTensor = tf.tensor2d(allLabels);
  const top3Accuracy = calculateTopKAccuracy(predTensor, labelTensor, 3);
  predTensor.dispose();
  labelTensor.dispose();

  return {
    loss: totalLoss / numBatches,
    accuracy: totalAccuracy / numBatches,
    top3Accuracy,
  };
}

export async function train(
  dataSplit: DataSplit,
  classes: BirdClass[],
  config: TrainingConfig
): Promise<TrainingHistory> {
  const numClasses = classes.length;
  
  const modelConfig: ModelConfig = {
    numClasses,
    inputHeight: DEFAULT_CONFIG.nMels,
    inputWidth: Math.floor((DEFAULT_CONFIG.targetDuration * DEFAULT_CONFIG.sampleRate - DEFAULT_CONFIG.fftSize) / DEFAULT_CONFIG.hopLength) + 1,
    learningRate: config.learningRate,
    dropoutRate: 0.3,
  };

  console.log('Creating model...');
  const model = createBirdSoundModel(modelConfig);
  compileModel(model, config.learningRate);
  model.summary();

  const trainGenerator = new DataGenerator(
    dataSplit.train,
    numClasses,
    config.batchSize,
    DEFAULT_CONFIG,
    true
  );

  const valGenerator = new DataGenerator(
    dataSplit.validation,
    numClasses,
    config.batchSize,
    DEFAULT_CONFIG,
    false
  );

  const testGenerator = new DataGenerator(
    dataSplit.test,
    numClasses,
    config.batchSize,
    DEFAULT_CONFIG,
    false
  );

  const logger = new TrainingLogger(config.logPath);
  const earlyStopping = new EarlyStopping(config.earlyStoppingPatience);
  const history: TrainingHistory = {
    epochs: [],
    bestEpoch: 0,
    bestValAccuracy: 0,
  };

  logger.log(`Training with ${dataSplit.train.length} samples`);
  logger.log(`Validation with ${dataSplit.validation.length} samples`);
  logger.log(`Test with ${dataSplit.test.length} samples`);

  for (let epoch = 1; epoch <= config.epochs; epoch++) {
    const startTime = Date.now();
    
    const trainMetrics = await trainEpoch(model, trainGenerator);
    
    const valMetrics = await evaluateModel(model, valGenerator);
    
    const epochMetrics: EpochMetrics = {
      epoch,
      trainLoss: trainMetrics.loss,
      trainAccuracy: trainMetrics.accuracy,
      valLoss: valMetrics.loss,
      valAccuracy: valMetrics.accuracy,
      valTop3Accuracy: valMetrics.top3Accuracy,
      duration: (Date.now() - startTime) / 1000,
    };
    
    history.epochs.push(epochMetrics);
    logger.logEpoch(epochMetrics);
    
    if (valMetrics.accuracy > history.bestValAccuracy) {
      history.bestValAccuracy = valMetrics.accuracy;
      history.bestEpoch = epoch;
      
      await saveModel(model, config.checkpointPath);
      logger.log(`New best model saved at epoch ${epoch}`);
    }
    
    if (earlyStopping.check(model, valMetrics.accuracy)) {
      logger.log(`Early stopping triggered at epoch ${epoch}`);
      break;
    }
  }

  earlyStopping.restoreBestWeights(model);

  logger.log('Evaluating on test set...');
  const testMetrics = await evaluateModel(model, testGenerator);
  history.testMetrics = {
    loss: testMetrics.loss,
    accuracy: testMetrics.accuracy,
    topKAccuracy: testMetrics.top3Accuracy,
  };
  
  logger.log(
    `Test Results: loss=${testMetrics.loss.toFixed(4)}, ` +
    `accuracy=${testMetrics.accuracy.toFixed(4)}, ` +
    `top3_accuracy=${testMetrics.top3Accuracy.toFixed(4)}`
  );

  await saveModel(model, config.checkpointPath);
  await logger.save();
  
  earlyStopping.dispose();
  model.dispose();

  return history;
}

export function generateConfusionMatrix(
  predictions: number[],
  labels: number[],
  numClasses: number
): number[][] {
  const matrix: number[][] = Array(numClasses)
    .fill(null)
    .map(() => Array(numClasses).fill(0));
  
  for (let i = 0; i < predictions.length; i++) {
    matrix[labels[i]][predictions[i]]++;
  }
  
  return matrix;
}

export function calculateClassMetrics(
  confusionMatrix: number[][],
  classNames: string[]
): { className: string; precision: number; recall: number; f1: number }[] {
  const metrics = [];
  
  for (let i = 0; i < confusionMatrix.length; i++) {
    const tp = confusionMatrix[i][i];
    const fp = confusionMatrix.reduce((sum, row, j) => sum + (j !== i ? row[i] : 0), 0);
    const fn = confusionMatrix[i].reduce((sum, val, j) => sum + (j !== i ? val : 0), 0);
    
    const precision = tp / (tp + fp) || 0;
    const recall = tp / (tp + fn) || 0;
    const f1 = (2 * precision * recall) / (precision + recall) || 0;
    
    metrics.push({
      className: classNames[i] || `Class ${i}`,
      precision,
      recall,
      f1,
    });
  }
  
  return metrics;
}
