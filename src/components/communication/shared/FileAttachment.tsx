/** @format */

import { PdfFile, DownloadBracket } from "@/Icons";
import { usePdfPreview } from "@/context/PdfPreviewContext";
import { isImageFile, isPdfFile, downloadFile } from "@/utils/file";
import { useState } from "react";

interface FileAttachmentProps {
	fileName?: string;
	fileSize?: string;
	fileUrl?: string;
	isOwn?: boolean;
	mimeType?: string;
}

function FileAttachment({
	fileName,
	fileSize,
	fileUrl,
	isOwn = false,
	mimeType,
}: FileAttachmentProps) {
	const displayName = fileName || "Attachment";
	const displaySize = fileSize || "";
	const { openPreview } = usePdfPreview();
	const canPreview = isPdfFile({ fileName, mimeType, url: fileUrl });
	const [isImagePreviewError, setIsImagePreviewError] = useState(false);
	const canShowImagePreview =
		Boolean(fileUrl) && isImageFile({ fileName, url: fileUrl });

	const handleOpen = () => {
		if (!fileUrl) return;
		if (canPreview) {
			openPreview({ url: fileUrl, fileName });
		} else {
			window.open(fileUrl, "_blank", "noopener,noreferrer");
		}
	};

	const handleDownload = (event?: React.MouseEvent) => {
		event?.stopPropagation();
		if (!fileUrl) return;
		downloadFile({ url: fileUrl, fileName });
	};

	return (
		<div
			className={`flex flex-row items-center p-3 gap-3 min-w-[240px] ${
				isOwn ? "bg-primary text-background" : "bg-background text-text-strong"
			} border ${isOwn ? "border-primary/30" : "border-border"} rounded-[16px] ${
				fileUrl ? "cursor-pointer hover:border-primary/50" : ""
			}`}
			onClick={handleOpen}>
			{/* File Icon */}
			<div className='w-10 h-10 flex-shrink-0 flex items-center justify-center bg-transparent'>
				{canShowImagePreview && !isImagePreviewError ? (
					<img
						src={fileUrl}
						alt={displayName}
						className="w-10 h-10 rounded-md object-cover"
						loading="lazy"
						onError={() => setIsImagePreviewError(true)}
					/>
				) : (
					<PdfFile size={40} />
				)}
			</div>

			{/* Text Section */}
			<div className='flex flex-col flex-1 min-w-0 gap-0.5'>
				<p className={`text-sm font-medium leading-5 truncate ${isOwn ? "text-background" : "text-text-strong"}`}>
					{displayName}
				</p>
				{displaySize && (
					<p className={`text-xs font-normal leading-4 ${isOwn ? "text-background/80" : "text-text-sub"}`}>
						{displaySize}
					</p>
				)}
			</div>

			{/* Download Button */}
			<button
				type='button'
				onClick={handleDownload}
				className={`w-8 h-8 flex items-center justify-center rounded-lg border ${
					isOwn ? "border-background/20 bg-background/10" : "border-border bg-transparent"
				}`}>
				<DownloadBracket
					className={isOwn ? "fill-background" : "fill-text-soft"}
					size={20}
				/>
			</button>
		</div>
	);
}

export default FileAttachment;
