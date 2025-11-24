
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Volume2, VolumeX, Play, Pause, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useBirdSound } from "@/hooks/useBirdSound";

interface BirdSoundPlayerProps {
  scientificName: string;
  birdName: string;
}

export function BirdSoundPlayer({ scientificName, birdName }: BirdSoundPlayerProps) {
  const { data: recordings, isLoading, error } = useBirdSound(scientificName);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : 0.7;
    }
  }, [isMuted]);

  const handlePlayPause = () => {
    if (!audioRef.current || !recordings || recordings.length === 0) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleEnded = () => {
    setIsPlaying(false);
  };

  const handleNextRecording = () => {
    if (!recordings) return;
    setCurrentIndex((prev) => (prev + 1) % recordings.length);
    setIsPlaying(false);
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
  const audioUrl = `https:${currentRecording.file}`;

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
        />

        {currentRecording.sono && (
          <div className="mt-4">
            <img
              src={currentRecording.sono.small}
              alt={`${birdName} sesinin spektrogramı`}
              className="w-full rounded-md border border-border"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Ses spektrogramı - Kaynak: Xeno-canto
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
