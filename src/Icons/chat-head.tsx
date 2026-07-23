/** @format */

import { useId } from "react";

const ChatHead = ({
	className,
	active = false,
	size = 18,
	isRTL,
}: {
	className?: string;
	active?: boolean;
	size?: number;
	isRTL?: boolean;
}) => {
	// Generate unique ID for filter to avoid conflicts
	const filterId = `chat-head-filter-${useId().replace(/:/g, "-")}`;

	return (
		<svg
			width={size}
			height={size}
			viewBox='0 0 18 18'
			fill='none'
			xmlns='http://www.w3.org/2000/svg'
			className={`rounded-full ${isRTL ? "rotate-180" : ""} ${
				className || (active ? "fill-primary" : "fill-icon-sub")
			}`}>
			<defs>
				<filter
					id={filterId}
					x='0'
					y='0'
					width='18'
					height='18'
					filterUnits='userSpaceOnUse'
					colorInterpolationFilters='sRGB'>
					<feFlood floodOpacity='0' result='BackgroundImageFix' />
					<feColorMatrix
						in='SourceAlpha'
						type='matrix'
						values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0'
						result='hardAlpha'
					/>
					<feMorphology
						radius='4'
						operator='dilate'
						in='SourceAlpha'
						result='effect1_dropShadow_1060_91614'
					/>
					<feOffset />
					<feComposite in2='hardAlpha' operator='out' />
					<feColorMatrix
						type='matrix'
						values='0 0 0 0 0.490196 0 0 0 0 0.321569 0 0 0 0 0.956863 0 0 0 0.25 0'
					/>
					<feBlend
						mode='normal'
						in2='BackgroundImageFix'
						result='effect1_dropShadow_1060_91614'
					/>
					<feColorMatrix
						in='SourceAlpha'
						type='matrix'
						values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0'
						result='hardAlpha'
					/>
					<feOffset dy='1' />
					<feGaussianBlur stdDeviation='1' />
					<feComposite in2='hardAlpha' operator='out' />
					<feColorMatrix
						type='matrix'
						values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.16 0'
					/>
					<feBlend
						mode='normal'
						in2='effect1_dropShadow_1060_91614'
						result='effect2_dropShadow_1060_91614'
					/>
					<feBlend
						mode='normal'
						in='SourceGraphic'
						in2='effect2_dropShadow_1060_91614'
						result='shape'
					/>
					<feColorMatrix
						in='SourceAlpha'
						type='matrix'
						values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0'
						result='hardAlpha'
					/>
					<feOffset dy='1' />
					<feGaussianBlur stdDeviation='0.5' />
					<feComposite in2='hardAlpha' operator='arithmetic' k2='-1' k3='1' />
					<feColorMatrix
						type='matrix'
						values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.32 0'
					/>
					<feBlend
						mode='normal'
						in2='shape'
						result='effect3_innerShadow_1060_91614'
					/>
				</filter>
			</defs>
			<g filter={`url(#${filterId})`}>
				<circle cx='9' cy='9' r='5' fill='#7D52F4' className={className} />
			</g>
		</svg>
	);
};

export default ChatHead;
