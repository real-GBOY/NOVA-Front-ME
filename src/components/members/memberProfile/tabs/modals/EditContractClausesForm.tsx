/** @format */

import { useEffect, useMemo, useState } from "react";
import Modal from "@/designSystem/Modal";
import Button from "@/designSystem/Button";
import GenericForm, { type FieldConfig } from "@/designSystem/GenericForm";
import { useTranslation } from "@/hooks/useTranslation";
import { useContracts } from "@/hooks/contracts/useContracts";
import { useQueryClient } from "@tanstack/react-query";
import { reactQueryKeys } from "@/config/reactQueryKeys";
import toast from "@/utilities/toast";
import * as yup from "yup";
import type { EmployeeContract } from "@/services/employeeService";

interface EditContractClausesFormProps {
	isOpen: boolean;
	onClose: () => void;
	contractId: number | string;
	employeeId: number | string;
	clauses?: EmployeeContract["clauses"];
	onSuccess?: () => void;
}

type ClauseFormData = {
	noticePeriod: string;
	sickLeave: string;
	casualLeave: string;
	annualLeave: string;
	absenceLimit: string;
};

const toNumberOrUndefined = (value?: string) => {
   if (!value) return undefined;
   const trimmed = value.trim();
   if (!trimmed) return undefined;
   const parsed = Number(trimmed);
   if (Number.isNaN(parsed)) return undefined;
   return Math.floor(parsed);
};

const toIntegerString = (value?: number | string | null) => {
   if (value === null || value === undefined) return "";
   const parsed = Number(value);
   if (Number.isNaN(parsed)) return "";
   return String(Math.floor(parsed));
};

