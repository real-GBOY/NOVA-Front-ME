/** @format */

import { useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import Modal from "@/designSystem/Modal";
import Button from "@/designSystem/Button";
import Dropdown, { DropdownItem } from "@/designSystem/Dropdown";
import TimePicker from "@/designSystem/TimePicker";
import DatePicker from "@/designSystem/DatePicker";
import ConfirmModal from "@/designSystem/ConfirmModal";
import { useTranslation } from "@/hooks/useTranslation";
import { useAddAttendance } from "@/hooks/employees/useEmployee";
import toast from "@/utilities/toast";
import ArrowDownSLine from "@/Icons/arrow-down-s-line";
import {
   buildLocalIsoFromLocalDateAndTime,
   getIsoDatePart,
} from "./timeUtils";

interface AddAttendanceModalProps {
   isOpen: boolean;
   onClose: () => void;
}

export interface AttendanceFormData {
   date: Date | undefined;
   clockIn: string;
   clockOut: string;
   attendanceType: string;
}

function AddAttendanceModal({ isOpen, onClose }: AddAttendanceModalProps) {
   const { t } = useTranslation("members");
   const { t: tCommon } = useTranslation("common");
   const { id } = useParams<{ id: string }>();
   const [isDropdownOpen, setIsDropdownOpen] = useState(false);
   const dropdownRef = useRef<HTMLButtonElement>(null);

   const addAttendanceMutation = useAddAttendance();

   const defaultFormData = useMemo<AttendanceFormData>(
      () => ({
         date: undefined,
         clockIn: "09:00",
         clockOut: "17:00",
         attendanceType: "Working-Time",
      }),
      []
   );
   const [formData, setFormData] = useState<AttendanceFormData>(defaultFormData);
   const [errors, setErrors] = useState<{
      date?: string;
      clockIn?: string;
      clockOut?: string;
      attendanceType?: string;
   }>({});
   const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

   const attendanceTypeOptions = [
      {
         value: "Working-Time",
         label: t("timeManagement.attendanceModal.types.workingTime"),
      },
      { value: "Overtime", label: t("timeManagement.attendanceModal.types.overtime") },
      { value: "Late", label: t("timeManagement.attendanceModal.types.late") },
      { value: "Absence", label: t("timeManagement.attendanceModal.types.absence") },
      { value: "Day_off", label: t("timeManagement.attendanceModal.types.dayOff") },
      { value: "Break", label: t("timeManagement.attendanceModal.types.break") },
      {
         value: "Early_Leave",
         label: t("timeManagement.attendanceModal.types.earlyLeave"),
      },
      {
         value: "Requested_day_off",
         label: t("timeManagement.attendanceModal.types.requestedDayOff"),
      },
   ];

   const dropdownItems: DropdownItem[] = attendanceTypeOptions.map((opt) => ({
      id: opt.value,
      label: opt.label,
      icon: () => <></>,
      onClick: () => {
         setFormData({ ...formData, attendanceType: opt.value });
         setErrors((prev) => ({ ...prev, attendanceType: undefined }));
      },
   }));

   const selectedOption = attendanceTypeOptions.find(
      (opt) => opt.value === formData.attendanceType
   );

   const handleSubmit = async () => {
      if (!id) {
         toast.error(t("timeManagement.errors.employeeNotFound"));
         return;
      }

      // Validation
      const nextErrors: typeof errors = {};
      if (!formData.date) {
         nextErrors.date = t("timeManagement.attendanceModal.validation.date");
      }

      // Validate that the date is not in the future
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset time to midnight for accurate date comparison
      const selectedDate = new Date(formData.date);
      selectedDate.setHours(0, 0, 0, 0);

      if (selectedDate > today) {
         nextErrors.date = t(
            "timeManagement.attendanceModal.validation.futureDate"
         );
      }

      if (!formData.clockIn) {
         nextErrors.clockIn = t(
            "timeManagement.attendanceModal.validation.clockIn"
         );
      }
      if (!formData.clockOut) {
         nextErrors.clockOut = t(
            "timeManagement.attendanceModal.validation.clockOut"
         );
      }
      if (!formData.attendanceType) {
         nextErrors.attendanceType = t(
            "timeManagement.attendanceModal.validation.attendanceType"
         );
      }

      const clockInIso =
         formData.date && formData.clockIn
            ? buildLocalIsoFromLocalDateAndTime(formData.date, formData.clockIn)
            : null;
      const clockOutIso =
         formData.date && formData.clockOut
            ? buildLocalIsoFromLocalDateAndTime(formData.date, formData.clockOut)
            : null;

      if (!clockInIso) {
         nextErrors.clockIn = t(
            "timeManagement.attendanceModal.validation.clockIn"
         );
      }
      if (!clockOutIso) {
         nextErrors.clockOut = t(
            "timeManagement.attendanceModal.validation.clockOut"
         );
      }

      if (Object.keys(nextErrors).length > 0) {
         setErrors(nextErrors);
         return;
      }

      try {
         await addAttendanceMutation.mutateAsync({
            id,
            payload: {
               date: getIsoDatePart(clockInIso!),
               clock_in: clockInIso!,
               clock_out: clockOutIso!,
               attendance_type: formData.attendanceType,
            },
         });

         toast.success(t("timeManagement.attendanceModal.toast.success"));
         handleCancel();
      } catch (error) {
         toast.error(t("timeManagement.attendanceModal.toast.error"));
         console.error("Error adding attendance:", error);
      }
   };

   const handleCancel = () => {
      setFormData(defaultFormData);
      setErrors({});
      onClose();
   };

   const isDirty = useMemo(
      () =>
         Boolean(
            formData.date ||
               formData.clockIn !== defaultFormData.clockIn ||
               formData.clockOut !== defaultFormData.clockOut ||
               formData.attendanceType !== defaultFormData.attendanceType
         ),
      [formData, defaultFormData]
   );

   const handleRequestClose = () => {
      if (isDirty) {
         setShowDiscardConfirm(true);
         return;
      }
      handleCancel();
   };

   const footer = (
      <div className="r-btn-group xl:flex-row xl:justify-end xl:gap-3 w-full">
         <Button
            variant="secondary"
            onClick={handleRequestClose}
            disabled={addAttendanceMutation.isPending}
            className="r-btn-full text-sm font-medium xl:px-3 xl:py-2">
            {t("timeManagement.attendanceModal.cancel")}
         </Button>
         <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={addAttendanceMutation.isPending}
            className="r-btn-full text-sm font-medium xl:px-3 xl:py-2">
            {addAttendanceMutation.isPending
               ? t("timeManagement.attendanceModal.adding")
               : t("timeManagement.attendanceModal.addLog")}
         </Button>
      </div>
   );

   return (
      <>
         <Modal
            isOpen={isOpen}
            onClose={handleRequestClose}
            title={t("timeManagement.attendanceModal.title")}
            footer={footer}
            size="medium"
            overflow="visible"
            contentClassName="r-p-sm xl:px-4 xl:py-4">
            <div className="flex flex-col r-gap w-full xl:gap-4">
            {/* Date Field */}
            <div className="flex flex-col gap-1 w-full">
               <label className="flex items-center gap-0.5 text-sm font-medium text-text-strong">
                  <span>{t("timeManagement.attendanceModal.date")}</span>
                  <span className="text-primary">*</span>
               </label>
               <DatePicker
                  value={formData.date}
                  onChange={(date) => {
                     setFormData({ ...formData, date });
                     setErrors((prev) => ({ ...prev, date: undefined }));
                  }}
                  placeholder={t(
                     "timeManagement.attendanceModal.datePlaceholder"
                  )}
               />
               {errors.date && (
                  <span className="text-xs text-danger">{errors.date}</span>
               )}
            </div>

            {/* Clock In & Clock Out Fields */}
            <div className="r-stack r-gap-sm w-full xl:items-start xl:gap-4">
               {/* Clock In */}
               <div className="flex flex-col gap-1 w-full min-w-0 xl:flex-1">
                  <label className="flex items-center gap-0.5 text-sm font-medium text-text-strong">
                     <span>{t("timeManagement.attendanceModal.clockIn")}</span>
                     <span className="text-primary">*</span>
                  </label>
                  <TimePicker
                     value={formData.clockIn}
                     onChange={(value) => {
                        setFormData({ ...formData, clockIn: value });
                        setErrors((prev) => ({ ...prev, clockIn: undefined }));
                     }}
                     defaultValue="09:00"
                  />
                  {errors.clockIn && (
                     <span className="text-xs text-danger">{errors.clockIn}</span>
                  )}
               </div>

               {/* Clock Out */}
               <div className="flex flex-col gap-1 w-full min-w-0 xl:flex-1">
                  <label className="flex items-center gap-0.5 text-sm font-medium text-text-strong">
                     <span>{t("timeManagement.attendanceModal.clockOut")}</span>
                     <span className="text-primary">*</span>
                  </label>
                  <TimePicker
                     value={formData.clockOut}
                     onChange={(value) => {
                        setFormData({ ...formData, clockOut: value });
                        setErrors((prev) => ({ ...prev, clockOut: undefined }));
                     }}
                     defaultValue="17:00"
                  />
                  {errors.clockOut && (
                     <span className="text-xs text-danger">{errors.clockOut}</span>
                  )}
               </div>
            </div>

            {/* Attendance Type Field */}
            <div className="flex flex-col gap-1 w-full">
               <label className="flex items-center gap-0.5 text-sm font-medium text-text-strong">
                  <span>
                     {t("timeManagement.attendanceModal.attendanceType")}
                  </span>
                  <span className="text-primary">*</span>
               </label>
               <div className="relative w-full">
                  <button
                     ref={dropdownRef}
                     type="button"
                     onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                     className="bg-background border border-border rounded-xl flex items-center justify-between gap-2 px-3 py-2.5 w-full hover:border-text-sub transition-colors">
                     <span
                        className={`text-sm ${
                           selectedOption ? "text-text-strong" : "text-text-sub"
                        }`}>
                        {selectedOption
                           ? selectedOption.label
                           : t(
                                "timeManagement.attendanceModal.selectAttendanceType"
                             )}
                     </span>
                     <ArrowDownSLine
                        size={20}
                        className={`fill-text-strong transition-transform ${
                           isDropdownOpen ? "rotate-180" : ""
                        }`}
                     />
                  </button>
                  {errors.attendanceType && (
                     <span className="text-xs text-danger">
                        {errors.attendanceType}
                     </span>
                  )}

                  <Dropdown
                     items={dropdownItems}
                     isOpen={isDropdownOpen}
                     onClose={() => setIsDropdownOpen(false)}
                     anchorRef={dropdownRef}
                     zIndex="z-[70]"
                     variant="match-width"
                  />
               </div>
            </div>
         </div>
         </Modal>
         <ConfirmModal
            isOpen={showDiscardConfirm}
            onClose={() => setShowDiscardConfirm(false)}
            onConfirm={() => {
               setShowDiscardConfirm(false);
               handleCancel();
            }}
            title={tCommon("unsavedChanges.title")}
            description={tCommon("unsavedChanges.description")}
            confirmText={tCommon("unsavedChanges.confirm")}
            cancelText={tCommon("unsavedChanges.cancel")}
         />
      </>
   );
}

export default AddAttendanceModal;
