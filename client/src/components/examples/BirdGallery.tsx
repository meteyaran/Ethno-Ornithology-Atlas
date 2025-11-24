import { BirdGallery } from '../BirdGallery';
import { birds, groupBirdsByLetter } from '@/data/birds';
import { Router } from 'wouter';

export default function BirdGalleryExample() {
  const groupedBirds = groupBirdsByLetter();

  return (
    <Router>
      <div className="bg-background">
        <BirdGallery 
          groupedBirds={groupedBirds}
          onSectionChange={(letter) => console.log('Active section:', letter)}
        />
      </div>
    </Router>
  );
}
