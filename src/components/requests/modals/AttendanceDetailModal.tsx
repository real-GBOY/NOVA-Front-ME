import type { Request } from "@/types/requests";
import { useTranslation } from "@/hooks/useTranslation";
import DetailCard from "@/designSystem/DetailCard";
import RequestDetailModal from "./RequestDetailModal";
import BadgeTag from "@/designSystem/BadgeTag";
import DetailField from "../ui/DetailField";
import MemberTag2 from "../ui/MemberTag2";
import { requestsService } from "@/services/requestsService";
import Loader from "@/designSystem/Loader";
import { useQuery } from "@tanstack/react-query";
import { reactQueryKeys } from "@/config/reactQueryKeys";
import AttendanceLocationMap from "./AttendanceLocationMap";
import { mapGpsStatus } from "../utils/transformAttendanceData";

const DUBAI_TIME_ZONE = "Asia/Dubai";

const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-US", {
        timeZone: DUBAI_TIME_ZONE,
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};

const formatTime = (dateString: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleTimeString("en-US", {
        timeZone: DUBAI_TIME_ZONE,
        hour: '2-digit',
        minute: '2-digit'
    });
};

interface AttendanceDetailModalProps {
   request: Request | null;
   isOpen: boolean;
   onClose: () => void;
}

function AttendanceDetailModal({
   request,
   isOpen,
   onClose,
}: AttendanceDetailModalProps) {
   const { t } = useTranslation("requests");

   const { data: details, isLoading } = useQuery({
      queryKey: reactQueryKeys.requests.attendance.detail(request?.id || ""),
      queryFn: () => requestsService.getAttendanceRequestById(request?.id || ""),
      enabled: !!request?.id && isOpen,
   });

   if (!request) return null;

   const getZoneStatus = () => {
      const mappedDetailStatus = mapGpsStatus(
         details?.zone_status || details?.gps_status
      );

      if (mappedDetailStatus) return mappedDetailStatus;
      if (request.gpsStatus) return request.gpsStatus;
      return "Unknown";
   };

   const zoneStatus = getZoneStatus();
   const zoneVariant =
      zoneStatus === "In Zone"
         ? "success"
         : "warning";

   const content = (
      <DetailCard className="shadow-subtle border border-border p-3! gap-4!">
         {isLoading ? (
            <div className="flex justify-center py-10">
               <Loader label={t("common.loading", "Loading details...")} />
            </div>
         ) : details ? (
            <>
               <div className="grid grid-cols-2 gap-4">
                  <DetailField label={t("attendanceDetail.id", "Request ID")}>
                     <p className="text-base leading-6 tracking-[-0.176px] text-text-strong">
                        #{details.id}
                     </p>
                  </DetailField>

                  <DetailField label={t("attendanceDetail.requestType", "Request Type")}>
                     <p className="text-base leading-6 tracking-[-0.176px] text-text-strong">
                        {request.requestType}
                     </p>
                  </DetailField>
               </div>

               <DetailField label={t("attendanceDetail.memberName", "Member")}>
                  <MemberTag2
                     avatar={details.employee.avatar || ""}
                     name={details.employee.name}
                  />
               </DetailField>

               <div className="grid grid-cols-2 gap-4">
                    <DetailField label={t("attendanceDetail.date", "Date")}>
                        <p className="text-base leading-6 tracking-[-0.176px] text-text-strong">
                            {formatDate(details.log_date)}
                        </p>
                    </DetailField>
                    
                    <DetailField label={t("attendanceDetail.checkInTime", "Check In")}>
                        <p className="text-base leading-6 tracking-[-0.176px] text-text-strong">
                            {details.check_in.time ? formatTime(details.check_in.time) : "-"}
                        </p>
                    </DetailField>
               </div>

               <DetailField label={t("attendanceDetail.gpsStatus", "Location Status")}>
                  <BadgeTag label={zoneStatus} variant={zoneVariant} />
               </DetailField>

               <DetailField label={t("attendanceDetail.location", "Location Check")}>
                  <AttendanceLocationMap
                     details={details}
                     isOpen={isOpen}
                     mapId="attendance-leaflet-map-detail"
                  />

               </DetailField>
               
               {details.comment && (
                    <DetailField label={t("attendanceDetail.comment", "System Comment")}>
                        <p className="text-sm text-text-sub bg-gray-50 p-2 rounded-lg">
                            {details.comment}
                        </p>
                    </DetailField>
               )}
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
         titleKey="attendanceDetail.title"
         cancelLabelKey="attendanceDetail.cancel"
         content={content}
      />
   );
}

export default AttendanceDetailModal;
