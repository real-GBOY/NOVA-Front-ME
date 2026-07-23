/** @format */

import { useMemo, useState, useCallback, useRef, useEffect } from "react";
import type { Updater } from "@tanstack/react-table";
import { ColumnDef } from "@tanstack/react-table";
import { ExpenseType } from "../types";
import { DataTable } from "@/designSystem/ui/data-table";
import Checkbox from "@/designSystem/Checkbox";
import StatusTag from "@/designSystem/StatusTag";
import Dropdown, { DropdownItem } from "@/designSystem/Dropdown";
import { useTranslation } from "@/hooks/useTranslation";
import { Edit, Trash, MoreVertical } from "@/Icons";
import ExpenseTypesFloatingActionBar from "./ExpenseTypesFloatingActionBar";
import DeleteExpenseTypeModal from "../modals/DeleteExpenseTypeModal";
import {
   useListExpenseTypes,
   useDeleteExpenseType,
} from "@/hooks/expenseTypes/useExpenseTypes";
import toast from "@/utilities/toast";
import { StatusFilters } from "../../../shared/StatusFilterDropdown";
import LoadingState from "@/designSystem/LoadingState";

interface ExpenseTypesTabProps {
   searchQuery: string;
   filters: StatusFilters;
   sortBy: string;
   onEdit: (expenseType: ExpenseType) => void;
}

