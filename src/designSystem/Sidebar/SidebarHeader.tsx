/** @format */

import IconContainer from "@/designSystem/IconContainer";
import { useTranslation } from "@/hooks/useTranslation";
import { useLanguage } from "@/hooks/useLanguage";
import { renderColoredText } from "@/utilities/coloredText";


export type IconProps = {
   active?: boolean;
   size?: number;
   isRTL?: boolean;
};

interface SidebarHeaderProps {
   icon?: React.ComponentType<IconProps>;
   title: string;
   subtitle?: string;
   imageSrc?: string;
   imageAlt?: string;
   onIconClick?: () => void;
   onClose?: () => void;
}

function SidebarHeader({
   icon: Icon,
   title,
   subtitle,
   imageSrc,
   imageAlt,
   onIconClick,
   onClose,
}: SidebarHeaderProps) {
   const { t } = useTranslation("common");
   const { isRTL } = useLanguage();
   const displayImageAlt = imageAlt || t("aria.logo");

   return (
      <div className="px-3 md:px-4 xl:px-4 py-2.5 md:py-3 xl:py-3 border-b border-border flex items-center gap-2 md:gap-3 xl:gap-3 min-w-0">
         {Icon && (
            <IconContainer Icon={Icon} onClick={onIconClick} isRTL={isRTL} />
         )}
         {imageSrc && (
            <img src={imageSrc} alt={displayImageAlt} className="w-9 h-9 rounded-full" />
         )}
         {(title || subtitle) && (
            <div className="flex flex-col gap-0.5 min-w-0">
               {title && (
                  <p className="text-lg md:text-xl font-semibold text-text-strong truncate">
                     {renderColoredText(title)}
                  </p>
               )}
               {subtitle && (
                  <p className="text-text-soft text-xs font-normal leading-4">
                     {subtitle}
                  </p>
               )}
            </div>
         )}
         {onClose && (
            <button
               onClick={onClose}
               className="xl:hidden p-1.5 hover:bg-bg-weak rounded-lg transition-colors ml-auto"
               aria-label="Close sidebar">
               <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-text-strong">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
               </svg>
            </button>
         )}
      </div>
   );
}

export default SidebarHeader;
