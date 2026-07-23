const HamburgerMenu = ({
   className,
   size = 20,
}: {
   className?: string;
   size?: number;
}) => (
   <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className || "text-icon-sub"}>
      <path
         d="M2.5 5H17.5"
         stroke="currentColor"
         strokeWidth="1.5"
         strokeLinecap="round"
      />
      <path
         d="M2.5 10H17.5"
         stroke="currentColor"
         strokeWidth="1.5"
         strokeLinecap="round"
      />
      <path
         d="M2.5 15H17.5"
         stroke="currentColor"
         strokeWidth="1.5"
         strokeLinecap="round"
      />
   </svg>
);

export default HamburgerMenu;
