/** @format */

import { useMemo } from "react";
import { DataTable } from "@/designSystem/ui/data-table";
import { PaginationState, Updater } from "@tanstack/react-table";
import type { Request, RequestTabType } from "@/types/requests";
import { useAttendanceColumns } from "./columns/attendanceColumns";
import { useTimeOffColumns } from "./columns/timeOffColumns";
import { useOvertimeColumns } from "./columns/overtimeColumns";

interface RequestsTableProps {
   data: Request[];
   activeTab?: RequestTabType;
   onApprove?: (request: Request) => void;
   onReject?: (request: Request) => void;
   onGpsStatusClick?: (request: Request) => void;
   onAttendanceRowClick?: (request: Request) => void;
   onOvertimeInfoClick?: (request: Request) => void;
   onTimeOffRowClick?: (request: Request) => void;
   canApproveAttendance?: boolean;
   canApproveTimeOff?: boolean;
   canApproveOvertime?: boolean;
   // Pagination props
   pageCount?: number;
   pagination?: {
      pageIndex: number;
      pageSize: number;
   };
   onPaginationChange?: (updater: Updater<PaginationState>) => void;
   isLoading?: boolean;
}

function RequestsTable({
   data,
   activeTab = "attendance",
   onApprove,
   onReject,
   onGpsStatusClick,
   onAttendanceRowClick,
   onOvertimeInfoClick,
   onTimeOffRowClick,
   canApproveAttendance = false,
   canApproveTimeOff = false,
   canApproveOvertime = false,
   pageCount,
   pagination,
   onPaginationChange,
   isLoading = false,
}: RequestsTableProps) {
   const attendanceColumns = useAttendanceColumns({
      onApprove,
      onReject,
      onGpsStatusClick,
      canApproveAttendance,
   });

   const timeOffColumns = useTimeOffColumns({
      onApprove,
      onReject,
      canApproveTimeOff,
   });

   const overtimeColumns = useOvertimeColumns({
      onApprove,
      onReject,
      onInfoClick: onOvertimeInfoClick,
      canApproveOvertime,
   });

   const columns = useMemo(() => {
      if (activeTab === "overtime") {
         return overtimeColumns;
      }
      if (activeTab === "timeOff") {
         return timeOffColumns;
      }
      return attendanceColumns;
   }, [activeTab, attendanceColumns, timeOffColumns, overtimeColumns]);

   return (
      <DataTable
         columns={columns}
         data={data}
         showPagination={true}
         pageSize={7}
         translationNamespace="requests"
         onRowClick={
            activeTab === "timeOff"
               ? onTimeOffRowClick
               : activeTab === "attendance"
               ? onAttendanceRowClick
               : undefined
         }
         pageCount={pageCount}
         pagination={pagination}
         onPaginationChange={onPaginationChange}
         manualPagination={!!onPaginationChange}
         isLoading={isLoading}
      />
   );
}

export default RequestsTable;
