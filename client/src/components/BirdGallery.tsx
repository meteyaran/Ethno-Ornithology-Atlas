import { BirdCard } from "./BirdCard";
import { Bird } from "@/data/birds";
import { useEffect, useRef } from "react";

interface BirdGalleryProps {
  groupedBirds: { [key: string]: Bird[] };
  onSectionChange?: (letter: string) => void;
}

export function BirdGallery({ groupedBirds, onSectionChange }: BirdGalleryProps) {
  const sectionRefs = useRef<{ [key: string]: HTMLElement | null }>({});

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && onSectionChange) {
            const letter = entry.target.getAttribute("data-letter");
            if (letter) onSectionChange(letter);
          }
        });
      },
      { threshold: 0.3, rootMargin: "-100px 0px -50% 0px" }
    );

    Object.values(sectionRefs.current).forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, [onSectionChange]);

  return (
    <div className="container mx-auto px-6 py-12">
      {Object.entries(groupedBirds)
        .sort(([a], [b]) => a.localeCompare(b, 'tr'))
        .map(([letter, birds]) => (
          <section
            key={letter}
            id={`section-${letter}`}
            data-letter={letter}
            ref={(el) => (sectionRefs.current[letter] = el)}
            className="mb-20"
            data-testid={`section-letter-${letter.toLowerCase()}`}
          >
            <h2 className="font-serif text-4xl md:text-5xl font-semibold mb-12 text-foreground">
              {letter}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-12">
              {birds.map((bird) => (
                <BirdCard key={bird.id} bird={bird} />
              ))}
            </div>
          </section>
        ))}
    </div>
  );
}
