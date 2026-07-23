/** @format */

import { useMemo, useState, useRef } from "react";
import { useTranslation } from "@/hooks/useTranslation";

import LoadingState from "@/designSystem/LoadingState";
import Dropdown from "@/designSystem/Dropdown";
import ConfirmModal from "@/designSystem/ConfirmModal";
import {
   useDeleteEmployeeDocument,
   useGetEmployeeDocuments,
} from "@/hooks/employees/useEmployee";
import type { EmployeeDocument } from "@/services/employeeService";
import { usePdfPreview } from "@/context/PdfPreviewContext";
import { downloadFile, isImageFile, isPdfFile } from "@/utils/file";
import {
   AddLine,
   DownloadBracket,
   MoreVertical,
   PdfFile,
   Eye,
   Edit,
   Trash,
} from "@/Icons";
import UploadDocumentModal from "./UploadDocumentModal";
import RenameDocumentModal from "./RenameDocumentModal";
import { usePermissions } from "@/contexts/PermissionContext";
import { buildStorageUrl } from "@/utils/storageUrl";
import toast from "@/utilities/toast";

interface DocumentsTabProps {
   title?: string;
   count?: number;
   employeeId: string;
}

const buildFileUrl = (filePath?: string | null) => buildStorageUrl(filePath);

function DocumentsTab({ employeeId }: DocumentsTabProps) {
   const { t } = useTranslation("members");
   const { openPreview } = usePdfPreview();
   const { can } = usePermissions();
   const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

   const canManageDocuments = can("manage_employee_documents");
   const {
      data: documentsResponse,
      isLoading,
      error,
   } = useGetEmployeeDocuments(employeeId, undefined, {
      enabled: Boolean(employeeId),
   });

   const documents = useMemo(
      () => documentsResponse?.data ?? [],
      [documentsResponse?.data],
   );
   const filteredDocuments = documents;

   const handleDownload = async (documentItem: EmployeeDocument) => {
      const downloadUrl = buildFileUrl(documentItem.file_url);
      if (!downloadUrl) return;
      await downloadFile({ url: downloadUrl, fileName: documentItem.name });
   };

   const handleViewDocument = (documentItem: EmployeeDocument) => {
      const fileUrl = buildFileUrl(documentItem.file_url);
      if (!fileUrl) return;
      const isPdf = isPdfFile({
         fileName: documentItem.name,
         url: fileUrl,
      });

      if (isPdf) {
         openPreview({ url: fileUrl, fileName: documentItem.name });
      } else if (typeof window !== "undefined") {
         window.open(fileUrl, "_blank", "noopener,noreferrer");
      }
   };

   return (
      <div className="w-full flex flex-col r-gap xl:gap-6">
         {/* Header Section */}
         <div className="r-stack items-start md:items-center justify-between r-gap-sm xl:gap-4">
            {/* Placeholder to preserve old header alignment after removing search */}
            <div className="hidden md:block w-full md:max-w-md xl:max-w-md" />

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-end r-gap-sm w-full md:w-auto xl:gap-2">
               {/* Add Documents Button - Only show if user has permission */}
               {canManageDocuments && (
                  <button
                     onClick={() => setIsUploadModalOpen(true)}
                     className="r-btn-full flex items-center gap-2 bg-text-strong text-text-main rounded-lg hover:bg-text-strong/90 transition-colors text-sm font-medium px-3 py-2 xl:px-3 xl:py-2">
                     <AddLine className="size-5 fill-current" />
                     <span>{t("documents.addDocuments")}</span>
                  </button>
               )}
            </div>
         </div>

         {/* Documents Grid */}
         {isLoading ? (
            <LoadingState size="medium" label={t("loading.documents")} />
         ) : error ? (
            <div className="w-full border border-border bg-bg-weak text-sm text-danger text-center r-rounded r-p-sm xl:rounded-2xl xl:p-6">
               {t("error")}
            </div>
         ) : filteredDocuments.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 r-gap-sm xl:grid-cols-4 xl:gap-4">
               {filteredDocuments.map((document) => (
                  <DocumentCard
                     key={document.id}
                     document={document}
                     employeeId={employeeId}
                     onDownload={handleDownload}
                     onView={handleViewDocument}
                  />
               ))}
            </div>
         ) : (
            <div className="w-full border border-dashed border-border bg-bg-weak text-sm text-text-sub text-center r-rounded r-p-sm xl:rounded-2xl xl:p-6">
               <p>{t("placeholders.documents.description")}</p>
            </div>
         )}

         {/* Upload Document Modal */}
         <UploadDocumentModal
            isOpen={isUploadModalOpen}
            onClose={() => setIsUploadModalOpen(false)}
            employeeId={employeeId}
         />
      </div>
   );
}

interface DocumentCardProps {
   document: EmployeeDocument;
   employeeId: string;
   onDownload: (doc: EmployeeDocument) => void;
   onView: (doc: EmployeeDocument) => void;
}

