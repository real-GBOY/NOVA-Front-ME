/** @format */

import { ButtonHTMLAttributes, ComponentType, forwardRef } from "react";
import IconContainer from "./IconContainer";

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
   Icon: ComponentType<{ active?: boolean; size?: number }>;
   ariaLabel: string;
   variant?: "default" | "ghost";
   active?: boolean;
};

const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
   {
      Icon,
      ariaLabel,
      variant = "default",
      className = "",
      active = false,
      ...rest
   },
   ref
) {
   const baseStyles =
      "w-10 h-10 md:w-11 md:h-11 xl:w-11 xl:h-11 rounded-xl border border-border flex items-center justify-center transition-colors";
   const variantStyles =
      variant === "ghost"
         ? "bg-transparent hover:bg-bg-weak"
         : "bg-background hover:bg-bg-weak";

   return (
      <button
         type="button"
         ref={ref}
         aria-label={ariaLabel}
         className={`${baseStyles} ${variantStyles} ${className}`.trim()}
         {...rest}>
         <IconContainer
            Icon={() => <Icon size={20} active={active} />}
            className="border-0! bg-transparent! shadow-none! p-0!"
         />
      </button>
   );
});

export default IconButton;
