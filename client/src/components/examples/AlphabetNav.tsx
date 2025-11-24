import { AlphabetNav } from '../AlphabetNav';
import { useState } from 'react';

export default function AlphabetNavExample() {
  const [activeSection, setActiveSection] = useState('A');
  const letters = ['A', 'B', 'C', 'D', 'F', 'G', 'İ', 'K', 'L', 'M', 'Ö', 'P', 'S', 'T', 'Y'];

  return (
    <AlphabetNav 
      letters={letters} 
      activeSection={activeSection}
      onLetterClick={(letter) => {
        console.log('Letter clicked:', letter);
        setActiveSection(letter);
      }}
    />
  );
}
