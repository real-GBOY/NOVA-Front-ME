/** @format */

import { useMemo, useState, useRef, useCallback, useEffect } from "react";
import { ColumnDef, PaginationState, Updater } from "@tanstack/react-table";
import { DataTable } from "@/designSystem/ui/data-table";
import { useTranslation } from "@/hooks/useTranslation";
import Checkbox from "@/designSystem/Checkbox";
import StatusTag from "@/designSystem/StatusTag";
import Dropdown, { DropdownItem } from "@/designSystem/Dropdown";
import DirhamLabel from "@/designSystem/DirhamLabel";
import { MoreVertical, Edit, Trash, TimeLine, FileExport } from "@/Icons";
import { PrettyCashName } from "../types";
import PrettyCashNamesFloatingActionBar from "./PrettyCashNamesFloatingActionBar";
import DeletePrettyCashNameModal from "../modals/DeletePrettyCashNameModal";
import PettyCashHistoryModal from "../modals/PettyCashHistoryModal";
import financialAccountHistoryService from "@/services/financialAccountHistoryService";
import { format } from "date-fns";
import {
   useListPrettyCashNames,
   useDeletePrettyCashName,
} from "@/hooks/prettyCashNames/usePrettyCashNames";
import toast from "@/utilities/toast";
import { StatusFilters } from "../../../shared/StatusFilterDropdown";
import LoadingState from "@/designSystem/LoadingState";

interface PrettyCashNamesTabProps {
   searchQuery: string;
   filters: StatusFilters;
   sortBy: string;
   onEdit: (prettyCashName: PrettyCashName) => void;
}

// Actions Cell Component
function ActionsCell({
   prettyCashName,
   onDelete,
   onEdit,
   onViewHistory,
   onExportHistory,
}: {
   prettyCashName: PrettyCashName;
   onDelete: (item: PrettyCashName) => void;
   onEdit?: (prettyCashName: PrettyCashName) => void;
   onViewHistory?: (prettyCashName: PrettyCashName) => void;
   onExportHistory?: (prettyCashName: PrettyCashName) => void;
}) {
   const { t } = useTranslation("settings");
   const [isOpen, setIsOpen] = useState(false);
   const buttonRef = useRef<HTMLButtonElement>(null);

   const dropdownItems: DropdownItem[] = [
      {
         id: "history",
         label: t("prettyCashNames.actions.viewHistory"),
         icon: TimeLine,
         onClick: () => {
            onViewHistory?.(prettyCashName);
            setIsOpen(false);
         },
         variant: "default",
      },
      {
         id: "exportHistory",
         label: t("prettyCashNames.actions.exportHistory"),
         icon: FileExport,
         onClick: () => {
            onExportHistory?.(prettyCashName);
            setIsOpen(false);
         },
         variant: "default",
      },
      {
         id: "edit",
         label: t("prettyCashNames.actions.edit"),
         icon: Edit,
         onClick: () => {
            onEdit?.(prettyCashName);
            setIsOpen(false);
         },
         variant: "default",
      },
      {
         id: "delete",
         label: t("prettyCashNames.actions.delete"),
         icon: Trash,
         onClick: () => {
            onDelete(prettyCashName);
            setIsOpen(false);
         },
         variant: "danger",
      },
   ];

   return (
      <div className="flex justify-end">
         <button
            ref={buttonRef}
            type="button"
            aria-label={t("prettyCashNames.actions.label")}
            className={`p-1.5 transition-colors rounded-lg flex items-center justify-center w-8 h-8 ${
               isOpen
                  ? "bg-bg-weak"
                  : "bg-transparent hover:bg-bg-weak active:bg-border"
            }`}
            data-row-menu-trigger
            onClick={() => setIsOpen(!isOpen)}>
            <MoreVertical size={20} />
         </button>

         <Dropdown
            items={dropdownItems}
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            anchorRef={buttonRef}
         />
      </div>
   );
}

