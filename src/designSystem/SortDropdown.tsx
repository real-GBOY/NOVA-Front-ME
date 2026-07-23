/** @format */

import { useEffect, useRef, useState } from "react";
import { ArrowDownSLine } from "@/Icons";
import { useLanguage } from "@/hooks/useLanguage";

export type SortOption<OptionId extends string = string> = {
   id: OptionId;
   label: string;
   description?: string;
};

type SortDropdownProps<OptionId extends string = string> = {
   label: string;
   options: SortOption<OptionId>[];
   onSelect: (id: OptionId) => void;
   className?: string;
   disabled?: boolean;
};

function SortDropdown<OptionId extends string>({
   label,
   options,
   onSelect,
   className = "",
   disabled = false,
}: SortDropdownProps<OptionId>) {
   const { isRTL } = useLanguage();
   const [isOpen, setIsOpen] = useState(false);
   const dropdownRef = useRef<HTMLDivElement>(null);
   const buttonRef = useRef<HTMLButtonElement>(null);

   useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
         if (
            dropdownRef.current &&
            !dropdownRef.current.contains(event.target as Node) &&
            buttonRef.current &&
            !buttonRef.current.contains(event.target as Node)
         ) {
            setIsOpen(false);
         }
      };

      const handleEscape = (event: KeyboardEvent) => {
         if (event.key === "Escape") {
            setIsOpen(false);
         }
      };

      if (isOpen) {
         document.addEventListener("mousedown", handleClickOutside);
         document.addEventListener("keydown", handleEscape);
      }

      return () => {
         document.removeEventListener("mousedown", handleClickOutside);
         document.removeEventListener("keydown", handleEscape);
      };
   }, [isOpen]);

   useEffect(() => {
      if (disabled && isOpen) {
         setIsOpen(false);
      }
   }, [disabled, isOpen]);

   return (
      <div className={`relative w-full ${className}`}>
         <button
            ref={buttonRef}
            onClick={() => {
               if (disabled) return;
               setIsOpen((prev) => !prev);
            }}
            className={`flex items-center justify-between gap-2 ps-2.5 pe-2 py-2 text-sm leading-5 font-medium text-text-sub border border-border rounded-lg bg-background hover:bg-bg-weak transition-colors w-full shadow-subtle ${
               isOpen ? "bg-bg-weak" : ""
            } ${
               disabled
                  ? "cursor-not-allowed opacity-60 hover:bg-background"
                  : ""
            }`}
            disabled={disabled}
            aria-expanded={isOpen}>
            <span className="flex-1 text-left tracking-[-0.084px]">
               {label}
            </span>
            <div
               className={`transition-transform shrink-0 ${
                  isOpen ? "rotate-180" : ""
               }`}>
               <ArrowDownSLine />
            </div>
         </button>

         {isOpen && (
            <div
               ref={dropdownRef}
               className={`absolute top-full mt-2 min-w-[220px] rounded-2xl border border-border bg-background shadow-lg z-50 ${
                  isRTL ? "end-0" : "right-0"
               }`}>
               <div className="flex flex-col gap-1 p-2">
                  {options.map((option) => (
                     <button
                        key={option.id}
                        onClick={() => {
                           onSelect(option.id);
                           setIsOpen(false);
                        }}
                        className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-bg-weak transition-colors text-left w-full">
                        <span className="text-sm font-normal leading-5 text-text-strong">
                           {option.label}
                        </span>
                     </button>
                  ))}
               </div>
            </div>
         )}
      </div>
   );
}
export default SortDropdown;
