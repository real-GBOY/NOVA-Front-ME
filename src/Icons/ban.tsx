const Ban = ({
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
      className={`${isRTL ? "rotate-180" : ""} ${
         className || (active ? "fill-primary" : "fill-icon-sub")
      }`}>
      <g clipPath="url(#clip0_826_68767)">
         <path
            opacity="0.4"
            fillRule="evenodd"
            clipRule="evenodd"
            d="M20 10C20 4.47715 15.5228 0 10 0C4.47715 0 0 4.47715 0 10C0 15.5228 4.47715 20 10 20C15.5228 20 20 15.5228 20 10ZM10 1.66667C14.6024 1.66667 18.3333 5.39763 18.3333 10C18.3333 14.6024 14.6024 18.3333 10 18.3333C5.39763 18.3333 1.66667 14.6024 1.66667 10C1.66667 5.39763 5.39763 1.66667 10 1.66667Z"
            className={className || (active ? "fill-primary" : "fill-icon-sub")}
         />
         <path
            d="M4.72636 3.54688L16.4528 15.2733C16.1001 15.7042 15.7052 16.0991 15.2743 16.4518L3.54785 4.72539C3.90049 4.29446 4.29544 3.89951 4.72636 3.54688Z"
            className={className || (active ? "fill-primary" : "fill-icon-sub")}
         />
      </g>
      <defs>
         <clipPath id="clip0_826_68767">
            <rect
               width="20"
               height="20"
               className={
                  className || (active ? "fill-primary" : "fill-icon-sub")
               }
            />
         </clipPath>
      </defs>
   </svg>
);
export default Ban;
