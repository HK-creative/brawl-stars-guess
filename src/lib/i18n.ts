
// This is a simple i18n implementation that will be replaced with a proper i18n library later
// For now it supports English and Hebrew as requested

type SupportedLanguages = 'en' | 'he';

type Translations = {
  [key: string]: {
    [key in SupportedLanguages]: string;
  };
};

// This will be expanded with more translations later
const translations: Translations = {
  "app.title": {
    en: "Brawldle",
    he: "בראולדל"
  },
  "home.tagline": {
    en: "The daily Brawl Stars guessing game",
    he: "משחק הניחוש היומי של בראול סטארס"
  },
  "mode.classic": {
    en: "Classic",
    he: "קלאסי"
  },
  "mode.audio": {
    en: "Audio",
    he: "אודיו"
  },
  "mode.voice": {
    en: "Voice",
    he: "קול"
  },
  "mode.gadget": {
    en: "Gadget",
    he: "אביזר"
  },
  "mode.starpower": {
    en: "Star Power",
    he: "כוח כוכב"
  },
  "coming.soon": {
    en: "Coming Soon",
    he: "בקרוב"
  },
  "settings": {
    en: "Settings",
    he: "הגדרות"
  },
  "language": {
    en: "Language",
    he: "שפה"
  },
  "english": {
    en: "English",
    he: "אנגלית"
  },
  "hebrew": {
    en: "Hebrew",
    he: "עברית"
  },
  "mode.classic.description": {
    en: "Guess the brawler by their attributes",
    he: "נחש את הבראולר לפי המאפיינים שלו"
  },
  "mode.audio.description": {
    en: "Guess the brawler by their attack sounds",
    he: "נחש את הבראולר לפי צלילי ההתקפה שלו"
  },
  "mode.voice.description": {
    en: "Guess the brawler by their voice lines",
    he: "נחש את הבראולר לפי קווי הקול שלהם"
  },
  "mode.gadget.description": {
    en: "Guess the gadget and which brawler uses it",
    he: "נחש את האביזר ואיזה בראולר משתמש בו"
  },
  "mode.starpower.description": {
    en: "Guess the star power and which brawler has it",
    he: "נחש את כוח הכוכב ואיזה בראולר יש לו"
  },
  "submit.guess": {
    en: "Submit Guess",
    he: "שלח ניחוש"
  },
};

// Store the current language in localStorage, default to English
const getCurrentLanguage = (): SupportedLanguages => {
  const storedLang = localStorage.getItem('language');
  return (storedLang as SupportedLanguages) || 'en';
};

// Set the language
export const setLanguage = (language: SupportedLanguages): void => {
  localStorage.setItem('language', language);
  document.documentElement.dir = language === 'he' ? 'rtl' : 'ltr';
  document.documentElement.lang = language;
};

// Get a translation by key
export const t = (key: string): string => {
  const lang = getCurrentLanguage();
  return translations[key]?.[lang] || key;
};

// Initialize language
export const initLanguage = (): void => {
  const lang = getCurrentLanguage();
  setLanguage(lang);
};

export const getLanguage = (): SupportedLanguages => getCurrentLanguage();
