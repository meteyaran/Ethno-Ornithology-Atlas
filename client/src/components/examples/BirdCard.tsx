import { BirdCard } from '../BirdCard';
import robinImg from "@assets/generated_images/robin_in_flight.png";
import { Router } from 'wouter';

export default function BirdCardExample() {
  const mockBird = {
    id: "12",
    name: "Kızılgerdan",
    scientificName: "Erithacus rubecula",
    region: ["Avrupa", "Kuzey Afrika"],
    size: "12-14 cm",
    colors: ["Turuncu-kırmızı", "Kahverengi"],
    image: robinImg,
    letter: "K",
  };

  return (
    <Router>
      <div className="p-12 max-w-sm">
        <BirdCard bird={mockBird} />
      </div>
    </Router>
  );
}
