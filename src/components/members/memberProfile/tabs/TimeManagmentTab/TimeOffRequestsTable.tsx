/** @format */

import { useMemo, useState, useCallback, useEffect } from "react";
import { ColumnDef, PaginationState, Updater } from "@tanstack/react-table";
import { DataTable } from "@/designSystem/ui/data-table";
import { useTranslation } from "@/hooks/useTranslation";
import { Calender, Briefcase } from "@/Icons";
import { RequestStatusCell, RequestActions, ExpandableText } from "./shared";
import { TimeManagementFilters } from "./TimeManagementFilterDropdown";
import { usePermissions } from "@/contexts/PermissionContext";
import { useRequests } from "@/hooks/requests/useRequests";
import { useGetTimeOffSummary } from "@/hooks/employees/employee.queries";
import ApproveTimeOffModal from "@/components/requests/modals/ApproveTimeOffModal";
import RejectTimeOffModal from "@/components/requests/modals/RejectTimeOffModal";
import type { Request } from "@/types/requests";
import { formatDubaiDate } from "@/utilities/timeTransform";

export interface TimeOffRequestRow {
   id: string;
   startDate: string;
   endDate: string;
   timeOffType: string;
   reason: string;
   status: "pending" | "approved" | "rejected" | "cancelled";
   requestUnit?: string;
   requestDate?: string;
   startTime?: string;
   endTime?: string;
   vacationTypeId?: number;
}

interface TimeOffRequestsTableProps {
   employeeId: string | number;
   filters?: TimeManagementFilters;
   employee?: {
      name?: string;
      avatar?: string | null;
      job_title?: string | null;
   };
}

function ActionsCell({
   request,
   onApprove,
   onReject,
}: {
   request: TimeOffRequestRow;
   onApprove: (id: string) => void;
   onReject: (id: string) => void;
}) {
   const { t } = useTranslation("members");
   const { can } = usePermissions();
   const canApproveVacation = can("approve_vacation");

   if (request.status?.toLowerCase() === "pending" && canApproveVacation) {
      return (
         <RequestActions
            id={request.id}
            onApprove={onApprove}
            onReject={onReject}
            approveLabel={t("profile.timeOff.actions.approve")}
            rejectAriaLabel={t("profile.timeOff.actions.reject")}
         />
      );
   }

   return (
      <RequestStatusCell
         status={request.status}
         label={t(`profile.timeOff.status.${request.status}`)}
      />
   );
}

