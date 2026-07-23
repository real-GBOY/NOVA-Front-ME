/** @format */

import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import Modal from "@/designSystem/Modal";
import GenericForm, { FieldConfig } from "@/designSystem/GenericForm";
import Button from "@/designSystem/Button";
import ConfirmModal from "@/designSystem/ConfirmModal";
import * as yup from "yup";
import type { CreateExpenseTypeRequest, UpdateExpenseTypeRequest } from "@/services/expenseTypeService";
import { categoryService } from "@/services/categoryService";
import type { ExpenseType } from "../types";
import { useListCategories } from "@/hooks/categories/category.queries";
import { useCreateExpenseType, useUpdateExpenseType } from "@/hooks/expenseTypes/useExpenseTypes";
import toast from "@/utilities/toast";

type AddExpenseTypeModalProps = {
   isOpen: boolean;
   onClose: () => void;
   expenseType?: ExpenseType | null; // For editing
   isLoading?: boolean;
   onSuccess?: (data: CreateExpenseTypeRequest | UpdateExpenseTypeRequest) => void;
};

type ExpenseTypeFormValues = {
   type_name: string;
   category: string;
   description?: string;
   status: "active" | "inactive";
};

function AddExpenseTypeModal({
   isOpen,
   onClose,
   expenseType,
   isLoading: externalLoading = false,
   onSuccess,
}: AddExpenseTypeModalProps) {
   const { t } = useTranslation("settings");
   const { t: tCommon } = useTranslation("common");
   const isEditMode = !!expenseType;
   const createMutation = useCreateExpenseType();
   const updateMutation = useUpdateExpenseType();
   const isLoading = externalLoading || (isEditMode ? updateMutation.isPending : createMutation.isPending);
   const [isDirty, setIsDirty] = useState(false);
   const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

   // Fetch categories for the dropdown (same way as Service Catalog)
   const { data: categoriesData, isLoading: categoriesLoading } = useListCategories();

   // Transform categories to options format
   const categoryOptions = useMemo(() => {
      if (!categoriesData?.data) return [];
      return categoriesData.data
         .filter((cat) => cat.status === "active") // Only show active categories
         .map((cat) => ({
            id: cat.nameEn, // Use category name as id since API expects category name string
            label: cat.nameEn,
         }));
   }, [categoriesData]);

   const fetchCategoryOptions = useCallback(async (search: string) => {
      const response = await categoryService.list({
         page: 1,
         limit: 50,
         search: search || undefined,
         status: "Active",
         sort_by: "category_name_en",
         sort_order: "asc",
      });

      return (response.data || []).map((cat) => ({
         id: cat.nameEn,
         label: cat.nameEn,
      }));
   }, []);

   const schema = yup.object().shape({
      type_name: yup.string().required(t("validation.required")),
      category: yup.string().required(t("validation.required")),
      status: yup
         .string()
         .oneOf(["active", "inactive"])
         .required(t("validation.required")),
      description: yup.string().optional(),
   });

   const fields: FieldConfig[] = useMemo(
      () => [
         {
            name: "type_name",
            type: "text",
            label: t("expenseTypes.modal.name"),
            placeholder: t("expenseTypes.modal.namePlaceholder"),
            required: true,
            disabled: isLoading,
         },
         {
            name: "category",
            type: "searchableSelect",
            label: t("expenseTypes.modal.category"),
            placeholder: t("expenseTypes.modal.categoryPlaceholder"),
            required: true,
            disabled: isLoading || categoriesLoading,
            options: categoryOptions,
            serverSideSearch: true,
            fetchOptions: fetchCategoryOptions,
         },
         {
            name: "status",
            type: "select",
            label: t("expenseTypes.modal.status"),
            placeholder: t("expenseTypes.modal.statusPlaceholder"),
            required: true,
            disabled: isLoading,
            options: [
               { id: "active", label: t("expenseTypes.status.active") },
               { id: "inactive", label: t("expenseTypes.status.inactive") },
            ],
         },
         {
            name: "description",
            type: "textarea",
            label: t("expenseTypes.modal.description"),
            placeholder: t("expenseTypes.modal.descriptionPlaceholder"),
            required: false,
            disabled: isLoading,
         },
      ],
      [t, isLoading, categoriesLoading, categoryOptions, fetchCategoryOptions]
   );

   // Compute default values based on expenseType prop
   const defaultValues = useMemo(() => {
      if (expenseType) {
         const matchedCategory =
            categoryOptions.find(
               (opt) =>
                  opt.id.toLowerCase() ===
                  (expenseType.category || "").toLowerCase()
            )?.id || "";

         return {
            type_name: expenseType.type_name || expenseType.name || "",
            category: matchedCategory,
            description: expenseType.description || "",
            status: (expenseType.status?.toLowerCase() || "active") as "active" | "inactive",
         };
      }
      return {
         type_name: "",
         category: "",
         description: "",
         status: "active" as "active" | "inactive",
      };
   }, [expenseType, categoryOptions]);

   const handleSubmit = async (data: ExpenseTypeFormValues) => {
      if (isLoading) {
         return;
      }
      try {
         const statusValue = String(data.status || "").toLowerCase();
         
         if (expenseType) {
            // Update existing expense type
            const expenseTypeId = expenseType.expense_type_id || expenseType.id;
            if (expenseTypeId) {
               const payload: UpdateExpenseTypeRequest = {
                  type_name: data.type_name || undefined,
                  category: data.category || undefined,
                  status: statusValue === "active" ? "Active" : "Inactive",
                  description: data.description || undefined,
               };
               await updateMutation.mutateAsync({
                  id: expenseTypeId,
                  payload,
               });
               toast.success(t("expenseTypes.toast.updateSuccess"));
               if (onSuccess) {
                  onSuccess(payload);
               }
            }
         } else {
            // Create new expense type
            const payload: CreateExpenseTypeRequest = {
               type_name: data.type_name || "",
               category: data.category || "",
               status: statusValue === "active" ? "Active" : "Inactive",
               description: data.description || undefined,
            };
            await createMutation.mutateAsync(payload);
            toast.success(t("expenseTypes.toast.createSuccess"));
            if (onSuccess) {
               onSuccess(payload);
            }
         }
         onClose();
      } catch (error) {
         console.error("Error saving expense type:", error);
         toast.error(t("expenseTypes.toast.saveError"));
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
            {t("expenseTypes.modal.cancel")}
         </Button>
         <Button
            type="submit"
            form="add-expense-type-form"
            disabled={isLoading}>
            {isLoading && (
               <span className="animate-spin mr-2 w-4 h-4 border-2 border-white border-t-transparent rounded-full inline-block align-middle" />
            )}
            {isEditMode
               ? t("expenseTypes.modal.updateButton") || "Update Expense Type"
               : t("expenseTypes.modal.addButton")}
         </Button>
      </div>
   );

   return (
      <Modal
         isOpen={isOpen}
         onClose={handleClose}
         title={isEditMode ? t("expenseTypes.modal.editTitle") || "Edit Expense Type" : t("expenseTypes.modal.title")}
         width="w-[30rem]"
         size="medium"
         footer={footer}>
      <GenericForm<ExpenseTypeFormValues>
         key={expenseType?.expense_type_id || expenseType?.id || "new"} // Force remount when switching between create/edit
         id="add-expense-type-form"
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

export default AddExpenseTypeModal;
