/** @format */

import { InputHTMLAttributes, forwardRef } from "react";

interface RadioProps
   extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "style"> {
   label?: string;
   labelClassName?: string;
}

const Radio = forwardRef<HTMLInputElement, RadioProps>(
   ({ label, labelClassName, id, className, ...props }, ref) => {
      const radioId = id || `radio-${Math.random().toString(36).substr(2, 9)}`;

      return (
         <div className="flex items-center gap-3">
            <input
               ref={ref}
               type="radio"
               id={radioId}
               className={`
                  appearance-none
                  cursor-pointer
                  rounded-full
                  border
                  border-border
                  w-3.5
                  h-3.5
                  bg-background
                  shadow-[0_2px_2px_0_rgba(27,28,29,0.12)]
                  checked:border-primary
                  checked:bg-primary
                  checked:shadow-[inset_0_0_0_2px_var(--color-background)]
                  focus:outline-none
                  transition-all
                  duration-200
                  ${className || ""}
               `}
               {...props}
            />

            {label && (
               <label
                  htmlFor={radioId}
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

Radio.displayName = "Radio";

export default Radio;
