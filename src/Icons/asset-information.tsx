/** @format */

const AssetInformation = ({
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
		viewBox='0 0 43 33'
		xmlns='http://www.w3.org/2000/svg'
		className={`${isRTL ? "rotate-180" : ""} ${
			className || (active ? "fill-primary" : "fill-icon-sub")
		}`}>
		<path
			d='M2.05078 6.4C2.05078 4.15979 2.05078 3.03969 2.48676 2.18404C2.87025 1.43139 3.48217 0.819467 4.23482 0.435974C5.09047 0 6.21057 0 8.45078 0H31.5482C33.7884 0 34.9085 0 35.7642 0.435974C36.5168 0.819467 37.1288 1.43139 37.5122 2.18404C37.9482 3.03969 37.9482 4.15979 37.9482 6.4V22.7598H2.05078V6.4Z'
			fill='white'
		/>
		<path
			d='M0 23.5629C0 23.1186 0.36025 22.7583 0.804641 22.7583H39.1954C39.6398 22.7583 40 23.1186 40 23.5629C40 27.1181 37.118 30.0001 33.5629 30.0001H6.43713C2.882 30.0001 0 27.1181 0 23.5629Z'
			fill='#D1D1D1'
		/>
		<rect x='29' y='12' width='14' height='21' rx='2' fill='#A4A4A4' />
		<rect x='35' y='29' width='2' height='2' rx='1' fill='white' />
	</svg>
);
export default AssetInformation;
