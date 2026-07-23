/** @format */

import { ReactNode } from "react";

interface DetailFieldProps {
   label: string;
   children: ReactNode;
   className?: string;
}

function DetailField({ label, children, className = "" }: DetailFieldProps) {
   return (
      <div className={`flex flex-col gap-2 ${className}`}>
         <label className="text-sm leading-5 tracking-[-0.084px] text-text-sub">
            {label}
         </label>
         {children}
      </div>
   );
}

export default DetailField;
