/** @format */

import { useMemo, useState, useCallback, useEffect } from "react";
import { ColumnDef, PaginationState, Updater } from "@tanstack/react-table";
import { DataTable } from "@/designSystem/ui/data-table";
import { useTranslation } from "@/hooks/useTranslation";
import { CalendarSimpleCheck, Calender, ClockTwo } from "@/Icons";
import { RequestStatusCell, RequestActions, ExpandableText } from "./shared";
import { TimeManagementFilters } from "./TimeManagementFilterDropdown";
import { usePermissions } from "@/contexts/PermissionContext";
import { useRequests } from "@/hooks/requests/useRequests";
import ApproveOvertimeModal from "@/components/requests/modals/ApproveOvertimeModal";
import RejectOvertimeModal from "@/components/requests/modals/RejectOvertimeModal";
import { useServerTableData } from "@/hooks/table/useServerTableData";
import { requestsService, ServiceParams } from "@/services/requestsService";
import { reactQueryKeys } from "@/config/reactQueryKeys";
import type { Request, OvertimeRequest as ApiOvertimeRequest } from "@/types/requests";
import { formatDubaiDate } from "@/utilities/timeTransform";

export interface OvertimeRequestRow {
   id: string;
   requestedDate: string;
   overtimeDate: string;
   duration: string;
   overtime: string;
   reason: string;
   status: "pending" | "approved" | "rejected";
}

interface OvertimeTableProps {
   employeeId: string | number;
   filters?: TimeManagementFilters;
   employee?: any;
}

// Actions Cell Component
function ActionsCell({
   request,
   onApprove,
   onReject,
}: {
   request: OvertimeRequestRow;
   onApprove: (id: string) => void;
   onReject: (id: string) => void;
}) {
   const { t } = useTranslation("members");
   const { can } = usePermissions();
   const canApproveOvertime = can("approve_overtime");

   // Show action buttons for pending requests (only if user has permission)
   if (request.status?.toLowerCase() === "pending" && canApproveOvertime) {
      return (
         <RequestActions
            id={request.id}
            onApprove={onApprove}
            onReject={onReject}
            approveLabel={t("profile.overtime.actions.approve")}
            rejectAriaLabel={t("profile.overtime.actions.reject")}
         />
      );
   }

   // Show status tag for non-pending requests or users without permission
   return (
      <RequestStatusCell
         status={request.status}
         label={t(`profile.overtime.status.${request.status}`)}
      />
   );
}

