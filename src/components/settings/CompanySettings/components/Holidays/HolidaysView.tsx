/** @format */

import { useState, useMemo, useCallback, useEffect } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import SearchInput from "@/designSystem/SearchInput";
import SortDropdown from "@/designSystem/SortDropdown";
import Button from "@/designSystem/Button";
import { AddLine } from "@/Icons";
import HolidaysTable from "./HolidaysTable";
import type { Holiday as ViewHoliday, SortOption } from "./types";
import { useHoliday } from "@/hooks/holidays/useHoliday";
import AddHolidayModal from "./AddHolidayModal";
import LoadingState from "@/designSystem/LoadingState";
import ConfirmModal from "@/designSystem/ConfirmModal";
// Import service type for modal compatibility if needed, though we will cast/map
import { Holiday as ServiceHoliday } from "@/services/holidayService";
import { usePermissions } from "@/contexts/PermissionContext";
import NoPermissionMessage from "@/components/common/NoPermissionMessage";
import { formatPermissionName } from "@/utilities/permissionFormatters";
import { useDebounce } from "@/hooks/useDebounce";
import type { PaginationState, Updater } from "@tanstack/react-table";

function HolidaysView() {
   const { t } = useTranslation("settings");
   const { can } = usePermissions();
   const canViewHolidays = can("read_holidays") || can("manage_holidays");
   const canManageHolidays = can("manage_holidays");
   const [sortBy, setSortBy] = useState<SortOption>("name");
   const [searchQuery, setSearchQuery] = useState("");
   const debouncedSearchQuery = useDebounce(searchQuery, 400);
   const [isAddModalOpen, setIsAddModalOpen] = useState(false);
   const [editingHoliday, setEditingHoliday] = useState<
      ServiceHoliday | undefined
   >(undefined);
   const [deletingHoliday, setDeletingHoliday] = useState<ViewHoliday | null>(
      null,
   );

   // Pagination state
   const [page, setPage] = useState(1);
   const [pageSize, setPageSize] = useState(20);

   // Fetch data
   const { useListHolidays, useDeleteHoliday } = useHoliday();
   const sortParamMap: Record<string, string> = {
      name: "name",
      startDate: "startDate",
      endDate: "endDate",
      duration: "durationDays",
   };

   // Reset page when search changes
   useEffect(() => {
      setPage(1);
   }, [debouncedSearchQuery]);

   const listFilters = useMemo(() => {
      return {
         page,
         limit: pageSize,
         search: debouncedSearchQuery || undefined,
         sort_by: sortParamMap[sortBy] || sortBy,
         order: "asc" as const,
      };
   }, [page, pageSize, debouncedSearchQuery, sortBy]);

   const { data: holidaysData, isLoading: isLoadingHolidays } =
      useListHolidays(listFilters);
   const deleteMutation = useDeleteHoliday();

   // Transform data for table
   const holidays = useMemo(() => {
      if (!holidaysData?.items) return [];
      return holidaysData.items.map((h) => ({
         ...h,
         // Ensure we produce a ViewHoliday compatible object
         // Convert string dates to Date objects for the view
         startDate: new Date(h.startDate),
         endDate: new Date(h.endDate),
         duration: h.durationDays,
         // Make sure id is string for ViewHoliday if strict, but let's assume number is handled or cast
         id: String(h.id),
      }));
   }, [holidaysData]);

   // Get pagination info from server response
   const totalPages = holidaysData?.pagination?.total_pages || 1;
   const totalCount = holidaysData?.pagination?.total || 0;

   // Pagination handler
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

   const sortOptions = [
      { id: "name", label: t("companySettings.holidays.sort.name") },
      { id: "startDate", label: t("companySettings.holidays.sort.startDate") },
      { id: "endDate", label: t("companySettings.holidays.sort.endDate") },
      { id: "duration", label: t("companySettings.holidays.sort.duration") },
   ];

   const handleSort = (optionId: string) => {
      setSortBy(optionId as SortOption);
   };

   const handleAddClick = () => {
      if (!canManageHolidays) return;
      setEditingHoliday(undefined);
      setIsAddModalOpen(true);
   };

   const handleEditClick = (holiday: ViewHoliday) => {
      if (!canManageHolidays) return;
      // Convert ViewHoliday back to ServiceHoliday shape for the modal
      // We know rawHolidays kept the original properties spread (...h)
      // So we can cast it if we assume extra props are there, or reconstruct
      // Since we don't have perfect type overlap, we'll construct the ServiceHoliday object
      // derived from ViewHoliday
      const holidayMeta = holiday as ViewHoliday & {
         locationId?: number | null;
         isPublic?: boolean;
         isRecurring?: boolean;
         description?: string;
      };
      const serviceHoliday: ServiceHoliday = {
         id: Number(holiday.id),
         name: holiday.name,
         startDate: holiday.startDate.toISOString(),
         endDate: holiday.endDate.toISOString(),
         durationDays: holiday.duration,
         locationId: holidayMeta.locationId || null,
         isPublic: holidayMeta.isPublic ?? true,
         isRecurring: holidayMeta.isRecurring ?? false,
         description: holidayMeta.description,
      };
      setEditingHoliday(serviceHoliday);
      setIsAddModalOpen(true);
   };

   const handleDeleteClick = (holiday: ViewHoliday) => {
      if (!canManageHolidays) return;
      setDeletingHoliday(holiday);
   };

   const confirmDelete = () => {
      if (!canManageHolidays) return;
      if (deletingHoliday) {
         deleteMutation.mutate(deletingHoliday.id, {
            onSuccess: () => setDeletingHoliday(null),
         });
      }
   };

   return (
      <div className="flex flex-col gap-6">
         {!canViewHolidays ? (
            <div className="p-6">
               <NoPermissionMessage
                  message={t(
                     "permissions.noReadAccess.title",
                     "Access Restricted",
                  )}
                  description={`${t("permissions.noReadAccess.message", "You don't have permission to view this section.")} (Missing: ${formatPermissionName("read_holidays")})`}
               />
            </div>
         ) : (
            <>
               {/* Header */}
               <div className="flex flex-col gap-1">
                  <h2 className="text-xl font-semibold text-text-strong">
                     {t("companySettings.holidays.title")}
                  </h2>
                  <p className="text-sm text-text-sub">
                     {t("companySettings.holidays.description")}
                  </p>
               </div>

               {/* Action Bar */}
               <div className="flex items-center justify-between">
                  <SearchInput
                     value={searchQuery}
                     onChange={setSearchQuery}
                     placeholder={t(
                        "companySettings.holidays.searchPlaceholder",
                     )}
                     className="max-w-60"
                  />
                  <div className="flex gap-3 items-center">
                     <SortDropdown
                        label={t("companySettings.holidays.sort.label")}
                        options={sortOptions}
                        onSelect={handleSort}
                        className="w-fit"
                     />
                     {canManageHolidays && (
                        <Button
                           onClick={handleAddClick}
                           className="px-3 py-2 gap-2">
                           <AddLine size={20} className="fill-text-main" />
                           <span className="whitespace-nowrap">
                              {t("companySettings.holidays.addButton")}
                           </span>
                        </Button>
                     )}
                  </div>
               </div>

               {/* Table */}
               {isLoadingHolidays ? (
                  <LoadingState size="large" label={t("loading.holidays")} />
               ) : (
                  <HolidaysTable
                     holidays={holidays as unknown as ViewHoliday[]}
                     onDelete={
                        canManageHolidays ? handleDeleteClick : undefined
                     }
                     onEdit={canManageHolidays ? handleEditClick : undefined}
                     globalFilter=""
                     pagination={{
                        pageIndex: page - 1,
                        pageSize,
                     }}
                     onPaginationChange={handlePaginationChange}
                     totalPages={totalPages}
                     totalCount={totalCount}
                     manualPagination={true}
                  />
               )}

               <AddHolidayModal
                  isOpen={isAddModalOpen}
                  onClose={() => setIsAddModalOpen(false)}
                  editingHoliday={editingHoliday}
               />

               <ConfirmModal
                  isOpen={!!deletingHoliday}
                  onClose={() => setDeletingHoliday(null)}
                  onConfirm={confirmDelete}
                  title={t("companySettings.holidays.modals.deleteTitle")}
                  description={t(
                     "companySettings.holidays.modals.deleteMessage",
                     {
                        name: deletingHoliday?.name,
                     },
                  )}
                  confirmText={t("common:actions.delete")}
                  cancelText={t("common:actions.cancel")}
                  variant="error"
                  isLoading={deleteMutation.isPending}
               />
            </>
         )}
      </div>
   );
}

export default HolidaysView;
