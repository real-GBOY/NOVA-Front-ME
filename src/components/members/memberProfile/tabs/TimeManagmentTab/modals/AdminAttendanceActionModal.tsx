/** @format */

import { useEffect, useMemo, useRef, useState } from "react";
import Modal from "@/designSystem/Modal";
import Button from "@/designSystem/Button";
import Dropdown, { DropdownItem } from "@/designSystem/Dropdown";
import { useTranslation } from "@/hooks/useTranslation";
import { useOfficeLocation } from "@/hooks/officeLocations/useOfficeLocation";
import { useRequests } from "@/hooks/requests/useRequests";
import toast from "@/utilities/toast";
import ArrowDownSLine from "@/Icons/arrow-down-s-line";
import { getIsoDatePart, toLocalIsoString } from "./timeUtils";

type AttendanceActionMode = "checkIn" | "checkOut";

interface AdminAttendanceActionModalProps {
   isOpen: boolean;
   onClose: () => void;
   employeeId: string | number;
   mode: AttendanceActionMode;
}

function AdminAttendanceActionModal({
   isOpen,
   onClose,
   employeeId,
   mode,
}: AdminAttendanceActionModalProps) {
   const { t } = useTranslation("members");
   const { useListOfficeLocations } = useOfficeLocation();
   const { data: officeLocations = [], isLoading } =
      useListOfficeLocations();
   const { useAdminAttendanceCheckIn, useAdminAttendanceCheckOut } =
      useRequests();
   const checkInMutation = useAdminAttendanceCheckIn();
   const checkOutMutation = useAdminAttendanceCheckOut();

   const [selectedLocationId, setSelectedLocationId] = useState<number | null>(
      null
   );
   const [comment, setComment] = useState("");
   const [isDropdownOpen, setIsDropdownOpen] = useState(false);
   const dropdownRef = useRef<HTMLButtonElement>(null);

   useEffect(() => {
      if (!isOpen) return;
      setComment("");
      setSelectedLocationId(null);
   }, [isOpen]);

   useEffect(() => {
      if (!isOpen) return;
      if (selectedLocationId) return;
      if (!officeLocations.length) return;
      setSelectedLocationId(officeLocations[0].locationId);
   }, [isOpen, officeLocations, selectedLocationId]);

   const locationOptions = useMemo(
      () =>
         officeLocations.map((location) => ({
            id: String(location.locationId),
            label: location.name || `Location ${location.locationId}`,
            icon: () => <></>,
            onClick: () => {
               setSelectedLocationId(location.locationId);
            },
         })) as DropdownItem[],
      [officeLocations]
   );

   const selectedLocationLabel = useMemo(() => {
      const location = officeLocations.find(
         (item) => item.locationId === selectedLocationId
      );
      return location?.name || "";
   }, [officeLocations, selectedLocationId]);

   const isSubmitting =
      checkInMutation.isPending || checkOutMutation.isPending;

   const handleSubmit = async () => {
      if (!selectedLocationId) {
         toast.error(t("timeManagement.checkActions.validation.location"));
         return;
      }

      const now = new Date();
      const nowIso = toLocalIsoString(now);
      const payloadBase = {
         employee_id: employeeId,
         log_date: getIsoDatePart(nowIso),
         location_id: selectedLocationId,
         comment: comment.trim() || undefined,
      };

      try {
         if (mode === "checkIn") {
            await checkInMutation.mutateAsync({
               employeeId,
               payload: {
                  ...payloadBase,
                  check_in_time: nowIso,
               },
            });
            toast.success(t("timeManagement.checkActions.toast.checkInSuccess"));
         } else {
            await checkOutMutation.mutateAsync({
               employeeId,
               payload: {
                  ...payloadBase,
                  check_out_time: nowIso,
               },
            });
            toast.success(
               t("timeManagement.checkActions.toast.checkOutSuccess")
            );
         }
         onClose();
      } catch (error) {
         toast.error(t("timeManagement.checkActions.toast.error"));
         console.error("Admin attendance action failed:", error);
      }
   };

   const title =
      mode === "checkIn"
         ? t("timeManagement.checkActions.checkIn")
         : t("timeManagement.checkActions.checkOut");

   const footer = (
      <div className="r-btn-group xl:flex-row xl:justify-end xl:gap-3 w-full">
         <Button
            variant="secondary"
            onClick={onClose}
            disabled={isSubmitting}
            className="r-btn-full text-sm font-medium xl:px-3 xl:py-2">
            {t("timeManagement.checkActions.cancel")}
         </Button>
         <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={isSubmitting || isLoading || !officeLocations.length}
            className="r-btn-full text-sm font-medium xl:px-3 xl:py-2">
            {isSubmitting
               ? t("timeManagement.checkActions.submitting")
               : t("timeManagement.checkActions.confirm")}
         </Button>
      </div>
   );

   return (
      <Modal
         isOpen={isOpen}
         onClose={onClose}
         title={title}
         footer={footer}
         size="small"
         contentClassName="r-p-sm xl:px-4 xl:py-4">
         <div className="flex flex-col r-gap w-full">
            <div className="flex flex-col gap-1 w-full">
               <Dropdown
                  buttonRef={dropdownRef}
                  open={isDropdownOpen}
                  setOpen={setIsDropdownOpen}
                  items={locationOptions}
                  side="bottom"
                  align="start"
                  width="w-full"
                  height="max-h-64"
                  className="w-full">
                  <button
                     ref={dropdownRef}
                     type="button"
                     className="w-full px-3 py-2 border border-stroke-sub-300 rounded-lg text-sm flex justify-between items-center bg-background">
                     <span className="text-text-strong">
                        {selectedLocationLabel ||
                           t("timeManagement.checkActions.selectLocation")}
                     </span>
                     <ArrowDownSLine className="size-4 text-text-sub" />
                  </button>
               </Dropdown>
               {!officeLocations.length && !isLoading && (
                  <p className="text-xs text-text-sub">
                     {t("timeManagement.checkActions.noLocations")}
                  </p>
               )}
            </div>

            <div className="flex flex-col gap-1 w-full">
               <label className="text-sm font-medium text-text-strong">
                  {t("timeManagement.checkActions.comment")}
               </label>
               <textarea
                  className="w-full min-h-[88px] resize-none border border-stroke-sub-300 rounded-lg bg-background px-3 py-2 text-sm text-text-strong placeholder:text-text-soft outline-none"
                  placeholder={t("timeManagement.checkActions.commentPlaceholder")}
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
               />
            </div>
         </div>
      </Modal>
   );
}

export default AdminAttendanceActionModal;
