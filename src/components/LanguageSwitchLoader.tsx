/** @format */

import { useEffect, useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";

/**
 * Beautiful loading overlay shown during language switching
 */
const LanguageSwitchLoader = () => {
   const { t } = useTranslation("common");
   const [isVisible, setIsVisible] = useState(false);
   const [targetLanguage, setTargetLanguage] = useState<"en" | "ar" | null>(null);

   useEffect(() => {
      // Check if we're switching languages
      const switchingLanguage = sessionStorage.getItem("switchingLanguage");
      
      if (switchingLanguage) {
         setTargetLanguage(switchingLanguage as "en" | "ar");
         setIsVisible(true);
         
         // Remove the flag after a short delay to allow smooth transition
         const timer = setTimeout(() => {
            sessionStorage.removeItem("switchingLanguage");
            setIsVisible(false);
         }, 800); // Show for 800ms for smooth transition

         return () => clearTimeout(timer);
      }
   }, []);

   if (!isVisible || !targetLanguage) return null;

   const isRTL = targetLanguage === "ar";

   return (
      <div
         className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/95 backdrop-blur-sm"
         dir={isRTL ? "rtl" : "ltr"}>
         <div className="flex flex-col items-center gap-6">
            {/* Animated Language Indicator */}
            <div className="relative">
               {/* Outer rotating ring */}
               <div className="relative w-20 h-20">
                  <div className="absolute inset-0 rounded-full border-4 border-primary/20"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin"></div>
                  
                  {/* Inner pulsing circle */}
                  <div className="absolute inset-2 rounded-full bg-primary/10 animate-pulse"></div>
                  
                  {/* Language text in center */}
                  <div className="absolute inset-0 flex items-center justify-center">
                     <span className="text-2xl font-bold text-primary">
                        {targetLanguage.toUpperCase()}
                     </span>
                  </div>
               </div>
            </div>

            {/* Loading text with fade animation */}
            <div className="flex flex-col items-center gap-2 animate-fade-in">
               <p className="text-lg font-medium text-text-strong">
                  {t("common.switchingLanguage") || (isRTL ? "جاري تغيير اللغة..." : "Switching Language...")}
               </p>
               <p className="text-sm text-text-sub">
                  {t("common.pleaseWait") || (isRTL ? "يرجى الانتظار" : "Please wait")}
               </p>
            </div>

            {/* Progress bar */}
            <div className="w-64 h-1 bg-bg-weak rounded-full overflow-hidden">
               <div className="h-full bg-primary rounded-full animate-progress"></div>
            </div>
         </div>
      </div>
   );
};

export default LanguageSwitchLoader;
