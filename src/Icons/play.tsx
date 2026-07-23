/** @format */

const Play = ({
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
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`${isRTL ? "rotate-180" : ""} ${
      className || (active ? "fill-primary" : "fill-icon-sub")
    }`}
  >
    <path
      d="M7.08707 1.43829C5.14263 0.311847 2.70834 1.71488 2.70834 3.96204V16.035C2.70834 18.2821 5.14262 19.6852 7.08706 18.5587L17.507 12.5223C19.4465 11.3987 19.4465 8.59832 17.5071 7.47475L7.08707 1.43829Z"
      className={className || (active ? "fill-primary" : "fill-icon-sub")}
    />
  </svg>
);

export default Play;
