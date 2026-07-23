/** @format */

import { useMemo, useRef, useState } from "react";
import Modal from "@/designSystem/Modal";
import Button from "@/designSystem/Button";
import { useFileUpload } from "@/hooks/useFileUpload";
import ConfirmModal from "@/designSystem/ConfirmModal";
import { useTranslation } from "@/hooks/useTranslation";
import toast from "@/utilities/toast";

interface Member {
	id: string;
	name: string;
	jobTitle: string;
	avatar?: string;
	isCurrentUser?: boolean;
}

interface CreateGroupDetailsModalProps {
	isOpen: boolean;
	onClose: () => void;
	onBack: () => void;
	onCreate?: (groupName: string, avatar?: { fileId: number; token: string }) => void;
	selectedMembers: Member[];
	isCreating?: boolean;
}

function CreateGroupDetailsModal({
	isOpen,
	onClose,
	onBack,
	onCreate,
	isCreating = false,
}: CreateGroupDetailsModalProps) {
	const { t } = useTranslation("common");
	const [groupName, setGroupName] = useState("");
	const [selectedImage, setSelectedImage] = useState<File | null>(null);
	const [imagePreview, setImagePreview] = useState<string | null>(null);
	const [uploadedAvatar, setUploadedAvatar] = useState<{ fileId: number; token: string } | undefined>(
		undefined
	);
	const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
	const [errors, setErrors] = useState<{ groupName?: string }>({});
	const fileInputRef = useRef<HTMLInputElement>(null);
	const { uploadFile, isUploading, error: uploadError } = useFileUpload();

	const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		// Validate file type
		if (!file.type.match(/^image\/(png|jpeg|jpg)$/)) {
			toast.error(t("communication.groupDetails.validation.fileType"));
			return;
		}

		// Validate file size (10 MB max)
		const maxSizeBytes = 10 * 1024 * 1024;
		if (file.size > maxSizeBytes) {
			toast.error(t("communication.groupDetails.validation.fileSize"));
			return;
		}

		// Set preview immediately
		setSelectedImage(file);
		const reader = new FileReader();
		reader.onloadend = () => {
			setImagePreview(reader.result as string);
		};
		reader.readAsDataURL(file);

		// Upload file to get file_id and token
		try {
			const result = await uploadFile(file, {
				purpose: "group_avatar", // Changed from chat_attachment to group_avatar
				maxSizeBytes,
			});
			setUploadedAvatar({ fileId: result.fileId, token: result.token });
		} catch (error) {
			console.error("Failed to upload image:", error);
			toast.error(t("communication.groupDetails.validation.uploadError"));
			setSelectedImage(null);
			setImagePreview(null);
		}
	};

	const handleUploadClick = () => {
		fileInputRef.current?.click();
	};

	const handleCreate = () => {
		if (!groupName.trim()) {
			setErrors({
				groupName: t("communication.groupDetails.validation.groupNameRequired"),
			});
			return;
		}
		if (onCreate) {
			onCreate(groupName.trim(), uploadedAvatar);
		}
		// Reset form after creation
		setGroupName("");
		setSelectedImage(null);
		setImagePreview(null);
		setUploadedAvatar(undefined);
		setErrors({});
	};

	// Reset form when modal closes
	const handleClose = () => {
		setGroupName("");
		setSelectedImage(null);
		setImagePreview(null);
		setUploadedAvatar(undefined);
		setErrors({});
		onClose();
	};

	const isDirty = useMemo(
		() => Boolean(groupName.trim() || selectedImage || uploadedAvatar),
		[groupName, selectedImage, uploadedAvatar]
	);

	const handleRequestClose = () => {
		if (isDirty) {
			setShowDiscardConfirm(true);
			return;
		}
		handleClose();
	};

	return (
		<>
			<Modal
				isOpen={isOpen}
				onClose={handleRequestClose}
				title={t("communication.groupDetails.title")}
				width="w-[440px]"
				contentClassName="flex flex-col items-start p-4 gap-6 w-full bg-background"
				showHeaderDivider={false}
				footer={
					<div className="flex flex-row justify-end items-center gap-3 flex-1">
						<Button
							variant="secondary"
							onClick={onBack}
							className="px-2 py-2 gap-1 w-[66px] h-9 rounded-xl">
							{t("actions.back")}
						</Button>
						<Button
							onClick={handleCreate}
							disabled={!groupName.trim() || isUploading || isCreating}
							className="px-2 py-2 gap-1 w-[80px] h-9 rounded-xl">
							{isCreating
								? t("communication.groupDetails.creating")
								: isUploading
								? t("communication.groupDetails.uploading")
								: t("communication.groupDetails.create")}
						</Button>
					</div>
				}>
			{/* Upload Image Section */}
			<div className="flex flex-row items-center gap-4 w-full">
				{/* Image Placeholder */}
				<div className="w-20 h-20 rounded-full bg-bg-weak flex-shrink-0 flex items-center justify-center overflow-hidden">
					{imagePreview ? (
						<img
							src={imagePreview}
							alt='Group preview'
							className="w-full h-full object-cover"
						/>
					) : (
						<svg
							width='40'
							height='40'
							viewBox='0 0 40 40'
							fill='none'
							xmlns='http://www.w3.org/2000/svg'
							className="text-text-soft">
							<path
								d='M20 13.3333C22.5773 13.3333 24.6667 15.4227 24.6667 18C24.6667 20.5773 22.5773 22.6667 20 22.6667C17.4227 22.6667 15.3333 20.5773 15.3333 18C15.3333 15.4227 17.4227 13.3333 20 13.3333ZM20 25.3333C24.6 25.3333 28.3333 27.1113 28.3333 29.3333V31.3333H11.6667V29.3333C11.6667 27.1113 15.4 25.3333 20 25.3333Z'
								fill='currentColor'
							/>
						</svg>
					)}
				</div>

				{/* Upload Info */}
				<div className="flex flex-col items-start gap-2 flex-1">
					<span className="text-sm font-normal text-text-strong leading-5">
						{t("communication.groupDetails.uploadTitle")}
					</span>
					<span className="text-xs font-normal text-text-soft leading-4">
						{t("communication.groupDetails.uploadSubtitle")}
					</span>
					<Button
						variant="secondary"
						onClick={handleUploadClick}
						disabled={isUploading}
						className="px-3 py-1.5 rounded-lg">
						{isUploading
							? t("communication.groupDetails.uploading")
							: t("communication.groupDetails.upload")}
					</Button>
					{uploadError && (
						<span className="text-xs text-error">{uploadError}</span>
					)}
					<input
						ref={fileInputRef}
						type="file"
						accept="image/png,image/jpeg,image/jpg"
						onChange={handleImageSelect}
						className="hidden"
						disabled={isUploading}
					/>
				</div>
			</div>

			{/* Group Name Input */}
			<div className="flex flex-col items-start gap-2 w-full">
				<label className="text-sm font-medium text-text-strong leading-5">
					{t("communication.groupDetails.groupNameLabel")}
					<span className="text-error">*</span>
				</label>
				<input
					type="text"
					placeholder={t("communication.groupDetails.groupNamePlaceholder")}
					value={groupName}
					onChange={(e) => {
						setGroupName(e.target.value);
						setErrors((prev) => ({ ...prev, groupName: undefined }));
					}}
					className="w-full h-10 px-3 py-2 bg-background border border-border rounded-[10px] shadow-subtle text-sm font-normal text-text-strong leading-5 tracking-[-0.006em] placeholder:text-text-soft focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
				/>
				{errors.groupName && (
					<span className="text-xs text-danger">{errors.groupName}</span>
				)}
			</div>
			</Modal>
			<ConfirmModal
				isOpen={showDiscardConfirm}
				onClose={() => setShowDiscardConfirm(false)}
				onConfirm={() => {
					setShowDiscardConfirm(false);
					handleClose();
				}}
				title={t("unsavedChanges.title")}
				description={t("unsavedChanges.description")}
				confirmText={t("unsavedChanges.confirm")}
				cancelText={t("unsavedChanges.cancel")}
			/>
		</>
	);
}

export default CreateGroupDetailsModal;
