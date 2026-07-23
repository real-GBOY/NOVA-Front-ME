/** @format */

import { useState, useMemo } from "react";
import Modal from "@/designSystem/Modal";
import Button from "@/designSystem/Button";
import ConfirmModal from "@/designSystem/ConfirmModal";
import GenericForm, { FieldConfig } from "@/designSystem/GenericForm";
import * as yup from "yup";
import { useTranslation } from "@/hooks/useTranslation";
import { useListEmployees } from "@/hooks/employees/employee.queries";
import type { LegalCase } from "@/services/legalCasesService";

interface EditCaseDetailsModalProps {
	isOpen: boolean;
	onClose: () => void;
	legalCase: LegalCase;
	onUpdate: (data: EditCaseDetailsFormValues) => void;
}

export interface EditCaseDetailsFormValues extends Record<string, unknown> {
	title: string;
	case_number?: string;
	client_name?: string;
	lawyer_id?: number | string;
	status: string;
	start_date?: string;
	end_date?: string;
}

const STATUS_OPTIONS = [
	{ id: "Open", label: "Open" },
	{ id: "In Progress", label: "In Progress" },
	{ id: "Closed", label: "Closed" },
	{ id: "On Hold", label: "On Hold" },
	{ id: "Cancelled", label: "Cancelled" },
];

const toApiStatus = (status?: string) => {
	if (!status) return "Open";
	const normalized = status.toLowerCase().replace(/_/g, " ");
	if (normalized === "open") return "Open";
	if (normalized === "in progress") return "In Progress";
	if (normalized === "closed") return "Closed";
	if (normalized === "on hold") return "On Hold";
	if (normalized === "cancelled") return "Cancelled";
	return status;
};

const getValidationSchema = (t: (key: string) => string) =>
	yup.object().shape({
		title: yup
			.string()
			.max(255, t("validation.maxLength"))
			.required(t("validation.required")),
		case_number: yup.string().max(50, t("validation.maxLength")).optional(),
		client_name: yup.string().max(255, t("validation.maxLength")).optional(),
		lawyer_id: yup.number().positive().optional(),
		status: yup
			.string()
			.oneOf(
				["Open", "In Progress", "Closed", "On Hold", "Cancelled"],
				t("validation.invalidStatus")
			)
			.required(t("validation.required")),
		start_date: yup.string().optional(),
		end_date: yup.string().optional(),
	});

export default function EditCaseDetailsModal({
	isOpen,
	onClose,
	legalCase,
	onUpdate,
}: EditCaseDetailsModalProps) {
	const { t } = useTranslation("settings");
	const { t: tCommon } = useTranslation("common");
	const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
	const [isFormDirty, setIsFormDirty] = useState(false);

	const { data: employeesResponse } = useListEmployees(
		{ page: 1, limit: 100 },
		{ enabled: isOpen }
	);

	const employees = employeesResponse?.data || [];
	const lawyerOptions = employees.map((emp) => ({
		id: String(emp.id),
		label: emp.name,
	}));

	const schema = getValidationSchema(tCommon);

	const fields: FieldConfig[] = [
		{
			name: "title",
			label: t("legalCases.editCaseModal.title"),
			placeholder: t("legalCases.editCaseModal.titlePlaceholder"),
			type: "text",
			required: true,
			maxLength: 255,
		},
		{
			name: "case_number",
			label: t("legalCases.editCaseModal.caseNumber"),
			placeholder: t("legalCases.editCaseModal.caseNumberPlaceholder"),
			type: "text",
			maxLength: 50,
		},
		{
			name: "client_name",
			label: t("legalCases.editCaseModal.clientName"),
			placeholder: t("legalCases.editCaseModal.clientNamePlaceholder"),
			type: "text",
			maxLength: 255,
		},
		{
			name: "lawyer_id",
			label: t("legalCases.editCaseModal.lawyer"),
			type: "select",
			options: lawyerOptions,
		},
		{
			name: "status",
			label: t("legalCases.editCaseModal.status"),
			type: "select",
			options: STATUS_OPTIONS,
			required: true,
		},
		{
			name: "start_date",
			label: t("legalCases.editCaseModal.startDate"),
			type: "date",
		},
		{
			name: "end_date",
			label: t("legalCases.editCaseModal.endDate"),
			type: "date",
		},
	];

	const defaultValues: EditCaseDetailsFormValues = useMemo(
		() => ({
			title: legalCase.title || "",
			case_number: legalCase.case_number || "",
			client_name: legalCase.client || "",
			lawyer_id: legalCase.assigned_to || "",
			status: toApiStatus(legalCase.status),
			start_date: legalCase.start_date
				? new Date(legalCase.start_date).toISOString().split("T")[0]
				: "",
			end_date: legalCase.end_date
				? new Date(legalCase.end_date).toISOString().split("T")[0]
				: "",
		}),
		[legalCase]
	);

	const handleFormSubmit = (data: EditCaseDetailsFormValues) => {
		onUpdate(data);
		onClose();
	};

	const handleRequestClose = () => {
		if (isFormDirty) {
			setShowDiscardConfirm(true);
			return;
		}
		onClose();
	};

	const handleDiscardChanges = () => {
		setShowDiscardConfirm(false);
		onClose();
	};

	return (
		<>
			<Modal
				isOpen={isOpen}
				onClose={handleRequestClose}
				title={t("legalCases.editCaseModal.modalTitle")}
				size="medium"
				showHeaderDivider={false}
				footer={
					<div className="flex items-center justify-end gap-3 w-full">
						<Button
							variant="secondary"
							onClick={handleRequestClose}
							className="px-3 py-2 text-sm cursor-pointer">
							{tCommon("actions.cancel")}
						</Button>
						<Button
							form="editCaseDetailsForm"
							type="submit"
							className="cursor-pointer">
							{tCommon("actions.update")}
						</Button>
					</div>
				}>
				<GenericForm<EditCaseDetailsFormValues>
					id="editCaseDetailsForm"
					schema={schema}
					defaultValues={defaultValues}
					fields={fields}
					onSubmit={handleFormSubmit}
					onDirtyChange={setIsFormDirty}
					showSubmitButton={false}
				/>
			</Modal>
			<ConfirmModal
				isOpen={showDiscardConfirm}
				onClose={() => setShowDiscardConfirm(false)}
				onConfirm={handleDiscardChanges}
				title={tCommon("unsavedChanges.title")}
				description={tCommon("unsavedChanges.description")}
				confirmText={tCommon("unsavedChanges.confirm")}
				cancelText={tCommon("unsavedChanges.cancel")}
			/>
		</>
	);
}
