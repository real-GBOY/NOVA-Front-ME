/** @format */

import { useState } from "react";
import { type MemberFormData } from "@/utilities/schemas/memberSchema";
import PenToSquare from "@/Icons/pen-to-square";
import ArrowUpRightFromSquare from "@/Icons/arrow-up-right-from-square";
import { PdfFile } from "@/Icons";
import { useTranslation } from "@/hooks/useTranslation";
import { isImageFile } from "@/utils/file";

const formatDateValue = (value?: string | Date) => {
   if (!value) return undefined;
   const date = value instanceof Date ? value : new Date(value);
   if (Number.isNaN(date.getTime())) {
      return typeof value === "string" ? value : undefined;
   }
   const day = String(date.getDate()).padStart(2, "0");
   const month = String(date.getMonth() + 1).padStart(2, "0");
   const year = date.getFullYear();
   return `${day} / ${month} / ${year}`;
};

const formatEmploymentType = (value?: string) => {
   if (!value) return undefined;
   const normalized = value.replace(/[_-]+/g, " ").trim();
   if (!normalized) return undefined;
   return normalized
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
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

   return <PdfFile />;
}

type StepReviewProps = {
   formData: MemberFormData;
   onNavigateToStep: (step: number) => void;
   availableJobTitles?: { id: string; title: string }[];
   availableTeams?: { id: string; name: string }[];
   availableRoles?: { id: string; title: string }[];
   availableManagers?: { id: string; name: string; avatar?: string }[];
   showResidency?: boolean;
};

