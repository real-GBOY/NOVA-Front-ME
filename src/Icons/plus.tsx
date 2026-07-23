/** @format */

const Plus = ({
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
			d='M9.16667 16.6667C9.16667 17.1269 9.53976 17.5 10 17.5C10.4602 17.5 10.8333 17.1269 10.8333 16.6667V10.8333H16.6667C17.1269 10.8333 17.5 10.4602 17.5 10C17.5 9.53976 17.1269 9.16667 16.6667 9.16667H10.8333V3.33333C10.8333 2.87309 10.4602 2.5 10 2.5C9.53976 2.5 9.16667 2.87309 9.16667 3.33333V9.16667H3.33333C2.87309 9.16667 2.5 9.53976 2.5 10C2.5 10.4602 2.87309 10.8333 3.33333 10.8333H9.16667V16.6667Z'
			className={className || (active ? "fill-primary" : "fill-icon-sub")}
		/>
	</svg>
);

export default Plus;
