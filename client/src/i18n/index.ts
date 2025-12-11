import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import enCommon from "./locales/en/common.json";
import enAuth from "./locales/en/auth.json";
import fiCommon from "./locales/fi/common.json";
import fiAuth from "./locales/fi/auth.json";

const resources = {
  en: {
    common: enCommon,
    auth: enAuth,
  },
  fi: {
    common: fiCommon,
    auth: fiAuth,
  },
} as const;

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "en",              // oletuskieli
    fallbackLng: "en",      // jos käännös puuttuu
    ns: ["common", "auth"],
    defaultNS: "common",
    interpolation: {
      escapeValue: false,   // React hoitaa XSS-suojauksen
    },
  });

export default i18n;
