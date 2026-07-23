const FileSearchIcon = ({
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
		viewBox="0 0 24 24"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
		className={className || (active ? "fill-primary" : "fill-icon-sub")}
	>
		<path
			opacity="0.4"
			d="M14 2H6C4.9 2 4.01 2.9 4.01 4L4 20C4 21.1 4.89 22 5.99 22H18C19.1 22 20 21.1 20 20V8L14 2Z"
			className={className || (active ? "fill-primary" : "fill-icon-sub")}
		/>
		<path
			d="M14 2V8H20L14 2Z"
			className={className || (active ? "fill-primary" : "fill-icon-sub")}
		/>
		<path
			d="M12.5 17.5C13.33 17.5 14 16.83 14 16C14 15.17 13.33 14.5 12.5 14.5C11.67 14.5 11 15.17 11 16C11 16.83 11.67 17.5 12.5 17.5Z"
			className={className || (active ? "fill-primary" : "fill-icon-sub")}
		/>
		<path
			d="M15.5 18.5L14 17"
			stroke="currentColor"
			strokeWidth="1.5"
			strokeLinecap="round"
		/>
		<circle
			cx="12"
			cy="15.5"
			r="2.5"
			stroke="currentColor"
			strokeWidth="1.5"
			fill="none"
		/>
	</svg>
);

export default FileSearchIcon;
