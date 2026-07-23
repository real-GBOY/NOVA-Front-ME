/** @format */

import IconButton from "./IconButton";
import { useTheme } from "@/services/contexts/ThemeProvider";

const SunIcon = ({
   size = 20,
   className,
   active = false,
}: {
   size?: number;
   className?: string;
   active?: boolean;
}) => {
   const colorClass = className || (active ? "text-primary" : "text-icon-sub");

   return (
      <svg
         width={size}
         height={size}
         viewBox="0 0 20 20"
         fill="none"
         xmlns="http://www.w3.org/2000/svg"
         className={colorClass}>
         <circle
            cx="10"
            cy="10"
            r="3.25"
            stroke="currentColor"
            strokeWidth="1.5"
         />
         <path
            d="M10 2.25V4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
         />
         <path
            d="M10 16v1.75"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
         />
         <path
            d="M16 10h1.75"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
         />
         <path
            d="M2.25 10H4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
         />
         <path
            d="m14.5967 5.40335 1.2387-1.23867"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
         />
         <path
            d="m4.16455 15.8354 1.23867-1.2387"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
         />
         <path
            d="m14.5967 14.5967 1.2387 1.2387"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
         />
         <path
            d="m4.16455 4.16455 1.23867 1.23867"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
         />
      </svg>
   );
};

const MoonIcon = ({
   size = 20,
   className,
   active = false,
}: {
   size?: number;
   className?: string;
   active?: boolean;
}) => {
   const colorClass = className || (active ? "text-primary" : "text-icon-sub");

   return (
      <svg
         width={size}
         height={size}
         viewBox="0 0 24 24"
         fill="none"
         xmlns="http://www.w3.org/2000/svg"
         className={colorClass}>
         <path
            d="M3.32031 11.6835C3.32031 16.6541 7.34975 20.6835 12.3203 20.6835C16.1075 20.6835 19.3483 18.3443 20.6768 15.032C19.6402 15.4486 18.5059 15.6834 17.3203 15.6834C12.3497 15.6834 8.32031 11.654 8.32031 6.68342C8.32031 5.50338 8.55165 4.36259 8.96453 3.32996C5.65605 4.66028 3.32031 7.89912 3.32031 11.6835Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
         />
      </svg>
   );
};

function ColorModeSwitch() {
   const { IsDark, setTheme } = useTheme();
   const Icon = IsDark ? SunIcon : MoonIcon;

   const handleToggle = () => {
      setTheme(IsDark ? "light" : "dark");
   };

   return (
      <IconButton
         Icon={Icon}
         ariaLabel={IsDark ? "Switch to light mode" : "Switch to dark mode"}
         variant="ghost"
         onClick={handleToggle}
         active={IsDark}
      />
   );
}

export default ColorModeSwitch;
