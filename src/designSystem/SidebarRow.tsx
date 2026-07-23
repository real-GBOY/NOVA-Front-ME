/** @format */

import { motion } from "framer-motion";
import { renderColoredText } from "@/utilities/coloredText";

type SidebarRowProps = {
   Icon: JSX.ElementType;
   Title: string;
   active?: boolean;
   onClick?: () => void;
   disabled?: boolean;
   statusIcon?: JSX.ElementType;
   statusTooltip?: string;
   showBadge?: boolean;
   badgeLabel?: string;
   badgeColorClassName?: string;
};

function SidebarRow({
   Icon,
   Title,
   active,
   onClick,
   disabled,
   statusIcon: StatusIcon,
   statusTooltip,
   showBadge,
   badgeLabel,
   badgeColorClassName,
}: SidebarRowProps) {
   const isTabActive = active
      ? "border border-border font-medium bg-background shadow-subtle"
      : "text-text-sub border border-transparent";
   return (
      <motion.div
         className={`px-2.5 md:px-3 xl:px-3 py-1.5 flex justify-between rounded-lg items-center text-xs md:text-sm xl:text-sm z-10 ${
            disabled
               ? "cursor-not-allowed opacity-60"
               : "cursor-pointer hover:border hover:border-border"
         } ${isTabActive}`}
         onClick={disabled ? undefined : onClick}
         initial={false}
         animate={{
            scale: active ? 1.02 : 1,
         }}
         transition={{
            type: "spring",
            stiffness: 300,
            damping: 30,
         }}>
         <div className="flex gap-2 items-center min-w-0">
            <Icon active={active} size={20} />
            {statusTooltip ? (
               <span className="relative group inline-flex min-w-0">
                  <span className="leading-4 md:leading-5 xl:leading-5 truncate">
                     {active ? renderColoredText(Title) : Title}
                  </span>
                  <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 -translate-x-1/2 whitespace-nowrap rounded-md bg-text-strong px-2 py-1 text-[10px] text-background opacity-0 shadow-subtle transition-opacity group-hover:opacity-100">
                     {statusTooltip}
                  </span>
               </span>
            ) : (
               <p className="leading-4 md:leading-5 xl:leading-5 truncate">
                  {active ? renderColoredText(Title) : Title}
               </p>
            )}
         </div>
         {StatusIcon && !statusTooltip && (
            <span className="ml-2 shrink-0">
               <StatusIcon size={16} />
            </span>
         )}
         {showBadge &&
            (badgeLabel ? (
               <span className="ms-2 inline-flex items-center gap-1 shrink-0">
                  <span
                     className={`inline-flex h-2 w-2 rounded-full ${
                        badgeColorClassName || "bg-primary"
                     }`}
                  />
                  <span className="text-[10px] leading-4 text-text-sub font-medium">
                     {badgeLabel}
                  </span>
               </span>
            ) : (
               <span
                  className={`ms-2 inline-flex h-2 w-2 shrink-0 rounded-full ${
                     badgeColorClassName || "bg-primary"
                  }`}
               />
            ))}
      </motion.div>
   );
}

export default SidebarRow;
