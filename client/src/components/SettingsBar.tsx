import { Moon, Sun, Bird, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function SettingsBar() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [birdLang, setBirdLang] = useState(false);
  const [language, setLanguage] = useState<"tr" | "en">("tr");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    const savedBirdLang = localStorage.getItem("birdLangMode") === "true";
    const savedLanguage = localStorage.getItem("appLanguage") as "tr" | "en" | null;
    
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initialTheme = savedTheme || (prefersDark ? "dark" : "light");
    
    setTheme(initialTheme);
    setBirdLang(savedBirdLang);
    setLanguage(savedLanguage || "tr");
    
    document.documentElement.classList.toggle("dark", initialTheme === "dark");
    document.documentElement.setAttribute("data-bird-lang", savedBirdLang ? "true" : "false");
    document.documentElement.setAttribute("data-language", savedLanguage || "tr");
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  const toggleBirdLang = () => {
    const newBirdLang = !birdLang;
    setBirdLang(newBirdLang);
    localStorage.setItem("birdLangMode", String(newBirdLang));
    document.documentElement.setAttribute("data-bird-lang", String(newBirdLang));
    window.dispatchEvent(new CustomEvent("birdLangChange", { detail: newBirdLang }));
  };

  const toggleLanguage = () => {
    const newLang = language === "tr" ? "en" : "tr";
    setLanguage(newLang);
    localStorage.setItem("appLanguage", newLang);
    document.documentElement.setAttribute("data-language", newLang);
    window.dispatchEvent(new CustomEvent("languageChange", { detail: newLang }));
  };

  return (
    <div className="flex items-center gap-1 bg-background/80 backdrop-blur-sm rounded-lg p-1 border shadow-sm">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={birdLang ? "default" : "ghost"}
            size="icon"
            onClick={toggleBirdLang}
            data-testid="button-bird-lang-toggle"
            aria-label="Kuş dili modu"
            className="h-8 w-8"
          >
            <Bird className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{birdLang ? "Kuş Dili: Açık" : "Kuş Dili: Kapalı"}</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleLanguage}
            data-testid="button-language-toggle"
            aria-label="Dil değiştir"
            className="h-8 w-8"
          >
            <span className="text-xs font-bold">{language.toUpperCase()}</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{language === "tr" ? "Türkçe" : "English"}</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            data-testid="button-theme-toggle"
            aria-label="Tema değiştir"
            className="h-8 w-8"
          >
            {theme === "light" ? (
              <Moon className="h-4 w-4" />
            ) : (
              <Sun className="h-4 w-4" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{theme === "light" ? "Gece Modu" : "Gündüz Modu"}</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
