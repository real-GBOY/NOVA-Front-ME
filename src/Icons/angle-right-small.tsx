/** @format */

const AngleRightSmall = ({
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
		viewBox='0 0 6 10'
		xmlns='http://www.w3.org/2000/svg'
		className={`${isRTL ? "rotate-180" : ""} ${
			className || (active ? "fill-primary" : "fill-icon-sub")
		}`}>
		<path
			opacity='0.4'
			d='M0.244078 0.244078C-0.0813592 0.569515 -0.0813592 1.09715 0.244078 1.42259L3.82149 5L0.244078 8.57741C-0.0813592 8.90285 -0.0813592 9.43048 0.244078 9.75592C0.569514 10.0814 1.09715 10.0814 1.42259 9.75592L5.58926 5.58925C5.91469 5.26382 5.91469 4.73618 5.58926 4.41074L1.42259 0.244078C1.09715 -0.0813592 0.569514 -0.0813592 0.244078 0.244078Z'
			className={className || (active ? "fill-primary" : "fill-icon-sub")}
		/>
	</svg>
);
export default AngleRightSmall;
