import { Card } from "@/components/ui/card";
import { MapPin } from "lucide-react";
import { Bird } from "@/data/birds";
import { Link } from "wouter";

interface BirdCardProps {
  bird: Bird;
}

export function BirdCard({ bird }: BirdCardProps) {
  return (
    <Link href={`/bird/${bird.id}`} data-testid={`link-bird-${bird.id}`}>
      <Card className="overflow-hidden cursor-pointer group hover-elevate active-elevate-2 transition-transform duration-300 hover:scale-105">
        <div className="aspect-[3/4] relative bg-card">
          <img
            src={bird.image}
            alt={bird.name}
            className="w-full h-full object-contain p-6 group-hover:animate-bounce-subtle"
            data-testid={`img-bird-${bird.id}`}
          />
          
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6 pt-12">
            <h3 
              className="font-serif text-2xl text-white font-semibold mb-1"
              data-testid={`text-bird-name-${bird.id}`}
            >
              {bird.name}
            </h3>
            <p className="text-white/80 text-sm italic mb-2">
              {bird.scientificName}
            </p>
            <div className="flex items-center gap-1 text-white/70 text-sm">
              <MapPin className="h-3 w-3" />
              <span>{bird.region[0]}</span>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
