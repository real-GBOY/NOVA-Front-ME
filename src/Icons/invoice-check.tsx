/** @format */

const InvoiceCheck = ({
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
		<g clipPath='url(#clip0_1231_551534)'>
			<path
				opacity='0.4'
				d='M9.99967 0.208313C4.59189 0.208313 0.208008 4.59219 0.208008 9.99998C0.208008 15.4078 4.59189 19.7916 9.99967 19.7916C15.4075 19.7916 19.7913 15.4078 19.7913 9.99998C19.7913 4.59219 15.4075 0.208313 9.99967 0.208313Z'
				className={className || (active ? "fill-primary" : "fill-icon-sub")}
			/>
			<path
				d='M14.1919 7.05806C14.436 7.30214 14.436 7.69786 14.1919 7.94194L9.19194 12.9419C8.94786 13.186 8.55214 13.186 8.30806 12.9419L5.80806 10.4419C5.56398 10.1979 5.56398 9.80214 5.80806 9.55806C6.05214 9.31398 6.44786 9.31398 6.69194 9.55806L8.75 11.6161L13.3081 7.05806C13.5521 6.81398 13.9479 6.81398 14.1919 7.05806Z'
				className={className || (active ? "fill-primary" : "fill-icon-sub")}
			/>
		</g>
		<defs>
			<clipPath id='clip0_1231_551534'>
				<rect
					width={size}
					height={size}
					className={className || (active ? "fill-primary" : "fill-icon-sub")}
				/>
			</clipPath>
		</defs>
	</svg>
);
export default InvoiceCheck;
