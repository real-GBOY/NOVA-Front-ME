const ForbidFill = ({
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
      <path
         d="M8 14C4.6862 14 2 11.3138 2 8C2 4.6862 4.6862 2 8 2C11.3138 2 14 4.6862 14 8C14 11.3138 11.3138 14 8 14ZM5.9138 5.0654C5.58604 5.29915 5.29952 5.58587 5.066 5.9138L10.0868 10.9346C10.4148 10.7009 10.7015 10.4142 10.9352 10.0862L5.9138 5.0654Z"
         className={className || (active ? "fill-primary" : "fill-icon-sub")}
      />
   </svg>
);
export default ForbidFill;
