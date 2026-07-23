/** @format */

import { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonProps = {
   variant?: "primary" | "secondary" | "danger";
   children: ReactNode;
   isLoading?: boolean;
} & ButtonHTMLAttributes<HTMLButtonElement>;

import Loader2Line from "@/Icons/loader-2-line";

function Button({
   variant = "primary",
   children,
   className = "",
   disabled = false,
   isLoading = false,
   ...props
}: ButtonProps) {
   const baseStyles =
      "px-3 py-2 text-sm leading-5 font-medium rounded-lg transition-colors flex items-center gap-2 cursor-pointer tracking-[-0.084px]";
   const variantStyles =
      variant === "primary"
         ? "text-text-main bg-primary hover:bg-primary/90"
         : variant === "danger"
         ? "bg-danger hover:bg-danger/90 text-white"
         : "text-text-strong bg-background border border-border hover:bg-bg-weak shadow-subtle";

   const disabledStyles = disabled
      ? "!bg-bg-weak !text-text-disabled cursor-not-allowed hover:!bg-bg-weak"
      : "";

   return (
      <button
         type="button"
         className={`${baseStyles} ${variantStyles} ${disabledStyles} ${className}`}
         disabled={disabled}
         {...props}>
         {isLoading ? (
            <Loader2Line size={20} />
         ) : (
            children
         )}
      </button>
   );
}

export default Button;
