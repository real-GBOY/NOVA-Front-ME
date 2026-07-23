/** @format */

const MinusCircle = ({
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
		<g clipPath='url(#clip0_1231_551540)'>
			<path
				opacity='0.4'
				d='M9.99967 0.208313C4.59189 0.208313 0.208008 4.59219 0.208008 9.99998C0.208008 15.4078 4.59189 19.7916 9.99967 19.7916C15.4075 19.7916 19.7913 15.4078 19.7913 9.99998C19.7913 4.59219 15.4075 0.208313 9.99967 0.208313Z'
				className={className || (active ? "fill-primary" : "fill-icon-sub")}
			/>
			<path
				d='M13.9587 10C13.9587 10.3452 13.6788 10.625 13.3337 10.625H6.66699C6.32181 10.625 6.04199 10.3452 6.04199 10C6.04199 9.65482 6.32181 9.375 6.66699 9.375H13.3337C13.6788 9.375 13.9587 9.65482 13.9587 10Z'
				className={className || (active ? "fill-primary" : "fill-icon-sub")}
			/>
		</g>
		<defs>
			<clipPath id='clip0_1231_551540'>
				<rect
					width={size}
					height={size}
					className={className || (active ? "fill-primary" : "fill-icon-sub")}
				/>
			</clipPath>
		</defs>
	</svg>
);
export default MinusCircle;
