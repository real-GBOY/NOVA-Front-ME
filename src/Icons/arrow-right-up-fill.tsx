const ArrowRightUpFill = ({ className, active = false, size = 20, isRTL }: { className?: string; active?: boolean; size?: number; isRTL?: boolean }) => (
<svg
   width={size}
   height={size}
   viewBox="0 0 20 20"
   xmlns="http://www.w3.org/2000/svg"
   className={`${isRTL ? "rotate-180" : ""} ${className || (active ? "fill-primary" : "fill-icon-sub")}`}
>
    <path d="M10.7875 10.27L6.54549 14.5135L5.48499 13.4522L9.72774 9.21024L6.01524 5.49774H14.5V13.9825L10.7875 10.27Z" className={className || (active ? "fill-primary" : "fill-icon-sub")}/>
   </svg>
);
export default ArrowRightUpFill;
