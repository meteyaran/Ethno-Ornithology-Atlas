import heroImg from "@assets/generated_images/impressionist_bird_in_flight_hero.png";

export function Hero() {
  return (
    <section className="relative h-[70vh] md:h-[80vh] w-full overflow-hidden bg-[#7a9d0f] hero-3d">
      {/* Minimal pattern background - behind the bird */}
      <div className="absolute inset-0 hero-pattern opacity-50 hero-layer-1"></div>
      
      <div className="absolute inset-0 flex items-center justify-center hero-layer-2">
        <img 
          src={heroImg} 
          alt="Uçan Kuş" 
          className="w-full h-full object-cover opacity-85"
        />
      </div>
      
      <div className="absolute inset-0 bg-gradient-to-b from-[#7a9d0f]/20 via-transparent to-background/40 hero-layer-3" />
      
      <div className="relative h-full flex flex-col items-center justify-end px-6 pb-16 text-center hero-layer-4">
        <div className="max-w-4xl">
          <h1 
            className="font-serif text-5xl md:text-7xl font-bold text-white mb-6 tracking-wide leading-tight drop-shadow-2xl"
            data-testid="text-hero-title"
          >
            A'dan Z'ye Dünya Kuşları
          </h1>
          <p className="text-white/95 text-base md:text-xl max-w-3xl mx-auto font-light leading-relaxed drop-shadow-lg">
            Kuşların izlenimlerini ve dilin izlerini aynı sayfada buluşturur. 
            Her kuş resmi bir kelimeye benzer; anlamı sabit değildir. 
            Renkler ışıkla değişir, kelimeler bir bağlamda.
          </p>
        </div>
      </div>
    </section>
  );
}
