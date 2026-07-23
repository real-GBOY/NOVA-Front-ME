const Eye = ({
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
      <path
         opacity="0.4"
         d="M18.7856 9.00604C15.77 0.609152 4.23019 0.609153 1.21457 9.00604C0.98414 9.64767 0.98414 10.3524 1.21457 10.994C4.23019 19.3909 15.77 19.3909 18.7856 10.994C19.016 10.3524 19.016 9.64767 18.7856 9.00604Z"
         className={className || (active ? "fill-primary" : "fill-icon-sub")}
      />
      <path
         fillRule="evenodd"
         clipRule="evenodd"
         d="M6.45825 10C6.45825 8.04173 8.04161 6.45837 9.99992 6.45837C11.9582 6.45837 13.5416 8.04173 13.5416 10C13.5416 11.9583 11.9582 13.5417 9.99992 13.5417C8.04161 13.5417 6.45825 11.9583 6.45825 10ZM9.99992 7.70837C8.73197 7.70837 7.70825 8.73209 7.70825 10C7.70825 11.268 8.73197 12.2917 9.99992 12.2917C11.2679 12.2917 12.2916 11.268 12.2916 10C12.2916 8.73209 11.2679 7.70837 9.99992 7.70837Z"
         className={className || (active ? "fill-primary" : "fill-icon-sub")}
      />
   </svg>
);
export default Eye;
