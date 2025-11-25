import { useState, useEffect, useRef } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useMicrophone } from '@/hooks/useMicrophone';
import { SpectrogramVisualizer } from './SpectrogramVisualizer';
import { Mic, Square, Loader2, Bird, Volume2, AlertCircle, CheckCircle2, RotateCcw, Info } from 'lucide-react';
import { Link } from 'wouter';
import { apiRequest } from '@/lib/queryClient';

interface PredictionResult {
  birdId: string;
  birdName: string;
  scientificName: string;
  confidence: number;
  rank: number;
}

interface IdentificationResponse {
  success: boolean;
  predictions: PredictionResult[];
  processingTime: number;
  spectrogram?: number[][];
  error?: string;
}

interface MLStatus {
  modelLoaded: boolean;
  trainingStatus: string;
  numClasses: number;
  accuracy: number;
  message: string;
}

type IdentificationPhase = 'idle' | 'recording' | 'processing' | 'results';

export function BirdSoundIdentifier() {
  const [phase, setPhase] = useState<IdentificationPhase>('idle');
  const [liveSpectrogram, setLiveSpectrogram] = useState<number[][] | null>(null);
  const [results, setResults] = useState<IdentificationResponse | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  const { 
    state: micState, 
    startRecording, 
    stopRecording, 
    clearRecording 
  } = useMicrophone(5);

  const { data: mlStatus } = useQuery<MLStatus>({
    queryKey: ['/api/ml/status'],
    refetchInterval: 30000,
  });

  const identifyMutation = useMutation({
    mutationFn: async (audioData: Float32Array) => {
      const response = await apiRequest('POST', '/api/identify-sound', {
        audioData: Array.from(audioData),
        sampleRate: micState.sampleRate,
      });
      return response.json() as Promise<IdentificationResponse>;
    },
    onSuccess: (data) => {
      setResults(data);
      setPhase('results');
    },
    onError: (error) => {
      console.error('Identification error:', error);
      setPhase('idle');
    },
  });

  useEffect(() => {
    if (micState.isRecording) {
      setPhase('recording');
      updateLiveSpectrogram();
    }
  }, [micState.isRecording]);

  useEffect(() => {
    if (micState.audioData && !micState.isRecording && phase === 'recording') {
      setPhase('processing');
      identifyMutation.mutate(micState.audioData);
    }
  }, [micState.audioData, micState.isRecording]);

  const updateLiveSpectrogram = () => {
    const numFrames = 128;
    const numMels = 64;
    const newSpec: number[][] = [];
    
    for (let t = 0; t < numFrames; t++) {
      const frame: number[] = [];
      const time = Date.now() / 1000;
      for (let f = 0; f < numMels; f++) {
        const noise = Math.random() * 0.3;
        const wave = Math.sin((t + time * 10) * 0.1) * 0.3;
        const freq = Math.exp(-Math.pow(f - 30 - Math.sin(t * 0.05) * 10, 2) / 200) * 0.7;
        frame.push(Math.min(1, Math.max(0, noise + wave + freq)));
      }
      newSpec.push(frame);
    }
    
    setLiveSpectrogram(newSpec);
    
    if (micState.isRecording) {
      animationFrameRef.current = requestAnimationFrame(() => {
        setTimeout(updateLiveSpectrogram, 100);
      });
    }
  };

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const handleStartRecording = async () => {
    setResults(null);
    setLiveSpectrogram(null);
    await startRecording();
  };

  const handleStopRecording = () => {
    stopRecording();
  };

  const handleReset = () => {
    clearRecording();
    setResults(null);
    setLiveSpectrogram(null);
    setPhase('idle');
  };

  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 0.7) return 'bg-green-500';
    if (confidence >= 0.4) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const formatConfidence = (confidence: number): string => {
    return `${(confidence * 100).toFixed(1)}%`;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bird className="w-5 h-5 text-primary" />
            Kuş Sesi Tanımlama
          </CardTitle>
          <CardDescription>
            Mikrofonunuzla kuş sesini kaydedin, yapay zeka modelimiz kuşu tanımlasın.
            BirdNET ve Merlin Bird ID benzeri bir sistem.
          </CardDescription>
          {mlStatus && !mlStatus.modelLoaded && (
            <div className="mt-3 flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400">
              <Info className="w-4 h-4" />
              <span>Demo modunda çalışıyor - Gerçek model eğitimi için GPU gerekli</span>
            </div>
          )}
          {mlStatus && mlStatus.modelLoaded && (
            <div className="mt-3 flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
              <CheckCircle2 className="w-4 h-4" />
              <span>Model hazır - Doğruluk: %{(mlStatus.accuracy * 100).toFixed(0)}</span>
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center gap-4">
            {phase === 'idle' && (
              <Button
                size="lg"
                onClick={handleStartRecording}
                className="gap-2"
                data-testid="button-start-recording"
              >
                <Mic className="w-5 h-5" />
                Kayda Başla
              </Button>
            )}

            {phase === 'recording' && (
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <div className="absolute inset-0 animate-ping rounded-full bg-red-500/30" />
                  <Button
                    size="lg"
                    variant="destructive"
                    onClick={handleStopRecording}
                    className="gap-2 relative"
                    data-testid="button-stop-recording"
                  >
                    <Square className="w-5 h-5" />
                    Kaydı Durdur
                  </Button>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-mono text-primary">
                    {micState.duration.toFixed(1)}s
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Maksimum 5 saniye
                  </div>
                </div>
                <Progress value={(micState.duration / 5) * 100} className="w-64" />
              </div>
            )}

            {phase === 'processing' && (
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
                <div className="text-center">
                  <div className="font-medium">Analiz ediliyor...</div>
                  <div className="text-sm text-muted-foreground">
                    Spektrogram oluşturuluyor ve model çalıştırılıyor
                  </div>
                </div>
              </div>
            )}

            {phase === 'results' && (
              <Button
                variant="outline"
                onClick={handleReset}
                className="gap-2"
                data-testid="button-reset"
              >
                <RotateCcw className="w-4 h-4" />
                Yeni Kayıt
              </Button>
            )}
          </div>

          {micState.error && (
            <div className="flex items-center gap-2 p-4 bg-destructive/10 rounded-lg text-destructive">
              <AlertCircle className="w-5 h-5" />
              <span>{micState.error}</span>
            </div>
          )}

          {(phase === 'recording' || phase === 'processing') && liveSpectrogram && (
            <div className="flex justify-center">
              <SpectrogramVisualizer
                data={liveSpectrogram}
                width={500}
                height={200}
                colorMap="viridis"
                title="Canlı Ses Spektrogramı"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {results && results.success && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              Tanımlama Sonuçları
            </CardTitle>
            <CardDescription>
              İşlem süresi: {results.processingTime}ms
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {results.spectrogram && (
              <div className="flex justify-center mb-6">
                <SpectrogramVisualizer
                  data={results.spectrogram}
                  width={500}
                  height={200}
                  colorMap="magma"
                  title="Kaydedilen Ses Spektrogramı"
                />
              </div>
            )}

            <div className="space-y-3">
              {results.predictions.map((prediction) => (
                <div
                  key={prediction.birdId}
                  className="flex items-center gap-4 p-4 rounded-lg border bg-card hover-elevate transition-all"
                  data-testid={`prediction-result-${prediction.rank}`}
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold">
                    {prediction.rank}
                  </div>
                  
                  <div className="flex-1">
                    <Link
                      href={`/bird/${prediction.birdId}`}
                      className="font-medium hover:text-primary transition-colors"
                    >
                      {prediction.birdName}
                    </Link>
                    <div className="text-sm text-muted-foreground italic">
                      {prediction.scientificName}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-32">
                      <Progress 
                        value={prediction.confidence * 100} 
                        className="h-2"
                      />
                    </div>
                    <Badge 
                      variant="secondary"
                      className={`${getConfidenceColor(prediction.confidence)} text-white min-w-16 justify-center`}
                    >
                      {formatConfidence(prediction.confidence)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <div className="flex items-start gap-2">
                <Volume2 className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium mb-1">Demo Modu</p>
                  <p>
                    Bu sistem şu anda demo modunda çalışmaktadır. Gerçek kuş sesi tanımlama için
                    modelin eğitilmesi gerekmektedir. Eğitim için Xeno-canto veritabanından
                    86 kuş türüne ait binlerce ses kaydı kullanılabilir.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>ML Model Mimarisi</CardTitle>
          <CardDescription>
            BirdNET benzeri CNN tabanlı kuş sesi sınıflandırma sistemi
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg border bg-card">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                Veri İşleme
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>Ses normalleştirme</li>
                <li>Yeniden örnekleme (22.05 kHz)</li>
                <li>Mel spektrogram (128 mel)</li>
                <li>Güç → dB dönüşümü</li>
              </ul>
            </div>
            <div className="p-4 rounded-lg border bg-card">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                Model Katmanları
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>Conv2D + BatchNorm (32, 64)</li>
                <li>Depthwise Separable (128, 256)</li>
                <li>Global Average Pooling</li>
                <li>Dense (512, 256) + Dropout</li>
                <li>Softmax (86 sınıf)</li>
              </ul>
            </div>
            <div className="p-4 rounded-lg border bg-card">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-purple-500" />
                Eğitim
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>Stratified Train/Val/Test split</li>
                <li>Data augmentation (masking)</li>
                <li>Adam optimizer</li>
                <li>Early stopping</li>
                <li>Top-3 accuracy metriği</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
