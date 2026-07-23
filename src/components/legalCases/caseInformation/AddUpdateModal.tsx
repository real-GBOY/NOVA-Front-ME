/** @format */

import Modal from "@/designSystem/Modal";
import Button from "@/designSystem/Button";
import GenericForm, { FieldConfig } from "@/designSystem/GenericForm";
import * as yup from "yup";
import { useTranslation } from "@/hooks/useTranslation";
import ConfirmModal from "@/designSystem/ConfirmModal";
import { useState } from "react";

interface AddUpdateModalProps {
   isOpen: boolean;
   onClose: () => void;
   onAdd: (data: AddUpdateFormValues) => void;
}

export interface AddUpdateFormValues extends Record<string, unknown> {
   title: string;
   date: string;
   description?: string;
}

const getValidationSchema = (t: (key: string, options?: any) => string) =>
   yup.object().shape({
      title: yup
         .string()
         .max(255, t("validation.maxLength", { length: 255 }))
         .required(t("validation.required")),
      date: yup
         .string()
         .required(t("validation.required"))
         .matches(/^\d{4}-\d{2}-\d{2}$/, t("validation.dateFormat")), // YYYY-MM-DD
      description: yup
         .string()
         .max(500, t("validation.maxLength", { length: 500 }))
         .optional(),
   });

export default function AddUpdateModal({
   isOpen,
   onClose,
   onAdd,
}: AddUpdateModalProps) {
   const { t } = useTranslation("common");
   const [isDirty, setIsDirty] = useState(false);
   const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
   const schema = getValidationSchema(t);

   const fields: FieldConfig[] = [
      {
         name: "title",
         label: t("event.title"),
         placeholder: t("event.titlePlaceholder"),
         type: "text",
         required: true,
         maxLength: 255,
      },
      {
         name: "date",
         label: t("event.date"),
         type: "date",
         required: true,
      },
      {
         name: "description",
         label: t("event.description"),
         placeholder: t("event.descriptionPlaceholder"),
         type: "textarea",
         rows: 3,
         maxLength: 500,
      },
   ];

   const defaultValues: AddUpdateFormValues = {
      title: "",
      date: new Date().toISOString().split("T")[0],
      description: "",
   };

   return (
      <>
         <Modal
            isOpen={isOpen}
            overflow="visible"
            onClose={() => {
               if (isDirty) {
                  setShowDiscardConfirm(true);
                  return;
               }
               onClose();
            }}
            title={t("event.addUpdateTitle")}
            size="medium"
            footer={
               <div className="flex justify-end gap-2 w-full">
                  <Button
                     variant="secondary"
                     onClick={() => {
                        if (isDirty) {
                           setShowDiscardConfirm(true);
                           return;
                        }
                        onClose();
                     }}>
                     {t("actions.cancel")}
                  </Button>
                  <Button form="addUpdateForm" type="submit">
                     {t("actions.addUpdate")}
                  </Button>
               </div>
            }>
            <GenericForm<AddUpdateFormValues>
               id="addUpdateForm"
               schema={schema}
               defaultValues={defaultValues}
               fields={fields}
               onSubmit={onAdd}
               onDirtyChange={setIsDirty}
               showSubmitButton={false} // Render our own submit button in the footer
            />
         </Modal>
         <ConfirmModal
            isOpen={showDiscardConfirm}
            onClose={() => setShowDiscardConfirm(false)}
            onConfirm={() => {
               setShowDiscardConfirm(false);
               onClose();
            }}
            title={t("unsavedChanges.title")}
            description={t("unsavedChanges.description")}
            confirmText={t("unsavedChanges.confirm")}
            cancelText={t("unsavedChanges.cancel")}
         />
      </>
   );
}
