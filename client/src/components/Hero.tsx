import heroImg from "@assets/generated_images/impressionist_bird_in_flight_hero.png";

export function Hero() {
  return (
    <section className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden bg-[#7a9d0f]">
      <div className="absolute inset-0 hero-pattern opacity-50"></div>
      
      <div className="absolute inset-0 flex items-center justify-center">
        <img 
          src={heroImg} 
          alt="Uçan Kuş" 
          className="w-full h-full object-cover opacity-85"
        />
      </div>
      
      <div className="absolute inset-0 bg-gradient-to-b from-[#7a9d0f]/20 via-transparent to-background/40" />
      
      <div className="relative h-full flex flex-col items-center justify-center px-6 text-center">
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
            Renkler ışıkla değişir, kelimelerse bir bakışla.
          </p>
        </div>
      </div>
    </section>
  );
}
