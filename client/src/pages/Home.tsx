import { Hero } from "@/components/Hero";
import { FeatureCards } from "@/components/FeatureCards";
import { AlphabetNav } from "@/components/AlphabetNav";
import { BirdGallery } from "@/components/BirdGallery";
import { groupBirdsByLetter, getAllLetters } from "@/data/birds";
import { useState } from "react";
import { SettingsBar } from "@/components/SettingsBar";

export default function Home() {
  const [activeSection, setActiveSection] = useState<string>("");
  const groupedBirds = groupBirdsByLetter();
  const letters = getAllLetters();

  const handleLetterClick = (letter: string) => {
    const element = document.getElementById(`section-${letter}`);
    if (element) {
      const navHeight = 64;
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - navHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="absolute top-4 right-4 z-50">
        <SettingsBar />
      </div>
      
      <Hero />
      <FeatureCards />
      <AlphabetNav 
        letters={letters} 
        activeSection={activeSection}
        onLetterClick={handleLetterClick}
      />
      <BirdGallery 
        groupedBirds={groupedBirds}
        onSectionChange={setActiveSection}
      />
      
      <footer className="bg-card border-t py-12">
        <div className="container mx-auto px-6 text-center">
          <h3 className="font-serif text-2xl font-semibold mb-3 text-foreground">
            A'dan Z'ye Dünya Kuşları
          </h3>
          <p className="text-muted-foreground text-sm max-w-2xl mx-auto mb-6">
            Empresyonist sanat tarzında dünya kuşlarını keşfedin. Her kuşun benzersiz özellikleri ve yaşam alanları hakkında bilgi edinin.
          </p>
          <p className="text-muted-foreground text-xs">
            © 2024 Tüm hakları saklıdır.
          </p>
        </div>
      </footer>
    </div>
  );
}