// Actions Cell Component
function ActionsCell({
   expenseType,
   onDelete,
   onEdit,
}: {
   expenseType: ExpenseType;
   onDelete: (id: string | number) => void;
   onEdit?: (expenseType: ExpenseType) => void;
}) {
   const { t } = useTranslation("settings");
   const [isOpen, setIsOpen] = useState(false);
   const buttonRef = useRef<HTMLButtonElement>(null);

   const dropdownItems: DropdownItem[] = [
      {
         id: "edit",
         label: t("expenseTypes.actions.edit"),
         icon: Edit,
         onClick: () => {
            onEdit?.(expenseType);
            setIsOpen(false);
         },
         variant: "default",
      },
      {
         id: "delete",
         label: t("expenseTypes.actions.delete"),
         icon: Trash,
         onClick: () => {
            onDelete(expenseType.expense_type_id || expenseType.id!);
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
            aria-label={t("expenseTypes.actions.label")}
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

export default function ExpenseTypesTab({ searchQuery, filters, sortBy, onEdit }: ExpenseTypesTabProps) {
   const { t } = useTranslation("settings");
   const [deleteModalOpen, setDeleteModalOpen] = useState(false);
   const [expenseTypeToDelete, setExpenseTypeToDelete] = useState<
      string | number | null
   >(null);
   const [expenseTypesToDelete, setExpenseTypesToDelete] = useState<
      (string | number)[]
   >([]);
   const [selectionResetSignal, setSelectionResetSignal] = useState(0);
   const [deleteModalState, setDeleteModalState] = useState<
      "idle" | "loading" | "success"
   >("idle");

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
         return "type_name";
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

   // Fetch expense types from API
   const { data: expenseTypesResponse, isLoading } = useListExpenseTypes(
      {
         search: searchQuery || undefined,
         status: normalizedStatus,
         sort_by: sortField,
         sort_order: sortOrder,
      },
      { enabled: true }
   );

   // Delete mutation
   const deleteExpenseType = useDeleteExpenseType();

   // Get expense types from response
   const expenseTypesData = expenseTypesResponse?.data || [];

   const handleDeleteClick = useCallback((id: string | number) => {
      setExpenseTypeToDelete(id);
      setExpenseTypesToDelete([]);
      setDeleteModalOpen(true);
   }, []);

   const handleBulkDelete = useCallback((data: ExpenseType[]) => {
      setExpenseTypesToDelete(
         data.map((item) => item.expense_type_id || item.id!)
      );
      setExpenseTypeToDelete(null);
      setDeleteModalOpen(true);
   }, []);

   const handleDeleteConfirm = useCallback(async () => {
      if (!expenseTypeToDelete && expenseTypesToDelete.length === 0) return;

      setDeleteModalState("loading");
      try {
         if (expenseTypeToDelete) {
            await deleteExpenseType.mutateAsync(expenseTypeToDelete);
         } else if (expenseTypesToDelete.length > 0) {
            await Promise.all(
               expenseTypesToDelete.map((id) =>
                  deleteExpenseType.mutateAsync(id)
               )
            );
         }

         toast.success(
            expenseTypeToDelete
               ? t("expenseTypes.toast.deleteSuccess")
               : t("expenseTypes.toast.deleteMultipleSuccess")
         );

         setSelectionResetSignal((prev) => prev + 1);
         setDeleteModalState("success");
         setTimeout(() => {
            setDeleteModalOpen(false);
            setExpenseTypeToDelete(null);
            setExpenseTypesToDelete([]);
            setDeleteModalState("idle");
         }, 600);
      } catch (error) {
         let errorMessage = t("expenseTypes.toast.deleteError");
         if (error instanceof Error && error.message) {
            errorMessage = error.message;
         }
         toast.error(errorMessage);
         setDeleteModalState("idle");
         setDeleteModalOpen(false);
         setExpenseTypeToDelete(null);
         setExpenseTypesToDelete([]);
      }
   }, [expenseTypeToDelete, expenseTypesToDelete, deleteExpenseType, t]);

   const handleDeleteCancel = useCallback(() => {
      if (deleteModalState === "loading") return;
      setDeleteModalOpen(false);
      setExpenseTypeToDelete(null);
      setExpenseTypesToDelete([]);
      setDeleteModalState("idle");
   }, [deleteModalState]);

   // Column definitions
   const columns = useMemo<ColumnDef<ExpenseType>[]>(
      () => [
         {
            id: "select",
            header: ({ table }) => (
               <Checkbox
                  checked={table.getIsAllRowsSelected()}
                  onChange={table.getToggleAllRowsSelectedHandler()}
                  className="m-0 mb-0.5 me-0.5"
               />
            ),
            cell: ({ row }) => (
               <Checkbox
                  checked={row.getIsSelected()}
                  onChange={row.getToggleSelectedHandler()}
                  className="m-0 me-0.5"
               />
            ),
            size: 40,

         },
         {
            accessorKey: "name",
            header: () => (
               <span className="text-sm text-text-strong">
                  {t("expenseTypes.table.name")}
               </span>
            ),
            cell: ({ row }) => {
               const name = row.original.type_name || row.original.name;
               return (
                  <p className="text-sm text-text-strong truncate">{name}</p>
               );
            },
            size: 200,

         },
         {
            accessorKey: "description",
            header: () => (
               <span className="text-sm text-text-strong">
                  {t("expenseTypes.table.description")}
               </span>
            ),
            cell: ({ getValue }) => {
               const value = getValue() as string | undefined;
               return (
                  <p className="text-sm text-text-strong truncate">
                     {value || t("expenseTypes.table.noDescription")}
                  </p>
               );
            },
            size: 300,

         },
         {
            accessorKey: "status",
            header: () => (
               <span className="text-sm text-text-strong">
                  {t("expenseTypes.table.status")}
               </span>
            ),
            cell: ({ getValue }) => {
               const status = getValue() as string;
               const statusLower = status.toLowerCase() as
                  | "active"
                  | "inactive";
               return (
                  <StatusTag
                     variant={statusLower}
                     label={t(`expenseTypes.status.${statusLower}`)}
                     className="border-border border flex items-center justify-center ps-1! pe-2! py-0.5!"
                  />
               );
            },
            size: 230,

         },
         {
            id: "actions",
            header: () => <div />,
            cell: ({ row }) => (
               <ActionsCell
                  expenseType={row.original}
                  onDelete={handleDeleteClick}
                  onEdit={onEdit}
               />
            ),
            size: 64,
         },
      ],
      [t, handleDeleteClick, onEdit]
   );

   const filteredExpenseTypes = expenseTypesData;

   const [pagination, setPagination] = useState({
      pageIndex: 0,
      pageSize: 10,
   });

   useEffect(() => {
      setPagination((prev) => ({ ...prev, pageIndex: 0 }));
   }, [searchQuery, filters.status, sortBy]);

   const handlePaginationChange = (updater: Updater<typeof pagination>) => {
      setPagination((prev) => {
         if (typeof updater === "function") {
            return updater(prev);
         }
         return updater;
      });
   };

   const renderFloatingBar = useCallback(
      (selectedCount: number, selectedData: ExpenseType[]) => (
         <ExpenseTypesFloatingActionBar
            selectedCount={selectedCount}
            selectedRows={selectedData}
            onEdit={(expenseType) => onEdit?.(expenseType)}
            onDelete={(expenseTypes) => handleBulkDelete(expenseTypes)}
            resetSignal={selectionResetSignal}
         />
      ),
      [handleBulkDelete, onEdit, selectionResetSignal]
   );

   if (isLoading) {
      return (
         <LoadingState
            size="medium"
            label={t("expenseTypes.loading", "Loading expense types...")}
         />
      );
   }

   return (
      <>
         <DataTable
            data={filteredExpenseTypes as ExpenseType[]}
            columns={columns}
            enableRowSelection
            renderFloatingBar={renderFloatingBar}
            globalFilter=""
            translationNamespace="settings"
            resetSelectionSignal={selectionResetSignal}
            showPagination={true}
            pageSize={10}
            pagination={pagination}
            onPaginationChange={handlePaginationChange}
            manualPagination={false}
         />
         <DeleteExpenseTypeModal
            isOpen={deleteModalOpen}
            onClose={handleDeleteCancel}
            onConfirm={handleDeleteConfirm}
            isLoading={deleteModalState === "loading"}
            isSuccess={deleteModalState === "success"}
         />
      </>
   );
}
