/** @format */

const MoreVertical = ({
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
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className || (active ? "fill-primary" : "fill-icon-sub")}>
      <g opacity={0.4}>
         <path
            d="M10.0001 0.625C9.19467 0.625 8.54175 1.27792 8.54175 2.08333C8.54175 2.88875 9.19467 3.54167 10.0001 3.54167C10.8055 3.54167 11.4585 2.88875 11.4585 2.08333C11.4585 1.27792 10.8055 0.625 10.0001 0.625Z"
            className={className || (active ? "fill-primary" : "fill-icon-sub")}
         />
         <path
            d="M10.0001 16.4583C9.19467 16.4583 8.54175 17.1113 8.54175 17.9167C8.54175 18.7221 9.19467 19.375 10.0001 19.375C10.8055 19.375 11.4585 18.7221 11.4585 17.9167C11.4585 17.1113 10.8055 16.4583 10.0001 16.4583Z"
            className={className || (active ? "fill-primary" : "fill-icon-sub")}
         />
      </g>
      <path
         d="M8.54175 9.99999C8.54175 9.19457 9.19467 8.54166 10.0001 8.54166C10.8055 8.54166 11.4585 9.19457 11.4585 9.99999C11.4585 10.8054 10.8056 11.4583 10.0002 11.4583C9.19475 11.4583 8.54175 10.8054 8.54175 9.99999Z"
         className={className || (active ? "fill-primary" : "fill-icon-sub")}
      />
   </svg>
);

export default MoreVertical;
