/** @format */

import { useMemo, useState } from "react";
import { useQueries } from "@tanstack/react-query";
import { endOfMonth, startOfMonth } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import TimeManagementHeader from "./TimeManagementHeader";
import TimeManagementScheduleList from "./TimeManagementScheduleList";
import TimeOffRequestsTable from "./TimeOffRequestsTable";
import OvertimeTable from "./OvertimeTable";
import TimeManagementHistoryTab from "./TimeManagementHistoryTab";
import { ShiftTab } from "@/components/members/memberProfile/tabs/ShiftTab";
import { reactQueryKeys } from "@/config/reactQueryKeys";
import {
   useGetAttendanceTimeline,
   useGetEmployeeById,
} from "@/hooks/employees/employee.queries";
import { employeeService } from "@/services/employeeService";
import { TimeManagementFilters } from "./TimeManagementFilterDropdown";
import { usePermissions } from "@/contexts/PermissionContext";
import { AdminAttendanceActionModal } from "./modals";
import { formatDubaiDate } from "@/utilities/timeTransform";
import {
   getShiftBoundsForDate,
   getTimelineDates,
   normalizeAttendanceTimeline,
} from "./attendanceTimelineMapper";

interface TimeManagementTabProps {
   employeeId: string | number;
   canViewShift?: boolean;
}

type TabType = "shift" | "attendance" | "timeOff" | "overtime" | "history";

const BASE_TABS: TabType[] = ["attendance", "timeOff", "overtime", "history"];

const getDefaultFilters = (): TimeManagementFilters => ({
   status: undefined,
   type: undefined,
   dateFrom: startOfMonth(new Date()),
   dateTo: endOfMonth(new Date()),
});

