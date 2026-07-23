/** @format */

import { useState, useMemo } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import SearchInput from "@/designSystem/SearchInput";
import SortDropdown from "@/designSystem/SortDropdown";
import Button from "@/designSystem/Button";
import { AddLine } from "@/Icons";
import ShiftsTable from "./ShiftsTable";
import type { ViewShift, SortOption } from "./types";
import { transformShiftToView } from "./types";
import { useShifts } from "@/hooks/shifts/useShifts";
import LoadingState from "@/designSystem/LoadingState";
import AddShiftModal from "./AddShiftModal";
import EditShiftModal from "./EditShiftModal";
import AssignEmployeesModal from "./AssignEmployeesModal";
import ViewShiftDetailsModal from "./ViewShiftDetailsModal";
import ViewShiftAssignmentsModal from "./ViewShiftAssignmentsModal";
import ConfirmModal from "@/designSystem/ConfirmModal";
import { usePermissions } from "@/contexts/PermissionContext";
import NoPermissionMessage from "@/components/common/NoPermissionMessage";
import { formatPermissionName } from "@/utilities/permissionFormatters";
import { useDebounce } from "@/hooks/useDebounce";

function ShiftsView() {
   const { t } = useTranslation("settings");
   const { t: tCommon } = useTranslation("common");
   const { can } = usePermissions();
   const [sortBy, setSortBy] = useState<SortOption>("name");
   const [searchQuery, setSearchQuery] = useState("");
   const debouncedSearchQuery = useDebounce(searchQuery, 400);
   const [isAddModalOpen, setIsAddModalOpen] = useState(false);
   const [editingShift, setEditingShift] = useState<ViewShift | null>(null);
   const [archivingShift, setArchivingShift] = useState<ViewShift | null>(null);
   const [viewingShift, setViewingShift] = useState<ViewShift | null>(null);
   const [assigningShift, setAssigningShift] = useState<ViewShift | null>(null);
   const [viewingAssignments, setViewingAssignments] =
      useState<ViewShift | null>(null);

   const { useArchiveShift } = useShifts();
   const archiveMutation = useArchiveShift();

   const canViewShifts =
      can("shift.view") || can("shift.manage") || can("shift.assign");
   const canManageShifts = can("shift.manage");
   const canAssignShifts = can("shift.assign") || canManageShifts;

   // Fetch data
   const { useListShifts } = useShifts();
   const sortParamMap: Record<string, string> = {
      name: "name",
      timezone: "timezone",
      workingDaysCount: "working_days_mask",
   };
   const { data: shiftsData, isLoading: isLoadingShifts } = useListShifts({
      search: debouncedSearchQuery || undefined,
      sort_by: sortParamMap[sortBy] || sortBy,
      order: "asc",
   });

   // Transform data for table
   const rawShifts = useMemo(() => {
      if (!shiftsData?.data) return [];
      return shiftsData.data.map(transformShiftToView);
   }, [shiftsData]);

   const processedShifts = rawShifts;

   const sortOptions = [
      { id: "name", label: t("companySettings.shifts.sort.name") },
      { id: "timezone", label: t("companySettings.shifts.sort.timezone") },
      {
         id: "workingDaysCount",
         label: t("companySettings.shifts.sort.workingDays"),
      },
   ];

   const handleSort = (optionId: string) => {
      setSortBy(optionId as SortOption);
   };

   const handleAddClick = () => {
      setIsAddModalOpen(true);
   };

   const handleViewDetails = (shift: ViewShift) => {
      setViewingShift(shift);
   };

   const handleEdit = (shift: ViewShift) => {
      setEditingShift(shift);
   };

   const handleArchive = (shift: ViewShift) => {
      setArchivingShift(shift);
   };

   const handleConfirmArchive = async () => {
      if (!archivingShift) return;
      try {
         await archiveMutation.mutateAsync(parseInt(archivingShift.id, 10));
         setArchivingShift(null);
      } catch (error) {
         console.error("Error archiving shift:", error);
      }
   };

   const handleAssignEmployees = (shift: ViewShift) => {
      setAssigningShift(shift);
   };

   const handleViewAssignments = (shift: ViewShift) => {
      setViewingAssignments(shift);
   };

   if (!canViewShifts) {
      return (
         <div className="p-6">
            <NoPermissionMessage
               message={t(
                  "permissions.noReadAccess.title",
                  "Access Restricted",
               )}
               description={`${t(
                  "permissions.noReadAccess.message",
                  "You don't have permission to view this section.",
               )} (Missing: ${formatPermissionName("shift.view")})`}
            />
         </div>
      );
   }

   return (
      <div className="flex flex-col gap-6">
         {/* Header */}
         <div className="flex flex-col gap-1">
            <h2 className="text-xl font-semibold text-text-strong">
               {t("companySettings.shifts.title")}
            </h2>
            <p className="text-sm text-text-sub">
               {t("companySettings.shifts.description")}
            </p>
         </div>

         {/* Action Bar */}
         <div className="flex items-center justify-between">
            <SearchInput
               value={searchQuery}
               onChange={setSearchQuery}
               placeholder={t("companySettings.shifts.searchPlaceholder")}
               className="max-w-60"
            />
            <div className="flex gap-3 items-center">
               <SortDropdown
                  label={t("companySettings.shifts.sort.label")}
                  options={sortOptions}
                  onSelect={handleSort}
                  className="w-fit"
               />
               {canManageShifts && (
                  <Button onClick={handleAddClick} className="px-3 py-2 gap-2">
                     <AddLine size={20} className="fill-text-main" />
                     <span className="whitespace-nowrap">
                        {t("companySettings.shifts.addButton")}
                     </span>
                  </Button>
               )}
            </div>
         </div>

         {/* Table */}
         {isLoadingShifts ? (
            <LoadingState size="large" label={t("loading.shifts")} />
         ) : (
            <ShiftsTable
               shifts={processedShifts as ViewShift[]}
               onViewDetails={canViewShifts ? handleViewDetails : undefined}
               onEdit={canManageShifts ? handleEdit : undefined}
               onArchive={canManageShifts ? handleArchive : undefined}
               onAssignEmployees={
                  canAssignShifts ? handleAssignEmployees : undefined
               }
               onViewAssignments={
                  canViewShifts ? handleViewAssignments : undefined
               }
               globalFilter=""
            />
         )}

         {canManageShifts && (
            <AddShiftModal
               isOpen={isAddModalOpen}
               onClose={() => setIsAddModalOpen(false)}
            />
         )}

         {editingShift && canManageShifts && (
            <EditShiftModal
               isOpen={!!editingShift}
               onClose={() => setEditingShift(null)}
               shift={editingShift}
               onSuccess={() => {
                  setEditingShift(null);
               }}
            />
         )}

         {viewingShift && (
            <ViewShiftDetailsModal
               isOpen={!!viewingShift}
               onClose={() => setViewingShift(null)}
               shift={viewingShift}
            />
         )}

         {assigningShift && canAssignShifts && (
            <AssignEmployeesModal
               isOpen={!!assigningShift}
               onClose={() => setAssigningShift(null)}
               shift={assigningShift}
            />
         )}

         {viewingAssignments && (
            <ViewShiftAssignmentsModal
               isOpen={!!viewingAssignments}
               onClose={() => setViewingAssignments(null)}
               shiftId={parseInt(viewingAssignments.id, 10)}
               shiftName={viewingAssignments.name}
            />
         )}

         {archivingShift && (
            <ConfirmModal
               isOpen={!!archivingShift}
               onClose={() => setArchivingShift(null)}
               onConfirm={handleConfirmArchive}
               title={t("companySettings.shifts.archiveModal.title")}
               description={t(
                  "companySettings.shifts.archiveModal.description",
                  {
                     shiftName: archivingShift.name,
                  },
               )}
               confirmText={t("companySettings.shifts.archiveModal.confirm")}
               cancelText={tCommon("cancel")}
               variant="error"
               icon="exclamation"
               isLoading={archiveMutation.isPending}
            />
         )}
      </div>
   );
}

export default ShiftsView;
