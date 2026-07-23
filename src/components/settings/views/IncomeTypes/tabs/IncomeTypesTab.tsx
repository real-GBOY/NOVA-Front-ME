/** @format */

import { useMemo, useState, useCallback, useRef, useEffect } from "react";
import type { Updater } from "@tanstack/react-table";
import { ColumnDef } from "@tanstack/react-table";
import { IncomeType } from "../../types";
import { DataTable } from "@/designSystem/ui/data-table";
import Checkbox from "@/designSystem/Checkbox";
import Dropdown, { DropdownItem } from "@/designSystem/Dropdown";
import { useTranslation } from "@/hooks/useTranslation";
import { Edit, Trash, MoreVertical } from "@/Icons";
import IncomeTypesFloatingActionBar from "./IncomeTypesFloatingActionBar";
import DeleteIncomeTypeModal from "../modals/DeleteIncomeTypeModal";
import {
   useListIncomeTypes,
   useDeleteIncomeType,
} from "@/hooks/incomeTypes/useIncomeTypes";
import toast from "@/utilities/toast";
import LoadingState from "@/designSystem/LoadingState";

interface IncomeTypesTabProps {
   searchQuery: string;
   sortBy: string;
   onEdit: (incomeType: IncomeType) => void;
}

// Actions Cell Component
function ActionsCell({
   incomeType,
   onDelete,
   onEdit,
}: {
   incomeType: IncomeType;
   onDelete: (id: string | number) => void;
   onEdit?: (incomeType: IncomeType) => void;
}) {
   const { t } = useTranslation("settings");
   const [isOpen, setIsOpen] = useState(false);
   const buttonRef = useRef<HTMLButtonElement>(null);

   const dropdownItems: DropdownItem[] = [
      {
         id: "edit",
         label: t("incomeTypes.actions.edit") || "Edit",
         icon: Edit,
         onClick: () => {
            onEdit?.(incomeType);
            setIsOpen(false);
         },
         variant: "default",
      },
      {
         id: "delete",
         label: t("incomeTypes.actions.delete") || "Delete",
         icon: Trash,
         onClick: () => {
            onDelete(incomeType.income_type_id || incomeType.id!);
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
            aria-label={t("incomeTypes.actions.label") || "Actions"}
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

export default function IncomeTypesTab({ searchQuery, sortBy, onEdit }: IncomeTypesTabProps) {
   const { t } = useTranslation("settings");
   const [deleteModalOpen, setDeleteModalOpen] = useState(false);
   const [incomeTypeToDelete, setIncomeTypeToDelete] = useState<
      string | number | null
   >(null);
   const [incomeTypesToDelete, setIncomeTypesToDelete] = useState<
      (string | number)[]
   >([]);
   const [selectionResetSignal, setSelectionResetSignal] = useState(0);
   const [deleteModalState, setDeleteModalState] = useState<
      "idle" | "loading" | "success"
   >("idle");

   const sortField =
      sortBy === "newest" || sortBy === "oldest"
         ? "income_type_id"
         : sortBy === "name_asc" || sortBy === "name_desc"
         ? "type_name"
         : (sortBy || "name_asc").split("_")[0];
   const sortOrder =
      sortBy === "newest"
         ? "desc"
         : sortBy === "oldest"
         ? "asc"
         : ((sortBy || "name_asc").split("_")[1] as "asc" | "desc");

   // Fetch income types from API
   const { data: incomeTypesResponse, isLoading } = useListIncomeTypes(
      {
         search: searchQuery || undefined,
         sort_by: sortField,
         sort_order: sortOrder,
      },
      { enabled: true }
   );

   // Delete mutation
   const deleteIncomeType = useDeleteIncomeType();

   // Get income types from response
   const incomeTypesData = incomeTypesResponse?.data || [];

   const handleDeleteClick = useCallback((id: string | number) => {
      setIncomeTypeToDelete(id);
      setIncomeTypesToDelete([]);
      setDeleteModalOpen(true);
   }, []);

   const handleBulkDelete = useCallback((data: IncomeType[]) => {
      setIncomeTypesToDelete(
         data.map((item) => item.income_type_id || item.id!)
      );
      setIncomeTypeToDelete(null);
      setDeleteModalOpen(true);
   }, []);

   const handleDeleteConfirm = useCallback(async () => {
      if (!incomeTypeToDelete && incomeTypesToDelete.length === 0) return;

      setDeleteModalState("loading");
      try {
         if (incomeTypeToDelete) {
            await deleteIncomeType.mutateAsync(incomeTypeToDelete);
         } else if (incomeTypesToDelete.length > 0) {
            await Promise.all(
               incomeTypesToDelete.map((id) =>
                  deleteIncomeType.mutateAsync(id)
               )
            );
         }

         toast.success(
            incomeTypeToDelete
               ? t("incomeTypes.toast.deleteSuccess") || "Income Type deleted successfully"
               : t("incomeTypes.toast.deleteMultipleSuccess") || "Income Types deleted successfully"
         );

         setSelectionResetSignal((prev) => prev + 1);
         setDeleteModalState("success");
         setTimeout(() => {
            setDeleteModalOpen(false);
            setIncomeTypeToDelete(null);
            setIncomeTypesToDelete([]);
            setDeleteModalState("idle");
         }, 600);
      } catch (error) {
         let errorMessage = t("incomeTypes.toast.deleteError") || "Error deleting Income Type";
         if (error instanceof Error && error.message) {
            errorMessage = error.message;
         }
         toast.error(errorMessage);
         setDeleteModalState("idle");
         setDeleteModalOpen(false);
         setIncomeTypeToDelete(null);
         setIncomeTypesToDelete([]);
      }
   }, [incomeTypeToDelete, incomeTypesToDelete, deleteIncomeType, t]);

   const handleDeleteCancel = useCallback(() => {
      if (deleteModalState === "loading") return;
      setDeleteModalOpen(false);
      setIncomeTypeToDelete(null);
      setIncomeTypesToDelete([]);
      setDeleteModalState("idle");
   }, [deleteModalState]);

   // Column definitions
   const columns = useMemo<ColumnDef<IncomeType>[]>(
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
                  {t("incomeTypes.table.name") || "Name"}
               </span>
            ),
            cell: ({ row }) => {
               const name = row.original.type_name || row.original.name;
               return (
                  <p className="text-sm text-text-strong truncate">{name}</p>
               );
            },
            size: 300,

         },
         {
            accessorKey: "income_code",
            header: () => (
               <span className="text-sm text-text-strong">
                  {t("incomeTypes.table.incomeCode") ||
                     t("incomeTypes.table.glCode") ||
                     "Income Code"}
               </span>
            ),
            cell: ({ row }) => {
               const value =
                  row.original.income_code || row.original.gl_code || "-";
               return (
                  <p className="text-sm text-text-strong truncate">
                     {value}
                  </p>
               );
            },
            size: 200,

         },
         {
            id: "actions",
            header: () => <div />,
            cell: ({ row }) => (
               <ActionsCell
                  incomeType={row.original}
                  onDelete={handleDeleteClick}
                  onEdit={onEdit}
               />
            ),
            size: 64,
         },
      ],
      [t, handleDeleteClick, onEdit]
   );

   const filteredIncomeTypes = incomeTypesData;

   const [pagination, setPagination] = useState({
      pageIndex: 0,
      pageSize: 10,
   });

   useEffect(() => {
      setPagination((prev) => ({ ...prev, pageIndex: 0 }));
   }, [searchQuery, sortBy]);

   const handlePaginationChange = (updater: Updater<typeof pagination>) => {
      setPagination((prev) => {
         if (typeof updater === "function") {
            return updater(prev);
         }
         return updater;
      });
   };

   const renderFloatingBar = useCallback(
      (selectedCount: number, selectedData: IncomeType[]) => (
         <IncomeTypesFloatingActionBar
            selectedCount={selectedCount}
            selectedRows={selectedData}
            onEdit={(incomeType) => onEdit?.(incomeType)}
            onDelete={(incomeTypes) => handleBulkDelete(incomeTypes)}
            resetSignal={selectionResetSignal}
         />
      ),
      [handleBulkDelete, onEdit, selectionResetSignal]
   );

   if (isLoading) {
      return (
         <LoadingState
            size="medium"
            label={t("incomeTypes.loading", "Loading income types...")}
         />
      );
   }

   return (
      <>
         <DataTable
            data={filteredIncomeTypes as IncomeType[]}
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
         <DeleteIncomeTypeModal
            isOpen={deleteModalOpen}
            onClose={handleDeleteCancel}
            onConfirm={handleDeleteConfirm}
            isLoading={deleteModalState === "loading"}
            isSuccess={deleteModalState === "success"}
         />
      </>
   );
}
