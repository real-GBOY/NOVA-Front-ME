/** @format */

import { useEffect, useState } from "react";
import type { Request } from "@/types/requests";
import { useTranslation } from "@/hooks/useTranslation";
import DetailCard from "@/designSystem/DetailCard";
import RequestDetailModal from "./RequestDetailModal";
import RejectionReasonInput from "../ui/RejectionReasonInput";
import BadgeTag from "@/designSystem/BadgeTag";
import DetailField from "../ui/DetailField";
import MemberTag2 from "../ui/MemberTag2";
import { useQuery } from "@tanstack/react-query";
import { reactQueryKeys } from "@/config/reactQueryKeys";
import { requestsService } from "@/services/requestsService";
import Loader from "@/designSystem/Loader";
import AttendanceLocationMap from "./AttendanceLocationMap";

interface RejectAttendanceModalProps {
   request: Request | null;
   isOpen: boolean;
   onClose: () => void;
   onReject: (request: Request, reason: string) => void;
}

function RejectAttendanceModal({
   request,
   isOpen,
   onClose,
   onReject,
}: RejectAttendanceModalProps) {
   const { t } = useTranslation(["requests", "common"]);
   const [rejectionReason, setRejectionReason] = useState("He is out of zone");
   const requestId = request?.id;

   useEffect(() => {
      if (isOpen) {
         setRejectionReason("He is out of zone");
      }
   }, [isOpen]);

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

   const handleReject = () => {
      onReject(request, rejectionReason);
      onClose();
   };

   const content = (
      <DetailCard className="shadow-subtle border border-border p-3! gap-4!">
         <DetailField label={t("rejectAttendance.id")}>
            <p className="text-base leading-6 tracking-[-0.176px] text-text-strong">
               #{request.id}
            </p>
         </DetailField>

         <DetailField label={t("rejectAttendance.memberName")}>
            <MemberTag2
               avatar={request.memberAvatar}
               name={request.memberName}
            />
         </DetailField>

         <DetailField label={t("rejectAttendance.requestType")}>
            <p className="text-base leading-6 tracking-[-0.176px] text-text-strong">
               {request.requestType}
            </p>
         </DetailField>

         <DetailField label={t("rejectAttendance.requestedAt")}>
            <p className="text-base leading-6 tracking-[-0.176px] text-text-strong">
               {request.requestedAt}
            </p>
         </DetailField>

         <DetailField label={t("rejectAttendance.gpsStatus")}>
            <BadgeTag label={gpsStatus} variant={gpsVariant} />
         </DetailField>

         <DetailField label={t("rejectAttendance.location")}>
            {isLoading ? (
               <div className="w-full h-[237px] rounded-xl overflow-hidden border border-border flex items-center justify-center">
                  <Loader label={t("common.loading", "Loading...")} />
               </div>
            ) : (
               <AttendanceLocationMap
                  details={details}
                  isOpen={isOpen}
                  mapId="attendance-leaflet-map-reject"
                  heightClassName="h-[237px]"
               />
            )}
         </DetailField>

         <DetailField label={t("rejectAttendance.rejectionReason")}>
            <RejectionReasonInput
               value={rejectionReason}
               onChange={setRejectionReason}
               placeholder={t("rejectAttendance.rejectionReasonPlaceholder")}
            />
         </DetailField>
      </DetailCard>
   );

   return (
      <RequestDetailModal
         request={request}
         isOpen={isOpen}
         onClose={onClose}
         titleKey="rejectAttendance.title"
         cancelLabelKey="rejectAttendance.cancel"
         content={content}
         actionButton={{
            label: t("rejectAttendance.rejectButton"),
            onClick: handleReject,
            variant: "danger",
         }}
      />
   );
}

export default RejectAttendanceModal;
