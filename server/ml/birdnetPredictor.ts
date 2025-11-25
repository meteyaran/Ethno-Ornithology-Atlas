import * as tf from '@tensorflow/tfjs-node';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const MODEL_DIR = path.join(__dirname, 'birdnet', 'model');
const SAMPLE_RATE = 48000;
const CHUNK_DURATION = 3.0;
const CHUNK_SAMPLES = SAMPLE_RATE * CHUNK_DURATION;

let audioModel: tf.LayersModel | null = null;
let metaModel: tf.GraphModel | null = null;
let labels: string[] = [];
let isLoading = false;
let loadError: string | null = null;

class MelSpecLayerSimple extends tf.layers.Layer {
  private sampleRate: number;
  private specShape: [number, number];
  private frameStep: number;
  private frameLength: number;
  private fmin: number;
  private fmax: number;
  private melFilterbank: tf.Tensor2D;
  private magScale: tf.LayerVariable | null = null;

  constructor(config: any) {
    super(config);
    this.sampleRate = config.sampleRate || 48000;
    this.specShape = config.specShape || [96, 64];
    this.frameStep = config.frameStep || 1500;
    this.frameLength = config.frameLength || 3000;
    this.fmin = config.fmin || 0;
    this.fmax = config.fmax || 15000;
    this.melFilterbank = tf.tensor2d(config.melFilterbank || []);
  }

  build(inputShape: tf.Shape | tf.Shape[]): void {
    this.magScale = this.addWeight(
      'magnitude_scaling',
      [],
      'float32',
      tf.initializers.constant({ value: 1.23 })
    );
    super.build(inputShape);
  }

  computeOutputShape(inputShape: tf.Shape | tf.Shape[]): tf.Shape | tf.Shape[] {
    const shape = Array.isArray(inputShape[0]) ? inputShape[0] : inputShape;
    return [shape[0] as number, this.specShape[0], this.specShape[1], 1];
  }

  call(inputs: tf.Tensor | tf.Tensor[], kwargs?: Record<string, any>): tf.Tensor | tf.Tensor[] {
    return tf.tidy(() => {
      let input = Array.isArray(inputs) ? inputs[0] : inputs;
      const inputList = tf.split(input, input.shape[0] as number);
      
      const specBatch = inputList.map(singleInput => {
        let squeezed = singleInput.squeeze();
        squeezed = tf.sub(squeezed, tf.min(squeezed, -1, true));
        squeezed = tf.div(squeezed, tf.add(tf.max(squeezed, -1, true), 0.000001));
        squeezed = tf.sub(squeezed, 0.5);
        squeezed = tf.mul(squeezed, 2.0);

        let spec = tf.signal.stft(
          squeezed as tf.Tensor1D,
          this.frameLength,
          this.frameStep,
          this.frameLength,
          tf.signal.hannWindow
        );

        spec = tf.cast(spec, 'float32');
        spec = tf.matMul(spec, this.melFilterbank);
        spec = tf.pow(spec, 2.0);
        
        if (this.magScale) {
          const magScaleValue = this.magScale.read();
          spec = tf.pow(spec, tf.div(1.0, tf.add(1.0, tf.exp(magScaleValue))));
        }
        
        spec = tf.reverse(spec, -1);
        spec = tf.transpose(spec);
        spec = spec.expandDims(-1);
        
        return spec;
      });
      
      return tf.stack(specBatch);
    });
  }

  static get className(): string {
    return 'MelSpecLayerSimple';
  }

  getConfig(): tf.serialization.ConfigDict {
    const config = super.getConfig();
    return {
      ...config,
      sampleRate: this.sampleRate,
      specShape: this.specShape,
      frameStep: this.frameStep,
      frameLength: this.frameLength,
      fmin: this.fmin,
      fmax: this.fmax,
    };
  }
}

tf.serialization.registerClass(MelSpecLayerSimple);

export async function loadBirdNETModel(): Promise<boolean> {
  if (audioModel && labels.length > 0) {
    return true;
  }
  
  if (isLoading) {
    return false;
  }
  
  isLoading = true;
  loadError = null;
  
  try {
    console.log('Loading BirdNET model...');
    
    const labelsPath = path.join(MODEL_DIR, 'labels.json');
    if (!fs.existsSync(labelsPath)) {
      throw new Error('Labels file not found');
    }
    labels = JSON.parse(fs.readFileSync(labelsPath, 'utf-8'));
    console.log(`Loaded ${labels.length} species labels`);
    
    const modelPath = `file://${path.join(MODEL_DIR, 'model.json')}`;
    audioModel = await tf.loadLayersModel(modelPath);
    console.log('BirdNET audio model loaded successfully');
    
    try {
      const metaModelPath = `file://${path.join(MODEL_DIR, 'mdata', 'model.json')}`;
      metaModel = await tf.loadGraphModel(metaModelPath);
      console.log('BirdNET metadata model loaded successfully');
    } catch (e) {
      console.log('Metadata model not loaded (optional)');
    }
    
    isLoading = false;
    return true;
  } catch (error) {
    console.error('Failed to load BirdNET model:', error);
    loadError = error instanceof Error ? error.message : 'Unknown error';
    isLoading = false;
    return false;
  }
}

