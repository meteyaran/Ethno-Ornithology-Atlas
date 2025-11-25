import * as tf from '@tensorflow/tfjs-node';
import * as fs from 'fs';
import * as path from 'path';
import { generateMelSpectrogram, spectrogramToTensor, DEFAULT_CONFIG, SpectrogramConfig } from './audioProcessor';

export interface BirdClass {
  id: string;
  name: string;
  scientificName: string;
  classIndex: number;
}

export interface AudioSample {
  birdId: string;
  audioPath: string;
  classIndex: number;
}

export interface DataSplit {
  train: AudioSample[];
  validation: AudioSample[];
  test: AudioSample[];
}

export interface BatchData {
  xs: tf.Tensor4D;
  ys: tf.Tensor2D;
}

export function createClassMapping(birds: { id: string; name: string; scientificName: string }[]): BirdClass[] {
  return birds.map((bird, index) => ({
    id: bird.id,
    name: bird.name,
    scientificName: bird.scientificName,
    classIndex: index,
  }));
}

export function splitData(
  samples: AudioSample[],
  trainRatio: number = 0.7,
  validationRatio: number = 0.15,
  testRatio: number = 0.15,
  seed: number = 42
): DataSplit {
  const shuffled = [...samples].sort(() => Math.random() - 0.5);
  
  const trainEnd = Math.floor(shuffled.length * trainRatio);
  const validationEnd = trainEnd + Math.floor(shuffled.length * validationRatio);
  
  return {
    train: shuffled.slice(0, trainEnd),
    validation: shuffled.slice(trainEnd, validationEnd),
    test: shuffled.slice(validationEnd),
  };
}

export function stratifiedSplit(
  samples: AudioSample[],
  numClasses: number,
  trainRatio: number = 0.7,
  validationRatio: number = 0.15
): DataSplit {
  const byClass: Map<number, AudioSample[]> = new Map();
  
  for (const sample of samples) {
    if (!byClass.has(sample.classIndex)) {
      byClass.set(sample.classIndex, []);
    }
    byClass.get(sample.classIndex)!.push(sample);
  }
  
  const train: AudioSample[] = [];
  const validation: AudioSample[] = [];
  const test: AudioSample[] = [];
  
  byClass.forEach((classSamples) => {
    const shuffled = [...classSamples].sort(() => Math.random() - 0.5);
    const trainEnd = Math.floor(shuffled.length * trainRatio);
    const validationEnd = trainEnd + Math.floor(shuffled.length * validationRatio);
    
    train.push(...shuffled.slice(0, trainEnd));
    validation.push(...shuffled.slice(trainEnd, validationEnd));
    test.push(...shuffled.slice(validationEnd));
  });
  
  return { train, validation, test };
}

export async function loadAudioFile(filePath: string): Promise<Float32Array> {
  const buffer = await fs.promises.readFile(filePath);
  
  const audioData = new Float32Array(buffer.length / 2);
  for (let i = 0; i < audioData.length; i++) {
    audioData[i] = buffer.readInt16LE(i * 2) / 32768;
  }
  
  return audioData;
}

export function audioBufferToFloat32(buffer: Buffer): Float32Array {
  const audioData = new Float32Array(buffer.length / 2);
  for (let i = 0; i < audioData.length; i++) {
    audioData[i] = buffer.readInt16LE(i * 2) / 32768;
  }
  return audioData;
}

