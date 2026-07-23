/** @format */

import { FilePdfBase, ArrowUpRightFromSquare, DownloadBracket } from "@/Icons";
import { useTranslation } from "@/hooks/useTranslation";
import Button from "@/designSystem/Button";
import { usePdfPreview } from "@/context/PdfPreviewContext";
import { isImageFile, isPdfFile, downloadFile } from "@/utils/file";
import { useState } from "react";

type AttachmentDisplayProps = {
	filename: string;
	url?: string;
	mimeType?: string;
};

function AttachmentDisplay({
	filename,
	url = "#",
	mimeType,
}: AttachmentDisplayProps) {
	const { t } = useTranslation("requests");
	const { openPreview } = usePdfPreview();
	const canPreview = isPdfFile({ fileName: filename, mimeType, url });
	const [isImagePreviewError, setIsImagePreviewError] = useState(false);
	const canShowImagePreview =
		Boolean(url && url !== "#") && isImageFile({ fileName: filename, url });

	const handleOpenInNewTab = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (!url || url === "#") return;
		if (canPreview) {
			openPreview({ url, fileName: filename });
		} else {
			window.open(url, "_blank", "noopener,noreferrer");
		}
	};

	const handleDownload = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (!url || url === "#") return;
		downloadFile({ url, fileName: filename });
	};

	return (
		<div className='w-[384px] h-10 flex items-center gap-3 bg-text-main p-2 rounded-[10px] border border-border'>
			{canShowImagePreview && !isImagePreviewError ? (
				<img
					src={url}
					alt={filename}
					className="w-5 h-5 rounded-sm object-cover"
					loading="lazy"
					onError={() => setIsImagePreviewError(true)}
				/>
			) : (
				<FilePdfBase size={20} className='fill-error' />
			)}
			<span className='text-sm text-text-strong flex-1'>{filename}</span>
			<div className='flex items-center gap-2'>
				<Button
					onClick={handleOpenInNewTab}
					className='!p-1.5 !bg-transparent !border-0 hover:!bg-bg-weak !text-inherit'
					aria-label={t("timeOffDetail.openInNewTab")}>
					<ArrowUpRightFromSquare size={16} className='fill-primary' />
				</Button>
				<Button
					onClick={handleDownload}
					className='!p-1.5 !bg-transparent !border-0 hover:!bg-bg-weak !text-inherit'
					aria-label={t("timeOffDetail.download")}>
					<DownloadBracket size={16} className='fill-text-sub' />
				</Button>
			</div>
		</div>
	);
}

export default AttachmentDisplay;
