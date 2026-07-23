/** @format */

import { Search } from "lucide-react";
import { useState, useEffect } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import "./QuickSearchButton.css";
import { isRTL } from "@/config/i18n";

type QuickSearchButtonProps = {
   label?: string;
   ariaLabel?: string;
   onClick?: () => void;
   className?: string;
};

export function QuickSearchButton({
   label,
   ariaLabel,
   onClick,
   className = "",
}: QuickSearchButtonProps) {
   const { t } = useTranslation("common");
   const [isAnimating, setIsAnimating] = useState(false);
   const [isFocused, setIsFocused] = useState(false);

   const displayLabel = label || t("commandPalette.buttonLabel");
   const isRevealed = isAnimating || isFocused;

   const triggerAnimation = () => {
      setIsAnimating(true);
      // Animation duration is 2s (one spin) or we can do 3s to match previous.
      // The CSS spin is 2s. Let's do 2.2s to slightly overshoot one cycle or 4s for two.
      // User requested "fires and finish even if you take your mouse off".
      // Let's set it to 3000ms as before, or 4000ms for 2 full spins.
      setTimeout(() => {
         setIsAnimating(false);
      }, 4000);
   };

   useEffect(() => {
      // Auto trigger every 10 seconds
      const interval = setInterval(() => {
         triggerAnimation();
      }, 8000);

      return () => clearInterval(interval);
   }, []);

   const handleMouseEnter = () => {
      if (!isAnimating) {
         triggerAnimation();
      }
   };

   return (
      <button
         type="button"
         className={`search-button ${className}`.trim()}
         aria-label={ariaLabel || displayLabel}
         onClick={onClick}
         onMouseEnter={handleMouseEnter}
         onFocus={() => setIsFocused(true)}
         onBlur={() => setIsFocused(false)}
         data-reveal={isRevealed}>
         <span className="search-button__content flex! items-center!">
            <Search
               className="search-button__icon"
               size={18}
               aria-hidden="true"
            />
            <span
               className={`search-button__text ${
                  isRTL() ? "relative top-0.5" : ""
               }`}>
               {displayLabel}
            </span>
         </span>

         <span
            className="search-button__border search-button__border--demo"
            aria-hidden="true"
         />
         <span
            className="search-button__border search-button__border--animated"
            aria-hidden="true"
         />
      </button>
   );
}
