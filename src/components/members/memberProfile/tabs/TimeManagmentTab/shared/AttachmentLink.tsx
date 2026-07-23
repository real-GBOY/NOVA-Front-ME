/** @format */

import { FilePdfBase } from "@/Icons";
import { usePdfPreview } from "@/context/PdfPreviewContext";
import { isImageFile, isPdfFile } from "@/utils/file";
import { useState } from "react";

interface Attachment {
	filename: string;
	url: string;
	mimeType?: string;
}

interface AttachmentLinkProps {
	attachment?: Attachment;
	onClick?: (e: React.MouseEvent) => void;
}

/**
 * Reusable attachment link component
 * Displays a clickable link with icon for file attachments
 * Used in TimeOffRequestsTable
 */
function AttachmentLink({ attachment, onClick }: AttachmentLinkProps) {
	const { openPreview } = usePdfPreview();
	const [isImagePreviewError, setIsImagePreviewError] = useState(false);

	if (!attachment) {
		return null;
	}
	const canShowImagePreview = isImageFile({
		fileName: attachment.filename,
		url: attachment.url,
	});

	const handleClick = (e: React.MouseEvent) => {
		e.preventDefault();
		onClick?.(e);
		const isPdf = isPdfFile({
			fileName: attachment.filename,
			url: attachment.url,
			mimeType: attachment.mimeType,
		});
		if (isPdf) {
			openPreview({
				url: attachment.url,
				fileName: attachment.filename,
			});
		} else {
			window.open(attachment.url, "_blank", "noopener,noreferrer");
		}
	};

	return (
		<a
			href={attachment.url}
			target='_blank'
			rel='noopener noreferrer'
			onClick={handleClick}
			className='flex items-center gap-2 text-primary hover:text-primary/80 transition-colors group cursor-pointer'>
			{canShowImagePreview && !isImagePreviewError ? (
				<img
					src={attachment.url}
					alt={attachment.filename}
					className="w-4 h-4 rounded-sm object-cover"
					loading="lazy"
					onError={() => setIsImagePreviewError(true)}
				/>
			) : (
				<FilePdfBase
					size={16}
					className='text-text-sub group-hover:text-primary/80'
				/>
			)}
			<span className='text-sm underline'>{attachment.filename}</span>
		</a>
	);
}

export default AttachmentLink;
