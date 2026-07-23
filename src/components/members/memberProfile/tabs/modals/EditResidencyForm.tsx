/** @format */

import { useMemo } from "react";
import Modal from "@/designSystem/Modal";
import Button from "@/designSystem/Button";
import GenericForm, { type FieldConfig } from "@/designSystem/GenericForm";
import { useTranslation } from "@/hooks/useTranslation";
import { useUpdateResidency } from "@/hooks/employees/employee.mutations";
import toast from "@/utilities/toast";
import type { ResidencyPermit } from "@/services/employeeService";
import { COUNTRY_NAME_OPTIONS } from "@/utilities/constants/countries";
import * as yup from "yup";

interface EditResidencyFormProps {
	isOpen: boolean;
	onClose: () => void;
	permitId: number;
	employeeId: string | number;
	permitData: ResidencyPermit | null;
	onSuccess?: () => void;
}

// Schema for residency form
const residencySchema = yup.object({
	permit_number: yup
		.string()
		.required("Permit number is required")
		.min(1, "Permit number is required"),
	permit_type: yup.string().optional(),
	issue_date: yup.string().required("Issue date is required"),
	expiration_date: yup
		.string()
		.required("Expiry date is required")
		.test(
			"expiry-after-issue",
			"Expiry date must be after issue date",
			function (value) {
				const { issue_date } = this.parent;
				if (!value || !issue_date) return true;
				return new Date(value) >= new Date(issue_date);
			}
		),
	country: yup.string().optional(),
	status: yup.string().required("Status is required"),
});

type ResidencyFormData = yup.InferType<typeof residencySchema>;

function EditResidencyForm({
	isOpen,
	onClose,
	permitId,
	employeeId,
	permitData,
	onSuccess,
}: EditResidencyFormProps) {
	const { t } = useTranslation("members");
	const { t: tCommon } = useTranslation("common");
	const updateResidencyMutation = useUpdateResidency();

	const defaultValues = useMemo<Partial<ResidencyFormData>>(() => {
		if (!permitData) return {};
		return {
			permit_number: permitData.permit_number || "",
			permit_type: permitData.permit_type || "",
			issue_date: permitData.issue_date
				? new Date(permitData.issue_date).toISOString().split("T")[0]
				: "",
			expiration_date: permitData.expiration_date
				? new Date(permitData.expiration_date).toISOString().split("T")[0]
				: "",
			country: permitData.country || "",
			status: permitData.status || "",
		};
	}, [permitData]);

	const statusOptions = useMemo(
		() => [
			{ id: "Active", label: tCommon("members.residencyDetails.statusOptions.active") },
			{ id: "Expired", label: tCommon("members.residencyDetails.statusOptions.expired") },
			{ id: "Pending", label: tCommon("members.residencyDetails.statusOptions.pending") },
			{ id: "Cancelled", label: tCommon("members.residencyDetails.statusOptions.cancelled") },
		],
		[tCommon]
	);

	const permitTypeOptions = useMemo(
		() => [
			{ id: "Local", label: tCommon("members.residencyDetails.visaTypeOptions.local") },
			{ id: "Employment Visa", label: tCommon("members.residencyDetails.visaTypeOptions.employmentVisa") },
			{ id: "Visit Visa", label: tCommon("members.residencyDetails.visaTypeOptions.visitVisa") },
			{ id: "Golden Visa", label: tCommon("members.residencyDetails.visaTypeOptions.goldenVisa") },
			{ id: "Student Visa", label: tCommon("members.residencyDetails.visaTypeOptions.studentVisa") },
			{ id: "Dependent Visa", label: tCommon("members.residencyDetails.visaTypeOptions.dependentVisa") },
		],
		[tCommon]
	);

	const fields: FieldConfig[] = useMemo(
		() => [
			{
				name: "permit_number",
				type: "text",
				label: t("profile.residency.permitNumber"),
				placeholder: t("profile.residency.permitNumber"),
				required: true,
			},
			{
				name: "permit_type",
				type: "select",
				label: t("profile.residency.permitType"),
				placeholder: tCommon("select") || "Select",
				options: permitTypeOptions,
			},
			{
				name: "issue_date",
				type: "date",
				label: t("profile.residency.issueDate"),
				required: true,
			},
			{
				name: "expiration_date",
				type: "date",
				label: t("profile.residency.expiryDate"),
				required: true,
			},
			{
				name: "country",
				type: "searchableSelect",
				label: t("profile.residency.country"),
				placeholder: tCommon("members.basicInfo.countryPlaceholder") || "Search for a country",
				options: COUNTRY_NAME_OPTIONS,
			},
			{
				name: "status",
				type: "select",
				label: t("profile.residency.status"),
				placeholder: tCommon("select") || "Select",
				options: statusOptions,
				required: true,
			},
		],
		[t, tCommon, permitTypeOptions, statusOptions]
	);

	const handleSubmit = async (data: ResidencyFormData) => {
		try {
			// Check if there are any changes
			const currentIssueDate = permitData?.issue_date
				? new Date(permitData.issue_date).toISOString().split("T")[0]
				: "";
			const currentExpiryDate = permitData?.expiration_date
				? new Date(permitData.expiration_date).toISOString().split("T")[0]
				: "";

			const hasChanges =
				data.permit_number !== (permitData?.permit_number || "") ||
				data.permit_type !== (permitData?.permit_type || "") ||
				data.issue_date !== currentIssueDate ||
				data.expiration_date !== currentExpiryDate ||
				data.country !== (permitData?.country || "") ||
				data.status !== (permitData?.status || "");

			if (!hasChanges) {
				toast.info(tCommon("noChanges") || "No changes to save");
				onClose();
				return;
			}

			// Send the complete object with all fields (current data + edits)
			const payload = {
				permit_number: data.permit_number,
				permit_type: data.permit_type || null,
				issue_date: data.issue_date,
				expiration_date: data.expiration_date,
				country: data.country || null,
				status: data.status,
				// Preserve existing document_file_id if not being changed
				document_file_id: permitData?.document_file_id || null,
			};

			await updateResidencyMutation.mutateAsync({
				permitId,
				payload,
				employeeId,
			});

			toast.success(
				t("messages.updateSuccess") ||
					tCommon("updateSuccess") ||
					"Residency information updated successfully"
			);
			onSuccess?.();
			onClose();
		} catch (error) {
			console.error("Failed to update residency information:", error);
			toast.error(
				t("messages.updateError") ||
					tCommon("updateError") ||
					"Failed to update residency information. Please try again."
			);
		}
	};

	const handleClose = () => {
		if (updateResidencyMutation.isPending) return;
		onClose();
	};

	return (
		<Modal
			isOpen={isOpen}
			onClose={handleClose}
			title={t("profile.residency.editTitle") || "Edit Residency Permit"}
			size='medium'
			footer={
				<div className='flex justify-end gap-3'>
					<Button
						variant='secondary'
						onClick={handleClose}
						disabled={updateResidencyMutation.isPending}>
						{tCommon("cancel")}
					</Button>
				</div>
			}>
			<GenericForm
				schema={residencySchema}
				defaultValues={defaultValues}
				onSubmit={handleSubmit}
				fields={fields}
				showSubmitButton={true}
				submitButtonText={tCommon("save")}
				validationBehavior='touched'
			/>
		</Modal>
	);
}

export default EditResidencyForm;

