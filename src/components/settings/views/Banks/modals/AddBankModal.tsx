/** @format */

import { useMemo, useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import Modal from "@/designSystem/Modal";
import GenericForm, { FieldConfig } from "@/designSystem/GenericForm";
import Button from "@/designSystem/Button";
import ConfirmModal from "@/designSystem/ConfirmModal";
import * as yup from "yup";
import { useCreateBank, useUpdateBank } from "@/hooks/banks/useBanks";
import type {
	CreateBankRequest,
	UpdateBankRequest,
} from "@/services/bankService";
import type { Bank } from "../types";
import toast from "@/utilities/toast";

type AddBankModalProps = {
	isOpen: boolean;
	onClose: () => void;
	bank?: Bank | null; // For editing
	onSuccess?: () => void;
};

type BankFormValues = {
	name: string;
	shortCode: string;
	balance?: string;
	status: string;
};

function AddBankModal({ isOpen, onClose, bank, onSuccess }: AddBankModalProps) {
	const { t } = useTranslation("settings");
	const { t: tCommon } = useTranslation("common");
	const isEditMode = !!bank;
	const createMutation = useCreateBank();
	const updateMutation = useUpdateBank();
	const [isDirty, setIsDirty] = useState(false);
	const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

	const schema = useMemo(() => {
		const shape = {
			name: yup.string().required(t("validation.required")),
			shortCode: yup.string().required(t("validation.required")),
			status: yup.string().required(t("validation.required")),
		};

		return yup.object().shape({
			...shape,
			balance: isEditMode
				? yup.string().optional()
				: yup.string().required(t("validation.required")),
		});
	}, [isEditMode, t]);

	const fields: FieldConfig[] = [
		{
			name: "name",
			type: "text",
			label: t("banks.modal.name"),
			placeholder: t("banks.modal.namePlaceholder"),
			required: true,
		},
		{
			name: "shortCode",
			type: "text",
			label: t("banks.modal.shortCode"),
			placeholder: t("banks.modal.shortCodePlaceholder"),
			required: true,
		},
		...(!isEditMode
			? [
					{
						name: "balance",
						type: "text",
						label: t("banks.modal.balance"),
						placeholder: t("banks.modal.balancePlaceholder"),
						required: true,
					} as FieldConfig,
			  ]
			: []),
		{
			name: "status",
			type: "select",
			label: t("banks.modal.status"),
			placeholder: t("banks.modal.statusPlaceholder"),
			required: true,
			options: [
				{ id: "active", label: t("banks.status.active") },
				{ id: "inactive", label: t("banks.status.inactive") },
			],
		},
	];

	// Compute default values based on bank prop
	const defaultValues = useMemo(() => {
		if (bank) {
			// Use opening_balance from backend response directly (priority)
			// Fallback to extracting from formatted balance string if opening_balance is not available
			let balanceValue = "";
			if (bank.opening_balance !== undefined && bank.opening_balance !== null) {
				balanceValue = bank.opening_balance.toString();
			} else if (bank.balance) {
				// Extract number from formatted balance string like "100000 AED"
				const match = bank.balance.match(/[\d.]+/);
				balanceValue = match ? match[0] : "";
			}

			return {
				// Use backend field names first, fallback to legacy fields
				name: bank.bank_name || bank.name || "",
				shortCode: bank.account_code || bank.shortCode || "",
				balance: balanceValue,
				// Normalize status: backend returns "Active"/"Inactive", form needs lowercase
				status: (bank.status?.toLowerCase() || "active") as string,
			};
		}
		return {
			name: "",
			shortCode: "",
			balance: "",
			status: "active",
		};
	}, [bank]);

	const handleSubmit = async (data: BankFormValues) => {
		try {
			if (bank) {
				// Update existing bank - use bank_id from backend response
				const bankId = bank.bank_id || bank.id;
				if (bankId) {
					const payload: UpdateBankRequest = {
						bank_name: data.name || undefined,
						account_code: data.shortCode || null,
						// Preserve existing backend fields
						currency: bank.currency || "AED",
						account_id: bank.account_id || undefined,
						// Convert status to backend format: "Active" or "Inactive"
						status: data.status === "active" ? "Active" : "Inactive",
					};
					await updateMutation.mutateAsync({
						id: bankId,
						payload,
					});
					toast.success(t("banks.toast.updateSuccess"));
				}
			} else {
			
				const accountCodeValue = data.shortCode?.trim() || "";
				if (!accountCodeValue) {
					console.error(
						"accountCode is empty, but validation should have caught this"
					);
					return;
				}

				
				const payload: CreateBankRequest = {
					bank_name: data.name.trim(),
					account_code: accountCodeValue || null, 
					opening_balance: parseFloat(data.balance || "") || 0,
					currency: "AED", // TODO: Get currency from form if needed
					status: data.status === "active" ? "Active" : "Inactive",
				};

				await createMutation.mutateAsync(payload);
				toast.success(t("banks.toast.createSuccess"));
			}
			if (onSuccess) onSuccess();
			onClose();
		} catch (error) {
			console.error("Error saving bank:", error);
			toast.error(t("banks.toast.saveError"));
		}
	};

	const isLoading = isEditMode
		? updateMutation.isPending
		: createMutation.isPending;

	const footer = (
		<div className='flex justify-end gap-3 w-full'>
			<Button
				variant='secondary'
				onClick={() => {
					if (isDirty) {
						setShowDiscardConfirm(true);
						return;
					}
					onClose();
				}}
				disabled={isLoading}>
				{t("banks.modal.cancel")}
			</Button>
			<Button type='submit' form='add-bank-form' disabled={isLoading}>
				{isLoading && (
					<span className='animate-spin mr-2 w-4 h-4 border-2 border-white border-t-transparent rounded-full inline-block align-middle' />
				)}
				{isEditMode
					? t("banks.modal.updateButton") || "Update Bank"
					: t("banks.modal.addButton")}
			</Button>
		</div>
	);

	return (
		<Modal
			isOpen={isOpen}
			onClose={() => {
				if (isDirty) {
					setShowDiscardConfirm(true);
					return;
				}
				onClose();
			}}
			title={
				isEditMode
					? t("banks.modal.editTitle") || "Edit Bank"
					: t("banks.modal.title")
			}
			width='w-[30rem]'
			size='medium'
			footer={footer}>
			<GenericForm<BankFormValues>
				key={bank?.bank_id || bank?.id || "new"} // Force remount when switching between create/edit
				id='add-bank-form'
				fields={fields}
				schema={schema}
				onSubmit={handleSubmit}
				showSubmitButton={false}
				defaultValues={defaultValues}
				onDirtyChange={setIsDirty}
			/>
			<ConfirmModal
				isOpen={showDiscardConfirm}
				onClose={() => setShowDiscardConfirm(false)}
				onConfirm={onClose}
				title={tCommon("unsavedChanges.title")}
				description={tCommon("unsavedChanges.description")}
				confirmText={tCommon("unsavedChanges.confirm")}
				cancelText={tCommon("unsavedChanges.cancel")}
				variant='primary'
				icon='exclamation'
			/>
		</Modal>
	);
}

export default AddBankModal;
