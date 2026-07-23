import { useState, useCallback, useEffect, useMemo } from "react";
import type { PaginationState, Updater } from "@tanstack/react-table";
import { useNavigate } from "react-router-dom";

import LoadingState from "@/designSystem/LoadingState";
import LoadingOverlay from "@/designSystem/LoadingOverlay";
import LegalCasesTable from "./LegalCasesTable";
import LegalCasesToolbar from "./ui/LegalCasesToolbar";
import type { LegalCaseFilters } from "./ui/LegalCasesFilterDropdown";
import { useDebounce } from "@/hooks/useDebounce";
import { format } from "date-fns";
import LegalCasesFloatingActionBar from "./LegalCasesFloatingActionBar";
import type { LegalCase } from "./data";
import ConfirmModal from "@/designSystem/ConfirmModal";
import Modal from "@/designSystem/Modal";
import AddCaseWizard from "./AddCaseWizard/AddCaseWizard";
import { formatPermissionName } from "@/utilities/permissionFormatters";
import type { CaseFormData } from "./AddCaseWizard/types";
import { useTranslation } from "@/hooks/useTranslation";
import {
   useListLegalCases,
   useGetLegalCaseById,
   useUpdateLegalCase,
} from "@/hooks/legalCases/legalCase.queries";
import {
   useCreateLegalCase,
   useDeleteLegalCase,
} from "@/hooks/legalCases/legalCase.mutations";
import { legalCasesService } from "@/services/legalCasesService";
import toast from "@/utilities/toast";
import { usePermissions } from "@/contexts/PermissionContext";
import NoPermissionMessage from "@/components/common/NoPermissionMessage";
import ChangeCaseStatusModal from "./modals/ChangeCaseStatusModal";

