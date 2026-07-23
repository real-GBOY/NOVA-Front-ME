/** @format */

import { useLanguage } from "@/hooks/useLanguage";

export type DocumentationContent = {
	title?: string | { en?: string; ar?: string };
	text?: string[];
	images?: Array<{
		src: string;
		alt?: string;
		caption?: string;
		stepTitle?: string;
		stepContent?: string[];
		notices?: string[];
	}>;
};

type DocumentationContentProps = {
	content: DocumentationContent;
};

function DocumentationContent({ content }: DocumentationContentProps) {
	const { language } = useLanguage();

	// Helper function to get localized text
	const getLabel = (
		label: string | { en?: string; ar?: string } | undefined
	): string => {
		if (!label) return "";
		if (typeof label === "string") return label;
		return label[language] || label.en || label.ar || "";
	};

	const title = getLabel(content.title);
	const text = content.text || [];
	const images = content.images || [];

	return (
		<div className="flex flex-col gap-8 py-4">
			{/* Title Section */}
			{title && (
				<div className="border-b border-border pb-4">
					<h2 className="text-2xl md:text-3xl font-bold text-text-strong leading-tight">
						{title}
					</h2>
				</div>
			)}

			{/* Text Content Section */}
			{text.length > 0 && (
				<div className="flex flex-col gap-5">
					{text.map((paragraph, index) => {
						if (!paragraph.trim()) return null;
						return (
							<p
								key={index}
								className="text-base md:text-lg text-text-strong leading-relaxed">
								{paragraph}
							</p>
						);
					})}
				</div>
			)}

			{/* Images with Step Content Section */}
			{images.length > 0 && (
				<div className="flex flex-col gap-10">
					{images.map((image, index) => (
						<div
							key={index}
							className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
							{/* Image Container */}
							<div className="flex flex-col gap-3 w-full lg:w-1/2 flex-shrink-0">
								<div className="relative w-full bg-bg-weak rounded-xl overflow-hidden border border-border shadow-sm">
									<img
										src={image.src}
										alt={image.alt || image.caption || `Documentation image ${index + 1}`}
										className="w-full h-auto max-h-[600px] object-contain"
									/>
								</div>
								{image.caption && (
									<p className="text-sm md:text-base text-text-sub italic text-center lg:text-left">
										{image.caption}
									</p>
								)}
							</div>

							{/* Explanation Content Container */}
							<div className="flex flex-col gap-5 w-full lg:w-1/2 lg:pt-2">
								{/* Step Title */}
								{image.stepTitle && (
									<h3 className="text-xl md:text-2xl font-semibold text-text-strong leading-tight">
										{image.stepTitle}
									</h3>
								)}

								{/* Step Content */}
								{image.stepContent && image.stepContent.length > 0 && (
									<div className="flex flex-col gap-4">
										{image.stepContent.map((paragraph, pIndex) => {
											if (!paragraph.trim()) return null;
											return (
												<p
													key={pIndex}
													className="text-base md:text-lg text-text-strong leading-relaxed">
													{paragraph}
												</p>
											);
										})}
									</div>
								)}

								{/* Notices */}
								{image.notices && image.notices.length > 0 && (
									<div className="flex flex-col gap-3 p-5 bg-bg-weak rounded-lg border-l-4 border-primary/50 shadow-sm">
										<div className="flex items-center gap-2 mb-1">
											<span className="text-sm font-semibold text-primary uppercase tracking-wide">
												Notice
											</span>
										</div>
										<div className="flex flex-col gap-2.5">
											{image.notices.map((notice, nIndex) => {
												if (!notice.trim()) return null;
												return (
													<p
														key={nIndex}
														className="text-sm md:text-base text-text-sub leading-relaxed flex items-start gap-2">
														<span className="text-primary mt-1.5 flex-shrink-0">•</span>
														<span>{notice}</span>
													</p>
												);
											})}
										</div>
									</div>
								)}
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
}

export default DocumentationContent;
