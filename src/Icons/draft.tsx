/** @format */

const Draft = ({
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
		viewBox='0 0 20 20'
		fill='none'
		xmlns='http://www.w3.org/2000/svg'
		className={`${isRTL ? "rotate-180" : ""} ${
			className || (active ? "fill-primary" : "fill-icon-sub")
		}`}>
		<path
			d='M10 20C4.477 20 0 15.523 0 10C0 4.477 4.477 0 10 0C15.523 0 20 4.477 20 10C20 15.523 15.523 20 10 20ZM6.523 5.109C5.97673 5.49858 5.49919 5.97646 5.11 6.523L13.478 14.891C14.0246 14.5015 14.5025 14.0236 14.892 13.477L6.523 5.109Z'
			className={className || (active ? "fill-primary" : "fill-icon-sub")}
		/>
	</svg>
);
export default Draft;
