/** @format */

import { useMemo, useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import Modal from "@/designSystem/Modal";
import GenericForm, { FieldConfig } from "@/designSystem/GenericForm";
import Button from "@/designSystem/Button";
import ConfirmModal from "@/designSystem/ConfirmModal";
import * as yup from "yup";
import type { CreateIncomeTypeRequest, UpdateIncomeTypeRequest } from "@/services/incomeTypeService";
import type { IncomeType } from "../types";
import { useCreateIncomeType, useUpdateIncomeType } from "@/hooks/incomeTypes/useIncomeTypes";
import toast from "@/utilities/toast";

type AddIncomeTypeModalProps = {
   isOpen: boolean;
   onClose: () => void;
   incomeType?: IncomeType | null; // For editing
   isLoading?: boolean;
   onSuccess?: (data: CreateIncomeTypeRequest | UpdateIncomeTypeRequest) => void;
};

type IncomeTypeFormValues = {
   type_name: string;
   gl_code?: string;
};

function AddIncomeTypeModal({
   isOpen,
   onClose,
   incomeType,
   isLoading: externalLoading = false,
   onSuccess,
}: AddIncomeTypeModalProps) {
   const { t } = useTranslation("settings");
   const { t: tCommon } = useTranslation("common");
   const isEditMode = !!incomeType;
   const createMutation = useCreateIncomeType();
   const updateMutation = useUpdateIncomeType();
   const isLoading = externalLoading || (isEditMode ? updateMutation.isPending : createMutation.isPending);
   const [isDirty, setIsDirty] = useState(false);
   const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

   const schema = yup.object().shape({
      type_name: yup.string().required(t("validation.required")),
      gl_code: yup.string().optional(),
   });

   const fields: FieldConfig[] = useMemo(
      () => [
         {
            name: "type_name",
            type: "text",
            label: t("incomeTypes.modal.name") || "Name",
            placeholder: t("incomeTypes.modal.namePlaceholder") || "Enter income type name",
            required: true,
            disabled: isLoading,
         },
         {
            name: "gl_code",
            type: "text",
            label: t("incomeTypes.modal.glCode") || "GL Code",
            placeholder: t("incomeTypes.modal.glCodePlaceholder") || "Enter GL Code",
            required: false,
            disabled: isLoading,
         },
      ],
      [t, isLoading]
   );

   // Compute default values based on incomeType prop
   const defaultValues = useMemo(() => {
      if (incomeType) {
         return {
            type_name: incomeType.type_name || incomeType.name || "",
            gl_code: incomeType.gl_code || "",
         };
      }
      return {
         type_name: "",
         gl_code: "",
      };
   }, [incomeType]);

   const handleSubmit = async (data: IncomeTypeFormValues) => {
      if (isLoading) {
         return;
      }
      try {
         if (incomeType) {
            // Update existing income type
            const incomeTypeId = incomeType.income_type_id || incomeType.id;
            if (incomeTypeId) {
               const payload: UpdateIncomeTypeRequest = {
                  type_name: data.type_name || undefined,
                  gl_code: data.gl_code || undefined,
               };
               await updateMutation.mutateAsync({
                  id: incomeTypeId,
                  payload,
               });
               toast.success(t("incomeTypes.toast.updateSuccess") || "Income Type updated successfully");
               if (onSuccess) {
                  onSuccess(payload);
               }
            }
         } else {
            // Create new income type
            const payload: CreateIncomeTypeRequest = {
               type_name: data.type_name || "",
               gl_code: data.gl_code || undefined,
            };
            await createMutation.mutateAsync(payload);
            toast.success(t("incomeTypes.toast.createSuccess") || "Income Type created successfully");
            if (onSuccess) {
               onSuccess(payload);
            }
         }
         onClose();
      } catch (error) {
         console.error("Error saving income type:", error);
         toast.error(t("incomeTypes.toast.saveError") || "Error saving Income Type");
      }
   };

   const handleClose = () => {
      if (isLoading) return;
      if (isDirty) {
         setShowDiscardConfirm(true);
         return;
      }
      onClose();
   };

   const footer = (
      <div className="flex justify-end gap-3 w-full">
         <Button variant="secondary" onClick={handleClose} disabled={isLoading}>
            {t("incomeTypes.modal.cancel") || "Cancel"}
         </Button>
         <Button
            type="submit"
            form="add-income-type-form"
            disabled={isLoading}>
            {isLoading && (
               <span className="animate-spin mr-2 w-4 h-4 border-2 border-white border-t-transparent rounded-full inline-block align-middle" />
            )}
            {isEditMode
               ? t("incomeTypes.modal.updateButton") || "Update Income Type"
               : t("incomeTypes.modal.addButton") || "Add Income Type"}
         </Button>
      </div>
   );

   return (
      <Modal
         isOpen={isOpen}
         onClose={handleClose}
         title={isEditMode ? t("incomeTypes.modal.editTitle") || "Edit Income Type" : t("incomeTypes.modal.title") || "Add Income Type"}
         width="w-[30rem]"
         size="medium"
         footer={footer}>
      <GenericForm<IncomeTypeFormValues>
         key={incomeType?.income_type_id || incomeType?.id || "new"} // Force remount when switching between create/edit
         id="add-income-type-form"
         fields={fields}
         schema={schema}
         onSubmit={handleSubmit}
         showSubmitButton={false}
         defaultValues={defaultValues}
         onDirtyChange={setIsDirty}
      />
      <ConfirmModal
         isOpen={showDiscardConfirm}
         onClose={() => setShowDiscardConfirm(false)}
         onConfirm={onClose}
         title={tCommon("unsavedChanges.title")}
         description={tCommon("unsavedChanges.description")}
         confirmText={tCommon("unsavedChanges.confirm")}
         cancelText={tCommon("unsavedChanges.cancel")}
         variant="primary"
         icon="exclamation"
      />
   </Modal>
   );
}

export default AddIncomeTypeModal;
