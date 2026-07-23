/** @format */

import { useMemo } from "react";
import Modal from "@/designSystem/Modal";
import Button from "@/designSystem/Button";
import GenericForm, { type FieldConfig } from "@/designSystem/GenericForm";
import SearchableMultiSelect from "@/designSystem/SearchableMultiSelect";
import { useTranslation } from "@/hooks/useTranslation";
import { useUpdateEmployee } from "@/hooks/employees/employee.mutations";
import toast from "@/utilities/toast";
import type { EmployeeDetails } from "@/services/employeeService";
import * as yup from "yup";

interface EditWorkInfoFormProps {
	isOpen: boolean;
	onClose: () => void;
	employeeId: string | number;
	employeeData: EmployeeDetails | null;
	availableJobTitles: Array<{ id: string; title: string }>;
	availableTeams: Array<{ id: string; name: string }>;
	availableRoles: Array<{ id: string; title: string }>;
	availableManagers: Array<{ id: string; name: string; avatar?: string }>;
	onSuccess?: () => void;
}

// Schema for work info form
const workInfoSchema = yup.object({
	job_title_id: yup.string().required("Job title is required"),
	team_ids: yup.array().of(yup.string()).optional(),
	role_id: yup.string().required("Role is required"),
	manager_id: yup.string().optional(),
	start_date: yup.string().optional(),
});

type WorkInfoFormData = yup.InferType<typeof workInfoSchema>;

