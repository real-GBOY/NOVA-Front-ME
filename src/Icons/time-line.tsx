const TimeLine = ({ className, active = false, size = 20, isRTL }: { className?: string; active?: boolean; size?: number; isRTL?: boolean }) => (
<svg
   width={size}
   height={size}
   viewBox="0 0 20 20"
   xmlns="http://www.w3.org/2000/svg"
   className={`${isRTL ? "rotate-180" : ""} ${className || (active ? "fill-primary" : "fill-icon-sub")}`}
>
    <path d="M10 17.5C5.85775 17.5 2.5 14.1422 2.5 10C2.5 5.85775 5.85775 2.5 10 2.5C14.1422 2.5 17.5 5.85775 17.5 10C17.5 14.1422 14.1422 17.5 10 17.5ZM10 16C11.5913 16 13.1174 15.3679 14.2426 14.2426C15.3679 13.1174 16 11.5913 16 10C16 8.4087 15.3679 6.88258 14.2426 5.75736C13.1174 4.63214 11.5913 4 10 4C8.4087 4 6.88258 4.63214 5.75736 5.75736C4.63214 6.88258 4 8.4087 4 10C4 11.5913 4.63214 13.1174 5.75736 14.2426C6.88258 15.3679 8.4087 16 10 16V16ZM10.75 10H13.75V11.5H9.25V6.25H10.75V10Z" className={className || (active ? "fill-primary" : "fill-icon-sub")}/>
   </svg>
);
export default TimeLine;
