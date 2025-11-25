import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Mic, Brain, Globe, Languages, Volume2 } from "lucide-react";
import { BirdSearch } from "./BirdSearch";
import { useTranslation } from "@/hooks/useTranslation";
import { TranslationKey } from "@/lib/translations";

interface Feature {
  href: string;
  icon: typeof Brain;
  secondIcon?: typeof Mic;
  titleKey: TranslationKey;
  descKey: TranslationKey;
  testId: string;
  tabParam?: string;
}

const features: Feature[] = [
  {
    href: "/identify",
    icon: Brain,
    secondIcon: Mic,
    titleKey: "featureIdentify",
    descKey: "featureIdentifyDesc",
    testId: "card-feature-identify"
  },
  {
    href: "/kus-dili",
    icon: Languages,
    titleKey: "featureLanguage",
    descKey: "featureLanguageDesc",
    testId: "card-feature-language"
  },
  {
    href: "/kus-dili",
    icon: Volume2,
    titleKey: "featureWhistle",
    descKey: "featureWhistleDesc",
    testId: "card-feature-whistle",
    tabParam: "whistle"
  },
  {
    href: "/distribution",
    icon: Globe,
    titleKey: "featureDistribution",
    descKey: "featureDistributionDesc",
    testId: "card-feature-distribution"
  }
];

export function FeatureCards() {
  const { t } = useTranslation();
  
  return (
    <section className="bg-background py-6">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-stretch gap-4 md:gap-5">
          <div className="flex items-center justify-center md:justify-start shrink-0">
            <BirdSearch />
          </div>
          <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
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
                    <h3 className="font-semibold text-sm leading-tight">{t(feature.titleKey)}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 hidden sm:block">
                      {t(feature.descKey)}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
