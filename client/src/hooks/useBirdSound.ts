
import { useQuery } from "@tanstack/react-query";

interface Recording {
  id: string;
  url: string;
  file: string;
  type: string;
  sono: {
    small: string;
    med: string;
    large: string;
    full: string;
  };
  cnt: string;
  loc: string;
  rec: string;
  q: string;
}

interface XenoCantoResponse {
  numRecordings: string;
  numSpecies: string;
  page: number;
  numPages: number;
  recordings: Recording[];
}

export function useBirdSound(scientificName: string) {
  return useQuery({
    queryKey: ["bird-sound", scientificName],
    queryFn: async () => {
      // Xeno-canto API'sine istek at
      const response = await fetch(
        `https://xeno-canto.org/api/2/recordings?query=${encodeURIComponent(scientificName)}&q:A`
      );
      
      if (!response.ok) {
        throw new Error("Ses kaydı bulunamadı");
      }
      
      const data: XenoCantoResponse = await response.json();
      
      // En kaliteli kayıtları al (q:A = quality A)
      const recordings = data.recordings.filter(r => r.q === "A").slice(0, 3);
      
      if (recordings.length === 0 && data.recordings.length > 0) {
        // A kalitesinde yoksa, en iyi 3 kaydı al
        return data.recordings.slice(0, 3);
      }
      
      return recordings;
    },
    enabled: !!scientificName,
    staleTime: 1000 * 60 * 60, // 1 saat
  });
}
