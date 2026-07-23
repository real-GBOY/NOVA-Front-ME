const ShieldCrossIcon = ({
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
			d="M12 2L4 5V11C4 16.55 7.84 21.74 12 22C16.16 21.74 20 16.55 20 11V5L12 2Z"
			className={className || (active ? "fill-primary" : "fill-icon-sub")}
		/>
		<path
			d="M9.17 9.17C8.78 9.56 8.78 10.19 9.17 10.58L10.58 12L9.17 13.41C8.78 13.8 8.78 14.43 9.17 14.82C9.56 15.21 10.19 15.21 10.58 14.82L12 13.41L13.41 14.82C13.8 15.21 14.43 15.21 14.82 14.82C15.21 14.43 15.21 13.8 14.82 13.41L13.41 12L14.82 10.58C15.21 10.19 15.21 9.56 14.82 9.17C14.43 8.78 13.8 8.78 13.41 9.17L12 10.58L10.58 9.17C10.19 8.78 9.56 8.78 9.17 9.17Z"
			className={className || (active ? "fill-primary" : "fill-icon-sub")}
		/>
	</svg>
);

export default ShieldCrossIcon;
