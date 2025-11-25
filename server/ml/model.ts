import * as tf from '@tensorflow/tfjs-node';
import { DEFAULT_CONFIG, getSpectrogramDimensions } from './audioProcessor';

export interface ModelConfig {
  numClasses: number;
  inputHeight: number;
  inputWidth: number;
  learningRate: number;
  dropoutRate: number;
}

export function getDefaultModelConfig(numClasses: number): ModelConfig {
  const { height, width } = getSpectrogramDimensions(DEFAULT_CONFIG);
  return {
    numClasses,
    inputHeight: height,
    inputWidth: width,
    learningRate: 0.001,
    dropoutRate: 0.3,
  };
}

export function createConvBlock(
  input: tf.SymbolicTensor,
  filters: number,
  kernelSize: [number, number],
  name: string
): tf.SymbolicTensor {
  let x = tf.layers.conv2d({
    filters,
    kernelSize,
    padding: 'same',
    activation: 'relu',
    kernelInitializer: 'heNormal',
    name: `${name}_conv`,
  }).apply(input) as tf.SymbolicTensor;
  
  x = tf.layers.batchNormalization({
    name: `${name}_bn`,
  }).apply(x) as tf.SymbolicTensor;
  
  x = tf.layers.maxPooling2d({
    poolSize: [2, 2],
    name: `${name}_pool`,
  }).apply(x) as tf.SymbolicTensor;
  
  return x;
}

export function createDepthwiseSeparableConv(
  input: tf.SymbolicTensor,
  filters: number,
  name: string
): tf.SymbolicTensor {
  let x = tf.layers.depthwiseConv2d({
    kernelSize: [3, 3],
    padding: 'same',
    depthMultiplier: 1,
    activation: 'relu',
    name: `${name}_dw`,
  }).apply(input) as tf.SymbolicTensor;
  
  x = tf.layers.batchNormalization({
    name: `${name}_dw_bn`,
  }).apply(x) as tf.SymbolicTensor;
  
  x = tf.layers.conv2d({
    filters,
    kernelSize: [1, 1],
    padding: 'same',
    activation: 'relu',
    name: `${name}_pw`,
  }).apply(x) as tf.SymbolicTensor;
  
  x = tf.layers.batchNormalization({
    name: `${name}_pw_bn`,
  }).apply(x) as tf.SymbolicTensor;
  
  return x;
}

export function createBirdSoundModel(config: ModelConfig): tf.LayersModel {
  const input = tf.input({
    shape: [config.inputHeight, config.inputWidth, 1],
    name: 'spectrogram_input',
  });
  
  let x = createConvBlock(input, 32, [3, 3], 'block1');
  
  x = createConvBlock(x, 64, [3, 3], 'block2');
  
  x = createDepthwiseSeparableConv(x, 128, 'block3');
  x = tf.layers.maxPooling2d({
    poolSize: [2, 2],
    name: 'block3_pool',
  }).apply(x) as tf.SymbolicTensor;
  
  x = createDepthwiseSeparableConv(x, 256, 'block4');
  x = tf.layers.maxPooling2d({
    poolSize: [2, 2],
    name: 'block4_pool',
  }).apply(x) as tf.SymbolicTensor;
  
  x = tf.layers.globalAveragePooling2d({
    name: 'global_avg_pool',
  }).apply(x) as tf.SymbolicTensor;
  
  x = tf.layers.dense({
    units: 512,
    activation: 'relu',
    kernelInitializer: 'heNormal',
    name: 'fc1',
  }).apply(x) as tf.SymbolicTensor;
  
  x = tf.layers.dropout({
    rate: config.dropoutRate,
    name: 'dropout1',
  }).apply(x) as tf.SymbolicTensor;
  
  x = tf.layers.dense({
    units: 256,
    activation: 'relu',
    kernelInitializer: 'heNormal',
    name: 'fc2',
  }).apply(x) as tf.SymbolicTensor;
  
  x = tf.layers.dropout({
    rate: config.dropoutRate,
    name: 'dropout2',
  }).apply(x) as tf.SymbolicTensor;
  
  const output = tf.layers.dense({
    units: config.numClasses,
    activation: 'softmax',
    name: 'predictions',
  }).apply(x) as tf.SymbolicTensor;
  
  const model = tf.model({
    inputs: input,
    outputs: output,
    name: 'BirdSoundClassifier',
  });
  
  return model;
}

export function compileModel(model: tf.LayersModel, learningRate: number): void {
  model.compile({
    optimizer: tf.train.adam(learningRate),
    loss: 'categoricalCrossentropy',
    metrics: ['accuracy'],
  });
}

export async function saveModel(model: tf.LayersModel, path: string): Promise<void> {
  await model.save(`file://${path}`);
  console.log(`Model saved to ${path}`);
}

export async function loadModel(path: string): Promise<tf.LayersModel> {
  const model = await tf.loadLayersModel(`file://${path}/model.json`);
  console.log(`Model loaded from ${path}`);
  return model;
}

export function getModelSummary(model: tf.LayersModel): string {
  const lines: string[] = [];
  model.summary(undefined, undefined, (line) => lines.push(line));
  return lines.join('\n');
}

export interface ModelMetrics {
  loss: number;
  accuracy: number;
  topKAccuracy?: number;
}

export function calculateTopKAccuracy(
  predictions: tf.Tensor2D,
  labels: tf.Tensor2D,
  k: number = 3
): number {
  const predArray = predictions.arraySync();
  const labelArray = labels.arraySync();
  
  let correct = 0;
  for (let i = 0; i < predArray.length; i++) {
    const pred = predArray[i];
    const trueClass = labelArray[i].indexOf(1);
    
    const indices = pred
      .map((val, idx) => ({ val, idx }))
      .sort((a, b) => b.val - a.val)
      .slice(0, k)
      .map(x => x.idx);
    
    if (indices.includes(trueClass)) {
      correct++;
    }
  }
  
  return correct / predArray.length;
}
