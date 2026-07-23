/** @format */

import { useEffect, useMemo, useState } from "react";
import * as yup from "yup";
import Modal from "@/designSystem/Modal";
import ConfirmModal from "@/designSystem/ConfirmModal";
import GenericForm, { FieldConfig } from "@/designSystem/GenericForm";
import { Ban } from "@/Icons";
import type { Invoice } from "./data";
import { useTranslation } from "@/hooks/useTranslation";

interface VoidInvoiceModalProps {
	isOpen: boolean;
	onClose: () => void;
	invoice: Invoice | null;
	onSubmit: (data: { note: string }) => void;
	isLoading?: boolean;
}

type VoidInvoiceFormValues = {
	note: string;
};

const FORM_ID = "void-invoice-form";
const NOTE_LIMIT = 1000;

export default function VoidInvoiceModal({
	isOpen,
	onClose,
	invoice,
	onSubmit,
	isLoading = false,
}: VoidInvoiceModalProps) {
	const { t } = useTranslation("settings");
	const { t: tCommon } = useTranslation("common");
	const [isDirty, setIsDirty] = useState(false);
	const [showCloseConfirm, setShowCloseConfirm] = useState(false);
	const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
	const [pendingSubmission, setPendingSubmission] =
		useState<VoidInvoiceFormValues | null>(null);

	const defaultValues = useMemo<VoidInvoiceFormValues>(
		() => ({ note: "" }),
		[isOpen]
	);

	const [formValues, setFormValues] =
		useState<VoidInvoiceFormValues>(defaultValues);

	useEffect(() => {
		if (!isOpen) return;
		setIsDirty(false);
		setShowCloseConfirm(false);
		setShowSubmitConfirm(false);
		setPendingSubmission(null);
		setFormValues(defaultValues);
	}, [isOpen, defaultValues]);

	const noteLength = formValues.note?.length ?? 0;

	const schema = useMemo(
		() =>
			yup.object().shape({
				note: yup
					.string()
					.trim()
					.required(t("invoices.voidModal.validation.required"))
					.max(
						NOTE_LIMIT,
						t("invoices.voidModal.validation.maxLength", { max: NOTE_LIMIT })
					),
			}),
		[t]
	);

	const fields = useMemo<FieldConfig[]>(
		() => [
			{
				name: "note",
				type: "textarea",
				label: t("invoices.voidModal.noteLabel"),
				placeholder: t("invoices.voidModal.notePlaceholder"),
				required: true,
				rows: 4,
				maxLength: NOTE_LIMIT,
				helperText: t("invoices.voidModal.noteCounter", {
					current: noteLength,
					max: NOTE_LIMIT,
				}),
			},
		],
		[noteLength, t]
	);

	const handleCloseAttempt = () => {
		if (isDirty) {
			setShowCloseConfirm(true);
			return;
		}
		onClose();
	};

	const handleConfirmClose = () => {
		setShowCloseConfirm(false);
		onClose();
	};

	const handleValidatedSubmit = (data: VoidInvoiceFormValues) => {
		setPendingSubmission(data);
		setShowSubmitConfirm(true);
	};

	const handleConfirmSubmit = () => {
		if (!pendingSubmission) return;
		setShowSubmitConfirm(false);
		onSubmit({ note: pendingSubmission.note.trim() });
	};

	if (!isOpen) return null;

	return (
		<>
			<Modal
				isOpen={isOpen}
				onClose={handleCloseAttempt}
				title={t("invoices.voidModal.title")}>
				<div className="flex flex-col gap-6">
					<div className="p-4 bg-danger/10 border border-danger/20 rounded-xl flex items-center gap-4">
						<div className="w-12 h-12 rounded-full bg-danger/20 flex items-center justify-center">
							<Ban className="w-6 h-6 fill-danger" />
						</div>
						<div>
							<p className="text-sm text-text-sub">
								{t("invoices.voidModal.invoiceLabel")}
							</p>
							<p className="text-lg font-semibold text-text-strong">
								{invoice?.invoice_code ||
									invoice?.invoice_number ||
									t(
										"invoices.voidModal.invoiceFallback",
										"Selected Invoice"
									)}
							</p>
						</div>
					</div>

					<GenericForm<VoidInvoiceFormValues>
						id={FORM_ID}
						schema={schema}
						defaultValues={defaultValues}
						formData={isOpen ? defaultValues : undefined}
						onSubmit={handleValidatedSubmit}
						onFieldChange={(_field, _value, allData) =>
							setFormValues(allData)
						}
						fields={fields}
						showSubmitButton={false}
						onDirtyChange={setIsDirty}
					/>

					<div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
						<button
							type="button"
							onClick={handleCloseAttempt}
							disabled={isLoading}
							className="px-4 py-2.5 text-sm font-medium text-text-sub hover:text-text-strong transition-colors">
							{tCommon("actions.cancel")}
						</button>
						<button
							type="submit"
							form={FORM_ID}
							disabled={isLoading}
							className="px-6 py-2.5 bg-danger text-white text-sm font-medium rounded-lg hover:bg-danger/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
							{isLoading && (
								<div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
							)}
							{t("invoices.voidModal.confirmButton")}
						</button>
					</div>
				</div>
			</Modal>

			<ConfirmModal
				isOpen={showCloseConfirm}
				onClose={() => setShowCloseConfirm(false)}
				onConfirm={handleConfirmClose}
				title={tCommon("unsavedChanges.title")}
				description={tCommon("unsavedChanges.description")}
				confirmText={tCommon("unsavedChanges.confirm")}
				cancelText={tCommon("unsavedChanges.cancel")}
				variant="error"
				icon="exclamation"
			/>

			<ConfirmModal
				isOpen={showSubmitConfirm}
				onClose={() => setShowSubmitConfirm(false)}
				onConfirm={handleConfirmSubmit}
				title={t("invoices.voidModal.confirmTitle")}
				description={t("invoices.voidModal.confirmDescription")}
				confirmText={t("invoices.voidModal.confirmButton")}
				cancelText={tCommon("actions.cancel")}
				variant="error"
				icon="exclamation"
				isLoading={isLoading}
			/>
		</>
	);
}
