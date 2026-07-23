/** @format */

import { useMemo, useRef, useState, useCallback } from "react";
import { ColumnDef, PaginationState, Updater } from "@tanstack/react-table";
import { DataTable } from "@/designSystem/ui/data-table";
import Checkbox from "@/designSystem/Checkbox";
import Dropdown from "@/designSystem/Dropdown";
import { MoreVertical, Trash, CalendarLine, ClockTwo } from "@/Icons";
import { useTranslation } from "@/hooks/useTranslation";
import type { Holiday } from "./types";

type HolidaysTableProps = {
   holidays: Holiday[];
   onDelete?: (holiday: Holiday) => void;
   onEdit?: (holiday: Holiday) => void;
   globalFilter?: string;
   pagination?: PaginationState;
   onPaginationChange?: (updater: Updater<PaginationState>) => void;
   totalPages?: number;
   totalCount?: number;
   manualPagination?: boolean;
};

// Actions Cell Component
function ActionCell({
   holiday,
   onDelete,
   onEdit,
}: {
   holiday: Holiday;
   onDelete?: (holiday: Holiday) => void;
   onEdit?: (holiday: Holiday) => void;
}) {
   const menuButtonRef = useRef<HTMLButtonElement>(null);
   const [isDropdownOpen, setIsDropdownOpen] = useState(false);
   const { t } = useTranslation("settings");

   const dropdownItems = [];

   if (onEdit) {
      dropdownItems.push({
         id: "edit",
         label: t("companySettings.holidays.actions.edit"),
         icon: CalendarLine,
         onClick: () => {
            onEdit(holiday);
            setIsDropdownOpen(false);
         },
      });
   }

   if (onDelete) {
      dropdownItems.push({
         id: "delete",
         label: t("companySettings.holidays.actions.delete"),
         icon: Trash,
         variant: "danger" as const,
         onClick: () => {
            onDelete(holiday);
            setIsDropdownOpen(false);
         },
      });
   }

   if (dropdownItems.length === 0) return null;

   return (
      <div className="relative flex justify-end gap-2">
         {onDelete && (
            <button
               onClick={() => onDelete(holiday)}
               className="flex items-center justify-center p-1.5 bg-background border border-border rounded-lg shrink-0 transition-colors hover:bg-bg-weak"
               aria-label={t("companySettings.holidays.actions.delete")}>
               <Trash size={20} className="fill-icon-sub" />
            </button>
         )}
         <button
            ref={menuButtonRef}
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            data-row-menu-trigger
            className={`flex items-center justify-center p-1.5 bg-background border border-border rounded-lg shrink-0 transition-colors hover:bg-bg-weak ${
               isDropdownOpen ? "bg-bg-weak" : ""
            }`}
            aria-label={t("companySettings.holidays.actions.more")}>
            <MoreVertical size={20} className="fill-icon-sub" />
         </button>
         <Dropdown
            items={dropdownItems}
            isOpen={isDropdownOpen}
            onClose={() => setIsDropdownOpen(false)}
            anchorRef={menuButtonRef}
         />
      </div>
   );
}

function HolidaysTable({
   holidays,
   onDelete,
   onEdit,
   globalFilter = "",
   pagination,
   onPaginationChange,
   totalPages,
   totalCount,
   manualPagination = false,
}: HolidaysTableProps) {
   const { t } = useTranslation("settings");

   const formatDate = (date: Date) => {
      return new Intl.DateTimeFormat("en-GB", {
         day: "numeric",
         month: "short",
         year: "numeric",
      }).format(date);
   };

   const formatDuration = useCallback(
      (days: number) => {
         if (days === 1) {
            return t("companySettings.holidays.duration.oneDay");
         }
         return t("companySettings.holidays.duration.multipleDays", {
            count: days,
         });
      },
      [t],
   );

   const columns: ColumnDef<Holiday>[] = useMemo(
      () => [
         {
            id: "select",
            header: ({ table }) => (
               <Checkbox
                  checked={table.getIsAllPageRowsSelected()}
                  onChange={(e) =>
                     table.toggleAllPageRowsSelected(e.target.checked)
                  }
               />
            ),
            cell: ({ row }) => (
               <Checkbox
                  checked={row.getIsSelected()}
                  onChange={(e) => row.toggleSelected(e.target.checked)}
               />
            ),
            size: 40,
            enableSorting: false,
         },
         {
            accessorKey: "name",
            header: () => (
               <div className="flex items-center gap-2">
                  <span>{t("companySettings.holidays.table.name")}</span>
               </div>
            ),
            cell: ({ row }) => (
               <span className="text-sm font-normal text-text-strong">
                  {row.original.name}
               </span>
            ),
            enableSorting: true,
         },
         {
            accessorKey: "startDate",
            header: () => (
               <div className="flex items-center gap-2">
                  <CalendarLine size={16} className="fill-icon-sub" />
                  <span>{t("companySettings.holidays.table.startDate")}</span>
               </div>
            ),
            cell: ({ row }) => (
               <span className="text-sm font-normal text-text-strong">
                  {formatDate(row.original.startDate)}
               </span>
            ),
            enableSorting: true,
            sortingFn: "datetime",
         },
         {
            accessorKey: "endDate",
            header: () => (
               <div className="flex items-center gap-2">
                  <CalendarLine size={16} className="fill-icon-sub" />
                  <span>{t("companySettings.holidays.table.endDate")}</span>
               </div>
            ),
            cell: ({ row }) => (
               <span className="text-sm font-normal text-text-strong">
                  {formatDate(row.original.endDate)}
               </span>
            ),
            enableSorting: true,
            sortingFn: "datetime",
         },
         {
            accessorKey: "duration",
            header: () => (
               <div className="flex items-center gap-2">
                  <ClockTwo size={16} className="fill-icon-sub" />
                  <span>{t("companySettings.holidays.table.duration")}</span>
               </div>
            ),
            cell: ({ row }) => (
               <span className="text-sm font-normal text-text-strong">
                  {formatDuration(row.original.duration)}
               </span>
            ),
            enableSorting: true,
         },
         {
            id: "actions",
            header: "",
            cell: ({ row }) => (
               <ActionCell
                  holiday={row.original}
                  onDelete={onDelete}
                  onEdit={onEdit}
               />
            ),
            size: 120,
            enableSorting: false,
         },
      ],
      [t, onDelete, onEdit, formatDuration],
   );

   return (
      <DataTable
         columns={columns}
         data={holidays}
         pageSize={pagination?.pageSize || 20}
         globalFilter={globalFilter}
         enableRowSelection={true}
         translationNamespace="settings"
         pagination={pagination}
         onPaginationChange={onPaginationChange}
         manualPagination={manualPagination}
         pageCount={totalPages}
      />
   );
}

export default HolidaysTable;
