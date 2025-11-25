import { useState, useCallback, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { birds } from "@/data/birds";

export function BirdSearch() {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [, setLocation] = useLocation();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredBirds = query.length >= 1
    ? birds.filter(bird => 
        bird.name.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 8)
    : [];

  const handleSelect = useCallback((birdId: string) => {
    setQuery("");
    setIsOpen(false);
    setLocation(`/bird/${birdId}`);
  }, [setLocation]);

  const handleClear = useCallback(() => {
    setQuery("");
    setIsOpen(false);
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full max-w-xs">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Kuş ara..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="pl-10 pr-9 h-14 text-base"
          data-testid="input-bird-search"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full hover:bg-muted"
            data-testid="button-clear-search"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        )}
      </div>

      {isOpen && filteredBirds.length > 0 && (
        <div 
          className="absolute top-full left-0 right-0 mt-1 bg-card border rounded-lg shadow-lg z-50 overflow-hidden"
          data-testid="search-results"
        >
          {filteredBirds.map((bird) => (
            <button
              key={bird.id}
              onClick={() => handleSelect(bird.id)}
              className="w-full flex items-center gap-3 px-3 py-2 hover-elevate text-left transition-colors"
              data-testid={`search-result-${bird.id}`}
            >
              <img 
                src={bird.image} 
                alt={bird.name}
                className="w-10 h-10 rounded-full object-cover border"
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{bird.name}</p>
                <p className="text-xs text-muted-foreground truncate italic">{bird.scientificName}</p>
              </div>
              <span className="text-xs font-mono text-primary bg-primary/10 px-2 py-0.5 rounded">
                {bird.letter}
              </span>
            </button>
          ))}
        </div>
      )}

      {isOpen && query.length >= 1 && filteredBirds.length === 0 && (
        <div 
          className="absolute top-full left-0 right-0 mt-1 bg-card border rounded-lg shadow-lg z-50 p-4 text-center"
          data-testid="search-no-results"
        >
          <p className="text-sm text-muted-foreground">"{query}" ile eşleşen kuş bulunamadı</p>
        </div>
      )}
    </div>
  );
}
