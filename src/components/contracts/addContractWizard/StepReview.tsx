/** @format */

import { useTranslation } from "@/hooks/useTranslation";
import { useState } from "react";
import { type ContractFormData } from "./types";
import PenToSquare from "@/Icons/pen-to-square";
import PdfFile from "@/Icons/pdf-file";
import { isImageFile } from "@/utils/file";
import { buildStorageUrl } from "@/utils/storageUrl";

type StepReviewProps = {
   formData: ContractFormData;
   onNavigateToStep: (step: number) => void;
   availableMembers: Array<{ id: string; label: string; subLabel?: string }>;
   availableContractTypes: Array<{ id: string; label: string }>;
   availableSalaryCycles?: Array<{ id: string; label: string }>;
   availableAssets?: Array<{ id: string; label: string; avatar?: string }>;
};

const buildAttachmentUrl = (file: { fileUrl?: string; key?: string }) => {
   if (file.fileUrl) return file.fileUrl;
   if (file.key) {
      return buildStorageUrl(file.key);
   }
   return null;
};

function AttachmentPreview({
   fileName,
   url,
}: {
   fileName?: string | null;
   url?: string | null;
}) {
   const [isImagePreviewError, setIsImagePreviewError] = useState(false);
   const canShowImagePreview =
      Boolean(url) && isImageFile({ fileName, url });

   if (canShowImagePreview && !isImagePreviewError && url) {
      return (
         <img
            src={url}
            alt={fileName || "Document preview"}
            className="w-6 h-6 rounded object-cover"
            loading="lazy"
            onError={() => setIsImagePreviewError(true)}
         />
      );
   }

   return <PdfFile size={24} />;
}

