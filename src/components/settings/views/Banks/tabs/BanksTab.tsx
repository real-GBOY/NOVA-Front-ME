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
import { Bank } from "../types";
import BanksFloatingActionBar from "./BanksFloatingActionBar";
import DeleteBankModal from "../modals/DeleteBankModal";
import BankHistoryModal from "../modals/BankHistoryModal";
import financialAccountHistoryService from "@/services/financialAccountHistoryService";
import { format } from "date-fns";
import { useListBanks, useDeleteBank } from "@/hooks/banks/useBanks";
import toast from "@/utilities/toast";
import { StatusFilters } from "../../../shared/StatusFilterDropdown";
import LoadingState from "@/designSystem/LoadingState";

interface BanksTabProps {
   searchQuery: string;
   filters: StatusFilters;
   sortBy: string;
   onEdit: (bank: Bank) => void;
}

// Actions Cell Component
function ActionsCell({
   bank,
   onDelete,
   onEdit,
   onViewHistory,
   onExportHistory,
}: {
   bank: Bank;
   onDelete: (item: Bank) => void;
   onEdit?: (bank: Bank) => void;
   onViewHistory?: (bank: Bank) => void;
   onExportHistory?: (bank: Bank) => void;
}) {
   const { t } = useTranslation("settings");
   const [isOpen, setIsOpen] = useState(false);
   const buttonRef = useRef<HTMLButtonElement>(null);

   const dropdownItems: DropdownItem[] = [
      {
         id: "history",
         label: t("banks.actions.viewHistory"),
         icon: TimeLine,
         onClick: () => {
            onViewHistory?.(bank);
            setIsOpen(false);
         },
         variant: "default",
      },
      {
         id: "exportHistory",
         label: t("banks.actions.exportHistory"),
         icon: FileExport,
         onClick: () => {
            onExportHistory?.(bank);
            setIsOpen(false);
         },
         variant: "default",
      },
      {
         id: "edit",
         label: t("banks.actions.edit"),
         icon: Edit,
         onClick: () => {
            onEdit?.(bank);
            setIsOpen(false);
         },
         variant: "default",
      },
      {
         id: "delete",
         label: t("banks.actions.delete"),
         icon: Trash,
         onClick: () => {
            onDelete(bank);
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
            aria-label={t("banks.actions.label")}
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

function BanksTab({ searchQuery, filters, sortBy, onEdit }: BanksTabProps) {
   const { t } = useTranslation("settings");
   const [deleteModalOpen, setDeleteModalOpen] = useState(false);
   const [bankToDelete, setBankToDelete] = useState<string | number | null>(
      null
   );
   const [banksToDelete, setBanksToDelete] = useState<(string | number)[]>([]);
   const [selectionResetSignal, setSelectionResetSignal] = useState(0);
   const [deleteModalState, setDeleteModalState] = useState<
      "idle" | "loading" | "success"
   >("idle");

   // History modal state
   const [historyModalOpen, setHistoryModalOpen] = useState(false);
   const [selectedBankForHistory, setSelectedBankForHistory] =
      useState<Bank | null>(null);

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
         return "bank_name";
      }
      return (sortBy || "name_asc").split("_")[0];
   })();
   const sortDirection = (() => {
      if (sortBy === "status_active") return "desc";
      if (sortBy === "status_inactive") return "asc";
      if (sortBy === "newest") return "desc";
      if (sortBy === "oldest") return "asc";
      return (sortBy || "name_asc").split("_")[1] as "asc" | "desc";
   })();

   // Fetch banks from API with server-side pagination, search, filtering, and sorting
   const { data: banksData, isLoading } = useListBanks(
      {
         page,
         limit: pageSize,
         search: searchQuery || undefined,
         status: normalizedStatus,
         sort_by: sortField,
         sort_order: sortDirection,
      },
      { enabled: true }
   );
   const deleteMutation = useDeleteBank();

   const filteredBanks = banksData?.data || [];

   const totalPages = banksData?.pagination?.total_pages || 1;

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
         const target = (filteredBanks as Bank[]).find(
            (item) => item.id === id
         );
         if (!target) return;

         const currentBalance = Number(target.current_balance ?? 0);
         if (currentBalance > 0) {
            toast.error("Cannot delete bank with a current balance.");
            return;
         }

         setBankToDelete(id);
         setBanksToDelete([]);
         setDeleteModalOpen(true);
      },
      [filteredBanks]
   );

   // Bulk actions handlers
   const handleBulkDelete = useCallback((banks: Bank[]) => {
      const blocked = banks.some(
         (bank) => Number(bank.current_balance ?? 0) > 0
      );
      if (blocked) {
         toast.error("Cannot delete banks with a current balance.");
         return;
      }

      setBanksToDelete(banks.map((item) => item.id));
      setBankToDelete(null);
      setDeleteModalOpen(true);
   }, []);

   const handleDeleteConfirm = useCallback(async () => {
      if (!bankToDelete && banksToDelete.length === 0) return;

      setDeleteModalState("loading");
      try {
         if (bankToDelete) {
            await deleteMutation.mutateAsync(bankToDelete);
         } else if (banksToDelete.length > 0) {
            await Promise.all(
               banksToDelete.map((id) => deleteMutation.mutateAsync(id))
            );
         }

         toast.success(
            bankToDelete
               ? t("banks.toast.deleteSuccess")
               : t("banks.toast.deleteMultipleSuccess")
         );

         setSelectionResetSignal((prev) => prev + 1);
         setDeleteModalState("success");
         setTimeout(() => {
            setDeleteModalOpen(false);
            setBankToDelete(null);
            setBanksToDelete([]);
            setDeleteModalState("idle");
         }, 600);
      } catch (error) {
         let errorMessage = t("banks.toast.deleteError");
         if (error instanceof Error && error.message) {
            errorMessage = error.message;
         }
         toast.error(errorMessage);
         setDeleteModalOpen(false);
         setBankToDelete(null);
         setBanksToDelete([]);
         setDeleteModalState("idle");
      }
   }, [bankToDelete, banksToDelete, deleteMutation, t]);

   const handleDeleteCancel = useCallback(() => {
      if (deleteModalState === "loading") return;
      setDeleteModalOpen(false);
      setBankToDelete(null);
      setBanksToDelete([]);
      setDeleteModalState("idle");
   }, [deleteModalState]);

   // History handlers
   const handleViewHistory = useCallback((bank: Bank) => {
      setSelectedBankForHistory(bank);
      setHistoryModalOpen(true);
   }, []);

   const handleExportHistory = useCallback(
      async (bank: Bank) => {
         const accountId = bank.account_id || bank.id;
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
            link.download = `${bank.name || "bank"}_history_${format(
               new Date(),
               "yyyy-MM-dd"
            )}.xlsx`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast.success(t("banks.history.export.success"));
         } catch (error) {
            toast.error(
               error instanceof Error
                  ? error.message
                  : t("banks.history.export.error")
            );
         }
      },
      [t]
   );

   const handleHistoryModalClose = useCallback(() => {
      setHistoryModalOpen(false);
      setSelectedBankForHistory(null);
   }, []);

   // Floating action bar
   const renderFloatingBar = useCallback(
      (selectedCount: number, selectedData: Bank[]) => (
         <BanksFloatingActionBar
            selectedCount={selectedCount}
            selectedRows={selectedData}
            onEdit={(bank) => onEdit?.(bank)}
            onDelete={(banks) => handleBulkDelete(banks)}
            resetSignal={selectionResetSignal}
         />
      ),
      [handleBulkDelete, onEdit, selectionResetSignal]
   );

   const columns: ColumnDef<Bank>[] = useMemo(
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
         // Bank Name column
         {
            accessorKey: "name",
            header: () => (
               <span className="text-sm text-text-strong">
                  {t("banks.table.name")}
               </span>
            ),
            cell: ({ getValue }) => (
               <p className="text-sm text-text-strong truncate">
                  {getValue() as string}
               </p>
            ),
         },
         // Short Code column
         {
            accessorKey: "shortCode",
            header: () => (
               <span className="text-sm text-text-strong">
                  {t("banks.table.shortCode")}
               </span>
            ),
            cell: ({ getValue }) => (
               <p className="text-sm text-text-strong">
                  {getValue() as string}
               </p>
            ),
            meta: { className: "hidden md:table-cell" },
         },
         // Balance column
         {
            accessorKey: "balance",
            header: () => (
               <span className="text-sm text-text-strong">
                  {t("banks.table.balance")}
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
                  {t("banks.table.status")}
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
                  normalizedStatus === "active" ? "active" : "inactive";
               return (
                  <StatusTag
                     label={t(`banks.status.${displayStatus}`)}
                     variant={displayStatus}
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
                  bank={row.original}
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
            <LoadingState size="medium" label={t("banks.loading")} />
         </div>
      );
   }

   return (
      <>
         <DataTable
            data={filteredBanks as Bank[]}
            columns={columns}
            enableRowSelection
            renderFloatingBar={renderFloatingBar}
            translationNamespace="settings"
            resetSelectionSignal={selectionResetSignal}
            showPagination={true}
            pageSize={pageSize}
            pageCount={totalPages}
            pagination={{ pageIndex: page - 1, pageSize }}
            onPaginationChange={handlePaginationChange}
            manualPagination={true}
         />
         <DeleteBankModal
            isOpen={deleteModalOpen}
            onClose={handleDeleteCancel}
            onConfirm={handleDeleteConfirm}
            isLoading={deleteModalState === "loading"}
            isSuccess={deleteModalState === "success"}
         />
         <BankHistoryModal
            isOpen={historyModalOpen}
            onClose={handleHistoryModalClose}
            bank={selectedBankForHistory}
         />
      </>
   );
}

export default BanksTab;
