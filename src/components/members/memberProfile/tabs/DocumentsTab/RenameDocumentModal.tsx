/** @format */

import { useMemo, useState } from "react";
import Modal from "@/designSystem/Modal";
import Button from "@/designSystem/Button";
import GenericForm, { FieldConfig } from "@/designSystem/GenericForm";
import ConfirmModal from "@/designSystem/ConfirmModal";
import { useRenameEmployeeDocument } from "@/hooks/employees/employee.mutations";
import toast from "@/utilities/toast";
import * as yup from "yup";
import { useTranslation } from "@/hooks/useTranslation";

interface RenameDocumentModalProps {
   isOpen: boolean;
   onClose: () => void;
   employeeId: string;
   documentId: number;
   currentName: string;
}

function RenameDocumentModal({
   isOpen,
   onClose,
   employeeId,
   documentId,
   currentName,
}: RenameDocumentModalProps) {
   const { t } = useTranslation("common");
   const renameMutation = useRenameEmployeeDocument();
   const [isDirty, setIsDirty] = useState(false);
   const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

   const formData = useMemo(
      () => ({ documentName: currentName || "" }),
      [currentName]
   );
   const fields: FieldConfig[] = [
      {
         name: "documentName",
         type: "text",
         label: "Document Name",
         placeholder: "Enter document name",
         required: true,
         disabled: renameMutation.isPending,
      },
   ];
   const renameDocumentSchema = yup.object({
      documentName: yup
         .string()
         .trim()
         .required("Document name is required"),
   });

   const isBusy = renameMutation.isPending;

   const handleClose = () => {
      if (isBusy) return;
      if (isDirty) {
         setShowDiscardConfirm(true);
         return;
      }
      onClose();
   };

   const handleSubmit = async (data: { documentName: string }) => {
      const trimmedName = data.documentName.trim();
      try {
         await renameMutation.mutateAsync({
            employeeId,
            documentId,
            name: trimmedName,
         });

         toast.success("Document renamed successfully");
         setIsDirty(false);
         onClose();
      } catch (err) {
         console.error("Failed to rename document", err);
         toast.error("Failed to rename document");
      }
   };

   return (
      <Modal
         isOpen={isOpen}
         onClose={handleClose}
         title="Rename Document"
         width="r-modal-w xl:w-[500px]"
         contentClassName="flex flex-col items-start r-p-sm r-gap w-full bg-background xl:p-5 xl:gap-5"
         showHeaderDivider={false}
         footer={
            <div className="r-btn-group xl:flex-row xl:justify-end xl:items-center xl:gap-3 xl:flex-1">
               <Button
                  variant="secondary"
                  onClick={handleClose}
                  disabled={isBusy}
                  className="r-btn-full xl:px-4 xl:py-2 xl:rounded-xl">
                  Cancel
               </Button>
               <Button
                  type="submit"
                  form="rename-document-form"
                  disabled={isBusy}
                  className="r-btn-full xl:px-4 xl:py-2 xl:rounded-xl">
                  {isBusy ? "Renaming..." : "Rename"}
               </Button>
            </div>
         }>
         <div className="w-full">
            <GenericForm
               id="rename-document-form"
               schema={renameDocumentSchema}
               defaultValues={formData}
               formData={isOpen ? formData : undefined}
               onSubmit={handleSubmit}
               fields={fields}
               showSubmitButton={false}
               mode="onChange"
               onDirtyChange={setIsDirty}
            />
         </div>
         <ConfirmModal
            isOpen={showDiscardConfirm}
            onClose={() => setShowDiscardConfirm(false)}
            onConfirm={onClose}
            title={t("unsavedChanges.title")}
            description={t("unsavedChanges.description")}
            confirmText={t("unsavedChanges.confirm")}
            cancelText={t("unsavedChanges.cancel")}
            variant="primary"
            icon="exclamation"
         />
      </Modal>
   );
}

export default RenameDocumentModal;
