/** @format */

import { useMemo } from "react";
import Modal from "@/designSystem/Modal";
import Button from "@/designSystem/Button";
import GenericForm, { FieldConfig } from "@/designSystem/GenericForm";
import { useTranslation } from "@/hooks/useTranslation";
import { useListEmployees } from "@/hooks/employees/employee.queries";
import { format } from "date-fns";
import SearchableMultiSelect, {
   DropdownItem,
} from "@/designSystem/SearchableMultiSelect";
import * as yup from "yup";

interface CreatePayrollModalProps {
   isOpen: boolean;
   onClose: () => void;
   onSubmit: (data: CreatePayrollFormData) => Promise<void>;
   isLoading?: boolean;
}

export interface CreatePayrollFormData {
   employeeIds: number[];
   periodStart: string;
   periodEnd: string;
   cycleType: string;
   notes?: string;
}

type CreatePayrollFormValues = {
   employeeIds: string[];
   periodStart: string;
   periodEnd: string;
   cycleType: string;
   notes?: string;
};

const CYCLE_TYPES = ["Monthly", "Biweekly", "Weekly"] as const;

export default function CreatePayrollModal({
   isOpen,
   onClose,
   onSubmit,
   isLoading = false,
}: CreatePayrollModalProps) {
   const { t } = useTranslation("payrolls");
   const { t: tCommon } = useTranslation("common");

   // Fetch employees
   const { data: employeesData, isLoading: isLoadingEmployees } =
      useListEmployees(
         { page: 1, limit: 100, status: "Active" },
         { enabled: isOpen }
      );

   const employees = useMemo(() => {
      return employeesData?.data || [];
   }, [employeesData]);

   const contractEmployees = useMemo(() => {
      return employees.filter((emp) => emp.hasContract);
   }, [employees]);

   const employeeOptions = useMemo<DropdownItem[]>(() => {
      return contractEmployees.map((emp) => {
         const label =
            (emp.name || emp.email || "").trim() || t("labels.unknownEmployee");
         return {
            id: emp.id,
            label,
            subLabel: emp.email || undefined,
            avatar: emp.avatar || undefined,
         };
      });
   }, [contractEmployees, t]);

   const schema = useMemo(
      () =>
         yup.object({
            employeeIds: yup
               .array()
               .of(yup.string())
               .min(1, tCommon("validation.required"))
               .required(tCommon("validation.required")),
            periodStart: yup.string().required(tCommon("validation.required")),
            periodEnd: yup.string().required(tCommon("validation.required")),
            cycleType: yup.string().required(tCommon("validation.required")),
            notes: yup.string().optional(),
         }),
      [tCommon]
   );

   const defaultValues = useMemo<CreatePayrollFormValues>(() => {
      const now = new Date();
      return {
         employeeIds: [],
         periodStart: format(
            new Date(now.getFullYear(), now.getMonth() - 1, 25),
            "yyyy-MM-dd"
         ),
         periodEnd: format(
            new Date(now.getFullYear(), now.getMonth(), 24),
            "yyyy-MM-dd"
         ),
         cycleType: "Monthly",
         notes: "",
      };
   }, []);

   const cycleOptions = useMemo(
      () =>
         CYCLE_TYPES.map((type) => ({
            id: type,
            label: t(`filters.${type}`),
         })),
      [t]
   );

   const fields = useMemo<FieldConfig[]>(
      () => [
         {
            name: "employeeIds",
            type: "custom",
            render: (form) => {
               const fieldState = form.getFieldState(
                  "employeeIds",
                  form.formState
               );
               const errorMessage = fieldState.error?.message as
                  | string
                  | undefined;
               const shouldShowError =
                  Boolean(errorMessage) &&
                  (fieldState.isTouched ||
                     fieldState.isDirty ||
                     form.formState.submitCount > 0);
               const labelClassName = `block text-xs sm:text-sm font-medium ${
                  shouldShowError ? "text-danger" : "text-text-sub"
               }`;
               const selectedIds = form.watch("employeeIds") as
                  | string[]
                  | undefined;
               const selectedItems = employeeOptions.filter((option) =>
                  selectedIds?.includes(String(option.id))
               );
               const isDisabled =
                  isLoading ||
                  isLoadingEmployees ||
                  employeeOptions.length === 0;

               return (
                  <div className="space-y-2" data-field="employeeIds">
                     <div className="flex items-center justify-between">
                        <label className={labelClassName}>
                           {t("modal.createPayroll.selectEmployee")}
                           <span className="text-danger ms-0.5">*</span>
                        </label>
                        <div className="flex items-center gap-2 text-xs">
                           <button
                              type="button"
                              className="text-text-sub hover:text-text-strong transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                              onClick={() => {
                                 const allIds = employeeOptions.map(
                                    (employee) => String(employee.id)
                                 );
                                 form.setValue("employeeIds", allIds, {
                                    shouldValidate: true,
                                    shouldDirty: true,
                                    shouldTouch: true,
                                 });
                              }}
                              disabled={isDisabled}>
                              {t("labels.allEmployees")}
                           </button>
                           <span className="text-text-soft">/</span>
                           <button
                              type="button"
                              className="text-text-sub hover:text-text-strong transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                              onClick={() =>
                                 form.setValue("employeeIds", [], {
                                    shouldValidate: true,
                                    shouldDirty: true,
                                    shouldTouch: true,
                                 })
                              }
                              disabled={
                                 isLoading || selectedItems.length === 0
                              }>
                              {tCommon("actions.clear")}
                           </button>
                        </div>
                     </div>
                     <SearchableMultiSelect
                        placeholder={t(
                           "modal.createPayroll.employeePlaceholder"
                        )}
                        selectedItems={selectedItems}
                        availableItems={employeeOptions}
                        selectionClassName="max-h-28 overflow-y-auto"
                        onChange={(items) => {
                           form.setValue(
                              "employeeIds",
                              items.map((item) => String(item.id)),
                              {
                                 shouldValidate: true,
                                 shouldDirty: true,
                                 shouldTouch: true,
                              }
                           );
                        }}
                     />
                     {shouldShowError && (
                        <p className="text-xs text-danger">{errorMessage}</p>
                     )}
                  </div>
               );
            },
         },
         {
            name: "periodStart",
            label: t("modal.createPayroll.periodStart"),
            type: "date",
            placeholder: "DD / MM / YYYY",
            required: true,
            disabled: isLoading,
         },
         {
            name: "periodEnd",
            label: t("modal.createPayroll.periodEnd"),
            type: "date",
            placeholder: "DD / MM / YYYY",
            required: true,
            disabled: isLoading,
         },
         {
            name: "cycleType",
            label: t("modal.createPayroll.cycleType"),
            type: "select",
            options: cycleOptions,
            required: true,
            disabled: isLoading,
         },
         {
            name: "notes",
            label: t("modal.createPayroll.notes"),
            type: "textarea",
            placeholder: t("modal.createPayroll.notesPlaceholder"),
            rows: 3,
            disabled: isLoading,
         },
      ],
      [cycleOptions, employeeOptions, isLoading, isLoadingEmployees, t, tCommon]
   );

   const footer = (
      <div className="flex justify-end gap-3 w-full">
         <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            {t("modal.createPayroll.cancel")}
         </Button>
         <Button type="submit" form="create-payroll-form" disabled={isLoading}>
            {isLoading && (
               <span className="animate-spin mr-2 w-4 h-4 border-2 border-white border-t-transparent rounded-full inline-block align-middle" />
            )}
            {t("modal.createPayroll.create")}
         </Button>
      </div>
   );

   return (
      <Modal
         isOpen={isOpen}
         onClose={onClose}
         title={t("modal.createPayroll.title")}
         size="medium"
         overflow="visible"
         contentClassName="flex flex-col gap-5"
         footer={footer}>
         <GenericForm<CreatePayrollFormValues>
            id="create-payroll-form"
            schema={schema}
            defaultValues={defaultValues}
            onSubmit={(data) =>
               onSubmit({
                  employeeIds: data.employeeIds.map((id) => Number(id)),
                  periodStart: data.periodStart,
                  periodEnd: data.periodEnd,
                  cycleType: data.cycleType,
                  notes: data.notes?.trim() || undefined,
               })
            }
            fields={fields}
            showSubmitButton={false}
            mode="onChange"
         />
      </Modal>
   );
}
