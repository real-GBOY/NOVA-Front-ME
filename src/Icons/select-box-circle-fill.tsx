const SelectBoxCircleFill = ({ className, active = false, size = 20 }: { className?: string; active?: boolean; size?: number }) => (
<svg
   width={size}
   height={size}
   viewBox="0 0 16 16"
   xmlns="http://www.w3.org/2000/svg"
   className={className || (active ? "fill-primary" : "fill-icon-sub")}
>
    <path d="M8 14C4.6862 14 2 11.3138 2 8C2 4.6862 4.6862 2 8 2C11.3138 2 14 4.6862 14 8C14 11.3138 11.3138 14 8 14ZM7.4018 10.4L11.6438 6.1574L10.7954 5.309L7.4018 8.7032L5.7044 7.0058L4.856 7.8542L7.4018 10.4Z" className={className || (active ? "fill-primary" : "fill-icon-sub")}/>
   </svg>
);
export default SelectBoxCircleFill;
