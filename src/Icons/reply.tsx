/** @format */

const Reply = ({
	className,
	active = false,
	size = 16,
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
		viewBox='0 0 16 16'
		fill='none'
		xmlns='http://www.w3.org/2000/svg'
		className={`${isRTL ? "rotate-180" : ""} ${
			className || (active ? "fill-primary" : "fill-icon-sub")
		}`}>
		<path
			opacity='0.4'
			d='M7.06012 2.49907C7.06012 1.75664 6.1625 1.38484 5.63753 1.90981L1.29582 6.25152C0.905298 6.64204 0.905299 7.27521 1.29582 7.66573L5.63753 12.0074C6.1625 12.5324 7.06012 12.1606 7.06012 11.4182V9.29196H9.96368C10.9043 9.29196 11.6668 10.0545 11.6668 10.9951C11.6669 11.8458 11.4286 12.6795 10.9791 13.4018L10.7172 13.8225C10.6376 13.9504 10.6537 14.1157 10.7564 14.2259C10.8591 14.3361 11.023 14.3637 11.1561 14.2933L12.19 13.7463C13.9188 12.8315 15.0002 11.0359 15.0002 9.08C15.0001 6.61972 13.0057 4.62529 10.5454 4.62529H7.06012V2.49907Z'
			className={className || (active ? "fill-primary" : "fill-icon-sub")}
		/>
	</svg>
);

export default Reply;

