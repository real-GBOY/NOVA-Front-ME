/** @format */

import { useTranslation } from "@/hooks/useTranslation";
import Modal from "@/designSystem/Modal";
import GenericForm, { FieldConfig } from "@/designSystem/GenericForm";
import Button from "@/designSystem/Button";
import ConfirmModal from "@/designSystem/ConfirmModal";
import * as yup from "yup";
import {
   useCreateCategory,
   useUpdateCategory,
} from "@/hooks/categories/useCategory";
import { useListDepartments } from "@/hooks/departments/useDepartment";
import toast from "@/utilities/toast";
import { useMemo, useState } from "react";
import type { Category } from "@/services/categoryService";

type AddCategoryModalProps = {
   isOpen: boolean;
   onClose: () => void;
   onSuccess?: () => void;
   category?: Category | null;
};

type CategoryFormValues = {
   nameEn: string;
   nameAr: string;
   departmentId: string | number;
   status: "active" | "inactive";
};

function AddCategoryModal({
   isOpen,
   onClose,
   onSuccess,
   category,
}: AddCategoryModalProps) {
   const [buttonState, setButtonState] = useState<
      "idle" | "loading" | "success"
   >("idle");
   const [isDirty, setIsDirty] = useState(false);
   const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
   const { t } = useTranslation("settings");
   const { t: tCommon } = useTranslation("common");
   const createMutation = useCreateCategory();
    const updateMutation = useUpdateCategory();
   const { data: departmentsData } = useListDepartments();
   const isEditMode = Boolean(category);

   const schema = yup.object().shape({
      nameEn: yup.string().required(t("validation.required")),
      nameAr: yup.string().required(t("validation.required")),
      departmentId: yup
         .mixed<string | number>()
         .required(t("validation.required")),
      status: yup
         .mixed<"active" | "inactive">()
         .required(t("validation.required"))
         .oneOf(["active", "inactive"]),
   });

   const fields: FieldConfig[] = [
      {
         name: "nameEn",
         label: t("serviceCatalog.modal.categoryNameEn"),
         placeholder: t("serviceCatalog.modal.categoryNameEnPlaceholder"),
         type: "text",
         required: true,
      },
      {
         name: "nameAr",
         label: t("serviceCatalog.modal.categoryNameAr"),
         placeholder: t("serviceCatalog.modal.categoryNameArPlaceholder"),
         type: "text",
         required: true,
      },
      {
         name: "departmentId",
         label: t("serviceCatalog.modal.department"),
         placeholder: t("serviceCatalog.modal.departmentPlaceholder"),
         type: "searchableSelect",
         required: true,
         options: (departmentsData?.data || [])
            .filter((dept) => dept.status === "active")
            .map((dept) => ({
               id: String(dept.id),
               label: dept.nameEn || "",
            })),
      },
      {
         name: "status",
         label: t("serviceCatalog.modal.status"),
         placeholder: t("serviceCatalog.modal.statusPlaceholder"),
         type: "select",
         required: true,
         options: [
            { id: "active", label: t("serviceCatalog.status.active") },
            { id: "inactive", label: t("serviceCatalog.status.inactive") },
         ],
      },
   ];

   const initialValues = useMemo(
      () =>
         category
            ? {
                 nameEn: category.nameEn,
                 nameAr: category.nameAr,
                 departmentId: String(category.departmentId),
                 status: category.status,
              }
            : undefined,
      [category]
   );

   const handleSubmit = async (data: CategoryFormValues) => {
      setButtonState("loading");
      const onCompleted = () => {
         setButtonState("success");
         toast.success(
            isEditMode
               ? t("serviceCatalog.modal.updateCategorySuccess")
               : t("serviceCatalog.modal.addCategorySuccess")
         );
         setButtonState("idle");
         if (onSuccess) onSuccess();
         onClose();
      };

      const onFailure = (error: unknown) => {
         setButtonState("idle");
         const errorMessage =
            error instanceof Error
               ? error.message
               : t("serviceCatalog.modal.addCategoryError");
         toast.error(errorMessage);
      };

      if (isEditMode && category) {
         updateMutation.mutate(
            { id: category.id, payload: data },
            { onSuccess: onCompleted, onError: onFailure }
         );
      } else {
         createMutation.mutate(data, {
            onSuccess: onCompleted,
            onError: onFailure,
         });
      }
   };

   const footer = (
      <div className="flex justify-end gap-3 w-full">
         <Button
            variant="secondary"
            onClick={() => {
               if (isDirty) {
                  setShowDiscardConfirm(true);
                  return;
               }
               onClose();
            }}
            disabled={buttonState === "loading"}>
            {t("serviceCatalog.modal.cancel")}
         </Button>
         <Button
            type="submit"
            form="add-category-form"
            disabled={buttonState === "loading" || buttonState === "success"}
            className={
               buttonState === "success" ? "bg-success text-white" : ""
            }>
            {buttonState === "loading" && (
               <span className="animate-spin mr-2 w-4 h-4 border-2 border-white border-t-transparent rounded-full inline-block align-middle"></span>
            )}
            {buttonState === "success" ? (
               <span className="inline-flex items-center">
                  <svg
                     className="w-5 h-5 mr-1 text-white"
                     fill="none"
                     stroke="currentColor"
                     strokeWidth="2"
                     viewBox="0 0 24 24">
                     <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                     />
                  </svg>
                  {t("serviceCatalog.modal.addCategorySuccessShort")}
               </span>
            ) : (
               (isEditMode
                  ? t("serviceCatalog.floatingBar.editCategory")
                  : t("serviceCatalog.modal.addCategoryButton"))
            )}
         </Button>
      </div>
   );

   return (
      <Modal
         isOpen={isOpen}
         onClose={() => {
            if (isDirty) {
               setShowDiscardConfirm(true);
               return;
            }
            onClose();
         }}
         title={
            isEditMode
               ? t("serviceCatalog.floatingBar.editCategory")
               : t("serviceCatalog.modal.addCategoryTitle")
         }
         size="medium"
         overflow="visible"
         footer={footer}>
         <GenericForm<CategoryFormValues>
            key={category ? `edit-category-${category.id}` : "create-category"}
            id="add-category-form"
            schema={schema}
            onSubmit={handleSubmit}
            formData={initialValues}
            fields={fields}
            validationBehavior="touched"
            validationSummaryTitle={t("serviceCatalog.validationSummary.title")}
            validationSummaryDescription={t(
               "serviceCatalog.validationSummary.description"
            )}
            showSubmitButton={false}
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

export default AddCategoryModal;
