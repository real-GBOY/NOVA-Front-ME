/** @format */

import * as yup from "yup";
import { useEffect, useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import Modal from "@/designSystem/Modal";
import GenericForm, { FieldConfig } from "@/designSystem/GenericForm";
import Button from "@/designSystem/Button";
import ConfirmModal from "@/designSystem/ConfirmModal";
import { PayrollItem } from "@/services/payrollService";

interface PayrollItemModalProps {
   isOpen: boolean;
   onClose: () => void;
   onSubmit: (data: Partial<PayrollItem>) => void;
   initialData?: Partial<PayrollItem>;
   isLoading?: boolean;
}

export default function PayrollItemModal({
   isOpen,
   onClose,
   onSubmit,
   initialData,
   isLoading,
}: PayrollItemModalProps) {
   const { t } = useTranslation(["members", "validation", "common"]);
   const isEdit = !!initialData?.id;
   const [isDirty, setIsDirty] = useState(false);
   const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
   const typeOptions = [
      { id: "Base", label: t("members:payroll.types.Base") },
      { id: "Allowance", label: t("members:payroll.types.Allowance") },
      { id: "Overtime", label: t("members:payroll.types.Overtime") },
      { id: "Deduction", label: t("members:payroll.types.Deduction") },
      { id: "Bonus", label: t("members:payroll.types.Bonus") },
   ];
   const allowedTypeIds = typeOptions.map((option) => option.id);

   const schema = yup.object().shape({
      itemName: yup
         .string()
         .required(
            t("validation:required", {
               field: t("members:payroll.form.itemName"),
            })
         ),
      componentType: yup
         .string()
         .oneOf(
            allowedTypeIds,
            t("validation:required", {
               field: t("members:payroll.form.componentType"),
            })
         )
         .required(
            t("validation:required", {
               field: t("members:payroll.form.componentType"),
            })
         ),
      amount: yup
         .number()
         .typeError(t("validation:numeric"))
         .moreThan(0, t("validation:min", { min: 0 }))
         .transform((value, originalValue) =>
            String(originalValue).trim() === "" ? null : value
         )
         .required(
            t("validation:required", {
               field: t("members:payroll.form.amount"),
            })
         ),
      effectiveDate: yup
         .date()
         .typeError(t("validation:invalidDate"))
         .required(
            t("validation:required", {
               field: t("members:payroll.form.effectiveDate"),
            })
         ),
      notes: yup.string().optional(),
      reason: isEdit
         ? yup
              .string()
              .min(
                 5,
                 t("validation:required", {
                    field: t("members:payroll.form.reason"),
                 })
              )
              .required(
                 t("validation:required", {
                    field: t("members:payroll.form.reason"),
                 })
              )
         : yup.string().notRequired(),
   });

   const fields: FieldConfig[] = [
      {
         name: "itemName",
         label: t("payroll.form.itemName"),
         type: "text",
         required: true,
         placeholder: "Enter Payroll Item",
      },
      {
         name: "componentType",
         label: t("payroll.form.componentType"),
         type: "dropdown",
         required: true,
         options: typeOptions,
         placeholder: "Select Payroll Type",
      },
      {
         name: "amount",
         label: t("payroll.form.amount"),
         type: "currency",
         required: true,
         placeholder: "0.00",
         currencySuffix: "AED",
      },
      {
         name: "effectiveDate",
         label: t("payroll.form.effectiveDate"),
         type: "date",
         required: true,
         placeholder: t("payroll.form.effectiveDate"),
      },
      {
         name: "notes",
         label: t("payroll.form.notes"),
         type: "textarea",
         rows: 4,
         maxLength: 200,
         placeholder: t("payroll.form.notes"),
         required: false,
      },
      ...(isEdit
         ? [
              {
                 name: "reason",
                 label: t("members:payroll.form.reason", {
                    defaultValue: "Reason",
                 }),
                 type: "textarea" as const,
                 rows: 3,
                 maxLength: 500,
                 required: true,
                 placeholder:
                    t("members:payroll.form.reasonPlaceholder", {
                       defaultValue: t("members:payroll.form.reason"),
                    }),
              },
           ]
         : []),
   ];

   useEffect(() => {
      if (!isOpen) {
         setShowDiscardConfirm(false);
         setIsDirty(false);
      }
   }, [isOpen]);

   return (
      <>
         <Modal
            isOpen={isOpen}
            onClose={() => {
               if (isDirty) {
                  setShowDiscardConfirm(true);
                  return;
               }
               onClose();
            }}
            title={isEdit ? t("payroll.editPayItem") : t("payroll.addPayItem")}
            size="medium"
            overflow="visible"
            showHeaderDivider={true}
            footer={
               <div className="r-btn-group xl:flex-row xl:justify-end xl:gap-3 w-full">
                  <Button
                     variant="secondary"
                     onClick={() => {
                        if (isDirty) {
                           setShowDiscardConfirm(true);
                           return;
                        }
                        onClose();
                     }}
                     disabled={isLoading}
                     className="r-btn-full rounded-xl border border-border bg-background text-text-sub hover:bg-bg-weak text-sm font-medium xl:px-4 xl:py-2.5 xl:h-auto">
                     {t("payroll.actions.cancel")}
                  </Button>
                  <Button
                     type="submit"
                     form="payroll-item-form"
                     disabled={isLoading}
                     isLoading={isLoading}
                     className="r-btn-full rounded-xl bg-primary text-text-main hover:bg-primary/90 text-sm font-medium shadow-none xl:px-6 xl:py-2.5 xl:h-auto">
                     {isEdit
                        ? t("payroll.actions.save")
                        : t("payroll.actions.add")}
                  </Button>
               </div>
            }>
            <GenericForm
               id="payroll-item-form"
               schema={schema}
               fields={fields}
               defaultValues={initialData || {}}
               onSubmit={onSubmit}
               showSubmitButton={false}
               mode="onSubmit"
               className="space-y-3 md:space-y-4 xl:space-y-4 pt-2 xl:pt-2"
               onDirtyChange={setIsDirty}
            />
         </Modal>
         <ConfirmModal
            isOpen={showDiscardConfirm}
            onClose={() => setShowDiscardConfirm(false)}
            onConfirm={() => {
               setShowDiscardConfirm(false);
               setIsDirty(false);
               onClose();
            }}
            title={t("common:unsavedChanges.title")}
            description={t("common:unsavedChanges.description")}
            confirmText={t("common:unsavedChanges.confirm")}
            cancelText={t("common:unsavedChanges.cancel")}
            variant="primary"
            icon="exclamation"
         />
      </>
   );
}
