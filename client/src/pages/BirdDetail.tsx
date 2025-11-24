import { useRoute, Link, useLocation } from "wouter";
import { birds } from "@/data/birds";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MapPin, Ruler, Palette, ChevronLeft, ChevronRight } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useEffect } from "react";

export default function BirdDetail() {
  const [, params] = useRoute("/bird/:id");
  const [, setLocation] = useLocation();
  const bird = birds.find((b) => b.id === params?.id);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [params?.id]);

  if (!bird) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="font-serif text-3xl font-semibold mb-4">Kuş bulunamadı</h2>
          <Link href="/">
            <Button data-testid="button-back-home">Ana Sayfaya Dön</Button>
          </Link>
        </div>
      </div>
    );
  }

  const currentIndex = birds.findIndex((b) => b.id === bird.id);
  const previousBird = currentIndex > 0 ? birds[currentIndex - 1] : null;
  const nextBird = currentIndex < birds.length - 1 ? birds[currentIndex + 1] : null;

  return (
    <div className="min-h-screen bg-background">
      <div className="absolute top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      <div className="container mx-auto px-6 py-12">
        <Link href="/" data-testid="link-back-home">
          <Button variant="ghost" className="mb-8 hover-elevate">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Galeriye Dön
          </Button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          <div className="lg:col-span-3">
            <div className="bg-card rounded-lg p-12 aspect-square flex items-center justify-center relative overflow-visible">
              <img
                src={bird.image}
                alt={bird.name}
                className="max-w-full max-h-full object-contain animate-3d-flight"
                data-testid={`img-bird-detail-${bird.id}`}
              />
            </div>
          </div>

          <div className="lg:col-span-2 space-y-8">
            <div>
              <h1 
                className="font-serif text-4xl md:text-5xl font-semibold text-foreground mb-3"
                data-testid="text-bird-detail-name"
              >
                {bird.name}
              </h1>
              <p className="text-muted-foreground text-lg italic">
                {bird.scientificName}
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-md">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground mb-2">Yaşam Bölgeleri</h3>
                  <p className="text-muted-foreground">
                    {bird.region.join(", ")}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-md">
                  <Ruler className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground mb-2">Boyut</h3>
                  <p className="text-muted-foreground">{bird.size}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-md">
                  <Palette className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground mb-2">Renk Özellikleri</h3>
                  <div className="flex flex-wrap gap-2">
                    {bird.colors.map((color, index) => (
                      <span 
                        key={index}
                        className="bg-secondary text-secondary-foreground px-3 py-1 rounded-md text-sm"
                      >
                        {color}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="fixed bottom-6 left-6 right-6 flex justify-between items-center pointer-events-none">
          <div className="pointer-events-auto">
            {previousBird && (
              <Button
                onClick={() => setLocation(`/bird/${previousBird.id}`)}
                variant="secondary"
                data-testid="button-previous-bird"
                className="hover-elevate active-elevate-2"
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                {previousBird.name}
              </Button>
            )}
          </div>
          <div className="pointer-events-auto">
            {nextBird && (
              <Button
                onClick={() => setLocation(`/bird/${nextBird.id}`)}
                variant="secondary"
                data-testid="button-next-bird"
                className="hover-elevate active-elevate-2"
              >
                {nextBird.name}
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
