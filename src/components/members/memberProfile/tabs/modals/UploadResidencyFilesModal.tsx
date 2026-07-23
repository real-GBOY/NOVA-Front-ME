/** @format */

import { useEffect, useMemo, useState } from "react";
import Modal from "@/designSystem/Modal";
import Button from "@/designSystem/Button";
import GenericForm from "@/designSystem/GenericForm";
import ConfirmModal from "@/designSystem/ConfirmModal";
import { useTranslation } from "@/hooks/useTranslation";
import { useUpdateResidency } from "@/hooks/employees/employee.mutations";
import toast from "@/utilities/toast";
import type { ResidencyPermit } from "@/services/employeeService";
import * as Yup from "yup";
import { filterReadyUploads } from "@/utils/uploadValidation";

interface UploadResidencyFilesModalProps {
	isOpen: boolean;
	onClose: () => void;
	permitData: ResidencyPermit | null;
	employeeId: string | number;
}

interface ResidencyFilesFormData {
	residency_documents: Array<{
		fileName: string;
		fileSize: number;
		fileType: string;
		fileUrl?: string;
		fileId?: number;
		token?: string;
		key?: string;
		purpose?: string;
		progress: number;
		isUploading: boolean;
		error?: string;
	}>;
}

function UploadResidencyFilesModal({
	isOpen,
	onClose,
	permitData,
	employeeId,
}: UploadResidencyFilesModalProps) {
	const { t } = useTranslation("members");
	const { t: tCommon } = useTranslation("common");
	const updateResidencyMutation = useUpdateResidency();
	const [formData, setFormData] = useState<ResidencyFilesFormData>({
		residency_documents: [],
	});
	const [isDirty, setIsDirty] = useState(false);
	const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

	const schema = useMemo(
		() =>
			Yup.object().shape({
				residency_documents: Yup.array().min(
					1,
					t("profile.residency.uploadEmptyError")
				),
			}),
		[t]
	);

	useEffect(() => {
		if (!isOpen) {
			setFormData({ residency_documents: [] });
			setIsDirty(false);
		}
	}, [isOpen]);

	const isBusy = updateResidencyMutation.isPending;
	const hasUploadingFiles = formData.residency_documents.some(
		(doc) => doc.isUploading
	);

	const handleClose = () => {
		if (isBusy) return;
		if (isDirty) {
			setShowDiscardConfirm(true);
			return;
		}
		setFormData({ residency_documents: [] });
		onClose();
	};

	const handleFieldChange = (field: string, value: unknown) => {
		setFormData((prev) => ({
			...prev,
			[field]: value,
		}));
	};

	const handleSubmit = async (data: ResidencyFilesFormData) => {
		try {
			if (!permitData) return;

			const uploadedFiles = filterReadyUploads(data.residency_documents || []);

			if (uploadedFiles.length === 0) {
				toast.error(t("profile.residency.uploadEmptyError"));
				return;
			}

			await updateResidencyMutation.mutateAsync({
				permitId: permitData.permit_id,
				employeeId,
				payload: {
					permit_number: permitData.permit_number,
					permit_type: permitData.permit_type,
					issue_date: permitData.issue_date || "",
					expiration_date: permitData.expiration_date || "",
					country: permitData.country,
					status: permitData.status,
					residency_documents: uploadedFiles.map((doc) => ({
						fileId: doc.fileId,
						token: doc.token,
						purpose: doc.purpose || "employee_document",
						fileName: doc.fileName,
						fileSize: doc.fileSize,
						fileType: doc.fileType,
						fileUrl: doc.fileUrl,
						key: doc.key,
					})),
				},
			});

			toast.success(t("profile.residency.uploadSuccess"));
			setFormData({ residency_documents: [] });
			setIsDirty(false);
			onClose();
		} catch (error) {
			console.error("Failed to upload residency files", error);
			toast.error(t("profile.residency.uploadError"));
		}
	};

	const fields = [
		{
			name: "residency_documents",
			type: "uploadField" as const,
			label: t("profile.residency.uploadLabel"),
			accept: "image/jpeg,image/png,application/pdf",
			multiple: true,
			uploadPurpose: "employee_document",
		},
	];

	return (
		<Modal
			isOpen={isOpen}
			onClose={handleClose}
			title={t("profile.residency.uploadTitle")}
			width="r-modal-w xl:w-[600px]"
			contentClassName="flex flex-col items-start r-p-sm r-gap w-full bg-background xl:p-5 xl:gap-5"
			showHeaderDivider={false}
			footer={
				<div className="r-btn-group xl:flex-row xl:justify-end xl:items-center xl:gap-3 xl:flex-1">
					<Button
						variant="secondary"
						onClick={handleClose}
						disabled={isBusy}
						className="r-btn-full xl:px-4 xl:py-2 xl:rounded-xl">
						{tCommon("actions.cancel") || "Cancel"}
					</Button>
					<Button
						type="submit"
						form="upload-residency-files-form"
						disabled={
							isBusy ||
							hasUploadingFiles ||
							formData.residency_documents.length === 0
						}
						className="r-btn-full xl:px-4 xl:py-2 xl:rounded-xl">
						{isBusy
							? t("profile.residency.uploadingAction")
							: t("profile.residency.uploadAction")}
					</Button>
				</div>
			}>
			<div className="w-full">
				<GenericForm
					id="upload-residency-files-form"
					schema={schema}
					defaultValues={formData}
					formData={formData}
					onSubmit={handleSubmit}
					onFieldChange={handleFieldChange}
					showSubmitButton={false}
					mode="onChange"
					fields={fields}
					onDirtyChange={setIsDirty}
					className="w-full"
				/>
			</div>
			<ConfirmModal
				isOpen={showDiscardConfirm}
				onClose={() => setShowDiscardConfirm(false)}
				onConfirm={() => {
					setFormData({ residency_documents: [] });
					onClose();
				}}
				title={tCommon("unsavedChanges.title")}
				description={tCommon("unsavedChanges.description")}
				confirmText={tCommon("unsavedChanges.confirm")}
				cancelText={tCommon("unsavedChanges.cancel")}
				variant="primary"
				icon="exclamation"
			/>
		</Modal>
	);
}

export default UploadResidencyFilesModal;
