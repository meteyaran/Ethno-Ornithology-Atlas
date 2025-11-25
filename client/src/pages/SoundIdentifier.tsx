import { BirdSoundIdentifier } from '@/components/BirdSoundIdentifier';
import { Link } from 'wouter';
import { ArrowLeft, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SoundIdentifier() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-2" data-testid="link-back-home">
                <ArrowLeft className="w-4 h-4" />
                Ana Sayfa
              </Button>
            </Link>
            <div className="flex items-center gap-2 text-lg font-serif">
              <Brain className="w-5 h-5 text-primary" />
              <span>ML Kuş Sesi Tanımlama</span>
            </div>
            <div className="w-24" />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-serif font-bold mb-2">
            Kuş Sesini Tanımla
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            BirdNET ve Merlin Bird ID uygulamalarına benzer şekilde, mikrofonunuzla kaydedilen
            kuş seslerini yapay zeka ile analiz edip ansiklopedimizdeki 86 kuş türüyle eşleştiriyoruz.
          </p>
        </div>

        <BirdSoundIdentifier />

        <div className="mt-12 text-center text-sm text-muted-foreground">
          <p>
            Bu sistem TensorFlow.js tabanlı bir CNN modeli kullanmaktadır.
            Mel spektrogram analizi ve derin öğrenme ile kuş sesleri sınıflandırılmaktadır.
          </p>
        </div>
      </main>
    </div>
  );
}
