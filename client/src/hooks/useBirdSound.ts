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
  length: string;
  en: string;
}

interface ApiResponse {
  recordings: Recording[];
  numRecordings: string;
}

export function useBirdSound(scientificName: string) {
  return useQuery({
    queryKey: ["bird-sound", scientificName],
    queryFn: async () => {
      // Backend proxy üzerinden Xeno-canto API'sine istek at
      const response = await fetch(
        `/api/bird-sounds/${encodeURIComponent(scientificName)}`
      );
      
      if (!response.ok) {
        throw new Error("Ses kaydı bulunamadı");
      }
      
      const data: ApiResponse = await response.json();
      return data.recordings;
    },
    enabled: !!scientificName,
    staleTime: 1000 * 60 * 60, // 1 saat
  });
}
