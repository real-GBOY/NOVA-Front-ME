/** @format */

import { useState, useMemo } from "react";
import Modal from "@/designSystem/Modal";
import Button from "@/designSystem/Button";
import ConfirmModal from "@/designSystem/ConfirmModal";
import GenericForm, { FieldConfig } from "@/designSystem/GenericForm";
import * as yup from "yup";
import { useTranslation } from "@/hooks/useTranslation";

interface EditCaseSummaryModalProps {
	isOpen: boolean;
	onClose: () => void;
	initialValue: string;
	onUpdate: (newSummary: string) => void;
}

interface EditSummaryFormValues extends Record<string, unknown> {
	additionalSummary: string;
}

const getValidationSchema = (t: (key: string) => string) =>
	yup.object().shape({
		additionalSummary: yup.string().required(t("validation.required")),
	});

function EditCaseSummaryModal({
	isOpen,
	onClose,
	initialValue,
	onUpdate,
}: EditCaseSummaryModalProps) {
	const { t } = useTranslation("settings");
	const { t: tCommon } = useTranslation("common");
	const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
	const [isFormDirty, setIsFormDirty] = useState(false);

	const schema = getValidationSchema(tCommon);

	const fields: FieldConfig[] = [
		{
			name: "additionalSummary",
			label: t("legalCases.editSummaryModal.addLabel"),
			placeholder: t("legalCases.editSummaryModal.addPlaceholder"),
			type: "textarea",
			rows: 8,
			maxLength: 1000,
			required: true,
		},
	];

	const defaultValues: EditSummaryFormValues = useMemo(
		() => ({ additionalSummary: "" }),
		[]
	);

	const handleFormSubmit = (data: EditSummaryFormValues) => {
		// Append the new content to the existing summary
		const newSummary = initialValue
			? `${initialValue}\n\n${data.additionalSummary}`
			: data.additionalSummary;
		onUpdate(newSummary);
		onClose();
	};

	const handleRequestClose = () => {
		if (isFormDirty) {
			setShowDiscardConfirm(true);
			return;
		}
		onClose();
	};

	const handleDiscardChanges = () => {
		setShowDiscardConfirm(false);
		onClose();
	};

	return (
		<>
			<Modal
				isOpen={isOpen}
				onClose={handleRequestClose}
				title={t("legalCases.editSummaryModal.title")}
				size='medium'
				showHeaderDivider={false}
				footer={
					<div className='flex items-center justify-end gap-3 w-full'>
						<Button
							variant='secondary'
							onClick={handleRequestClose}
							className='px-3 py-2 text-sm cursor-pointer'>
							{tCommon("actions.cancel")}
						</Button>
						<Button form='editSummaryForm' type='submit' className='cursor-pointer'>
							{tCommon("actions.update")}
						</Button>
					</div>
				}>
				<div className='flex flex-col gap-4'>
					{/* Previous Summary - Read Only */}
					{initialValue && (
						<div className='flex flex-col gap-2'>
							<label className='text-sm font-medium text-text-strong'>
								{t("legalCases.editSummaryModal.previousLabel")}
							</label>
							<div className='bg-bg-weak border border-border rounded-lg p-3 text-sm text-text-sub whitespace-pre-wrap wrap-break-word max-h-32 overflow-y-auto'>
								{initialValue}
							</div>
						</div>
					)}

					{/* Add New Content Form */}
					<GenericForm<EditSummaryFormValues>
						id='editSummaryForm'
						schema={schema}
						defaultValues={defaultValues}
						fields={fields}
						onSubmit={handleFormSubmit}
						onDirtyChange={setIsFormDirty}
						showSubmitButton={false}
					/>
				</div>
			</Modal>
			<ConfirmModal
				isOpen={showDiscardConfirm}
				onClose={() => setShowDiscardConfirm(false)}
				onConfirm={handleDiscardChanges}
				title={tCommon("unsavedChanges.title")}
				description={tCommon("unsavedChanges.description")}
				confirmText={tCommon("unsavedChanges.confirm")}
				cancelText={tCommon("unsavedChanges.cancel")}
			/>
		</>
	);
}

export default EditCaseSummaryModal;
