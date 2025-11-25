import * as tf from '@tensorflow/tfjs-node';

export interface SpectrogramConfig {
  sampleRate: number;
  fftSize: number;
  hopLength: number;
  nMels: number;
  fMin: number;
  fMax: number;
  targetDuration: number;
}

export const DEFAULT_CONFIG: SpectrogramConfig = {
  sampleRate: 22050,
  fftSize: 2048,
  hopLength: 512,
  nMels: 128,
  fMin: 0,
  fMax: 11025,
  targetDuration: 3.0,
};

export function normalizeAudio(audioData: Float32Array): Float32Array {
  const maxVal = Math.max(...Array.from(audioData).map(Math.abs));
  if (maxVal === 0) return audioData;
  return new Float32Array(audioData.map(v => v / maxVal));
}

export function resampleAudio(
  audioData: Float32Array,
  originalSampleRate: number,
  targetSampleRate: number
): Float32Array {
  if (originalSampleRate === targetSampleRate) {
    return audioData;
  }
  
  const ratio = originalSampleRate / targetSampleRate;
  const newLength = Math.floor(audioData.length / ratio);
  const resampled = new Float32Array(newLength);
  
  for (let i = 0; i < newLength; i++) {
    const srcIndex = i * ratio;
    const srcIndexFloor = Math.floor(srcIndex);
    const srcIndexCeil = Math.min(srcIndexFloor + 1, audioData.length - 1);
    const t = srcIndex - srcIndexFloor;
    resampled[i] = audioData[srcIndexFloor] * (1 - t) + audioData[srcIndexCeil] * t;
  }
  
  return resampled;
}

export function padOrTrimAudio(
  audioData: Float32Array,
  targetLength: number
): Float32Array {
  if (audioData.length === targetLength) {
    return audioData;
  }
  
  if (audioData.length > targetLength) {
    const startIdx = Math.floor((audioData.length - targetLength) / 2);
    return audioData.slice(startIdx, startIdx + targetLength);
  }
  
  const padded = new Float32Array(targetLength);
  const startIdx = Math.floor((targetLength - audioData.length) / 2);
  padded.set(audioData, startIdx);
  return padded;
}

export function applyHannWindow(frame: Float32Array): Float32Array {
  const windowed = new Float32Array(frame.length);
  for (let i = 0; i < frame.length; i++) {
    const window = 0.5 * (1 - Math.cos((2 * Math.PI * i) / (frame.length - 1)));
    windowed[i] = frame[i] * window;
  }
  return windowed;
}

export function computeSTFT(
  audioData: Float32Array,
  fftSize: number,
  hopLength: number
): { real: Float32Array[]; imag: Float32Array[]; magnitude: Float32Array[] } {
  const numFrames = Math.floor((audioData.length - fftSize) / hopLength) + 1;
  const real: Float32Array[] = [];
  const imag: Float32Array[] = [];
  const magnitude: Float32Array[] = [];
  
  for (let i = 0; i < numFrames; i++) {
    const start = i * hopLength;
    const frame = audioData.slice(start, start + fftSize);
    const windowed = applyHannWindow(frame);
    
    const realPart = new Float32Array(fftSize);
    const imagPart = new Float32Array(fftSize);
    
    for (let k = 0; k < fftSize / 2 + 1; k++) {
      let sumReal = 0;
      let sumImag = 0;
      for (let n = 0; n < fftSize; n++) {
        const angle = (2 * Math.PI * k * n) / fftSize;
        sumReal += windowed[n] * Math.cos(angle);
        sumImag -= windowed[n] * Math.sin(angle);
      }
      realPart[k] = sumReal;
      imagPart[k] = sumImag;
    }
    
    const mag = new Float32Array(fftSize / 2 + 1);
    for (let k = 0; k < fftSize / 2 + 1; k++) {
      mag[k] = Math.sqrt(realPart[k] ** 2 + imagPart[k] ** 2);
    }
    
    real.push(realPart);
    imag.push(imagPart);
    magnitude.push(mag);
  }
  
  return { real, imag, magnitude };
}

