/** @format */

import { useRef, useState } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { SUPPORTED_LANGUAGES, type SupportedLanguage } from "@/config/i18n";
import Dropdown from "@/designSystem/Dropdown";

interface LanguageSwitcherProps {
   className?: string;
   showLabel?: boolean;
   variant?: "select" | "toggle" | "buttons" | "dropdown";
}

/**
 * Language Switcher Component
 *
 * @example
 * ```tsx
 * // Select variant (default)
 * <LanguageSwitcher />
 *
 * // Toggle variant (for header/navbar)
 * <LanguageSwitcher variant="toggle" />
 *
 * // Buttons variant (side by side)
 * <LanguageSwitcher variant="buttons" />
 *
 * // With label
 * <LanguageSwitcher showLabel />
 * ```
 */
const LanguageSwitcher = ({
   className = "",
   showLabel = false,
   variant = "select",
}: LanguageSwitcherProps) => {
   const { language, setLanguage, isChanging } = useLanguage();
   const [open, setOpen] = useState(false);
   const anchorRef = useRef<HTMLButtonElement>(null);

   const handleLanguageChange = (lng: SupportedLanguage) => {
      if (lng !== language) {
         setLanguage(lng);
      }
   };

   // Toggle variant - switches between languages
   if (variant === "toggle") {
      return (
         <button
            onClick={() =>
               handleLanguageChange(language === "en" ? "ar" : "en")
            }
            disabled={isChanging}
            className={`flex items-center gap-2 rounded-lg px-3 py-2 transition-colors hover:bg-bg-weak disabled:opacity-50 ${className}`}
            aria-label="Toggle language">
            {isChanging ? (
               <span className="text-text-soft">...</span>
            ) : (
               <>
                  {showLabel && (
                     <span className="text-sm text-text-main">
                        {language === "en" ? "العربية" : "English"}
                     </span>
                  )}
                  <span className="text-sm font-medium text-text-strong">
                     {language === "en" ? "EN" : "AR"}
                  </span>
               </>
            )}
         </button>
      );
   }

   // Buttons variant - shows all languages side by side
   if (variant === "buttons") {
      return (
         <div className={`flex items-center gap-2 ${className}`}>
            {showLabel && (
               <span className="text-sm text-text-soft">Language:</span>
            )}
            <div className="flex gap-1 rounded-lg bg-bg-weak p-1">
               {Object.entries(SUPPORTED_LANGUAGES).map(([code, name]) => (
                  <button
                     key={code}
                     onClick={() =>
                        handleLanguageChange(code as SupportedLanguage)
                     }
                     disabled={isChanging}
                     className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-50 ${
                        language === code
                           ? "bg-background text-text-strong shadow-sm"
                           : "text-text-sub hover:text-text-strong"
                     }`}
                     aria-label={`Switch to ${name}`}>
                     {code.toUpperCase()}
                  </button>
               ))}
            </div>
         </div>
      );
   }

   // Select variant - native select dropdown
   return (
      <div className={`flex items-center gap-2 ${className}`}>
         {showLabel && (
            <span className="text-sm text-text-soft">Language:</span>
         )}
         <button
            ref={anchorRef}
            type="button"
            disabled={isChanging}
            onClick={() => setOpen((prev) => !prev)}
            className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-text-strong shadow-subtle transition hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50">
            <span>{SUPPORTED_LANGUAGES[language]}</span>
            <span className="text-text-soft text-xs">▾</span>
         </button>
         <Dropdown
            items={Object.entries(SUPPORTED_LANGUAGES).map(([code, name]) => ({
               id: code,
               label: name,
               icon: () => null,
               onClick: () => handleLanguageChange(code as SupportedLanguage),
               variant: language === code ? "primary" : "default",
            }))}
            isOpen={open && !isChanging}
            onClose={() => setOpen(false)}
            anchorRef={anchorRef}
            variant="match-width"
            className="bg-background text-text-strong"
         />
      </div>
   );
};

export default LanguageSwitcher;