function TimeOffRequestsTable({
   employeeId,
   filters,
   employee,
}: TimeOffRequestsTableProps) {
   const { t } = useTranslation("members");
   const [page, setPage] = useState(1);
   const [pageSize, setPageSize] = useState(7);

   const { data: timeOffSummary, isLoading, refetch } = useGetTimeOffSummary(
      employeeId,
      undefined,
      {
         enabled: !!employeeId,
      }
   );

   const { useApproveTimeOff, useRejectTimeOff } = useRequests();
   const approveTimeOffMutation = useApproveTimeOff();
   const rejectTimeOffMutation = useRejectTimeOff();

   const [approveRequest, setApproveRequest] = useState<Request | null>(null);
   const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
   const [rejectRequest, setRejectRequest] = useState<Request | null>(null);
   const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);

   const toRequestStatus = (status: TimeOffRequestRow["status"]): Request["status"] => {
      switch (status) {
         case "approved":
            return "Approved";
         case "rejected":
            return "Rejected";
         case "cancelled":
            return "Cancelled";
         default:
            return "Pending";
      }
   };

   const buildModalRequest = useCallback(
      (request: TimeOffRequestRow): Request => ({
         id: request.id,
         memberId: String(employeeId),
         memberName: employee?.name || "",
         memberAvatar: employee?.avatar || "",
         memberAvatarBg: "",
         memberTitle: employee?.job_title || "",
         requestType: "Time Off",
         requestedAt: new Date().toISOString(),
         status: toRequestStatus(request.status),
         startDate: request.startDate,
         endDate: request.endDate,
         leaveType:
            request.requestUnit === "hour" && request.startTime && request.endTime
               ? `${request.timeOffType} (${request.startTime} - ${request.endTime})`
               : request.timeOffType,
      }),
      [employee?.avatar, employee?.job_title, employee?.name, employeeId]
   );

   const normalizedData: TimeOffRequestRow[] = useMemo(() => {
      const requests = timeOffSummary?.requests || [];

      let data: TimeOffRequestRow[] = requests.map((request) => {
         const requestId =
            request.id ??
            (request as { request_id?: number }).request_id ??
            (request as { vacation_id?: number }).vacation_id ??
            "";
         const unit = String(request.request_unit || "day");
         const baseDate = request.start_date || request.request_date || "-";
         const endDate = request.end_date || request.start_date || request.request_date || "-";

         return {
            id: String(requestId),
            startDate: baseDate,
            endDate: endDate,
            timeOffType: request.vacation_type?.name || "-",
            reason: request.reason || "",
            status: String(request.status || "").toLowerCase() as TimeOffRequestRow["status"],
            requestUnit: unit,
            requestDate: request.request_date || undefined,
            startTime: request.start_time || undefined,
            endTime: request.end_time || undefined,
            vacationTypeId: request.vacation_type?.id,
         };
      });

      if (filters?.status) {
         data = data.filter((item) => item.status === filters.status);
      }
      if (filters?.type) {
         data = data.filter(
            (item) => String(item.vacationTypeId) === String(filters.type)
         );
      }
      if (filters?.dateFrom) {
         const fromDate = formatDubaiDate(filters.dateFrom);
         data = data.filter((item) => item.startDate >= fromDate);
      }
      if (filters?.dateTo) {
         const toDate = formatDubaiDate(filters.dateTo);
         data = data.filter((item) => item.startDate <= toDate);
      }
      return data;
   }, [timeOffSummary?.requests, filters]);

   const totalCount = normalizedData.length;
   const tableData = useMemo(() => {
      const start = (page - 1) * pageSize;
      return normalizedData.slice(start, start + pageSize);
   }, [normalizedData, page, pageSize]);

   useEffect(() => {
      setPage(1);
   }, [filters, employeeId]);

   const handleApprove = useCallback(
      (id: string) => {
         const request = normalizedData.find((r) => r.id === id);
         if (!request) return;

         setApproveRequest(buildModalRequest(request));
         setIsApproveModalOpen(true);
      },
      [buildModalRequest, normalizedData]
   );

   const handleReject = useCallback(
      (id: string) => {
         const request = normalizedData.find((r) => r.id === id);
         if (!request) return;

         setRejectRequest(buildModalRequest(request));
         setIsRejectModalOpen(true);
      },
      [buildModalRequest, normalizedData]
   );

   const handleApproveConfirm = async (request: Request) => {
      try {
         await approveTimeOffMutation.mutateAsync(Number(request.id));
         setIsApproveModalOpen(false);
         setApproveRequest(null);
         refetch();
      } catch (error) {
         console.error("Failed to approve time off request:", error);
      }
   };

   const handleRejectConfirm = async (request: Request, reason: string) => {
      try {
         await rejectTimeOffMutation.mutateAsync({
            id: Number(request.id),
            rejectionReason: reason,
         });
         setIsRejectModalOpen(false);
         setRejectRequest(null);
         refetch();
      } catch (error) {
         console.error("Failed to reject time off request:", error);
      }
   };

   const columns: ColumnDef<TimeOffRequestRow>[] = useMemo(
      () => [
         {
            accessorKey: "startDate",
            enableSorting: false,
            header: () => (
               <div className="flex items-center gap-2">
                  <Calender size={16} />
                  <span>{t("profile.timeOff.table.startDate")}</span>
               </div>
            ),
            cell: ({ row, getValue }) => (
               <p className="text-sm text-text-strong">
                  {row.original.requestUnit === "hour"
                     ? row.original.requestDate || (getValue() as string)
                     : (getValue() as string)}
               </p>
            ),
            size: 250,
         },
         {
            accessorKey: "endDate",
            enableSorting: false,
            header: () => (
               <div className="flex items-center gap-2">
                  <Calender size={16} />
                  <span>{t("profile.timeOff.table.endDate")}</span>
               </div>
            ),
            cell: ({ row, getValue }) => (
               <p className="text-sm text-text-strong">
                  {row.original.requestUnit === "hour" && row.original.startTime && row.original.endTime
                     ? `${row.original.startTime} - ${row.original.endTime}`
                     : (getValue() as string)}
               </p>
            ),
            size: 250,
         },
         {
            accessorKey: "timeOffType",
            enableSorting: false,
            header: () => (
               <div className="flex items-center gap-2">
                  <Briefcase size={16} />
                  <span>{t("profile.timeOff.table.timeOffType")}</span>
               </div>
            ),
            cell: ({ getValue }) => (
               <p className="text-sm text-text-strong">{getValue() as string}</p>
            ),
            size: 250,
         },
         {
            accessorKey: "reason",
            enableSorting: false,
            header: () => (
               <div className="flex items-center gap-2">
                  <span>{t("profile.timeOff.table.reason")}</span>
               </div>
            ),
            cell: ({ getValue }) => <ExpandableText text={getValue() as string} />,
            size: 300,
         },
         {
            id: "actions",
            enableSorting: false,
            header: "",
            cell: ({ row }) => (
               <ActionsCell
                  request={row.original}
                  onApprove={handleApprove}
                  onReject={handleReject}
               />
            ),
         },
      ],
      [t, handleApprove, handleReject]
   );

   const hourCounters = timeOffSummary?.hour_counters || [];
   const nursingStatus = timeOffSummary?.nursing_status;
   const isInitialLoading = isLoading && normalizedData.length === 0;

   if (isInitialLoading) {
      return (
         <div className="flex items-center justify-center py-8">
            <p className="text-text-soft">{t("loading.general")}</p>
         </div>
      );
   }

   return (
      <>
         {(hourCounters.length > 0 || nursingStatus?.active) && (
            <div className="mb-4 grid grid-cols-1 xl:grid-cols-2 gap-3">
               {hourCounters.length > 0 && (
                  <div className="rounded-xl border border-border bg-background px-4 py-3">
                     <p className="text-xs text-text-sub mb-1">
                        {t("profile.summary.pendingRequests")}
                     </p>
                     <p className="text-sm text-text-strong">
                        {hourCounters
                           .map(
                              (counter) =>
                                 `${counter.total_minutes}m (${counter.converted_days}d + ${counter.remainder_minutes}m)`
                           )
                           .join(" • ")}
                     </p>
                  </div>
               )}
               {nursingStatus?.active && (
                  <div className="rounded-xl border border-border bg-background px-4 py-3">
                     <p className="text-xs text-text-sub mb-1">Nursing Status</p>
                     <p className="text-sm text-text-strong">
                        Active
                        {nursingStatus.nursing_end_date
                           ? ` • Ends ${nursingStatus.nursing_end_date}`
                           : ""}
                     </p>
                  </div>
               )}
            </div>
         )}

         {!tableData || normalizedData.length === 0 ? (
            <div className="flex items-center justify-center py-8">
               <p className="text-text-soft">{t("timeManagement.timeOff.noData")}</p>
            </div>
         ) : (
            <div className="r-table-scroll xl:mx-0">
               <DataTable
                  columns={columns}
                  data={tableData}
                  enableRowSelection={false}
                  showPagination={true}
                  pageSize={pageSize}
                  pagination={{ pageIndex: page - 1, pageSize }}
                  onPaginationChange={(updater: Updater<PaginationState>) => {
                     if (typeof updater === "function") {
                        const newState = updater({ pageIndex: page - 1, pageSize });
                        setPage(newState.pageIndex + 1);
                        setPageSize(newState.pageSize);
                     } else {
                        setPage(updater.pageIndex + 1);
                        setPageSize(updater.pageSize);
                     }
                  }}
                  pageCount={Math.max(1, Math.ceil(totalCount / pageSize))}
                  manualPagination={true}
                  translationNamespace="members"
                  className="w-full"
               />
            </div>
         )}

         <ApproveTimeOffModal
            request={approveRequest}
            isOpen={isApproveModalOpen}
            onClose={() => setIsApproveModalOpen(false)}
            onApprove={handleApproveConfirm}
            isPending={approveTimeOffMutation.isPending}
         />

         <RejectTimeOffModal
            request={rejectRequest}
            isOpen={isRejectModalOpen}
            onClose={() => setIsRejectModalOpen(false)}
            onReject={handleRejectConfirm}
            isPending={rejectTimeOffMutation.isPending}
         />
      </>
   );
}

export default TimeOffRequestsTable;
