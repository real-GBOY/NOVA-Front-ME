/** @format */

import { Check } from "@/Icons";
import Xmark from "@/Icons/xmark";

interface RequestActionsProps {
   id: string;
   onApprove: (id: string) => void;
   onReject: (id: string) => void;
   approveLabel: string;
   rejectAriaLabel: string;
}

/**
 * Reusable action buttons component for pending requests
 * Displays Reject and Approve buttons with consistent styling
 * Used in TimeOffRequestsTable and OvertimeTable
 */
function RequestActions({
   id,
   onApprove,
   onReject,
   approveLabel,
   rejectAriaLabel,
}: RequestActionsProps) {
   return (
      <div className="flex items-center gap-2 justify-start">
         <button
            onClick={(e) => {
               e.stopPropagation();
               onReject(id);
            }}
            className="flex items-center justify-center p-1 bg-background border border-error rounded-lg transition-all hover:bg-error/5 hover:border-danger group"
            aria-label={rejectAriaLabel}>
            <Xmark className="fill-error" />
         </button>
         <button
            onClick={(e) => {
               e.stopPropagation();
               onApprove(id);
            }}
            className="flex items-center gap-1 px-1.5 py-1 bg-text-strong text-background rounded-lg text-sm font-medium transition-all hover:bg-text-strong/90">
            <Check className="fill-background" />
            <span>{approveLabel}</span>
         </button>
      </div>
   );
}

export default RequestActions;