function TimeManagementTab({
   employeeId,
   canViewShift = false,
}: TimeManagementTabProps) {
   const [activeTab, setActiveTab] = useState<TabType>("attendance");
   const [direction, setDirection] = useState<1 | -1>(1);
   const [isCheckInOpen, setIsCheckInOpen] = useState(false);
   const [isCheckOutOpen, setIsCheckOutOpen] = useState(false);
   const [lazyShiftBoundsByDate, setLazyShiftBoundsByDate] = useState<
      Record<string, { start: string | null; end: string | null }>
   >({});
   const [loadingShiftDates, setLoadingShiftDates] = useState<
      Record<string, boolean>
   >({});

   // Filter state
   const [filters, setFilters] = useState<TimeManagementFilters>(getDefaultFilters());

   // Fetch employee details
   const { data: employee } = useGetEmployeeById(employeeId);
   const { can } = usePermissions();
   const canManageAttendance = can("manage_attendance");

   const attendanceParams = useMemo(() => {
      if (activeTab !== "attendance") {
         return undefined;
      }

      const params: Record<string, string> = {};
      if (filters.dateFrom) {
         params.from_date = formatDubaiDate(filters.dateFrom);
      }
      if (filters.dateTo) {
         params.to_date = formatDubaiDate(filters.dateTo);
      }

      return Object.keys(params).length > 0 ? params : undefined;
   }, [activeTab, filters.dateFrom, filters.dateTo]);

   // Fetch attendance timeline data from new /employees/:id/timeline contract
   const { data: attendanceData, isLoading: isAttendanceTimelineLoading } =
      useGetAttendanceTimeline(employeeId, attendanceParams, {
         enabled: !!employeeId,
      });

   const timelineDates = useMemo(
      () => getTimelineDates(attendanceData?.data || []),
      [attendanceData?.data],
   );

   const prefetchedTimelineDates = useMemo(
      () =>
         [...timelineDates]
            .sort((a, b) => b.localeCompare(a))
            .slice(0, 3),
      [timelineDates],
   );

   const shiftQueries = useQueries({
      queries: prefetchedTimelineDates.map((date) => ({
         queryKey: reactQueryKeys.employees.currentShift(employeeId, { date }),
         queryFn: () => employeeService.getCurrentShift(employeeId, { date }),
         enabled: !!employeeId && activeTab === "attendance",
         retry: false,
      })),
   });

   const prefetchedShiftBoundsByDate = useMemo(() => {
      return prefetchedTimelineDates.reduce<
         Record<string, { start: string | null; end: string | null }>
      >(
         (acc, date, index) => {
            const shift = shiftQueries[index]?.data?.data?.shift;
            acc[date] = getShiftBoundsForDate(shift, date);
            return acc;
         },
         {},
      );
   }, [prefetchedTimelineDates, shiftQueries]);

   const shiftBoundsByDate = useMemo(
      () => ({
         ...prefetchedShiftBoundsByDate,
         ...lazyShiftBoundsByDate,
      }),
      [prefetchedShiftBoundsByDate, lazyShiftBoundsByDate],
   );

   const handleResolveShiftBounds = async (date: string) => {
      if (!employeeId) return;
      if (loadingShiftDates[date]) return;

      const existingBounds = shiftBoundsByDate[date];
      if (existingBounds?.start && existingBounds?.end) return;

      setLoadingShiftDates((prev) => ({ ...prev, [date]: true }));
      try {
         const response = await employeeService.getCurrentShift(employeeId, { date });
         const shift = response?.data?.shift;
         const bounds = getShiftBoundsForDate(shift, date);
         setLazyShiftBoundsByDate((prev) => ({ ...prev, [date]: bounds }));
      } catch (error) {
         console.error("Failed to resolve shift bounds for date:", date, error);
      } finally {
         setLoadingShiftDates((prev) => ({ ...prev, [date]: false }));
      }
   };

   const normalizedAttendanceData = useMemo(
      () =>
         normalizeAttendanceTimeline(attendanceData?.data || [], shiftBoundsByDate),
      [attendanceData?.data, shiftBoundsByDate],
   );

   const isLoadingAttendance =
      isAttendanceTimelineLoading ||
      shiftQueries.some((query) => query.isLoading);

   const tabOrder = canViewShift
      ? (["shift", ...BASE_TABS] as TabType[])
      : BASE_TABS;

   const handleTabChange = (newTab: TabType) => {
      const currentIndex = tabOrder.indexOf(activeTab);
      const newIndex = tabOrder.indexOf(newTab);
      setDirection(newIndex > currentIndex ? 1 : -1);
      setActiveTab(newTab);
      // Reset filters when changing tabs
      setFilters(getDefaultFilters());
   };

   const tabVariants = {
      initial: (direction: number) => ({
         opacity: 0,
         x: direction > 0 ? 20 : -20,
      }),
      animate: { opacity: 1, x: 0 },
      exit: (direction: number) => ({
         opacity: 0,
         x: direction > 0 ? -20 : 20,
      }),
   };

   return (
      <div className="w-full">
         <div className="flex flex-col items-start relative w-full xl:mb-4">
            <TimeManagementHeader
               activeTab={activeTab}
               onTabChange={handleTabChange}
               onFilterApply={setFilters}
               currentFilters={filters}
               defaultFilters={getDefaultFilters()}
               showShiftTab={canViewShift}
               showAttendanceActions={canManageAttendance}
               onCheckIn={() => setIsCheckInOpen(true)}
               onCheckOut={() => setIsCheckOutOpen(true)}
            />

            <AnimatePresence mode="wait" custom={direction}>
               {activeTab === "shift" && (
                  <motion.div
                     key="shift"
                     custom={direction}
                     variants={tabVariants}
                     initial="initial"
                     animate="animate"
                     exit="exit"
                     transition={{ duration: 0.2 }}
                     className="w-full">
                     <ShiftTab employeeId={employeeId} />
                  </motion.div>
               )}
               {activeTab === "attendance" && (
                  <motion.div
                     key="attendance"
                     custom={direction}
                     variants={tabVariants}
                     initial="initial"
                     animate="animate"
                     exit="exit"
                     transition={{ duration: 0.2 }}
                     className="w-full">
                     <TimeManagementScheduleList
                        data={normalizedAttendanceData}
                        isLoading={isLoadingAttendance}
                        onResolveShiftBounds={handleResolveShiftBounds}
                        loadingShiftDates={loadingShiftDates}
                     />
                  </motion.div>
               )}

               {activeTab === "timeOff" && (
                  <motion.div
                     key="timeOff"
                     custom={direction}
                     variants={tabVariants}
                     initial="initial"
                     animate="animate"
                     exit="exit"
                     transition={{ duration: 0.2 }}
                     className="w-full">
                     <TimeOffRequestsTable
                        employeeId={employeeId}
                        filters={filters}
                        employee={employee}
                     />
                  </motion.div>
               )}

               {activeTab === "overtime" && (
                  <motion.div
                     key="overtime"
                     custom={direction}
                     variants={tabVariants}
                     initial="initial"
                     animate="animate"
                     exit="exit"
                     transition={{ duration: 0.2 }}
                     className="w-full">
                     <OvertimeTable
                        employeeId={employeeId}
                        filters={filters}
                        employee={employee}
                     />
                  </motion.div>
               )}

               {activeTab === "history" && (
                  <motion.div
                     key="history"
                     custom={direction}
                     variants={tabVariants}
                     initial="initial"
                     animate="animate"
                     exit="exit"
                     transition={{ duration: 0.2 }}
                     className="w-full">
                     <TimeManagementHistoryTab employeeId={employeeId} />
                  </motion.div>
               )}
            </AnimatePresence>
         </div>
         <AdminAttendanceActionModal
            isOpen={isCheckInOpen}
            onClose={() => setIsCheckInOpen(false)}
            employeeId={employeeId}
            mode="checkIn"
         />
         <AdminAttendanceActionModal
            isOpen={isCheckOutOpen}
            onClose={() => setIsCheckOutOpen(false)}
            employeeId={employeeId}
            mode="checkOut"
         />
      </div>
   );
}

export default TimeManagementTab;
