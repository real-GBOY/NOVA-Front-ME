/** @format */

import { useEffect, useRef, useState } from "react";
import ArrowDownSLine from "@/Icons/arrow-down-s-line";

export interface SelectOption {
   value: string;
   label: string;
}

interface SelectProps {
   options: SelectOption[];
   value: string;
   onChange: (value: string) => void;
   placeholder?: string;
   className?: string;
   disabled?: boolean;
}

function Select({
   options,
   value,
   onChange,
   placeholder = "Select an option",
   className = "",
   disabled = false,
}: SelectProps) {
   const [isOpen, setIsOpen] = useState(false);
   const containerRef = useRef<HTMLDivElement>(null);

   const selectedOption = options.find((opt) => opt.value === value);

   useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
         if (
            containerRef.current &&
            !containerRef.current.contains(event.target as Node)
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

   const handleSelect = (optionValue: string) => {
      onChange(optionValue);
      setIsOpen(false);
   };

   return (
      <div ref={containerRef} className={`relative ${className}`}>
         <button
            type="button"
            onClick={() => !disabled && setIsOpen(!isOpen)}
            disabled={disabled}
            className={`bg-background border border-border rounded-xl shadow-sm flex items-center justify-between gap-2 px-3 py-2.5 w-full transition-colors ${
               disabled
                  ? "cursor-not-allowed opacity-50"
                  : "hover:border-text-sub cursor-pointer"
            }`}>
            <span
               className={`text-sm ${
                  selectedOption ? "text-text-strong" : "text-text-sub"
               }`}>
               {selectedOption ? selectedOption.label : placeholder}
            </span>
            <span
               className={`inline-flex origin-center ${
                  isOpen ? "rotate-180" : "rotate-0"
               }`}>
               <ArrowDownSLine size={20} className="fill-text-strong" />
            </span>
         </button>

         {isOpen && (
            <div className="absolute top-full mt-1 w-full bg-background border border-border rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto">
               {options.map((option) => (
                  <button
                     key={option.value}
                     type="button"
                     onClick={() => handleSelect(option.value)}
                     className={`w-full px-3 py-2.5 text-left text-sm transition-colors first:rounded-t-xl last:rounded-b-xl ${
                        option.value === value
                           ? "bg-primary/10 text-primary font-medium"
                           : "text-text-strong hover:bg-bg-weak"
                     }`}>
                     {option.label}
                  </button>
               ))}
            </div>
         )}
      </div>
   );
}

export default Select;
