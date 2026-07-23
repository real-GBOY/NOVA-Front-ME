const ArrowLeftDownFill = ({ className, active = false, size = 20, isRTL }: { className?: string; active?: boolean; size?: number; isRTL?: boolean }) => (
<svg
   width={size}
   height={size}
   viewBox="0 0 20 20"
   xmlns="http://www.w3.org/2000/svg"
   className={`${isRTL ? "rotate-180" : ""} ${className || (active ? "fill-primary" : "fill-icon-sub")}`}
>
    <path d="M10.27 10.7875L13.9825 14.5H5.49854V6.016L9.21104 9.7285L13.453 5.48575L14.5143 6.54625L10.27 10.7875Z" className={className || (active ? "fill-primary" : "fill-icon-sub")}/>
   </svg>
);
export default ArrowLeftDownFill;
