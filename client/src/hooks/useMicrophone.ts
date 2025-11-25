import { useState, useCallback, useRef, useEffect } from 'react';

export interface MicrophoneState {
  isRecording: boolean;
  isPaused: boolean;
  audioData: Float32Array | null;
  duration: number;
  error: string | null;
  sampleRate: number;
}

export interface UseMicrophoneReturn {
  state: MicrophoneState;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  pauseRecording: () => void;
  resumeRecording: () => void;
  clearRecording: () => void;
  getAudioBlob: () => Blob | null;
}

export function useMicrophone(maxDuration: number = 10): UseMicrophoneReturn {
  const [state, setState] = useState<MicrophoneState>({
    isRecording: false,
    isPaused: false,
    audioData: null,
    duration: 0,
    error: null,
    sampleRate: 44100,
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef<number>(0);
  const durationIntervalRef = useRef<number | null>(null);
  const rawAudioDataRef = useRef<Float32Array[]>([]);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);

  const cleanup = useCallback(() => {
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }
    if (scriptProcessorRef.current) {
      scriptProcessorRef.current.disconnect();
      scriptProcessorRef.current = null;
    }
    if (analyserRef.current) {
      analyserRef.current.disconnect();
      analyserRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current = null;
    }
  }, []);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  const startRecording = useCallback(async () => {
    try {
      cleanup();
      chunksRef.current = [];
      rawAudioDataRef.current = [];

      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        } 
      });
      streamRef.current = stream;

      const audioContext = new AudioContext({ sampleRate: 44100 });
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;
      analyserRef.current = analyser;
      source.connect(analyser);

      const scriptProcessor = audioContext.createScriptProcessor(4096, 1, 1);
      scriptProcessorRef.current = scriptProcessor;
      
      source.connect(scriptProcessor);
      scriptProcessor.connect(audioContext.destination);
      
      scriptProcessor.onaudioprocess = (event) => {
        const inputData = event.inputBuffer.getChannelData(0);
        rawAudioDataRef.current.push(new Float32Array(inputData));
      };

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4',
      });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const totalLength = rawAudioDataRef.current.reduce((acc, arr) => acc + arr.length, 0);
        const combinedData = new Float32Array(totalLength);
        let offset = 0;
        for (const chunk of rawAudioDataRef.current) {
          combinedData.set(chunk, offset);
          offset += chunk.length;
        }

        setState(prev => ({
          ...prev,
          isRecording: false,
          isPaused: false,
          audioData: combinedData,
          sampleRate: audioContext.sampleRate,
        }));
      };

      mediaRecorder.start(100);
      startTimeRef.current = Date.now();

      durationIntervalRef.current = window.setInterval(() => {
        const elapsed = (Date.now() - startTimeRef.current) / 1000;
        setState(prev => ({ ...prev, duration: elapsed }));

        if (elapsed >= maxDuration) {
          stopRecording();
        }
      }, 100);

      setState({
        isRecording: true,
        isPaused: false,
        audioData: null,
        duration: 0,
        error: null,
        sampleRate: audioContext.sampleRate,
      });
    } catch (error) {
      console.error('Error starting recording:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Mikrofon erişimi reddedildi',
        isRecording: false,
      }));
    }
  }, [cleanup, maxDuration]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    cleanup();
  }, [cleanup]);

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause();
      setState(prev => ({ ...prev, isPaused: true }));
    }
  }, []);

  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume();
      setState(prev => ({ ...prev, isPaused: false }));
    }
  }, []);

  const clearRecording = useCallback(() => {
    cleanup();
    chunksRef.current = [];
    rawAudioDataRef.current = [];
    setState({
      isRecording: false,
      isPaused: false,
      audioData: null,
      duration: 0,
      error: null,
      sampleRate: 44100,
    });
  }, [cleanup]);

  const getAudioBlob = useCallback((): Blob | null => {
    if (chunksRef.current.length === 0) return null;
    return new Blob(chunksRef.current, { type: 'audio/webm' });
  }, []);

  return {
    state,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    clearRecording,
    getAudioBlob,
  };
}
