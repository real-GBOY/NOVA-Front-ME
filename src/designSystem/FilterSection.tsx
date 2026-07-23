/** @format */

import { ReactNode } from "react";

type FilterSectionProps = {
   label: string;
   onReset?: () => void;
   resetLabel?: string;
   children: ReactNode;
};

function FilterSection({
   label,
   onReset,
   resetLabel,
   children,
}: FilterSectionProps) {
   return (
      <div className="flex flex-col gap-3">
         <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-text-strong tracking-tight">
               {label}
            </label>
            {onReset && resetLabel && (
               <button
                  onClick={onReset}
                  className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">
                  {resetLabel}
               </button>
            )}
         </div>
         {children}
      </div>
   );
}

export default FilterSection;
