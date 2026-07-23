/** @format */

import { useState, useMemo } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import Modal from "@/designSystem/Modal";
import Button from "@/designSystem/Button";
import ConfirmModal from "@/designSystem/ConfirmModal";
import Avatar from "@/designSystem/Avatar";
import Search from "@/Icons/search";
import Check from "@/Icons/check";
import { useShifts } from "@/hooks/shifts/useShifts";
import { useListEmployees } from "@/hooks/employees/employee.queries";
import type { ViewShift } from "./types";
import type { Shift, ShiftAssignment } from "@/services/shiftService";
import Loader from "@/designSystem/Loader";
import { useDebounce } from "@/hooks/useDebounce";

type AssignEmployeesModalProps = {
   isOpen: boolean;
   onClose: () => void;
   shift: ViewShift;
   onSuccess?: () => void;
};

interface ShiftAssignmentInfo {
   shiftName: string;
   isAssigned: boolean;
}

function AssignEmployeesModal({
   isOpen,
   onClose,
   shift,
   onSuccess,
}: AssignEmployeesModalProps) {
   const { t } = useTranslation("settings");
   const { t: tCommon } = useTranslation("common");
   const { useAssignEmployees, useListShifts } = useShifts();
   const assignMutation = useAssignEmployees();
   const [searchQuery, setSearchQuery] = useState("");
   const debouncedSearchQuery = useDebounce(searchQuery, 400);
   const { data: employeesData, isLoading: isLoadingEmployees } =
      useListEmployees({
         page: 1,
         limit: 100,
         search: debouncedSearchQuery || undefined,
      });
   const { data: shiftsData } = useListShifts();

   const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<Set<number>>(
      new Set(),
   );
   const [isDirty, setIsDirty] = useState(false);
   const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
   const [showAssignedHere, setShowAssignedHere] = useState(true);
   const [showAssignedElsewhere, setShowAssignedElsewhere] = useState(true);

   // Map employee ID to their current shift assignment info
   const employeeAssignmentMap = useMemo(() => {
      const map = new Map<number, ShiftAssignmentInfo>();
      if (!shiftsData?.data) return map;

      (shiftsData.data as Shift[]).forEach((s) => {
         if (s.assignments) {
            s.assignments.forEach((a: ShiftAssignment) => {
               if (a.assignment_type === "Employee" && a.employee_id) {
                  map.set(a.employee_id, {
                     shiftName: s.name,
                     isAssigned: true,
                  });
               }
            });
         }
      });
      return map;
   }, [shiftsData]);

   const filteredEmployees = useMemo(() => {
      if (!employeesData?.data) return [];
      let employees = employeesData.data;

      employees = employees.filter((emp: any) => {
         const assignmentInfo = employeeAssignmentMap.get(emp.id);
         const isAssignedToCurrent = assignmentInfo?.shiftName === shift.name;
         const isAssignedElsewhere = !!assignmentInfo && !isAssignedToCurrent;

         if (isAssignedToCurrent && !showAssignedHere) return false;
         if (isAssignedElsewhere && !showAssignedElsewhere) return false;
         return true;
      });

      return employees;
   }, [
      employeesData,
      employeeAssignmentMap,
      shift.name,
      showAssignedHere,
      showAssignedElsewhere,
   ]);

   const toggleSelection = (employeeId: number) => {
      const newSelected = new Set(selectedEmployeeIds);
      if (newSelected.has(employeeId)) {
         newSelected.delete(employeeId);
      } else {
         newSelected.add(employeeId);
      }
      setSelectedEmployeeIds(newSelected);
      setIsDirty(newSelected.size > 0);
   };

   const handleSubmit = async () => {
      if (selectedEmployeeIds.size === 0) return;

      try {
         await assignMutation.mutateAsync({
            id: shift.id,
            data: { employeeIds: Array.from(selectedEmployeeIds) },
         });
         if (onSuccess) onSuccess();
         handleClose();
      } catch (error) {
         console.error("Error assigning employees:", error);
      }
   };

   const handleClose = () => {
      setSearchQuery("");
      setSelectedEmployeeIds(new Set());
      setIsDirty(false);
      setShowDiscardConfirm(false);
      onClose();
   };

   const onCancel = () => {
      if (isDirty) {
         setShowDiscardConfirm(true);
      } else {
         handleClose();
      }
   };

   const isLoading = assignMutation.isPending;

   const footer = (
      <div className="flex justify-end gap-3 w-full">
         <Button variant="secondary" onClick={onCancel} disabled={isLoading}>
            {t("companySettings.shifts.modal.cancel")}
         </Button>
         <Button
            onClick={handleSubmit}
            disabled={isLoading || selectedEmployeeIds.size === 0}>
            {isLoading && (
               <span className="animate-spin mr-2 w-4 h-4 border-2 border-white border-t-transparent rounded-full inline-block align-middle" />
            )}
            {t("companySettings.shifts.modal.assignButton")}{" "}
            {selectedEmployeeIds.size > 0 && `(${selectedEmployeeIds.size})`}
         </Button>
      </div>
   );

   return (
      <Modal
         isOpen={isOpen}
         onClose={onCancel}
         title={`${shift.name} - ${t("companySettings.shifts.modal.assignTitle")}`}
         width="w-[700px]"
         size="large"
         footer={footer}>
         <div className="flex flex-col gap-4 p-6 h-full">
            {/* Search */}
            <div className="relative">
               <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <Search size={18} className="fill-text-sub" />
               </div>
               <input
                  type="text"
                  placeholder={t(
                     "memberPicker.searchPlaceholder",
                     "Search members...",
                  )}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-bg-weak border border-border rounded-xl text-sm text-text-strong placeholder:text-text-soft focus:outline-none focus:border-primary-base transition-colors"
               />
            </div>

            {/* Filters + Tooltip */}
            <div className="flex flex-wrap items-center justify-between gap-3">
               <span className="relative group inline-flex items-center gap-1 text-xs text-text-sub">
                  <span className="underline decoration-dotted">
                     {t(
                        "companySettings.shifts.modal.selectUsersHintLabel",
                        "How to assign",
                     )}
                  </span>
                  <span className="pointer-events-none absolute bottom-full left-0 z-10 mb-2 whitespace-nowrap rounded-md bg-text-strong px-2 py-1 text-[10px] text-background opacity-0 shadow-subtle transition-opacity group-hover:opacity-100">
                     {t(
                        "companySettings.shifts.modal.selectUsersHintTooltip",
                        "Select employees below to add them to this shift.",
                     )}
                  </span>
               </span>
               <div className="flex items-center gap-4 text-sm text-text-sub">
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                     <input
                        type="checkbox"
                        checked={showAssignedHere}
                        onChange={(e) => setShowAssignedHere(e.target.checked)}
                        className="h-4 w-4 rounded border-border"
                     />
                     <span>
                        {t(
                           "companySettings.shifts.modal.assignedHere",
                           "Assigned to this shift",
                        )}
                     </span>
                  </label>
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                     <input
                        type="checkbox"
                        checked={showAssignedElsewhere}
                        onChange={(e) =>
                           setShowAssignedElsewhere(e.target.checked)
                        }
                        className="h-4 w-4 rounded border-border"
                     />
                     <span>
                        {t(
                           "companySettings.shifts.modal.assignedElsewhere",
                           "Assigned to other shifts",
                        )}
                     </span>
                  </label>
               </div>
            </div>

            {/* Employee Grid */}
            <div className="min-h-[300px] flex-1 overflow-y-auto pr-1 -mr-1">
               {isLoadingEmployees ? (
                  <div className="flex items-center justify-center h-40">
                     <Loader label={t("loading.employees")} />
                  </div>
               ) : filteredEmployees.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                     {filteredEmployees.map((emp: any) => {
                        const isSelected = selectedEmployeeIds.has(emp.id);
                        const assignmentInfo = employeeAssignmentMap.get(
                           emp.id,
                        );
                        const isAssignedToCurrent =
                           assignmentInfo?.shiftName === shift.name;
                        const isAssignedElsewhere =
                           !!assignmentInfo && !isAssignedToCurrent;

                        return (
                           <div
                              key={emp.id}
                              onClick={() => {
                                 if (isAssignedToCurrent) return;
                                 toggleSelection(emp.id);
                              }}
                              className={`
                                 relative flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-200 select-none
                                 ${
                                    isSelected
                                       ? "bg-primary-surface border-primary-base shadow-[0px_0px_0px_1px_rgba(var(--primary-base-rgb),1)]"
                                       : isAssignedToCurrent
                                         ? "bg-success/10 border-success/20"
                                         : isAssignedElsewhere
                                           ? "bg-warning/10 border-warning/20"
                                           : "bg-background border-border hover:border-border-strong hover:bg-bg-weak"
                                 }
                                 ${isAssignedToCurrent ? "cursor-default" : ""}
                              `}>
                              {/* Selection Indicator Icon (Top Right) */}
                              {isSelected && (
                                 <div className="absolute top-3 right-3 text-primary-base">
                                    <div className="w-5 h-5 rounded-full bg-primary-base flex items-center justify-center">
                                       <Check
                                          size={12}
                                          className="fill-white"
                                       />
                                    </div>
                                 </div>
                              )}

                              <Avatar
                                 src={emp.avatar || "/icons/defAvatar.png"}
                                 alt={emp.name}
                                 size="lg"
                              />

                              <div className="flex flex-col min-w-0 pr-6">
                                 <span className="text-sm font-medium text-text-strong truncate">
                                    {emp.name}
                                 </span>
                                 <span className="text-xs text-text-sub truncate">
                                    {emp.job_title || emp.email}
                                 </span>

                                 {/* Existing Assignment Indicator */}
                                 {assignmentInfo && (
                                    <div className="mt-1 flex items-center gap-1.5">
                                       <div
                                          className={`w-1.5 h-1.5 rounded-full ${
                                             isAssignedToCurrent
                                                ? "bg-success"
                                                : "bg-warning"
                                          }`}
                                       />
                                       <span
                                          className={`text-[10px] font-medium uppercase tracking-wider truncate ${
                                             isAssignedToCurrent
                                                ? "text-success"
                                                : "text-warning"
                                          }`}>
                                          {isAssignedToCurrent
                                             ? t(
                                                  "companySettings.shifts.modal.assignedHere",
                                                  "Assigned to this shift",
                                               )
                                             : t(
                                                  "companySettings.shifts.modal.assignedTo",
                                                  {
                                                     shift: assignmentInfo.shiftName,
                                                  },
                                               )}
                                       </span>
                                    </div>
                                 )}
                              </div>
                           </div>
                        );
                     })}
                  </div>
               ) : (
                  <div className="flex flex-col items-center justify-center h-40 text-text-sub">
                     <p className="text-sm">{t("table.noResults")}</p>
                  </div>
               )}
            </div>
         </div>

         <ConfirmModal
            isOpen={showDiscardConfirm}
            onClose={() => setShowDiscardConfirm(false)}
            onConfirm={handleClose}
            title={tCommon("unsavedChanges.title")}
            description={tCommon("unsavedChanges.description")}
            confirmText={tCommon("unsavedChanges.confirm")}
            cancelText={tCommon("unsavedChanges.cancel")}
            variant="primary"
            icon="exclamation"
         />
      </Modal>
   );
}

export default AssignEmployeesModal;