function StepReview({
   formData,
   onNavigateToStep,
   availableJobTitles = [],
   availableTeams = [],
   availableRoles = [],
   availableManagers = [],
   showResidency = true,
}: StepReviewProps) {
   const { t } = useTranslation("common");
   const selectedJobTitle = availableJobTitles.find(
      (jt) => jt.id === formData.jobTitle
   );
   const selectedTeams = (formData.team_ids || [])
      .map((id) => availableTeams.find((t) => t.id === id))
      .filter((t): t is { id: string; name: string } => !!t);
   const selectedRole = availableRoles.find((r) => r.id === formData.role);
   const selectedManager = availableManagers.find(
      (m) => m.id === formData.manager
   );

   // Get member full name
   const memberName = `${formData.firstName || ""} ${
      formData.lastName || ""
   }`.trim();

   // Get profile image URL if available
   const profileImageUrl =
      typeof formData.profileImage === "object" &&
      formData.profileImage !== null
         ? (formData.profileImage as { fileUrl?: string }).fileUrl
         : undefined;

   const InfoField = ({
      label,
      value,
   }: {
      label: string;
      value: string | undefined;
   }) => (
      <div className="flex flex-col gap-2">
         <p className="text-sm text-text-sub">{label}</p>
         <p className="text-base text-text-strong">
            {value || t("members.review.notProvided")}
         </p>
      </div>
   );

   const MemberTag = ({ name, avatar }: { name: string; avatar?: string }) => (
      <div className="inline-flex items-center gap-1 px-2 py-1 bg-background border border-border rounded-lg w-fit">
         <div
            className={`w-3.5 h-3.5 rounded-full overflow-hidden ${
               !avatar ? "bg-yellow-200" : ""
            }`}>
            {avatar ? (
               <img
                  src={avatar}
                  alt={name}
                  className="w-full h-full object-cover"
               />
            ) : (
               <div className="w-full h-full bg-gradient-to-br from-yellow-200 to-yellow-300" />
            )}
         </div>
         <span className="text-xs font-medium text-text-sub">{name}</span>
      </div>
   );

   return (
      <div className="w-full">
         {/* Header */}
         <div className="flex flex-col gap-2 mb-6">
            <h2 className="text-lg font-medium text-text-strong">
               {t("members.review.title")}
            </h2>
            <p className="text-sm text-text-sub">
               {t("members.review.title")}
            </p>
         </div>

         <div className="h-px bg-border mb-6" />

         {/* Content - Two sections */}
         <div className="flex flex-col gap-6">
            {/* Basic Information Section */}
            <div className="bg-background border border-border rounded-2xl p-4">
               <div className="flex flex-col gap-6">
                  {/* Header with Edit button */}
                  <div className="flex items-center justify-between">
                     <h3 className="text-lg font-medium text-text-strong">
                        {t("members.review.basicInfoSection")}
                     </h3>
                     <button
                        onClick={() => onNavigateToStep(1)}
                        className="inline-flex items-center gap-0.5 px-1.5 py-1.5 bg-background border border-border rounded-lg hover:bg-bg-weak transition-colors">
                        <PenToSquare size={20} active={false} />
                        <span className="text-sm font-medium text-text-sub px-1">
                           {t("members.wizard.buttons.edit")}
                        </span>
                     </button>
                  </div>

                  {/* Member Name with Tag */}
                  <div className="flex flex-col gap-2">
                     <p className="text-sm text-text-sub">
                        {t("members.review.labels.memberName")}
                     </p>
                     <MemberTag
                        name={
                           memberName ||
                           t("members.review.notProvided")
                        }
                        avatar={profileImageUrl}
                     />
                  </div>

                  <InfoField
                     label={t("members.review.labels.emailAddress")}
                     value={formData.email}
                  />
                  <InfoField
                     label={t("members.review.labels.phoneNumber")}
                     value={formData.phoneNumber}
                  />
                  <InfoField
                     label={t("members.review.labels.country")}
                     value={formData.country}
                  />
                  <InfoField
                     label={t("members.review.labels.dateOfBirth")}
                     value={formatDateValue(formData.dateOfBirth)}
                  />
                  <InfoField
                     label={t("members.review.labels.gender")}
                     value={formData.gender}
                  />
                  <InfoField
                     label={t("members.review.labels.maritalStatus")}
                     value={formData.maritalStatus}
                  />
                  <InfoField
                     label={t("members.review.labels.nationalId")}
                     value={formData.nationalId}
                  />
                  <InfoField
                     label={t("members.review.labels.address")}
                     value={formData.address}
                  />

                  {/* Attached Documents */}
                  <div className="flex flex-col gap-2">
                     <p className="text-sm text-text-sub">
                        {t("members.review.labels.attachedDocuments")}
                     </p>
                     {formData.documents && formData.documents.length > 0 ? (
                        <div className="flex flex-col gap-2">
                           {formData.documents.map((doc, index) => (
                              <div
                                 key={index}
                                 className="flex items-center gap-3 p-2 bg-background border border-border rounded-lg w-fit">
                                 {/* PDF Icon */}
                                 <AttachmentPreview
                                    fileName={doc.fileName}
                                    url={doc.fileUrl}
                                 />

                                 {/* File Name */}
                                 <span className="flex-1 text-sm font-medium text-text-strong truncate max-w-[250px]">
                                    {doc.fileName ||
                                       `Document ${index + 1}`}
                                 </span>

                                 {/* Action Buttons */}
                                 <button
                                    onClick={() =>
                                       window.open(doc.fileUrl, "_blank")
                                    }
                                    className="p-0.5 hover:bg-bg-weak rounded transition-colors">
                                    <ArrowUpRightFromSquare
                                       size={20}
                                       active={true}
                                    />
                                 </button>
                                 {/* <button className="p-0.5 hover:bg-bg-weak rounded transition-colors">
                            <DownloadBracket size={17} active={false} />
                         </button> */}
                              </div>
                           ))}
                        </div>
                     ) : (
                        <p className="text-base text-text-strong">
                           {t("members.review.noDocuments")}
                        </p>
                     )}
                  </div>
               </div>
            </div>

            {/* Work Information Section */}
            <div className="bg-background border border-border rounded-2xl p-4">
               <div className="flex flex-col gap-6">
                  {/* Header with Edit button */}
                  <div className="flex items-center justify-between">
                     <h3 className="text-lg font-medium text-text-strong">
                        {t("members.review.workInfoSection")}
                     </h3>
                     <button
                        onClick={() => onNavigateToStep(2)}
                        className="inline-flex items-center gap-0.5 px-1.5 py-1.5 bg-background border border-border rounded-lg hover:bg-bg-weak transition-colors">
                        <PenToSquare size={20} active={false} />
                        <span className="text-sm font-medium text-text-sub px-1">
                           {t("members.wizard.buttons.edit")}
                        </span>
                     </button>
                  </div>

                  <InfoField
                     label={t("members.review.labels.jobTitle")}
                     value={selectedJobTitle?.title}
                  />
                  <InfoField
                     label={t("members.review.labels.teams")}
                     value={
                        selectedTeams.length > 0
                           ? selectedTeams.map((t) => t.name).join(", ")
                           : undefined
                     }
                  />
                  <InfoField
                     label={t("members.review.labels.role")}
                     value={selectedRole?.title}
                  />

                  {/* Manager with Tag */}
                  <div className="flex flex-col gap-2">
                     <p className="text-sm text-text-sub">
                        {t("members.review.labels.manager")}
                     </p>
                     {selectedManager ? (
                        <MemberTag
                           name={selectedManager.name}
                           avatar={selectedManager.avatar}
                        />
                     ) : (
                        <p className="text-base text-text-strong">
                           {t("members.review.notProvided")}
                        </p>
                     )}
                  </div>

                  <InfoField
                     label={t("members.review.labels.employmentType")}
                     value={formatEmploymentType(formData.employmentType)}
                  />
                  <InfoField
                     label={t("members.review.labels.startDate")}
                     value={formatDateValue(formData.startDate)}
                  />
                  <InfoField
                     label={t("members.review.labels.workSchedule")}
                     value={formData.hoursPerWeek}
                  />
                  <InfoField
                     label={t("members.review.labels.memberId")}
                     value="#EM3321"
                  />
               </div>
            </div>

            {showResidency && (
               <div className="bg-background border border-border rounded-2xl p-4">
                  <div className="flex flex-col gap-6">
                     {/* Header with Edit button */}
                     <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium text-text-strong">
                           {t("members.review.residencySection")}
                        </h3>
                        <button
                           onClick={() => onNavigateToStep(3)}
                           className="inline-flex items-center gap-0.5 px-1.5 py-1.5 bg-background border border-border rounded-lg hover:bg-bg-weak transition-colors">
                           <PenToSquare size={20} active={false} />
                           <span className="text-sm font-medium text-text-sub px-1">
                              {t("members.wizard.buttons.edit")}
                           </span>
                        </button>
                     </div>

                     <InfoField
                        label={t("members.review.labels.residencyStatus")}
                        value={formData.residencyStatus}
                     />
                     <InfoField
                        label={t("members.review.labels.countryOfResidency")}
                        value={formData.residencyCountry}
                     />
                     <InfoField
                        label={t("members.review.labels.residencyVisaType")}
                        value={formData.residencyType}
                     />
                     <InfoField
                        label={t("members.review.labels.residencyVisaNumber")}
                        value={formData.residencyNumber}
                     />
                     <InfoField
                        label={t("members.review.labels.issueDate")}
                        value={formatDateValue(formData.residencyIssueDate)}
                     />
                     <InfoField
                        label={t("members.review.labels.expiryDate")}
                        value={formatDateValue(formData.residencyExpiryDate)}
                     />

                     {/* Residency Document */}
                     <div className="flex flex-col gap-2">
                        <p className="text-sm text-text-sub">
                           {t("members.review.labels.emiratesIdDocument")}
                        </p>
                        {formData.residencyDocument &&
                        Array.isArray(formData.residencyDocument) &&
                        formData.residencyDocument.length > 0 ? (
                           <div className="flex flex-col gap-2">
                              {formData.residencyDocument.map((doc, index) => (
                                 <div
                                    key={index}
                                    className="flex items-center gap-3 p-2 bg-background border border-border rounded-lg w-fit">
                                    {/* PDF Icon */}
                                    <AttachmentPreview
                                       fileName={doc.fileName}
                                       url={doc.fileUrl}
                                    />

                                    {/* File Name */}
                                    <span className="flex-1 text-sm font-medium text-text-strong truncate max-w-[250px]">
                                       {doc.fileName ||
                                          `Residency Document ${index + 1}`}
                                    </span>

                                    {/* Action Buttons */}
                                    <button
                                       onClick={() =>
                                          window.open(doc.fileUrl, "_blank")
                                       }
                                       className="p-0.5 hover:bg-bg-weak rounded transition-colors">
                                       <ArrowUpRightFromSquare
                                          size={20}
                                          active={true}
                                       />
                                    </button>
                                 </div>
                              ))}
                           </div>
                        ) : (
                           <p className="text-base text-text-strong">
                              {t("members.review.notProvided")}
                           </p>
                        )}
                     </div>
                  </div>
               </div>
            )}
         </div>
      </div>
   );
}

export default StepReview;
