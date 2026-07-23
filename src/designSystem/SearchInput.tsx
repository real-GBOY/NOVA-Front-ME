/** @format */

import { Search } from "lucide-react";
import { ComponentType } from "react";

interface SearchInputProps {
   value: string;
   onChange: (value: string) => void;
   placeholder?: string;
   className?: string;
   icon?: ComponentType<{ className?: string; size?: number | string }>;
}

function SearchInput({
   value,
   onChange,
   placeholder = "Search...",
   className = "",
   icon: Icon = Search,
}: SearchInputProps) {
   // Check if className contains a width class, if so don't use flex-1
   const hasWidth = className.includes("w-") || className.includes("width");
   const containerClass = hasWidth
      ? `relative ${className}`
      : `relative flex-1 ${className}`;

   return (
      <div className={containerClass}>
         <Icon className="absolute start-3 top-1/2 -translate-y-1/2 text-text-soft w-4 h-4" />
         <input
            type="text"
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full py-2 ps-9 pe-4 rounded-lg border border-border bg-background text-sm leading-5 tracking-[-0.084px] text-text-sub placeholder:text-text-soft focus:outline-none focus:ring-0 shadow-subtle"
         />
      </div>
   );
}

export default SearchInput;