function EditWorkInfoForm({
	isOpen,
	onClose,
	employeeId,
	employeeData,
	availableJobTitles,
	availableTeams,
	availableRoles,
	availableManagers,
	onSuccess,
}: EditWorkInfoFormProps) {
	const { t } = useTranslation("members");
	const { t: tCommon } = useTranslation("common");
	const updateEmployeeMutation = useUpdateEmployee();
	const formId = "edit-work-info-form";

	const defaultValues = useMemo<Partial<WorkInfoFormData>>(() => {
		if (!employeeData) return {};
		return {
			job_title_id: employeeData.job.job_title_id
				? String(employeeData.job.job_title_id)
				: "",
			team_ids: employeeData.job.team_ids.map((id) => String(id)),
			role_id: employeeData.job.role?.id
				? String(employeeData.job.role.id)
				: "",
			manager_id: employeeData.manager?.id
				? String(employeeData.manager.id)
				: "",
			start_date: employeeData.contract?.start_date
				? new Date(employeeData.contract.start_date).toISOString().split("T")[0]
				: "",
		};
	}, [employeeData]);

	const jobTitleOptions = useMemo(
		() =>
			availableJobTitles.map((jt) => ({
				id: jt.id,
				label: jt.title,
			})),
		[availableJobTitles]
	);

	const teamOptions = useMemo(
		() =>
			availableTeams.map((team) => ({
				id: team.id,
				label: team.name,
			})),
		[availableTeams]
	);

	const roleOptions = useMemo(
		() =>
			availableRoles.map((role) => ({
				id: role.id,
				label: role.title,
			})),
		[availableRoles]
	);

	const managerOptions = useMemo(
		() => [
			{ id: "", label: tCommon("none") || "None" },
			...availableManagers.map((manager) => ({
				id: manager.id,
				label: manager.name,
			})),
		],
		[availableManagers, tCommon]
	);

	const fields: FieldConfig[] = useMemo(
		() => [
			{
				name: "job_title_id",
				type: "searchableSelect",
				label: t("fields.jobTitle"),
				placeholder: tCommon("select") || "Select",
				options: jobTitleOptions,
				required: true,
			},
			{
				name: "role_id",
				type: "searchableSelect",
				label: t("fields.role"),
				placeholder: tCommon("select") || "Select",
				options: roleOptions,
				required: true,
			},
			{
				name: "team_ids",
				type: "custom",
				label: t("fields.team"),
				render: (form) => {
					const currentValue = (form.watch("team_ids") as string[]) || [];
					const selectedTeams = teamOptions.filter((team) =>
						currentValue.includes(team.id)
					);
					return (
						<div className='space-y-2'>
							<label className='block text-xs sm:text-sm font-medium text-text-sub'>
								{t("fields.team")}
							</label>
							<SearchableMultiSelect
								placeholder={tCommon("select") || "Select"}
								selectedItems={selectedTeams}
								availableItems={teamOptions}
								onChange={(items) => {
									const ids = items.map((i) => i.id);
									form.setValue("team_ids", ids, {
										shouldValidate: true,
										shouldDirty: true,
									});
								}}
							/>
						</div>
					);
				},
			},
			{
				name: "manager_id",
				type: "searchableSelect",
				label: t("fields.manager"),
				placeholder: tCommon("none") || "None",
				options: managerOptions,
			},
			{
				name: "start_date",
				type: "date",
				label: t("fields.startDate"),
			},
		],
		[t, tCommon, jobTitleOptions, roleOptions, teamOptions, managerOptions]
	);

	const handleSubmit = async (data: WorkInfoFormData) => {
		try {
			const jobPayload: {
				job_title_id?: number;
				team_ids?: number[];
				role_id?: number;
				manager_id?: number | null;
			} = {};

			const contractPayload: {
				start_date?: string;
			} = {};

			const currentManagerId = employeeData?.manager?.id
				? String(employeeData.manager.id)
				: "";
			const newManagerId = data.manager_id || "";

			if (
				data.job_title_id !==
				(employeeData?.job.job_title_id
					? String(employeeData.job.job_title_id)
					: "")
			) {
				jobPayload.job_title_id = Number(data.job_title_id);
			}

			const currentTeamIds = employeeData?.job.team_ids || [];
			const newTeamIds = (data.team_ids || []).map((id) => Number(id));
			if (
				currentTeamIds.length !== newTeamIds.length ||
				!currentTeamIds.every((id) => newTeamIds.includes(id)) ||
				!newTeamIds.every((id) => currentTeamIds.includes(id))
			) {
				jobPayload.team_ids = newTeamIds;
			}

			if (
				data.role_id !==
				(employeeData?.job.role?.id ? String(employeeData.job.role.id) : "")
			) {
				jobPayload.role_id = Number(data.role_id);
			}

			if (
				data.start_date !==
				(employeeData?.contract?.start_date
					? new Date(employeeData.contract.start_date)
							.toISOString()
							.split("T")[0]
					: "")
			) {
				contractPayload.start_date = data.start_date;
			}

			const managerChanged = newManagerId !== currentManagerId;
			if (managerChanged) {
				jobPayload.manager_id = newManagerId ? Number(newManagerId) : null;
			}

			// Only submit if there are changes
			if (
				Object.keys(jobPayload).length === 0 &&
				Object.keys(contractPayload).length === 0
			) {
				toast.info(tCommon("noChanges") || "No changes to save");
				onClose();
				return;
			}

			// Structure payload to match UpdateEmployeeDto with nested job and contract objects
			// The DTO expects: { job: { ... }, contract: { ... } }
			const payload: any = {};
			if (Object.keys(jobPayload).length > 0) {
				payload.job = jobPayload;
			}
			if (Object.keys(contractPayload).length > 0) {
				payload.contract = contractPayload;
			}

			await updateEmployeeMutation.mutateAsync({
				id: employeeId,
				payload,
			});

			toast.success(
				t("messages.updateSuccess") ||
					tCommon("updateSuccess") ||
					"Work information updated successfully"
			);
			onSuccess?.();
			onClose();
		} catch (error) {
			console.error("Failed to update work information:", error);
			toast.error(
				t("messages.updateError") ||
					tCommon("updateError") ||
					"Failed to update work information. Please try again."
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
			title={t("profile.details.work.title")}
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
				schema={workInfoSchema}
				defaultValues={defaultValues}
				onSubmit={handleSubmit}
				fields={fields}
				showSubmitButton={false}
				validationBehavior='touched'
			/>
		</Modal>
	);
}

export default EditWorkInfoForm;