function PrettyCashNamesTab({
   searchQuery,
   filters,
   sortBy,
   onEdit,
}: PrettyCashNamesTabProps) {
   const { t } = useTranslation("settings");
   const [deleteModalOpen, setDeleteModalOpen] = useState(false);
   const [prettyCashNameToDelete, setPrettyCashNameToDelete] = useState<
      string | number | null
   >(null);
   const [prettyCashNamesToDelete, setPrettyCashNamesToDelete] = useState<
      (string | number)[]
   >([]);
   const [selectionResetSignal, setSelectionResetSignal] = useState(0);
   const [deleteModalState, setDeleteModalState] = useState<
      "idle" | "loading" | "success"
   >("idle");

   // History modal state
   const [historyModalOpen, setHistoryModalOpen] = useState(false);
   const [selectedPettyCashForHistory, setSelectedPettyCashForHistory] =
      useState<PrettyCashName | null>(null);

   // Pagination state
   const [page, setPage] = useState(1);
   const [pageSize, setPageSize] = useState(12);

   // Reset page when filters or search change
   useEffect(() => {
      setPage(1);
   }, [searchQuery, filters.status, sortBy]);

   const selectedStatus = filters.status[0];
   const normalizedStatus = selectedStatus
      ? selectedStatus.charAt(0).toUpperCase() + selectedStatus.slice(1)
      : undefined;

   const sortField = (() => {
      if (sortBy === "status_active" || sortBy === "status_inactive") {
         return "status";
      }
      if (sortBy === "newest" || sortBy === "oldest") {
         return "created_at";
      }
      if (sortBy === "name_asc" || sortBy === "name_desc") {
         return "name";
      }
      return (sortBy || "name_asc").split("_")[0];
   })();
   const sortOrder = (() => {
      if (sortBy === "status_active") return "desc";
      if (sortBy === "status_inactive") return "asc";
      if (sortBy === "newest") return "desc";
      if (sortBy === "oldest") return "asc";
      return (sortBy || "name_asc").split("_")[1] as "asc" | "desc";
   })();

   // Fetch pretty cash names from API with server-side pagination, search, filtering, and sorting
   const { data: prettyCashNamesData, isLoading } = useListPrettyCashNames(
      {
         page,
         limit: pageSize,
         search: searchQuery || undefined,
         status: normalizedStatus,
         sort_by: sortField,
         sort_order: sortOrder,
      },
      { enabled: true }
   );
   const deleteMutation = useDeletePrettyCashName();

   const filteredPrettyCashNames = prettyCashNamesData?.data || [];

   const totalPages = prettyCashNamesData?.pagination?.total_pages || 1;

   const handlePaginationChange = (updater: Updater<PaginationState>) => {
         if (typeof updater === "function") {
         const newState = updater({ pageIndex: page - 1, pageSize });
         setPage(newState.pageIndex + 1);
         setPageSize(newState.pageSize);
      } else {
         setPage(updater.pageIndex + 1);
         setPageSize(updater.pageSize);
      }
   };


   const handleDeleteClick = useCallback(
      (id: string | number) => {
         const target = (filteredPrettyCashNames as PrettyCashName[]).find(
            (item) => item.id === id
         );
         if (!target) return;

         const currentBalance = Number(target.current_balance ?? 0);
         if (currentBalance > 0) {
            toast.error("Cannot delete cash name with a current balance.");
            return;
         }

         setPrettyCashNameToDelete(id);
         setPrettyCashNamesToDelete([]);
         setDeleteModalOpen(true);
      },
      [filteredPrettyCashNames]
   );

   // Bulk actions handlers
   const handleBulkDelete = useCallback((items: PrettyCashName[]) => {
      const blocked = items.some(
         (item) => Number(item.current_balance ?? 0) > 0
      );
      if (blocked) {
         toast.error("Cannot delete cash names with a current balance.");
         return;
      }

      setPrettyCashNamesToDelete(items.map((item) => item.id));
      setPrettyCashNameToDelete(null);
      setDeleteModalOpen(true);
   }, []);

   const handleDeleteConfirm = useCallback(async () => {
      if (!prettyCashNameToDelete && prettyCashNamesToDelete.length === 0)
         return;

      setDeleteModalState("loading");
      try {
         if (prettyCashNameToDelete) {
            await deleteMutation.mutateAsync(prettyCashNameToDelete);
         } else if (prettyCashNamesToDelete.length > 0) {
            await Promise.all(
               prettyCashNamesToDelete.map((id) =>
                  deleteMutation.mutateAsync(id)
               )
            );
         }

         toast.success(
            prettyCashNameToDelete
               ? t("prettyCashNames.toast.deleteSuccess")
               : t("prettyCashNames.toast.deleteMultipleSuccess")
         );

         setSelectionResetSignal((prev) => prev + 1);
         setDeleteModalState("success");
         setTimeout(() => {
            setDeleteModalOpen(false);
            setPrettyCashNameToDelete(null);
            setPrettyCashNamesToDelete([]);
            setDeleteModalState("idle");
         }, 600);
      } catch (error) {
         let errorMessage = t("prettyCashNames.toast.deleteError");
         if (error instanceof Error && error.message) {
            errorMessage = error.message;
         }
         toast.error(errorMessage);
         setDeleteModalState("idle");
         setDeleteModalOpen(false);
         setPrettyCashNameToDelete(null);
         setPrettyCashNamesToDelete([]);
      }
   }, [prettyCashNameToDelete, prettyCashNamesToDelete, deleteMutation, t]);

   const handleDeleteCancel = useCallback(() => {
      if (deleteModalState === "loading") return;
      setDeleteModalOpen(false);
      setPrettyCashNameToDelete(null);
      setPrettyCashNamesToDelete([]);
      setDeleteModalState("idle");
   }, [deleteModalState]);

   // History handlers
   const handleViewHistory = useCallback((pettyCash: PrettyCashName) => {
      setSelectedPettyCashForHistory(pettyCash);
      setHistoryModalOpen(true);
   }, []);

   const handleExportHistory = useCallback(
      async (pettyCash: PrettyCashName) => {
         const accountId = pettyCash.account_id || pettyCash.id;
         if (!accountId) return;

         try {
            const blob = await financialAccountHistoryService.exportHistory(
               accountId,
               {},
               "xlsx"
            );

            // Create download link
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `${pettyCash.name || "petty_cash"}_history_${format(
               new Date(),
               "yyyy-MM-dd"
            )}.xlsx`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast.success(t("prettyCashNames.history.export.success"));
         } catch (error) {
            toast.error(
               error instanceof Error
                  ? error.message
                  : t("prettyCashNames.history.export.error")
            );
         }
      },
      [t]
   );

   const handleHistoryModalClose = useCallback(() => {
      setHistoryModalOpen(false);
      setSelectedPettyCashForHistory(null);
   }, []);

   // Floating action bar
   const renderFloatingBar = useCallback(
      (selectedCount: number, selectedData: PrettyCashName[]) => (
         <PrettyCashNamesFloatingActionBar
            selectedCount={selectedCount}
            selectedRows={selectedData}
            onEdit={(item) => onEdit?.(item)}
            onDelete={(items) => handleBulkDelete(items)}
            resetSignal={selectionResetSignal}
         />
      ),
      [handleBulkDelete, onEdit, selectionResetSignal]
   );

   const columns: ColumnDef<PrettyCashName>[] = useMemo(
      () => [
         // Selection checkbox column
         {
            id: "select",
            header: ({ table }) => (
               <Checkbox
                  checked={table.getIsAllPageRowsSelected()}
                  onChange={(e) =>
                     table.toggleAllPageRowsSelected(e.target.checked)
                  }
                  className="m-0 mb-0.5 me-0.5"
               />
            ),
            cell: ({ row }) => (
               <Checkbox
                  checked={row.getIsSelected()}
                  onChange={(e) => row.toggleSelected(e.target.checked)}
                  className="m-0 me-0.5"
               />
            ),
            size: 40,
         },
         // Name column
         {
            accessorKey: "name",
            header: () => (
               <span className="text-sm text-text-strong">
                  {t("prettyCashNames.table.name")}
               </span>
            ),
            cell: ({ getValue }) => (
               <p className="text-sm text-text-strong truncate">
                  {getValue() as string}
               </p>
            ),
         },
         // Balance column
         {
            accessorKey: "balance",
            header: () => (
               <span className="text-sm text-text-strong">
                  {t("prettyCashNames.table.balance")}
               </span>
            ),
            cell: ({ row }) => {
               const { opening_balance, current_balance, currency } =
                  row.original;
               const opening = Number(opening_balance ?? 0);
               const current = Number(current_balance ?? 0);
               return (
                  <div className="flex flex-wrap items-center gap-2 text-sm text-text-strong">
                     <span>Opening:</span>
                     <DirhamLabel value={opening.toLocaleString()} />
                     <span className="text-text-sub">|</span>
                     <span>Current:</span>
                     <DirhamLabel value={current.toLocaleString()} />
                  </div>
               );
            },
            size: 250,
         },
         // Status column
         {
            accessorKey: "status",
            header: () => (
               <span className="text-sm text-text-strong">
                  {t("prettyCashNames.table.status")}
               </span>
            ),
            cell: ({ getValue, row }) => {
               const status = row.original.status || getValue();
               // Normalize status to lowercase for translation key
               const normalizedStatus =
                  typeof status === "string"
                     ? status.toLowerCase()
                     : "inactive";
               const displayStatus =
                  normalizedStatus === "active"
                     ? "active"
                     : normalizedStatus === "inactive"
                     ? "inactive"
                     : "fullyPaid";
               return (
                  <StatusTag
                     label={t(`prettyCashNames.status.${displayStatus}`)}
                     variant={
                        displayStatus === "fullyPaid" ? "active" : displayStatus
                     }
                     className="border-border border flex items-center justify-center ps-1! pe-2! py-0.5!"
                  />
               );
            },
         },
         // Actions column
         {
            id: "actions",
            header: () => <div />,
            cell: ({ row }) => (
               <ActionsCell
                  prettyCashName={row.original}
                  onDelete={(item) => handleDeleteClick(item.id)}
                  onEdit={onEdit}
                  onViewHistory={handleViewHistory}
                  onExportHistory={handleExportHistory}
               />
            ),
            size: 64,
         },
      ],
      [t, handleDeleteClick, onEdit, handleViewHistory, handleExportHistory]
   );

   // Show loader while fetching data (after all hooks)
   if (isLoading) {
      return (
         <div className="w-full">
            <LoadingState size="medium" label={t("prettyCashNames.loading")} />
         </div>
      );
   }

   return (
      <>
         <DataTable
            data={filteredPrettyCashNames as PrettyCashName[]}
            columns={columns}
            enableRowSelection
            renderFloatingBar={renderFloatingBar}
            resetSelectionSignal={selectionResetSignal}
            showPagination={true}
            pageSize={pageSize}
            pageCount={totalPages}
            pagination={{ pageIndex: page - 1, pageSize }}
            onPaginationChange={handlePaginationChange}
            manualPagination={true}
         />
         <DeletePrettyCashNameModal
            isOpen={deleteModalOpen}
            onClose={handleDeleteCancel}
            onConfirm={handleDeleteConfirm}
            isLoading={deleteModalState === "loading"}
            isSuccess={deleteModalState === "success"}
         />
         <PettyCashHistoryModal
            isOpen={historyModalOpen}
            onClose={handleHistoryModalClose}
            pettyCash={selectedPettyCashForHistory}
         />
      </>
   );
}

export default PrettyCashNamesTab;
