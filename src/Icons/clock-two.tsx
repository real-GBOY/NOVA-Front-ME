const ClockTwo = ({
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
      viewBox="0 0 16 16"
      xmlns="http://www.w3.org/2000/svg"
      className={`${isRTL ? "rotate-180" : ""} ${
         className || (active ? "fill-primary" : "fill-icon-sub")
      }`}>
      <g clipPath="url(#clip0_2123_7497)">
         <path
            opacity="0.4"
            d="M8.00033 0.166687C3.67409 0.166687 0.166992 3.67379 0.166992 8.00002C0.166992 12.3263 3.67409 15.8334 8.00033 15.8334C12.3266 15.8334 15.8337 12.3263 15.8337 8.00002C15.8337 3.67379 12.3266 0.166687 8.00033 0.166687Z"
            className={className || (active ? "fill-primary" : "fill-icon-sub")}
         />
         <path
            d="M8 3.5C8.27614 3.5 8.5 3.72386 8.5 4V7.09788L10.4017 5.90933C10.6358 5.76298 10.9443 5.83417 11.0907 6.06833C11.237 6.3025 11.1658 6.61098 10.9317 6.75733L8.265 8.424C8.11087 8.52033 7.91659 8.52543 7.75762 8.43732C7.59864 8.34921 7.5 8.18176 7.5 8V4C7.5 3.72386 7.72386 3.5 8 3.5Z"
            className={className || (active ? "fill-primary" : "fill-icon-sub")}
         />
      </g>
      <defs>
         <clipPath id="clip0_2123_7497">
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
export default ClockTwo;
