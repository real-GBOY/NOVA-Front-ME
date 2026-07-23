/** @format */

import { useState } from "react";
import { useParams } from "react-router-dom";
import InfoCard from "@/designSystem/InfoCard";
import IconButton from "@/designSystem/IconButton";
import Button from "@/designSystem/Button";
import DirhamLabel from "@/designSystem/DirhamLabel";
import LoadingState from "@/designSystem/LoadingState";
import { usePdfPreview } from "@/context/PdfPreviewContext";
import { isImageFile, isPdfFile, downloadFile } from "@/utils/file";
import {
   ClipboardClock,
   ClipboardXmark,
   Briefcase,
   IdCardClipText,
   HourglassHalf,
   ArrowUpRightFromSquare,
   DownloadBracket,
   PdfFile,
   PenToSquare,
   Plus,
} from "@/Icons";
import { AxiosError } from "axios";
import type { EmployeeDetails, EmployeeContract } from "@/services/employeeService";
import type { ContractResponse } from "@/services/contractService";
import { useTranslation } from "@/hooks/useTranslation";
import { useGetEmployeeContract } from "@/hooks/employees/useEmployee";
import { useContracts } from "@/hooks/contracts/useContracts";
import { useMemo } from "react";
import ExtendContractModal from "./ExtendContractModal";
import TerminateContractModal from "@/components/contracts/TerminateContractModal";
import DetailSectionsGrid from "../../DetailSectionsGrid";
import { DetailSectionData } from "../../types";
import { usePermissions } from "@/contexts/PermissionContext";
import NoPermissionMessage from "@/components/common/NoPermissionMessage";
import { formatPermissionName } from "@/utilities/permissionFormatters";
import EditWorkInfoForm from "../modals/EditWorkInfoForm";
import EditCompensationForm from "../modals/EditCompensationForm";
import EditContactForm from "../modals/EditContactForm";
import EditContractClausesForm from "../modals/EditContractClausesForm";
import UploadContractFilesModal from "../modals/UploadContractFilesModal";

function AttachmentPreview({
   fileName,
   url,
}: {
   fileName?: string | null;
   url?: string | null;
}) {
   const [isImagePreviewError, setIsImagePreviewError] = useState(false);
   const canShowImagePreview = Boolean(url) && isImageFile({ fileName, url });

   if (canShowImagePreview && !isImagePreviewError && url) {
      return (
         <img
            src={url}
            alt={fileName || "Document preview"}
            className="w-9 h-9 rounded-md object-cover"
            loading="lazy"
            onError={() => setIsImagePreviewError(true)}
         />
      );
   }

   return <PdfFile size={36} />;
}

interface ContractTabProps {
   hasContract?: boolean;
   workInfoSection?: DetailSectionData;
   contractInfo?: EmployeeDetails["contract"] | null;
   canEdit?: boolean;
   employeeData?: EmployeeDetails | null;
   availableJobTitles?: Array<{ id: string; title: string }>;
   availableTeams?: Array<{ id: string; name: string }>;
   availableRoles?: Array<{ id: string; title: string }>;
   availableManagers?: Array<{ id: string; name: string; avatar?: string }>;
}

