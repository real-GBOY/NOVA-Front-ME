/** @format */

interface PauseProps {
	size?: number;
	className?: string;
}

function Pause({ size = 24, className = "" }: PauseProps) {
	return (
		<svg
			xmlns='http://www.w3.org/2000/svg'
			viewBox='0 0 24 24'
			width={size}
			height={size}
			className={className}
			fill='currentColor'>
			<path d='M6 5h4v14H6V5zm8 0h4v14h-4V5z' />
		</svg>
	);
}

export default Pause;
