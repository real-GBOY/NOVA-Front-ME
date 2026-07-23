const ArrowDownSLine = ({ className, active = false, size = 20, isRTL = false }: { className?: string; active?: boolean; size?: number; isRTL?: boolean }) => (
<svg
   width={size}
   height={size}
   viewBox="0 0 20 20"
   xmlns="http://www.w3.org/2000/svg"
   className={`${className || (active ? "fill-primary" : "fill-icon-sub")} ${isRTL ? "rotate-180" : ""}`}
>
    <path d="M9.99999 10.879L13.7125 7.1665L14.773 8.227L9.99999 13L5.22699 8.227L6.28749 7.1665L9.99999 10.879Z" />
   </svg>
);
export default ArrowDownSLine;
