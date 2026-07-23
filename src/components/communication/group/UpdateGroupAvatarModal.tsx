/** @format */

import { useRef, useState } from "react";
import Modal from "@/designSystem/Modal";
import Button from "@/designSystem/Button";
import { useFileUpload } from "@/hooks/useFileUpload";
import { useUpdateRoom } from "@/hooks/chat";
import { useTranslation } from "@/hooks/useTranslation";
import { getGroupInitials } from "../utils";
import toast from "@/utilities/toast";

interface UpdateGroupAvatarModalProps {
	isOpen: boolean;
	onClose: () => void;
	groupId: number;
	groupName: string;
	groupAvatar?: string;
}

function UpdateGroupAvatarModal({
	isOpen,
	onClose,
	groupId,
	groupName,
	groupAvatar,
}: UpdateGroupAvatarModalProps) {
	const { t } = useTranslation("common");
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [imagePreview, setImagePreview] = useState<string | null>(null);
	const [uploadedAvatar, setUploadedAvatar] = useState<{
		fileId: number;
		token: string;
		purpose?: string;
	} | null>(null);
	const { uploadFile, isUploading, error: uploadError, reset } =
		useFileUpload();
	const updateRoom = useUpdateRoom();

	const handleClose = () => {
		setImagePreview(null);
		setUploadedAvatar(null);
		reset();
		onClose();
	};

	const handleEditClick = () => {
		fileInputRef.current?.click();
	};

	const handleImageSelect = async (
		e: React.ChangeEvent<HTMLInputElement>
	) => {
		const file = e.target.files?.[0];
		e.target.value = "";
		if (!file) return;

		reset();

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

		setUploadedAvatar(null);

		const reader = new FileReader();
		reader.onloadend = () => {
			setImagePreview(reader.result as string);
		};
		reader.readAsDataURL(file);

		try {
			const result = await uploadFile(file, {
				purpose: "group_avatar",
				maxSizeBytes,
			});
			setUploadedAvatar({
				fileId: result.fileId,
				token: result.token,
				purpose: result.purpose,
			});
		} catch (error) {
			console.error("Failed to upload image:", error);
			toast.error(t("communication.groupDetails.validation.uploadError"));
			setImagePreview(null);
			setUploadedAvatar(null);
		}
	};

	const handleSave = async () => {
		if (!uploadedAvatar || updateRoom.isPending) return;

		if (!groupId) {
			toast.error(t("messages.errorOccurred"));
			return;
		}

		try {
			await updateRoom.mutateAsync({
				roomId: groupId,
				data: {
					name: groupName,
					avatar: uploadedAvatar,
				},
			});
			toast.success(t("messages.updateSuccess"));
			handleClose();
		} catch (error) {
			console.error("Failed to update group avatar:", error);
			const err = error as {
				response?: { data?: { message?: string } };
				message?: string;
			};
			const errorMessage =
				err?.response?.data?.message ||
				err?.message ||
				t("messages.errorOccurred");
			toast.error(errorMessage);
		}
	};

	const displayAvatar = imagePreview || groupAvatar;
	const initials = getGroupInitials(groupName || "Group");

	return (
		<Modal
			isOpen={isOpen}
			onClose={handleClose}
			title={t("communication.groupDetails.uploadTitle")}
			width="w-[360px]"
			contentClassName="flex flex-col items-center gap-4 w-full bg-background p-4"
			showHeaderDivider={false}
			footer={
				<div className="flex flex-row justify-end items-center gap-3 flex-1">
					<Button
						onClick={handleSave}
						disabled={
							!uploadedAvatar || isUploading || updateRoom.isPending
						}
						className="px-3 py-2 gap-1 h-9 rounded-xl">
						{t("actions.save")}
					</Button>
				</div>
			}>
			<div className="w-24 h-24 rounded-full bg-bg-weak flex items-center justify-center overflow-hidden">
				{displayAvatar ? (
					<img
						src={displayAvatar}
						alt={groupName}
						className="w-full h-full object-cover"
						onError={(e) => {
							const target = e.target as HTMLImageElement;
							if (target.src !== "/icons/defAvatar.png") {
								target.src = "/icons/defAvatar.png";
							}
						}}
					/>
				) : (
					<span className="text-lg font-medium text-text-strong">
						{initials}
					</span>
				)}
			</div>

			<Button
				variant="secondary"
				onClick={handleEditClick}
				disabled={isUploading}
				className="px-3 py-1.5 rounded-lg">
				{isUploading
					? t("communication.groupDetails.uploading")
					: t("actions.edit")}
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
		</Modal>
	);
}

export default UpdateGroupAvatarModal;
