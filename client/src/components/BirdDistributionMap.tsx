import { useEffect, useRef, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, MapPin, Calendar, Eye, Layers, Clock, Leaf, Globe2, History, CalendarDays } from 'lucide-react';

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
  exoticCategory?: string;
}

interface BirdDistributionMapProps {
  speciesCode: string;
  scientificName: string;
  birdName: string;
  onObservationsLoaded?: (count: number) => void;
  onTimeRangeChange?: (range: string) => void;
}

type MapLayerType = 'street' | 'terrain' | 'satellite' | 'hybrid';
type TimeRange = '7' | '14' | '30';
type TimeMode = 'recent' | 'historical';

const currentYear = new Date().getFullYear();

const months = [
  { value: '1', label: 'Ocak' },
  { value: '2', label: 'Şubat' },
  { value: '3', label: 'Mart' },
  { value: '4', label: 'Nisan' },
  { value: '5', label: 'Mayıs' },
  { value: '6', label: 'Haziran' },
  { value: '7', label: 'Temmuz' },
  { value: '8', label: 'Ağustos' },
  { value: '9', label: 'Eylül' },
  { value: '10', label: 'Ekim' },
  { value: '11', label: 'Kasım' },
  { value: '12', label: 'Aralık' },
];

const yearOptions = Array.from({ length: currentYear - 1899 }, (_, i) => ({
  value: String(1900 + i),
  label: String(1900 + i)
})).reverse();

const mapLayers: Record<MapLayerType, { url: string; attribution: string; name: string }> = {
  street: {
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
    name: 'Sokak'
  },
  terrain: {
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://opentopomap.org">OpenTopoMap</a>',
    name: 'Arazi'
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
    name: 'Uydu'
  },
  hybrid: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri',
    name: 'Hibrit'
  }
};

const timeRanges: Record<TimeRange, string> = {
  '7': 'Son 7 gün',
  '14': 'Son 14 gün',
  '30': 'Son 30 gün'
};

const getObservationColor = (count: number): string => {
  if (count >= 100) return '#7c3aed';
  if (count >= 50) return '#a855f7';
  if (count >= 20) return '#c084fc';
  if (count >= 10) return '#3b82f6';
  if (count >= 5) return '#06b6d4';
  return '#22c55e';
};

