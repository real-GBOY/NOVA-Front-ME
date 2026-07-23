/** @format */

import type { Request } from "@/types/requests";
import { useTranslation } from "@/hooks/useTranslation";
import DetailCard from "@/designSystem/DetailCard";
import RequestDetailModal from "./RequestDetailModal";
import BadgeTag from "@/designSystem/BadgeTag";
import DetailField from "../ui/DetailField";
import MemberTag2 from "../ui/MemberTag2";
import { useQuery } from "@tanstack/react-query";
import { reactQueryKeys } from "@/config/reactQueryKeys";
import { requestsService } from "@/services/requestsService";
import Loader from "@/designSystem/Loader";
import AttendanceLocationMap from "./AttendanceLocationMap";

interface ApproveAttendanceModalProps {
   request: Request | null;
   isOpen: boolean;
   onClose: () => void;
   onApprove: (request: Request) => void;
}

function ApproveAttendanceModal({
   request,
   isOpen,
   onClose,
   onApprove,
}: ApproveAttendanceModalProps) {
   const { t } = useTranslation(["requests", "common"]);
   const requestId = request?.id;

   const { data: details, isLoading } = useQuery({
      queryKey: reactQueryKeys.requests.attendance.detail(requestId || ""),
      queryFn: () => requestsService.getAttendanceRequestById(requestId || ""),
      enabled: !!requestId && isOpen,
   });

   if (!request) return null;

   const gpsStatus = request.gpsStatus || "Unknown";
   const gpsVariant =
      gpsStatus === "In zone"
         ? "success"
         : gpsStatus === "Out of zone"
         ? "warning"
         : "info"; // Unknown status

   const handleApprove = () => {
      onApprove(request);
      onClose();
   };

   const content = (
      <DetailCard className="shadow-subtle border border-border p-3! gap-4!">
         <DetailField label={t("approveAttendance.id")}>
            <p className="text-base leading-6 tracking-[-0.176px] text-text-strong">
               #{request.id}
            </p>
         </DetailField>

         <DetailField label={t("approveAttendance.memberName")}>
            <MemberTag2
               avatar={request.memberAvatar}
               name={request.memberName}
            />
         </DetailField>

         <DetailField label={t("approveAttendance.requestType")}>
            <p className="text-base leading-6 tracking-[-0.176px] text-text-strong">
               {request.requestType}
            </p>
         </DetailField>

         <DetailField label={t("approveAttendance.requestedAt")}>
            <p className="text-base leading-6 tracking-[-0.176px] text-text-strong">
               {request.requestedAt}
            </p>
         </DetailField>

         <DetailField label={t("approveAttendance.gpsStatus")}>
            <BadgeTag label={gpsStatus} variant={gpsVariant} />
         </DetailField>

         <DetailField label={t("approveAttendance.location")}>
            {isLoading ? (
               <div className="w-full h-[237px] rounded-xl overflow-hidden border border-border flex items-center justify-center">
                  <Loader label={t("common.loading", "Loading...")} />
               </div>
            ) : (
               <AttendanceLocationMap
                  details={details}
                  isOpen={isOpen}
                  mapId="attendance-leaflet-map-approve"
                  heightClassName="h-[237px]"
               />
            )}
         </DetailField>
      </DetailCard>
   );

   return (
      <RequestDetailModal
         request={request}
         isOpen={isOpen}
         onClose={onClose}
         titleKey="approveAttendance.title"
         cancelLabelKey="approveAttendance.cancel"
         content={content}
         actionButton={{
            label: t("approveAttendance.approveButton"),
            onClick: handleApprove,
            variant: "primary",
         }}
      />
   );
}

export default ApproveAttendanceModal;
