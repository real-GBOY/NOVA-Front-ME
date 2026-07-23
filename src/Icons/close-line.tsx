const CloseLine = ({ className, active = false, size = 20 }: { className?: string; active?: boolean; size?: number }) => (
<svg
   width={size}
   height={size}
   viewBox="0 0 20 20"
   xmlns="http://www.w3.org/2000/svg"

   className={className || (active ? "fill-primary" : "fill-icon-sub")}>
    <path d="M9.99956 8.93949L13.7121 5.22699L14.7726 6.28749L11.0601 9.99999L14.7726 13.7125L13.7121 14.773L9.99956 11.0605L6.28706 14.773L5.22656 13.7125L8.93906 9.99999L5.22656 6.28749L6.28706 5.22699L9.99956 8.93949Z"  className={className || (active ? "fill-primary" : "fill-icon-sub")}/>
   </svg>
);
export default CloseLine;
