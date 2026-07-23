/** @format */

const Send = ({
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
			opacity='0.4'
			d='M18.8313 4.07511C19.4417 2.27605 17.7238 0.558178 15.9248 1.16862L2.5397 5.71034C1.64415 6.01421 1.04169 6.85483 1.04169 7.80053C1.04169 8.61569 1.49096 9.36449 2.21022 9.74809L7.45473 12.5452L10.2518 17.7897C10.6354 18.5089 11.3842 18.9582 12.1994 18.9582C13.1451 18.9582 13.9857 18.3558 14.2896 17.4602L18.8313 4.07511Z'
			className={className || (active ? "fill-primary" : "fill-icon-sub")}
		/>
		<path
			d='M8.38836 14.2971L12.8025 7.48728C12.9247 7.2987 12.703 7.07691 12.5144 7.19913L5.70392 11.6127L7.45471 12.5465L8.38836 14.2971Z'
			className={className || (active ? "fill-primary" : "fill-icon-sub")}
		/>
	</svg>
);

export default Send;