export function isBirdNETLoaded(): boolean {
  return audioModel !== null && labels.length > 0;
}

export function getBirdNETStatus(): { loaded: boolean; numClasses: number; error: string | null } {
  return {
    loaded: isBirdNETLoaded(),
    numClasses: labels.length,
    error: loadError
  };
}

function resampleAudio(audioData: Float32Array, fromRate: number, toRate: number): Float32Array {
  if (fromRate === toRate) {
    return audioData;
  }
  
  const ratio = fromRate / toRate;
  const newLength = Math.floor(audioData.length / ratio);
  const result = new Float32Array(newLength);
  
  for (let i = 0; i < newLength; i++) {
    const srcIndex = i * ratio;
    const srcIndexFloor = Math.floor(srcIndex);
    const srcIndexCeil = Math.min(srcIndexFloor + 1, audioData.length - 1);
    const t = srcIndex - srcIndexFloor;
    result[i] = audioData[srcIndexFloor] * (1 - t) + audioData[srcIndexCeil] * t;
  }
  
  return result;
}

export interface BirdNETPrediction {
  scientificName: string;
  commonName: string;
  confidence: number;
  label: string;
}

export interface BirdNETResult {
  success: boolean;
  predictions: BirdNETPrediction[];
  processingTime: number;
  error?: string;
}

export async function predictBirdSound(
  audioData: Float32Array,
  inputSampleRate: number = 48000,
  topK: number = 5,
  lat?: number,
  lon?: number,
  week?: number
): Promise<BirdNETResult> {
  const startTime = Date.now();
  
  if (!isBirdNETLoaded()) {
    const loaded = await loadBirdNETModel();
    if (!loaded) {
      return {
        success: false,
        predictions: [],
        processingTime: Date.now() - startTime,
        error: 'BirdNET model not loaded'
      };
    }
  }
  
  try {
    let processedAudio = audioData;
    if (inputSampleRate !== SAMPLE_RATE) {
      processedAudio = resampleAudio(audioData, inputSampleRate, SAMPLE_RATE);
    }
    
    if (processedAudio.length < CHUNK_SAMPLES) {
      const padded = new Float32Array(CHUNK_SAMPLES);
      padded.set(processedAudio);
      processedAudio = padded;
    } else if (processedAudio.length > CHUNK_SAMPLES) {
      processedAudio = processedAudio.slice(0, CHUNK_SAMPLES);
    }
    
    const inputTensor = tf.tensor(processedAudio).reshape([1, CHUNK_SAMPLES]);
    
    const prediction = audioModel!.predict(inputTensor) as tf.Tensor;
    let probs = await prediction.data();
    
    if (metaModel && lat !== undefined && lon !== undefined && week !== undefined) {
      const metaInput = tf.tensor([[lat, lon, week]]);
      const metaPrediction = metaModel.predict(metaInput) as tf.Tensor;
      const metaProbs = await metaPrediction.data();
      
      probs = probs.map((p, i) => p * (metaProbs[i] || 1));
      
      metaInput.dispose();
      metaPrediction.dispose();
    }
    
    const probsArray = Array.from(probs);
    const indices = probsArray
      .map((prob, index) => ({ prob, index }))
      .sort((a, b) => b.prob - a.prob)
      .slice(0, topK);
    
    const predictions: BirdNETPrediction[] = indices.map(({ prob, index }) => {
      const label = labels[index];
      const parts = label.split('_');
      const scientificName = parts[0] || 'Unknown';
      const commonName = parts.slice(1).join(' ') || 'Unknown';
      
      return {
        scientificName,
        commonName,
        confidence: prob,
        label
      };
    });
    
    inputTensor.dispose();
    prediction.dispose();
    
    return {
      success: true,
      predictions,
      processingTime: Date.now() - startTime
    };
  } catch (error) {
    console.error('BirdNET prediction error:', error);
    return {
      success: false,
      predictions: [],
      processingTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Prediction failed'
    };
  }
}

export function getAllLabels(): string[] {
  return labels;
}

export function searchLabels(query: string): BirdNETPrediction[] {
  const lowerQuery = query.toLowerCase();
  return labels
    .filter(label => label.toLowerCase().includes(lowerQuery))
    .slice(0, 20)
    .map(label => {
      const parts = label.split('_');
      return {
        scientificName: parts[0] || 'Unknown',
        commonName: parts.slice(1).join(' ') || 'Unknown',
        confidence: 0,
        label
      };
    });
}
