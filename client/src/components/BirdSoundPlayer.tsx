import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Volume2, VolumeX, Play, Pause, Loader2, Music, Radio } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useBirdSound } from "@/hooks/useBirdSound";

function AudioWaveAnimation({ isPlaying }: { isPlaying: boolean }) {
  return (
    <div className="flex items-center justify-center gap-[3px] h-8">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className={`w-1 bg-primary rounded-full transition-all duration-150 ${
            isPlaying ? 'animate-sound-wave' : 'h-2'
          }`}
          style={{
            animationDelay: isPlaying ? `${i * 0.1}s` : '0s',
            height: isPlaying ? undefined : '8px'
          }}
        />
      ))}
    </div>
  );
}

interface BirdSoundPlayerProps {
  scientificName: string;
  birdName: string;
}

export function BirdSoundPlayer({ scientificName, birdName }: BirdSoundPlayerProps) {
  const { data: recordings, isLoading, error } = useBirdSound(scientificName);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : 0.7;
    }
  }, [isMuted]);

  useEffect(() => {
    setAudioError(false);
  }, [currentIndex]);

  const handlePlayPause = () => {
    if (!audioRef.current || !recordings || recordings.length === 0) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(() => {
        setAudioError(true);
      });
    }
    setIsPlaying(!isPlaying);
  };

  const handleEnded = () => {
    setIsPlaying(false);
  };

  const handleAudioError = () => {
    setAudioError(true);
    setIsPlaying(false);
  };

  const handleNextRecording = () => {
    if (!recordings) return;
    setCurrentIndex((prev) => (prev + 1) % recordings.length);
    setIsPlaying(false);
    setAudioError(false);
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-4">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <p className="text-muted-foreground">Ses kaydı yükleniyor...</p>
        </div>
      </Card>
    );
  }

  if (error || !recordings || recordings.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-4">
          <VolumeX className="h-5 w-5 text-muted-foreground" />
          <p className="text-muted-foreground">Bu kuş için ses kaydı bulunamadı</p>
        </div>
      </Card>
    );
  }

  const currentRecording = recordings[currentIndex];
  // Use proxy endpoint to bypass CORS issues
  const rawAudioUrl = currentRecording.file.startsWith('http') 
    ? currentRecording.file 
    : `https:${currentRecording.file}`;
  const audioUrl = `/api/audio-proxy?url=${encodeURIComponent(rawAudioUrl)}`;

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Volume2 className="h-5 w-5 text-primary" />
            <div>
              <h3 className="font-medium text-foreground">Kuş Sesi</h3>
              <p className="text-sm text-muted-foreground">
                {currentRecording.loc} - {currentRecording.rec}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMuted(!isMuted)}
              title={isMuted ? "Sesi Aç" : "Sessize Al"}
            >
              {isMuted ? (
                <VolumeX className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={handlePlayPause}
            variant="default"
            size="lg"
            className="flex-shrink-0"
          >
            {isPlaying ? (
              <>
                <Pause className="h-4 w-4 mr-2" />
                Duraklat
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Dinle
              </>
            )}
          </Button>

          {recordings.length > 1 && (
            <Button
              onClick={handleNextRecording}
              variant="outline"
              size="lg"
            >
              Başka Kayıt ({currentIndex + 1}/{recordings.length})
            </Button>
          )}
        </div>

        <audio
          ref={audioRef}
          src={audioUrl}
          onEnded={handleEnded}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onError={handleAudioError}
        />

        {currentRecording.sono && currentRecording.sono.small && (
          <div className="mt-5 space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Radio className="h-4 w-4" />
              <span>Ses Spektrogramı</span>
              <AudioWaveAnimation isPlaying={isPlaying} />
            </div>
            
            <div className={`relative group rounded-lg overflow-hidden ${isPlaying ? 'ring-2 ring-primary/50' : ''}`}>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 z-10 pointer-events-none" />
              
              <img
                src={currentRecording.sono.med 
                  ? (currentRecording.sono.med.startsWith('http') 
                      ? currentRecording.sono.med 
                      : `https:${currentRecording.sono.med}`)
                  : (currentRecording.sono.small.startsWith('http') 
                      ? currentRecording.sono.small 
                      : `https:${currentRecording.sono.small}`)}
                alt={`${birdName} sesinin spektrogramı`}
                className={`w-full h-32 object-cover transition-all duration-500 ${
                  isPlaying ? 'scale-[1.02] brightness-110' : 'brightness-90'
                }`}
              />
              
              {isPlaying && (
                <div className="absolute inset-0 z-20 pointer-events-none">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary/80 animate-spectrum-scan" />
                </div>
              )}
              
              <div className="absolute bottom-2 left-3 right-3 z-20 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Music className="h-3 w-3 text-white/80" />
                  <span className="text-xs text-white/80 font-medium">
                    {currentRecording.length || "0:00"}
                  </span>
                </div>
                <span className="text-xs text-white/60 bg-black/40 px-2 py-0.5 rounded">
                  {currentRecording.type || "Ses"}
                </span>
              </div>
            </div>
            
            <p className="text-xs text-muted-foreground text-center">
              Kaynak: Xeno-canto ({currentRecording.cnt})
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
