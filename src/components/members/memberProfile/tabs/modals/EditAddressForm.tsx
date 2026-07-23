/** @format */

import { useMemo } from "react";
import Modal from "@/designSystem/Modal";
import Button from "@/designSystem/Button";
import GenericForm, { type FieldConfig } from "@/designSystem/GenericForm";
import { useTranslation } from "@/hooks/useTranslation";
import { useUpdateEmployeeProfile } from "@/hooks/employees/employee.queries";
import toast from "@/utilities/toast";
import type { EmployeeDetails } from "@/services/employeeService";
import { COUNTRY_NAME_OPTIONS } from "@/utilities/constants/countries";
import * as yup from "yup";

interface EditAddressFormProps {
	isOpen: boolean;
	onClose: () => void;
	employeeId: string | number;
	employeeData: EmployeeDetails | null;
	onSuccess?: () => void;
}

// Schema for address form
const addressSchema = yup.object({
	address: yup.string().optional(),
	country: yup.string().optional(),
});

type AddressFormData = yup.InferType<typeof addressSchema>;

function EditAddressForm({
	isOpen,
	onClose,
	employeeId,
	employeeData,
	onSuccess,
}: EditAddressFormProps) {
	const { t } = useTranslation("members");
	const { t: tCommon } = useTranslation("common");
	const updateProfileMutation = useUpdateEmployeeProfile();
	const formId = "edit-address-form";

	const defaultValues = useMemo<Partial<AddressFormData>>(() => {
		if (!employeeData) return {};
		return {
			address: employeeData.personal.address || "",
			country: employeeData.personal.country || "",
		};
	}, [employeeData]);

	const fields: FieldConfig[] = useMemo(
		() => [
			{
				name: "address",
				type: "text",
				label: t("fields.address"),
				placeholder: t("fields.address"),
			},
			{
				name: "country",
				type: "searchableSelect",
				label: t("fields.country"),
				placeholder: tCommon("select") || "Select",
				options: COUNTRY_NAME_OPTIONS,
			},
		],
		[t]
	);

	const handleSubmit = async (data: AddressFormData) => {
		try {
			const payload: {
				address?: string;
				country?: string;
			} = {};

			if (data.address !== (employeeData?.personal.address || "")) {
				payload.address = data.address;
			}
			if (data.country !== (employeeData?.personal.country || "")) {
				payload.country = data.country;
			}

			// Only submit if there are changes
			if (Object.keys(payload).length === 0) {
				toast.info(tCommon("noChanges") || "No changes to save");
				onClose();
				return;
			}

			await updateProfileMutation.mutateAsync({
				id: employeeId,
				payload,
			});

			toast.success(
				t("messages.updateSuccess") ||
					tCommon("updateSuccess") ||
					"Address information updated successfully"
			);
			onSuccess?.();
			onClose();
		} catch (error) {
			console.error("Failed to update address:", error);
			toast.error(
				t("messages.updateError") ||
					tCommon("updateError") ||
					"Failed to update address. Please try again."
			);
		}
	};

	const handleClose = () => {
		if (updateProfileMutation.isPending) return;
		onClose();
	};

	return (
		<Modal
			isOpen={isOpen}
			onClose={handleClose}
			title={t("profile.details.address.title")}
			size='medium'
			overflow='visible'
			footer={
				<div className='flex justify-end gap-3'>
					<Button
						variant='secondary'
						onClick={handleClose}
						disabled={updateProfileMutation.isPending}>
						{tCommon("cancel")}
					</Button>
					<Button
						variant='primary'
						type='submit'
						form={formId}
						isLoading={updateProfileMutation.isPending}
						disabled={updateProfileMutation.isPending}>
						{tCommon("save")}
					</Button>
				</div>
			}>
			<GenericForm
				id={formId}
				schema={addressSchema}
				defaultValues={defaultValues}
				onSubmit={handleSubmit}
				fields={fields}
				showSubmitButton={false}
				validationBehavior='touched'
			/>
		</Modal>
	);
}

export default EditAddressForm;
