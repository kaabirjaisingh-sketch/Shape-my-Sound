import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "../locales/en.json";
import hi from "../locales/hi.json";
import mr from "../locales/mr.json";

export const SUPPORTED_LANGUAGES = [
  { code: "en", label: "EN" },
  { code: "hi", label: "हिंदी" },
  { code: "mr", label: "मराठी" },
] as const;

export type LanguageCode = (typeof SUPPORTED_LANGUAGES)[number]["code"];

const STORAGE_KEY = "shape-my-sound-language";

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    resources: {
      en: { translation: en },
      hi: { translation: hi },
      mr: { translation: mr },
    },
    lng: "en",
    fallbackLng: "en",
    interpolation: { escapeValue: false },
  });
}

export function loadStoredLanguage() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && stored !== i18n.language) void i18n.changeLanguage(stored);
  } catch {
    // localStorage unavailable — fall back to default language.
  }
}

export function setLanguage(code: LanguageCode) {
  void i18n.changeLanguage(code);
  try {
    localStorage.setItem(STORAGE_KEY, code);
  } catch {
    // localStorage unavailable — language still switches for this session.
  }
}

export default i18n;
