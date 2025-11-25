import { useState, useCallback, useEffect } from 'react';
import { Link } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ArrowRightLeft, Copy, Check, Bird, Languages, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type TranslationDirection = 'encode' | 'decode';
type ConsonantVariant = 'g' | 'b' | 'c' | 'f' | 'lf';

const VOWELS = 'aeıioöuüAEIİOÖUÜ';
const VOWELS_LOWER = 'aeıioöuü';

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
      const expectedConsonant = ch === ch.toUpperCase() && ch !== ch.toLowerCase() 
        ? consonant.toUpperCase() 
        : consonant;
      
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
            <h1 className="font-serif text-xl font-semibold">Kuş Dili Çeviricisi</h1>
          </div>
          <div className="w-24" />
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <Languages className="w-8 h-8 text-primary" />
            <Sparkles className="w-6 h-6 text-yellow-500" />
          </div>
          <h2 className="text-3xl font-serif font-bold mb-2">Kuş Dili Çeviricisi</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Türkçe metinleri gizli kuş diline çevirin veya kuş dilindeki metinleri Türkçe'ye geri çevirin.
            Farklı varyantlar arasından seçim yapabilirsiniz.
          </p>
        </div>
        
        <Card className="mb-6">
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
        
        <Card className="mb-6">
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
        
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <Card>
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
          
          <Card>
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
                    className="h-7 w-7"
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
        
        <Card>
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
              <ul className="space-y-1 text-sm">
                <li><code>merhaba</code> → <code>megerhagabaga</code></li>
                <li><code>nasılsın</code> → <code>nagasıgılsıgın</code></li>
                <li><code>kuş dili</code> → <code>kugş digiliigi</code></li>
              </ul>
            </div>
            <p>
              <strong>Hırsız Dili (lf varyantı)</strong> ise benzer bir mantıkla çalışır, 
              ancak 'lf' harfleri kullanılır ve genellikle daha eski nesiller arasında bilinir.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
