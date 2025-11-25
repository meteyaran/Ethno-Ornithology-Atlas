import * as tf from '@tensorflow/tfjs-node';
import { generateMelSpectrogram, spectrogramToTensor, DEFAULT_CONFIG, SpectrogramConfig, resampleAudio } from './audioProcessor';
import { loadModel } from './model';
import { BirdClass } from './dataLoader';

export interface PredictionResult {
  birdId: string;
  birdName: string;
  scientificName: string;
  confidence: number;
  rank: number;
}

export interface IdentificationResult {
  success: boolean;
  predictions: PredictionResult[];
  processingTime: number;
  spectrogram?: number[][];
  error?: string;
}

let cachedModel: tf.LayersModel | null = null;
let cachedClasses: BirdClass[] | null = null;

export async function loadPredictionModel(modelPath: string, classes: BirdClass[]): Promise<void> {
  try {
    cachedModel = await loadModel(modelPath);
    cachedClasses = classes;
    console.log(`Prediction model loaded with ${classes.length} classes`);
  } catch (error) {
    console.error('Failed to load prediction model:', error);
    throw error;
  }
}

export function isModelLoaded(): boolean {
  return cachedModel !== null && cachedClasses !== null;
}

export function unloadModel(): void {
  if (cachedModel) {
    cachedModel.dispose();
    cachedModel = null;
  }
  cachedClasses = null;
}

export async function identifyBirdSound(
  audioData: Float32Array,
  sampleRate: number = 44100,
  topK: number = 5,
  config: SpectrogramConfig = DEFAULT_CONFIG
): Promise<IdentificationResult> {
  const startTime = Date.now();
  
  try {
    if (!cachedModel || !cachedClasses) {
      return {
        success: false,
        predictions: [],
        processingTime: Date.now() - startTime,
        error: 'Model not loaded',
      };
    }

    const resampled = resampleAudio(audioData, sampleRate, config.sampleRate);
    
    const spectrogram = generateMelSpectrogram(resampled, config);
    
    const inputTensor = spectrogramToTensor(spectrogram);
    
    const predictions = cachedModel.predict(inputTensor) as tf.Tensor2D;
    const probabilities = await predictions.data();
    
    const results: { classIndex: number; probability: number }[] = [];
    for (let i = 0; i < probabilities.length; i++) {
      results.push({ classIndex: i, probability: probabilities[i] });
    }
    
    results.sort((a, b) => b.probability - a.probability);
    const topResults = results.slice(0, topK);
    
    const predictionResults: PredictionResult[] = topResults.map((result, rank) => {
      const birdClass = cachedClasses![result.classIndex];
      return {
        birdId: birdClass.id,
        birdName: birdClass.name,
        scientificName: birdClass.scientificName,
        confidence: result.probability,
        rank: rank + 1,
      };
    });
    
    inputTensor.dispose();
    predictions.dispose();
    
    return {
      success: true,
      predictions: predictionResults,
      processingTime: Date.now() - startTime,
      spectrogram: spectrogram.map(frame => Array.from(frame)),
    };
  } catch (error) {
    console.error('Prediction error:', error);
    return {
      success: false,
      predictions: [],
      processingTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export function createDemoPredictions(
  classes: BirdClass[],
  audioLength: number,
  topK: number = 5
): IdentificationResult {
  const startTime = Date.now();
  
  const shuffled = [...classes].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, topK);
  
  let totalConfidence = 0;
  const rawConfidences = selected.map(() => Math.random());
  const sum = rawConfidences.reduce((a, b) => a + b, 0);
  const normalizedConfidences = rawConfidences.map(c => c / sum);
  normalizedConfidences.sort((a, b) => b - a);
  
  const predictions: PredictionResult[] = selected.map((birdClass, index) => ({
    birdId: birdClass.id,
    birdName: birdClass.name,
    scientificName: birdClass.scientificName,
    confidence: normalizedConfidences[index],
    rank: index + 1,
  }));
  
  const demoSpectrogram: number[][] = [];
  const numFrames = 128;
  const numMels = 128;
  for (let t = 0; t < numFrames; t++) {
    const frame: number[] = [];
    for (let f = 0; f < numMels; f++) {
      const baseFreq = (Math.sin(t * 0.1) * 0.3 + 0.5) * numMels;
      const distance = Math.abs(f - baseFreq);
      const value = Math.exp(-distance * 0.1) * (0.8 + Math.random() * 0.2);
      frame.push(value);
    }
    demoSpectrogram.push(frame);
  }
  
  return {
    success: true,
    predictions,
    processingTime: Date.now() - startTime,
    spectrogram: demoSpectrogram,
  };
}

export function preprocessWebAudioBuffer(
  channelData: Float32Array,
  sampleRate: number,
  targetSampleRate: number = DEFAULT_CONFIG.sampleRate
): Float32Array {
  const resampled = resampleAudio(channelData, sampleRate, targetSampleRate);
  
  const maxVal = Math.max(...Array.from(resampled).map(Math.abs));
  if (maxVal > 0) {
    for (let i = 0; i < resampled.length; i++) {
      resampled[i] = resampled[i] / maxVal;
    }
  }
  
  return resampled;
}

export interface LiveSpectrogramData {
  frequencies: number[];
  times: number[];
  magnitudes: number[][];
}

export function computeLiveSpectrogram(
  audioData: Float32Array,
  sampleRate: number,
  windowSize: number = 2048,
  hopSize: number = 512
): LiveSpectrogramData {
  const numFrames = Math.floor((audioData.length - windowSize) / hopSize) + 1;
  const numBins = windowSize / 2 + 1;
  
  const frequencies = Array.from({ length: numBins }, (_, i) => (i * sampleRate) / windowSize);
  const times = Array.from({ length: numFrames }, (_, i) => (i * hopSize) / sampleRate);
  const magnitudes: number[][] = [];
  
  for (let i = 0; i < numFrames; i++) {
    const start = i * hopSize;
    const frame = audioData.slice(start, start + windowSize);
    
    const windowed = new Float32Array(windowSize);
    for (let j = 0; j < windowSize; j++) {
      const window = 0.5 * (1 - Math.cos((2 * Math.PI * j) / (windowSize - 1)));
      windowed[j] = (frame[j] || 0) * window;
    }
    
    const mag = new Float32Array(numBins);
    for (let k = 0; k < numBins; k++) {
      let sumReal = 0;
      let sumImag = 0;
      for (let n = 0; n < windowSize; n++) {
        const angle = (2 * Math.PI * k * n) / windowSize;
        sumReal += windowed[n] * Math.cos(angle);
        sumImag -= windowed[n] * Math.sin(angle);
      }
      mag[k] = Math.sqrt(sumReal ** 2 + sumImag ** 2);
    }
    
    magnitudes.push(Array.from(mag));
  }
  
  return { frequencies, times, magnitudes };
}
