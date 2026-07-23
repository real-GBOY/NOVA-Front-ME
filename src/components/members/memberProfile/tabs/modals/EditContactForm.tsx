/** @format */

import { useMemo } from "react";
import Modal from "@/designSystem/Modal";
import Button from "@/designSystem/Button";
import GenericForm, { type FieldConfig } from "@/designSystem/GenericForm";
import { useTranslation } from "@/hooks/useTranslation";
import { useUpdateEmployee } from "@/hooks/employees/employee.mutations";
import toast from "@/utilities/toast";
import type { EmployeeDetails } from "@/services/employeeService";
import * as yup from "yup";

interface EditContactFormProps {
	isOpen: boolean;
	onClose: () => void;
	employeeId: string | number;
	employeeData: EmployeeDetails | null;
	onSuccess?: () => void;
}

// Schema for contact form
const contactSchema = yup.object({
	email: yup.string().email("Please enter a valid email address").optional(),
	phone_number: yup.string().optional(),
});

type ContactFormData = yup.InferType<typeof contactSchema>;

function EditContactForm({
	isOpen,
	onClose,
	employeeId,
	employeeData,
	onSuccess,
}: EditContactFormProps) {
	const { t } = useTranslation("members");
	const { t: tCommon } = useTranslation("common");
	const updateEmployeeMutation = useUpdateEmployee();
	const formId = "edit-contact-form";

	const defaultValues = useMemo<Partial<ContactFormData>>(() => {
		if (!employeeData) return {};
		return {
			email: employeeData.personal.email || "",
			phone_number: employeeData.personal.phone_number || "",
		};
	}, [employeeData]);

	const fields: FieldConfig[] = useMemo(
		() => [
			{
				name: "email",
				type: "text",
				label: t("fields.email"),
				placeholder: t("fields.email"),
			},
			{
				name: "phone_number",
				type: "text",
				label: t("fields.mobile"),
				placeholder: t("fields.mobile"),
			},
		],
		[t]
	);

	const handleSubmit = async (data: ContactFormData) => {
		try {
			const personalPayload: {
				email?: string;
				phone_number?: string;
			} = {};

			if (data.email !== (employeeData?.personal.email || "")) {
				personalPayload.email = data.email;
			}
			if (data.phone_number !== (employeeData?.personal.phone_number || "")) {
				personalPayload.phone_number = data.phone_number;
			}

			// Only submit if there are changes
			if (Object.keys(personalPayload).length === 0) {
				toast.info(tCommon("noChanges") || "No changes to save");
				onClose();
				return;
			}

			// Structure payload to match UpdateEmployeeDto with nested personal object
			// The DTO expects: { personal: { email, phone_number } }
			const payload = {
				personal: personalPayload,
			} as any;

			await updateEmployeeMutation.mutateAsync({
				id: employeeId,
				payload,
			});

			toast.success(
				t("messages.updateSuccess") ||
					tCommon("updateSuccess") ||
					"Contact information updated successfully"
			);
			onSuccess?.();
			onClose();
		} catch (error) {
			console.error("Failed to update contact information:", error);
			toast.error(
				t("messages.updateError") ||
					tCommon("updateError") ||
					"Failed to update contact information. Please try again."
			);
		}
	};

	const handleClose = () => {
		if (updateEmployeeMutation.isPending) return;
		onClose();
	};

	return (
		<Modal
			isOpen={isOpen}
			onClose={handleClose}
			title={t("profile.details.contact.title")}
			size='medium'
			overflow='visible'
			footer={
				<div className='flex justify-end gap-3'>
					<Button
						variant='secondary'
						onClick={handleClose}
						disabled={updateEmployeeMutation.isPending}>
						{tCommon("cancel")}
					</Button>
					<Button
						variant='primary'
						type='submit'
						form={formId}
						isLoading={updateEmployeeMutation.isPending}
						disabled={updateEmployeeMutation.isPending}>
						{tCommon("save")}
					</Button>
				</div>
			}>
			<GenericForm
				id={formId}
				schema={contactSchema}
				defaultValues={defaultValues}
				onSubmit={handleSubmit}
				fields={fields}
				showSubmitButton={false}
				validationBehavior='touched'
			/>
		</Modal>
	);
}

export default EditContactForm;
