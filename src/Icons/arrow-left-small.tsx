/** @format */

const ArrowLeftSmall = ({
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
      viewBox="0 0 17 10"
      xmlns="http://www.w3.org/2000/svg"
      className={`${isRTL ? "rotate-180" : ""} ${
         className || (active ? "fill-primary" : "fill-icon-sub")
      }`}>
      <path
         opacity="0.4"
         d="M16.6667 5.00033C16.6667 5.46056 16.2936 5.83366 15.8333 5.83366H1.25001C0.789768 5.83366 0.416672 5.46056 0.416672 5.00033C0.416672 4.54009 0.789768 4.16699 1.25001 4.16699H15.8333C16.2936 4.16699 16.6667 4.54009 16.6667 5.00033Z"
         className={className || (active ? "fill-primary" : "fill-icon-sub")}
      />
      <path
         d="M5.58926 0.244078C5.91469 0.569515 5.91469 1.09715 5.58926 1.42259L2.01184 5L5.58926 8.57741C5.91469 8.90285 5.91469 9.43049 5.58926 9.75592C5.26382 10.0814 4.73618 10.0814 4.41074 9.75592L0.244078 5.58926C-0.0813593 5.26382 -0.0813593 4.73618 0.244078 4.41074L4.41074 0.244078C4.73618 -0.0813593 5.26382 -0.0813593 5.58926 0.244078Z"
         className={className || (active ? "fill-primary" : "fill-icon-sub")}
      />
   </svg>
);
export default ArrowLeftSmall;