export function createMelFilterbank(
  sampleRate: number,
  fftSize: number,
  nMels: number,
  fMin: number,
  fMax: number
): Float32Array[] {
  const hzToMel = (hz: number) => 2595 * Math.log10(1 + hz / 700);
  const melToHz = (mel: number) => 700 * (10 ** (mel / 2595) - 1);
  
  const melMin = hzToMel(fMin);
  const melMax = hzToMel(fMax);
  const melPoints = new Float32Array(nMels + 2);
  
  for (let i = 0; i < nMels + 2; i++) {
    melPoints[i] = melMin + (i * (melMax - melMin)) / (nMels + 1);
  }
  
  const hzPoints = melPoints.map(mel => melToHz(mel));
  const binPoints = hzPoints.map(hz => Math.floor((fftSize + 1) * hz / sampleRate));
  
  const filterbank: Float32Array[] = [];
  const numBins = fftSize / 2 + 1;
  
  for (let m = 0; m < nMels; m++) {
    const filter = new Float32Array(numBins);
    const startBin = binPoints[m];
    const centerBin = binPoints[m + 1];
    const endBin = binPoints[m + 2];
    
    for (let k = startBin; k < centerBin; k++) {
      if (k < numBins) {
        filter[k] = (k - startBin) / (centerBin - startBin);
      }
    }
    for (let k = centerBin; k < endBin; k++) {
      if (k < numBins) {
        filter[k] = (endBin - k) / (endBin - centerBin);
      }
    }
    
    filterbank.push(filter);
  }
  
  return filterbank;
}

export function applyMelFilterbank(
  magnitude: Float32Array[],
  filterbank: Float32Array[]
): Float32Array[] {
  const melSpectrogram: Float32Array[] = [];
  
  for (const frame of magnitude) {
    const melFrame = new Float32Array(filterbank.length);
    for (let m = 0; m < filterbank.length; m++) {
      let sum = 0;
      for (let k = 0; k < frame.length; k++) {
        sum += frame[k] * filterbank[m][k];
      }
      melFrame[m] = sum;
    }
    melSpectrogram.push(melFrame);
  }
  
  return melSpectrogram;
}

export function powerToDb(melSpectrogram: Float32Array[]): Float32Array[] {
  const minVal = 1e-10;
  const refVal = 1.0;
  
  return melSpectrogram.map(frame => {
    const dbFrame = new Float32Array(frame.length);
    for (let i = 0; i < frame.length; i++) {
      const power = Math.max(frame[i] ** 2, minVal);
      dbFrame[i] = 10 * Math.log10(power / refVal);
    }
    return dbFrame;
  });
}

export function normalizeSpectrogram(spectrogram: Float32Array[]): Float32Array[] {
  let globalMin = Infinity;
  let globalMax = -Infinity;
  
  for (const frame of spectrogram) {
    for (let i = 0; i < frame.length; i++) {
      const val = frame[i];
      if (val < globalMin) globalMin = val;
      if (val > globalMax) globalMax = val;
    }
  }
  
  const range = globalMax - globalMin || 1;
  
  return spectrogram.map(frame => {
    const normalized = new Float32Array(frame.length);
    for (let i = 0; i < frame.length; i++) {
      normalized[i] = (frame[i] - globalMin) / range;
    }
    return normalized;
  });
}

export function generateMelSpectrogram(
  audioData: Float32Array,
  config: SpectrogramConfig = DEFAULT_CONFIG
): Float32Array[] {
  const normalized = normalizeAudio(audioData);
  
  const targetSamples = Math.floor(config.targetDuration * config.sampleRate);
  const processed = padOrTrimAudio(normalized, targetSamples);
  
  const { magnitude } = computeSTFT(processed, config.fftSize, config.hopLength);
  
  const filterbank = createMelFilterbank(
    config.sampleRate,
    config.fftSize,
    config.nMels,
    config.fMin,
    config.fMax
  );
  
  const melSpec = applyMelFilterbank(magnitude, filterbank);
  
  const dbSpec = powerToDb(melSpec);
  
  const normalizedSpec = normalizeSpectrogram(dbSpec);
  
  return normalizedSpec;
}

export function spectrogramToTensor(spectrogram: Float32Array[]): tf.Tensor4D {
  const height = spectrogram[0]?.length || 0;
  const width = spectrogram.length;
  
  const data = new Float32Array(height * width);
  for (let t = 0; t < width; t++) {
    for (let f = 0; f < height; f++) {
      data[f * width + t] = spectrogram[t][f];
    }
  }
  
  return tf.tensor4d(data, [1, height, width, 1]);
}

export function preprocessAudioBuffer(
  buffer: Buffer,
  originalSampleRate: number = 44100,
  config: SpectrogramConfig = DEFAULT_CONFIG
): tf.Tensor4D {
  const audioData = new Float32Array(buffer.length / 2);
  for (let i = 0; i < audioData.length; i++) {
    audioData[i] = buffer.readInt16LE(i * 2) / 32768;
  }
  
  const resampled = resampleAudio(audioData, originalSampleRate, config.sampleRate);
  
  const spectrogram = generateMelSpectrogram(resampled, config);
  
  return spectrogramToTensor(spectrogram);
}

export function getSpectrogramDimensions(config: SpectrogramConfig = DEFAULT_CONFIG): { height: number; width: number } {
  const targetSamples = Math.floor(config.targetDuration * config.sampleRate);
  const width = Math.floor((targetSamples - config.fftSize) / config.hopLength) + 1;
  return {
    height: config.nMels,
    width: width
  };
}