function EditContractClausesForm({
	isOpen,
	onClose,
	contractId,
	employeeId,
	clauses,
	onSuccess,
}: EditContractClausesFormProps) {
	const { t } = useTranslation("members");
	const { t: tCommon } = useTranslation("common");
	const { useUpdate } = useContracts();
	const updateContract = useUpdate();
	const queryClient = useQueryClient();
	const [formData, setFormData] = useState<ClauseFormData>({
		noticePeriod: "",
		sickLeave: "",
		casualLeave: "",
		annualLeave: "",
		absenceLimit: "",
	});

	const requiredMessage = (label: string) =>
		t("validation.required", { field: label });

	const clauseSchema = useMemo(
		() =>
			yup.object({
				noticePeriod: yup.string().required(
					requiredMessage(t("profile.contract.clause.noticePeriod"))
				),
				sickLeave: yup
					.string()
					.required(requiredMessage(t("profile.contract.clause.sickLeave"))),
				casualLeave: yup
					.string()
					.required(requiredMessage(t("profile.contract.clause.casualLeave"))),
				annualLeave: yup
					.string()
					.required(requiredMessage(t("profile.contract.clause.annualLeave"))),
				absenceLimit: yup
					.string()
					.required(requiredMessage(t("profile.contract.clause.absenceLimit"))),
			}),
		[t]
	);

   const initialValues = useMemo<ClauseFormData>(
      () => ({
         noticePeriod: toIntegerString(clauses?.notice_period_days),
         sickLeave: toIntegerString(clauses?.sick_leave_days),
         casualLeave: toIntegerString(clauses?.casual_leave_days),
         annualLeave: toIntegerString(clauses?.annual_leave_days),
         absenceLimit: toIntegerString(clauses?.absence_limit?.days_per_year),
      }),
      [clauses]
   );

	useEffect(() => {
		if (isOpen) {
			setFormData(initialValues);
		}
	}, [initialValues, isOpen]);

	const handleFieldChange = (field: string, value: unknown) => {
		setFormData((prev) => ({
			...prev,
			[field]: value as string,
		}));
	};

	const fields: FieldConfig[] = useMemo(
		() => [
			{
				name: "noticePeriod",
				type: "number",
				label: t("profile.contract.clause.noticePeriod"),
				placeholder: tCommon("contracts.policyLimits.enterNoticePeriod"),
				required: true,
			},
			{
				name: "sickLeave",
				type: "number",
				label: t("profile.contract.clause.sickLeave"),
				placeholder: tCommon("contracts.policyLimits.enterSickLeave"),
				required: true,
			},
			{
				name: "casualLeave",
				type: "number",
				label: t("profile.contract.clause.casualLeave"),
				placeholder: tCommon("contracts.policyLimits.enterCasualLeave"),
				required: true,
			},
			{
				name: "annualLeave",
				type: "number",
				label: t("profile.contract.clause.annualLeave"),
				placeholder: tCommon("contracts.policyLimits.enterAnnualLeave"),
				required: true,
			},
			{
				name: "absenceLimit",
				type: "number",
				label: t("profile.contract.clause.absenceLimit"),
				placeholder: tCommon("contracts.policyLimits.enterAbsenceLimit"),
				required: true,
			},
		],
		[t, tCommon]
	);

	const handleSubmit = async (data: ClauseFormData) => {
		try {
			const currentNotice = clauses?.notice_period_days ?? undefined;
			const currentSick = clauses?.sick_leave_days ?? undefined;
			const currentCasual = clauses?.casual_leave_days ?? undefined;
			const currentAnnual = clauses?.annual_leave_days ?? undefined;
			const currentAbsence = clauses?.absence_limit?.days_per_year ?? undefined;

			const nextNotice = toNumberOrUndefined(data.noticePeriod);
			const nextSick = toNumberOrUndefined(data.sickLeave);
			const nextCasual = toNumberOrUndefined(data.casualLeave);
			const nextAnnual = toNumberOrUndefined(data.annualLeave);
			const nextAbsence = toNumberOrUndefined(data.absenceLimit);

			const vacations: Record<string, number> = {};

			if (nextNotice !== undefined && nextNotice !== Number(currentNotice)) {
				vacations.notice_period_days = nextNotice;
			}
			if (nextSick !== undefined && nextSick !== Number(currentSick)) {
				vacations.sick_leave_days = nextSick;
			}
			if (nextCasual !== undefined && nextCasual !== Number(currentCasual)) {
				vacations.casual_leave_days = nextCasual;
			}
			if (nextAnnual !== undefined && nextAnnual !== Number(currentAnnual)) {
				vacations.annual_leave_days = nextAnnual;
			}
			if (nextAbsence !== undefined && nextAbsence !== Number(currentAbsence)) {
				vacations.absence_limit_days = nextAbsence;
			}

			if (Object.keys(vacations).length === 0) {
				toast.info(tCommon("noChanges") || "No changes to save");
				onClose();
				return;
			}

			await updateContract.mutateAsync({
				id: contractId,
				payload: {
					vacations,
				},
			});

			queryClient.invalidateQueries({
				queryKey: reactQueryKeys.employees.contract(employeeId),
			});

			toast.success(
				t("profile.contract.clause.updateSuccess") ||
					tCommon("updateSuccess") ||
					"Contract clauses updated successfully"
			);
			onSuccess?.();
			onClose();
		} catch (error) {
			console.error("Failed to update contract clauses:", error);
			toast.error(
				t("profile.contract.clause.updateError") ||
					tCommon("updateError") ||
					"Failed to update contract clauses"
			);
		}
	};

	const handleClose = () => {
		if (updateContract.isPending) return;
		onClose();
	};

	return (
         <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title={t("profile.contract.clause.editTitle")}
            width="r-modal-w xl:w-[520px]"
            contentClassName="flex flex-col items-start r-p-sm r-gap w-full bg-background xl:p-5 xl:gap-5"
            showHeaderDivider={false}
            footer={
				<div className="r-btn-group xl:flex-row xl:justify-end xl:items-center xl:gap-3 xl:flex-1">
					<Button
						variant="secondary"
						onClick={handleClose}
						disabled={updateContract.isPending}
						className="r-btn-full xl:px-4 xl:py-2 xl:rounded-xl">
						{tCommon("actions.cancel") || "Cancel"}
					</Button>
					<Button
						type="submit"
						form="edit-contract-clauses-form"
						disabled={updateContract.isPending}
						className="r-btn-full xl:px-4 xl:py-2 xl:rounded-xl">
						{updateContract.isPending
							? t("profile.contract.clause.updating")
							: t("profile.contract.clause.updateButton")}
					</Button>
				</div>
			}>
         <div className="w-full">
            <GenericForm
               id="edit-contract-clauses-form"
               schema={clauseSchema}
               defaultValues={formData}
               formData={formData}
               onSubmit={handleSubmit}
               onFieldChange={handleFieldChange}
               showSubmitButton={false}
               mode="onChange"
               fields={fields}
               className="w-full"
            />
         </div>
      </Modal>
   );
}

export default EditContractClausesForm;
