/** @format */

type DetailCardProps = {
	children: React.ReactNode;
	className?: string;
};

function DetailCard({ children, className = "" }: DetailCardProps) {
	return (
		<div
			className={`bg-bg-weak rounded-lg p-6 flex flex-col gap-6 ${className}`}>
			{children}
		</div>
	);
}

export default DetailCard;
