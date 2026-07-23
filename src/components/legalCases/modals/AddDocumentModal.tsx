/** @format */

import { useState, useMemo } from "react";
import Modal from "@/designSystem/Modal";
import Button from "@/designSystem/Button";
import GenericForm, { FieldConfig } from "@/designSystem/GenericForm";
import * as yup from "yup";
import { useTranslation } from "@/hooks/useTranslation";
import type { LegalCaseEvent } from "@/services/legalCasesService";
import ConfirmModal from "@/designSystem/ConfirmModal";

interface AddDocumentModalProps {
   isOpen: boolean;
   onClose: () => void;
   onAdd: (data: {
      file_id: number;
      file_name?: string;
      event_id?: number;
      token?: string;
   }) => void;
   events?: LegalCaseEvent[];
}

interface UploadedFile {
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
}

// Helper function to normalize documents to array
const normalizeToArray = (
   docs: UploadedFile[] | UploadedFile | undefined,
): UploadedFile[] => {
   if (!docs) return [];
   return Array.isArray(docs) ? docs : [docs];
};

interface FormValues extends Record<string, unknown> {
   event_id?: string;
   documents: UploadedFile[] | UploadedFile;
}

const documentSchema = yup.object({
   event_id: yup.string().optional(),
   documents: yup
      .mixed()
      .test("has-documents", "Please upload at least one document", (value) => {
         const docs = normalizeToArray(
            value as UploadedFile[] | UploadedFile | undefined,
         );
         return docs.length > 0 && docs.some((doc) => doc.fileId && !doc.error);
      })
      .required("Please upload at least one document"),
}) as yup.ObjectSchema<FormValues>;

export default function AddDocumentModal({
   isOpen,
   onClose,
   onAdd,
   events = [],
}: AddDocumentModalProps) {
   const { t } = useTranslation("settings");
   const { t: tCommon } = useTranslation("common");
   const [formData, setFormData] = useState<FormValues>({
      event_id: "",
      documents: [],
   });
   const [isDirty, setIsDirty] = useState(false);
   const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
   const [isSubmitting, setIsSubmitting] = useState(false);

   const eventOptions = useMemo(
      () =>
         events.map((event) => ({
            id: String(event.id),
            label: event.title,
         })),
      [events],
   );

   // Check if any files are still uploading
   const hasUploadingFiles = normalizeToArray(formData.documents).some(
      (doc) => doc.isUploading,
   );

   const fields: FieldConfig[] = useMemo(
      () => [
         {
            name: "documents",
            type: "uploadField" as const,
            label: t("legalCases.addDocumentModal.fileLabel") || "Document",
            accept: "image/jpeg,image/png,application/pdf,.doc,.docx",
            multiple: false,
            uploadPurpose: "general",
            required: true,
         },
         {
            name: "event_id",
            label:
               t("legalCases.addDocumentModal.eventLabel") || "Link to Event",
            type: "select",
            placeholder: t("legalCases.addDocumentModal.noEvent") || "No event",
            options: eventOptions,
         },
      ],
      [t, eventOptions],
   );

   const handleFieldChange = (field: keyof FormValues, value: unknown) => {
      setFormData((prev) => ({
         ...prev,
         [field]: value,
      }));
   };

   const handleSubmit = async (data: FormValues) => {
      try {
         setIsSubmitting(true);
         // Get uploaded documents (filter out uploading/failed ones)
         const uploadedDocs = normalizeToArray(data.documents).filter(
            (doc) => doc.fileId && !doc.isUploading && !doc.error,
         );

         if (uploadedDocs.length === 0) {
            return;
         }

         const doc = uploadedDocs[0];
         onAdd({
            file_id: doc.fileId!,
            file_name: doc.fileName,
            event_id: data.event_id ? parseInt(data.event_id) : undefined,
            token: doc.token,
         });

         handleClose();
      } catch (error) {
         console.error("Submit failed:", error);
      } finally {
         setIsSubmitting(false);
      }
   };

   const handleClose = () => {
      setFormData({ event_id: "", documents: [] });
      setIsDirty(false);
      onClose();
   };

   const handleRequestClose = () => {
      if (isDirty || normalizeToArray(formData.documents).length > 0) {
         setShowDiscardConfirm(true);
         return;
      }
      handleClose();
   };

   const isBusy = isSubmitting || hasUploadingFiles;
   const hasValidDocument = normalizeToArray(formData.documents).some(
      (doc) => doc.fileId && !doc.isUploading && !doc.error,
   );

   return (
      <>
			<Modal
				isOpen={isOpen}
				onClose={handleRequestClose}
				title={t("legalCases.addDocumentModal.title")}
				size="medium"
				contentClassName="h-[60vh] md:h-[64vh] xl:h-[68vh]"
				showHeaderDivider={false}
				footer={
               <div className="flex items-center justify-end gap-3 w-full">
                  <Button
                     variant="secondary"
                     onClick={handleRequestClose}
                     disabled={isBusy}
                     className="px-3 py-2 text-sm cursor-pointer">
                     {tCommon("actions.cancel")}
                  </Button>
                  <Button
                     form="addDocumentForm"
                     type="submit"
                     disabled={isBusy || !hasValidDocument}
                     className="cursor-pointer">
                     {isBusy
                        ? tCommon("actions.uploading") || "Uploading..."
                        : tCommon("actions.upload")}
                  </Button>
               </div>
            }>
            <div className="w-full">
               <GenericForm<FormValues>
                  id="addDocumentForm"
                  schema={documentSchema}
                  defaultValues={formData}
                  formData={formData}
                  fields={fields}
                  onSubmit={handleSubmit}
                  onFieldChange={handleFieldChange}
                  onDirtyChange={setIsDirty}
                  showSubmitButton={false}
               />
            </div>
         </Modal>
         <ConfirmModal
            isOpen={showDiscardConfirm}
            onClose={() => setShowDiscardConfirm(false)}
            onConfirm={() => {
               setShowDiscardConfirm(false);
               handleClose();
            }}
            title={tCommon("unsavedChanges.title")}
            description={tCommon("unsavedChanges.description")}
            confirmText={tCommon("unsavedChanges.confirm")}
            cancelText={tCommon("unsavedChanges.cancel")}
         />
      </>
   );
}
