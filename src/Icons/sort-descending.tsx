const SortDescending = ({
   className,
   active = false,
   size = 20,
   isRTL,
}: {
   className?: string;
   active?: boolean;
   size?: number;
   isRTL?: boolean;
}) => (
   <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      xmlns="http://www.w3.org/2000/svg"
      className={`${isRTL ? "rotate-180" : ""}, ${
         className || (active ? "fill-primary" : "fill-icon-sub")
      }`}>
      <g opacity="0.4">
         <path
            d="M1.66668 4.1665C1.20644 4.1665 0.833344 4.5396 0.833344 4.99984C0.833344 5.46007 1.20644 5.83317 1.66668 5.83317H18.3333C18.7936 5.83317 19.1667 5.46007 19.1667 4.99984C19.1667 4.5396 18.7936 4.1665 18.3333 4.1665H1.66668Z"
            className={className || (active ? "fill-primary" : "fill-icon-sub")}
         />
         <path
            d="M7.50001 14.1665C7.03977 14.1665 6.66668 14.5396 6.66668 14.9998C6.66668 15.4601 7.03977 15.8332 7.50001 15.8332H12.5C12.9602 15.8332 13.3333 15.4601 13.3333 14.9998C13.3333 14.5396 12.9602 14.1665 12.5 14.1665H7.50001Z"
            className={className || (active ? "fill-primary" : "fill-icon-sub")}
         />
      </g>
      <path
         d="M3.75 9.99984C3.75 9.5396 4.1231 9.1665 4.58333 9.1665H15.4167C15.8769 9.1665 16.25 9.5396 16.25 9.99984C16.25 10.4601 15.8769 10.8332 15.4167 10.8332H4.58333C4.1231 10.8332 3.75 10.4601 3.75 9.99984Z"
         className={className || (active ? "fill-primary" : "fill-icon-sub")}
      />
   </svg>
);
export default SortDescending;
