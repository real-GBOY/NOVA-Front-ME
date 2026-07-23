import KPICard from "@/designSystem/KPICard";
import ContractsTable from "./ContractsTable";
import ContractsEmptyState from "./ContractsEmptyState";
import ContractsNoResults from "./ContractsNoResults";
import type { Contract } from "./data";
import { useTranslation } from "react-i18next";
import { MemoCheckCircle, MemoMinusCircle } from "@/Icons";
import ContractsToolbar from "./ui/ContractsToolbar";
import { useState, useMemo, useCallback, useEffect } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import toast from "@/utilities/toast";
import Modal from "@/designSystem/Modal";
import ConfirmModal from "@/designSystem/ConfirmModal";
import LoadingState from "@/designSystem/LoadingState";
import AddContractWizard from "./addContractWizard/AddContractWizard";
import type { ContractFormData } from "./addContractWizard/types";
import { useAvailableAssetDictionary } from "@/hooks/assets/useAssets";
import {
   useEmployeeDictionary,
   useListEmployees,
} from "@/hooks/employees/useEmployee";
import { useContracts } from "@/hooks/contracts/useContracts";
import { formatPermissionName } from "@/utilities/permissionFormatters";
import type { ContractResponse } from "@/services/contractService";
import { useTableSort, useTableFilter } from "@/hooks/table";
import type { ContractFilters } from "./ui/ContractsFilterDropdown";
import { usePermissions } from "@/contexts/PermissionContext";
import NoPermissionMessage from "@/components/common/NoPermissionMessage";
import type { PaginationState, Updater } from "@tanstack/react-table";
import type { AxiosError } from "axios";

const SORT_PARAM_MAP: Record<string, string> = {
   id: "contract_id",
   contractName: "contract_name",
   assignedTo: "employee_id",
   status: "status",
   startDate: "start_date",
   endDate: "end_date",
   contractAmount: "salary",
};