function OvertimeTable({
   employeeId,
   filters,
   employee,
}: OvertimeTableProps) {
   const { t } = useTranslation("members");
   const [page, setPage] = useState(1);
   const [pageSize, setPageSize] = useState(10);

   const mappedFilters = useMemo(() => {
      const mapped: ServiceParams = {
         employee_id: Number(employeeId),
      };

      if (filters?.status) {
         const normalized = String(filters.status).toLowerCase();
         mapped.status = normalized.charAt(0).toUpperCase() + normalized.slice(1);
      }
      if (filters?.dateFrom) {
         mapped.date_from = formatDubaiDate(filters.dateFrom);
      }
      if (filters?.dateTo) {
         mapped.date_to = formatDubaiDate(filters.dateTo);
      }

      return mapped;
   }, [employeeId, filters?.status, filters?.dateFrom, filters?.dateTo]);

   const {
      data: overtimeData,
      totalCount,
      isLoading,
      refetch,
   } = useServerTableData<ApiOvertimeRequest>({
      queryKey: [...reactQueryKeys.requests.overtime.lists()],
      queryFn: (params) => requestsService.getOvertimeRequests(params),
      page,
      pageSize,
      enabled: !!employeeId,
      filters: mappedFilters,
   });
   
   // Hooks for approve/reject
   const { useApproveOvertime, useRejectOvertime } = useRequests();
   const approveOvertimeMutation = useApproveOvertime();
   const rejectOvertimeMutation = useRejectOvertime();
   
   // Modal state
   const [approveRequest, setApproveRequest] = useState<Request | null>(null);
   const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
   const [rejectRequest, setRejectRequest] = useState<Request | null>(null);
   const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);

   // Transform API data to table format
   const tableData: OvertimeRequestRow[] = useMemo(() => {
      if (!overtimeData) return [];

      return overtimeData.map((request) => {
         const extra =
            request as ApiOvertimeRequest & {
               compensation?: number;
               calculated_compensation?: { total_amount?: number };
               session_id?: number;
            };
         const compensation =
            extra.compensation ?? extra.calculated_compensation?.total_amount;
         const formattedCompensation =
            typeof compensation === "number" && !Number.isNaN(compensation)
               ? compensation >= 1000
                  ? `${(compensation / 1000).toFixed(1)}K`
                  : String(compensation)
               : "-";

         return {
            id: String(request.id || extra.session_id || ""),
            requestedDate: request.date,
            overtimeDate: request.date,
            duration: `${request.hours}h`,
            overtime: formattedCompensation,
            reason: request.reason || "",
            status: String(request.status || "").toLowerCase() as OvertimeRequestRow["status"],
         };
      });
   }, [overtimeData]);

   useEffect(() => {
      setPage(1);
   }, [filters?.status, filters?.dateFrom, filters?.dateTo, employeeId]);

   const handleApprove = useCallback(
      (id: string) => {
         const request = tableData.find((r) => r.id === id);
         if (request) {
            // Transform to Request type for modal
            const requestForModal: any = {
               id: request.id,
               date: request.overtimeDate,
               overtime: request.overtime,
               duration: request.duration,
               reason: request.reason,
               status: request.status,
               memberName: employee?.name || "",
               memberAvatar: employee?.avatar || null,
               memberTitle: employee?.job_title || "",
               requestedAt: new Date().toISOString(),
            };
            setApproveRequest(requestForModal);
            setIsApproveModalOpen(true);
         }
      },
      [tableData, employee]
   );

   const handleReject = useCallback(
      (id: string) => {
         const request = tableData.find((r) => r.id === id);
         if (request) {
            // Transform to Request type for modal
            const requestForModal: any = {
               id: request.id,
               date: request.overtimeDate,
               overtime: request.overtime,
               duration: request.duration,
               reason: request.reason,
               status: request.status,
               memberName: employee?.name || "",
               memberAvatar: employee?.avatar || null,
               memberTitle: employee?.job_title || "",
               requestedAt: new Date().toISOString(),
            };
            setRejectRequest(requestForModal);
            setIsRejectModalOpen(true);
         }
      },
      [tableData, employee]
   );
   
   // Confirm handlers
   const handleApproveConfirm = async (request: Request) => {
      try {
         await approveOvertimeMutation.mutateAsync(parseInt(request.id));
         setIsApproveModalOpen(false);
         setApproveRequest(null);
         refetch();
      } catch (error) {
         console.error("Failed to approve overtime request:", error);
      }
   };
   
   const handleRejectConfirm = async (request: Request, reason: string) => {
      try {
         await rejectOvertimeMutation.mutateAsync({
            id: parseInt(request.id),
            rejectionReason: reason,
         });
         setIsRejectModalOpen(false);
         setRejectRequest(null);
         refetch();
      } catch (error) {
         console.error("Failed to reject overtime request:", error);
      }
   };

   const columns: ColumnDef<OvertimeRequestRow>[] = useMemo(
      () => [
         {
            accessorKey: "requestedDate",
            enableSorting: false,
            header: () => (
               <div className="flex items-center gap-2">
                  <CalendarSimpleCheck size={16} />
                  <span>{t("profile.overtime.table.requestedDate")}</span>
               </div>
            ),
            cell: ({ getValue }) => (
               <p className="text-sm text-text-strong">
                  {getValue() as string}
               </p>
            ),
            size: 140,
         },
         {
            accessorKey: "overtimeDate",
            enableSorting: false,
            header: () => (
               <div className="flex items-center gap-2">
                  <Calender size={16} />
                  <span>{t("profile.overtime.table.overtimeDate")}</span>
               </div>
            ),
            cell: ({ getValue }) => (
               <p className="text-sm text-text-strong">
                  {getValue() as string}
               </p>
            ),
            size: 140,
         },
         {
            accessorKey: "duration",
            enableSorting: false,
            header: () => (
               <div className="flex items-center gap-2">
                  <ClockTwo size={16} />
                  <span>{t("profile.overtime.table.duration")}</span>
               </div>
            ),
            cell: ({ getValue }) => (
               <p className="text-sm text-text-strong">
                  {getValue() as string}
               </p>
            ),
            size: 100,
         },
         {
            accessorKey: "overtime",
            enableSorting: false,
            header: () => (
               <div className="flex items-center gap-2">
                  <ClockTwo size={16} />
                  <span>{t("profile.overtime.table.overtime")}</span>
               </div>
            ),
            cell: ({ getValue }) => (
               <p className="text-sm text-text-strong">
                  {getValue() as string}
               </p>
            ),
            size: 100,
         },
         {
            accessorKey: "reason",
            enableSorting: false,
            header: () => (
               <div className="flex items-center gap-2">
                  <span>{t("profile.overtime.table.reason")}</span>
               </div>
            ),
            cell: ({ getValue }) => (
               <ExpandableText text={getValue() as string} />
            ),
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
            size: 100,
         },
      ],
      [t, handleApprove, handleReject]
   );

   const isInitialLoading = isLoading && tableData.length === 0;

   if (isInitialLoading) {
      return (
         <div className="flex items-center justify-center py-8">
            <p className="text-text-soft">{t("loading.general")}</p>
         </div>
      );
   }

   if (!tableData || tableData.length === 0) {
      return (
         <div className="flex items-center justify-center py-8">
            <p className="text-text-soft">
               {t("timeManagement.overtime.noData")}
            </p>
         </div>
      );
   }

   return (
      <>
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
               pageCount={Math.ceil(totalCount / pageSize)}
               manualPagination={true}
               translationNamespace="members"
               className="w-full"
            />
         </div>
         
         <ApproveOvertimeModal
            request={approveRequest}
            isOpen={isApproveModalOpen}
            onClose={() => setIsApproveModalOpen(false)}
            onApprove={handleApproveConfirm}
            isPending={approveOvertimeMutation.isPending}
         />
         
         <RejectOvertimeModal
            request={rejectRequest}
            isOpen={isRejectModalOpen}
            onClose={() => setIsRejectModalOpen(false)}
            onReject={handleRejectConfirm}
            isPending={rejectOvertimeMutation.isPending}
         />
      </>
   );
}

export default OvertimeTable;
