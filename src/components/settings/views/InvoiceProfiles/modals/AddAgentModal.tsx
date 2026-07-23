/** @format */

import { useMemo, useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import Modal from "@/designSystem/Modal";
import GenericForm, { FieldConfig } from "@/designSystem/GenericForm";
import Button from "@/designSystem/Button";
import ConfirmModal from "@/designSystem/ConfirmModal";
import PhoneInput from "@/designSystem/ui/PhoneInput";
import * as yup from "yup";
import type { Agent } from "../types";

type AddAgentModalProps = {
	isOpen: boolean;
	onClose: () => void;
	isLoading?: boolean;
	agent?: Agent | null; // For editing
	onSuccess?: (agent: Omit<Agent, "id">) => void;
};

type AgentFormValues = {
	name: string;
	number: string;
	contactNumber: string;
	email: string;
	address?: string;
	notes?: string;
	status: "active" | "inactive";
};

function AddAgentModal({
	isOpen,
	onClose,
	isLoading = false,
	agent,
	onSuccess,
}: AddAgentModalProps) {
	const { t } = useTranslation("settings");
	const { t: tCommon } = useTranslation("common");
	const isEditMode = !!agent;
	const [isDirty, setIsDirty] = useState(false);
	const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

	const schema = yup.object().shape({
		name: yup.string().required(t("validation.required")),
		number: yup.string().required(t("validation.required")),
		contactNumber: yup.string().required(t("validation.required")),
		email: yup
			.string()
			.email(t("validation.email"))
			.required(t("validation.required")),
		address: yup.string().optional(),
		notes: yup.string().optional(),
		status: yup
			.string()
			.oneOf(["active", "inactive"])
			.required(t("validation.required")),
	});

	const fields: FieldConfig[] = useMemo(
		() => [
			{
				name: "name",
				label: t("invoiceProfiles.modal.agentName"),
				placeholder: t("invoiceProfiles.modal.agentNamePlaceholder"),
				type: "text",
				required: true,
				disabled: isLoading,
			},
			{
				name: "number",
				label: t("invoiceProfiles.modal.agentNumber"),
				placeholder: t("invoiceProfiles.modal.agentNumberPlaceholder"),
				type: "text",
				required: true,
				disabled: isLoading,
			},
			{
				name: "contactNumber",
				type: "custom",
				label: t("invoiceProfiles.modal.contactNumber"),
				required: true,
				render: (form) => (
					<div className='flex flex-col gap-1'>
						<label className='block text-sm font-medium text-text-strong'>
							{t("invoiceProfiles.modal.contactNumber")}
							<span className='text-primary'>*</span>
						</label>
						<PhoneInput
							value={form.watch("contactNumber") || ""}
							onChange={(value) => {
								form.setValue("contactNumber", value || "", {
									shouldValidate: true,
									shouldDirty: true,
								});
							}}
							placeholder={t("invoiceProfiles.modal.contactNumberPlaceholder")}
							disabled={isLoading}
						/>
						{form.formState.errors.contactNumber && (
							<p className='text-sm text-danger mt-1'>
								{form.formState.errors.contactNumber.message as string}
							</p>
						)}
					</div>
				),
			},
			{
				name: "email",
				type: "custom",
				label: t("invoiceProfiles.modal.emailAddress"),
				required: true,
				render: (form) => (
					<div className='flex flex-col gap-1'>
						<label className='block text-sm font-medium text-text-strong'>
							{t("invoiceProfiles.modal.emailAddress")}
							<span className='text-primary'>*</span>
						</label>
						<input
							type='email'
							{...form.register("email")}
							placeholder={t("invoiceProfiles.modal.emailAddressPlaceholder")}
							disabled={isLoading}
							className='w-full px-3 py-2.5 text-sm rounded-[10px] border border-border bg-background text-text-sub placeholder:text-text-soft focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
						/>
						{form.formState.errors.email && (
							<p className='text-sm text-danger mt-1'>
								{form.formState.errors.email.message as string}
							</p>
						)}
					</div>
				),
			},
			{
				name: "address",
				label: t("invoiceProfiles.modal.address"),
				placeholder: t("invoiceProfiles.modal.addressPlaceholder"),
				type: "text",
				required: false,
				disabled: isLoading,
			},
			{
				name: "notes",
				label: t("invoiceProfiles.modal.notes"),
				placeholder: t("invoiceProfiles.modal.notesPlaceholder"),
				type: "textarea",
				required: false,
				disabled: isLoading,
			},
			{
				name: "status",
				label: t("invoiceProfiles.modal.status"),
				placeholder: t("invoiceProfiles.modal.statusPlaceholder"),
				type: "select",
				required: true,
				disabled: isLoading,
				options: [
					{ id: "active", label: t("invoiceProfiles.status.active") },
					{ id: "inactive", label: t("invoiceProfiles.status.inactive") },
				],
			},
		],
		[t, isLoading]
	);

	const handleSubmit = async (data: AgentFormValues) => {
		if (isLoading) {
			return;
		}
		if (onSuccess) {
			onSuccess({
				name: data.name,
				number: data.number,
				contactNumber: data.contactNumber,
				email: data.email,
				address: data.address,
				notes: data.notes,
				status: data.status,
			} as any);
		}
		onClose();
	};

	// Compute default values based on agent prop
	const defaultValues = useMemo(() => {
		if (agent) {
			return {
				name: agent.name || "",
				number: agent.number || agent.agent_code || "",
				contactNumber: agent.contact_number || agent.contactNumber || "",
				email: agent.email || "",
				address: agent.address || "",
				notes: agent.notes || "",
				status: (agent.status?.toLowerCase() || "active") as "active" | "inactive",
			};
		}
		return {
			name: "",
			number: "",
			contactNumber: "",
			email: "",
			address: "",
			notes: "",
			status: "active" as "active" | "inactive",
		};
	}, [agent]);

	const handleClose = () => {
		if (isLoading) return;
		if (isDirty) {
			setShowDiscardConfirm(true);
			return;
		}
		onClose();
	};

	const footer = (
		<div className='flex justify-end gap-3 w-full'>
			<Button variant='secondary' onClick={handleClose} disabled={isLoading}>
				{t("invoiceProfiles.modal.cancel")}
			</Button>
			<Button type='submit' form='add-agent-form' disabled={isLoading}>
				{isLoading && (
					<span className='animate-spin mr-2 w-4 h-4 border-2 border-white border-t-transparent rounded-full inline-block align-middle' />
				)}
				{t(isEditMode ? "invoiceProfiles.modal.updateAgentButton" : "invoiceProfiles.modal.addAgentButton")}
			</Button>
		</div>
	);

	return (
		<Modal
			isOpen={isOpen}
			onClose={handleClose}
			title={t(isEditMode ? "invoiceProfiles.modal.editAgentTitle" : "invoiceProfiles.modal.addAgentTitle")}
			width='w-[30rem]'
			size='medium'
			overflow='visible'
			footer={footer}>
			<GenericForm<AgentFormValues>
				key={agent?.agent_id || agent?.id || "new"} // Force remount when switching between create/edit
				id='add-agent-form'
				schema={schema}
				onSubmit={handleSubmit}
				fields={fields}
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

export default AddAgentModal;
