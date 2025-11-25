import { useState, useMemo, useEffect } from 'react';
import { Link } from 'wouter';
import { birds } from '@/data/birds';
import { BirdDistributionMap } from '@/components/BirdDistributionMap';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Search, MapPin, Bird, Globe, MousePointerClick, Loader2 } from 'lucide-react';

export default function Distribution() {
  const [selectedBird, setSelectedBird] = useState<typeof birds[0] | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [observationCount, setObservationCount] = useState(0);
  const [speciesCode, setSpeciesCode] = useState<string | null>(null);
  const [loadingSpeciesCode, setLoadingSpeciesCode] = useState(false);
  const [speciesCodeError, setSpeciesCodeError] = useState<string | null>(null);
  
  const filteredBirds = useMemo(() => {
    if (!searchTerm) return birds;
    const term = searchTerm.toLowerCase();
    return birds.filter(bird => 
      bird.name.toLowerCase().includes(term) ||
      bird.scientificName.toLowerCase().includes(term)
    );
  }, [searchTerm]);
  
  const groupedBirds = useMemo(() => {
    const groups: Record<string, typeof birds> = {};
    filteredBirds.forEach(bird => {
      if (!groups[bird.letter]) {
        groups[bird.letter] = [];
      }
      groups[bird.letter].push(bird);
    });
    return groups;
  }, [filteredBirds]);
  
  useEffect(() => {
    const fetchSpeciesCode = async () => {
      if (!selectedBird) {
        setSpeciesCode(null);
        return;
      }
      
      setLoadingSpeciesCode(true);
      setSpeciesCodeError(null);
      
      try {
        const response = await fetch(`/api/ebird/taxonomy?scientificName=${encodeURIComponent(selectedBird.scientificName)}`);
        
        if (!response.ok) {
          throw new Error('Tür kodu alınamadı');
        }
        
        const data = await response.json();
        
        if (data.species && data.species.speciesCode) {
          setSpeciesCode(data.species.speciesCode);
        } else {
          setSpeciesCodeError('Bu tür eBird veritabanında bulunamadı');
          setSpeciesCode(null);
        }
      } catch (err) {
        console.error('Error fetching species code:', err);
        setSpeciesCodeError('Tür kodu alınırken hata oluştu');
        setSpeciesCode(null);
      } finally {
        setLoadingSpeciesCode(false);
      }
    };
    
    fetchSpeciesCode();
  }, [selectedBird]);
  
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2" data-testid="link-back-home">
              <ArrowLeft className="w-4 h-4" />
              Ana Sayfa
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" />
            <h1 className="text-lg font-semibold">Kuş Dağılım Haritası</h1>
          </div>
        </div>
      </header>
      
      <main className="container py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Bird className="w-5 h-5" />
                  Kuş Türü Seç
                </CardTitle>
                <CardDescription>
                  Dünya genelinde dağılımını görmek istediğiniz kuşu seçin
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Kuş ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                    data-testid="input-bird-search"
                  />
                </div>
                
                <ScrollArea className="h-[500px] pr-4">
                  <div className="space-y-4">
                    {Object.entries(groupedBirds).sort().map(([letter, letterBirds]) => (
                      <div key={letter}>
                        <div className="sticky top-0 bg-background py-1">
                          <Badge variant="outline" className="font-bold">
                            {letter}
                          </Badge>
                        </div>
                        <div className="space-y-1 mt-2">
                          {letterBirds.map(bird => (
                            <button
                              key={bird.id}
                              onClick={() => setSelectedBird(bird)}
                              className={`w-full text-left p-2 rounded-md transition-colors hover-elevate ${
                                selectedBird?.id === bird.id 
                                  ? 'bg-primary/10 border border-primary/20' 
                                  : ''
                              }`}
                              data-testid={`button-select-bird-${bird.id}`}
                            >
                              <div className="flex items-center gap-3">
                                <img 
                                  src={bird.image} 
                                  alt={bird.name}
                                  className="w-10 h-10 object-contain rounded"
                                />
                                <div className="min-w-0">
                                  <p className="font-medium text-sm truncate">{bird.name}</p>
                                  <p className="text-xs text-muted-foreground italic truncate">
                                    {bird.scientificName}
                                  </p>
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
          
          <div className="lg:col-span-2">
            {selectedBird && speciesCode ? (
              <BirdDistributionMap
                speciesCode={speciesCode}
                scientificName={selectedBird.scientificName}
                birdName={selectedBird.name}
                onObservationsLoaded={setObservationCount}
              />
            ) : selectedBird && loadingSpeciesCode ? (
              <Card className="h-[580px]">
                <CardContent className="h-full flex items-center justify-center">
                  <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <p className="text-muted-foreground">
                      {selectedBird.name} için eBird kodu aranıyor...
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : selectedBird && speciesCodeError ? (
              <Card className="h-[580px]">
                <CardContent className="h-full flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <div className="w-20 h-20 mx-auto rounded-full bg-destructive/10 flex items-center justify-center">
                      <Bird className="w-10 h-10 text-destructive" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium">Tür Bulunamadı</h3>
                      <p className="text-muted-foreground mt-1">
                        {selectedBird.name} ({selectedBird.scientificName})<br/>
                        eBird veritabanında bulunamadı.
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={() => setSelectedBird(null)}
                      className="gap-2"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Başka Kuş Seç
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="h-[580px]">
                <CardContent className="h-full flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
                      <MousePointerClick className="w-10 h-10 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium">Listeden Bir Kuş Seçin</h3>
                      <p className="text-muted-foreground mt-1">
                        Soldaki listeden herhangi bir kuşa<br/>
                        <strong>tıklayarak</strong> dağılım haritasını görün.
                      </p>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                      <Globe className="w-4 h-4" />
                      <span>eBird verileri kullanılmaktadır</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {selectedBird && (
              <Card className="mt-4">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-4">
                      <img 
                        src={selectedBird.image} 
                        alt={selectedBird.name}
                        className="w-16 h-16 object-contain"
                      />
                      <div>
                        <h3 className="font-semibold">{selectedBird.name}</h3>
                        <p className="text-sm text-muted-foreground italic">{selectedBird.scientificName}</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedBird.region.map(r => (
                            <Badge key={r} variant="secondary" className="text-xs">{r}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">{observationCount}</p>
                      <p className="text-sm text-muted-foreground">son 30 gün gözlem</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
        
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>
            Veriler{' '}
            <a 
              href="https://ebird.org" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              eBird
            </a>
            {' '}(Cornell Lab of Ornithology) tarafından sağlanmaktadır.
          </p>
        </div>
      </main>
    </div>
  );
}
