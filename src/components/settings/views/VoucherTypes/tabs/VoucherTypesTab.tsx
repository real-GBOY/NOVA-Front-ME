/** @format */

import { useMemo, useState, useRef, useCallback, useEffect } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/designSystem/ui/data-table";
import type { Updater } from "@tanstack/react-table";
import { useTranslation } from "@/hooks/useTranslation";
import Checkbox from "@/designSystem/Checkbox";
import StatusTag from "@/designSystem/StatusTag";
import Dropdown, { DropdownItem } from "@/designSystem/Dropdown";
import { MoreVertical, Edit, Trash } from "@/Icons";
import { VoucherType } from "../types";
import VoucherTypesFloatingActionBar from "./VoucherTypesFloatingActionBar";
import DeleteVoucherTypeModal from "../modals/DeleteVoucherTypeModal";
import { useListVoucherTypes } from "@/hooks/voucherTypes/useVoucherTypes";
import { useDeleteVoucherType } from "@/hooks/voucherTypes/useVoucherTypes";
import toast from "@/utilities/toast";
import { StatusFilters } from "../../../shared/StatusFilterDropdown";
import LoadingState from "@/designSystem/LoadingState";

interface VoucherTypesTabProps {
   searchQuery: string;
   filters: StatusFilters;
   sortBy: string;
   onEdit: (voucherType: VoucherType) => void;
}