function ContractTab({
   hasContract,
   workInfoSection,
   contractInfo,
   canEdit = false,
   employeeData,
   availableJobTitles = [],
   availableTeams = [],
   availableRoles = [],
   availableManagers = [],
}: ContractTabProps) {
   const { t } = useTranslation(["members", "common"]);
   const notProvidedLabel = t("fields.notProvided");
   const { id } = useParams<{ id: string }>();
   const { openPreview } = usePdfPreview();
   const [isExtendModalOpen, setIsExtendModalOpen] = useState(false);
   const [activeEditModal, setActiveEditModal] = useState<string | null>(null);
   const [isEditClausesOpen, setIsEditClausesOpen] = useState(false);
   const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

   // Permission checks
   const { can } = usePermissions();
   const canViewContractTab =
      can("read_employee_contract") || can("manage_contracts");
   const canExtendContract = can("update_contract") || can("manage_contracts");
   const canEditClauses = can("update_contract") || can("manage_contracts");
   const canTerminateContract =
      can("terminate_contract") || can("manage_contracts");
   const canViewAttachments =
      can("read_employee_contract") ||
      can("attach_contract_file") ||
      can("manage_contracts");
   const canAddAttachments =
      can("attach_contract_file") || can("manage_contracts");
   const handleViewAttachment = (url: string, fileName?: string | null) => {
      if (!url) return;
      const isPdf = isPdfFile({ fileName, url });

      if (isPdf) {
         openPreview({ url, fileName });
      } else if (typeof window !== "undefined") {
         window.open(url, "_blank", "noopener,noreferrer");
      }
   };

   const handleDownloadAttachment = (url: string, fileName?: string | null) => {
      if (!url) return;
      downloadFile({ url, fileName });
   };

   const handleEditSection = (sectionId: string) => {
      setActiveEditModal(sectionId);
   };

   const handleCloseModal = () => {
      setActiveEditModal(null);
   };

   // Check for other active contracts - Must be called before conditional returns
   const { useList, useTerminate } = useContracts();
   const { data: allContractsResponse } = useList(undefined, {
      enabled: canViewContractTab,
   });
   const terminateMutation = useTerminate();
   const [isTerminateModalOpen, setIsTerminateModalOpen] = useState(false);

   const hasActiveContract = useMemo(() => {
      if (!allContractsResponse?.data || !id) return false;

      return allContractsResponse.data.some((contract) => {
         if (contract.core.employee_id.toString() !== id) return false;

         const startDate = new Date(contract.core.start_date);
         const endDate = contract.core.end_date
            ? new Date(contract.core.end_date)
            : new Date(startDate.getTime() + 365 * 24 * 60 * 60 * 1000);
         const now = new Date();

         const isTerminated =
            contract.status?.toLowerCase() === "terminated" ||
            contract.status?.toLowerCase() === "ended" ||
            contract.custom_fields?.termination;

         const isExpired = now > endDate;

         return !isTerminated && !isExpired;
      });
   }, [allContractsResponse, id]);

   // Fetch contract data
   const shouldFetchContract =
      !!id && hasContract !== false && canViewContractTab;

   const {
      data: contractData,
      isLoading,
      error,
   } = useGetEmployeeContract(id || "", {
      enabled: shouldFetchContract,
   });

   const axiosError = error instanceof AxiosError ? error : null;
   const isNotFoundError = axiosError?.response?.status === 404;
   const contractErrorMessage = isNotFoundError
      ? axiosError?.response?.data?.message ||
        t("profile.contract.noContractFound")
      : t("error");

   if (!canViewContractTab) {
      return (
         <div className="flex items-center justify-center py-12">
            <NoPermissionMessage
               message={t(
                  "permissions.noReadAccess.title",
                  "Access Restricted"
               )}
               description={`${t(
                  "permissions.noReadAccess.message",
                  "You don't have permission to view contracts."
               )} (Missing: ${formatPermissionName("read_employee_contract")})`}
            />
         </div>
      );
   }

   // Show loading state
   if (isLoading) {
      return (
         <div className="flex items-center justify-center py-12">
            <LoadingState size="medium" label={t("loading.contracts")} />
         </div>
      );
   }

   // Show error state
   if (error || !contractData) {
      return (
         <div className="flex items-center justify-center py-12">
            <p className="text-danger">
               {axiosError
                  ? contractErrorMessage
                  : t("profile.contract.noContractFound")}
            </p>
         </div>
      );
   }

   // Helper functions to handle both EmployeeContract and ContractResponse types
   const isContractResponse = (contract: EmployeeContract | ContractResponse): contract is ContractResponse => {
      return 'id' in contract && 'status' in contract && !('contract_id' in contract);
   };

   const getContractId = (contract: EmployeeContract | ContractResponse): number => {
      return isContractResponse(contract) ? contract.id : contract.contract_id;
   };

   const getContractStatus = (contract: EmployeeContract | ContractResponse): string => {
      if (isContractResponse(contract)) {
         return contract.status || "Active";
      }
      return contract.duration?.status || "Active";
   };

   const getProgressPercentage = (contract: EmployeeContract | ContractResponse): number => {
      if (isContractResponse(contract)) {
         if (contract.core?.start_date && contract.core?.end_date) {
            const startDate = new Date(contract.core.start_date);
            const endDate = new Date(contract.core.end_date);
            const now = new Date();
            const totalDuration = endDate.getTime() - startDate.getTime();
            const elapsed = now.getTime() - startDate.getTime();
            return Math.max(0, Math.min(100, (elapsed / totalDuration) * 100));
         }
         return 0;
      }
      return contract.duration?.progress_percentage || 0;
   };

   const getStartDate = (contract: EmployeeContract | ContractResponse): string | undefined => {
      if (isContractResponse(contract)) {
         return contract.core?.start_date;
      }
      return contract.duration?.start_date;
   };

   const getEndDate = (contract: EmployeeContract | ContractResponse): string | undefined => {
      if (isContractResponse(contract)) {
         return contract.core?.end_date || undefined;
      }
      return contract.duration?.end_date;
   };

   const getDaysRemaining = (contract: EmployeeContract | ContractResponse): number | undefined => {
      if (isContractResponse(contract)) {
         if (contract.core?.start_date && contract.core?.end_date) {
            const endDate = new Date(contract.core.end_date);
            const now = new Date();
            const diffTime = endDate.getTime() - now.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays > 0 ? diffDays : 0;
         }
         return undefined;
      }
      return contract.duration?.days_remaining;
   };

   const getSalary = (contract: EmployeeContract | ContractResponse): number | undefined => {
      if (isContractResponse(contract)) {
         return contract.compensation?.salary;
      }
      return contract.compensation?.salary;
   };

   const getContractType = (contract: EmployeeContract | ContractResponse): string | undefined => {
      if (isContractResponse(contract)) {
         return contract.core?.contract_type;
      }
      return contract.compensation?.contract_type;
   };

   const getNoticePeriodDays = (contract: EmployeeContract | ContractResponse): number | undefined => {
      if (isContractResponse(contract)) {
         return contract.vacations?.notice_period_days;
      }
      return contract.clauses?.notice_period_days;
   };

   const getCasualLeaveDays = (contract: EmployeeContract | ContractResponse): number | undefined => {
      if (isContractResponse(contract)) {
         // First check direct property
         if (contract.vacations?.casual_leave_days !== undefined) {
            return contract.vacations.casual_leave_days;
         }
         // Then check types array
         const casualType = contract.vacations?.types?.find(
            (type) => type.type_name?.toLowerCase() === "casual"
         );
         return casualType?.allocated_days;
      }
      return contract.clauses?.casual_leave_days ? Number(contract.clauses.casual_leave_days) : undefined;
   };

   const getSickLeaveDays = (contract: EmployeeContract | ContractResponse): number | undefined => {
      if (isContractResponse(contract)) {
         // First check direct property
         if (contract.vacations?.sick_leave_days !== undefined) {
            return contract.vacations.sick_leave_days;
         }
         // Then check types array
         const sickType = contract.vacations?.types?.find(
            (type) => type.type_name?.toLowerCase() === "sick"
         );
         return sickType?.allocated_days;
      }
      return contract.clauses?.sick_leave_days ? Number(contract.clauses.sick_leave_days) : undefined;
   };

   const getAnnualLeaveDays = (contract: EmployeeContract | ContractResponse): number | undefined => {
      if (isContractResponse(contract)) {
         // First check direct property
         if (contract.vacations?.annual_leave_days !== undefined) {
            return contract.vacations.annual_leave_days;
         }
         // Then check types array
         const annualType = contract.vacations?.types?.find(
            (type) => type.type_name?.toLowerCase() === "annual"
         );
         return annualType?.allocated_days;
      }
      return contract.clauses?.annual_leave_days ? Number(contract.clauses.annual_leave_days) : undefined;
   };

   const getAbsenceLimitDays = (contract: EmployeeContract | ContractResponse): number | undefined => {
      if (isContractResponse(contract)) {
         return contract.vacations?.absence_limit_days;
      }
      return contract.clauses?.absence_limit?.days_per_year;
   };

   const getAutoTermination = (contract: EmployeeContract | ContractResponse): boolean => {
      if (isContractResponse(contract)) {
         // Check if auto_termination is in vacations object
         if (contract.vacations?.auto_termination !== undefined) {
            return contract.vacations.auto_termination;
         }
         // Check custom_fields as fallback
         if ((contract.custom_fields as any)?.auto_termination !== undefined) {
            return (contract.custom_fields as any).auto_termination;
         }
         // Default to false if not specified (auto-termination is disabled by default)
         return false;
      }
      // For EmployeeContract, return the value or default to false
      return contract.clauses?.absence_limit?.auto_termination ?? false;
   };

   const getAttachments = (contract: EmployeeContract | ContractResponse) => {
      if (isContractResponse(contract)) {
         return contract.attachments || [];
      }
      return contract.attachments || [];
   };

   const getWorkInformation = (contract: EmployeeContract | ContractResponse) => {
      if (isContractResponse(contract)) {
         // ContractResponse doesn't have work_information, return null
         return null;
      }
      return contract.work_information;
   };

   const getContact = (contract: EmployeeContract | ContractResponse) => {
      if (isContractResponse(contract)) {
         // ContractResponse doesn't have contact, return null
         return null;
      }
      return contract.contact;
   };

   const workDetails =
      getWorkInformation(contractData) ||
      (employeeData
         ? {
              job_title: employeeData.job?.job_title,
              team:
                 employeeData.job?.team_names?.join(", ") ||
                 employeeData.job?.teams?.map((team) => team.name).join(", "),
              manager: employeeData.manager,
              role: employeeData.job?.role?.name,
              permissions: notProvidedLabel,
              member_id: employeeData.job?.role?.member_count
                 ? String(employeeData.job?.role?.member_count)
                 : undefined,
              start_date:
                 contractInfo?.start_date ||
                 employeeData.contract?.start_date ||
                 undefined,
              end_date:
                 contractInfo?.end_date ||
                 employeeData.contract?.end_date ||
                 undefined,
           }
         : null);

   const contactDetails =
      getContact(contractData) ||
      (employeeData?.personal
         ? {
              mobile: employeeData.personal.phone_number,
              email: employeeData.personal.email,
           }
         : null);

   // Calculate progress bar width
   const progressPercentage = Math.max(
      0,
      Math.min(100, getProgressPercentage(contractData))
   );

   // Determine status color
   const getStatusColor = (status: string) => {
      switch (status) {
         case "Active":
            return "bg-success";
         case "Expired":
            return "bg-error";
         case "Terminated":
            return "bg-error";
         case "Upcoming":
            return "bg-warning";
         default:
            return "bg-primary";
      }
   };

   const formatContractTypeLabel = (value?: string | null) => {
      if (!value) return undefined;
      return value
         .split(/[_\s]+/)
         .map((segment) =>
            segment
               ? `${segment[0].toUpperCase()}${segment.slice(1).toLowerCase()}`
               : ""
         )
         .join(" ");
   };

   const formatSalaryCycleLabel = (value?: string | null) => {
      if (!value) return undefined;
      return `${value.charAt(0).toUpperCase()}${value.slice(1).toLowerCase()}`;
   };

   const compensationDetails = {
      salary: contractInfo?.salary ?? getSalary(contractData),
      salaryCycle: contractInfo?.salary_cycle,
      contractType:
         contractInfo?.contract_type ??
         contractInfo?.employment_type ??
         getContractType(contractData),
      contractName: contractInfo?.contract_name,
      overtimeHourlyRate: contractInfo?.overtime_hourly_rate,
      probationPeriod: contractInfo?.probation_period,
   };

   const salaryValue =
      typeof compensationDetails.salary === "number" ? (
         <DirhamLabel value={compensationDetails.salary.toLocaleString()} />
      ) : (
         notProvidedLabel
      );

   const salaryCycleValue =
      formatSalaryCycleLabel(compensationDetails.salaryCycle) ||
      notProvidedLabel;

   const contractTypeValue =
      formatContractTypeLabel(compensationDetails.contractType) ||
      notProvidedLabel;

   const contractNameValue =
      compensationDetails.contractName || notProvidedLabel;

   const overtimeValue =
      typeof compensationDetails.overtimeHourlyRate === "number" ? (
         <DirhamLabel
            value={compensationDetails.overtimeHourlyRate.toLocaleString()}
         />
      ) : (
         notProvidedLabel
      );

   const probationValue =
      typeof compensationDetails.probationPeriod === "number"
         ? `${compensationDetails.probationPeriod} Days`
         : "No Probation";

   const compensationSections: DetailSectionData[] = [
      {
         id: "compensation",
         title: t("profile.details.compensation.title"),
         items: [
            {
               label: t("fields.salary"),
               value: salaryValue,
            },
            {
               label: t("common:contracts.compensation.salaryCycle"),
               value: salaryCycleValue,
            },
            {
               label: t("fields.contractType"),
               value: contractTypeValue,
            },
            {
               label: t("common:contracts.contractName"),
               value: contractNameValue,
            },
            {
               label: t("common:contracts.compensation.overtimeRate"),
               value: overtimeValue,
            },
            {
               label: t("fields.probationPeriod"),
               value: probationValue,
            },
         ],
      },
   ];

   // Find the matching contract from the list (same data source that works in ContractsTable)
   const matchingContract = allContractsResponse?.data?.find(
      (c) => c.id === getContractId(contractData)
   );

   // Check if contract is terminated - using same logic as ContractsContent.tsx
   const contractStatus = getContractStatus(contractData);
   const isTerminated =
      contractStatus === "Terminated" ||
      matchingContract?.status?.toLowerCase() === "terminated" ||
      matchingContract?.status?.toLowerCase() === "ended" ||
      matchingContract?.custom_fields?.termination;

   const isActive = contractStatus === "Active";
   const isExpired = contractStatus === "Expired";

   const canExtend = !isTerminated && !(isExpired && hasActiveContract);

   const handleTerminate = async (reason: string, terminationDate: Date) => {
      try {
         const formattedDate = terminationDate.toISOString().split("T")[0];
         await terminateMutation.mutateAsync({
            id: id || "",
            payload: {
               reason,
               termination_date: formattedDate,
            },
         });
         setIsTerminateModalOpen(false);
         // You might want to refresh data here
      } catch (error) {
         console.error("Failed to terminate contract", error);
      }
   };

   return (
      <div className="w-full">
         <div className="r-grid-form r-gap w-full xl:grid-cols-2 xl:gap-6">
            <div className="flex flex-col r-gap xl:gap-6">
               <div className="border border-border bg-background r-rounded r-p-sm xl:rounded-2xl xl:p-4">
                  <div className="mb-4 flex flex-wrap items-center justify-between r-gap-sm xl:mb-5 xl:gap-3">
                     <div className="flex items-center gap-3 xl:gap-3">
                        <ClipboardClock size={24} />
                        <h3 className="text-lg font-medium leading-6 text-text-strong tracking-tight">
                           {t("profile.contract.duration.title")}
                        </h3>
                     </div>
                     <div className="flex flex-wrap items-center gap-2 xl:gap-2">
                        {isActive && canTerminateContract && (
                           <Button
                              variant="secondary"
                              onClick={() => setIsTerminateModalOpen(true)}>
                              {t("profile.contract.duration.terminate")}
                           </Button>
                        )}
                        {canExtendContract && (
                           <Button
                              variant="secondary"
                              className="bg-bg-dark! border-0! text-white! hover:bg-border! disabled:opacity-50 disabled:cursor-not-allowed"
                              onClick={() => setIsExtendModalOpen(true)}
                              disabled={!canExtend}
                              title={
                                 isTerminated
                                    ? t(
                                         "profile.contract.duration.contractTerminated"
                                      )
                                    : !canExtend
                                    ? "Cannot extend expired contract because user has an active contract"
                                    : undefined
                              }>
                              {t("profile.contract.duration.extendDuration")}
                           </Button>
                        )}
                     </div>
                  </div>
                  <div className="flex flex-col r-gap-sm xl:gap-4">
                     <div className="grid grid-cols-1 r-gap-sm sm:grid-cols-2 xl:grid-cols-2 xl:gap-4">
                        <div className="flex flex-col gap-1 text-sm">
                           <span className="text-text-sub">
                              {t("fields.startDate")}
                           </span>
                           <span className="text-text-strong">
                              {getStartDate(contractData) ? new Date(
                                 getStartDate(contractData)!
                              ).toLocaleDateString("en-GB") : notProvidedLabel}
                           </span>
                        </div>
                        <div className="flex flex-col gap-1 text-sm">
                           <span className="text-text-sub">
                              {t("fields.endDate")}
                           </span>
                           <span className="text-text-strong">
                              {getEndDate(contractData) ? new Date(
                                 getEndDate(contractData)!
                              ).toLocaleDateString("en-GB") : notProvidedLabel}
                           </span>
                        </div>
                     </div>
                     <div className="flex flex-wrap items-center gap-2 xl:gap-3">
                        <div className="relative flex-1 h-2 rounded-full bg-bg-weak overflow-hidden">
                           <div
                              className={`absolute inset-y-0 start-0 rounded-full ${getStatusColor(
                                 isTerminated
                                    ? "Terminated"
                                    : contractStatus
                              )}`}
                              style={{ width: `${progressPercentage}%` }}
                           />
                        </div>
                        <div className="flex items-center gap-1.5 xl:gap-1.5">
                           <HourglassHalf size={16} className="fill-icon-sub" />
                           <span className="text-xs text-text-sub">
                              {isTerminated
                                 ? t("profile.contract.duration.terminated")
                                 : contractStatus === "Expired"
                                 ? t("profile.contract.duration.expired")
                                 : getDaysRemaining(contractData) !== undefined
                                 ? `${getDaysRemaining(contractData)} Days Remaining`
                                 : t("profile.contract.duration.noEndDate")}
                           </span>
                        </div>
                     </div>
                  </div>
               </div>

               <InfoCard
                  title={
                     <div className="flex items-center justify-between w-full">
                        <span>{t("profile.contract.clause.title")}</span>
                        {canEditClauses && (
                           <button
                              type="button"
                              onClick={() => setIsEditClausesOpen(true)}
                              className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-primary hover:text-primary/80 hover:bg-primary/10 rounded-md transition-colors"
                              title={t("common:actions.edit") || "Edit"}>
                              <PenToSquare size={14} className="fill-primary" />
                              <span>{t("common:actions.edit") || "Edit"}</span>
                           </button>
                        )}
                     </div>
                  }
                  icon={<ClipboardXmark size={24} />}>
                  <div className="r-grid-form r-gap text-sm xl:grid-cols-2 xl:gap-6">
                     <div className="space-y-2 xl:space-y-3">
                        <ContractFieldRow
                           label={t("profile.contract.clause.noticePeriod")}
                           value={getNoticePeriodDays(contractData) !== undefined 
                              ? `${Math.floor(getNoticePeriodDays(contractData)!)} Days`
                              : notProvidedLabel}
                        />
                        <ContractFieldRow
                           label={t("profile.contract.clause.casualLeave")}
                           value={getCasualLeaveDays(contractData) !== undefined
                              ? `${Math.floor(getCasualLeaveDays(contractData)!)} Days`
                              : notProvidedLabel}
                        />
                        <ContractFieldRow
                           label={t("profile.contract.clause.absenceLimit")}
                           value={getAbsenceLimitDays(contractData) !== undefined
                              ? t("profile.contract.clause.absenceLimitPerYear", {
                                 days: Math.floor(getAbsenceLimitDays(contractData)!),
                              })
                              : notProvidedLabel}
                        />
                     </div>
                     <div className="space-y-2 xl:space-y-3">
                        <ContractFieldRow
                           label={t("profile.contract.clause.sickLeave")}
                           value={getSickLeaveDays(contractData) !== undefined
                              ? `${Math.floor(getSickLeaveDays(contractData)!)} Days`
                              : notProvidedLabel}
                        />
                        <ContractFieldRow
                           label={t("profile.contract.clause.annualLeave")}
                           value={getAnnualLeaveDays(contractData) !== undefined
                              ? `${Math.floor(getAnnualLeaveDays(contractData)!)} Days`
                              : notProvidedLabel}
                        />
                        <ContractFieldRow
                           label={t("profile.contract.clause.autoTermination")}
                           value={getAutoTermination(contractData) 
                              ? t("common:common.yes")
                              : t("common:common.no")}
                        />
                     </div>
                  </div>
               </InfoCard>

               <InfoCard
                  title={
                     <div className="flex items-center justify-between w-full">
                        <span>{t("profile.contract.documents.title")}</span>
                        {canAddAttachments && (
                           <button
                              type="button"
                              onClick={() => setIsUploadModalOpen(true)}
                              className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-primary hover:text-primary/80 hover:bg-primary/10 rounded-md transition-colors"
                              title={t("profile.contract.documents.addFiles")}>
                              <Plus size={14} className="fill-primary" />
                              <span>{t("profile.contract.documents.addFiles")}</span>
                           </button>
                        )}
                     </div>
                  }>
                  <div className="flex flex-col r-gap-sm max-h-[420px] overflow-y-auto pe-1 xl:gap-3">
                     {getAttachments(contractData).length ? (
                        getAttachments(contractData).map((attachment) => (
                           <div
                              key={`${attachment.file_id}-${attachment.file_name}`}
                              className="flex flex-col sm:flex-row sm:items-center sm:justify-between r-gap-sm border border-border r-rounded px-3 py-2 xl:gap-4 xl:rounded-2xl xl:px-4 xl:py-3">
                              <div className="flex items-center gap-3 min-w-0 xl:gap-3">
                                 <AttachmentPreview
                                    url={attachment.url}
                                    fileName={attachment.file_name}
                                 />
                                 <div className="flex flex-col min-w-0">
                                    <span className="truncate text-sm font-medium text-text-strong">
                                       {attachment.file_name ||
                                          t(
                                             "profile.contract.documents.fileName",
                                             {
                                                name:
                                                   getWorkInformation(contractData)
                                                      ?.manager?.name ||
                                                   employeeData?.personal?.first_name ||
                                                   "Employee",
                                                year: getStartDate(contractData)
                                                   ? new Date(
                                                        getStartDate(contractData)!
                                                     ).getFullYear()
                                                   : new Date().getFullYear(),
                                             }
                                          )}
                                    </span>
                                    <span className="text-xs text-text-sub">
                                       {attachment.status ||
                                          t(
                                             "profile.contract.documents.readyForDownload"
                                          )}
                                    </span>
                                 </div>
                              </div>
                              {canViewAttachments && (
                                 <div className="flex items-center">
                                    <IconButton
                                       Icon={ArrowUpRightFromSquare}
                                       ariaLabel="View contract attachment"
                                       variant="ghost"
                                       active={true}
                                       className="border-0!"
                                       onClick={() =>
                                          handleViewAttachment(
                                             attachment.url,
                                             attachment.file_name
                                          )
                                       }
                                    />
                                    <IconButton
                                       Icon={DownloadBracket}
                                       ariaLabel="Download contract attachment"
                                       variant="ghost"
                                       className="border-0! ms-3.5"
                                       onClick={() =>
                                          handleDownloadAttachment(
                                             attachment.url,
                                             attachment.file_name
                                          )
                                       }
                                    />
                                 </div>
                              )}
                           </div>
                        ))
                     ) : (
                        <p className="text-sm text-text-sub text-center py-4">
                           {t("profile.contract.documents.noDocuments")}
                        </p>
                     )}
                  </div>
               </InfoCard>
            </div>

            <div className="flex flex-col r-gap xl:gap-6">
               {workInfoSection ? (
                  <DetailSectionsGrid
                     sections={[workInfoSection]}
                     gridClassName="grid-cols-1"
                     onEdit={handleEditSection}
                     canEdit={canEdit}
                  />
               ) : (
                  <InfoCard
                     title={
                        <div className="flex items-center justify-between w-full">
                           <span>{t("profile.details.work.title")}</span>
                           {canEdit && (
                              <button
                                 type="button"
                                 onClick={() => handleEditSection("work")}
                                 className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-primary hover:text-primary/80 hover:bg-primary/10 rounded-md transition-colors"
                                 title={t("common:actions.edit") || "Edit"}>
                                 <PenToSquare
                                    size={14}
                                    className="fill-primary"
                                 />
                                 <span>
                                    {t("common:actions.edit") || "Edit"}
                                 </span>
                              </button>
                           )}
                        </div>
                     }
                     icon={<Briefcase size={24} />}>
                     <div className="r-grid-form r-gap text-sm xl:grid-cols-2 xl:gap-4">
                        {workDetails ? (
                           <>
                              <ContractFieldRow
                                 label={t("fields.jobTitle")}
                                 value={workDetails?.job_title || notProvidedLabel}
                              />
                              <ContractFieldRow
                                 label={t("fields.team")}
                                 value={
                                    workDetails?.team ||
                                    "Not Assigned"
                                 }
                              />
                              <ContractFieldRow
                                 label={t("fields.manager")}
                                 value={
                                    workDetails?.manager?.name ||
                                    "Not Assigned"
                                 }
                              />
                              <ContractFieldRow
                                 label={t("fields.role")}
                                 value={workDetails?.role || notProvidedLabel}
                              />
                              <ContractFieldRow
                                 label={t("fields.permissions")}
                                 value={workDetails?.permissions || notProvidedLabel}
                              />
                              <ContractFieldRow
                                 label={t("fields.memberId")}
                                 value={workDetails?.member_id || notProvidedLabel}
                              />
                              <ContractFieldRow
                                 label={t("fields.startDate")}
                                 value={workDetails?.start_date
                                    ? new Date(
                                         workDetails.start_date
                                      ).toLocaleDateString("en-GB")
                                    : notProvidedLabel}
                              />
                              <ContractFieldRow
                                 label={t("fields.endDate")}
                                 value={workDetails?.end_date
                                    ? new Date(
                                         workDetails.end_date
                                      ).toLocaleDateString("en-GB")
                                    : notProvidedLabel}
                              />
                           </>
                        ) : (
                           <p className="text-sm text-text-sub col-span-2">
                              {t("profile.contract.workInfoNotAvailable") || "Work information not available for this contract type."}
                           </p>
                        )}
                     </div>
                  </InfoCard>
               )}

               <DetailSectionsGrid
                  sections={compensationSections}
                  gridClassName="grid-cols-1"
                  onEdit={handleEditSection}
                  canEdit={canEdit}
               />

               <InfoCard
                  title={
                     <div className="flex items-center justify-between w-full">
                        <span>{t("profile.details.contact.title")}</span>
                        {canEdit && (
                           <button
                              type="button"
                              onClick={() => handleEditSection("contact")}
                              className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-primary hover:text-primary/80 hover:bg-primary/10 rounded-md transition-colors"
                              title={t("common:actions.edit") || "Edit"}>
                              <PenToSquare size={14} className="fill-primary" />
                              <span>{t("common:actions.edit") || "Edit"}</span>
                           </button>
                        )}
                     </div>
                  }
                  icon={<IdCardClipText size={24} />}>
                  <div className="r-stack r-gap-sm xl:items-start xl:gap-4 overflow-visible">
                     {contactDetails ? (
                        <>
                           <div className="w-full min-w-0 overflow-visible xl:flex-1">
                              <CopyableContactField
                                 label={t("fields.mobile")}
                                 value={contactDetails.mobile || notProvidedLabel}
                              />
                           </div>
                           <div className="w-full min-w-0 overflow-visible xl:flex-1">
                              <CopyableContactField
                                 label={t("fields.email")}
                                 value={contactDetails.email || notProvidedLabel}
                              />
                           </div>
                        </>
                     ) : (
                        <p className="text-sm text-text-sub">
                           {t("profile.contract.contactNotAvailable") ===
                           "profile.contract.contactNotAvailable"
                              ? "Contact information not available for this contract type."
                              : t("profile.contract.contactNotAvailable")}
                        </p>
                     )}
                  </div>
               </InfoCard>
            </div>
         </div>

         {canExtendContract && (
            <ExtendContractModal
               isOpen={isExtendModalOpen}
               onClose={() => setIsExtendModalOpen(false)}
               currentEndDate={getEndDate(contractData) || undefined}
            />
         )}

         {canTerminateContract && (
            <TerminateContractModal
               isOpen={isTerminateModalOpen}
               onClose={() => setIsTerminateModalOpen(false)}
               onConfirm={handleTerminate}
               isLoading={terminateMutation.isPending}
            />
         )}

         {id && employeeData && (
            <>
               <EditWorkInfoForm
                  isOpen={activeEditModal === "work"}
                  onClose={handleCloseModal}
                  employeeId={id}
                  employeeData={employeeData}
                  availableJobTitles={availableJobTitles}
                  availableTeams={availableTeams}
                  availableRoles={availableRoles}
                  availableManagers={availableManagers}
               />
               <EditCompensationForm
                  isOpen={activeEditModal === "compensation"}
                  onClose={handleCloseModal}
                  employeeId={id}
                  employeeData={employeeData}
               />
               <EditContactForm
                  isOpen={activeEditModal === "contact"}
                  onClose={handleCloseModal}
                  employeeId={id}
                  employeeData={employeeData}
               />
            </>
         )}

         {contractData && id && (
            <>
               {canEditClauses && (
                  <EditContractClausesForm
                     isOpen={isEditClausesOpen}
                     onClose={() => setIsEditClausesOpen(false)}
                     contractId={getContractId(contractData)}
                     employeeId={id}
                     clauses={
                        isContractResponse(contractData)
                           ? // Convert ContractResponse vacations to EmployeeContract clauses format
                             {
                                notice_period_days:
                                   getNoticePeriodDays(contractData) ?? 0,
                                sick_leave_days: String(
                                   getSickLeaveDays(contractData) ?? 0
                                ),
                                casual_leave_days: String(
                                   getCasualLeaveDays(contractData) ?? 0
                                ),
                                annual_leave_days: String(
                                   getAnnualLeaveDays(contractData) ?? 0
                                ),
                                absence_limit: {
                                   days_per_year:
                                      getAbsenceLimitDays(contractData) ?? 0,
                                   auto_termination:
                                      getAutoTermination(contractData),
                                },
                             }
                           : contractData.clauses
                     }
                  />
               )}
               <UploadContractFilesModal
                  isOpen={isUploadModalOpen}
                  onClose={() => setIsUploadModalOpen(false)}
                  contractId={getContractId(contractData)}
                  employeeId={id}
               />
            </>
         )}
      </div>
   );
}

