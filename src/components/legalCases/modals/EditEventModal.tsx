/** @format */

import { useState, useMemo } from "react";
import Modal from "@/designSystem/Modal";
import Button from "@/designSystem/Button";
import ConfirmModal from "@/designSystem/ConfirmModal";
import GenericForm, { FieldConfig } from "@/designSystem/GenericForm";
import * as yup from "yup";
import { useTranslation } from "@/hooks/useTranslation";
import type { LegalCaseEvent } from "@/services/legalCasesService";

interface EditEventModalProps {
   isOpen: boolean;
   onClose: () => void;
   event: LegalCaseEvent;
   onUpdate: (data: EditEventFormValues) => void;
}

export interface EditEventFormValues extends Record<string, unknown> {
   event_title: string;
   event_date: string;
   description?: string;
}

const getValidationSchema = (t: (key: string, options?: any) => string) =>
   yup.object().shape({
      event_title: yup
         .string()
         .max(255, t("validation.maxLength"))
         .required(t("validation.required")),
      event_date: yup
         .string()
         .required(t("validation.required"))
         .matches(/^\d{4}-\d{2}-\d{2}$/, t("validation.dateFormat")),
      description: yup
         .string()
         .max(500, t("validation.maxLength", { length: 500 }))
         .optional(),
   });

export default function EditEventModal({
   isOpen,
   onClose,
   event,
   onUpdate,
}: EditEventModalProps) {
   const { t } = useTranslation("settings");
   const { t: tCommon } = useTranslation("common");
   const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
   const [isFormDirty, setIsFormDirty] = useState(false);

   const schema = getValidationSchema(tCommon);

   const fields: FieldConfig[] = [
      {
         name: "event_title",
         label: t("legalCases.editEventModal.title"),
         placeholder: t("legalCases.editEventModal.titlePlaceholder"),
         type: "text",
         required: true,
         maxLength: 255,
      },
      {
         name: "event_date",
         label: t("legalCases.editEventModal.date"),
         type: "date",
         required: true,
      },
      {
         name: "description",
         label: t("legalCases.editEventModal.description"),
         placeholder: t("legalCases.editEventModal.descriptionPlaceholder"),
         type: "textarea",
         rows: 3,
         maxLength: 500,
      },
   ];

   const defaultValues: EditEventFormValues = useMemo(
      () => ({
         event_title: event.title || "",
         event_date: event.date
            ? new Date(event.date).toISOString().split("T")[0]
            : new Date().toISOString().split("T")[0],
         description: event.description || "",
      }),
      [event]
   );

   const handleFormSubmit = (data: EditEventFormValues) => {
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
            title={t("legalCases.editEventModal.modalTitle")}
            size="medium"
            overflow="visible"
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
                     form="editEventForm"
                     type="submit"
                     className="cursor-pointer">
                     {tCommon("actions.update")}
                  </Button>
               </div>
            }>
            <GenericForm<EditEventFormValues>
               id="editEventForm"
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