function DocumentCard({
   document,
   employeeId,
   onDownload,
   onView,
}: DocumentCardProps) {
   const { t } = useTranslation("members");
   const { can, roleName } = usePermissions();
   const deleteDocumentMutation = useDeleteEmployeeDocument();
   const [isDropdownOpen, setIsDropdownOpen] = useState(false);
   const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
   const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
   const [isFinalDeleteConfirmOpen, setIsFinalDeleteConfirmOpen] =
      useState(false);
   const [isImagePreviewError, setIsImagePreviewError] = useState(false);
   const moreButtonRef = useRef<HTMLButtonElement>(null);

   const canManageDocuments = can("manage_employee_documents");
   const isSuperAdmin = roleName?.toLowerCase().trim() === "super admin";
   const fileUrl = buildFileUrl(document.file_url);
   const canShowImagePreview =
      Boolean(fileUrl) &&
      isImageFile({ fileName: document.name, url: fileUrl });

   const fileType =
      document.name?.split(".").pop()?.toUpperCase() ||
      document.document_type ||
      "FILE";
   const fileSizeLabel = document.file_size || t("documents.unknownSize");
   const issueDate = document.issue_date
      ? new Date(document.issue_date).toLocaleDateString("en-GB")
      : null;

   const handleDeleteDocument = async () => {
      try {
         await deleteDocumentMutation.mutateAsync({
            employeeId,
            documentId: document.id,
         });
         toast.success("Document deleted successfully");
         setIsFinalDeleteConfirmOpen(false);
      } catch (err) {
         console.error("Failed to delete document", err);
         toast.error("Failed to delete document");
      }
   };

   const dropdownItems = [
      {
         id: "preview",
         label: "Preview",
         icon: Eye,
         onClick: () => onView(document),
      },
      ...(canManageDocuments
         ? [
              {
                 id: "edit-name",
                 label: "Edit Name",
                 icon: Edit,
                 onClick: () => setIsRenameModalOpen(true),
              },
           ]
         : []),
      ...(isSuperAdmin
         ? [
              {
                 id: "delete",
                 label: "Delete",
                 icon: Trash,
                 variant: "danger" as const,
                 onClick: () => setIsDeleteConfirmOpen(true),
              },
           ]
         : []),
   ];

   return (
      <div className="bg-background border border-border r-rounded overflow-hidden hover:shadow-subtle transition-shadow xl:rounded-2xl">
         {/* Preview Thumbnail */}
         <div className="w-full h-40 sm:h-48 xl:h-48 bg-bg-weak border-b border-border flex items-center justify-center p-3 xl:p-4">
            <div className="w-full h-full bg-background rounded-lg border border-border flex items-center justify-center">
               {canShowImagePreview && !isImagePreviewError ? (
                  <img
                     src={fileUrl}
                     alt={document.name || "Document preview"}
                     className="w-full h-full object-cover rounded-lg"
                     loading="lazy"
                     onError={() => setIsImagePreviewError(true)}
                  />
               ) : (
                  <PdfFile size={48} />
               )}
            </div>
         </div>

         {/* Document Info */}
         <div className="flex flex-col r-gap-sm r-p-sm xl:p-4 xl:gap-3">
            {/* Title */}
            <h3 className="text-sm font-medium text-text-strong line-clamp-2">
               {document.name}
            </h3>

            {/* File Details */}
            <div className="flex flex-col gap-1">
               <p className="text-xs text-text-sub">
                  {fileType} · {fileSizeLabel}
               </p>

               {issueDate && (
                  <p className="text-xs text-text-sub">
                     {t("fields.issueDate")}: {issueDate}
                  </p>
               )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center r-gap-sm xl:gap-2 xl:flex-nowrap">
               <button
                  onClick={() => onDownload(document)}
                  className="r-btn-full flex items-center justify-center gap-2 bg-text-strong text-text-main rounded-lg hover:bg-text-strong/90 transition-colors text-sm font-medium cursor-pointer px-3 py-2 xl:px-3 xl:py-2 xl:w-full">
                  <DownloadBracket className="size-4 fill-current" />
                  <span>{t("documents.download")}</span>
               </button>
               <button
                  ref={moreButtonRef}
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="p-2 bg-background border border-border rounded-lg hover:bg-bg-weak transition-colors cursor-pointer"
                  aria-label={t("documents.moreOptions")}>
                  <MoreVertical className="size-5 fill-text-sub" />
               </button>
            </div>
         </div>

         {/* Dropdown Menu */}
         <Dropdown
            items={dropdownItems}
            isOpen={isDropdownOpen}
            onClose={() => setIsDropdownOpen(false)}
            anchorRef={moreButtonRef}
         />

         {/* Rename Document Modal */}
         <RenameDocumentModal
            isOpen={isRenameModalOpen}
            onClose={() => setIsRenameModalOpen(false)}
            employeeId={employeeId}
            documentId={document.id}
            currentName={document.name}
         />

         <ConfirmModal
            isOpen={isDeleteConfirmOpen}
            onClose={() => setIsDeleteConfirmOpen(false)}
            onConfirm={() => {
               setIsDeleteConfirmOpen(false);
               setIsFinalDeleteConfirmOpen(true);
            }}
            title="Delete document?"
            description="This action will remove this document from the employee profile."
            confirmText="Continue"
            cancelText="Cancel"
            variant="error"
            icon="exclamation"
         />

         <ConfirmModal
            isOpen={isFinalDeleteConfirmOpen}
            onClose={() => setIsFinalDeleteConfirmOpen(false)}
            onConfirm={handleDeleteDocument}
            title="Final confirmation"
            description="Are you sure you want to permanently delete this document? This cannot be undone."
            confirmText="Delete"
            cancelText="Back"
            variant="error"
            icon="exclamation"
            isLoading={deleteDocumentMutation.isPending}
         />
      </div>
   );
}

export default DocumentsTab;
