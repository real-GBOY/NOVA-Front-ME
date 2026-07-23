/** @format */

import { useMemo, useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { useShifts } from "@/hooks/shifts/useShifts";
import { useQueryClient } from "@tanstack/react-query";
import { reactQueryKeys } from "@/config/reactQueryKeys";
import Modal from "@/designSystem/Modal";
import Button from "@/designSystem/Button";
import LoadingState from "@/designSystem/LoadingState";
import { Search2Line } from "@/Icons";
import toast from "@/utilities/toast";
import type { Shift } from "@/services/shiftService";

interface AssignShiftModalProps {
   isOpen: boolean;
   onClose: () => void;
   employeeId: string | number;
   employeeName: string;
   currentShiftId?: number;
}

function AssignShiftModal({
   isOpen,
   onClose,
   employeeId,
   employeeName,
   currentShiftId,
}: AssignShiftModalProps) {
   const { t } = useTranslation("members");
   const { useListShifts, useAssignEmployees } = useShifts();
   const queryClient = useQueryClient();
   const { data: shiftsResponse, isLoading } = useListShifts();
   const assignEmployeesMutation = useAssignEmployees();

   const [selectedShiftId, setSelectedShiftId] = useState<number | null>(
      currentShiftId || null,
   );
   const [searchQuery, setSearchQuery] = useState("");

   const shifts = shiftsResponse?.data?.filter(
      (shift: Shift) => !shift.archived_at,
   );
   const filteredShifts = useMemo(() => {
      if (!shifts) return [];
      const query = searchQuery.trim().toLowerCase();
      if (!query) return shifts;

      return shifts.filter((shift) => {
         const name = shift.name?.toLowerCase() ?? "";
         const description = shift.description?.toLowerCase() ?? "";
         const timezone = shift.timezone?.toLowerCase() ?? "";

         return (
            name.includes(query) ||
            description.includes(query) ||
            timezone.includes(query)
         );
      });
   }, [searchQuery, shifts]);

   const handleAssign = async () => {
      if (!selectedShiftId) {
         toast.error(t("shift.selectShiftError"));
         return;
      }

      try {
         await assignEmployeesMutation.mutateAsync({
            id: selectedShiftId,
            data: {
               employeeIds: [Number(employeeId)],
            },
         });

         await queryClient.invalidateQueries({
            queryKey: reactQueryKeys.employees.currentShift(Number(employeeId)),
         });
         await queryClient.invalidateQueries({
            queryKey: ["shift", "employee", Number(employeeId)],
         });
         await queryClient.invalidateQueries({
            queryKey: reactQueryKeys.employees.detail(Number(employeeId)),
         });
         await queryClient.invalidateQueries({
            queryKey: reactQueryKeys.employees.lists(),
         });

         // Success toast is handled by the mutation hook
         onClose();
      } catch (error) {
         // Error toast is handled by the mutation hook
         console.error("Failed to assign shift:", error);
      }
   };

   const handleClose = () => {
      setSelectedShiftId(currentShiftId || null);
      setSearchQuery("");
      onClose();
   };

   return (
      <Modal
         isOpen={isOpen}
         onClose={handleClose}
         title={
            currentShiftId ? t("shift.changeShift") : t("shift.assignShift")
         }
         size="medium">
         <div className="space-y-6">
            {/* Description */}
            <p className="text-sm text-text-sub">
               {t("shift.modalDescription", { name: employeeName })}
            </p>

            {/* Search */}
            <div className="border border-border rounded-xl px-3 py-2 flex items-center gap-2 bg-background">
               <Search2Line size={18} />
               <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t("common:memberPicker.searchPlaceholder")}
                  className="flex-1 bg-transparent border-none outline-none text-text-soft placeholder:text-text-soft"
               />
            </div>

            {/* Shifts List */}
            {isLoading ? (
               <div className="flex items-center justify-center py-8">
                  <LoadingState />
               </div>
            ) : filteredShifts.length > 0 ? (
               <div className="space-y-2 max-h-96 overflow-y-auto">
                  {filteredShifts.map((shift: Shift) => {
                     const isSelected = selectedShiftId === shift.shift_id;
                     const isCurrent = currentShiftId === shift.shift_id;

                     return (
                        <button
                           key={shift.shift_id}
                           onClick={() => setSelectedShiftId(shift.shift_id)}
                           className={`
										w-full text-start p-4 rounded-lg border-2 transition-all
										${
                                 isSelected
                                    ? "border-primary bg-primary/5"
                                    : "border-border bg-background hover:border-border-hover hover:bg-bg-weak"
                              }
									`}>
                           <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                 <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-medium text-text-strong">
                                       {shift.name}
                                    </h4>
                                    {shift.is_default && (
                                       <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary">
                                          {t("shift.default")}
                                       </span>
                                    )}
                                    {isCurrent && (
                                       <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-success/10 text-success">
                                          {t("shift.current")}
                                       </span>
                                    )}
                                 </div>
                                 {shift.description && (
                                    <p className="text-sm text-text-sub mb-2">
                                       {shift.description}
                                    </p>
                                 )}
                                 <p className="text-xs text-text-soft">
                                    {shift.timezone || "UTC"} •{" "}
                                    {shift.segments?.length || 0}{" "}
                                    {t("shift.workingDays")}
                                 </p>
                              </div>
                              <div
                                 className={`
												w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5
												${isSelected ? "border-primary bg-primary" : "border-border"}
											`}>
                                 {isSelected && (
                                    <div className="w-2 h-2 rounded-full bg-white" />
                                 )}
                              </div>
                           </div>
                        </button>
                     );
                  })}
               </div>
            ) : (
               <div className="text-center py-8">
                  <p className="text-text-sub">
                     {searchQuery
                        ? t("common:table.noResults")
                        : t("shift.noShiftsAvailable")}
                  </p>
               </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
               <Button variant="secondary" onClick={handleClose}>
                  {t("common:cancel")}
               </Button>
               <Button
                  variant="primary"
                  onClick={handleAssign}
                  disabled={
                     !selectedShiftId || selectedShiftId === currentShiftId
                  }
                  isLoading={assignEmployeesMutation.isPending}>
                  {currentShiftId
                     ? t("shift.changeShiftAction")
                     : t("shift.assign")}
               </Button>
            </div>
         </div>
      </Modal>
   );
}

export default AssignShiftModal;
