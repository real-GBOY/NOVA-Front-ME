/** @format */

import { useEffect, useState } from "react";
import Modal from "@/designSystem/Modal";
import Button from "@/designSystem/Button";
import GenericForm from "@/designSystem/GenericForm";
import ConfirmModal from "@/designSystem/ConfirmModal";
import { useTranslation } from "@/hooks/useTranslation";
import { useContracts } from "@/hooks/contracts/useContracts";
import { useQueryClient } from "@tanstack/react-query";
import { reactQueryKeys } from "@/config/reactQueryKeys";
import toast from "@/utilities/toast";
import * as Yup from "yup";
import { filterReadyUploads } from "@/utils/uploadValidation";

interface UploadContractFilesModalProps {
	isOpen: boolean;
	onClose: () => void;
	contractId: number | string;
	employeeId: number | string;
}

interface ContractFileFormData {
	attachments: Array<{
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

function UploadContractFilesModal({
	isOpen,
	onClose,
	contractId,
	employeeId,
}: UploadContractFilesModalProps) {
	const { t } = useTranslation("members");
	const { t: tCommon } = useTranslation("common");
	const { useUpdate } = useContracts();
	const updateContract = useUpdate();
	const queryClient = useQueryClient();

	const [formData, setFormData] = useState<ContractFileFormData>({
		attachments: [],
	});
	const [isDirty, setIsDirty] = useState(false);
	const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
	const schema = Yup.object().shape({
		attachments: Yup.array().min(
			1,
			t("profile.contract.documents.uploadEmptyError")
		),
	});

	useEffect(() => {
		if (!isOpen) {
			setFormData({ attachments: [] });
			setIsDirty(false);
		}
	}, [isOpen]);

	const isBusy = updateContract.isPending;
	const hasUploadingFiles = formData.attachments.some(
		(doc) => doc.isUploading
	);

	const handleClose = () => {
		if (isBusy) return;
		if (isDirty) {
			setShowDiscardConfirm(true);
			return;
		}
		setFormData({ attachments: [] });
		onClose();
	};

	const handleFieldChange = (field: string, value: unknown) => {
		setFormData((prev) => ({
			...prev,
			[field]: value,
		}));
	};

	const handleSubmit = async (data: ContractFileFormData) => {
		try {
			const uploadedFiles = filterReadyUploads(data.attachments || []);

			if (uploadedFiles.length === 0) {
				toast.error(t("profile.contract.documents.uploadEmptyError"));
				return;
			}

			await updateContract.mutateAsync({
				id: contractId,
				payload: {
					core: {
						attachments: uploadedFiles.map((doc) => ({
							fileId: doc.fileId,
							token: doc.token,
							purpose: doc.purpose || "contract",
						})),
					},
				},
			});

			queryClient.invalidateQueries({
				queryKey: reactQueryKeys.employees.contract(employeeId),
			});

			toast.success(t("profile.contract.documents.uploadSuccess"));
			setFormData({ attachments: [] });
			setIsDirty(false);
			onClose();
		} catch (error) {
			console.error("Failed to upload contract files", error);
			toast.error(t("profile.contract.documents.uploadError"));
		}
	};

	const fields = [
		{
			name: "attachments",
			type: "uploadField" as const,
			label: t("profile.contract.documents.uploadLabel"),
			accept: "image/jpeg,image/png,application/pdf",
			multiple: true,
			uploadPurpose: "contract",
		},
	];

	return (
		<Modal
			isOpen={isOpen}
			onClose={handleClose}
			title={t("profile.contract.documents.uploadTitle")}
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
						form="upload-contract-files-form"
						disabled={
							isBusy || hasUploadingFiles || formData.attachments.length === 0
						}
						className="r-btn-full xl:px-4 xl:py-2 xl:rounded-xl">
						{isBusy
							? t("profile.contract.documents.uploadingAction")
							: t("profile.contract.documents.uploadAction")}
					</Button>
				</div>
			}>
			<div className="w-full">
				<GenericForm
					id="upload-contract-files-form"
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
					setFormData({ attachments: [] });
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

export default UploadContractFilesModal;