function StepReview({
   formData,
   onNavigateToStep,
   availableMembers,
   availableContractTypes,
   availableSalaryCycles = [],
   availableAssets = [],
}: StepReviewProps) {
   const { t } = useTranslation("common");

   const selectedMember = availableMembers.find(
      (m) => m.id === formData.memberId
   );
   const selectedContractType = availableContractTypes.find(
      (ct) => ct.id === formData.contractType
   );
   const selectedSalaryCycle = availableSalaryCycles.find(
      (sc) => sc.id === formData.salaryCycle
   );
   const selectedAssetsList = (formData.assets || [])
      .map((assetId) => availableAssets.find((a) => a.id === assetId))
      .filter(Boolean);

   const InfoField = ({
      label,
      value,
   }: {
      label: string;
      value: string | undefined;
   }) => (
      <div className="flex flex-col gap-2">
         <p className="text-sm text-text-sub">{label}</p>
         <p className="text-base text-text-strong">{value || "Not provided"}</p>
      </div>
   );

   const formatDate = (value?: string) => {
      if (!value) return undefined;
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) {
         return value;
      }
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      return `${day} / ${month} / ${year}`;
   };

   return (
      <div className="w-full">
         {/* Header */}
         <div className="flex flex-col gap-2 mb-6">
            <h2 className="text-lg font-medium text-text-strong tracking-tight">
               {t("contracts.review.title")}
            </h2>
            <p className="text-sm text-text-sub tracking-tight">
               {t("contracts.review.description")}
            </p>
         </div>

         <div className="h-px bg-border mb-6" />

         {/* Content Sections */}
         <div className="flex flex-col gap-6">
            {/* Assign Member Section */}
            <div className="bg-background border border-border rounded-2xl p-4 sm:p-6">
               <div className="flex flex-col gap-6">
                  {/* Header with Edit button */}
                  <div className="flex items-center justify-between">
                     <h3 className="text-base sm:text-lg font-medium text-text-strong">
                        {t("contracts.review.assignMemberSection")}
                     </h3>
                     <button
                        onClick={() => onNavigateToStep(1)}
                        className="inline-flex items-center gap-1 px-2 py-1.5 bg-background border border-border rounded-lg hover:bg-bg-weak transition-colors">
                        <PenToSquare size={20} active={false} />
                        <span className="text-sm font-medium text-text-sub">
                           {t("actions.edit")}
                        </span>
                     </button>
                  </div>

                  {/* Info Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                     <InfoField
                        label={t("contracts.contractName")}
                        value={formData.contractName}
                     />
                     <InfoField
                        label={t("contracts.assignMember.member")}
                        value={selectedMember?.label}
                     />
                     <InfoField
                        label={t("contracts.assignMember.contractType")}
                        value={selectedContractType?.label}
                     />
                     <InfoField
                        label={t("contracts.assignMember.startDate")}
                        value={formatDate(formData.startDate)}
                     />
                     <InfoField
                        label={t("contracts.assignMember.endDate")}
                        value={formatDate(formData.endDate)}
                     />
                  </div>

                  {/* Attached Documents */}
                  {formData.attachedDocuments &&
                     formData.attachedDocuments.length > 0 && (
                        <div className="flex flex-col gap-2">
                           <p className="text-sm text-text-sub">
                              {t("contracts.assignMember.attachDocuments")}
                           </p>
                           <div className="flex flex-col gap-2">
                              {formData.attachedDocuments.map((file, index) => {
                                 const fileUrl = buildAttachmentUrl(file);
                                 return (
                                    <button
                                       key={index}
                                       type="button"
                                       onClick={() => {
                                          if (fileUrl) {
                                             window.open(fileUrl, "_blank");
                                          }
                                       }}
                                       className="flex items-center gap-2 px-3 py-2 rounded-lg bg-bg-weak border border-border hover:bg-bg-soft transition-colors w-full text-left cursor-pointer">
                                       <AttachmentPreview
                                          fileName={file.fileName}
                                          url={fileUrl}
                                       />
                                       <span className="text-sm text-text-strong underline underline-offset-4 decoration-text-sub/30 hover:decoration-text-strong transition-all">
                                          {file.fileName || "Document"}
                                       </span>
                                    </button>
                                 );
                              })}
                           </div>
                        </div>
                     )}
               </div>
            </div>

            {/* Compensation & Assets Section */}
            <div className="bg-background border border-border rounded-2xl p-4 sm:p-6">
               <div className="flex flex-col gap-6">
                  <div className="flex items-center justify-between">
                     <h3 className="text-base sm:text-lg font-medium text-text-strong">
                        {t("contracts.compensation.title")} &{" "}
                        {t("contracts.assets.title")}
                     </h3>
                     <button
                        onClick={() => onNavigateToStep(2)}
                        className="inline-flex items-center gap-1 px-2 py-1.5 bg-background border border-border rounded-lg hover:bg-bg-weak transition-colors">
                        <PenToSquare size={20} active={false} />
                        <span className="text-sm font-medium text-text-sub">
                           {t("actions.edit")}
                        </span>
                     </button>
                  </div>

                  {/* Info Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                     <InfoField
                        label={t("contracts.compensation.baseSalary")}
                        value={
                           formData.baseSalary
                              ? `${formData.salaryCurrency || "AED"} ${
                                   formData.baseSalary
                                }`
                              : undefined
                        }
                     />
                     <InfoField
                        label={t("contracts.compensation.salaryCycle")}
                        value={selectedSalaryCycle?.label}
                     />
                     <InfoField
                        label={t("contracts.compensation.overtimeRate")}
                        value={
                           formData.overtimeRate
                              ? `${formData.overtimeCurrency || "AED"} ${
                                   formData.overtimeRate
                                }/hr`
                              : undefined
                        }
                     />
                  </div>

                  {/* Assets */}
                  {selectedAssetsList.length > 0 && (
                     <div className="flex flex-col gap-2">
                        <p className="text-sm text-text-sub">
                           {t("contracts.assets.title")}
                        </p>
                        <div className="flex flex-wrap gap-2">
                           {selectedAssetsList.map((asset, index) => (
                              <div
                                 key={index}
                                 className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-bg-weak border border-border">
                                 {asset?.avatar && (
                                    <img
                                       src={asset.avatar}
                                       alt={asset.label}
                                       className="w-5 h-5 object-contain"
                                    />
                                 )}
                                 <span className="text-sm text-text-strong">
                                    {asset?.label}
                                 </span>
                              </div>
                           ))}
                        </div>
                     </div>
                  )}
               </div>
            </div>

            {/* Policy & Limits Section */}
            <div className="bg-background border border-border rounded-2xl p-4 sm:p-6">
               <div className="flex flex-col gap-6">
                  <div className="flex items-center justify-between">
                     <h3 className="text-base sm:text-lg font-medium text-text-strong">
                        {t("contracts.policyLimits.title")}
                     </h3>
                     <button
                        onClick={() => onNavigateToStep(3)}
                        className="inline-flex items-center gap-1 px-2 py-1.5 bg-background border border-border rounded-lg hover:bg-bg-weak transition-colors">
                        <PenToSquare size={20} active={false} />
                        <span className="text-sm font-medium text-text-sub">
                           {t("actions.edit")}
                        </span>
                     </button>
                  </div>

                  {/* Info Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                     <InfoField
                        label={t("contracts.policyLimits.noticePeriod")}
                        value={
                           formData.noticePeriod
                              ? `${formData.noticePeriod} Days`
                              : undefined
                        }
                     />
                     <InfoField
                        label={t("contracts.policyLimits.sickLeave")}
                        value={
                           formData.sickLeave
                              ? `${formData.sickLeave} Days`
                              : undefined
                        }
                     />
                     <InfoField
                        label={t("contracts.policyLimits.casualLeave")}
                        value={
                           formData.casualLeave
                              ? `${formData.casualLeave} Days`
                              : undefined
                        }
                     />
                     <InfoField
                        label={t("contracts.policyLimits.annualLeave")}
                        value={
                           formData.annualLeave
                              ? `${formData.annualLeave} Days`
                              : undefined
                        }
                     />
                     <InfoField
                        label={t("contracts.policyLimits.absenceLimit")}
                        value={
                           formData.absenceLimit
                              ? `${formData.absenceLimit} Days`
                              : undefined
                        }
                     />
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
}

export default StepReview;
