/** @format */

import { ColumnDef } from "@tanstack/react-table";
import { useTranslation } from "@/hooks/useTranslation";
import { UserSimpleAlt, Files, Calender, Check, Xmark, Tag } from "@/Icons";
import type { Request } from "@/types/requests";
import BadgeTag from "@/designSystem/BadgeTag";
import Button from "@/designSystem/Button";
import MemberTag1 from "@/components/contracts/MemberTag1";
import RequestStatusCell from "@/components/members/memberProfile/tabs/TimeManagmentTab/shared/RequestStatusCell";
import { formatRequestedDate } from "../utils/dateUtils";

// const AVATAR_BASE_URL = "https://bak-uploads-001.s3.me-central-1.amazonaws.com/";

type AttendanceColumnsProps = {
   onApprove?: (request: Request) => void;
   onReject?: (request: Request) => void;
   onGpsStatusClick?: (request: Request) => void;
   canApproveAttendance?: boolean;
};

export function useAttendanceColumns({
   onApprove,
   onReject,
   onGpsStatusClick,
   canApproveAttendance = false,
}: AttendanceColumnsProps): ColumnDef<Request>[] {
   const { t } = useTranslation("requests");

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
         enableSorting: false,
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
                           String(name || "").toLowerCase().includes(searchValue) ||
                           String(id || "").toLowerCase().includes(searchValue)            );
         },
      },
      {
         accessorKey: "requestType",
         header: () => (
            <div className="flex items-center gap-2">
               <Files size={16} />
               <span className="text-sm font-medium">
                  {t("table.requestType")}
               </span>
            </div>
         ),
         enableSorting: false,
         cell: ({ getValue }) => (
            <p className="text-sm text-text-sub">{getValue() as string}</p>
         ),
         size: 150,
      },
      {
         accessorKey: "requestedAt",
         header: () => (
            <div className="flex items-center gap-2">
               <Calender size={16} />
               <span className="text-sm font-medium">
                  {t("table.requestedAt")}
               </span>
            </div>
         ),
         enableSorting: false,
         cell: ({ getValue }) => (
            <p className="text-sm text-text-sub">
               {formatRequestedDate(getValue() as string)}
            </p>
         ),
         size: 180,
      },
      {
         accessorKey: "gpsStatus",
         header: () => (
            <div className="flex items-center gap-2">
               <Tag size={16} />
               <span className="text-sm font-medium">
                  {t("table.gpsStatus")}
               </span>
            </div>
         ),
         enableSorting: false,
         cell: ({ row }) => {
            const gpsStatus = row.original.gpsStatus;

            // If gpsStatus is undefined/null, show "Unknown"
            const displayStatus = gpsStatus || "Unknown";
            const isInZone = gpsStatus === "In Zone";
            const isOutOfZone = gpsStatus === "Out of Zone";
            const isUnknown = !gpsStatus;

            // Determine variant based on status
            let variant: "success" | "warning" | "info" = "info";
            if (isInZone) variant = "success";
            else if (isOutOfZone) variant = "warning";
            else if (isUnknown) variant = "info";

            return (
               <Button
                  onClick={(e) => {
                     e.stopPropagation();
                     onGpsStatusClick?.(row.original);
                  }}
                  className="!p-0 !bg-transparent !border-0 cursor-pointer hover:opacity-80 transition-opacity">
                  <BadgeTag label={displayStatus} variant={variant} size="sm" />
               </Button>
            );
         },
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
            if (isPending && canApproveAttendance) {
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