// Actions Cell Component
function ActionsCell({
   voucherType,
   onDelete,
   onEdit,
}: {
   voucherType: VoucherType;
   onDelete: (id: string) => void;
   onEdit?: (voucherType: VoucherType) => void;
}) {
   const { t } = useTranslation("settings");
   const [isOpen, setIsOpen] = useState(false);
   const buttonRef = useRef<HTMLButtonElement>(null);

   const dropdownItems: DropdownItem[] = [
      {
         id: "edit",
         label: t("voucherTypes.actions.edit"),
         icon: Edit,
         onClick: () => {
            onEdit?.(voucherType);
            setIsOpen(false);
         },
         variant: "default",
      },
      {
         id: "delete",
         label: t("voucherTypes.actions.delete"),
         icon: Trash,
         onClick: () => {
            onDelete(String(voucherType.id));
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
            aria-label={t("voucherTypes.actions.label")}
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

function VoucherTypesTab({ searchQuery, filters, sortBy, onEdit }: VoucherTypesTabProps) {
   const { t } = useTranslation("settings");
   const [deleteModalOpen, setDeleteModalOpen] = useState(false);
   const [voucherTypeToDelete, setVoucherTypeToDelete] = useState<
      string | number | null
   >(null);
   const [voucherTypesToDelete, setVoucherTypesToDelete] = useState<(string | number)[]>(
      []
   );
   const [selectionResetSignal, setSelectionResetSignal] = useState(0);
   const [deleteModalState, setDeleteModalState] = useState<
      "idle" | "loading" | "success"
   >("idle");

   const statusFilters = filters.status.length
      ? filters.status.map((status) =>
           status.charAt(0).toUpperCase() + status.slice(1)
        )
      : undefined;

   const sortField =
      sortBy === "newest" || sortBy === "oldest"
         ? "created_at"
         : (sortBy || "name_asc").split("_")[0];
   const sortOrder =
      sortBy === "newest"
         ? "desc"
         : sortBy === "oldest"
         ? "asc"
         : ((sortBy || "name_asc").split("_")[1] as "asc" | "desc");

   // Fetch voucher types from API
   const { data: voucherTypesData, isLoading } = useListVoucherTypes({
      search: searchQuery || undefined,
      status: statusFilters,
      sort_by: sortField,
      sort_order: sortOrder,
   });
   const deleteMutation = useDeleteVoucherType();

   const voucherTypesDataList = voucherTypesData?.data || [];

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

   const handleDeleteClick = useCallback((id: string | number) => {
      setVoucherTypeToDelete(id);
      setVoucherTypesToDelete([]);
      setDeleteModalOpen(true);
   }, []);

   // Bulk actions handlers
   const handleBulkDelete = useCallback((voucherTypes: VoucherType[]) => {
      setVoucherTypesToDelete(voucherTypes.map((item) => item.id));
      setVoucherTypeToDelete(null);
      setDeleteModalOpen(true);
   }, []);

   const handleDeleteConfirm = useCallback(async () => {
      if (!voucherTypeToDelete && voucherTypesToDelete.length === 0) return;

      setDeleteModalState("loading");
      try {
         if (voucherTypeToDelete) {
            await deleteMutation.mutateAsync(voucherTypeToDelete);
         } else if (voucherTypesToDelete.length > 0) {
            await Promise.all(
               voucherTypesToDelete.map((id) => deleteMutation.mutateAsync(id))
            );
         }

         toast.success(
            voucherTypeToDelete
               ? t("voucherTypes.toast.deleteSuccess")
               : t("voucherTypes.toast.deleteMultipleSuccess")
         );

         setSelectionResetSignal((prev) => prev + 1);
         setDeleteModalState("success");
         setTimeout(() => {
            setDeleteModalOpen(false);
            setVoucherTypeToDelete(null);
            setVoucherTypesToDelete([]);
            setDeleteModalState("idle");
         }, 600);
      } catch (error) {
         let errorMessage = t("voucherTypes.toast.deleteError");
         if (error instanceof Error && error.message) {
            errorMessage = error.message;
         }
         toast.error(errorMessage);
         setDeleteModalState("idle");
         setDeleteModalOpen(false);
         setVoucherTypeToDelete(null);
         setVoucherTypesToDelete([]);
      }
   }, [voucherTypeToDelete, voucherTypesToDelete, deleteMutation, t]);

   const handleDeleteCancel = useCallback(() => {
      if (deleteModalState === "loading") return;
      setDeleteModalOpen(false);
      setVoucherTypeToDelete(null);
      setVoucherTypesToDelete([]);
      setDeleteModalState("idle");
   }, [deleteModalState]);

   // Floating action bar
   const renderFloatingBar = useCallback(
      (selectedCount: number, selectedData: VoucherType[]) => (
         <VoucherTypesFloatingActionBar
            selectedCount={selectedCount}
            selectedRows={selectedData}
            onEdit={(voucherType) => onEdit?.(voucherType)}
            onDelete={(voucherTypes) => handleBulkDelete(voucherTypes)}
            resetSignal={selectionResetSignal}
         />
      ),
      [handleBulkDelete, onEdit, selectionResetSignal]
   );

   const columns: ColumnDef<VoucherType>[] = useMemo(
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
         // Voucher Type Name column
         {
            accessorKey: "name",
            header: () => (
               <span className="text-sm text-text-strong">
                  {t("voucherTypes.table.name")}
               </span>
            ),
            cell: ({ getValue }) => (
               <p className="text-sm text-text-strong truncate">
                  {getValue() as string}
               </p>
            ),

         },
         // Direction column
         {
            accessorKey: "direction",
            header: () => (
               <span className="text-sm text-text-strong">
                  {t("voucherTypes.table.direction")}
               </span>
            ),
            cell: ({ getValue }) => {
               const direction = getValue() as "to" | "from" | "both";
               return (
                  <p className="text-sm text-text-strong">
                     {t(`voucherTypes.direction.${direction}`)}
                  </p>
               );
            },

         },
         // Description column
         {
            accessorKey: "description",
            header: () => (
               <span className="text-sm text-text-strong">
                  {t("voucherTypes.table.description")}
               </span>
            ),
            cell: ({ getValue }) => (
               <p className="text-sm text-text-strong truncate">
                  {getValue() as string}
               </p>
            ),
            size: 321,

         },
         // Status column
         {
            accessorKey: "status",
            header: () => (
               <span className="text-sm text-text-strong">
                  {t("voucherTypes.table.status")}
               </span>
            ),
            cell: ({ getValue }) => {
               const status = getValue() as "active" | "inactive" | "fullyPaid";
               return (
                  <StatusTag
                     label={t(`voucherTypes.status.${status}`)}
                     variant={status === "fullyPaid" ? "active" : status}
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
                  voucherType={row.original}
                  onDelete={handleDeleteClick}
                  onEdit={onEdit}
               />
            ),
            size: 64,
         },
      ],
      [t, handleDeleteClick, onEdit]
   );

   // Show loader while fetching data (after all hooks)
   if (isLoading) {
      return (
         <div className="w-full">
            <LoadingState size="medium" label={t("voucherTypes.loading")} />
         </div>
      );
   }

   return (
      <>
            <DataTable
               data={voucherTypesDataList as VoucherType[]}
               columns={columns}
               enableRowSelection
               renderFloatingBar={renderFloatingBar}
               resetSelectionSignal={selectionResetSignal}
               showPagination={true}
               pageSize={10}
               pagination={pagination}
               onPaginationChange={handlePaginationChange}
               manualPagination={false}
            />
         <DeleteVoucherTypeModal
            isOpen={deleteModalOpen}
            onClose={handleDeleteCancel}
            onConfirm={handleDeleteConfirm}
            isLoading={deleteModalState === "loading"}
            isSuccess={deleteModalState === "success"}
         />
      </>
   );
}

export default VoucherTypesTab;
