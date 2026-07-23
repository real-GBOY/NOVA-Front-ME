/** @format */

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
   changeLanguage,
   getCurrentLanguage,
   isRTL,
   type SupportedLanguage,
} from "@/config/i18n";

/**
 * Custom hook for language switching and RTL support
 *
 * @example
 * ```tsx
 * const { language, setLanguage, isRTL, isChanging } = useLanguage();
 *
 * return (
 *   <button onClick={() => setLanguage("ar")}>
 *     Switch to Arabic
 *   </button>
 * );
 * ```
 */
export const useLanguage = () => {
   const { i18n } = useTranslation();
   const [isChanging, setIsChanging] = useState(false);
   const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>(
      getCurrentLanguage()
   );

   useEffect(() => {
      const handleLanguageChange = () => {
         setCurrentLanguage(getCurrentLanguage());
      };

      i18n.on("languageChanged", handleLanguageChange);

      return () => {
         i18n.off("languageChanged", handleLanguageChange);
      };
   }, [i18n]);

   const setLanguage = async (lng: SupportedLanguage) => {
      try {
         setIsChanging(true);
         await changeLanguage(lng);
      } catch (error) {
         console.error("Failed to change language:", error);
      } finally {
         setIsChanging(false);
      }
   };

   return {
      language: currentLanguage,
      setLanguage,
      isRTL: isRTL(),
      isChanging,
   };
};

export default useLanguage;
