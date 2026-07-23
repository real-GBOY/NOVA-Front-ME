/** @format */

import { useState, useRef } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import DetailSectionsGrid from "../DetailSectionsGrid";
import { DetailSectionData } from "../types";
import { ResidencyPermit, SupplementaryResidencyDocument } from "@/services/employeeService";
import LoadingState from "@/designSystem/LoadingState";
import Dropdown from "@/designSystem/Dropdown";
import ConfirmModal from "@/designSystem/ConfirmModal";
import { DownloadBracket, PdfFile, MoreVertical, Eye, IdCardClipText, HourglassHalf, Plus, Trash } from "@/Icons";
import { downloadFile, isImageFile, isPdfFile } from "@/utils/file";
import { usePdfPreview } from "@/context/PdfPreviewContext";
import EditResidencyForm from "./modals/EditResidencyForm";
import UploadResidencyFilesModal from "./modals/UploadResidencyFilesModal";
import { buildStorageUrl } from "@/utils/storageUrl";
import { usePermissions } from "@/contexts/PermissionContext";
import { useDeleteEmployeeDocument, useUpdateResidency } from "@/hooks/employees/employee.mutations";
import toast from "@/utilities/toast";

interface ResidencyTabProps {
   residencyData: {
      permits: ResidencyPermit[];
      supplementaryDocuments: SupplementaryResidencyDocument[];
   };
   isLoading: boolean;
   employeeId?: string | number;
   canEdit?: boolean;
}

const buildFileUrl = (filePath?: string | null) => buildStorageUrl(filePath);

