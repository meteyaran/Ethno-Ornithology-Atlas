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
      
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50" />
      
      <div className="relative h-full flex flex-col items-center justify-end px-6 pb-12 text-center">
        <div className="max-w-4xl">
          <div className="mb-4 flex justify-center">
            <div className="w-24 h-[2px] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
          </div>
          <h1 
            className="font-serif text-5xl md:text-7xl font-bold text-white mb-4 tracking-wider leading-tight italic"
            style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.7), 0 0 40px rgba(0,0,0,0.5)' }}
            data-testid="text-hero-title"
          >
            A'dan Z'ye Dünya Kuşları
          </h1>
          <div className="mb-6 flex justify-center">
            <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent" />
          </div>
          <p 
            className="text-white/90 text-base md:text-lg max-w-2xl mx-auto font-light leading-relaxed tracking-wide italic"
            style={{ textShadow: '1px 1px 6px rgba(0,0,0,0.8)' }}
          >
            Kuşların izlenimlerini ve dilin izlerini aynı sayfada buluşturur. 
            Her kuş resmi bir kelimeye benzer; anlamı sabit değildir. 
            Renkler ışıkla değişir, kelimelerse bir bakışla.
          </p>
          <div className="mt-6 flex justify-center">
            <div className="w-32 h-[2px] bg-gradient-to-r from-transparent via-white/50 to-transparent" />
          </div>
        </div>
      </div>
    </section>
  );
}
