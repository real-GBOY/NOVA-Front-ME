/** @format */

const Duplicate = ({
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
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className || (active ? "fill-primary" : "fill-icon-sub")}>
      <path
         d="M9 6.75H7.75C6.64543 6.75 5.75 7.64543 5.75 8.75V16.25C5.75 17.3546 6.64543 18.25 7.75 18.25H15.25C16.3546 18.25 17.25 17.3546 17.25 16.25V15"
         stroke="currentColor"
         strokeWidth="1.5"
         strokeLinecap="round"
         strokeLinejoin="round"
         className={className || (active ? "fill-primary" : "fill-icon-sub")}
      />
      <rect
         x="9.75"
         y="5.75"
         width="14.5"
         height="14.5"
         rx="1.25"
         stroke="currentColor"
         strokeWidth="1.5"
         className={className || (active ? "fill-primary" : "fill-icon-sub")}
      />
   </svg>
);

export default Duplicate;