function ResidencyTab({ residencyData, isLoading, employeeId, canEdit = false }: ResidencyTabProps) {
	const { t } = useTranslation("members");
	const { openPreview } = usePdfPreview();
   const { roleName } = usePermissions();
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const [selectedPermit, setSelectedPermit] = useState<ResidencyPermit | null>(null);
	const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
   const isSuperAdmin = roleName?.toLowerCase().trim() === "super admin";

	if (isLoading) {
		return (
			<div className='w-full py-10 xl:py-12'>
				<LoadingState size='large' label={t("loading.profile")} />
			</div>
		);
	}

   const hasData = residencyData.permits.length > 0 || residencyData.supplementaryDocuments.length > 0;

   if (!hasData) {
      return (
         <div className='w-full py-10 xl:py-12 flex flex-col items-center justify-center bg-card border border-border-subtle r-rounded xl:rounded-xl'>
            <p className='text-text-sub'>{t("profile.residency.noResidencyFound")}</p>
         </div>
      );
   }

   const formatDate = (dateString: string | null) => {
      if (!dateString) return t("fields.notProvided");
      return new Date(dateString).toLocaleDateString("en-GB", {
         day: "2-digit",
         month: "short",
         year: "numeric",
      });
   };

   const handleDownload = (file: { url: string | null; name: string }) => {
      const downloadUrl = buildFileUrl(file.url);
      if (!downloadUrl) return;
      downloadFile({ url: downloadUrl, fileName: file.name });
   };

   const handleViewDocument = (file: { url: string | null; name: string }) => {
      const fileUrl = buildFileUrl(file.url);
      if (!fileUrl) return;
      const isPdf = isPdfFile({ fileName: file.name, url: fileUrl });

      if (isPdf) {
         openPreview({ url: fileUrl, fileName: file.name });
      } else if (typeof window !== "undefined") {
         window.open(fileUrl, "_blank", "noopener,noreferrer");
      }
   };

   // Get the primary permit (first one)
   const primaryPermit = residencyData.permits[0];

   const handleEdit = (permit: ResidencyPermit) => {
      setSelectedPermit(permit);
      setIsEditModalOpen(true);
   };

   const handleEditSuccess = () => {
      setIsEditModalOpen(false);
      setSelectedPermit(null);
   };

   // Calculate days remaining for the primary permit
   const calculateDaysRemaining = (expiryDate: string | null) => {
      if (!expiryDate) return null;
      const today = new Date();
      const expiry = new Date(expiryDate);
      const diffTime = expiry.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
   };

   const daysRemaining = primaryPermit ? calculateDaysRemaining(primaryPermit.expiration_date) : null;
   const isExpired = daysRemaining !== null && daysRemaining < 0;
   const isExpiringSoon = daysRemaining !== null && daysRemaining > 0 && daysRemaining <= 30;

   // Map residency permits to sections (for the permit details)
   const permitSections: DetailSectionData[] = residencyData.permits.map((permit, index) => ({
      id: `residency-details-${index}`,
      title: `${t("profile.residency.title")} ${residencyData.permits.length > 1 ? `#${index + 1}` : ""}`,
      items: [
         {
            label: t("profile.residency.permitNumber"),
            value: permit.permit_number,
         },
         {
            label: t("profile.residency.permitType"),
            value: permit.permit_type || t("fields.notProvided"),
         },
         {
            label: t("profile.residency.issueDate"),
            value: formatDate(permit.issue_date),
         },
         {
            label: t("profile.residency.expiryDate"),
            value: formatDate(permit.expiration_date),
         },
         {
            label: t("profile.residency.country"),
            value: permit.country || t("fields.notProvided"),
         },
         {
            label: t("profile.residency.status"),
            value: permit.status,
            badge: true,
         },
      ],
   }));

   // Collect all documents (from permits and supplementary)
   const allDocuments = [
      ...residencyData.permits
         .filter(p => p.file)
         .map(p => ({
            id: `permit-${p.permit_id}`,
            name: p.file!.name,
            url: p.file!.url,
            size: p.file!.size,
            type: "Residency Permit",
            issueDate: p.issue_date,
            source: "permit" as const,
            permit: p,
         })),
      ...residencyData.supplementaryDocuments
         .filter(d => d.file)
         .map(d => ({
            id: `doc-${d.document_id}`,
            name: d.file!.name,
            url: d.file!.url,
            size: d.file!.size,
            type: d.document_type,
            issueDate: d.uploaded_at,
            source: "supplementary" as const,
            documentId: d.document_id,
         })),
   ];

   const dedupedDocuments = (() => {
      const seen = new Set<string>();
      return allDocuments.filter((doc) => {
         const key = `${doc.name}::${doc.url || ""}`;
         if (seen.has(key)) return false;
         seen.add(key);
         return true;
      });
   })();

	return (
		<div className='w-full flex flex-col r-gap xl:gap-4'>
         {/* Top Section: Duration Card + Permit Details */}
         <div className="r-stack r-gap xl:gap-6">
            {/* Residency Duration Card */}
            {primaryPermit && (
               <div className="border border-border bg-background r-rounded r-p-sm flex-1 flex flex-col xl:rounded-2xl xl:p-4">
                  <div className="flex flex-wrap items-center justify-between r-gap-sm xl:gap-3">
                     <div className="flex items-center gap-3 xl:gap-3">
                        <IdCardClipText size={24} />
                        <h3 className="text-lg font-medium leading-6 text-text-strong tracking-tight">
                           Residency Duration
                        </h3>
                     </div>
                  </div>
                  <div className="flex flex-col r-gap flex-grow justify-between pt-5 xl:pt-7 xl:gap-4">
                     <div className="r-grid-form r-gap xl:grid-cols-2 xl:gap-6">
                        <div className="flex flex-col gap-1.5 text-sm">
                           <span className="text-text-sub">
                              {t("profile.residency.issueDate")}
                           </span>
                           <span className="text-text-strong font-medium">
                              {formatDate(primaryPermit.issue_date)}
                           </span>
                        </div>
                        <div className="flex flex-col gap-1.5 text-sm">
                           <span className="text-text-sub">
                              {t("profile.residency.expiryDate")}
                           </span>
                           <span className="text-text-strong font-medium">
                              {formatDate(primaryPermit.expiration_date)}
                           </span>
                        </div>
                     </div>
                     <div className="flex flex-wrap items-center gap-2 xl:gap-3 mt-2">
                        <div className="relative flex-1 h-2 rounded-full bg-bg-weak overflow-hidden">
                           <div
                              className={`absolute inset-y-0 start-0 rounded-full ${
                                 isExpired ? 'bg-error' : isExpiringSoon ? 'bg-warning' : 'bg-success'
                              }`}
                              style={{ 
                                 width: isExpired ? '100%' : `${Math.max(0, Math.min(100, ((daysRemaining || 0) / 365) * 100))}%` 
                              }}
                           />
                        </div>
                        <div className="flex items-center gap-1.5 min-w-fit">
                           <HourglassHalf size={16} className="fill-icon-sub" />
                           <span className="text-xs text-text-sub whitespace-nowrap">
                              {isExpired 
                                 ? "Residency Expired" 
                                 : `${daysRemaining} Days Remaining`}
                           </span>
                        </div>
                     </div>
                  </div>
               </div>
            )}

            {/* Permit Details Section */}
            {permitSections.length > 0 && (
               <div className='w-full xl:flex-[2]'>
                  <DetailSectionsGrid
                     sections={permitSections}
                     itemsPerRow={3}
                     canEdit={canEdit}
                     onEdit={(sectionId) => {
                        const index = parseInt(sectionId.split("-").pop() || "0");
                        const permit = residencyData.permits[index];
                        if (permit && employeeId) {
                           handleEdit(permit);
                        }
                     }}
                  />
               </div>
            )}
         </div>

         {/* Residency Attachments Section */}
         <div className='w-full flex flex-col r-gap xl:gap-4'>
            <div className="flex items-center justify-between">
               <h3 className='text-base font-semibold text-text-strong'>
                  {t("profile.residency.attachmentsTitle")}
               </h3>
               {canEdit && primaryPermit && (
                  <button
                     type="button"
                     onClick={() => setIsUploadModalOpen(true)}
                     className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-primary hover:text-primary/80 hover:bg-primary/10 rounded-md transition-colors"
                     title={t("profile.residency.addFiles")}>
                     <Plus size={14} className="fill-primary" />
                     <span>{t("profile.residency.addFiles")}</span>
                  </button>
               )}
            </div>
            {dedupedDocuments.length > 0 ? (
               <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 r-gap-sm xl:gap-4'>
                  {dedupedDocuments.map((doc) => (
                     <DocumentCard
                        key={doc.id}
                        document={doc}
                        employeeId={employeeId}
                        canDelete={isSuperAdmin && Boolean(employeeId)}
                        onDownload={handleDownload}
                        onView={handleViewDocument}
                     />
                  ))}
               </div>
            ) : (
               <div className="w-full border border-border r-rounded bg-background r-p-sm text-center text-sm text-text-sub xl:rounded-2xl xl:p-6">
                  {t("profile.residency.noAttachments")}
               </div>
            )}
         </div>

         {/* Edit Residency Modal */}
         {employeeId && selectedPermit && (
            <EditResidencyForm
               isOpen={isEditModalOpen}
               onClose={() => {
                  setIsEditModalOpen(false);
                  setSelectedPermit(null);
               }}
               permitId={selectedPermit.permit_id}
               employeeId={employeeId}
               permitData={selectedPermit}
               onSuccess={handleEditSuccess}
            />
         )}
         {employeeId && primaryPermit && (
            <UploadResidencyFilesModal
               isOpen={isUploadModalOpen}
               onClose={() => setIsUploadModalOpen(false)}
               permitData={primaryPermit}
               employeeId={employeeId}
            />
         )}
		</div>
	);
}

