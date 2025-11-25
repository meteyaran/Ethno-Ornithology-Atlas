import { useState, useEffect, useCallback } from "react";
import { translations, Language, TranslationKey } from "@/lib/translations";

export function useTranslation() {
  const [language, setLanguage] = useState<Language>("tr");

  useEffect(() => {
    const savedLang = localStorage.getItem("appLanguage") as Language | null;
    if (savedLang && (savedLang === "tr" || savedLang === "en")) {
      setLanguage(savedLang);
    }

    const handleLanguageChange = (e: CustomEvent<Language>) => {
      setLanguage(e.detail);
    };

    window.addEventListener("languageChange", handleLanguageChange as EventListener);
    return () => {
      window.removeEventListener("languageChange", handleLanguageChange as EventListener);
    };
  }, []);

  const t = useCallback((key: TranslationKey): string => {
    return translations[language][key] || translations.tr[key] || key;
  }, [language]);

  return { t, language };
}
