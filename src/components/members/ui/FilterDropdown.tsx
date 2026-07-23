/** @format */

import { useEffect, useRef, useState } from "react";
import { ArrowDownSLine } from "@/Icons";
import { useLanguage } from "@/hooks/useLanguage";

export type FilterOption = {
   id: string;
   label: string;
};

type FilterDropdownProps = {
   placeholder: string;
   options: FilterOption[];
   value: string;
   onChange: (id: string) => void;
   className?: string;
};

function FilterDropdown({
   placeholder,
   options,
   value,
   onChange,
   className = "",
}: FilterDropdownProps) {
   const { isRTL } = useLanguage();
   const [isOpen, setIsOpen] = useState(false);
   const dropdownRef = useRef<HTMLDivElement>(null);
   const buttonRef = useRef<HTMLButtonElement>(null);

   const selectedOption = options.find((opt) => opt.id === value);

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

   return (
      <div className={`relative ${className}`}>
         <button
            ref={buttonRef}
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            className={`flex items-center justify-between w-full ps-2 pe-1.5 py-1.5 text-sm border border-border rounded-lg bg-background hover:bg-bg-weak transition-colors cursor-pointer ${
               isOpen ? "ring-2 ring-primary/20 border-primary/50" : ""
            }`}
            aria-expanded={isOpen}>
            <span
               className={
                  selectedOption ? "text-text-strong" : "text-text-sub"
               }>
               {selectedOption?.label || placeholder}
            </span>
            <div
               className={`transition-transform text-text-strong ${
                  isOpen ? "rotate-180" : ""
               }`}>
               <ArrowDownSLine size={20} />
            </div>
         </button>

         {isOpen && (
            <div
               ref={dropdownRef}
               className={`absolute top-full mt-1 w-full rounded-lg border border-border bg-background shadow-lg z-50 ${
                  isRTL ? "right-0" : "end-0"
               }`}>
               <div className="flex flex-col gap-0.5 p-1 max-h-48 overflow-y-auto">
                  {options.map((option) => (
                     <button
                        key={option.id}
                        type="button"
                        onClick={() => {
                           onChange(option.id);
                           setIsOpen(false);
                        }}
                        className={`flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-bg-weak transition-colors text-start w-full cursor-pointer ${
                           value === option.id ? "bg-bg-weak" : ""
                        }`}>
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

export default FilterDropdown;
