/** @format */

import { ErrorWarningFill, SelectBoxCircleFill } from "@/Icons";

type RequestStatus = "pending" | "approved" | "rejected" | "completed";

interface RequestStatusCellProps {
   status: RequestStatus;
   label: string;
}

/**
 * Reusable status cell component for displaying request statuses
 * Used in TimeOffRequestsTable and OvertimeTable
 */
function RequestStatusCell({ status, label }: RequestStatusCellProps) {
   const statusConfig = {
      pending: {
         icon: <ErrorWarningFill size={16} className="fill-warning" />,
         textColor: "text-warning",
      },
      approved: {
         icon: <SelectBoxCircleFill size={16} className="fill-success" />,
         textColor: "text-success",
      },
      completed: {
         icon: <SelectBoxCircleFill size={16} className="fill-success" />,
         textColor: "text-success",
      },
      rejected: {
         icon: <ErrorWarningFill size={16} className="fill-error" />,
         textColor: "text-error",
      },
   };

   const config = statusConfig[status];
   const baseClasses =
      "inline-flex items-center gap-1 ps-1 pe-2 py-0.5 border border-border rounded-md bg-background leading-4";

   return (
      <div className={baseClasses}>
         {config.icon}
         <span className={`text-xs font-medium ${config.textColor}`}>
            {label}
         </span>
      </div>
   );
}

export default RequestStatusCell;
