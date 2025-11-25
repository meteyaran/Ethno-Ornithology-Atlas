import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, MapPin, Calendar, Eye } from 'lucide-react';

interface Observation {
  speciesCode: string;
  comName: string;
  sciName: string;
  locId: string;
  locName: string;
  obsDt: string;
  howMany?: number;
  lat: number;
  lng: number;
  obsValid: boolean;
  obsReviewed: boolean;
  locationPrivate: boolean;
  subId: string;
}

interface BirdDistributionMapProps {
  speciesCode: string;
  scientificName: string;
  birdName: string;
  onObservationsLoaded?: (count: number) => void;
}

const createBirdIcon = () => {
  return L.divIcon({
    className: 'bird-marker',
    html: `<div style="
      width: 12px;
      height: 12px;
      background: hsl(var(--primary));
      border: 2px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [12, 12],
    iconAnchor: [6, 6],
    popupAnchor: [0, -6]
  });
};

const createClusterIcon = (count: number) => {
  const size = count > 100 ? 40 : count > 50 ? 35 : count > 10 ? 30 : 25;
  return L.divIcon({
    className: 'cluster-marker',
    html: `<div style="
      width: ${size}px;
      height: ${size}px;
      background: hsl(var(--primary));
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 6px rgba(0,0,0,0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      font-size: ${size > 30 ? '12px' : '10px'};
    ">${count}</div>`,
    iconSize: [size, size],
    iconAnchor: [size/2, size/2]
  });
};

function MapController({ observations }: { observations: Observation[] }) {
  const map = useMap();
  
  useEffect(() => {
    if (observations.length > 0) {
      const bounds = L.latLngBounds(
        observations.map(obs => [obs.lat, obs.lng] as [number, number])
      );
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 8 });
    }
  }, [observations, map]);
  
  return null;
}

function clusterObservations(observations: Observation[], zoomLevel: number): { center: Observation; count: number; items: Observation[] }[] {
  if (zoomLevel >= 8) {
    return observations.map(obs => ({ center: obs, count: 1, items: [obs] }));
  }
  
  const gridSize = zoomLevel < 4 ? 10 : zoomLevel < 6 ? 5 : 2;
  const clusters = new Map<string, { center: Observation; count: number; items: Observation[] }>();
  
  observations.forEach(obs => {
    const gridX = Math.floor(obs.lng / gridSize);
    const gridY = Math.floor(obs.lat / gridSize);
    const key = `${gridX}-${gridY}`;
    
    if (clusters.has(key)) {
      const cluster = clusters.get(key)!;
      cluster.count++;
      cluster.items.push(obs);
    } else {
      clusters.set(key, { center: obs, count: 1, items: [obs] });
    }
  });
  
  return Array.from(clusters.values());
}

export function BirdDistributionMap({ 
  speciesCode, 
  scientificName, 
  birdName,
  onObservationsLoaded 
}: BirdDistributionMapProps) {
  const [observations, setObservations] = useState<Observation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState(3);
  const mapRef = useRef<L.Map | null>(null);
  
  useEffect(() => {
    const fetchObservations = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/ebird/global/${speciesCode}?back=30`);
        
        if (!response.ok) {
          throw new Error('Gözlem verileri alınamadı');
        }
        
        const data = await response.json();
        setObservations(data.observations || []);
        onObservationsLoaded?.(data.count || 0);
      } catch (err) {
        console.error('Error fetching observations:', err);
        setError(err instanceof Error ? err.message : 'Bilinmeyen hata');
      } finally {
        setLoading(false);
      }
    };
    
    if (speciesCode) {
      fetchObservations();
    }
  }, [speciesCode, onObservationsLoaded]);
  
  const clusters = clusterObservations(observations, zoomLevel);
  
  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center h-[500px]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-muted-foreground">
              {birdName} için dünya genelinde gözlemler yükleniyor...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center h-[500px]">
          <div className="flex flex-col items-center gap-4 text-center">
            <MapPin className="w-12 h-12 text-muted-foreground" />
            <div>
              <p className="text-lg font-medium text-foreground">Gözlem Bulunamadı</p>
              <p className="text-muted-foreground mt-1">{error}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div>
            <CardTitle className="text-xl">{birdName} Dağılım Haritası</CardTitle>
            <CardDescription className="italic">{scientificName}</CardDescription>
          </div>
          <Badge variant="secondary" className="gap-1">
            <Eye className="w-3 h-3" />
            {observations.length} gözlem
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="h-[500px] w-full rounded-b-lg overflow-hidden">
          <MapContainer
            center={[20, 0]}
            zoom={2}
            style={{ height: '100%', width: '100%' }}
            ref={mapRef}
            scrollWheelZoom={true}
            whenReady={() => {
              if (mapRef.current) {
                mapRef.current.on('zoomend', () => {
                  setZoomLevel(mapRef.current?.getZoom() || 3);
                });
              }
            }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            />
            
            <MapController observations={observations} />
            
            {clusters.map((cluster, index) => (
              <Marker
                key={`${cluster.center.locId}-${index}`}
                position={[cluster.center.lat, cluster.center.lng]}
                icon={cluster.count > 1 ? createClusterIcon(cluster.count) : createBirdIcon()}
              >
                <Popup>
                  <div className="min-w-[200px]">
                    <h3 className="font-semibold text-foreground">{cluster.center.comName}</h3>
                    <p className="text-sm italic text-muted-foreground mb-2">{cluster.center.sciName}</p>
                    
                    {cluster.count > 1 ? (
                      <div className="space-y-1">
                        <p className="text-sm font-medium">{cluster.count} gözlem noktası</p>
                        <div className="max-h-[150px] overflow-y-auto space-y-1">
                          {cluster.items.slice(0, 5).map((obs, i) => (
                            <div key={i} className="text-xs border-l-2 border-primary pl-2">
                              <p className="font-medium">{obs.locName}</p>
                              <p className="text-muted-foreground">{obs.obsDt}</p>
                            </div>
                          ))}
                          {cluster.items.length > 5 && (
                            <p className="text-xs text-muted-foreground">
                              +{cluster.items.length - 5} daha...
                            </p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-1 text-sm mb-1">
                          <MapPin className="w-3 h-3" />
                          <span>{cluster.center.locName}</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          <span>{cluster.center.obsDt}</span>
                        </div>
                        {cluster.center.howMany && (
                          <p className="text-sm mt-1">
                            Sayı: <strong>{cluster.center.howMany}</strong>
                          </p>
                        )}
                      </>
                    )}
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
        
        {observations.length === 0 && !loading && (
          <div className="p-4 text-center text-muted-foreground">
            <p>Son 30 günde bu tür için gözlem kaydı bulunamadı.</p>
            <p className="text-sm mt-1">Farklı bir dönem veya bölge deneyin.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default BirdDistributionMap;
