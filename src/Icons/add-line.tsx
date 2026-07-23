const AddLine = ({
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
      xmlns="http://www.w3.org/2000/svg"
      className={className || (active ? "fill-primary" : "fill-icon-sub")}>
      <path
         d="M9.25 9.25V4.75H10.75V9.25H15.25V10.75H10.75V15.25H9.25V10.75H4.75V9.25H9.25Z"
         className={className || (active ? "fill-primary" : "fill-icon-sub")}
      />
   </svg>
);
export default AddLine;
