import { useState, useCallback, useEffect } from 'react';
import { Link } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ArrowLeft, ArrowRightLeft, Copy, Check, Bird, Languages, Sparkles, MapPin, Music, BookOpen, Award, Volume2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type TranslationDirection = 'encode' | 'decode';
type ConsonantVariant = 'g' | 'b' | 'c' | 'f' | 'lf';

const VOWELS = 'aeıioöuüAEIİOÖUÜ';

const variantLabels: Record<ConsonantVariant, string> = {
  'g': "'g' Harfi",
  'b': "'b' Harfi",
  'c': "'c' Harfi",
  'f': "'f' Harfi",
  'lf': "'lf' (Hırsız Dili)"
};

function encodeToBirdLanguage(text: string, consonant: ConsonantVariant): string {
  const result: string[] = [];
  
  for (const ch of text) {
    result.push(ch);
    
    if (VOWELS.includes(ch)) {
      if (ch === ch.toUpperCase() && ch !== ch.toLowerCase()) {
        result.push(consonant.toUpperCase() + ch);
      } else {
        result.push(consonant + ch);
      }
    }
  }
  
  return result.join('');
}

function decodeFromBirdLanguage(text: string, consonant: ConsonantVariant): string {
  const result: string[] = [];
  let i = 0;
  const consonantLen = consonant.length;
  
  while (i < text.length) {
    const ch = text[i];
    result.push(ch);
    
    if (VOWELS.includes(ch)) {
      const nextChars = text.slice(i + 1, i + 1 + consonantLen + 1);
      
      if (nextChars.toLowerCase() === (consonant + ch.toLowerCase())) {
        i += consonantLen + 2;
        continue;
      }
    }
    
    i++;
  }
  
  return result.join('');
}

function translateText(
  text: string, 
  direction: TranslationDirection, 
  variant: ConsonantVariant
): string {
  if (!text.trim()) return '';
  
  if (direction === 'encode') {
    return encodeToBirdLanguage(text, variant);
  } else {
    return decodeFromBirdLanguage(text, variant);
  }
}

interface WhistleExample {
  turkish: string;
  whistle: string;
  whistle2?: string;
  note: string;
}

const whistleExamples: {
  greetings: WhistleExample[];
  commands: WhistleExample[];
  sentences: WhistleExample[];
  realWorld: WhistleExample[];
} = {
  greetings: [
    { turkish: "Merhaba!", whistle: "wiii–tüü–fiit!", note: "Selamlaşma" },
    { turkish: "Nasılsın?", whistle: "fiii–tü–wii? (yükselen ton)", note: "Soru" },
    { turkish: "İyiyim.", whistle: "tüü–füü.", note: "Yanıt" },
    { turkish: "Gel buraya!", whistle: "fiii—fii—TÜÜÜ!", note: "Emir, uzayan son hece" },
  ],
  commands: [
    { turkish: "Sağa!", whistle: "tüüt!", note: "Tek atımlı sert komut" },
    { turkish: "Sola!", whistle: "füüt!", note: "Daha kalın frekans" },
    { turkish: "Dur!", whistle: "Tİİİİİ!", note: "Çok keskin, ince ve ani" },
  ],
  sentences: [
    { turkish: "Nasılsın?", whistle: "fii↑—fii↓•tüü↑?", note: "i ünlüsü → ince, yüksek frekans; soru → son hecede yükselme" },
    { turkish: "Ben iyiyim.", whistle: "tii—↓•fii—↑•füü↓.", note: "Düz cevap" },
    { turkish: "Gel buraya!", whistle: "fiii↑—TÜÜÜ↓!", note: "Emir → güçlü uzun düşüş" },
    { turkish: "Oraya gidiyorum.", whistle: "fooo(↓)—•tii↑~tii↓—•fii↓.", note: "'o-' kalın frekans, '-yor' uzayan iniş" },
    { turkish: "Bugün köye iniyorum.", whistle: "fuu(↓↓)—•gii(↑)—•köö(↓~↓)—•nii(↓).", note: "Karmaşık cümle" },
  ],
  realWorld: [
    { 
      turkish: "Aliiii! Neredesin?", 
      whistle: "A-lííííí! → fiüüüü—↑↑—↓!", 
      whistle2: "neree↑—•deeesiiin↓? → tii↑—fiii↓~fii?",
      note: "İki parçalı: (1) İsim çağrısı - ilk sesli harf uzatılır, sonunda keskin iniş; (2) Soru cümlesi" 
    },
    { turkish: "Sürü dağıldı!", whistle: "fööö↓—•tíí↑—•TÜÜÜ↓!", note: "Acil haber - 'dağıldı' kelimesinde iniş-boom yapılır" },
    { turkish: "Çabuk gel!", whistle: "tii↑!—TÜÜÜ↓!", note: "İki parçalı; ikinci hece emir vurgusu" },
    { turkish: "Yarın yağmur var!", whistle: "yaa(↓)~yaa(↑)—•fii↑—•vaa(↓)!", note: "Hava durumu bildirimi" },
    { turkish: "Ben evdeyim!", whistle: "tii↓—•mii↓•e↑~e↑—•dii↓•yii↓", note: "Konum bildirme - birleştirilmiş akış" },
  ],
};

