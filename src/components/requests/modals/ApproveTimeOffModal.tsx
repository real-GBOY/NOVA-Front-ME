/** @format */

import type { Request } from "@/types/requests";
import { useTranslation } from "@/hooks/useTranslation";
import DetailCard from "@/designSystem/DetailCard";
import RequestDetailModal from "./RequestDetailModal";
import AttachmentDisplay from "../ui/AttachmentDisplay";
import {
   parseDate,
   formatDurationDate,
   formatRequestedAtWithTime,
} from "../utils/dateUtils";
import MemberTag2 from "../ui/MemberTag2";
import { useRequests } from "@/hooks/requests/useRequests";
import Loader from "@/designSystem/Loader";

interface ApproveTimeOffModalProps {
   request: Request | null;
   isOpen: boolean;
   onClose: () => void;
   onApprove: (request: Request) => void;
   isPending?: boolean;
}

function ApproveTimeOffModal({
   request,
   isOpen,
   onClose,
   onApprove,
   isPending,
}: ApproveTimeOffModalProps) {
   const { t } = useTranslation("requests");
   const { useTimeOffDetail } = useRequests();

   const { data: details, isLoading } = useTimeOffDetail(
      request ? parseInt(request.id) : 0,
      {
         enabled: !!request?.id && isOpen,
      }
   );

   if (!request) return null;

   // Get start and end dates from detail or fallback to request
   const startDate = details
      ? parseDate(details.start_date)
      : parseDate(request.startDate);
   const endDate = details
      ? parseDate(details.end_date)
      : parseDate(request.endDate);

   // Use days_requested from API if available, otherwise calculate from dates
   const durationDays = details?.days_requested ?? (startDate && endDate
      ? Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
      : 0);

   const handleApprove = () => {
      onApprove(request);
      onClose();
   };

   const content = (
      <DetailCard className="shadow-subtle border border-border p-3! gap-4!">
         {isLoading ? (
            <div className="flex justify-center py-10">
               <Loader label={t("common.loading", "Loading details...")} />
            </div>
         ) : details ? (
            <>
               {/* ID */}
               <div className="flex flex-col gap-2">
                  <label className="text-sm text-text-sub">
                     {t("approveTimeOff.id")}
                  </label>
                  <p className="text-lg font-semibold text-text-strong">
                     #{details.id}
                  </p>
               </div>

               {/* Member Name */}
               <div className="flex flex-col gap-2">
                  <label className="text-sm text-text-sub">
                     {t("approveTimeOff.memberName")}
                  </label>
                  <MemberTag2
                     avatar={details.employee.avatar || request.memberAvatar}
                     name={details.employee.name || request.memberName}
                  />
               </div>

               {/* Request Type */}
               <div className="flex flex-col gap-2">
                  <label className="text-sm text-text-sub">
                     {t("approveTimeOff.requestType")}
                  </label>
                  <p className="text-lg font-semibold text-text-strong">
                     {details.vacation_type?.name || request.leaveType}
                  </p>
               </div>

               {/* Requested At */}
               <div className="flex flex-col gap-2">
                  <label className="text-sm text-text-sub">
                     {t("approveTimeOff.requestedAt")}
                  </label>
                  <p className="text-lg font-semibold text-text-strong">
                     {formatRequestedAtWithTime(
                        details.created_at || request.requestedAt
                     )}
                  </p>
               </div>

               {/* Duration */}
               <div className="flex flex-col gap-2">
                  <label className="text-sm text-text-sub">
                     {t("approveTimeOff.duration")}
                  </label>
                  <div className="flex items-center justify-between">
                     <p className="text-lg font-semibold text-text-strong">
                        {startDate && endDate
                           ? `${formatDurationDate(
                                startDate
                             )}  -  ${formatDurationDate(endDate)}`
                           : "-"}
                     </p>
                     {durationDays > 0 && (
                        <span className="text-sm text-text-sub">
                           {durationDays}{" "}
                           {durationDays === 1
                              ? t("approveTimeOff.day")
                              : t("approveTimeOff.days")}
                        </span>
                     )}
                  </div>
               </div>

               {/* Reason */}
               <div className="flex flex-col gap-2">
                  <label className="text-sm text-text-sub">
                     {t("approveTimeOff.reason")}
                  </label>
                  <p className="text-lg font-semibold text-text-strong">
                     {details.reason || "-"}
                  </p>
               </div>

               {/* Attachment */}
               <div className="flex flex-col gap-2">
                  <label className="text-sm text-text-sub">
                     {t("approveTimeOff.attachment")}
                  </label>
                  {details.attachment ? (
                     <AttachmentDisplay
                        filename={details.attachment.filename || "attachment"}
                        url={details.attachment.url || ""}
                        mimeType={details.attachment.mime_type}
                     />
                  ) : (
                     <p className="text-lg font-semibold text-text-sub">
                        No Atachment
                     </p>
                  )}
               </div>
            </>
         ) : (
            <div className="text-center py-4 text-text-sub">
               Failed to load details
            </div>
         )}
      </DetailCard>
   );

   return (
      <RequestDetailModal
         request={request}
         isOpen={isOpen}
         onClose={onClose}
         titleKey="approveTimeOff.title"
         cancelLabelKey="approveTimeOff.cancel"
         content={content}
         actionButton={{
            label: t("approveTimeOff.approveButton"),
            onClick: handleApprove,
            variant: "primary",
            isLoading: isPending,
         }}
      />
   );
}

export default ApproveTimeOffModal;