function LegalCasesContent() {
   const { t } = useTranslation("settings");
   const { t: tCommon } = useTranslation("common");
   const navigate = useNavigate();
   const { can } = usePermissions();
   const canViewCases = can("read_legal_case");
   const canCreateCases = can("create_legal_case");
   const canUpdateCases = can("update_legal_case");
   const canDeleteCases = can("delete_legal_case");

   const canAccessCases =
      canViewCases || canCreateCases || canUpdateCases || canDeleteCases;

   const [searchQuery, setSearchQuery] = useState("");
   const debouncedSearchQuery = useDebounce(searchQuery, 400);
   const [sortBy, setSortBy] = useState<string>("created_at");
   const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
   const [pagination, setPagination] = useState<PaginationState>({
      pageIndex: 0,
      pageSize: 10,
   });
   const [filters, setFilters] = useState<LegalCaseFilters>({});

   // State for details and delete actions
   const [selectedCase, setSelectedCase] = useState<LegalCase | null>(null);
   const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
   const [selectedRows, setSelectedRows] = useState<LegalCase[]>([]);
   const [bulkDeleteModalState, setBulkDeleteModalState] = useState<{
      isOpen: boolean;
      cases: LegalCase[];
   }>({
      isOpen: false,
      cases: [],
   });

   // State for add case modal
   const [isAddCaseModalOpen, setIsAddCaseModalOpen] = useState(false);
   const [editingCase, setEditingCase] = useState<LegalCase | null>(null);
   const [editingCaseId, setEditingCaseId] = useState<string | null>(null);
   const [initialCaseData, setInitialCaseData] = useState<
      CaseFormData | undefined
   >();
   const [caseDraft, setCaseDraft] = useState<CaseFormData | null>(null);
   const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
   const [isChangeStatusModalOpen, setIsChangeStatusModalOpen] = useState(false);
   const [statusTargetCase, setStatusTargetCase] = useState<LegalCase | null>(
      null,
   );

   const createCaseMutation = useCreateLegalCase();
   const deleteCaseMutation = useDeleteLegalCase();
   const updateCaseMutation = useUpdateLegalCase();

   const page = pagination.pageIndex + 1;
   const limit = pagination.pageSize;

   const listFilters = useMemo(() => {
      const mapped: Record<string, unknown> = {
         page,
         limit,
         search: debouncedSearchQuery || undefined,
         sort_by: sortBy,
         sort_order: sortOrder,
      };
      if (filters.status) {
         mapped.status = filters.status;
      }
      if (filters.lawyerId) {
         const lawyerId = Number(filters.lawyerId);
         if (Number.isFinite(lawyerId)) {
            mapped.lawyer_id = lawyerId;
         }
      }
      if (filters.dateFrom) {
         mapped.from_date = format(filters.dateFrom, "yyyy-MM-dd");
      }
      if (filters.dateTo) {
         mapped.to_date = format(filters.dateTo, "yyyy-MM-dd");
      }
      return mapped;
   }, [
      filters.dateFrom,
      filters.dateTo,
      filters.lawyerId,
      filters.status,
      limit,
      page,
      debouncedSearchQuery,
      sortBy,
      sortOrder,
   ]);

   const handlePaginationChange = useCallback(
      (updater: Updater<PaginationState>) => {
         setPagination((prev) =>
            typeof updater === "function" ? updater(prev) : updater,
         );
      },
      [],
   );

   useEffect(() => {
      setPagination((prev) => ({ ...prev, pageIndex: 0 }));
   }, [
      debouncedSearchQuery,
      sortBy,
      sortOrder,
      filters.status,
      filters.lawyerId,
      filters.dateFrom,
      filters.dateTo,
   ]);

   const { data, isLoading, isError, error, refetch } = useListLegalCases(
      listFilters,
      { enabled: canViewCases },
   );

   const totalPages =
      data?.pagination?.total_pages ??
      (data?.pagination?.total
         ? Math.ceil(data.pagination.total / (limit || 1))
         : 0);

   const { data: caseDetails, isLoading: isLoadingDetails } =
      useGetLegalCaseById(editingCaseId, {
         enabled: canViewCases && !!editingCaseId,
      });

   const mapCaseToForm = useCallback((legalCase: LegalCase): CaseFormData => {
      return {
         title: legalCase.title || "",
         case_type_id: legalCase.case_type_id,
         case_number: legalCase.case_number || "",
         client_name: legalCase.client || "",
         status: (legalCase.status || "Open") as CaseFormData["status"],
         start_date: legalCase.start_date || "",
         end_date: legalCase.end_date || "",
         people: [], // Should come from details
         files: [], // Should come from details
         summary: legalCase.description || "",
      };
   }, []);

   useEffect(() => {
      if (caseDetails && editingCaseId) {
         setInitialCaseData(mapCaseToForm(caseDetails as unknown as LegalCase));
         setIsAddCaseModalOpen(true);
      }
   }, [caseDetails, editingCaseId, mapCaseToForm]);

   const handleSortChange = (optionId: string) => {
      const sortMap: Record<
         string,
         { sort_by: string; sort_order: "asc" | "desc" }
      > = {
         dateCreated: { sort_by: "created_at", sort_order: "desc" },
         lastUpdated: { sort_by: "updated_at", sort_order: "desc" },
         caseNumber: { sort_by: "case_number", sort_order: "asc" },
         title: { sort_by: "title", sort_order: "asc" },
      };

      const sortConfig = sortMap[optionId];
      if (sortConfig) {
         setSortBy(sortConfig.sort_by);
         setSortOrder(sortConfig.sort_order);
      }
   };

   const handleFiltersApply = (newFilters: LegalCaseFilters) => {
      setFilters(newFilters);
   };

   const handleAddCaseClick = () => {
      setIsAddCaseModalOpen(true);
      setEditingCase(null);
      setEditingCaseId(null);
      setInitialCaseData(undefined);
      setCaseDraft(null);
   };

   const isCaseDraftDirty = (() => {
      if (!caseDraft) return false;
      const baseline =
         initialCaseData ||
         ({
            title: "",
            case_type_id: undefined,
            case_number: "",
            client_name: "",
            status: "Open",
            start_date: "",
            end_date: "",
            people: [],
            files: [],
            summary: "",
         } as CaseFormData);
      return (
         caseDraft.title !== baseline.title ||
         caseDraft.case_type_id !== baseline.case_type_id ||
         caseDraft.case_number !== baseline.case_number ||
         caseDraft.client_name !== baseline.client_name ||
         caseDraft.status !== baseline.status ||
         caseDraft.start_date !== baseline.start_date ||
         caseDraft.end_date !== baseline.end_date ||
         caseDraft.summary !== baseline.summary ||
         caseDraft.people.length !== baseline.people.length ||
         caseDraft.files.length !== baseline.files.length
      );
   })();

   const handleCloseAddCaseModal = (skipConfirm?: boolean) => {
      if (!skipConfirm && isCaseDraftDirty) {
         setShowDiscardConfirm(true);
         return;
      }
      setIsAddCaseModalOpen(false);
      setEditingCaseId(null);
      setCaseDraft(null);
   };

   const handleSubmitCase = async (data: CaseFormData) => {
      try {
         // TODO: Handle Edit logic if editingCase is set
         const parsedCaseTypeId = data.case_type_id
            ? Number(data.case_type_id)
            : undefined;
         const peoplePayload = (data.people || [])
            .map((person) => ({
               employee_id: Number(person.employee_id),
               role: person.role,
            }))
            .filter(
               (person) =>
                  Number.isFinite(person.employee_id) && person.employee_id > 0,
            );
         const attachmentsPayload = (data.files || [])
            .filter((file) => Boolean(file.fileId))
            .map((file) => ({
               fileId: file.fileId as number | string,
               fileName: file.fileName,
               token: file.token,
            }));

         const createResult = await createCaseMutation.mutateAsync({
            case_number: data.case_number?.trim() || undefined,
            title: data.title,
            summary: data.summary?.trim() || "",
            client_name: data.client_name?.trim() || undefined,
            lawyer_id: 1,
            status: data.status || "Open",
            start_date: data.start_date || undefined,
            end_date: data.end_date || undefined,
            case_type_id:
               parsedCaseTypeId && !Number.isNaN(parsedCaseTypeId)
                  ? parsedCaseTypeId
                  : undefined,
            core: attachmentsPayload.length
               ? { attachments: attachmentsPayload }
               : undefined,
         });

         const createdCaseId = createResult?.data?.id;
         if (createdCaseId && peoplePayload.length) {
            const employeeResults = await Promise.allSettled(
               peoplePayload.map((person) =>
                  legalCasesService.addEmployee(createdCaseId, {
                     employee_id: String(person.employee_id),
                     role: person.role || "Lawyer",
                  }),
               ),
            );

            const failedEmployees = employeeResults.filter(
               (result) => result.status === "rejected",
            ).length;

            if (failedEmployees > 0) {
               toast.error(
                  t(
                     "legalCases.toast.peopleAssignPartialFailure",
                     "Case created, but some people could not be assigned.",
                  ),
               );
            }
         }

         setIsAddCaseModalOpen(false);
         setEditingCaseId(null);
         setCaseDraft(null);
         refetch();
      } catch (error) {
         console.error("Error creating case:", error);
      }
   };

   const handleViewDetails = (legalCase: LegalCase) => {
      navigate(`/dashboard/legal-cases/${legalCase.id}`);
   };

   const handleEditClick = useCallback((legalCase: LegalCase) => {
      setEditingCase(legalCase);
      setEditingCaseId(legalCase.id);
      // Modal will open via useEffect when data loads
   }, []);

   const handleDeleteClick = (legalCase: LegalCase) => {
      setSelectedCase(legalCase);
      setIsDeleteModalOpen(true);
   };

   const handleChangeStatusClick = useCallback((legalCase: LegalCase) => {
      setStatusTargetCase(legalCase);
      setIsChangeStatusModalOpen(true);
   }, []);

   const handleConfirmStatusChange = async (status: string) => {
      if (!statusTargetCase) return;
      try {
         await updateCaseMutation.mutateAsync({
            id: statusTargetCase.id,
            data: { status },
         });
         toast.success(
            t(
               "legalCases.toast.statusUpdateSuccess",
               "Case status updated successfully",
            ),
         );
         setIsChangeStatusModalOpen(false);
         setStatusTargetCase(null);
      } catch (error) {
         console.error("Error updating case status:", error);
         toast.error(
            t("legalCases.toast.statusUpdateError", "Failed to update case status"),
         );
      }
   };

   const handleConfirmDelete = async () => {
      if (selectedCase) {
         try {
            await deleteCaseMutation.mutateAsync(selectedCase.id);
            toast.success(t("legalCases.wizard.messages.deleteSuccess"));
            setIsDeleteModalOpen(false);
            setSelectedCase(null);
            refetch();
         } catch (error) {
            console.error("Error deleting case:", error);
            toast.error(t("legalCases.wizard.messages.deleteError"));
         }
      }
   };

   const handleRowSelectionChange = useCallback((selectedRows: LegalCase[]) => {
      setSelectedRows(selectedRows);
      // selectedRows is used by the floating action bar via renderFloatingBar
   }, []);

   const handleBulkDelete = useCallback((cases: LegalCase[]) => {
      setBulkDeleteModalState({ isOpen: true, cases });
   }, []);

   const handleConfirmBulkDelete = async () => {
      try {
         setBulkDeleteModalState({ isOpen: false, cases: [] });
         setSelectedRows([]);
         refetch();
      } catch (error) {
         console.error("Error bulk deleting cases:", error);
      }
   };

   const handleCancelBulkDelete = () => {
      setBulkDeleteModalState({ isOpen: false, cases: [] });
   };

   const renderFloatingBar = useCallback(
      (selectedCount: number, selectedCases: LegalCase[]) => (
         <LegalCasesFloatingActionBar
            selectedCount={selectedCount}
            selectedRows={selectedCases}
            onDelete={handleBulkDelete}
            onEdit={(caseItem) => handleEditClick(caseItem)}
         />
      ),
      [handleBulkDelete, handleEditClick],
   );

   if (!canAccessCases) {
      return (
         <div className="p-6">
            <NoPermissionMessage
               message={t("permissions.noAccess.title", "Access Restricted")}
               description={t(
                  "permissions.noAccess.message",
                  "You don't have permission to access the legal cases module.",
               )}
            />
         </div>
      );
   }

   return (
      <>
         {isLoadingDetails && (
            <LoadingOverlay
               isLoading={true}
               message="Loading case details..."
            />
         )}
         <LegalCasesToolbar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onSortChange={handleSortChange}
            onAddCaseClick={handleAddCaseClick}
            onFiltersApply={handleFiltersApply}
         />
         {!canViewCases ? (
            <NoPermissionMessage
               message={t(
                  "permissions.noReadAccess.title",
                  "Access Restricted",
               )}
               description={`${t(
                  "permissions.noReadAccess.message",
                  "You don't have permission to view legal cases.",
               )} (Missing: ${formatPermissionName("read_legal_case")})`}
               className="mt-12"
            />
         ) : (
            <>
               {/* Table Logic */}
               {isError ? (
                  // Check for 403 Forbidden
                  (error as any)?.response?.status === 403 ? (
                     <NoPermissionMessage
                        message={t(
                           "permissions.noReadAccess.title",
                           "Access Restricted",
                        )}
                        description={`${t(
                           "permissions.noReadAccess.message",
                           "You don't have permission to view legal cases.",
                        )} (Missing: ${formatPermissionName(
                           "read_legal_case",
                        )})`}
                        className="mt-12"
                     />
                  ) : (
                     <div className="text-error text-sm mb-4">
                        {t("common:error") || "Failed to load legal cases."}
                     </div>
                  )
               ) : isLoading ? (
                  <LoadingState
                     size="large"
                     label={t("legalCases.loading", "Loading legal cases...")}
                  />
               ) : (
                  <LegalCasesTable
                     data={data?.data || []}
                     onViewDetails={handleViewDetails}
                     onChangeStatus={
                        canUpdateCases ? handleChangeStatusClick : undefined
                     }
                     onRowSelectionChange={handleRowSelectionChange}
                     renderFloatingBar={renderFloatingBar}
                     pagination={pagination}
                     onPaginationChange={handlePaginationChange}
                     pageCount={totalPages}
                  />
               )}
            </>
         )}

         {/* Delete Confirmation Modal */}
         <ConfirmModal
            isOpen={isDeleteModalOpen}
            onClose={() => {
               if (!deleteCaseMutation.isPending) {
                  setIsDeleteModalOpen(false);
               }
            }}
            onConfirm={handleConfirmDelete}
            title={t("legalCases.confirmDelete.title")}
            description={t("legalCases.confirmDelete.description", {
               caseNumber: selectedCase?.case_number,
            })}
            confirmText={t("legalCases.confirmDelete.confirmButton")}
            cancelText={t("legalCases.confirmDelete.cancelButton")}
            variant="error"
            icon="exclamation"
            isLoading={deleteCaseMutation.isPending}
         />

         {/* Bulk Delete Confirmation Modal */}
         <ConfirmModal
            isOpen={bulkDeleteModalState.isOpen}
            onClose={handleCancelBulkDelete}
            onConfirm={handleConfirmBulkDelete}
            title={t("legalCases.confirmBulkDelete.title")}
            description={t("legalCases.confirmBulkDelete.description", {
               count: bulkDeleteModalState.cases.length,
            })}
            confirmText={t("legalCases.confirmBulkDelete.confirmButton")}
            cancelText={t("legalCases.confirmBulkDelete.cancelButton")}
            variant="error"
            icon="exclamation"
         />

         {/* Add Case Modal */}
         <Modal
            isOpen={isAddCaseModalOpen}
            onClose={handleCloseAddCaseModal}
            title={
               editingCase
                  ? t("legalCases.addCaseModal.editTitle")
                  : t("legalCases.addCaseModal.title")
            }
            size="large">
            <AddCaseWizard
               onSubmit={handleSubmitCase}
               onCancel={handleCloseAddCaseModal}
               onFormDataChange={setCaseDraft}
               initialData={initialCaseData}
            />
         </Modal>
         <ConfirmModal
            isOpen={showDiscardConfirm}
            onClose={() => setShowDiscardConfirm(false)}
            onConfirm={() => {
               setShowDiscardConfirm(false);
               setIsAddCaseModalOpen(false);
               setEditingCaseId(null);
               setCaseDraft(null);
            }}
            title={tCommon("unsavedChanges.title")}
            description={tCommon("unsavedChanges.description")}
            confirmText={tCommon("unsavedChanges.confirm")}
            cancelText={tCommon("unsavedChanges.cancel")}
         />
         <ChangeCaseStatusModal
            isOpen={isChangeStatusModalOpen}
            onClose={() => {
               if (!updateCaseMutation.isPending) {
                  setIsChangeStatusModalOpen(false);
                  setStatusTargetCase(null);
               }
            }}
            legalCase={statusTargetCase}
            onConfirm={handleConfirmStatusChange}
            isLoading={updateCaseMutation.isPending}
         />
      </>
   );
}

export default LegalCasesContent;
