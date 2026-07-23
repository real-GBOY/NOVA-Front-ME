const Dot = ({
   className,
   active = false,
   size = 20,
}: {
   className?: string;
   active?: boolean;
   size?: number;
}) => (
   <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      xmlns="http://www.w3.org/2000/svg"
      className={className || (active ? "fill-primary" : "fill-icon-sub")}>
      <circle
         cx="8"
         cy="8"
         r="2.4"
         className={className || (active ? "fill-primary" : "fill-icon-sub")}
      />
   </svg>
);
export default Dot;
