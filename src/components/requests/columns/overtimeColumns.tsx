/** @format */

import { ColumnDef } from "@tanstack/react-table";
import { useTranslation } from "@/hooks/useTranslation";
import {
   UserSimpleAlt,
   Files,
   Calender,
   Check,
   Xmark,
   Tag,
   ClockTwo,
} from "@/Icons";
import type { Request } from "@/types/requests";
import Button from "@/designSystem/Button";
import MemberTag1 from "@/components/contracts/MemberTag1";
import RequestStatusCell from "@/components/members/memberProfile/tabs/TimeManagmentTab/shared/RequestStatusCell";
import { formatDate } from "@/utilities/i18n";
import { parseDate, formatRequestedDate } from "../utils/dateUtils";
import {
   getMockOvertimeDate,
   getMockOvertimeTimeRange,
   getMockDuration,
} from "../utils/mockData";

type OvertimeColumnsProps = {
   onApprove?: (request: Request) => void;
   onReject?: (request: Request) => void;
   onInfoClick?: (request: Request) => void;
   canApproveOvertime?: boolean;
};

export function useOvertimeColumns({
   onApprove,
   onReject,
   onInfoClick,
   canApproveOvertime = false,
}: OvertimeColumnsProps): ColumnDef<Request>[] {
   const { t } = useTranslation("requests");

   // Helper function to validate if a date is valid
   const isValidDate = (date: Date): boolean => {
      return date instanceof Date && !isNaN(date.getTime());
   };

   // Helper function to safely format a date
   const safeFormatDate = (
      date: Date | null,
      format: "short" | "medium" | "long" = "medium"
   ): string => {
      if (!date || !isValidDate(date)) {
         return "-";
      }
      try {
         return formatDate(date, format);
      } catch {
         return "-";
      }
   };

   return [
      {
         accessorKey: "id",
         header: () => <span className="text-sm font-medium"># ID</span>,
         cell: ({ getValue, row }) => (
            <p
               className="text-sm text-text-strong font-medium cursor-pointer hover:opacity-80 transition-opacity"
               onClick={(e) => {
                  e.stopPropagation();
                  onInfoClick?.(row.original);
               }}>
               #{getValue() as string}
            </p>
         ),
         size: 100,
         enableSorting: true,
      },
      {
         accessorKey: "memberName",
         header: () => (
            <div className="flex items-center gap-2">
               <UserSimpleAlt size={16} />
               <span className="text-sm font-medium">
                  {t("table.memberName")}
               </span>
            </div>
         ),
         enableSorting: false,
         cell: ({ row }) => (
            <MemberTag1
               name={row.original.memberName}
               jobTitle={row.original.memberTitle}
               avatar={row.original.memberAvatar}
               avatarBg={row.original.memberAvatarBg}
               onClick={(e) => {
                  e.stopPropagation();
                  onInfoClick?.(row.original);
               }}
            />
         ),
         size: 200,
         filterFn: (row, columnId, filterValue) => {
            const name = row.getValue(columnId) as string;
            const id = row.original.id;
            const searchValue = filterValue.toLowerCase();
            return (
               name.toLowerCase().includes(searchValue) ||
               id.toLowerCase().includes(searchValue)
            );
         },
      },
      {
         accessorKey: "overtimeDate",
         header: () => (
            <div className="flex items-center gap-2">
               <Calender size={16} />
               <span className="text-sm font-medium">
                  {t("table.overtimeDate")}
               </span>
            </div>
         ),
         enableSorting: true,
         cell: ({ row }) => {
            const parsedDate = parseDate(row.original.overtimeDate);
            const overtimeDate =
               parsedDate || getMockOvertimeDate(row.original.id);
            return (
               <p className="text-sm text-text-strong">
                  {safeFormatDate(overtimeDate, "medium")}
               </p>
            );
         },
         size: 150,
      },
      {
         accessorKey: "overtimeTimeRange",
         header: () => (
            <div className="flex items-center gap-2">
               <ClockTwo size={16} />
               <span className="text-sm font-medium">
                  {t("table.overtime")}
               </span>
            </div>
         ),
         enableSorting: false,
         cell: ({ row }) => {
            const timeRange =
               row.original.overtimeTimeRange ||
               getMockOvertimeTimeRange(row.original.id);
            return <p className="text-sm text-text-strong">{timeRange}</p>;
         },
         size: 180,
      },
      {
         accessorKey: "duration",
         header: () => (
            <div className="flex items-center gap-2">
               <ClockTwo size={16} />
               <span className="text-sm font-medium">
                  {t("table.duration")}
               </span>
            </div>
         ),
         enableSorting: false,
         cell: ({ row }) => {
            const duration =
               row.original.duration || getMockDuration(row.original.id);
            return <p className="text-sm text-text-strong">{duration}</p>;
         },
         size: 150,
      },
      {
         accessorKey: "requestedAt",
         header: () => (
            <div className="flex items-center gap-2">
               <Files size={16} />
               <span className="text-sm font-medium">
                  {t("table.requestedDate")}
               </span>
            </div>
         ),
         enableSorting: true,
         cell: ({ getValue }) => (
            <p className="text-sm text-text-sub">
               {formatRequestedDate(getValue() as string)}
            </p>
         ),
         size: 150,
      },
      {
         accessorKey: "status",
         header: () => (
            <div className="flex items-center gap-2">
               <Tag size={16} />
               <span className="text-sm font-medium">{t("table.status")}</span>
            </div>
         ),
         enableSorting: false,
         cell: ({ row }) => {
            const status = row.original.status;
            const isPending = status === "Pending";
            const isApproved = status === "Approved";
            const isRejected = status === "Rejected";

            // Show action buttons for pending requests (only if user has permission)
            if (isPending && canApproveOvertime) {
               return (
                  <div className="flex items-center gap-2 justify-start">
                     <Button
                        onClick={(e) => {
                           e.stopPropagation();
                           onReject?.(row.original);
                        }}
                        className="!p-1 !bg-error/10 !border-0 !text-inherit hover:!bg-error/20 group"
                        aria-label={t("actions.reject")}>
                        <Xmark className="fill-error" />
                     </Button>
                     <Button
                        onClick={(e) => {
                           e.stopPropagation();
                           onApprove?.(row.original);
                        }}
                        className="!px-1.5 !py-1 !bg-text-strong !text-background !border-0 hover:!bg-text-strong/90">
                        <Check className="fill-background" />
                        <span>{t("actions.approve")}</span>
                     </Button>
                  </div>
               );
            }

            // Show status for non-pending or users without permission
            if (isPending) {
               return (
                  <RequestStatusCell
                     status="pending"
                     label={t("status.pending")}
                  />
               );
            }

            if (isApproved) {
               return (
                  <RequestStatusCell
                     status="approved"
                     label={t("status.approved")}
                  />
               );
            }

            if (isRejected) {
               return (
                  <RequestStatusCell
                     status="rejected"
                     label={t("status.rejected")}
                  />
               );
            }

            return null;
         },
         size: 200,
      },
   ];
}
