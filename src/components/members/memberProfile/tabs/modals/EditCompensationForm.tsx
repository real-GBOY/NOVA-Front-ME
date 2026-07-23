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

interface EditCompensationFormProps {
	isOpen: boolean;
	onClose: () => void;
	employeeId: string | number;
	employeeData: EmployeeDetails | null;
	onSuccess?: () => void;
}

// Schema for compensation form
const compensationSchema = yup.object({
	salary: yup.number().optional(),
	salary_cycle: yup.string().optional(),
	contract_type: yup.string().optional(),
	contract_name: yup.string().optional(),
	overtime_hourly_rate: yup.number().optional(),
	probation_period: yup.number().optional(),
});

type CompensationFormData = yup.InferType<typeof compensationSchema>;

function EditCompensationForm({
	isOpen,
	onClose,
	employeeId,
	employeeData,
	onSuccess,
}: EditCompensationFormProps) {
	const { t } = useTranslation("members");
	const { t: tCommon } = useTranslation("common");
	const updateEmployeeMutation = useUpdateEmployee();
	const formId = "edit-compensation-form";

	const defaultValues = useMemo<Partial<CompensationFormData>>(() => {
		if (!employeeData?.contract) return {};
		return {
			salary: employeeData.contract.salary || undefined,
			salary_cycle: employeeData.contract.salary_cycle || "",
			contract_type: employeeData.contract.contract_type || "",
			contract_name: employeeData.contract.contract_name || "",
			overtime_hourly_rate:
				employeeData.contract.overtime_hourly_rate || undefined,
			probation_period: employeeData.contract.probation_period || undefined,
		};
	}, [employeeData]);

	const salaryCycleOptions = useMemo(
		() => [
			{ id: "monthly", label: "Monthly" },
			{ id: "biweekly", label: "Biweekly" },
			{ id: "weekly", label: "Weekly" },
			{ id: "yearly", label: "Yearly" },
		],
		[]
	);

	const contractTypeOptions = useMemo(
		() => [
			{ id: "full_time", label: "Full Time" },
			{ id: "part_time", label: "Part Time" },
			{ id: "contract", label: "Contract" },
			{ id: "intern", label: "Intern" },
			{ id: "temporary", label: "Temporary" },
		],
		[]
	);

	const fields: FieldConfig[] = useMemo(
		() => [
			{
				name: "salary",
				type: "currency",
				label: t("fields.salary"),
				placeholder: t("fields.salary"),
			},
			{
				name: "salary_cycle",
				type: "select",
				label: "Salary Cycle",
				placeholder: tCommon("select") || "Select",
				options: salaryCycleOptions,
			},
			{
				name: "contract_type",
				type: "select",
				label: t("fields.contractType"),
				placeholder: tCommon("select") || "Select",
				options: contractTypeOptions,
			},
			{
				name: "contract_name",
				type: "text",
				label: "Contract Name",
				placeholder: "Contract Name",
			},
			{
				name: "overtime_hourly_rate",
				type: "currency",
				label: "Overtime Hourly Rate",
				placeholder: "Overtime Hourly Rate",
			},
			{
				name: "probation_period",
				type: "number",
				label: "Probation Period (Days)",
				placeholder: "Probation Period in Days",
			},
		],
		[t, tCommon, salaryCycleOptions, contractTypeOptions]
	);

	const handleSubmit = async (data: CompensationFormData) => {
		try {
			const currentContract = employeeData?.contract;
			const contractPayload: {
				salary?: number;
				salary_cycle?: string;
				contract_type?: string;
				contract_name?: string;
				overtime_hourly_rate?: number;
				probation_period?: number;
			} = {};

			if (
				data.salary !==
				(currentContract?.salary ? Number(currentContract.salary) : undefined)
			) {
				contractPayload.salary = data.salary;
			}

			if (data.salary_cycle !== (currentContract?.salary_cycle || "")) {
				contractPayload.salary_cycle = data.salary_cycle;
			}

			if (data.contract_type !== (currentContract?.contract_type || "")) {
				contractPayload.contract_type = data.contract_type as
					| "full_time"
					| "part_time"
					| "contract"
					| "intern"
					| "temporary";
			}

			if (data.contract_name !== (currentContract?.contract_name || "")) {
				contractPayload.contract_name = data.contract_name;
			}

			if (
				data.overtime_hourly_rate !==
				(currentContract?.overtime_hourly_rate
					? Number(currentContract.overtime_hourly_rate)
					: undefined)
			) {
				contractPayload.overtime_hourly_rate = data.overtime_hourly_rate;
			}

			if (
				data.probation_period !==
				(currentContract?.probation_period
					? Number(currentContract.probation_period)
					: undefined)
			) {
				contractPayload.probation_period = data.probation_period;
			}

			// Only submit if there are changes
			if (Object.keys(contractPayload).length === 0) {
				toast.info(tCommon("noChanges") || "No changes to save");
				onClose();
				return;
			}

			// Structure payload to match UpdateEmployeeDto with nested contract object
			// The DTO expects: { contract: { salary, contract_type, ... } }
			const payload = {
				contract: contractPayload,
			} as any;

			await updateEmployeeMutation.mutateAsync({
				id: employeeId,
				payload,
			});

			toast.success(
				t("messages.updateSuccess") ||
					tCommon("updateSuccess") ||
					"Compensation information updated successfully"
			);
			onSuccess?.();
			onClose();
		} catch (error) {
			console.error("Failed to update compensation:", error);
			toast.error(
				t("messages.updateError") ||
					tCommon("updateError") ||
					"Failed to update compensation. Please try again."
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
			title={t("profile.details.compensation.title")}
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
				schema={compensationSchema}
				defaultValues={defaultValues}
				onSubmit={handleSubmit}
				fields={fields}
				showSubmitButton={false}
				validationBehavior='touched'
			/>
		</Modal>
	);
}

export default EditCompensationForm;