interface DocumentCardProps {
   document: {
      id: string;
      name: string;
      url: string | null;
      size: number | null;
      type: string;
      issueDate: string | null;
      source: "permit" | "supplementary";
      permit?: ResidencyPermit;
      documentId?: number;
   };
   employeeId?: string | number;
   canDelete: boolean;
   onDownload: (file: { url: string | null; name: string }) => void;
   onView: (file: { url: string | null; name: string }) => void;
}

function DocumentCard({
   document,
   employeeId,
   canDelete,
   onDownload,
   onView,
}: DocumentCardProps) {
   const { t } = useTranslation("members");
   const deleteDocumentMutation = useDeleteEmployeeDocument();
   const updateResidencyMutation = useUpdateResidency();
   const [isDropdownOpen, setIsDropdownOpen] = useState(false);
   const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
   const [isFinalDeleteConfirmOpen, setIsFinalDeleteConfirmOpen] =
      useState(false);
   const [isImagePreviewError, setIsImagePreviewError] = useState(false);
   const moreButtonRef = useRef<HTMLButtonElement>(null);
   const fileUrl = buildFileUrl(document.url);
   const canShowImagePreview = Boolean(fileUrl) && isImageFile({ fileName: document.name, url: fileUrl });

   const formatFileSize = (bytes: number | null) => {
      if (!bytes) return t("documents.unknownSize");
      const units = ['B', 'KB', 'MB', 'GB'];
      let size = bytes;
      let unitIndex = 0;
      while (size >= 1024 && unitIndex < units.length - 1) {
         size /= 1024;
         unitIndex++;
      }
      return `${size.toFixed(1)} ${units[unitIndex]}`;
   };

   const formatDate = (dateString: string | null) => {
      if (!dateString) return null;
      return new Date(dateString).toLocaleDateString("en-GB", {
         day: "2-digit",
         month: "short",
         year: "numeric",
      });
   };

   const handleDeleteDocument = async () => {
      if (!employeeId) return;

      try {
         if (document.source === "supplementary" && document.documentId) {
            await deleteDocumentMutation.mutateAsync({
               employeeId,
               documentId: document.documentId,
            });
         } else if (document.source === "permit" && document.permit) {
            await updateResidencyMutation.mutateAsync({
               permitId: document.permit.permit_id,
               employeeId,
               payload: {
                  permit_number: document.permit.permit_number || "",
                  permit_type: document.permit.permit_type,
                  issue_date: document.permit.issue_date || "",
                  expiration_date: document.permit.expiration_date || "",
                  country: document.permit.country,
                  status: document.permit.status || "Active",
                  document_file_id: null,
               },
            });
         }

         toast.success("Document deleted successfully");
         setIsFinalDeleteConfirmOpen(false);
      } catch (err) {
         console.error("Failed to delete residency document", err);
         toast.error("Failed to delete document");
      }
   };

   const dropdownItems = [
      {
         id: "preview",
         label: "Preview",
         icon: Eye,
         onClick: () => onView({ url: document.url, name: document.name }),
      },
      ...(canDelete
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
      <div className='bg-background border border-border r-rounded overflow-hidden hover:shadow-subtle transition-shadow xl:rounded-2xl'>
         {/* Preview Thumbnail */}
         <div className='w-full h-40 sm:h-48 xl:h-48 bg-bg-weak border-b border-border flex items-center justify-center p-3 xl:p-4'>
            <div className='w-full h-full bg-background rounded-lg border border-border flex items-center justify-center'>
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
         <div className='flex flex-col r-gap-sm r-p-sm xl:p-4 xl:gap-3'>
            {/* Title */}
            <h3 className='text-sm font-medium text-text-strong line-clamp-2'>
               {document.name}
            </h3>

            {/* File Details */}
            <div className='flex flex-col gap-1'>
               <p className='text-xs text-text-sub'>
                  {document.name.split('.').pop()?.toUpperCase() || 'FILE'} · {formatFileSize(document.size)}
               </p>
               {document.issueDate && (
                  <p className='text-xs text-text-sub'>
                     {formatDate(document.issueDate)}
                  </p>
               )}
            </div>

            {/* Action Buttons */}
            <div className='flex flex-wrap items-center r-gap-sm xl:gap-2'>
               <button
                  onClick={() => onDownload({ url: document.url, name: document.name })}
                  className='r-btn-full flex items-center justify-center gap-2 bg-text-strong text-text-main rounded-lg hover:bg-text-strong/90 transition-colors text-sm font-medium px-3 py-2 xl:px-3 xl:py-2'
               >
                  <DownloadBracket className='size-4 fill-current' />
                  <span>{t("documents.download")}</span>
               </button>
               <button
                  ref={moreButtonRef}
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className='p-2 bg-background border border-border rounded-lg hover:bg-bg-weak transition-colors'
                  aria-label={t("documents.moreOptions")}
               >
                  <MoreVertical className='size-5 fill-text-sub' />
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

         <ConfirmModal
            isOpen={isDeleteConfirmOpen}
            onClose={() => setIsDeleteConfirmOpen(false)}
            onConfirm={() => {
               setIsDeleteConfirmOpen(false);
               setIsFinalDeleteConfirmOpen(true);
            }}
            title="Delete document?"
            description="This action will remove this residency attachment."
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
            isLoading={
               deleteDocumentMutation.isPending || updateResidencyMutation.isPending
            }
         />
      </div>
   );
}

export default ResidencyTab;
