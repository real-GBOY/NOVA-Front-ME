const SubtractLine = ({ className, active = false, size = 20, isRTL }: { className?: string; active?: boolean; size?: number; isRTL?: boolean }) => (
<svg
   width={size}
   height={size}
   viewBox="0 0 20 20"
   xmlns="http://www.w3.org/2000/svg"
   className={`${isRTL ? "rotate-180" : ""} ${className || (active ? "fill-primary" : "fill-icon-sub")}`}
>
    <path d="M4.75 9.25H15.25V10.75H4.75V9.25Z" className={className || (active ? "fill-primary" : "fill-icon-sub")}/>
   </svg>
);
export default SubtractLine;
