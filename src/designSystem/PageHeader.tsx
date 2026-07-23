/** @format */

// import LanguageSwitcher from "@/components/LanguageSwitcher";
import { ReactNode } from "react";
import HeaderActions from "./HeaderActions";
import { renderColoredText } from "@/utilities/coloredText";

type PageHeaderProps = {
   title: string | ReactNode;
   subtitle?: string;
   actions?: ReactNode;
};

function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
   return (
      <div className="flex items-center justify-between gap-2 r-px-sm xl:px-6 py-2 md:py-2.5 xl:py-3 min-w-0">
         <div className="space-y-0.5 md:space-y-1 xl:space-y-1 min-w-0">
            {typeof title === "string" ? (
               <h1 className="text-base md:text-xl xl:text-xl leading-5 md:leading-6 font-semibold text-text-strong truncate">
                  {renderColoredText(title)}
               </h1>
            ) : (
               title
            )}
            {subtitle ? (
               <p className="hidden sm:block text-text-soft text-sm font-normal truncate">
                  {subtitle}
               </p>
            ) : null}
         </div>
         {/* <LanguageSwitcher variant='toggle' /> */}
         <div className="flex items-center justify-end shrink-0">
            {actions || <HeaderActions />}
         </div>
      </div>
   );
}

export default PageHeader;
