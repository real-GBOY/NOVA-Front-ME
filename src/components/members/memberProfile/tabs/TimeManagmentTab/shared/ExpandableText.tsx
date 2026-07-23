/** @format */

import { useState, useRef, useEffect } from "react";
import { useTranslation } from "@/hooks/useTranslation";

interface ExpandableTextProps {
   text: string;
   className?: string;
}

/**
 * Reusable expandable text component
 * Truncates text to one line with "Show more" link
 * Allows expanding to show full text with "Show less" link
 */
function ExpandableText({ text, className = "" }: ExpandableTextProps) {
   const { t } = useTranslation("common");
   const [isExpanded, setIsExpanded] = useState(false);
   const [height, setHeight] = useState<number | "auto">("auto");
   const contentRef = useRef<HTMLDivElement>(null);

   useEffect(() => {
      if (contentRef.current) {
         if (isExpanded) {
            const fullHeight = contentRef.current.scrollHeight;
            setHeight(fullHeight);
         } else {
            setHeight(contentRef.current.scrollHeight);
            setTimeout(() => setHeight(24), 0); // Collapse to line-clamp-1 height
         }
      }
   }, [isExpanded]);

   return (
      <div
         ref={contentRef}
         style={{ height: height === "auto" ? "auto" : `${height}px` }}
         className={`overflow-hidden transition-all duration-250 ease-in-out ${className}`}>
         {isExpanded ? (
            <div>
               <p className="text-sm text-text-strong inline">{text} </p>
               <button
                  onClick={() => setIsExpanded(false)}
                  className="text-xs text-primary hover:text-primary/80 transition-colors underline whitespace-nowrap inline cursor-pointer">
                  {t("expandable.showLess")}
               </button>
            </div>
         ) : (
            <button
               onClick={() => setIsExpanded(true)}
               className="text-sm text-text-strong line-clamp-1 text-start hover:text-primary transition-colors cursor-pointer w-full">
               {text}
            </button>
         )}
      </div>
   );
}

export default ExpandableText;
