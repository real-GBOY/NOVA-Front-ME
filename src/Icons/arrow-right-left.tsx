const ArrowRightLeft = ({
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
      <g clipPath="url(#clip0_1505_26101)">
         <path
            opacity="0.4"
            d="M6.00593 11.4226C6.33137 11.0972 6.33137 10.5695 6.00593 10.2441C5.6805 9.91864 5.15286 9.91864 4.82742 10.2441L1.07742 13.9941C0.751984 14.3195 0.751984 14.8472 1.07742 15.1726L4.82742 18.9226C5.15286 19.248 5.6805 19.248 6.00593 18.9226C6.33137 18.5972 6.33137 18.0695 6.00593 17.7441L3.67852 15.4167H18.3333C18.7936 15.4167 19.1667 15.0436 19.1667 14.5833C19.1667 14.1231 18.7936 13.75 18.3333 13.75H3.67852L6.00593 11.4226Z"
            className={className || (active ? "fill-primary" : "fill-icon-sub")}
         />
         <path
            d="M13.9941 2.25657C13.6687 1.93114 13.6687 1.4035 13.9941 1.07806C14.3195 0.752625 14.8472 0.752625 15.1726 1.07806L18.9226 4.82806C19.248 5.1535 19.248 5.68114 18.9226 6.00657L15.1726 9.75657C14.8472 10.082 14.3195 10.082 13.9941 9.75657C13.6687 9.43114 13.6687 8.9035 13.9941 8.57806L16.3215 6.25065H1.66668C1.20644 6.25065 0.833344 5.87756 0.833344 5.41732C0.833344 4.95708 1.20644 4.58398 1.66668 4.58398H16.3215L13.9941 2.25657Z"
            className={className || (active ? "fill-primary" : "fill-icon-sub")}
         />
      </g>
      <defs>
         <clipPath id="clip0_1505_26101">
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
export default ArrowRightLeft;
