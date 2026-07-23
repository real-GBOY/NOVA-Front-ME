/** @format */

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// Import translation files
import commonEN from "@/locales/en/common.json";
import commonAR from "@/locales/ar/common.json";
import dashboardEN from "@/locales/en/dashboard.json";
import dashboardAR from "@/locales/ar/dashboard.json";
import settingsEN from "@/locales/en/settings.json";
import settingsAR from "@/locales/ar/settings.json";
import membersEN from "@/locales/en/members.json";
import membersAR from "@/locales/ar/members.json";
import projectsEN from "@/locales/en/projects.json";
import projectsAR from "@/locales/ar/projects.json";
import payrollsEN from "@/locales/en/payrolls.json";
import payrollsAR from "@/locales/ar/payrolls.json";
import reportsEN from "@/locales/en/reports.json";
import reportsAR from "@/locales/ar/reports.json";
import rolesEN from "@/locales/en/roles.json";
import rolesAR from "@/locales/ar/roles.json";
import validationEN from "@/locales/en/validation.json";
import validationAR from "@/locales/ar/validation.json";
import requestsEN from "@/locales/en/requests.json";
import requestsAR from "@/locales/ar/requests.json";
import helpSupportEN from "@/locales/en/helpSupport.json";
import helpSupportAR from "@/locales/ar/helpSupport.json";
import authEN from "@/locales/en/auth.json";
import authAR from "@/locales/ar/auth.json";
import termsAndConditionsEN from "@/locales/en/termsAndConditions.json";
import termsAndConditionsAR from "@/locales/ar/termsAndConditions.json";
import vouchersEN from "@/locales/en/vouchers.json";
import vouchersAR from "@/locales/ar/vouchers.json";

// Supported languages
export const SUPPORTED_LANGUAGES = {
   en: "English",
   ar: "العربية",
} as const;

export type SupportedLanguage = keyof typeof SUPPORTED_LANGUAGES;

// Namespaces for better organization
export const NAMESPACES = {
   COMMON: "common",
   DASHBOARD: "dashboard",
   SETTINGS: "settings",
   MEMBERS: "members",
   PROJECTS: "projects",
   PAYROLLS: "payrolls",
   REPORTS: "reports",
   ROLES: "roles",
   VALIDATION: "validation",
   REQUESTS: "requests",
   HELP_SUPPORT: "helpSupport",
   AUTH: "auth",
   TERMS_AND_CONDITIONS: "termsAndConditions",
   VOUCHERS: "vouchers",
} as const;

export type Namespace = (typeof NAMESPACES)[keyof typeof NAMESPACES];

// Default namespace
export const DEFAULT_NAMESPACE = NAMESPACES.COMMON;

// Translation resources
const resources = {
   en: {
      [NAMESPACES.COMMON]: commonEN,
      [NAMESPACES.DASHBOARD]: dashboardEN,
      [NAMESPACES.SETTINGS]: settingsEN,
      [NAMESPACES.MEMBERS]: membersEN,
      [NAMESPACES.PROJECTS]: projectsEN,
      [NAMESPACES.PAYROLLS]: payrollsEN,
      [NAMESPACES.REPORTS]: reportsEN,
      [NAMESPACES.ROLES]: rolesEN,
      [NAMESPACES.VALIDATION]: validationEN,
      [NAMESPACES.REQUESTS]: requestsEN,
      [NAMESPACES.HELP_SUPPORT]: helpSupportEN,
      [NAMESPACES.AUTH]: authEN,
      [NAMESPACES.TERMS_AND_CONDITIONS]: termsAndConditionsEN,
      [NAMESPACES.VOUCHERS]: vouchersEN,
   },
   ar: {
      [NAMESPACES.COMMON]: commonAR,
      [NAMESPACES.DASHBOARD]: dashboardAR,
      [NAMESPACES.SETTINGS]: settingsAR,
      [NAMESPACES.MEMBERS]: membersAR,
      [NAMESPACES.PROJECTS]: projectsAR,
      [NAMESPACES.PAYROLLS]: payrollsAR,
      [NAMESPACES.REPORTS]: reportsAR,
      [NAMESPACES.ROLES]: rolesAR,
      [NAMESPACES.VALIDATION]: validationAR,
      [NAMESPACES.REQUESTS]: requestsAR,
      [NAMESPACES.HELP_SUPPORT]: helpSupportAR,
      [NAMESPACES.AUTH]: authAR,
      [NAMESPACES.TERMS_AND_CONDITIONS]: termsAndConditionsAR,
      [NAMESPACES.VOUCHERS]: vouchersAR,
   },
} as const;

