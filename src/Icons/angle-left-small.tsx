/** @format */

const AngleLeftSmall = ({
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
			d='M5.58926 0.244078C5.91469 0.569515 5.91469 1.09715 5.58926 1.42259L2.01184 5L5.58926 8.57741C5.91469 8.90285 5.91469 9.43048 5.58926 9.75592C5.26382 10.0814 4.73618 10.0814 4.41074 9.75592L0.244078 5.58925C-0.0813592 5.26382 -0.0813592 4.73618 0.244078 4.41074L4.41074 0.244078C4.73618 -0.0813592 5.26382 -0.0813592 5.58926 0.244078Z'
			className={className || (active ? "fill-primary" : "fill-icon-sub")}
		/>
	</svg>
);
export default AngleLeftSmall;
