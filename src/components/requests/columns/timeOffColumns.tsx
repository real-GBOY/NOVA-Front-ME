/** @format */

import { ColumnDef } from "@tanstack/react-table";
import { useTranslation } from "@/hooks/useTranslation";
import {
   UserSimpleAlt,
   Files,
   Calender,
   Check,
   Xmark,
   Briefcase,
} from "@/Icons";
import type { Request } from "@/types/requests";
import Button from "@/designSystem/Button";
import MemberTag1 from "@/components/contracts/MemberTag1";
import RequestStatusCell from "@/components/members/memberProfile/tabs/TimeManagmentTab/shared/RequestStatusCell";
import AttachmentLink from "@/components/members/memberProfile/tabs/TimeManagmentTab/shared/AttachmentLink";
import { formatDate } from "@/utilities/i18n";
import { parseDate, formatRequestedDate } from "../utils/dateUtils";
import {
   getMockStartDate,
   getMockEndDate,
   getMockLeaveType,
} from "../utils/mockData";

type TimeOffColumnsProps = {
   onApprove?: (request: Request) => void;
   onReject?: (request: Request) => void;
   canApproveTimeOff?: boolean;
};

export function useTimeOffColumns({
   onApprove,
   onReject,
   canApproveTimeOff = false,
}: TimeOffColumnsProps): ColumnDef<Request>[] {
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
         cell: ({ getValue }) => (
            <p className="text-sm text-text-strong font-medium">
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
         accessorKey: "startDate",
         header: () => (
            <div className="flex items-center gap-2">
               <Calender size={16} />
               <span className="text-sm font-medium">
                  {t("table.startDate")}
               </span>
            </div>
         ),
         enableSorting: true,
         cell: ({ row }) => {
            const parsedDate = parseDate(row.original.startDate);
            const startDate = parsedDate || getMockStartDate(row.original.id);
            return (
               <p className="text-sm text-text-strong">
                  {safeFormatDate(startDate, "medium")}
               </p>
            );
         },
         size: 150,
      },
      {
         accessorKey: "endDate",
         header: () => (
            <div className="flex items-center gap-2">
               <Calender size={16} />
               <span className="text-sm font-medium">{t("table.endDate")}</span>
            </div>
         ),
         enableSorting: true,
         cell: ({ row }) => {
            const parsedStartDate = parseDate(row.original.startDate);
            const startDate =
               parsedStartDate || getMockStartDate(row.original.id);
            const parsedEndDate = parseDate(row.original.endDate);
            const endDate =
               parsedEndDate || getMockEndDate(row.original.id, startDate);
            return (
               <p className="text-sm text-text-strong">
                  {safeFormatDate(endDate, "medium")}
               </p>
            );
         },
         size: 150,
      },
      {
         accessorKey: "leaveType",
         header: () => (
            <div className="flex items-center gap-2">
               <Briefcase size={16} />
               <span className="text-sm font-medium">
                  {t("table.leaveType")}
               </span>
            </div>
         ),
         enableSorting: false,
         cell: ({ getValue }) => {
            const leaveType =
               (getValue() as string) || getMockLeaveType(row.original.id);
            return <p className="text-sm text-text-strong">{leaveType}</p>;
         },
         size: 150,
      },
      {
         accessorKey: "requestedAt",
         header: () => (
            <div className="flex items-center gap-2">
               <Calender size={16} />
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
         accessorKey: "attachment",
         header: () => (
            <div className="flex items-center gap-2">
               <Files size={16} />
               <span className="text-sm font-medium">
                  {t("table.attachment")}
               </span>
            </div>
         ),
         enableSorting: false,
         cell: ({ getValue }) => {
            const attachment = getValue() as Request["attachment"];

            if (!attachment) {
               return (
                  <span className="text-sm text-text-sub">No Atachment</span>
               );
            }

            return (
               <AttachmentLink
                  attachment={attachment}
                  onClick={(e) => {
                     e.stopPropagation();
                     // Attachment click removed - row click now handles modal opening
                  }}
               />
            );
         },
         size: 200,
      },
      {
         accessorKey: "status",
         header: () => (
            <div className="flex items-center gap-2">
               <Check size={16} />
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
            if (isPending && canApproveTimeOff) {
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
