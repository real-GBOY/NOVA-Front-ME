/** @format */

import { useEffect, useState } from "react";
import type { Request } from "@/types/requests";
import { useTranslation } from "@/hooks/useTranslation";
import { useRequests } from "@/hooks/requests/useRequests";
import DetailCard from "@/designSystem/DetailCard";
import RequestDetailModal from "./RequestDetailModal";
import RejectionReasonInput from "../ui/RejectionReasonInput";
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

interface RejectOvertimeModalProps {
   request: Request | null;
   isOpen: boolean;
   onClose: () => void;
   onReject: (request: Request, reason: string) => void;
   isPending?: boolean;
}

function RejectOvertimeModal({
   request,
   isOpen,
   onClose,
   onReject,
   isPending,
}: RejectOvertimeModalProps) {
   const { t } = useTranslation("requests");
   const { useOvertimeDetail } = useRequests();
   const [rejectionReason, setRejectionReason] = useState("");

   // Fetch detailed overtime data to show the reason
   const { data: overtimeDetail } = useOvertimeDetail(
      request ? parseInt(request.id) : 0,
      {
         enabled: !!request,
      }
   );

   useEffect(() => {
      if (isOpen) {
         setRejectionReason("");
      }
   }, [isOpen]);

   if (!request) return null;

   // Get overtime date
   const parsedOvertimeDate = parseDate(request.overtimeDate);
   const overtimeDate = parsedOvertimeDate || getMockOvertimeDate(request.id);

   // Get overtime time range
   const overtimeTimeRange =
      request.overtimeTimeRange || getMockOvertimeTimeRange(request.id);

   // Get duration
   const duration = request.duration || getMockDuration(request.id);

   const handleReject = () => {
      onReject(request, rejectionReason);
      onClose();
   };

   const content = (
      <div className="flex flex-col gap-6">
         {/* Overtime Request Details Card */}
         <DetailCard className="shadow-subtle border border-border p-3! gap-4!">
            {/* ID */}
            <div className="flex flex-col gap-2">
               <label className="text-sm text-text-sub">
                  {t("rejectOvertime.id")}
               </label>
               <p className="text-base text-text-strong">#{request.id}</p>
            </div>

            {/* Member Name */}
            <div className="flex flex-col gap-2">
               <label className="text-sm text-text-sub">
                  {t("rejectOvertime.memberName")}
               </label>
               <MemberTag2 avatar={request.memberAvatar} name={request.memberName} />
            </div>

            {/* Overtime Date */}
            <div className="flex flex-col gap-2">
               <label className="text-sm text-text-sub">
                  {t("rejectOvertime.overtimeDate")}
               </label>
               <p className="text-base text-text-strong">
                  {formatDate(overtimeDate)}
               </p>
            </div>

            {/* Requested At */}
            <div className="flex flex-col gap-2">
               <label className="text-sm text-text-sub">
                  {t("rejectOvertime.requestedAt")}
               </label>
               <p className="text-base text-text-strong">
                  {formatRequestedAtWithTime(request.requestedAt)}
               </p>
            </div>

            {/* Overtime */}
            <div className="flex flex-col gap-2">
               <label className="text-sm text-text-sub">
                  {t("rejectOvertime.overtime")}
               </label>
               <p className="text-base text-text-strong">{overtimeTimeRange}</p>
            </div>

            {/* Duration */}
            <div className="flex flex-col gap-2">
               <label className="text-sm text-text-sub">
                  {t("rejectOvertime.duration")}
               </label>
               <p className="text-base text-text-strong">{duration}</p>
            </div>

            {/* Reason */}
            <div className="flex flex-col gap-2">
               <label className="text-sm text-text-sub">
                  {t("rejectOvertime.reason")}
               </label>
               <p className="text-base text-text-strong">
                  {overtimeDetail?.reason || "N/A"}
               </p>
            </div>
         </DetailCard>

         {/* Rejection Reason Card */}
         <DetailCard className="shadow-subtle border border-border p-3! gap-4!">
            <label className="text-sm text-text-sub">
               {t("rejectOvertime.rejectionReason")}
               <span className="text-danger ms-1">*</span>
            </label>
            <RejectionReasonInput
               value={rejectionReason}
               onChange={setRejectionReason}
               placeholder={t("rejectOvertime.rejectionReasonPlaceholder")}
            />
         </DetailCard>
      </div>
   );

   return (
      <RequestDetailModal
         request={request}
         isOpen={isOpen}
         onClose={onClose}
         titleKey="rejectOvertime.title"
         cancelLabelKey="rejectOvertime.cancel"
         content={content}
         actionButton={{
            label: t("rejectOvertime.rejectButton"),
            onClick: handleReject,
            variant: "danger",
            isLoading: isPending,
         }}
      />
   );
}

export default RejectOvertimeModal;
