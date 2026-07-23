/** @format */

import { useState, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { reactQueryKeys } from "@/config/reactQueryKeys";
import { useTranslation } from "@/hooks/useTranslation";
import { useShifts } from "@/hooks/shifts/useShifts";
import {
   useGetEmployeeById,
   useGetEmployeeCurrentShift,
} from "@/hooks/employees/employee.queries";
import { usePermissions } from "@/contexts/PermissionContext";
import LoadingState from "@/designSystem/LoadingState";
import Button from "@/designSystem/Button";
import AssignShiftModal from "./AssignShiftModal";
import type { Shift } from "@/services/shiftService";

interface ShiftTabProps {
   employeeId: string | number;
}

const formatShiftTime = (time: string) =>
   time?.length >= 5 ? time.substring(0, 5) : time;

const getWeekdayName = (weekday: number, t: (key: string) => string) => {
   const days = [
      t("shift.weekdays.sunday"),
      t("shift.weekdays.monday"),
      t("shift.weekdays.tuesday"),
      t("shift.weekdays.wednesday"),
      t("shift.weekdays.thursday"),
      t("shift.weekdays.friday"),
      t("shift.weekdays.saturday"),
   ];
   return days[weekday] || "";
};

function ShiftTab({ employeeId }: ShiftTabProps) {
   const { t } = useTranslation("members");
   const { can } = usePermissions();
   const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
   const queryClient = useQueryClient();
   const { useListShifts } = useShifts();
   const { data: employee, isLoading: isLoadingEmployee } =
      useGetEmployeeById(employeeId);

   // Use employee ID to get current shift from employee-specific endpoint
   const {
      data: employeeCurrentShiftResponse,
      isLoading: isLoadingEmployeeCurrentShift,
      isError: isEmployeeCurrentShiftError,
      refetch: refetchEmployeeCurrentShift,
   } = useGetEmployeeCurrentShift(employeeId, undefined, {
      enabled: !!employeeId,
   });

   // Fallback: get all shifts and find by assignment
   const {
      data: shiftsResponse,
      isLoading: isLoadingShifts,
      refetch: refetchShifts,
   } = useListShifts();

   const canManageShifts = can("manage_shifts") || can("update_employee");

   const isLoading =
      isLoadingEmployee ||
      isLoadingEmployeeCurrentShift ||
      (isEmployeeCurrentShiftError && isLoadingShifts);

   // Get shift: prioritize employee current-shift API, then fallback to list
   const employeeShift = useMemo(() => {
      // First priority: use employee-specific current-shift endpoint
      if (
         employeeCurrentShiftResponse?.data?.shift &&
         !isEmployeeCurrentShiftError
      ) {
         return employeeCurrentShiftResponse.data.shift;
      }
      // Fallback: find from list by assignment
      return shiftsResponse?.data?.find((shift: Shift) => {
         return shift.assignments?.some(
            (assignment) =>
               assignment.assignment_type === "Employee" &&
               assignment.employee_id === Number(employeeId),
         );
      });
   }, [
      employeeCurrentShiftResponse,
      isEmployeeCurrentShiftError,
      shiftsResponse,
      employeeId,
   ]);

   // Sort segments by weekday
   const sortedSegments = employeeShift?.segments
      ? [...employeeShift.segments].sort((a, b) => a.weekday - b.weekday)
      : [];

   if (isLoading) {
      return (
         <div className="flex items-center justify-center py-12">
            <LoadingState />
         </div>
      );
   }

   return (
      <div className="space-y-6">
         {/* Header */}
         <div className="flex items-center justify-between">
            <div>
               <h2 className="text-xl font-semibold text-text-strong">
                  {t("shift.title")}
               </h2>
               <p className="text-sm text-text-sub mt-1">
                  {t("shift.description")}
               </p>
            </div>
            {canManageShifts && (
               <Button
                  variant="primary"
                  onClick={() => setIsAssignModalOpen(true)}>
                  {employeeShift
                     ? t("shift.changeShift")
                     : t("shift.assignShift")}
               </Button>
            )}
         </div>

         {/* Shift Information */}
         {employeeShift ? (
            <div className="space-y-6">
               {/* Shift Details Card */}
               <div className="bg-bg-weak rounded-lg p-6 border border-border">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                        <p className="text-sm text-text-sub mb-1">
                           {t("shift.shiftName")}
                        </p>
                        <p className="text-base font-medium text-text-strong">
                           {employeeShift.name}
                        </p>
                     </div>
                     {employeeShift.description && (
                        <div>
                           <p className="text-sm text-text-sub mb-1">
                              {t("shift.description")}
                           </p>
                           <p className="text-base text-text-strong">
                              {employeeShift.description}
                           </p>
                        </div>
                     )}
                     <div>
                        <p className="text-sm text-text-sub mb-1">
                           {t("shift.timezone")}
                        </p>
                        <p className="text-base text-text-strong">
                           {employeeShift.timezone || "UTC"}
                        </p>
                     </div>
                     {employeeShift.is_default && (
                        <div>
                           <p className="text-sm text-text-sub mb-1">
                              {t("shift.type")}
                           </p>
                           <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-primary/10 text-primary">
                              {t("shift.defaultShift")}
                           </span>
                        </div>
                     )}
                  </div>
               </div>

               {/* Schedule Card */}
               <div className="bg-background rounded-lg border border-border">
                  <div className="px-6 py-4 border-b border-border">
                     <h3 className="text-lg font-semibold text-text-strong">
                        {t("shift.weeklySchedule")}
                     </h3>
                  </div>
                  <div className="divide-y divide-border">
                     {sortedSegments.length > 0 ? (
                        sortedSegments.map((segment, index) => (
                           <div
                              key={segment.segment_id || index}
                              className="px-6 py-4 flex items-center justify-between hover:bg-bg-weak/50 transition-colors">
                              <div className="flex-1">
                                 <p className="text-base font-medium text-text-strong">
                                    {getWeekdayName(segment.weekday, t)}
                                 </p>
                              </div>
                              <div className="flex items-center gap-6">
                                 <div className="text-end">
                                    <p className="text-sm text-text-sub mb-0.5">
                                       {t("shift.workingHours")}
                                    </p>
                                    <p className="text-base font-medium text-text-strong">
                                       {formatShiftTime(segment.start_time)}{" "}
                                       -{" "}
                                       {formatShiftTime(segment.end_time)}
                                    </p>
                                 </div>
                                 {segment.break_minutes !== null &&
                                    segment.break_minutes > 0 && (
                                       <div className="text-end">
                                          <p className="text-sm text-text-sub mb-0.5">
                                             {t("shift.breakTime")}
                                          </p>
                                          <p className="text-base font-medium text-text-strong">
                                             {segment.break_minutes}{" "}
                                             {t("shift.minutes")}
                                          </p>
                                       </div>
                                    )}
                              </div>
                           </div>
                        ))
                     ) : (
                        <div className="px-6 py-8 text-center">
                           <p className="text-text-sub">
                              {t("shift.noSchedule")}
                           </p>
                        </div>
                     )}
                  </div>
               </div>
            </div>
         ) : (
            <div className="bg-bg-weak rounded-lg p-12 text-center border border-border">
               <div className="max-w-md mx-auto">
                  <p className="text-lg font-medium text-text-strong mb-2">
                     {t("shift.noShiftAssigned")}
                  </p>
                  <p className="text-sm text-text-sub mb-6">
                     {t("shift.noShiftDescription")}
                  </p>
                  {canManageShifts && (
                     <Button
                        variant="primary"
                        onClick={() => setIsAssignModalOpen(true)}>
                        {t("shift.assignShift")}
                     </Button>
                  )}
               </div>
            </div>
         )}

         {/* Assign Shift Modal */}
         <AssignShiftModal
            isOpen={isAssignModalOpen}
            onClose={async () => {
               setIsAssignModalOpen(false);
               await Promise.all([
                  queryClient.invalidateQueries({
                     queryKey: reactQueryKeys.employees.currentShift(
                        Number(employeeId),
                     ),
                  }),
                  queryClient.invalidateQueries({
                     queryKey: ["shift", "current"],
                  }),
                  queryClient.invalidateQueries({
                     queryKey: ["shift", "employee", Number(employeeId)],
                  }),
                  queryClient.invalidateQueries({
                     queryKey: ["shifts"],
                  }),
               ]);
               await Promise.all([
                  refetchEmployeeCurrentShift(),
                  refetchShifts(),
               ]);
            }}
            employeeId={employeeId}
            employeeName={employee?.name || ""}
            currentShiftId={employeeShift?.shift_id}
         />
      </div>
   );
}

export default ShiftTab;
