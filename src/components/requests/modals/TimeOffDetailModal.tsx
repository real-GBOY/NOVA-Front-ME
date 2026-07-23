/** @format */

import type { Request } from "@/types/requests";
import { useTranslation } from "@/hooks/useTranslation";
import DetailCard from "@/designSystem/DetailCard";
import RequestDetailModal from "./RequestDetailModal";
import AttachmentDisplay from "../ui/AttachmentDisplay";
import DetailField from "../ui/DetailField";
import MemberTag2 from "../ui/MemberTag2";
import {
   parseDate,
   formatDurationDate,
   formatRequestedAtWithTime,
} from "../utils/dateUtils";
import { useRequests } from "@/hooks/requests/useRequests";
import Loader from "@/designSystem/Loader";

interface TimeOffDetailModalProps {
   request: Request | null;
   isOpen: boolean;
   onClose: () => void;
}

function TimeOffDetailModal({
   request,
   isOpen,
   onClose,
}: TimeOffDetailModalProps) {
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

   const content = (
      <DetailCard className="shadow-subtle border border-border p-3! gap-4!">
         {isLoading ? (
            <div className="flex justify-center py-10">
               <Loader label={t("common.loading", "Loading details...")} />
            </div>
         ) : details ? (
            <>
               <DetailField label={t("timeOffDetail.id")}>
                  <p className="text-base leading-6 tracking-[-0.176px] text-text-strong">
                     #{details.id}
                  </p>
               </DetailField>

               <DetailField label={t("timeOffDetail.memberName")}>
                  <MemberTag2
                     avatar={details.employee.avatar || request.memberAvatar}
                     name={details.employee.name || request.memberName}
                  />
               </DetailField>

               <DetailField label={t("timeOffDetail.requestType")}>
                  <p className="text-base leading-6 tracking-[-0.176px] text-text-strong">
                     {details.vacation_type?.name || request.leaveType}
                  </p>
               </DetailField>

               <DetailField label={t("timeOffDetail.requestedAt")}>
                  <p className="text-base leading-6 tracking-[-0.176px] text-text-strong">
                     {formatRequestedAtWithTime(
                        details.created_at || request.requestedAt
                     )}
                  </p>
               </DetailField>

               <DetailField label={t("timeOffDetail.duration")}>
                  <div className="flex items-center justify-between">
                     <p className="text-base leading-6 tracking-[-0.176px] text-text-strong">
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
                              ? t("timeOffDetail.day")
                              : t("timeOffDetail.days")}
                        </span>
                     )}
                  </div>
               </DetailField>

               <DetailField label={t("timeOffDetail.reason")}>
                  <p className="text-base leading-6 tracking-[-0.176px] text-text-strong">
                     {details.reason || "-"}
                  </p>
               </DetailField>

               <DetailField label={t("timeOffDetail.attachment")}>
                  {details.attachment ? (
                     <AttachmentDisplay
                        filename={details.attachment.filename || "attachment"}
                        url={details.attachment.url || ""}
                        mimeType={details.attachment.mime_type}
                     />
                  ) : (
                     <p className="text-base leading-6 tracking-[-0.176px] text-text-sub">
                        No Atachment
                     </p>
                  )}
               </DetailField>
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
         titleKey="timeOffDetail.title"
         cancelLabelKey="timeOffDetail.cancel"
         content={content}
      />
   );
}

export default TimeOffDetailModal;
