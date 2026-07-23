const UserSimpleAlt = ({ className, active = false, size = 20 }: { className?: string; active?: boolean; size?: number }) => (
<svg
   width={size}
   height={size}
   viewBox="0 0 16 16"
   xmlns="http://www.w3.org/2000/svg"
   className={className || (active ? "fill-primary" : "fill-icon-sub")}
>
    <path opacity="0.4" d="M7.99926 8.8335C5.58271 8.8335 2.96075 10.081 2.23316 12.7098C2.15644 12.987 2.1576 13.2756 2.17985 13.5082C2.26345 14.3822 2.95477 15.0747 3.8288 15.1585C3.91656 15.1669 4.01454 15.1669 4.14163 15.1668H11.8575C11.9846 15.1669 12.0825 15.1669 12.1702 15.1585C13.0444 15.0747 13.7357 14.3822 13.8193 13.5081C13.8416 13.275 13.847 12.9829 13.7613 12.693C13.0389 10.2499 10.7687 8.8335 7.99926 8.8335Z" className={className || (active ? "fill-primary" : "fill-icon-sub")}/>
    <path d="M8 0.833496C6.067 0.833496 4.5 2.4005 4.5 4.3335C4.5 6.26649 6.067 7.8335 8 7.8335C9.933 7.8335 11.5 6.26649 11.5 4.3335C11.5 2.4005 9.933 0.833496 8 0.833496Z" className={className || (active ? "fill-primary" : "fill-icon-sub")}/>
   </svg>
);
export default UserSimpleAlt;
