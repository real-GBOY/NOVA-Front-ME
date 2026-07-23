/** @format */

import { InputHTMLAttributes, forwardRef } from "react";

interface CheckboxProps
   extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "style"> {
   label?: string;
   labelClassName?: string;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
   ({ label, labelClassName, id, className, ...props }, ref) => {
      const checkboxId =
         id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;

      return (
         <div className="flex items-center gap-3">
            <input
               ref={ref}
               type="checkbox"
               id={checkboxId}
               className={`
                  appearance-none
                  cursor-pointer
                  rounded-[3px]
                  border
                  border-border
                  min-w-3.5
                  min-h-3.5
                  bg-background
                  shadow-[0_2px_2px_0_rgba(27,28,29,0.12)]
                  checked:border-primary
                  checked:bg-primary
                  checked:shadow-none
                  after:content-['✓']
                  after:text-background
                  after:text-xs
                  after:font-bold
                  after:absolute
                  after:left-1/2
                  after:top-1/2
                  after:-translate-x-1/2
                  after:-translate-y-1/2
                  after:pointer-events-none
                  after:opacity-0
                  checked:after:opacity-100
                  relative
                  inline-block
                  accent-primary
                  transition-all
                  duration-150
                  ${className || ""}
               `}
               {...props}
            />

            {label && (
               <label
                  htmlFor={checkboxId}
                  className={`text-sm text-text-sub cursor-pointer flex-1 ${
                     labelClassName || ""
                  }`}>
                  {label}
               </label>
            )}
         </div>
      );
   }
);

Checkbox.displayName = "Checkbox";

export default Checkbox;
