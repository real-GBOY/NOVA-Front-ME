/** @format */

import { useTranslation } from "@/hooks/useTranslation";

interface BreadcrumbHeaderProps {
   className?: string;
}

function BreadcrumbHeader({ className = "" }: BreadcrumbHeaderProps) {
   const { t } = useTranslation("members");

   return (
      <div className={`space-y-0.5 sm:space-y-1 xl:space-y-1 ${className}`.trim()}>
         <div className="flex flex-wrap items-center r-gap-sm xl:gap-2 font-semibold">
            <span className="text-text-soft text-sm sm:text-base xl:text-xl">
               {t("profile.breadcrumb.members")}
            </span>
            <span className="text-text-soft text-sm sm:text-base xl:text-xl">/</span>
            <span className="text-text-strong text-sm sm:text-base xl:text-xl">
               {t("profile.breadcrumb.memberProfile")}
            </span>
         </div>
      </div>
   );
}

export default BreadcrumbHeader;
