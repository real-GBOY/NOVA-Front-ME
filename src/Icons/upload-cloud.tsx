import React from "react";

const UploadCloud = ({
	size = 24,
	color = "currentColor",
	className,
	...props
}: React.SVGProps<SVGSVGElement> & {
	size?: number | string;
	color?: string;
	className?: string;
}) => (
	<svg
		xmlns='http://www.w3.org/2000/svg'
		width={size}
		height={size}
		viewBox='0 0 24 24'
		fill='none'
		stroke={color}
		strokeWidth='2'
		strokeLinecap='round'
		strokeLinejoin='round'
		className={className}
		{...props}>
		<path d='M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242' />
		<path d='M12 12v9' />
		<path d='m16 16-4-4-4 4' />
	</svg>
);

export default UploadCloud;
