export const translations = {
  tr: {
    // Hero
    heroTitle: "A'dan Z'ye Dünya Kuşları",
    heroDescription: "Kuşların izlenimlerini ve dilin izlerini aynı sayfada buluşturur. Her kuş resmi bir kelimeye benzer; anlamı sabit değildir. Renkler ışıkla değişir, kelimelerse bir bakışla.",
    
    // Search
    searchPlaceholder: "Kuş ara...",
    searchNoResults: "ile eşleşen kuş bulunamadı",
    
    // Feature Cards
    featureIdentify: "ML Kuş Sesi Tanımlama",
    featureIdentifyDesc: "Yapay zeka ile kuş seslerini tanımlayın",
    featureLanguage: "Kuş Dili Çevirici",
    featureLanguageDesc: "Eğlenceli gizli dil oyunu",
    featureWhistle: "Islık Dili",
    featureWhistleDesc: "UNESCO Kültürel Mirası - Kuşköy",
    featureDistribution: "Dünya Dağılım Haritası",
    featureDistributionDesc: "Küresel kuş gözlem verileri",
    
    // Settings
    birdLangOn: "Kuş Dili: Açık",
    birdLangOff: "Kuş Dili: Kapalı",
    langTurkish: "Türkçe",
    langEnglish: "English",
    nightMode: "Gece Modu",
    dayMode: "Gündüz Modu",
    
    // Footer
    footerTitle: "A'dan Z'ye Dünya Kuşları",
    footerDescription: "Empresyonist sanat tarzında dünya kuşlarını keşfedin. Her kuşun benzersiz özellikleri ve yaşam alanları hakkında bilgi edinin.",
    footerCopyright: "© 2024 Tüm hakları saklıdır.",
    
    // Bird Details
    scientificName: "Bilimsel Ad",
    region: "Bölge",
    size: "Boyut",
    colors: "Renkler",
    backToHome: "Ana Sayfa",
    listenSound: "Ses Dinle",
    viewDistribution: "Dağılım Haritası",
    
    // Common
    loading: "Yükleniyor...",
    error: "Hata",
    close: "Kapat",
    copy: "Kopyala",
    copied: "Kopyalandı!",
  },
  en: {
    // Hero
    heroTitle: "World Birds from A to Z",
    heroDescription: "Bringing together the impressions of birds and the traces of language on the same page. Each bird painting is like a word; its meaning is not fixed. Colors change with light, words with a glance.",
    
    // Search
    searchPlaceholder: "Search birds...",
    searchNoResults: "No birds found matching",
    
    // Feature Cards
    featureIdentify: "ML Bird Sound ID",
    featureIdentifyDesc: "Identify bird sounds with AI",
    featureLanguage: "Bird Language",
    featureLanguageDesc: "Fun secret language game",
    featureWhistle: "Whistle Language",
    featureWhistleDesc: "UNESCO Heritage - Kuşköy",
    featureDistribution: "World Distribution Map",
    featureDistributionDesc: "Global bird observation data",
    
    // Settings
    birdLangOn: "Bird Lang: On",
    birdLangOff: "Bird Lang: Off",
    langTurkish: "Türkçe",
    langEnglish: "English",
    nightMode: "Night Mode",
    dayMode: "Day Mode",
    
    // Footer
    footerTitle: "World Birds from A to Z",
    footerDescription: "Discover world birds in impressionist art style. Learn about each bird's unique features and habitats.",
    footerCopyright: "© 2024 All rights reserved.",
    
    // Bird Details
    scientificName: "Scientific Name",
    region: "Region",
    size: "Size",
    colors: "Colors",
    backToHome: "Home",
    listenSound: "Listen Sound",
    viewDistribution: "Distribution Map",
    
    // Common
    loading: "Loading...",
    error: "Error",
    close: "Close",
    copy: "Copy",
    copied: "Copied!",
  }
} as const;

export type Language = keyof typeof translations;
export type TranslationKey = keyof typeof translations.tr;
