/** @format */

import type { Request } from "@/types/requests";
import { useTranslation } from "@/hooks/useTranslation";
import { useRequests } from "@/hooks/requests/useRequests";
import DetailCard from "@/designSystem/DetailCard";
import RequestDetailModal from "./RequestDetailModal";
import {
   parseDate,
   formatDate,
   formatRequestedAtWithTime,
} from "../utils/dateUtils";
import {
   getMockOvertimeDate,
   getMockOvertimeTimeRange,
   getMockDuration,
} from "../utils/mockData";
import MemberTag2 from "../ui/MemberTag2";

interface ApproveOvertimeModalProps {
   request: Request | null;
   isOpen: boolean;
   onClose: () => void;
   onApprove: (request: Request) => void;
   isPending?: boolean;
}

function ApproveOvertimeModal({
   request,
   isOpen,
   onClose,
   onApprove,
   isPending,
}: ApproveOvertimeModalProps) {
   const { t } = useTranslation("requests");
   const { useOvertimeDetail } = useRequests();

   // Fetch detailed overtime data to show compensation info
   const { data: overtimeDetail } = useOvertimeDetail(
      request ? parseInt(request.id) : 0,
      {
         enabled: !!request,
      }
   );

   if (!request) return null;

   // Get overtime date
   const parsedOvertimeDate = parseDate(request.overtimeDate);
   const overtimeDate = parsedOvertimeDate || getMockOvertimeDate(request.id);

   // Get overtime time range
   const overtimeTimeRange =
      request.overtimeTimeRange || getMockOvertimeTimeRange(request.id);

   // Get duration
   const duration = request.duration || getMockDuration(request.id);

   const handleApprove = () => {
      onApprove(request);
      onClose();
   };

   const content = (
      <DetailCard className="shadow-subtle border border-border p-3! gap-4!">
         {/* ID */}
         <div className="flex flex-col gap-2">
            <label className="text-sm text-text-sub">
               {t("approveOvertime.id")}
            </label>
            <p className="text-base text-text-strong">#{request.id}</p>
         </div>

         {/* Member Name */}
         <div className="flex flex-col gap-2">
            <label className="text-sm text-text-sub">
               {t("approveOvertime.memberName")}
            </label>
            <MemberTag2 avatar={request.memberAvatar} name={request.memberName} />
         </div>

         {/* Overtime Date */}
         <div className="flex flex-col gap-2">
            <label className="text-sm text-text-sub">
               {t("approveOvertime.overtimeDate")}
            </label>
            <p className="text-base text-text-strong">
               {formatDate(overtimeDate)}
            </p>
         </div>

         {/* Requested At */}
         <div className="flex flex-col gap-2">
            <label className="text-sm text-text-sub">
               {t("approveOvertime.requestedAt")}
            </label>
            <p className="text-base text-text-strong">
               {formatRequestedAtWithTime(request.requestedAt)}
            </p>
         </div>

         {/* Overtime */}
         <div className="flex flex-col gap-2">
            <label className="text-sm text-text-sub">
               {t("approveOvertime.overtime")}
            </label>
            <p className="text-base text-text-strong">{overtimeTimeRange}</p>
         </div>

         {/* Duration */}
         <div className="flex flex-col gap-2">
            <label className="text-sm text-text-sub">
               {t("approveOvertime.duration")}
            </label>
            <p className="text-base text-text-strong">{duration}</p>
         </div>

         {/* Reason */}
         <div className="flex flex-col gap-2">
            <label className="text-sm text-text-sub">
               {t("approveOvertime.reason")}
            </label>
            <p className="text-base text-text-strong">
               {overtimeDetail?.reason || "N/A"}
            </p>
         </div>

         {/* Compensation Info */}
         {overtimeDetail?.calculated_compensation && (
            <>
               <div className="border-t border-border pt-4 mt-2">
                  <h3 className="text-sm font-medium text-text-strong mb-3">
                     {t("approveOvertime.compensationInfo")}
                  </h3>
               </div>

               <div className="flex flex-col gap-2">
                  <label className="text-sm text-text-sub">
                     {t("approveOvertime.baseHourlyRate")}
                  </label>
                  <p className="text-base text-text-strong">
                     {overtimeDetail.calculated_compensation.base_hourly_rate}{" "}
                     AED
                  </p>
               </div>

               <div className="flex flex-col gap-2">
                  <label className="text-sm text-text-sub">
                     {t("approveOvertime.overtimeMultiplier")}
                  </label>
                  <p className="text-base text-text-strong">
                     {
                        overtimeDetail.calculated_compensation
                           .overtime_multiplier
                     }
                     x
                  </p>
               </div>

               <div className="flex flex-col gap-2">
                  <label className="text-sm text-text-sub">
                     {t("approveOvertime.totalCompensation")}
                  </label>
                  <p className="text-base text-success font-semibold">
                     {overtimeDetail.calculated_compensation.total_amount}{" "}
                     AED
                  </p>
               </div>
            </>
         )}
      </DetailCard>
   );

   return (
      <RequestDetailModal
         request={request}
         isOpen={isOpen}
         onClose={onClose}
         titleKey="approveOvertime.title"
         cancelLabelKey="approveOvertime.cancel"
         content={content}
         actionButton={{
            label: t("approveOvertime.approveButton"),
            onClick: handleApprove,
            variant: "primary",
            isLoading: isPending,
         }}
      />
   );
}

export default ApproveOvertimeModal;
