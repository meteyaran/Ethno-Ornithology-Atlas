import heroImg from "@assets/generated_images/impressionist_bird_in_flight_hero.png";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Mic, Brain, Globe } from "lucide-react";

export function Hero() {
  return (
    <section className="relative h-[70vh] md:h-[80vh] w-full overflow-hidden bg-[#7a9d0f]">
      <div className="absolute inset-0 hero-pattern opacity-50"></div>
      
      <div className="absolute inset-0 flex items-center justify-center">
        <img 
          src={heroImg} 
          alt="Uçan Kuş" 
          className="w-full h-full object-cover opacity-85"
        />
      </div>
      
      <div className="absolute inset-0 bg-gradient-to-b from-[#7a9d0f]/20 via-transparent to-background/40" />
      
      <div className="relative h-full flex flex-col items-center justify-end px-6 pb-16 text-center">
        <div className="max-w-4xl">
          <h1 
            className="font-serif text-5xl md:text-7xl font-bold text-white mb-6 tracking-wide leading-tight drop-shadow-2xl"
            data-testid="text-hero-title"
          >
            A'dan Z'ye Dünya Kuşları
          </h1>
          <p className="text-white/95 text-base md:text-xl max-w-3xl mx-auto font-light leading-relaxed drop-shadow-lg mb-8">
            Kuşların izlenimlerini ve dilin izlerini aynı sayfada buluşturur. 
            Her kuş resmi bir kelimeye benzer; anlamı sabit değildir. 
            Renkler ışıkla değişir, kelimeler bir bağlamda.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link href="/identify">
              <Button 
                size="lg" 
                className="gap-2 bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30"
                variant="outline"
                data-testid="button-identify-sound"
              >
                <Brain className="w-5 h-5" />
                <Mic className="w-4 h-4" />
                ML Kuş Sesi Tanımlama
              </Button>
            </Link>
            <Link href="/distribution">
              <Button 
                size="lg" 
                className="gap-2 bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30"
                variant="outline"
                data-testid="button-distribution-map"
              >
                <Globe className="w-5 h-5" />
                Dünya Dağılım Haritası
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