const createBirdIcon = (isExotic: boolean = false) => {
  const color = isExotic ? '#dc2626' : 'hsl(142, 76%, 36%)';
  return L.divIcon({
    className: 'bird-marker',
    html: `<div style="
      width: 12px;
      height: 12px;
      background: ${color};
      border: 2px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [12, 12],
    iconAnchor: [6, 6],
    popupAnchor: [0, -6]
  });
};

const createClusterIcon = (count: number, hasExotic: boolean = false) => {
  const size = count > 100 ? 40 : count > 50 ? 35 : count > 10 ? 30 : 25;
  const color = hasExotic ? '#dc2626' : getObservationColor(count);
  return L.divIcon({
    className: 'cluster-marker',
    html: `<div style="
      width: ${size}px;
      height: ${size}px;
      background: ${color};
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

function clusterObservations(observations: Observation[], zoomLevel: number): { center: Observation; count: number; items: Observation[]; hasExotic: boolean }[] {
  if (zoomLevel >= 8) {
    return observations.map(obs => ({ 
      center: obs, 
      count: 1, 
      items: [obs],
      hasExotic: obs.exoticCategory === 'X' || obs.exoticCategory === 'P'
    }));
  }
  
  const gridSize = zoomLevel < 4 ? 10 : zoomLevel < 6 ? 5 : 2;
  const clusters = new Map<string, { center: Observation; count: number; items: Observation[]; hasExotic: boolean }>();
  
  observations.forEach(obs => {
    const gridX = Math.floor(obs.lng / gridSize);
    const gridY = Math.floor(obs.lat / gridSize);
    const key = `${gridX}-${gridY}`;
    const isExotic = obs.exoticCategory === 'X' || obs.exoticCategory === 'P';
    
    if (clusters.has(key)) {
      const cluster = clusters.get(key)!;
      cluster.count++;
      cluster.items.push(obs);
      if (isExotic) cluster.hasExotic = true;
    } else {
      clusters.set(key, { center: obs, count: 1, items: [obs], hasExotic: isExotic });
    }
  });
  
  return Array.from(clusters.values());
}

function Legend() {
  const legendItems = [
    { color: '#22c55e', label: '1-4 gözlem' },
    { color: '#06b6d4', label: '5-9 gözlem' },
    { color: '#3b82f6', label: '10-19 gözlem' },
    { color: '#c084fc', label: '20-49 gözlem' },
    { color: '#a855f7', label: '50-99 gözlem' },
    { color: '#7c3aed', label: '100+ gözlem' },
  ];

  return (
    <div className="absolute bottom-4 left-4 z-[1000] bg-background/95 backdrop-blur-sm rounded-lg p-3 shadow-lg border">
      <h4 className="text-xs font-semibold mb-2 flex items-center gap-1">
        <Eye className="w-3 h-3" />
        Gözlem Yoğunluğu
      </h4>
      <div className="space-y-1">
        {legendItems.map((item, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <div 
              className="w-3 h-3 rounded-full border border-white shadow-sm" 
              style={{ backgroundColor: item.color }}
            />
            <span className="text-muted-foreground">{item.label}</span>
          </div>
        ))}
      </div>
      <div className="mt-2 pt-2 border-t space-y-1">
        <div className="flex items-center gap-2 text-xs">
          <div className="w-3 h-3 rounded-full border border-white shadow-sm bg-green-600" />
          <span className="text-muted-foreground">Yerli tür</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <div className="w-3 h-3 rounded-full border border-white shadow-sm bg-red-600" />
          <span className="text-muted-foreground">Egzotik/Tanıtılmış</span>
        </div>
      </div>
    </div>
  );
}

function MapLayerControl({ 
  currentLayer, 
  onLayerChange 
}: { 
  currentLayer: MapLayerType; 
  onLayerChange: (layer: MapLayerType) => void;
}) {
  return (
    <div className="absolute top-4 right-4 z-[1000] bg-background/95 backdrop-blur-sm rounded-lg p-2 shadow-lg border">
      <div className="flex items-center gap-1 mb-2">
        <Layers className="w-3 h-3 text-muted-foreground" />
        <span className="text-xs font-medium">Harita Tipi</span>
      </div>
      <div className="grid grid-cols-2 gap-1">
        {(Object.entries(mapLayers) as [MapLayerType, typeof mapLayers[MapLayerType]][]).map(([key, layer]) => (
          <Button
            key={key}
            variant={currentLayer === key ? "default" : "outline"}
            size="sm"
            className="text-xs h-7 px-2"
            onClick={() => onLayerChange(key)}
            data-testid={`button-layer-${key}`}
          >
            {layer.name}
          </Button>
        ))}
      </div>
    </div>
  );
}

export function BirdDistributionMap({ 
  speciesCode, 
  scientificName, 
  birdName,
  onObservationsLoaded,
  onTimeRangeChange
}: BirdDistributionMapProps) {
  const [observations, setObservations] = useState<Observation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState(3);
  const [mapLayer, setMapLayer] = useState<MapLayerType>('street');
  const [timeMode, setTimeMode] = useState<TimeMode>('recent');
  const [timeRange, setTimeRange] = useState<TimeRange>('30');
  const [startYear, setStartYear] = useState(String(currentYear - 5));
  const [endYear, setEndYear] = useState(String(currentYear));
  const [startMonth, setStartMonth] = useState('1');
  const [endMonth, setEndMonth] = useState('12');
  const mapRef = useRef<L.Map | null>(null);
  
  const getTimeRangeLabel = useCallback(() => {
    if (timeMode === 'recent') {
      return timeRanges[timeRange];
    } else {
      const sMonth = months.find(m => m.value === startMonth)?.label || startMonth;
      const eMonth = months.find(m => m.value === endMonth)?.label || endMonth;
      if (startYear === endYear) {
        return `${startYear} (${sMonth}-${eMonth})`;
      }
      return `${startYear}-${endYear} (${sMonth}-${eMonth})`;
    }
  }, [timeMode, timeRange, startYear, endYear, startMonth, endMonth]);
  
  const fetchObservations = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      let response;
      
      if (timeMode === 'recent') {
        response = await fetch(`/api/ebird/global/${speciesCode}?back=${timeRange}`);
      } else {
        const params = new URLSearchParams({
          startYear,
          endYear,
          startMonth,
          endMonth
        });
        response = await fetch(`/api/ebird/historical/${speciesCode}?${params}`);
      }
      
      if (!response.ok) {
        throw new Error('Gözlem verileri alınamadı');
      }
      
      const data = await response.json();
      setObservations(data.observations || []);
      onObservationsLoaded?.(data.count || 0);
      onTimeRangeChange?.(getTimeRangeLabel());
    } catch (err) {
      console.error('Error fetching observations:', err);
      setError(err instanceof Error ? err.message : 'Bilinmeyen hata');
    } finally {
      setLoading(false);
    }
  }, [speciesCode, timeMode, timeRange, startYear, endYear, startMonth, endMonth, onObservationsLoaded, onTimeRangeChange, getTimeRangeLabel]);
  
  useEffect(() => {
    if (speciesCode) {
      fetchObservations();
    }
  }, [speciesCode, fetchObservations]);
  
  const clusters = clusterObservations(observations, zoomLevel);
  
  const exoticCount = observations.filter(o => o.exoticCategory === 'X' || o.exoticCategory === 'P').length;
  const nativeCount = observations.length - exoticCount;
  
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
  
  const currentLayerConfig = mapLayers[mapLayer];
  
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
        
        <div className="mt-3 space-y-3">
          <Tabs value={timeMode} onValueChange={(v) => setTimeMode(v as TimeMode)} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="recent" className="gap-1" data-testid="tab-recent">
                <Clock className="w-3 h-3" />
                Son Günler
              </TabsTrigger>
              <TabsTrigger value="historical" className="gap-1" data-testid="tab-historical">
                <History className="w-3 h-3" />
                Tarihsel
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
          {timeMode === 'recent' ? (
            <div className="flex items-center gap-2">
              <Select value={timeRange} onValueChange={(v) => setTimeRange(v as TimeRange)}>
                <SelectTrigger className="w-full h-8" data-testid="select-time-range">
                  <Clock className="w-3 h-3 mr-1" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.entries(timeRanges) as [TimeRange, string][]).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <label className="text-xs text-muted-foreground mb-1 block">Başlangıç Yılı</label>
                  <Select value={startYear} onValueChange={setStartYear}>
                    <SelectTrigger className="h-8" data-testid="select-start-year">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="max-h-[200px]">
                      {yearOptions.map(year => (
                        <SelectItem key={year.value} value={year.value}>{year.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1">
                  <label className="text-xs text-muted-foreground mb-1 block">Bitiş Yılı</label>
                  <Select value={endYear} onValueChange={setEndYear}>
                    <SelectTrigger className="h-8" data-testid="select-end-year">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="max-h-[200px]">
                      {yearOptions.map(year => (
                        <SelectItem key={year.value} value={year.value}>{year.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <label className="text-xs text-muted-foreground mb-1 block flex items-center gap-1">
                    <CalendarDays className="w-3 h-3" />
                    Başlangıç Ayı
                  </label>
                  <Select value={startMonth} onValueChange={setStartMonth}>
                    <SelectTrigger className="h-8" data-testid="select-start-month">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {months.map(month => (
                        <SelectItem key={month.value} value={month.value}>{month.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1">
                  <label className="text-xs text-muted-foreground mb-1 block flex items-center gap-1">
                    <CalendarDays className="w-3 h-3" />
                    Bitiş Ayı
                  </label>
                  <Select value={endMonth} onValueChange={setEndMonth}>
                    <SelectTrigger className="h-8" data-testid="select-end-month">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {months.map(month => (
                        <SelectItem key={month.value} value={month.value}>{month.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Button 
                onClick={fetchObservations} 
                className="w-full h-8"
                disabled={loading}
                data-testid="button-apply-filters"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <History className="w-4 h-4 mr-2" />}
                Tarihsel Verileri Getir
              </Button>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-4 mt-3 text-sm">
          <div className="flex items-center gap-1">
            <Leaf className="w-4 h-4 text-green-600" />
            <span className="text-muted-foreground">Yerli: <strong>{nativeCount}</strong></span>
          </div>
          {exoticCount > 0 && (
            <div className="flex items-center gap-1">
              <Globe2 className="w-4 h-4 text-red-600" />
              <span className="text-muted-foreground">Egzotik: <strong>{exoticCount}</strong></span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="h-[500px] w-full rounded-b-lg overflow-hidden relative">
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
              key={mapLayer}
              attribution={currentLayerConfig.attribution}
              url={currentLayerConfig.url}
            />
            
            {mapLayer === 'hybrid' && (
              <TileLayer
                url="https://stamen-tiles.a.ssl.fastly.net/toner-labels/{z}/{x}/{y}.png"
                attribution=""
              />
            )}
            
            <MapController observations={observations} />
            
            {clusters.map((cluster, index) => {
              const isExotic = cluster.center.exoticCategory === 'X' || cluster.center.exoticCategory === 'P';
              return (
                <Marker
                  key={`${cluster.center.locId}-${index}`}
                  position={[cluster.center.lat, cluster.center.lng]}
                  icon={cluster.count > 1 ? createClusterIcon(cluster.count, cluster.hasExotic) : createBirdIcon(isExotic)}
                >
                  <Popup>
                    <div className="min-w-[200px]">
                      <h3 className="font-semibold text-foreground">{cluster.center.comName}</h3>
                      <p className="text-sm italic text-muted-foreground mb-2">{cluster.center.sciName}</p>
                      
                      {cluster.center.exoticCategory && (
                        <Badge variant={cluster.center.exoticCategory === 'X' || cluster.center.exoticCategory === 'P' ? "destructive" : "secondary"} className="mb-2 text-xs">
                          {cluster.center.exoticCategory === 'X' ? 'Egzotik' : 
                           cluster.center.exoticCategory === 'P' ? 'Tanıtılmış' : 'Yerli'}
                        </Badge>
                      )}
                      
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
              );
            })}
          </MapContainer>
          
          <MapLayerControl currentLayer={mapLayer} onLayerChange={setMapLayer} />
          <Legend />
        </div>
        
        {observations.length === 0 && !loading && (
          <div className="p-4 text-center text-muted-foreground">
            <p>
              {timeMode === 'recent' 
                ? `${timeRanges[timeRange]} içinde bu tür için gözlem kaydı bulunamadı.`
                : `${startYear}-${endYear} yılları arasında bu tür için gözlem kaydı bulunamadı.`
              }
            </p>
            <p className="text-sm mt-1">Farklı bir dönem seçmeyi deneyin.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default BirdDistributionMap;
