/** @format */

import { useState, useMemo, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import KPICard from "@/designSystem/KPICard";
import RequestsTable from "./RequestsTable";
import RequestsToolbar from "./ui/RequestsToolbar";
import AttendanceDetailModal from "./modals/AttendanceDetailModal";
import RejectAttendanceModal from "./modals/RejectAttendanceModal";
import ApproveAttendanceModal from "./modals/ApproveAttendanceModal";
import TimeOffDetailModal from "./modals/TimeOffDetailModal";
import RejectTimeOffModal from "./modals/RejectTimeOffModal";
import ApproveTimeOffModal from "./modals/ApproveTimeOffModal";
import OvertimeDetailModal from "./modals/OvertimeDetailModal";
import RejectOvertimeModal from "./modals/RejectOvertimeModal";
import ApproveOvertimeModal from "./modals/ApproveOvertimeModal";
import type { RequestFilterData } from "./ui/RequestsFilterModal";
import type { SortOption } from "@/designSystem/SortDropdown";
import { useTranslation } from "@/hooks/useTranslation";
import { HourglassHalf, UserCheckCircleAlt, UserXmarkCircleAlt } from "@/Icons";
import type { Request, RequestTabType } from "@/types/requests";
import { useRequests } from "@/hooks/requests/useRequests";
import {
   transformOvertimeList,
   transformTimeOffList,
} from "./utils/dataTransformers";
import { transformAttendanceData } from "./utils/transformAttendanceData";
import { useTableFilter, useTableSort } from "@/hooks/table";
import { useServerTableData } from "@/hooks/table/useServerTableData";
import {
   requestsService,
   type ServiceParams,
} from "@/services/requestsService";
import { reactQueryKeys } from "@/config/reactQueryKeys";
import { PaginationState, Updater } from "@tanstack/react-table";
import { usePermissions } from "@/contexts/PermissionContext";
import NoPermissionMessage from "@/components/common/NoPermissionMessage";
import { formatPermissionName } from "@/utilities/permissionFormatters";
import { formatDubaiDate } from "@/utilities/timeTransform";

const getTabFromParam = (tab: string | null): RequestTabType => {
   if (tab === "timeOff") {
      return "timeOff";
   }
   if (tab === "overtime") {
      return "overtime";
   }
   return "attendance";
};

interface RequestsContentProps {
   data?: Request[]; // Optional: if provided, could be used for initial data or ignored in favor of server fetch
   layout?: "page" | "dashboard";
   // isLoading ignored as we handle it internally
}

function RequestsContent({ layout = "page" }: RequestsContentProps) {
   const { t } = useTranslation("requests");
   const { can } = usePermissions();

   // View permissions
   const canViewAttendance = can("view_attendance_requests");
   const canViewTimeOff = can("view_vacation_requests");
   const canViewOvertime = can("view_overtime_requests");

   // Action permissions
   const canApproveAttendance = can("approve_attendance_requests");
   const canApproveTimeOff = can("approve_vacation_requests");
   const canApproveOvertime = can("approve_overtime_requests");

   // Module-level access: user needs at least one permission
   const canAccessRequests =
      canViewAttendance ||
      canViewTimeOff ||
      canViewOvertime ||
      canApproveAttendance ||
      canApproveTimeOff ||
      canApproveOvertime;

   const {
      useApproveAttendance,
      useRejectAttendance,
      useApproveTimeOff,
      useRejectTimeOff,
      useTimeOffStats,
      useOvertimeStats,
      useApproveOvertime,
      useRejectOvertime,
   } = useRequests();

   const [searchParams, setSearchParams] = useSearchParams();
   const tabParam = searchParams.get("tab");
   const isDashboardLayout = layout === "dashboard";
   const [dashboardTab, setDashboardTab] =
      useState<RequestTabType>("attendance");
   const activeTab = isDashboardLayout
      ? dashboardTab
      : getTabFromParam(tabParam);

   useEffect(() => {
      if (isDashboardLayout) {
         return;
      }
      if (!tabParam) {
         // Default to first available tab
         if (canViewAttendance) setSearchParams({ tab: "attendance" }, { replace: true });
         else if (canViewTimeOff) setSearchParams({ tab: "timeOff" }, { replace: true });
         else if (canViewOvertime) setSearchParams({ tab: "overtime" }, { replace: true });
         return;
      }
      
      // Redirect if current tab is not allowed
      const currentTab = getTabFromParam(tabParam);
      const isAllowed = 
         (currentTab === "attendance" && canViewAttendance) ||
         (currentTab === "timeOff" && canViewTimeOff) ||
         (currentTab === "overtime" && canViewOvertime);

      if (!isAllowed) {
         if (canViewAttendance) setSearchParams({ tab: "attendance" }, { replace: true });
         else if (canViewTimeOff) setSearchParams({ tab: "timeOff" }, { replace: true });
         else if (canViewOvertime) setSearchParams({ tab: "overtime" }, { replace: true });
      }
   }, [isDashboardLayout, tabParam, setSearchParams, canViewAttendance, canViewTimeOff, canViewOvertime]);

   const searchQuery = "";

   // Modals State
   const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
   const [isModalOpen, setIsModalOpen] = useState(false);

   // Attendance modals
   const [rejectRequest, setRejectRequest] = useState<Request | null>(null);
   const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
   const [approveRequest, setApproveRequest] = useState<Request | null>(null);
   const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);

   // Time Off modals
   const [timeOffRequest, setTimeOffRequest] = useState<Request | null>(null);
   const [isTimeOffModalOpen, setIsTimeOffModalOpen] = useState(false);
   const [rejectTimeOffRequest, setRejectTimeOffRequest] =
      useState<Request | null>(null);
   const [isRejectTimeOffModalOpen, setIsRejectTimeOffModalOpen] =
      useState(false);
   const [approveTimeOffRequest, setApproveTimeOffRequest] =
      useState<Request | null>(null);
   const [isApproveTimeOffModalOpen, setIsApproveTimeOffModalOpen] =
      useState(false);

   // Overtime modals
   const [overtimeRequest, setOvertimeRequest] = useState<Request | null>(null);
   const [isOvertimeModalOpen, setIsOvertimeModalOpen] = useState(false);
   const [rejectOvertimeRequest, setRejectOvertimeRequest] =
      useState<Request | null>(null);
   const [isRejectOvertimeModalOpen, setIsRejectOvertimeModalOpen] =
      useState(false);
   const [approveOvertimeRequest, setApproveOvertimeRequest] =
      useState<Request | null>(null);
   const [isApproveOvertimeModalOpen, setIsApproveOvertimeModalOpen] =
      useState(false);

   // Overtime stats
   const { data: overtimeStats } = useOvertimeStats({
      enabled: activeTab === "overtime",
   });
   const { data: timeOffStats } = useTimeOffStats({
      enabled: activeTab === "timeOff",
   });

   // Mutations
   const approveAttendanceMutation = useApproveAttendance();
   const rejectAttendanceMutation = useRejectAttendance();
   const approveTimeOffMutation = useApproveTimeOff();
   const rejectTimeOffMutation = useRejectTimeOff();
   const approveOvertimeMutation = useApproveOvertime();
   const rejectOvertimeMutation = useRejectOvertime();

   // ===== FILTER & SORT INTEGRATION =====
   const { filters, updateFilters } = useTableFilter<RequestFilterData>();
   const { sortConfig: attendanceSortConfig, handleSort: handleAttendanceSort } = useTableSort<Request>({
      initialSort: {
         field: "requestedAt",
         direction: "desc",
      },
   });
   const { sortConfig: timeOffSortConfig, handleSort: handleTimeOffSort } = useTableSort<Request>({
      initialSort: {
         field: "requestedAt",
         direction: "desc",
      },
   });
   const { sortConfig: overtimeSortConfig, handleSort: handleOvertimeSort } = useTableSort<Request>({
      initialSort: {
         field: "requestedAt",
         direction: "desc",
      },
   });

   const handleActiveSort = (field: string) => {
      if (activeTab === "attendance") {
         handleAttendanceSort(field);
         return;
      }
      if (activeTab === "timeOff") {
         handleTimeOffSort(field);
         return;
      }
      handleOvertimeSort(field);
   };

   // State for pagination
   const [page, setPage] = useState(1);
   const [pageSize, setPageSize] = useState(isDashboardLayout ? 5 : 20);

   const handleFilterApply = useCallback(
      (newFilters: RequestFilterData) => {
         updateFilters(newFilters);
         setPage(1);
      },
      [updateFilters]
   );

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

   // ===== SERVER SIDE FETCHING =====
   const mapFilters = useMemo(() => {
      const mapped: ServiceParams = {};
      if (filters.employeeId) {
         mapped.employee_id = Number(filters.employeeId);
      }
      if (filters.dateFrom) {
         mapped.from_date = formatDubaiDate(filters.dateFrom);
      }
      if (filters.dateTo) {
         mapped.to_date = formatDubaiDate(filters.dateTo);
      }
      return mapped;
   }, [filters.employeeId, filters.dateFrom, filters.dateTo]);

   const normalizeRequestParams = (params: Record<string, unknown>) => {
      const { sort_order, ...rest } = params as { sort_order?: unknown };
      if (!sort_order) return rest;
      return { ...rest, order: sort_order };
   };

   // Sort Mappings
   const commonSortMapping: Record<string, string> = {
      id: "id",
      "employee.name": "employee_name",
      created_at: "created_at",
      requestedAt: "created_at",
   };

   const attendanceSortMapping: Record<string, string> = {
      ...commonSortMapping,
      checkIn: "check_in_time",
      checkOut: "check_out_time",
      workHours: "total_hours",
   };

   const timeOffSortMapping: Record<string, string> = {
      ...commonSortMapping,
      type: "vacation_type_id",
      startDate: "start_date",
      duration: "duration",
   };

   const overtimeSortMapping: Record<string, string> = {
      ...commonSortMapping,
      date: "date",
      hours: "hours",
   };

   const getSortField = (
      field: string | undefined,
      mapping: Record<string, string>
   ) => {
      if (!field) return undefined;
      if (field === "newest") return "created_at";
      if (field === "oldest") return "created_at";
      return mapping[field] || field;
   };

   const getSortDirection = (
      field: string | undefined,
      direction: "asc" | "desc" | undefined
   ) => {
      if (field === "newest") return "desc";
      if (field === "oldest") return "asc";
      return direction;
   };

   // Fetch Attendance
   const {
      data: attendanceData,
      totalCount: attendanceTotal,
      isLoading: isAttendanceLoading,
      isFetching: isAttendanceFetching,
   } = useServerTableData<any>({
      queryKey: [...reactQueryKeys.requests.attendance.lists()],
      queryFn: (params) =>
         requestsService.getAttendanceRequests(normalizeRequestParams(params)),
      page,
      pageSize,
      enabled: activeTab === "attendance",
      filters: mapFilters,
      sortField: getSortField(attendanceSortConfig?.field, attendanceSortMapping),
      sortDirection: getSortDirection(attendanceSortConfig?.field, attendanceSortConfig?.direction),
   });

   // Fetch Time Off
   const {
      data: timeOffData,
      totalCount: timeOffTotal,
      isLoading: isTimeOffLoading,
      isFetching: isTimeOffFetching,
   } = useServerTableData<any>({
      queryKey: [...reactQueryKeys.requests.timeOff.lists()],
      queryFn: (params) =>
         requestsService.getTimeOffRequests(normalizeRequestParams(params)),
      page,
      pageSize,
      enabled: activeTab === "timeOff",
      filters: mapFilters,
      sortField: getSortField(timeOffSortConfig?.field, timeOffSortMapping),
      sortDirection: getSortDirection(timeOffSortConfig?.field, timeOffSortConfig?.direction),
   });

   // Fetch Overtime
   const {
      data: overtimeData,
      totalCount: overtimeTotal,
      isLoading: isOvertimeLoading,
      isFetching: isOvertimeFetching,
   } = useServerTableData<any>({
      queryKey: [...reactQueryKeys.requests.overtime.lists()],
      queryFn: (params) =>
         requestsService.getOvertimeRequests(normalizeRequestParams(params)),
      page,
      pageSize,
      enabled: activeTab === "overtime",
      filters: mapFilters,
      sortField: getSortField(overtimeSortConfig?.field, overtimeSortMapping),
      sortDirection: getSortDirection(overtimeSortConfig?.field, overtimeSortConfig?.direction),
   });

   // Transform Data
   const tableData = useMemo(() => {
      if (activeTab === "attendance") {
         return attendanceData ? transformAttendanceData(attendanceData) : [];
      } else if (activeTab === "timeOff") {
         return timeOffData ? transformTimeOffList(timeOffData) : [];
      } else if (activeTab === "overtime") {
         return overtimeData ? transformOvertimeList(overtimeData) : [];
      }
      return [];
   }, [activeTab, attendanceData, timeOffData, overtimeData]);

   const isLoading =
      activeTab === "attendance"
         ? isAttendanceLoading || isAttendanceFetching
         : activeTab === "timeOff"
         ? isTimeOffLoading || isTimeOffFetching
         : isOvertimeLoading || isOvertimeFetching;

   const totalCount =
      activeTab === "attendance"
         ? attendanceTotal
         : activeTab === "timeOff"
         ? timeOffTotal
         : overtimeTotal;

   const totalPages = Math.ceil(totalCount / pageSize);

   // Fetch Attendance Stats
   const { data: attendanceStats } = useQuery({
      queryKey: [...reactQueryKeys.requests.attendance.stats()],
      queryFn: requestsService.getAttendanceStats,
      enabled: activeTab === "attendance",
   });

   // Stats
   const summaryStats = useMemo(() => {
      if (activeTab === "attendance" && attendanceStats) {
         return {
            pending: attendanceStats.pending,
            approvedToday: attendanceStats.approved,
            rejectedToday: attendanceStats.rejected,
         };
      }
      if (activeTab === "timeOff" && timeOffStats) {
         return {
            pending: timeOffStats.pending,
            approvedToday: timeOffStats.approved,
            rejectedToday: timeOffStats.rejected,
         };
      }
      if (activeTab === "overtime" && overtimeStats) {
         return {
            pending: overtimeStats.pending,
            approvedToday: overtimeStats.approved,
            rejectedToday: overtimeStats.rejected,
         };
      }
      return { pending: 0, approvedToday: 0, rejectedToday: 0 };
   }, [activeTab, attendanceStats, overtimeStats, timeOffStats]);

   // Sort Options
   const sortOptions: SortOption<string>[] = useMemo(() => {
      if (activeTab === "overtime") {
         return [
            { id: "newest", label: t("sort.newest") },
            { id: "oldest", label: t("sort.oldest") },
            { id: "employee.name", label: t("sort.memberName") },
            { id: "hours", label: t("sort.duration") },
         ];
      }
      if (activeTab === "attendance") {
         return [
            { id: "newest", label: t("sort.newest") },
            { id: "oldest", label: t("sort.oldest") },
            { id: "employee.name", label: t("sort.memberName") },
            { id: "checkIn", label: t("sort.checkIn") },
         ];
      }
      if (activeTab === "timeOff") {
         return [
            { id: "newest", label: t("sort.newest") },
            { id: "oldest", label: t("sort.oldest") },
            { id: "employee.name", label: t("sort.memberName") },
            { id: "startDate", label: t("sort.date") },
            { id: "type", label: t("sort.type") },
         ];
      }
      return [{ id: "newest", label: t("sort.newest") }];
   }, [activeTab, t]);

   // Handlers
   const handleApprove = (request: Request) => {
      if (activeTab === "attendance") {
         setApproveRequest(request);
         setIsApproveModalOpen(true);
      } else if (activeTab === "timeOff") {
         setApproveTimeOffRequest(request);
         setIsApproveTimeOffModalOpen(true);
      } else if (activeTab === "overtime") {
         setApproveOvertimeRequest(request);
         setIsApproveOvertimeModalOpen(true);
      }
   };

   const handleReject = (request: Request) => {
      if (activeTab === "overtime") {
         setRejectOvertimeRequest(request);
         setIsRejectOvertimeModalOpen(true);
      } else if (activeTab === "timeOff") {
         setRejectTimeOffRequest(request);
         setIsRejectTimeOffModalOpen(true);
      } else {
         setRejectRequest(request);
         setIsRejectModalOpen(true);
      }
   };

   // Modal Confirm Handlers
   const handleRejectConfirm = async (request: Request, reason: string) => {
      try {
         await rejectAttendanceMutation.mutateAsync({
            id: Number(request.id),
            rejectionReason: reason,
         });
         setIsRejectModalOpen(false);
         setRejectRequest(null);
      } catch (error) {
         console.error("Failed to reject attendance request:", error);
      }
   };
   const handleCloseRejectModal = () => {
      setIsRejectModalOpen(false);
      setRejectRequest(null);
   };

   const handleApproveConfirm = async (request: Request) => {
      try {
         await approveAttendanceMutation.mutateAsync(Number(request.id));
         setIsApproveModalOpen(false);
         setApproveRequest(null);
      } catch (error) {
         console.error("Failed to approve attendance request:", error);
      }
   };
   const handleCloseApproveModal = () => {
      setIsApproveModalOpen(false);
      setApproveRequest(null);
   };

   const handleGpsStatusClick = (request: Request) => {
      setSelectedRequest(request);
      setIsModalOpen(true);
   };
   const handleAttendanceRowClick = (request: Request) => {
      setSelectedRequest(request);
      setIsModalOpen(true);
   };
   const handleCloseModal = () => {
      setIsModalOpen(false);
      setSelectedRequest(null);
   };

   const handleTimeOffRowClick = (request: Request) => {
      setTimeOffRequest(request);
      setIsTimeOffModalOpen(true);
   };
   const handleCloseTimeOffModal = () => {
      setIsTimeOffModalOpen(false);
      setTimeOffRequest(null);
   };

   // Overtime Actions
   const handleRejectOvertimeConfirm = async (
      request: Request,
      reason: string
   ) => {
      try {
         await rejectOvertimeMutation.mutateAsync({
            id: parseInt(request.id),
            rejectionReason: reason,
         });
         setIsRejectOvertimeModalOpen(false);
         setRejectOvertimeRequest(null);
      } catch (error) {
         console.error("Failed to reject overtime request:", error);
      }
   };
   const handleCloseRejectOvertimeModal = () => {
      setIsRejectOvertimeModalOpen(false);
      setRejectOvertimeRequest(null);
   };

   const handleApproveOvertimeConfirm = async (request: Request) => {
      try {
         await approveOvertimeMutation.mutateAsync(parseInt(request.id));
         setIsApproveOvertimeModalOpen(false);
         setApproveOvertimeRequest(null);
      } catch (error) {
         console.error("Failed to approve overtime request:", error);
      }
   };
   const handleCloseApproveOvertimeModal = () => {
      setIsApproveOvertimeModalOpen(false);
      setApproveOvertimeRequest(null);
   };

   const handleRejectTimeOffConfirm = async (
      request: Request,
      reason: string
   ) => {
      try {
         await rejectTimeOffMutation.mutateAsync({
            id: Number(request.id),
            rejectionReason: reason,
         });
         setIsRejectTimeOffModalOpen(false);
         setRejectTimeOffRequest(null);
      } catch (error) {
         console.error("Failed to reject time off request:", error);
      }
   };
   const handleCloseRejectTimeOffModal = () => {
      setIsRejectTimeOffModalOpen(false);
      setRejectTimeOffRequest(null);
   };

   const handleApproveTimeOffConfirm = async (request: Request) => {
      try {
         await approveTimeOffMutation.mutateAsync(Number(request.id));
         setIsApproveTimeOffModalOpen(false);
         setApproveTimeOffRequest(null);
      } catch (error) {
         console.error("Failed to approve time off request:", error);
      }
   };
   const handleCloseApproveTimeOffModal = () => {
      setIsApproveTimeOffModalOpen(false);
      setApproveTimeOffRequest(null);
   };

   const handleOvertimeRowClick = (request: Request) => {
      setOvertimeRequest(request);
      setIsOvertimeModalOpen(true);
   };
   const handleCloseOvertimeModal = () => {
      setIsOvertimeModalOpen(false);
      setOvertimeRequest(null);
   };

   const handleTabChange = (tabId: RequestTabType) => {
      setPage(1); // Reset page when changing tabs
      if (isDashboardLayout) {
         setDashboardTab(tabId);
         return;
      }
      setSearchParams({ tab: tabId }, { replace: false });
   };

   // Check if user can view current tab
   const canViewCurrentTab = useMemo(() => {
      if (activeTab === "attendance") return canViewAttendance;
      if (activeTab === "timeOff") return canViewTimeOff;
      if (activeTab === "overtime") return canViewOvertime;
      return false;
   }, [activeTab, canViewAttendance, canViewTimeOff, canViewOvertime]);

   const toolbarClassName = isDashboardLayout ? "mb-4" : "mb-6";

   // Module-level guard
   if (!canAccessRequests) {
      return (
         <div className="p-6">
            <NoPermissionMessage
               message={t("permissions.noAccess.title", "Access Restricted")}
               description={t(
                  "permissions.noAccess.message",
                  "You don't have permission to access the requests module."
               )}
            />
         </div>
      );
   }

   const requestsBody = (
      <>
         {!isDashboardLayout && canViewCurrentTab && (
            <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-3 xl:grid-cols-3 gap-2 md:gap-3 xl:gap-3 mb-6">
               <KPICard
                  label={t("summary.pendingRequests")}
                  value={summaryStats.pending}
                  icon={
                     <div className="w-5 h-5 rounded-full bg-warning/10 flex items-center justify-center">
                        <HourglassHalf size={16} className="fill-warning" />
                     </div>
                  }
               />
               <KPICard
                  label={t("summary.approvedToday")}
                  value={summaryStats.approvedToday}
                  icon={<UserCheckCircleAlt className="fill-success" />}
               />
               <KPICard
                  label={t("summary.rejectedToday")}
                  value={summaryStats.rejectedToday}
                  icon={
                     <UserXmarkCircleAlt size={20} className="fill-danger" />
                  }
               />
            </div>
         )}

         <RequestsToolbar
            searchQuery={searchQuery}
            onSearchChange={() => {}}
            searchDisabled={true}
            searchNote="You can use filters to filter user requests."
            onFilterApply={handleFilterApply}
            sortOptions={sortOptions}
            onSortChange={handleActiveSort}
            activeTab={activeTab}
            onTabChange={handleTabChange}
            initialFilters={filters}
            className={toolbarClassName}
            exportData={tableData}
            rawData={
               activeTab === "attendance"
                  ? attendanceData
                  : activeTab === "timeOff"
                  ? timeOffData
                  : overtimeData
            }
            rawDataIdField="id"
            canViewAttendance={canViewAttendance}
            canViewTimeOff={canViewTimeOff}
            canViewOvertime={canViewOvertime}
         />

         {/* Requests Table */}
         {!canViewCurrentTab ? (
            <NoPermissionMessage
               message={t(
                  "permissions.noReadAccess.title",
                  "Access Restricted"
               )}
               description={`${t(
                  "permissions.noReadAccess.message",
                  `You don't have permission to view ${activeTab} requests.`
               )} (Missing: ${formatPermissionName(
                  activeTab === "attendance"
                     ? "view_attendance_requests"
                     : activeTab === "timeOff"
                     ? "view_vacation_requests"
                     : "view_overtime_requests"
               )})`}
               className="mt-12"
            />
         ) : (
            <RequestsTable
               data={tableData}
               activeTab={activeTab}
               onApprove={handleApprove}
               onReject={handleReject}
               onGpsStatusClick={handleGpsStatusClick}
               onAttendanceRowClick={handleAttendanceRowClick}
               onOvertimeInfoClick={handleOvertimeRowClick}
               onTimeOffRowClick={handleTimeOffRowClick}
               canApproveAttendance={canApproveAttendance}
               canApproveTimeOff={canApproveTimeOff}
               canApproveOvertime={canApproveOvertime}
               pageCount={totalPages}
               pagination={{ pageIndex: page - 1, pageSize }}
               onPaginationChange={handlePaginationChange}
               isLoading={isLoading}
            />
         )}
      </>
   );

   const modalElements = (
      <>
         <AttendanceDetailModal
            request={selectedRequest}
            isOpen={isModalOpen}
            onClose={handleCloseModal}
         />
         <ApproveAttendanceModal
            request={approveRequest}
            isOpen={isApproveModalOpen}
            onClose={handleCloseApproveModal}
            onApprove={handleApproveConfirm}
         />
         <RejectAttendanceModal
            request={rejectRequest}
            isOpen={isRejectModalOpen}
            onClose={handleCloseRejectModal}
            onReject={handleRejectConfirm}
         />
         <TimeOffDetailModal
            request={timeOffRequest}
            isOpen={isTimeOffModalOpen}
            onClose={handleCloseTimeOffModal}
         />
         <ApproveTimeOffModal
            request={approveTimeOffRequest}
            isOpen={isApproveTimeOffModalOpen}
            onClose={handleCloseApproveTimeOffModal}
            onApprove={handleApproveTimeOffConfirm}
         />
         <RejectTimeOffModal
            request={rejectTimeOffRequest}
            isOpen={isRejectTimeOffModalOpen}
            onClose={handleCloseRejectTimeOffModal}
            onReject={handleRejectTimeOffConfirm}
         />
         <OvertimeDetailModal
            request={overtimeRequest}
            isOpen={isOvertimeModalOpen}
            onClose={handleCloseOvertimeModal}
         />
         <ApproveOvertimeModal
            request={approveOvertimeRequest}
            isOpen={isApproveOvertimeModalOpen}
            onClose={handleCloseApproveOvertimeModal}
            onApprove={handleApproveOvertimeConfirm}
         />
         <RejectOvertimeModal
            request={rejectOvertimeRequest}
            isOpen={isRejectOvertimeModalOpen}
            onClose={handleCloseRejectOvertimeModal}
            onReject={handleRejectOvertimeConfirm}
         />
      </>
   );

   if (isDashboardLayout) {
      return (
         <>
            <div className="flex flex-col items-start gap-2 p-1.5 relative bg-bg-weak rounded-3xl border border-solid border-border h-full w-full">
               <div className="flex flex-col gap-4 w-full bg-background rounded-[20px] border border-solid border-border shadow-[0px_1px_2px_0px_rgba(10,13,20,0.08)] p-4">
                  {requestsBody}
               </div>
            </div>
            {modalElements}
         </>
      );
   }

   return (
      <>
         {requestsBody}
         {modalElements}
      </>
   );
}

export default RequestsContent;
