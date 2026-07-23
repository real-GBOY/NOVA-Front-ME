const LockCircle = ({
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
      <g clipPath="url(#clip0_389_1787)">
         <path
            opacity="0.4"
            d="M7.99984 0.166504C3.67361 0.166504 0.166504 3.67361 0.166504 7.99984C0.166504 12.3261 3.67361 15.8332 7.99984 15.8332C12.3261 15.8332 15.8332 12.3261 15.8332 7.99984C15.8332 3.67361 12.3261 0.166504 7.99984 0.166504Z"
            className={className || (active ? "fill-primary" : "fill-icon-sub")}
         />
         <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M6 5.99984C6 4.93358 6.95242 4.1665 8 4.1665C9.04758 4.1665 10 4.93358 10 5.99984V6.84499C10.5654 6.92586 11 7.41209 11 7.99984V10.4998C11 11.1442 10.4777 11.6665 9.83333 11.6665H6.16667C5.52233 11.6665 5 11.1442 5 10.4998V7.99984C5 7.41209 5.43462 6.92586 6 6.84499L6 5.99984ZM8 5.1665C7.39072 5.1665 7 5.59334 7 5.99984V6.6665H9V5.99984C9 5.59334 8.60928 5.1665 8 5.1665Z"
            className={className || (active ? "fill-primary" : "fill-icon-sub")}
         />
      </g>
      <defs>
         <clipPath id="clip0_389_1787">
            <rect
               width="16"
               height="16"
               className={
                  className || (active ? "fill-primary" : "fill-icon-sub")
               }
            />
         </clipPath>
      </defs>
   </svg>
);
export default LockCircle;
