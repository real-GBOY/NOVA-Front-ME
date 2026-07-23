/** @format */

import { useState, useRef } from "react";
import { usePdfPreview } from "@/context/PdfPreviewContext";
import { downloadFile, isImageFile, isPdfFile } from "@/utils/file";
import Dropdown from "@/designSystem/Dropdown";
import { useTranslation } from "@/hooks/useTranslation";
import {
	Plus,
	DownloadBracket,
	MoreVertical,
	PdfFile,
	Eye,
} from "@/Icons";
import endPoints from "@/config/endPoints";

const STORAGE_BASE_URL = endPoints.bucketUrl;

const buildFileUrl = (filePath?: string | null) => {
	if (!filePath) return "";
	if (filePath.startsWith("http")) return filePath;
	const cleanPath = filePath.replace(/^\/+/, "");
	return `${STORAGE_BASE_URL}/${cleanPath}`;
};

interface LegalCaseDocument {
	document_id: number;
	event_id?: number;
	file_id: number;
	uploaded_at: string;
	uploaded_by?: string | null;
	case_id: number;
	File: {
		file_id: number;
		original_filename: string;
		storage_path: string;
		mime_type: string;
		size_bytes: string;
	};
	UploadedBy?: Record<string, unknown>;
}

interface DocumentsContentProps {
	documents: LegalCaseDocument[];
	onAddDocument?: () => void;
}

export default function DocumentsContent({
	documents,
	onAddDocument,
}: DocumentsContentProps) {
	const { t } = useTranslation("settings");
	const filteredDocuments = documents;

	return (
		<div className="flex flex-col gap-6 w-full">
			{/* Documents Toolbar */}
			<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 xl:whitespace-nowrap">
				{/* Placeholder to keep Add button aligned to the right */}
				<div className="hidden md:block md:flex-1 md:max-w-md" />

				{/* Action Buttons */}
				<div className="grid grid-cols-2 gap-2 w-full md:w-auto md:flex md:flex-nowrap md:items-center md:justify-end">
					{/* Add Documents Button */}
					{onAddDocument && (
						<button
							type="button"
							onClick={onAddDocument}
							className="col-span-2 w-full md:w-auto flex items-center justify-center gap-2 px-3 py-2 bg-text-strong text-text-main rounded-lg hover:bg-text-strong/90 transition-colors text-sm font-medium">
							<Plus className="size-5 fill-current" />
							<span>{t("legalCases.details.addDocuments")}</span>
						</button>
					)}
				</div>
			</div>

			{/* Documents Grid */}
			{filteredDocuments.length === 0 ? (
				<div className="w-full rounded-2xl border border-dashed border-border bg-bg-weak p-6 text-sm text-text-sub text-center">
					<p>{t("legalCases.details.noDocumentsAvailable")}</p>
				</div>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
					{filteredDocuments.map((document) => (
						<DocumentCard
							key={document.document_id}
							document={document}
						/>
					))}
				</div>
			)}
		</div>
	);
}

interface DocumentCardProps {
	document: LegalCaseDocument;
}

function DocumentCard({ document }: DocumentCardProps) {
	const { t } = useTranslation("settings");
	const { openPreview } = usePdfPreview();
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	const [isImagePreviewError, setIsImagePreviewError] = useState(false);
	const moreButtonRef = useRef<HTMLButtonElement>(null);

	// Handle both nested File object (from API) and flat structure (from service interface)
	const legacyDocument = document as Partial<{
		file_url: string;
		file_name: string;
		file_size: string;
	}>;
	const fileUrl = buildFileUrl(
		document.File?.storage_path || legacyDocument.file_url
	);
	const fileName =
		document.File?.original_filename || legacyDocument.file_name || t("legalCases.details.unknown");
	const fileType = fileName?.split(".").pop()?.toUpperCase() || "FILE";
	const fileSizeBytes = parseInt(
		document.File?.size_bytes || legacyDocument.file_size || "0"
	);
	const fileSizeLabel =
		fileSizeBytes > 0
			? fileSizeBytes > 1024 * 1024
				? `${(fileSizeBytes / (1024 * 1024)).toFixed(2)} MB`
				: `${(fileSizeBytes / 1024).toFixed(2)} KB`
			: "0 MB";

	const handleView = () => {
		if (!fileUrl) return;
		const isPdf = isPdfFile({ fileName, url: fileUrl });

		if (isPdf) {
			openPreview({ url: fileUrl, fileName });
		} else if (typeof window !== "undefined") {
			window.open(fileUrl, "_blank", "noopener,noreferrer");
		}
	};

	const handleDownload = async () => {
		if (!fileUrl) return;
		await downloadFile({ url: fileUrl, fileName });
	};

	const dropdownItems = [
		{
			id: "preview",
			label: t("legalCases.details.preview"),
			icon: Eye,
			onClick: handleView,
		},
	];

	// Check if file is an image based on mime_type
	const mimeType = (document.File?.mime_type as string) || "";
	const isImage =
		mimeType.startsWith("image/") || isImageFile({ fileName, url: fileUrl });

	return (
		<div className="bg-background border border-border rounded-2xl overflow-hidden hover:shadow-subtle transition-shadow">
			{/* Preview Thumbnail */}
			<div className="w-full h-48 bg-bg-weak border-b border-border flex items-center justify-center p-4">
				{isImage && fileUrl && !isImagePreviewError ? (
					<img
						src={fileUrl}
						alt={fileName}
						className="w-full h-full object-contain rounded-lg"
						loading="lazy"
						onError={() => setIsImagePreviewError(true)}
					/>
				) : (
					<div className="w-full h-full bg-background rounded-lg border border-border flex items-center justify-center">
						<PdfFile size={48} />
					</div>
				)}
			</div>

			{/* Document Info */}
			<div className="p-4 flex flex-col gap-3">
				{/* Title */}
				<h3 className="text-sm font-medium text-text-strong line-clamp-2">
					{fileName}
				</h3>

				{/* File Details */}
				<div className="flex flex-col gap-1">
					<p className="text-xs text-text-sub">
						{fileType} · {fileSizeLabel}
					</p>
				</div>

				{/* Action Buttons */}
				<div className="flex items-center gap-2">
					<button
						onClick={handleDownload}
						className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-text-strong text-text-main rounded-lg hover:bg-text-strong/90 transition-colors text-sm font-medium cursor-pointer">
						<DownloadBracket className="size-4 fill-current" />
						<span>{t("legalCases.details.download")}</span>
					</button>
					<button
						ref={moreButtonRef}
						onClick={() => setIsDropdownOpen(!isDropdownOpen)}
						className="p-2 bg-background border border-border rounded-lg hover:bg-bg-weak transition-colors cursor-pointer"
						aria-label="More options">
						<MoreVertical className="size-5 fill-text-sub" />
					</button>
				</div>
			</div>

			{/* Dropdown Menu */}
			<Dropdown
				items={dropdownItems}
				isOpen={isDropdownOpen}
				onClose={() => setIsDropdownOpen(false)}
				anchorRef={moreButtonRef}
			/>
		</div>
	);
}