const vowelFrequencies = [
  { vowel: "a", frequency: "Orta", shape: "Düz iniş" },
  { vowel: "e", frequency: "İnce", shape: "Hızlı çıkış" },
  { vowel: "i", frequency: "Çok ince", shape: "Sivri tırmanış" },
  { vowel: "o", frequency: "Kalın", shape: "Geniş yay çizgisi" },
  { vowel: "u", frequency: "Çok kalın", shape: "Derin dalga" },
  { vowel: "ö/ü", frequency: "İnce-kalın geçişli", shape: "Zikzak" },
];

export default function BirdLanguage() {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [direction, setDirection] = useState<TranslationDirection>('encode');
  const [variant, setVariant] = useState<ConsonantVariant>('g');
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  
  useEffect(() => {
    const savedVariant = localStorage.getItem('birdLanguageVariant');
    const savedDirection = localStorage.getItem('birdLanguageDirection');
    
    if (savedVariant && Object.keys(variantLabels).includes(savedVariant)) {
      setVariant(savedVariant as ConsonantVariant);
    }
    if (savedDirection && ['encode', 'decode'].includes(savedDirection)) {
      setDirection(savedDirection as TranslationDirection);
    }
  }, []);
  
  useEffect(() => {
    localStorage.setItem('birdLanguageVariant', variant);
    localStorage.setItem('birdLanguageDirection', direction);
  }, [variant, direction]);
  
  useEffect(() => {
    const result = translateText(inputText, direction, variant);
    setOutputText(result);
  }, [inputText, direction, variant]);
  
  const handleSwapDirection = useCallback(() => {
    setDirection(prev => prev === 'encode' ? 'decode' : 'encode');
    setInputText(outputText);
  }, [outputText]);
  
  const handleCopy = useCallback(async () => {
    if (!outputText) return;
    
    try {
      await navigator.clipboard.writeText(outputText);
      setCopied(true);
      toast({
        title: "Kopyalandı!",
        description: "Çeviri panoya kopyalandı.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: "Hata",
        description: "Kopyalama başarısız oldu.",
        variant: "destructive"
      });
    }
  }, [outputText, toast]);
  
  const exampleTexts = [
    { turkish: "Merhaba", label: "Merhaba" },
    { turkish: "Nasılsın?", label: "Nasılsın?" },
    { turkish: "Seni seviyorum", label: "Seni seviyorum" },
    { turkish: "Kuş dili çok eğlenceli!", label: "Kuş dili..." },
  ];
  
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2" data-testid="link-home">
              <ArrowLeft className="w-4 h-4" />
              Ana Sayfa
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Bird className="w-5 h-5 text-primary" />
            <h1 className="font-serif text-xl font-semibold">Kuş Dili</h1>
          </div>
          <div className="w-24" />
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <Languages className="w-8 h-8 text-primary" />
            <Sparkles className="w-6 h-6 text-yellow-500" />
          </div>
          <h2 className="text-3xl font-serif font-bold mb-2">Kuş Dili ve Islık Dili</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Türkiye'nin iki benzersiz gizli iletişim geleneği: Çocukların eğlenceli kuş dili oyunu 
            ve UNESCO Somut Olmayan Kültürel Miras Listesi'ndeki Kuşköy ıslık dili.
          </p>
        </div>
        
        <Tabs defaultValue="translator" className="mb-8">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="translator" className="gap-2" data-testid="tab-translator">
              <Languages className="w-4 h-4" />
              Kuş Dili Çevirici
            </TabsTrigger>
            <TabsTrigger value="whistle" className="gap-2" data-testid="tab-whistle">
              <Volume2 className="w-4 h-4" />
              Kuşköy Islık Dili
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="translator" className="space-y-6">
            <Card data-testid="card-direction">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <ArrowRightLeft className="w-5 h-5" />
                  Çeviri Yönü
                </CardTitle>
                <CardDescription>
                  Hangi yöne çeviri yapmak istediğinizi seçin
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    variant={direction === 'encode' ? 'default' : 'outline'}
                    className="flex-1 h-12"
                    onClick={() => setDirection('encode')}
                    data-testid="button-direction-encode"
                  >
                    <span className="flex items-center gap-2">
                      Türkçe → Kuş Dili
                    </span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleSwapDirection}
                    className="self-center"
                    data-testid="button-swap-direction"
                  >
                    <ArrowRightLeft className="w-5 h-5" />
                  </Button>
                  <Button
                    variant={direction === 'decode' ? 'default' : 'outline'}
                    className="flex-1 h-12"
                    onClick={() => setDirection('decode')}
                    data-testid="button-direction-decode"
                  >
                    <span className="flex items-center gap-2">
                      Kuş Dili → Türkçe
                    </span>
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card data-testid="card-variant">
              <CardHeader className="pb-4">
                <CardTitle>Varyant Seçimi</CardTitle>
                <CardDescription>
                  Kuş dilinde kullanılacak ünsüz harfi seçin
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={variant}
                  onValueChange={(v) => setVariant(v as ConsonantVariant)}
                  className="grid grid-cols-2 sm:grid-cols-5 gap-2"
                >
                  {(Object.entries(variantLabels) as [ConsonantVariant, string][]).map(([key, label]) => (
                    <div key={key} className="flex items-center space-x-2">
                      <RadioGroupItem value={key} id={`variant-${key}`} data-testid={`radio-variant-${key}`} />
                      <Label htmlFor={`variant-${key}`} className="cursor-pointer text-sm">
                        {label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>
            
            <div className="grid md:grid-cols-2 gap-4">
              <Card data-testid="card-input">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center justify-between">
                    <span>{direction === 'encode' ? 'Türkçe Metin' : 'Kuş Dili Metin'}</span>
                    <Badge variant="secondary" className="font-normal">
                      {inputText.length} karakter
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder={direction === 'encode' 
                      ? "Türkçe metninizi buraya yazın..." 
                      : "Kuş dili metninizi buraya yazın..."
                    }
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    className="min-h-[200px] resize-none"
                    data-testid="textarea-input"
                  />
                  
                  {direction === 'encode' && (
                    <div className="mt-3">
                      <p className="text-xs text-muted-foreground mb-2">Hızlı örnekler:</p>
                      <div className="flex flex-wrap gap-1">
                        {exampleTexts.map((ex, i) => (
                          <Button
                            key={i}
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => setInputText(ex.turkish)}
                            data-testid={`button-example-${i}`}
                          >
                            {ex.label}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card data-testid="card-output">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center justify-between">
                    <span>{direction === 'encode' ? 'Kuş Dili' : 'Türkçe'}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="font-normal">
                        {outputText.length} karakter
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleCopy}
                        disabled={!outputText}
                        data-testid="button-copy"
                      >
                        {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={outputText}
                    readOnly
                    className="min-h-[200px] resize-none bg-muted/50"
                    placeholder="Çeviri burada görünecek..."
                    data-testid="textarea-output"
                  />
                </CardContent>
              </Card>
            </div>
            
            <Card data-testid="card-explanation">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bird className="w-5 h-5" />
                  Kuş Dili Nedir?
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm dark:prose-invert max-w-none">
                <p>
                  <strong>Kuş Dili</strong>, Türkiye'de çocuklar ve gençler arasında popüler olan eğlenceli bir gizli dil oyunudur. 
                  En yaygın varyantında, her ünlü harften (a, e, ı, i, o, ö, u, ü) sonra seçilen bir ünsüz (genellikle 'g') 
                  ve aynı ünlü tekrar eklenir.
                </p>
                <div className="bg-muted/50 rounded-lg p-4 my-4">
                  <p className="font-medium mb-2">Örnek dönüşümler ('g' varyantı):</p>
                  <ul className="space-y-1 text-sm list-none pl-0">
                    <li><code className="bg-muted px-1 rounded">merhaba</code> → <code className="bg-primary/10 text-primary px-1 rounded">megerhagabaga</code></li>
                    <li><code className="bg-muted px-1 rounded">nasılsın</code> → <code className="bg-primary/10 text-primary px-1 rounded">nagasıgılsıgın</code></li>
                    <li><code className="bg-muted px-1 rounded">seni seviyorum</code> → <code className="bg-primary/10 text-primary px-1 rounded">segeniigi segevi iyigorugum</code></li>
                  </ul>
                </div>
                <p>
                  <strong>Hırsız Dili (lf varyantı)</strong> ise benzer bir mantıkla çalışır, 
                  ancak 'lf' harfleri kullanılır ve genellikle daha eski nesiller arasında bilinir.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="whistle" className="space-y-6">
            <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent" data-testid="card-unesco">
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-full bg-primary/10">
                    <Award className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl mb-2">UNESCO Somut Olmayan Kültürel Miras</CardTitle>
                    <CardDescription className="text-base">
                      Kuşköy Islık Dili, 2017 yılında UNESCO Acil Korunması Gereken Somut Olmayan Kültür Mirası Listesi'ne alınmıştır.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
            
            <Card className="border-yellow-500/30 bg-yellow-500/5" data-testid="card-warning">
              <CardContent className="pt-4">
                <p className="text-sm text-muted-foreground">
                  <strong className="text-yellow-600 dark:text-yellow-400">Önemli Uyarı:</strong> Islık dili, konuşulan Türkçeyi birebir seslendirme üzerine kurulu olduğu için 
                  metin ile tam temsil edilemez. Aşağıda verilen örnekler —uzunluk, tonlama, iniş–çıkış çizgileriyle birlikte— 
                  yalnızca <strong>öğretici amaçlıdır</strong>. Yazılı biçim eğitim formatı içindir ve gerçek ıslık seslerini dinleyerek öğrenmek gereklidir.
                </p>
              </CardContent>
            </Card>
            
            <div className="grid md:grid-cols-2 gap-6">
              <Card data-testid="card-location">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Kuşköy Neresi?
                  </CardTitle>
                </CardHeader>
                <CardContent className="prose prose-sm dark:prose-invert">
                  <p>
                    <strong>Kuşköy</strong>, Doğu Karadeniz Bölgesi'nin <strong>Giresun</strong> ilinin 
                    <strong> Çanakçı</strong> ilçesine bağlı bir köydür. Sarp ve engebeli coğrafyada, 
                    evler arasındaki mesafenin 1 kilometreyi bulabildiği bu bölgede, yöre halkı 
                    iletişim için ıslık dilini geliştirmiştir.
                  </p>
                  <p>
                    Yaklaşık <strong>500 yıldan beri</strong> kullanılan bu dil, ilk olarak çobanların 
                    bölgedeki kuş seslerinden esinlenerek ortaya çıkmıştır. Islık sesi 
                    <strong> 5-10 kilometreye</strong> kadar ulaşabilir.
                  </p>
                </CardContent>
              </Card>
              
              <Card data-testid="card-history">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Tarihçe
                  </CardTitle>
                </CardHeader>
                <CardContent className="prose prose-sm dark:prose-invert">
                  <p>
                    Tarihçi <strong>Herodot</strong>, Etiyopya'da yaşayan bir halkın "yarasa" sesini andıran 
                    seslerle haberleştiğini yazmıştır. Bugün Kanarya Adaları'nda da benzer bir dil 600 yıldır kullanılmaktadır.
                  </p>
                  <p>
                    Kuş dili; hastalık, davet, düğün haberleri ve hatta <strong>gizli aşk mesajları</strong> için kullanılmıştır. 
                    Düşman işgalinde bile köylüler bu dili kullanarak haberleşmiş ve mücadele etmişlerdir.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    1997'den beri her yıl <strong>Kuşköy Kuş Dili Festivalleri</strong> düzenlenmektedir.
                  </p>
                </CardContent>
              </Card>
            </div>
            
            <Card data-testid="card-notation">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Music className="w-5 h-5" />
                  Akustik Yapı ve Teknik Bilgiler
                </CardTitle>
                <CardDescription>
                  Islık dilinin üç temel fiziksel parametresi
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-3 gap-4 mb-6">
                  <div className="p-4 rounded-lg bg-muted/50 border">
                    <h4 className="font-semibold mb-2 text-primary">1. Frekans</h4>
                    <p className="text-sm text-muted-foreground">
                      /i/ ve /e/: yüksek frekans (ince ıslık)<br/>
                      /o/ ve /u/: düşük frekans (kalın ıslık)<br/>
                      /a/: orta frekans
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50 border">
                    <h4 className="font-semibold mb-2 text-primary">2. Süre</h4>
                    <p className="text-sm text-muted-foreground">
                      Uzun ıslık: vurgu, ünlem, emir<br/>
                      Kısa darbeler: hece bölme, kelime geçişi
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50 border">
                    <h4 className="font-semibold mb-2 text-primary">3. Yön Değişimi</h4>
                    <p className="text-sm text-muted-foreground">
                      ↓ İnmelik: ses alçalarak<br/>
                      ↑ Çıkmalık: ses yükselerek<br/>
                      ~ Dalgalı: bilgi yoğunluğu
                    </p>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-3 font-semibold">Ünlü</th>
                        <th className="text-left py-2 px-3 font-semibold">Frekans</th>
                        <th className="text-left py-2 px-3 font-semibold">Şekil</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vowelFrequencies.map((v, i) => (
                        <tr key={i} className="border-b last:border-0">
                          <td className="py-2 px-3 font-mono font-bold text-primary">{v.vowel}</td>
                          <td className="py-2 px-3">{v.frequency}</td>
                          <td className="py-2 px-3 text-muted-foreground">{v.shape}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
            
            <Card data-testid="card-examples">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Volume2 className="w-5 h-5" />
                  Islık Dili Örnekleri
                </CardTitle>
                <CardDescription>
                  Yazılı temsiller yalnızca eğitim amaçlıdır. Gerçek ıslık sesleri dinlenerek öğrenilmelidir.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="greetings" data-testid="accordion-greetings">
                    <AccordionTrigger data-testid="accordion-trigger-greetings">Basit Selamlaşmalar</AccordionTrigger>
                    <AccordionContent data-testid="accordion-content-greetings">
                      <div className="space-y-3">
                        {whistleExamples.greetings.map((ex, i) => (
                          <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-2 p-3 rounded-lg bg-muted/30">
                            <div className="flex-1">
                              <span className="font-medium">{ex.turkish}</span>
                            </div>
                            <div className="flex-1 font-mono text-primary text-sm">{ex.whistle}</div>
                            <Badge variant="outline" className="text-xs w-fit">{ex.note}</Badge>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="commands" data-testid="accordion-commands">
                    <AccordionTrigger data-testid="accordion-trigger-commands">Hayvan Yönetimi Komutları</AccordionTrigger>
                    <AccordionContent data-testid="accordion-content-commands">
                      <div className="space-y-3">
                        {whistleExamples.commands.map((ex, i) => (
                          <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-2 p-3 rounded-lg bg-muted/30">
                            <div className="flex-1">
                              <span className="font-medium">{ex.turkish}</span>
                            </div>
                            <div className="flex-1 font-mono text-primary text-sm">{ex.whistle}</div>
                            <Badge variant="outline" className="text-xs w-fit">{ex.note}</Badge>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="sentences" data-testid="accordion-sentences">
                    <AccordionTrigger data-testid="accordion-trigger-sentences">Tonlama ve Yön İşaretli Cümleler</AccordionTrigger>
                    <AccordionContent data-testid="accordion-content-sentences">
                      <div className="mb-4 p-3 rounded-lg bg-primary/5 border border-primary/20">
                        <p className="text-sm text-muted-foreground">
                          <strong>Notasyon:</strong> ↑ yükselme, ↓ düşme, ~ dalgalanma, • hece ayırıcı, — uzama
                        </p>
                      </div>
                      <div className="space-y-3">
                        {whistleExamples.sentences.map((ex, i) => (
                          <div key={i} className="p-3 rounded-lg bg-muted/30">
                            <div className="flex flex-col sm:flex-row sm:items-start gap-2 mb-2">
                              <span className="font-medium flex-shrink-0">{ex.turkish}</span>
                              <span className="font-mono text-primary text-sm break-all">{ex.whistle}</span>
                            </div>
                            <p className="text-xs text-muted-foreground">{ex.note}</p>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="realworld" data-testid="accordion-realworld">
                    <AccordionTrigger data-testid="accordion-trigger-realworld">Günlük Kullanım ve Uzaktan Haberleşme</AccordionTrigger>
                    <AccordionContent data-testid="accordion-content-realworld">
                      <div className="mb-4 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                        <p className="text-sm">
                          Kuşköy'de yüksek mesafe haberleşmesinde cümleler sadeleştirilir. 
                          Aşağıdaki örnekler gerçek kullanıma yakın notasyonlardır.
                        </p>
                      </div>
                      <div className="mb-4 p-3 rounded-lg bg-primary/5 border border-primary/20">
                        <p className="text-sm text-muted-foreground">
                          <strong>Notasyon Anahtarı:</strong> ↑ yükselme, ↓ düşme, ~ dalgalanma, • hece ayırıcı, — uzama, () frekans bilgisi
                        </p>
                      </div>
                      <div className="space-y-3">
                        {whistleExamples.realWorld.map((ex, i) => (
                          <div key={i} className="p-3 rounded-lg bg-muted/30" data-testid={`whistle-example-realworld-${i}`}>
                            <div className="flex flex-col gap-2 mb-2">
                              <span className="font-medium" data-testid={`whistle-turkish-${i}`}>{ex.turkish}</span>
                              <div className="space-y-1">
                                <span className="font-mono text-primary text-sm block" data-testid={`whistle-notation-${i}`}>{ex.whistle}</span>
                                {ex.whistle2 && (
                                  <span className="font-mono text-primary text-sm block" data-testid={`whistle-notation2-${i}`}>{ex.whistle2}</span>
                                )}
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground" data-testid={`whistle-note-${i}`}>{ex.note}</p>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="levels" data-testid="accordion-levels">
                    <AccordionTrigger data-testid="accordion-trigger-levels">Üç Seviyede Islıklaştırma Örneği</AccordionTrigger>
                    <AccordionContent data-testid="accordion-content-levels">
                      <div className="mb-4">
                        <p className="font-medium mb-2">Cümle: "Şimdi geliyorum!"</p>
                      </div>
                      <div className="space-y-4">
                        <div className="p-4 rounded-lg border bg-green-500/5 border-green-500/20">
                          <h5 className="font-semibold text-green-700 dark:text-green-400 mb-2">A) Başlangıç Seviyesi</h5>
                          <p className="font-mono text-sm">fii—↑•tii—↓•gii—↑!</p>
                          <p className="text-xs text-muted-foreground mt-1">Basit notasyon</p>
                        </div>
                        <div className="p-4 rounded-lg border bg-yellow-500/5 border-yellow-500/20">
                          <h5 className="font-semibold text-yellow-700 dark:text-yellow-400 mb-2">B) Orta Seviye</h5>
                          <p className="font-mono text-sm">fíí↑•fii↓•tii•gè↑—lì↓—yò~↑—rùm↓!</p>
                          <p className="text-xs text-muted-foreground mt-1">Ünlü-ton ayrımı ile</p>
                        </div>
                        <div className="p-4 rounded-lg border bg-red-500/5 border-red-500/20">
                          <h5 className="font-semibold text-red-700 dark:text-red-400 mb-2">C) Uzman Seviye (Kuşköy akustik tarifi)</h5>
                          <p className="font-mono text-sm">fíí↑—fii↓•tii•gè↑—lì↓—yò~~↑↓—RÙÙM↓!</p>
                          <div className="text-xs text-muted-foreground mt-2 space-y-1">
                            <p>• i/ş → yüksek ince çıkış</p>
                            <p>• -yor → uzun dalga sonrası keskin iniş</p>
                            <p>• emir/duyuru → finalde sert "düşüş"</p>
                          </div>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
            
            <Card data-testid="card-consonants">
              <CardHeader>
                <CardTitle>Ünsüzlerin Temsili</CardTitle>
                <CardDescription>Ünsüzler doğrudan duyulmaz; hece giriş/çıkış hızları ile temsil edilir</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-lg bg-muted/50 text-center">
                    <span className="font-mono font-bold text-lg">k/g</span>
                    <p className="text-xs text-muted-foreground mt-1">Ani kesiş</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50 text-center">
                    <span className="font-mono font-bold text-lg">t/d</span>
                    <p className="text-xs text-muted-foreground mt-1">Kısa çarpma</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50 text-center">
                    <span className="font-mono font-bold text-lg">s/ş</span>
                    <p className="text-xs text-muted-foreground mt-1">Titreşimli dalga</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50 text-center">
                    <span className="font-mono font-bold text-lg">m/n</span>
                    <p className="text-xs text-muted-foreground mt-1">Yumuşak iniş</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-muted/30" data-testid="card-facts">
              <CardHeader>
                <CardTitle className="text-base">Ilginç Bilgiler</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm dark:prose-invert">
                <ul className="space-y-2 list-none pl-0">
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    Islık dili öğreniminde beynin <strong>hem sağ hem sol lobu</strong> eşit şekilde kullanılır (normal dil öğreniminde sadece sol lob aktiftir).
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    Dünya'da <strong>60'a yakın</strong> benzer ıslık dili bulunmaktadır: Fransa, İspanya, Çin ve Meksika'da da kullanılmaktadır.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    Giresun Üniversitesi'nde <strong>seçmeli ders</strong> olarak okutulmaktadır.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    Islık sesi <strong>1000-4000 Hz</strong> frekans değerinde olup, uygun koşullarda <strong>10 km</strong>'ye kadar duyulabilir.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    Hayvanlar da bu dili öğrenebilir: koyunlar ıslıkla güdülür, köpeklere ıslık dili ile komut verilir.
                  </li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
