import { cn } from "@/lib/utils";

interface AlphabetNavProps {
  letters: string[];
  activeSection?: string;
  onLetterClick: (letter: string) => void;
}

export function AlphabetNav({ letters, activeSection, onLetterClick }: AlphabetNavProps) {
  return (
    <nav 
      className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b"
      data-testid="nav-alphabet"
    >
      <div className="container mx-auto px-6 py-3">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide snap-x snap-mandatory">
          {letters.map((letter) => (
            <button
              key={letter}
              onClick={() => onLetterClick(letter)}
              data-testid={`button-letter-${letter.toLowerCase()}`}
              className={cn(
                "min-w-[2.5rem] h-10 rounded-md font-serif text-base font-medium transition-all snap-center hover-elevate active-elevate-2",
                activeSection === letter
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground"
              )}
            >
              {letter}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