function ContractsContent() {
   const { t } = useTranslation("common");
   const [searchQuery, setSearchQuery] = useState("");
   const debouncedSearchQuery = useDebounce(searchQuery, 400);
   const [isWizardOpen, setIsWizardOpen] = useState(false);
   const [contractDraft, setContractDraft] = useState<ContractFormData | null>(
      null,
   );
   const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
   const { can } = usePermissions();

   const canViewContracts = can("read_contract") || can("manage_contracts");
   const canViewEmployees = can("read_employee_basic");
   const canCreateContract = can("create_contract") || can("manage_contracts");
   const canUpdateContract = can("update_contract") || can("manage_contracts");
   const canTerminateContract =
      can("terminate_contract") || can("manage_contracts");
   const canAttachContractFile =
      can("attach_contract_file") || can("manage_contracts");

   const canAccessContracts =
      canViewContracts ||
      canCreateContract ||
      canUpdateContract ||
      canTerminateContract ||
      canAttachContractFile;

   const [pagination, setPagination] = useState<PaginationState>({
      pageIndex: 0,
      pageSize: 12,
   });

   // ===== NEW TABLE ARCHITECTURE =====
   // Use table sorting hook
   const { sortConfig, handleSort } = useTableSort<Contract>();

   // Use table filter hook
   const { filters, updateFilters, hasActiveFilters } =
      useTableFilter<ContractFilters>();

   // Fetch contracts from API
   const { useList } = useContracts();
   const listFilters = useMemo(() => {
      const employeeIds = (filters.assignedTo || [])
         .map((id) => Number(id))
         .filter((id) => Number.isFinite(id));
      const mappedStatuses = Array.from(
         new Set(
            (filters.status || []).filter(
               (status) =>
                  status === "Active" ||
                  status === "Expired" ||
                  status === "Terminated",
            ),
         ),
      );

      return {
         search: debouncedSearchQuery || undefined,
         page: pagination.pageIndex + 1,
         limit: pagination.pageSize,
         status: mappedStatuses.length ? mappedStatuses : undefined,
         employee_id: employeeIds.length ? employeeIds : undefined,
         min_amount: filters.minAmount,
         max_amount: filters.maxAmount,
         sort_by: sortConfig?.field
            ? SORT_PARAM_MAP[String(sortConfig.field)] ||
              String(sortConfig.field)
            : undefined,
         sort_order: sortConfig?.direction,
      };
   }, [
      filters.assignedTo,
      filters.status,
      filters.minAmount,
      filters.maxAmount,
      debouncedSearchQuery,
      pagination.pageIndex,
      pagination.pageSize,
      sortConfig?.field,
      sortConfig?.direction,
   ]);

   useEffect(() => {
      setPagination((prev) => ({ ...prev, pageIndex: 0 }));
   }, [
      debouncedSearchQuery,
      filters.assignedTo,
      filters.status,
      filters.minAmount,
      filters.maxAmount,
      sortConfig?.field,
      sortConfig?.direction,
   ]);

   const handlePaginationChange = useCallback(
      (updater: Updater<PaginationState>) => {
         setPagination((prev) =>
            typeof updater === "function" ? updater(prev) : updater,
         );
      },
      [],
   );

   const {
      data: contractsResponse,
      isLoading: isLoadingContracts,
      error: contractsError,
   } = useList(listFilters, {
      enabled: canViewContracts,
   });

   // Fetch all employees to map to contracts by employee_id
   const { data: employeesListResponse } = useListEmployees(
      { page: 1, limit: 100 },
      {
         enabled: canViewContracts && canViewEmployees,
      },
   );

   // Fetch employees and available assets from API only when wizard is open
   // Only fetch if user can read employees/assets (assets might vary, assumig canViewEmployees implies some access)
   const { data: wizardEmployeesData = [] } = useEmployeeDictionary(undefined, {
      enabled: canViewContracts && isWizardOpen && canViewEmployees,
   });

   const { data: assetsData = [] } = useAvailableAssetDictionary({
      enabled: canViewContracts && isWizardOpen && can("read_asset"),
   });

   // Transform API contracts to table format
   const transformedContracts = useMemo((): Contract[] => {
      if (!contractsResponse?.data) {
         return [];
      }

      // Create employee map for quick lookup by ID
      const employeeMap = new Map(
         employeesListResponse?.data?.map((emp) => [emp.id, emp]) || [],
      );

      return contractsResponse.data.map((apiContract: ContractResponse) => {
         // Try to get employee from API response first, fallback to fetched list
         let employee = apiContract.core.employee;
         if (!employee && apiContract.core.employee_id) {
            const fetchedEmployee = employeeMap.get(
               apiContract.core.employee_id,
            );
            if (fetchedEmployee) {
               employee = {
                  id: fetchedEmployee.id,
                  name: fetchedEmployee.name,
                  email: fetchedEmployee.email,
                  avatar: fetchedEmployee.avatar,
                  job_title: fetchedEmployee.job_title,
               };
            }
         }

         const startDate = new Date(apiContract.core.start_date);
         const endDate = apiContract.core.end_date
            ? new Date(apiContract.core.end_date)
            : new Date(startDate.getTime() + 365 * 24 * 60 * 60 * 1000); // Default 1 year if no end date

         // Calculate progress
         const now = new Date();
         const totalDuration = endDate.getTime() - startDate.getTime();
         const elapsed = now.getTime() - startDate.getTime();
         const progress = Math.min(
            100,
            Math.max(0, (elapsed / totalDuration) * 100),
         );

         // Determine status
         let status: "Active" | "Near Expired" | "Expired" | "Terminated" =
            "Active";
         const backendStatus = apiContract.status?.toLowerCase();

         // Distinguish true termination from natural end/expiry.
         if (
            backendStatus === "terminated" ||
            apiContract.custom_fields?.termination
         ) {
            status = "Terminated";
         } else if (backendStatus === "ended") {
            status = "Expired";
         } else if (now > endDate) {
            // Contract has passed end date without being terminated
            status = "Expired";
         } else if (progress >= 80) {
            // Contract is 80% through duration
            status = "Near Expired";
         }

         // Calculate years and months duration
         const totalMonths = Math.round(
            totalDuration / (30 * 24 * 60 * 60 * 1000),
         );
         const years = Math.floor(totalMonths / 12);
         const months = totalMonths % 12;

         // Format dates
         const formatDate = (date: Date) => {
            const months = [
               "Jan",
               "Feb",
               "Mar",
               "Apr",
               "May",
               "Jun",
               "Jul",
               "Aug",
               "Sep",
               "Oct",
               "Nov",
               "Dec",
            ];
            return `${date.getDate()} ${
               months[date.getMonth()]
            }, ${date.getFullYear()}`;
         };

         const transformed = {
            id: `#${apiContract.id}`,
            contractName: apiContract.core.contract_name,
            assignedTo: {
               id: employee?.id?.toString() || "0",
               name: !canViewEmployees
                  ? "Unauthorized"
                  : employee?.name || "Unknown Employee",
               avatar: employee?.avatar || "/icons/defAvatar.png",
               jobTitle: !canViewEmployees
                  ? "Unauthorized"
                  : employee?.job_title || "N/A",
               avatarBg: "bg-bg-weak",
            },
            status,
            contractDuration: {
               years,
               months,
               startDate: formatDate(startDate),
               endDate: formatDate(endDate),
               progress: Math.round(progress),
            },
            contractAmount: apiContract.compensation?.salary || 0,
         };

         return transformed;
      });
   }, [contractsResponse, employeesListResponse, canViewEmployees]);

   // Calculate KPIs from transformed contracts
   const kpis = useMemo(() => {
      const active = transformedContracts.filter(
         (c) => c.status === "Active",
      ).length;
      const nearExpired = transformedContracts.filter(
         (c) => c.status === "Near Expired",
      ).length;
      const expired = transformedContracts.filter(
         (c) => c.status === "Expired",
      ).length;
      const terminated = transformedContracts.filter(
         (c) => c.status === "Terminated",
      ).length;

      return {
         active,
         nearExpired,
         expired,
         terminated,
         draft: 0, // Not available from current API
      };
   }, [transformedContracts]);

   // Handle filter apply
   const handleFiltersApply = useCallback(
      (newFilters: ContractFilters) => {
         updateFilters(newFilters);
      },
      [updateFilters],
   );

   const processedContracts = useMemo(() => {
      if (!filters.status?.length) return transformedContracts;

      const selected = new Set(filters.status);
      return transformedContracts.filter((contract) => {
         if (contract.status === "Terminated") {
            return selected.has("Expired");
         }
         if (contract.status === "Expired") {
            return selected.has("Expired");
         }
         // "Near Expired" is still active from a business-state perspective.
         return selected.has("Active");
      });
   }, [filters.status, transformedContracts]);

   const handleSearchChange = (value: string) => {
      setSearchQuery(value);
   };

   const handleAddContractClick = () => {
      if (!canCreateContract) return;
      setIsWizardOpen(true);
   };

   const isContractDraftDirty = useMemo(() => {
      if (!contractDraft) return false;
      return Boolean(
         contractDraft.contractName ||
         contractDraft.memberId ||
         contractDraft.contractType ||
         contractDraft.startDate ||
         contractDraft.endDate ||
         contractDraft.attachedDocuments?.length ||
         contractDraft.baseSalary ||
         contractDraft.salaryCycle ||
         contractDraft.overtimeRate ||
         contractDraft.assets?.length ||
         contractDraft.noticePeriod ||
         contractDraft.sickLeave ||
         contractDraft.casualLeave ||
         contractDraft.annualLeave ||
         contractDraft.absenceLimit,
      );
   }, [contractDraft]);

   const handleWizardClose = () => {
      if (isContractDraftDirty) {
         setShowDiscardConfirm(true);
         return;
      }
      setIsWizardOpen(false);
      setContractDraft(null);
   };

   const handleWizardComplete = async () => {
      toast.success(t("contracts.wizard.messages.createSuccess"));
      setIsWizardOpen(false);
      setContractDraft(null);
      // TODO: Add API call to save contract data
   };

   // Sample data for contract types and salary cycles - these are usually static
   const availableContractTypes = [
      { id: "full_time", label: "Full Time" },
      { id: "part_time", label: "Part Time" },
      { id: "contract", label: "Contract" },
      { id: "intern", label: "Intern" },
      { id: "temporary", label: "Temporary" },
   ];

   const availableSalaryCycles = [
      { id: "monthly", label: "Monthly" },
      { id: "weekly", label: "Weekly" },
      { id: "biweekly", label: "Bi-Weekly" },
      { id: "yearly", label: "Yearly" },
   ];

   // Use dynamic data from API
   // First, extract active contract employee IDs (stable dependency)
   const activeContractEmployeeIds = useMemo(() => {
      return new Set(
         transformedContracts
            .filter((c) => c.status === "Active")
            .map((c) => c.assignedTo.id),
      );
   }, [transformedContracts]);

   // Filter out employees who already have an ACTIVE contract
   const availableMembers = useMemo(() => {
      return wizardEmployeesData.filter(
         (emp) => !activeContractEmployeeIds.has(emp.id.toString()),
      );
   }, [wizardEmployeesData, activeContractEmployeeIds]);

   const availableAssets = assetsData;
   const contractsErrorStatus = (contractsError as AxiosError | null)?.response
      ?.status;

   if (!canAccessContracts) {
      return (
         <NoPermissionMessage
            message={t("permissions.noAccess.title", "Access Restricted")}
            description={t(
               "permissions.noAccess.message",
               "You don't have permission to access the contracts module.",
            )}
         />
      );
   }

   return (
      <>
         {/* Toolbar */}

         {/* KPIs */}
         {canViewContracts && (
            <>
               <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-2 md:gap-3 xl:gap-3 mb-6">
                  <KPICard
                     icon={<MemoCheckCircle className="fill-success" />}
                     label={t("contracts.activeContract")}
                     value={kpis.active.toString()}
                  />
                  <KPICard
                     icon={<MemoCheckCircle className="fill-warning" />}
                     label={t("contracts.contractNearExpire")}
                     value={kpis.nearExpired.toString()}
                  />
                  <KPICard
                     icon={<MemoMinusCircle className="fill-text-sub" />}
                     label={t("contracts.draftContract")}
                     value={kpis.draft.toString()}
                  />
                  <KPICard
                     icon={<MemoCheckCircle className="fill-danger" />}
                     label={t("contracts.expiredContract")}
                     value={kpis.expired.toString()}
                  />
                  <KPICard
                     icon={<MemoMinusCircle className="fill-error" />}
                     label={t("contracts.terminatedContract")}
                     value={kpis.terminated.toString()}
                  />
               </div>
            </>
         )}

         <ContractsToolbar
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            onSortChange={handleSort}
            onAddContractClick={handleAddContractClick}
            onFiltersApply={handleFiltersApply}
            exportData={processedContracts}
            rawData={contractsResponse?.data || []}
            rawDataIdField="id"
         />

         {/* Table Section with Empty/No Results States */}
         {!canViewContracts ? (
            <NoPermissionMessage
               message={t(
                  "permissions.noReadAccess.title",
                  "Access Restricted",
               )}
               description={`${t(
                  "permissions.noReadAccess.message",
                  "You don't have permission to view contracts.",
               )} (Missing: ${formatPermissionName("read_contract")})`}
               className="mt-12"
            />
         ) : isLoadingContracts ? (
            <LoadingState
               size="large"
               label={t("contracts.loadingContracts")}
            />
         ) : contractsError ? (
            contractsErrorStatus === 403 ? (
               <NoPermissionMessage
                  message={t(
                     "permissions.noReadAccess.title",
                     "Access Restricted",
                  )}
                  description={`${t(
                     "permissions.noReadAccess.message",
                     "You don't have permission to view contracts.",
                  )} (Missing: ${formatPermissionName("read_contract")})`}
                  className="mt-12"
               />
            ) : (
               <div className="flex items-center justify-center py-12">
                  <p className="text-danger">
                     {t("contracts.errorLoadingContracts") ||
                        "Failed to load contracts"}
                  </p>
               </div>
            )
         ) : transformedContracts.length === 0 &&
           !searchQuery &&
           !hasActiveFilters ? (
            <ContractsEmptyState />
         ) : processedContracts.length === 0 ? (
            <ContractsNoResults />
         ) : (
            <ContractsTable
               data={processedContracts}
               pageCount={Math.max(
                  1,
                  Math.ceil(
                     (contractsResponse?.pagination?.total ?? 0) /
                        (pagination.pageSize || 1),
                  ),
               )}
               pagination={pagination}
               onPaginationChange={handlePaginationChange}
            />
         )}

         <Modal
            isOpen={isWizardOpen}
            onClose={handleWizardClose}
            title={t("actions.createContract")}
            size="large">
            <AddContractWizard
               onClose={handleWizardClose}
               onComplete={handleWizardComplete}
               onFormDataChange={setContractDraft}
               availableMembers={availableMembers}
               availableContractTypes={availableContractTypes}
               availableSalaryCycles={availableSalaryCycles}
               availableAssets={availableAssets}
            />
         </Modal>
         <ConfirmModal
            isOpen={showDiscardConfirm}
            onClose={() => setShowDiscardConfirm(false)}
            onConfirm={() => {
               setShowDiscardConfirm(false);
               setIsWizardOpen(false);
               setContractDraft(null);
            }}
            title={t("unsavedChanges.title")}
            description={t("unsavedChanges.description")}
            confirmText={t("unsavedChanges.confirm")}
            cancelText={t("unsavedChanges.cancel")}
         />
      </>
   );
}

export default ContractsContent;
