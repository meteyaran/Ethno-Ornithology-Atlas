import heroImg from "@assets/generated_images/hero_banner_flying_birds.png";

export function Hero() {
  return (
    <section className="relative h-[500px] md:h-[600px] w-full overflow-hidden bg-gradient-to-b from-[#3a3532] via-[#4a4542] to-background">
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{ backgroundImage: `url(${heroImg})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[#3a3532]/90 via-[#4a4542]/80 to-background" />
      </div>
      
      <div className="relative h-full flex flex-col items-center justify-center px-6 text-center">
        <div className="max-w-4xl">
          <h1 
            className="font-serif text-5xl md:text-7xl font-semibold text-[#e8dfd5] mb-6 tracking-wide leading-tight"
            data-testid="text-hero-title"
          >
            A'dan Z'ye Dünya Kuşları
          </h1>
          <p className="text-[#d4c5b8] text-base md:text-lg max-w-3xl mx-auto mb-8 font-light leading-relaxed italic">
            Kuşların izlenimlerini ve dilin izlerini aynı sayfada buluşturur. 
            Her kuş resmi bir kelimeye benzer; anlamı sabit değildir. 
            Renkler ışıkla değişir, kelimeler bir bağlamda.
          </p>
        </div>
      </div>
    </section>
  );
}
