import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Mic, Brain, Globe, Languages, Volume2 } from "lucide-react";

const features = [
  {
    href: "/identify",
    icon: Brain,
    secondIcon: Mic,
    title: "ML Kuş Sesi Tanımlama",
    description: "Yapay zeka ile kuş seslerini tanımlayın",
    testId: "card-feature-identify"
  },
  {
    href: "/kus-dili",
    icon: Languages,
    title: "Kuş Dili Çevirici",
    description: "Eğlenceli gizli dil oyunu",
    testId: "card-feature-language"
  },
  {
    href: "/kus-dili",
    icon: Volume2,
    title: "Islık Dili",
    description: "UNESCO Kültürel Mirası - Kuşköy",
    testId: "card-feature-whistle",
    tabParam: "whistle"
  },
  {
    href: "/distribution",
    icon: Globe,
    title: "Dünya Dağılım Haritası",
    description: "Küresel kuş gözlem verileri",
    testId: "card-feature-distribution"
  }
];

export function FeatureCards() {
  return (
    <section className="bg-background py-6 px-4 md:px-6">
      <div className="container mx-auto max-w-4xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {features.map((feature) => (
            <Link 
              key={feature.testId} 
              href={feature.tabParam ? `${feature.href}?tab=${feature.tabParam}` : feature.href}
            >
              <Card 
                className="h-full hover-elevate cursor-pointer border-primary/20 hover:border-primary/40 transition-colors"
                data-testid={feature.testId}
              >
                <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                  <div className="flex items-center justify-center gap-1 text-primary">
                    <feature.icon className="w-6 h-6" />
                    {feature.secondIcon && <feature.secondIcon className="w-4 h-4" />}
                  </div>
                  <h3 className="font-semibold text-sm leading-tight">{feature.title}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-2 hidden sm:block">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
