import { useEffect, useRef } from "react";
import { changeLanguage, getCurrentLanguage } from "@/config/i18n";
import { useTranslation } from "@/hooks/useTranslation";
import { UsFlag, ArrowDownSLine } from "@/Icons";

type LanguageSelectorProps = {
   isOpen: boolean;
   onToggle: () => void;
};

function LanguageSelector({ isOpen, onToggle }: LanguageSelectorProps) {
   const languageDropdownRef = useRef<HTMLDivElement>(null);
   const { t } = useTranslation("settings");
   const currentLanguage = getCurrentLanguage();

   useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
         if (
            languageDropdownRef.current &&
            !languageDropdownRef.current.contains(event.target as Node) &&
            isOpen
         ) {
            onToggle();
         }
      };

      if (isOpen) {
         document.addEventListener("mousedown", handleClickOutside);
      }

      return () => {
         document.removeEventListener("mousedown", handleClickOutside);
      };
   }, [isOpen, onToggle]);

   return (
      <div className="flex w-1/2 flex-col gap-1">
         <label className="text-sm font-medium text-text-sub">
            {t("generalSettingsPage.language.label")}
         </label>
         <div ref={languageDropdownRef} className="relative">
            <button
               type="button"
               onClick={onToggle}
               className="flex h-10 w-full items-center gap-2 rounded-[10px] border border-border bg-background px-3 py-2.5 pl-3 transition-colors hover:bg-bg-weak focus:outline-none">
               {currentLanguage === "en" ? (
                  <UsFlag size={20} className="flex-none" />
               ) : (
                  <img
                     src="/icons/uae.png"
                     alt="UAE Flag"
                     className="h-5 w-auto flex-none"
                  />
               )}
               <span className="flex-1 text-left text-sm font-normal leading-5 tracking-[-0.006em] text-text-strong">
                  {currentLanguage === "en"
                     ? t(
                          "generalSettingsPage.language.enUS",
                          "English (United States)"
                       )
                     : t("generalSettingsPage.language.arAE", "Arabic (UAE)")}
               </span>
               <ArrowDownSLine
                  size={20}
                  className={`flex-none text-icon-sub transition-transform ${
                     isOpen ? "rotate-180" : ""
                  }`}
               />
            </button>

            {isOpen && (
               <div className="absolute top-full end-0 z-50 mt-1 min-w-[320px] max-w-[400px] rounded-lg border border-border bg-background p-2 shadow-lg">
                  <button
                     type="button"
                     onClick={() => {
                        changeLanguage("en");
                        onToggle();
                     }}
                     className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                        currentLanguage === "en"
                           ? "bg-primary/10 text-primary"
                           : "text-text-strong hover:bg-bg-weak"
                     }`}>
                     <UsFlag size={20} />
                     <span className="flex-1">
                        {t(
                           "generalSettingsPage.language.enUS",
                           "English (United States)"
                        )}
                     </span>
                  </button>
                  <button
                     type="button"
                     onClick={() => {
                        changeLanguage("ar");
                        onToggle();
                     }}
                     className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                        currentLanguage === "ar"
                           ? "bg-primary/10 text-primary"
                           : "text-text-strong hover:bg-bg-weak"
                     }`}>
                     <img
                        src="/icons/uae.png"
                        alt="UAE Flag"
                        className="h-5 w-auto"
                     />
                     <span className="flex-1">
                        {t("generalSettingsPage.language.arAE", "Arabic (UAE)")}
                     </span>
                  </button>
               </div>
            )}
         </div>
      </div>
   );
}

export default LanguageSelector;
