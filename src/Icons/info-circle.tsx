/** @format */

const InfoCircle = ({
	className,
	active = false,
	size = 20,
}: {
	className?: string;
	active?: boolean;
	size?: number;
}) => (
	<svg
		width={size}
		height={size}
		viewBox='0 0 16 16'
		xmlns='http://www.w3.org/2000/svg'
		className={className || (active ? "fill-primary" : "fill-icon-sub")}>
		<g clipPath='url(#clip0_292_9389)'>
			<path
				opacity='0.4'
				d='M7.99996 0.166504C3.67373 0.166504 0.166626 3.67361 0.166626 7.99984C0.166626 12.3261 3.67373 15.8332 7.99996 15.8332C12.3262 15.8332 15.8333 12.3261 15.8333 7.99984C15.8333 3.67361 12.3262 0.166504 7.99996 0.166504Z'
				className={className || (active ? "fill-primary" : "fill-icon-sub")}
			/>
			<path
				d='M8 4.3335C7.63181 4.3335 7.33333 4.63197 7.33333 5.00016C7.33333 5.36835 7.63181 5.66683 8 5.66683C8.36819 5.66683 8.66673 5.36835 8.66673 5.00016C8.66673 4.63197 8.36819 4.3335 8 4.3335Z'
				className={className || (active ? "fill-primary" : "fill-icon-sub")}
			/>
			<path
				d='M7 6.8335C6.72386 6.8335 6.5 7.05735 6.5 7.3335C6.5 7.60964 6.72386 7.8335 7 7.8335L7.5 7.8335L7.50001 11.3335C7.50001 11.6096 7.72386 11.8335 8.00001 11.8335C8.27615 11.8335 8.50001 11.6096 8.50001 11.3335L8.5 7.3335C8.5 7.05735 8.27615 6.8335 8 6.8335L7 6.8335Z'
				className={className || (active ? "fill-primary" : "fill-icon-sub")}
			/>
		</g>
		<defs>
			<clipPath id='clip0_292_9389'>
				<rect
					width={size}
					height={size}
					className={className || (active ? "fill-primary" : "fill-icon-sub")}
				/>
			</clipPath>
		</defs>
	</svg>
);
export default InfoCircle;