const SESSION_LANGUAGE_KEY = "amer-session-language";
const DEFAULT_LANGUAGE: SupportedLanguage = "en";

// Language detection options
const detectionOptions = {
   order: ["sessionStorage", "localStorage", "htmlTag"],
   lookupLocalStorage: "i18nextLng",
   lookupSessionStorage: SESSION_LANGUAGE_KEY,
   caches: ["localStorage", "sessionStorage"],
   excludeCacheFor: ["cimode"],
};

// Get initial language from storage or default to English (per session)
const getInitialLanguage = (): SupportedLanguage => {
   const sessionLng = sessionStorage.getItem(
      SESSION_LANGUAGE_KEY
   ) as SupportedLanguage;
   if (sessionLng === "en" || sessionLng === "ar") {
      return sessionLng;
   }

   const stored = localStorage.getItem("i18nextLng") as SupportedLanguage;
   const resolved =
      stored === "en" || stored === "ar" ? stored : DEFAULT_LANGUAGE;
   sessionStorage.setItem(SESSION_LANGUAGE_KEY, resolved);
   return resolved;
};

const initialLanguage = getInitialLanguage();

i18n
   // Detect user language
   .use(LanguageDetector)
   // Pass the i18n instance to react-i18next
   .use(initReactI18next)
   // Initialize i18next
   .init({
      resources,
      lng: initialLanguage, // Set initial language explicitly
      fallbackLng: "en",
      defaultNS: DEFAULT_NAMESPACE,
      ns: Object.values(NAMESPACES),
      debug: import.meta.env.DEV,
      interpolation: {
         escapeValue: false, // React already escapes values
      },
      detection: detectionOptions,
      react: {
         useSuspense: true,
         bindI18n: "languageChanged",
         bindI18nStore: "",
      },
   });

// Set initial HTML attributes
document.documentElement.lang = initialLanguage;
document.documentElement.dir = initialLanguage === "ar" ? "rtl" : "ltr";

// Helper to change language and update HTML attributes
export const changeLanguage = async (lng: SupportedLanguage) => {
   // Set flag in sessionStorage to show loading state
   sessionStorage.setItem("switchingLanguage", lng);
   sessionStorage.setItem(SESSION_LANGUAGE_KEY, lng);

   await i18n.changeLanguage(lng);

   // Update HTML lang attribute
   document.documentElement.lang = lng;

   // Update HTML dir attribute for RTL support
   document.documentElement.dir = lng === "ar" ? "rtl" : "ltr";

   // Store in localStorage
   localStorage.setItem("i18nextLng", lng);
   // Clear the switching flag shortly after change completes to let the loader fade out
   setTimeout(() => {
      sessionStorage.removeItem("switchingLanguage");
   }, 500);
};

// Get current language
export const getCurrentLanguage = (): SupportedLanguage => {
   const lang = i18n.language as SupportedLanguage;
   // Ensure we always return a valid language, default to "en"
   if (lang === "en" || lang === "ar") {
      return lang;
   }
   return "ar";
};

// Check if current language is RTL
export const isRTL = (): boolean => {
   return getCurrentLanguage() === "ar";
};

export default i18n;
