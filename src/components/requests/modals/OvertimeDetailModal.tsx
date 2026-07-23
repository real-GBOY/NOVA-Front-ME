/** @format */

import type { Request } from "@/types/requests";
import { useTranslation } from "@/hooks/useTranslation";
import { useRequests } from "@/hooks/requests/useRequests";
import DetailCard from "@/designSystem/DetailCard";
import RequestDetailModal from "./RequestDetailModal";
import DetailField from "../ui/DetailField";
import MemberTag2 from "../ui/MemberTag2";
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

interface OvertimeDetailModalProps {
   request: Request | null;
   isOpen: boolean;
   onClose: () => void;
}

function OvertimeDetailModal({
   request,
   isOpen,
   onClose,
}: OvertimeDetailModalProps) {
   const { t } = useTranslation("requests");
   const { useOvertimeDetail } = useRequests();

   // Fetch detailed overtime data from API
   // Only enable when we have a valid request ID
   const { data: overtimeDetail, isLoading } = useOvertimeDetail(
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

   const content = (
      <DetailCard className="shadow-subtle border border-border p-3! gap-4!">
         {isLoading ? (
            <div className="flex items-center justify-center py-8">
               <p className="text-sm text-text-sub">
                  {t("overtimeDetail.loading", "Loading overtime details...")}
               </p>
            </div>
         ) : (
            <>
               <DetailField label={t("overtimeDetail.id")}>
                  <p className="text-base leading-6 tracking-[-0.176px] text-text-strong">
                     #{request.id}
                  </p>
               </DetailField>

               <DetailField label={t("overtimeDetail.memberName")}>
                  <MemberTag2
                     avatar={request.memberAvatar}
                     name={request.memberName}
                  />
               </DetailField>

               {overtimeDetail?.employee.job_title && (
                  <DetailField label={t("overtimeDetail.jobTitle")}>
                     <p className="text-base leading-6 tracking-[-0.176px] text-text-strong">
                        {overtimeDetail.employee.job_title}
                     </p>
                  </DetailField>
               )}

               <DetailField label={t("overtimeDetail.overtimeDate")}>
                  <p className="text-base leading-6 tracking-[-0.176px] text-text-strong">
                     {formatDate(overtimeDate)}
                  </p>
               </DetailField>

               <DetailField label={t("overtimeDetail.requestedAt")}>
                  <p className="text-base leading-6 tracking-[-0.176px] text-text-strong">
                     {formatRequestedAtWithTime(request.requestedAt)}
                  </p>
               </DetailField>

               <DetailField label={t("overtimeDetail.overtime")}>
                  <p className="text-base leading-6 tracking-[-0.176px] text-text-strong">
                     {overtimeTimeRange}
                  </p>
               </DetailField>

               <DetailField label={t("overtimeDetail.duration")}>
                  <p className="text-base leading-6 tracking-[-0.176px] text-text-strong">
                     {duration}
                  </p>
               </DetailField>

               <DetailField label={t("overtimeDetail.reason")}>
                  <p className="text-base leading-6 tracking-[-0.176px] text-text-strong">
                     {overtimeDetail?.reason || "N/A"}
                  </p>
               </DetailField>

               {/* Compensation Details */}
               {overtimeDetail?.calculated_compensation && (
                  <>
                     <div className="border-t border-border pt-4 mt-2">
                        <h3 className="text-sm font-medium text-text-strong mb-3">
                           {t("overtimeDetail.compensationDetails")}
                        </h3>
                     </div>

                     <DetailField label={t("overtimeDetail.baseHourlyRate")}>
                        <p className="text-base leading-6 tracking-[-0.176px] text-text-strong">
                           {
                              overtimeDetail.calculated_compensation
                                 .base_hourly_rate
                           }{" "}
                           AED
                        </p>
                     </DetailField>

                     <DetailField
                        label={t("overtimeDetail.overtimeMultiplier")}>
                        <p className="text-base leading-6 tracking-[-0.176px] text-text-strong">
                           {
                              overtimeDetail.calculated_compensation
                                 .overtime_multiplier
                           }
                           x
                        </p>
                     </DetailField>

                     <DetailField label={t("overtimeDetail.totalAmount")}>
                        <p className="text-base leading-6 tracking-[-0.176px] text-success font-medium">
                           {overtimeDetail.calculated_compensation.total_amount}{" "}
                           AED
                        </p>
                     </DetailField>
                  </>
               )}

               {/* Approval/Rejection Info */}
               {overtimeDetail?.approved_by && (
                  <>
                     <div className="border-t border-border pt-4 mt-2" />
                     <DetailField label={t("overtimeDetail.approvedBy")}>
                        <p className="text-base leading-6 tracking-[-0.176px] text-text-strong">
                           {overtimeDetail.approved_by.name}
                        </p>
                     </DetailField>
                     <DetailField label={t("overtimeDetail.approvedAt")}>
                        <p className="text-base leading-6 tracking-[-0.176px] text-text-strong">
                           {formatRequestedAtWithTime(
                              overtimeDetail.approved_at || ""
                           )}
                        </p>
                     </DetailField>
                  </>
               )}

               {overtimeDetail?.rejection_reason && (
                  <>
                     <div className="border-t border-border pt-4 mt-2" />
                     <DetailField label={t("overtimeDetail.rejectionReason")}>
                        <p className="text-base leading-6 tracking-[-0.176px] text-danger">
                           {overtimeDetail.rejection_reason}
                        </p>
                     </DetailField>
                  </>
               )}

               {overtimeDetail?.comments && (
                  <DetailField label={t("overtimeDetail.comments")}>
                     <p className="text-base leading-6 tracking-[-0.176px] text-text-strong">
                        {overtimeDetail.comments}
                     </p>
                  </DetailField>
               )}
            </>
         )}
      </DetailCard>
   );

   return (
      <RequestDetailModal
         request={request}
         isOpen={isOpen}
         onClose={onClose}
         titleKey="overtimeDetail.title"
         cancelLabelKey="overtimeDetail.cancel"
         content={content}
      />
   );
}

export default OvertimeDetailModal;
