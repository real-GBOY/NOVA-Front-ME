/** @format */

type GpsStatusBadgeProps = {
	status: string;
};

function GpsStatusBadge({ status }: GpsStatusBadgeProps) {
	const isInZone = status === "In zone";

	return (
		<div
			className={`inline-flex items-center gap-2 px-3 py-2 rounded-full w-fit ${
				isInZone ? "bg-success/10" : "bg-warning/10"
			}`}>
			<div
				className={`w-2 h-2 rounded-full ${
					isInZone ? "bg-success" : "bg-warning"
				}`}
			/>
			<span
				className={`text-sm font-medium ${
					isInZone ? "text-success" : "text-warning"
				}`}>
				{status}
			</span>
		</div>
	);
}

export default GpsStatusBadge;
