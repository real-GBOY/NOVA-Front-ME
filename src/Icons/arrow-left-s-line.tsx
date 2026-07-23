const ArrowLeftSLine = ({
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
      <path
         d="M9.68689 4.31311C9.88215 4.50838 9.88215 4.82496 9.68689 5.02022L6.70711 8L9.68689 10.9798C9.88215 11.175 9.88215 11.4916 9.68689 11.6869C9.49162 11.8821 9.17504 11.8821 8.97978 11.6869L5.64645 8.35355C5.45118 8.15829 5.45118 7.84171 5.64645 7.64645L8.97978 4.31311C9.17504 4.11785 9.49162 4.11785 9.68689 4.31311Z"
         className={className || (active ? "fill-primary" : "fill-icon-sub")}
      />
   </svg>
);
export default ArrowLeftSLine;