export function applyAugmentation(
  spectrogram: Float32Array[],
  augmentationType: 'timeMask' | 'freqMask' | 'noise'
): Float32Array[] {
  const augmented = spectrogram.map(frame => new Float32Array(frame));
  
  switch (augmentationType) {
    case 'timeMask': {
      const maskWidth = Math.floor(Math.random() * 20) + 5;
      const maskStart = Math.floor(Math.random() * (augmented.length - maskWidth));
      for (let t = maskStart; t < maskStart + maskWidth && t < augmented.length; t++) {
        augmented[t].fill(0);
      }
      break;
    }
    
    case 'freqMask': {
      const maskHeight = Math.floor(Math.random() * 15) + 3;
      const maskStart = Math.floor(Math.random() * (augmented[0].length - maskHeight));
      for (const frame of augmented) {
        for (let f = maskStart; f < maskStart + maskHeight && f < frame.length; f++) {
          frame[f] = 0;
        }
      }
      break;
    }
    
    case 'noise': {
      const noiseLevel = Math.random() * 0.02;
      for (const frame of augmented) {
        for (let i = 0; i < frame.length; i++) {
          frame[i] += (Math.random() - 0.5) * noiseLevel;
        }
      }
      break;
    }
  }
  
  return augmented;
}

export function oneHotEncode(classIndex: number, numClasses: number): Float32Array {
  const encoded = new Float32Array(numClasses);
  encoded[classIndex] = 1;
  return encoded;
}

export class DataGenerator {
  private samples: AudioSample[];
  private numClasses: number;
  private batchSize: number;
  private config: SpectrogramConfig;
  private augment: boolean;
  private currentIndex: number = 0;

  constructor(
    samples: AudioSample[],
    numClasses: number,
    batchSize: number = 32,
    config: SpectrogramConfig = DEFAULT_CONFIG,
    augment: boolean = false
  ) {
    this.samples = [...samples].sort(() => Math.random() - 0.5);
    this.numClasses = numClasses;
    this.batchSize = batchSize;
    this.config = config;
    this.augment = augment;
  }

  get numBatches(): number {
    return Math.ceil(this.samples.length / this.batchSize);
  }

  reset(): void {
    this.currentIndex = 0;
    this.samples = [...this.samples].sort(() => Math.random() - 0.5);
  }

  async nextBatch(): Promise<BatchData | null> {
    if (this.currentIndex >= this.samples.length) {
      return null;
    }

    const batchSamples = this.samples.slice(
      this.currentIndex,
      this.currentIndex + this.batchSize
    );
    this.currentIndex += this.batchSize;

    const spectrograms: tf.Tensor4D[] = [];
    const labels: Float32Array[] = [];

    for (const sample of batchSamples) {
      try {
        const audioData = await loadAudioFile(sample.audioPath);
        let spectrogram = generateMelSpectrogram(audioData, this.config);

        if (this.augment && Math.random() > 0.5) {
          const augTypes: ('timeMask' | 'freqMask' | 'noise')[] = ['timeMask', 'freqMask', 'noise'];
          const augType = augTypes[Math.floor(Math.random() * augTypes.length)];
          spectrogram = applyAugmentation(spectrogram, augType);
        }

        spectrograms.push(spectrogramToTensor(spectrogram));
        labels.push(oneHotEncode(sample.classIndex, this.numClasses));
      } catch (error) {
        console.error(`Error processing ${sample.audioPath}:`, error);
      }
    }

    if (spectrograms.length === 0) {
      return null;
    }

    const xs = tf.concat(spectrograms, 0) as tf.Tensor4D;
    const labelsArray = labels.map(l => Array.from(l));
    const ys = tf.tensor2d(labelsArray);

    spectrograms.forEach(t => t.dispose());

    return { xs, ys };
  }
}

export interface DatasetStats {
  totalSamples: number;
  samplesPerClass: Map<number, number>;
  trainSamples: number;
  validationSamples: number;
  testSamples: number;
}

export function getDatasetStats(split: DataSplit): DatasetStats {
  const samplesPerClass = new Map<number, number>();
  
  const allSamples = [...split.train, ...split.validation, ...split.test];
  for (const sample of allSamples) {
    const count = samplesPerClass.get(sample.classIndex) || 0;
    samplesPerClass.set(sample.classIndex, count + 1);
  }
  
  return {
    totalSamples: allSamples.length,
    samplesPerClass,
    trainSamples: split.train.length,
    validationSamples: split.validation.length,
    testSamples: split.test.length,
  };
}
