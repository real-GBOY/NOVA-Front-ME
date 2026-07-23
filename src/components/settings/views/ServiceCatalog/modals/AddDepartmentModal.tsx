/** @format */

import { useTranslation } from "@/hooks/useTranslation";
import Modal from "@/designSystem/Modal";
import GenericForm, { FieldConfig } from "@/designSystem/GenericForm";
import Button from "@/designSystem/Button";
import ConfirmModal from "@/designSystem/ConfirmModal";
import * as yup from "yup";
import {
   useCreateDepartment,
   useUpdateDepartment,
} from "@/hooks/departments/useDepartment";
import toast from "@/utilities/toast";
import { useMemo, useState } from "react";
import type { Department } from "@/services/departmentService";

type AddDepartmentModalProps = {
   isOpen: boolean;
   onClose: () => void;
   onSuccess?: () => void;
   department?: Department | null;
};

type DepartmentFormValues = {
   nameEn: string;
   nameAr: string;
   status: "active" | "inactive";
};

function AddDepartmentModal({
   isOpen,
   onClose,
   onSuccess,
   department,
}: AddDepartmentModalProps) {
   const [buttonState, setButtonState] = useState<
      "idle" | "loading" | "success"
   >("idle");
   const [isDirty, setIsDirty] = useState(false);
   const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
   const { t } = useTranslation("settings");
   const { t: tCommon } = useTranslation("common");
   const createMutation = useCreateDepartment();
   const updateMutation = useUpdateDepartment();
   const isEditMode = Boolean(department);

   const schema = yup.object().shape({
      nameEn: yup.string().required(t("validation.required")),
      nameAr: yup.string().required(t("validation.required")),
      status: yup
         .mixed<"active" | "inactive">()
         .required(t("validation.required"))
         .oneOf(["active", "inactive"]),
   });

   const fields: FieldConfig[] = [
      {
         name: "nameEn",
         label: t("serviceCatalog.modal.departmentNameEn"),
         placeholder: t("serviceCatalog.modal.departmentNameEnPlaceholder"),
         type: "text",
         required: true,
      },
      {
         name: "nameAr",
         label: t("serviceCatalog.modal.departmentNameAr"),
         placeholder: t("serviceCatalog.modal.departmentNameArPlaceholder"),
         type: "text",
         required: true,
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
         department
            ? {
                 nameEn: department.nameEn,
                 nameAr: department.nameAr,
                 status: department.status,
              }
            : undefined,
      [department]
   );

   const handleSubmit = async (data: DepartmentFormValues) => {
      setButtonState("loading");
      const onCompleted = () => {
         setButtonState("success");
         toast.success(
            isEditMode
               ? t("serviceCatalog.modal.updateDepartmentSuccess")
               : t("serviceCatalog.modal.addDepartmentSuccess")
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
               : t("serviceCatalog.modal.addDepartmentError");
         toast.error(errorMessage);
      };

      if (isEditMode && department) {
         updateMutation.mutate(
            { id: department.id, payload: data },
            {
               onSuccess: onCompleted,
               onError: onFailure,
            }
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
            form="add-department-form"
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
                  {t("serviceCatalog.modal.addDepartmentSuccessShort")}
               </span>
            ) : (
               (isEditMode
                  ? t("serviceCatalog.floatingBar.editDepartment")
                  : t("serviceCatalog.modal.addDepartmentButton"))
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
               ? t("serviceCatalog.floatingBar.editDepartment")
               : t("serviceCatalog.modal.addDepartmentTitle")
         }
         size="medium"
         overflow="visible"
         footer={footer}>
         <GenericForm<DepartmentFormValues>
            key={department ? `edit-department-${department.id}` : "create-department"}
            id="add-department-form"
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

export default AddDepartmentModal;
