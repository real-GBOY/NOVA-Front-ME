/** @format */
import Loader from "@/designSystem/Loader";

type LoadingSize = "small" | "medium" | "large";

interface LoadingStateProps {
	size?: LoadingSize;
	label?: string;
	minHeight?: string;
	fullHeight?: boolean;
}

const sizeMap: Record<LoadingSize, number> = {
	small: 24,
	medium: 40,
	large: 48,
};

const paddingMap: Record<LoadingSize, string> = {
	small: "py-8",
	medium: "py-12",
	large: "py-12",
};

const LoadingState: React.FC<LoadingStateProps> = ({
	size = "large",
	label,
	minHeight,
	fullHeight = false,
}) => {
	const loaderSize = sizeMap[size];
	const padding = paddingMap[size];

	return (
		<div
			className={`flex items-center justify-center ${padding} ${
				fullHeight ? "h-full" : ""
			}`}
			style={minHeight ? { minHeight } : undefined}>
			<Loader size={loaderSize} label={label} />
		</div>
	);
};

export default LoadingState;
