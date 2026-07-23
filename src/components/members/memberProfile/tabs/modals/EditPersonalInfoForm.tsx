/** @format */

import { useMemo } from "react";
import Modal from "@/designSystem/Modal";
import Button from "@/designSystem/Button";
import GenericForm, { type FieldConfig } from "@/designSystem/GenericForm";
import { useTranslation } from "@/hooks/useTranslation";
import { useUpdateEmployee } from "@/hooks/employees/employee.mutations";
import toast from "@/utilities/toast";
import type { EmployeeDetails } from "@/services/employeeService";
import { COUNTRY_NAME_OPTIONS } from "@/utilities/constants/countries";
import * as yup from "yup";

interface EditPersonalInfoFormProps {
	isOpen: boolean;
	onClose: () => void;
	employeeId: string | number;
	employeeData: EmployeeDetails | null;
	onSuccess?: () => void;
}

// Schema for personal info form
const personalInfoSchema = yup.object({
	first_name: yup
		.string()
		.required("First name is required")
		.min(2, "First name must be at least 2 characters")
		.max(50, "First name must be less than 50 characters"),
	last_name: yup
		.string()
		.required("Last name is required")
		.min(2, "Last name must be at least 2 characters")
		.max(50, "Last name must be less than 50 characters"),
	date_of_birth: yup.string().optional(),
	gender: yup.string().optional(),
	country: yup.string().optional(),
	// marital_status: yup.string().optional(),
});

type PersonalInfoFormData = yup.InferType<typeof personalInfoSchema>;

function EditPersonalInfoForm({
	isOpen,
	onClose,
	employeeId,
	employeeData,
	onSuccess,
}: EditPersonalInfoFormProps) {
	const { t } = useTranslation("members");
	const { t: tCommon } = useTranslation("common");
	const updateEmployeeMutation = useUpdateEmployee();
	const formId = "edit-personal-info-form";

	const defaultValues = useMemo<Partial<PersonalInfoFormData>>(() => {
		if (!employeeData) return {};
		return {
			first_name: employeeData.personal.first_name || "",
			last_name: employeeData.personal.last_name || "",
			date_of_birth: employeeData.personal.birth_date
				? new Date(employeeData.personal.birth_date).toISOString().split("T")[0]
				: "",
			gender: (employeeData.personal.gender as string) || "",
			country: employeeData.personal.country || "",
			// marital_status: (employeeData.personal.marital_status as string) || "",
		};
	}, [employeeData]);

	const genderOptions = useMemo(
		() => [
			{ id: "Male", label: t("options.gender.male") },
			{ id: "Female", label: t("options.gender.female") },
		],
		[t]
	);

	// const maritalStatusOptions = useMemo(
	// 	() => [
	// 		{ id: "Single", label: t("options.maritalStatus.single") },
	// 		{ id: "Married", label: t("options.maritalStatus.married") },
	// 		{ id: "Divorced", label: t("options.maritalStatus.divorced") },
	// 		{ id: "Widowed", label: t("options.maritalStatus.widowed") },
	// 	],
	// 	[t]
	// );

	const fields: FieldConfig[] = useMemo(
		() => [
			{
				name: "first_name",
				type: "text",
				label: t("fields.firstName"),
				placeholder: t("fields.firstName"),
				required: true,
			},
			{
				name: "last_name",
				type: "text",
				label: t("fields.lastName"),
				placeholder: t("fields.lastName"),
				required: true,
			},
			{
				name: "date_of_birth",
				type: "date",
				label: t("fields.dob"),
			},
			{
				name: "gender",
				type: "select",
				label: t("fields.gender"),
				placeholder: tCommon("select") || "Select",
				options: genderOptions,
			},
			{
				name: "country",
				type: "searchableSelect",
				label: t("fields.country"),
				placeholder: tCommon("select") || "Select",
				options: COUNTRY_NAME_OPTIONS,
			},
			// {
			// 	name: "marital_status",
			// 	type: "select",
			// 	label: t("fields.maritalStatus"),
			// 	placeholder: tCommon("select") || "Select",
			// 	options: maritalStatusOptions,
			// },
		],
		[t, tCommon, genderOptions]
	);

	const handleSubmit = async (data: PersonalInfoFormData) => {
		try {
			const personalPayload: {
				first_name?: string;
				last_name?: string;
				date_of_birth?: string;
				gender?: "Male" | "Female";
				country?: string;
				// marital_status?: "Single" | "Married" | "Divorced" | "Widowed";
			} = {};

			if (data.first_name !== (employeeData?.personal.first_name || "")) {
				personalPayload.first_name = data.first_name;
			}
			if (data.last_name !== (employeeData?.personal.last_name || "")) {
				personalPayload.last_name = data.last_name;
			}
			// Compare dates properly - handle ISO string format
			const currentDateOfBirth = employeeData?.personal.birth_date
				? new Date(employeeData.personal.birth_date).toISOString().split("T")[0]
				: "";
			const newDateOfBirth = data.date_of_birth || "";
			if (newDateOfBirth !== currentDateOfBirth) {
				personalPayload.date_of_birth = newDateOfBirth;
			}
			if (data.gender !== (employeeData?.personal.gender || "")) {
				personalPayload.gender = data.gender as "Male" | "Female";
			}
			if (data.country !== (employeeData?.personal.country || "")) {
				personalPayload.country = data.country;
			}
			// Compare marital_status - handle null/undefined properly
			// const currentMaritalStatus =
			// 	employeeData?.personal.marital_status || "";
			// const newMaritalStatus = data.marital_status || "";
			// if (newMaritalStatus !== currentMaritalStatus) {
			// 	personalPayload.marital_status = newMaritalStatus as
			// 		| "Single"
			// 		| "Married"
			// 		| "Divorced"
			// 		| "Widowed";
			// }

			// Only submit if there are changes
			if (Object.keys(personalPayload).length === 0) {
				toast.info(tCommon("noChanges") || "No changes to save");
				onClose();
				return;
			}

			// Structure payload to match UpdateEmployeeDto with nested personal object
			// The DTO expects: { personal: { first_name, last_name, marital_status, ... } }
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
					"Personal information updated successfully"
			);
			onSuccess?.();
			onClose();
		} catch (error) {
			console.error("Failed to update personal information:", error);
			toast.error(
				t("messages.updateError") ||
					tCommon("updateError") ||
					"Failed to update personal information. Please try again."
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
			title={t("profile.details.personal.title")}
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
				schema={personalInfoSchema}
				defaultValues={defaultValues}
				onSubmit={handleSubmit}
				fields={fields}
				showSubmitButton={false}
				validationBehavior='touched'
			/>
		</Modal>
	);
}

export default EditPersonalInfoForm;
