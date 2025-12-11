import { useCallback } from "react";
import i18n from "../i18n";

const STORAGE_KEY = "app_language";

export function useLanguage() {
  const current = i18n.language;

  const setLanguage = useCallback((lng: "fi" | "en") => {
    i18n.changeLanguage(lng);
    window.localStorage.setItem(STORAGE_KEY, lng);
  }, []);

  return { language: current, setLanguage };
}
