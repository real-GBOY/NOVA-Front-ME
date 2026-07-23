const ExclamationCircle = ({
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
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      className={className || (active ? "fill-primary" : "fill-icon-sub")}>
      <g clipPath="url(#clip0_267_2926)">
         <path
            opacity="0.4"
            d="M12 0.25C5.51065 0.25 0.25 5.51065 0.25 12C0.25 18.4893 5.51065 23.75 12 23.75C18.4893 23.75 23.75 18.4893 23.75 12C23.75 5.51065 18.4893 0.25 12 0.25Z"
         />
         <path d="M11.25 7L11.25 13C11.25 13.4142 11.5858 13.75 12 13.75C12.4142 13.75 12.75 13.4142 12.75 13L12.75 7C12.75 6.58579 12.4142 6.25 12 6.25C11.5858 6.25 11.25 6.58579 11.25 7Z" />
         <path d="M12 15.5C11.4477 15.5 11 15.9477 11 16.5C11 17.0523 11.4477 17.5 12 17.5C12.5523 17.5 13.0001 17.0523 13.0001 16.5C13.0001 15.9477 12.5523 15.5 12 15.5Z" />
      </g>
      <defs>
         <clipPath id="clip0_267_2926">
            <rect
               width={size}
               height={size}
               className={
                  className || (active ? "fill-primary" : "fill-icon-sub")
               }
            />
         </clipPath>
      </defs>
   </svg>
);
export default ExclamationCircle;
