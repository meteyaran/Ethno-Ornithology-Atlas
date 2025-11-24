import heroImg from "@assets/generated_images/hero_banner_flying_birds.png";

export function Hero() {
  return (
    <section className="relative h-[500px] md:h-[600px] w-full overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImg})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-background/80" />
      </div>
      
      <div className="relative h-full flex flex-col items-center justify-center px-6 text-center">
        <h1 
          className="font-serif text-5xl md:text-7xl font-semibold text-white mb-4 tracking-wide"
          data-testid="text-hero-title"
        >
          A'dan Z'ye Dünya Kuşları
        </h1>
        <p className="text-white/90 text-lg md:text-xl max-w-2xl font-light">
          Empresyonist sanat tarzında dünya kuşlarını keşfedin
        </p>
      </div>
    </section>
  );
}