function CopyableContactField({
   label,
   value,
}: {
   label: string;
   value: string;
}) {
   const [copied, setCopied] = useState(false);
   const [showTooltip, setShowTooltip] = useState(false);

   const copyToClipboard = async (text: string) => {
      try {
         await navigator.clipboard.writeText(text);
         setCopied(true);
         setTimeout(() => {
            setCopied(false);
            setShowTooltip(false);
         }, 1000);
      } catch (err) {
         console.error("Failed to copy: ", err);
      }
   };

   const handleMouseEnter = () => {
      if (!copied) {
         setShowTooltip(true);
      }
   };

   const handleMouseLeave = () => {
      if (!copied) {
         setShowTooltip(false);
      }
   };

   return (
      <div className="flex flex-col gap-1 justify-center min-h-11">
         <dt className="text-sm font-normal leading-5 text-text-sub tracking-tight">
            {label}
         </dt>
         <dd className="text-sm font-normal leading-5">
            <div className="relative inline-block">
               <div
                  onClick={() => copyToClipboard(value)}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                  className="inline-flex items-center gap-0.5 rounded-md bg-primary/10 px-2 py-0.5 cursor-pointer hover:bg-primary/15 transition-colors">
                  <span className="text-xs font-medium text-primary leading-4">
                     {value}
                  </span>
               </div>
               {showTooltip && (
                  <div className="absolute bottom-full end-0 mb-2 px-3 py-1 bg-gray-800 text-white text-sm rounded-md whitespace-nowrap z-9999 transition-opacity duration-200">
                     {copied ? "Copied!" : "Click to copy"}
                     <div className="absolute -bottom-1 left-4 w-2 h-2 bg-gray-800 rotate-45"></div>
                  </div>
               )}
            </div>
         </dd>
      </div>
   );
}

function ContractFieldRow({ label, value }: { label: string; value: string }) {
   return (
      <div className="flex flex-col gap-1 justify-center min-h-11">
         <span className="text-sm font-normal leading-5 text-text-sub tracking-tight">
            {label}
         </span>
         <span className="text-sm font-normal leading-5 text-text-strong">
            {value}
         </span>
      </div>
   );
}

export default ContractTab;
