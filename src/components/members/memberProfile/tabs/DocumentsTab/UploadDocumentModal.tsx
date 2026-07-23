/** @format */

import { useState } from "react";
import Modal from "@/designSystem/Modal";
import Button from "@/designSystem/Button";
import GenericForm from "@/designSystem/GenericForm";
import ConfirmModal from "@/designSystem/ConfirmModal";
import { useTranslation } from "@/hooks/useTranslation";
import { useUploadEmployeeDocument } from "@/hooks/employees/employee.mutations";
import toast from "@/utilities/toast";
import * as Yup from "yup";
import { filterReadyUploads } from "@/utils/uploadValidation";

interface UploadDocumentModalProps {
   isOpen: boolean;
   onClose: () => void;
   employeeId: string;
}

interface DocumentFormData {
   documents: Array<{
      fileName: string;
      fileSize: number;
      fileType: string;
      fileUrl?: string;
      fileId?: number;
      token?: string;
      key?: string;
      purpose?: string;
      progress: number;
      isUploading: boolean;
      error?: string;
   }>;
}

const documentSchema = Yup.object().shape({
   documents: Yup.array().min(1, "Please upload at least one document"),
});

function UploadDocumentModal({
   isOpen,
   onClose,
   employeeId,
}: UploadDocumentModalProps) {
   const { t } = useTranslation("members");
   const { t: tCommon } = useTranslation("common");
   const [formData, setFormData] = useState<DocumentFormData>({
      documents: [],
   });
   const [isDirty, setIsDirty] = useState(false);
   const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
   const uploadDocumentMutation = useUploadEmployeeDocument();

   const isBusy = uploadDocumentMutation.isPending;

   // Check if any files are still uploading
   const hasUploadingFiles = formData.documents.some((doc) => doc.isUploading);

   const handleClose = () => {
      if (isBusy) return;
      if (isDirty) {
         setShowDiscardConfirm(true);
         return;
      }
      setFormData({ documents: [] });
      onClose();
   };

   const handleFieldChange = (field: string, value: unknown) => {
      setFormData((prev) => ({
         ...prev,
         [field]: value,
      }));
   };

   const handleSubmit = async (data: any) => {
      try {
         // Get uploaded documents (filter out uploading/failed ones)
         const uploadedDocs = filterReadyUploads(data.documents || []);

         if (uploadedDocs.length === 0) {
            toast.error("Please wait for uploads to complete");
            return;
         }

         // Get current date in ISO format (YYYY-MM-DD)
         const currentDate = new Date().toISOString().split('T')[0];

         // Upload each document to the backend
         for (const doc of uploadedDocs) {
            await uploadDocumentMutation.mutateAsync({
               id: employeeId,
               payload: {
                  file_id: Number(doc.fileId),
                  file_token: doc.token,
                  document_type: "other", // Default type
                  issue_date: currentDate, // Automatically set to current date
               },
            });
         }

         toast.success(
            uploadedDocs.length === 1
               ? t("documents.uploadSuccess", { name: uploadedDocs[0].fileName })
               : `${uploadedDocs.length} documents uploaded successfully`
         );
         setFormData({ documents: [] });
         setIsDirty(false);
         onClose();
      } catch (err) {
         console.error("Failed to upload documents", err);
         toast.error("Failed to upload documents");
      }
   };


   const fields = [
      {
         name: "documents",
         type: "uploadField" as const,
         label: "Attach Documents",
         accept: "image/jpeg,image/png,application/pdf",
         multiple: true,
         uploadPurpose: "employee_document",
      },
   ];

   return (
      <Modal
         isOpen={isOpen}
         onClose={handleClose}
         title="Upload Documents"
         width="r-modal-w xl:w-[600px]"
         contentClassName="flex flex-col items-start r-p-sm r-gap w-full bg-background max-h-[70vh] overflow-y-auto xl:p-5 xl:gap-5"
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
                  form="upload-document-form"
                  disabled={isBusy || hasUploadingFiles || formData.documents.length === 0}
                  className="r-btn-full xl:px-4 xl:py-2 xl:rounded-xl">
                  {isBusy ? "Uploading..." : "Upload Documents"}
               </Button>
            </div>
         }>
         <div className="w-full">
            <GenericForm
               id="upload-document-form"
               schema={documentSchema}
               defaultValues={formData}
               formData={formData}
               onSubmit={handleSubmit}
               onFieldChange={handleFieldChange}
               showSubmitButton={false}
               mode="onChange"
               fields={fields}
               onDirtyChange={setIsDirty}
            />
         </div>
         <ConfirmModal
            isOpen={showDiscardConfirm}
            onClose={() => setShowDiscardConfirm(false)}
            onConfirm={() => {
               setFormData({ documents: [] });
               onClose();
            }}
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

export default UploadDocumentModal;
