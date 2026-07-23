/** @format */

import { useMemo, useRef, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Modal from "@/designSystem/Modal";
import Button from "@/designSystem/Button";
import Dropdown, { DropdownItem } from "@/designSystem/Dropdown";
import DatePicker from "@/designSystem/DatePicker";
import ConfirmModal from "@/designSystem/ConfirmModal";
import { useTranslation } from "@/hooks/useTranslation";
import { useAddHourLeave } from "@/hooks/employees/useEmployee";
import { useVacationTypes } from "@/hooks/vacationTypes/vacationType.queries";
import toast from "@/utilities/toast";
import { formatDubaiDate } from "@/utilities/timeTransform";
import ArrowDownSLine from "@/Icons/arrow-down-s-line";

interface AddHourLeaveModalProps {
   isOpen: boolean;
   onClose: () => void;
}

interface HourLeaveFormData {
   vacationType: number | null;
   requestDate: Date | undefined;
   startTime: string;
   endTime: string;
   reason: string;
}

function AddHourLeaveModal({ isOpen, onClose }: AddHourLeaveModalProps) {
   const { t } = useTranslation("members");
   const { t: tCommon } = useTranslation("common");
   const { id } = useParams<{ id: string }>();
   const [isDropdownOpen, setIsDropdownOpen] = useState(false);
   const dropdownRef = useRef<HTMLButtonElement>(null);

   const addHourLeaveMutation = useAddHourLeave();
   const { data: allVacationTypes = [], isLoading: isLoadingTypes } = useVacationTypes({
      enabled: isOpen,
   });
   const hourTypes = useMemo(
      () => allVacationTypes.filter((type) => type.unit === "hour"),
      [allVacationTypes],
   );

   const defaultFormData = useMemo<HourLeaveFormData>(
      () => ({
         vacationType: null,
         requestDate: undefined,
         startTime: "",
         endTime: "",
         reason: "",
      }),
      []
   );
   const [formData, setFormData] = useState<HourLeaveFormData>(defaultFormData);
   const [errors, setErrors] = useState<{
      vacationType?: string;
      requestDate?: string;
      startTime?: string;
      endTime?: string;
      reason?: string;
   }>({});
   const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

   useEffect(() => {
      if (hourTypes.length !== 1) return;
      const singleType = hourTypes[0];
      setFormData((prev) =>
         prev.vacationType === singleType.id
            ? prev
            : { ...prev, vacationType: singleType.id },
      );
      setErrors((prev) => ({ ...prev, vacationType: undefined }));
      setIsDropdownOpen(false);
   }, [hourTypes]);

   const selectedVacationType = hourTypes.find(
      (type) => type.id === formData.vacationType
   );

   const dropdownItems: DropdownItem[] = hourTypes.map((type) => ({
      id: String(type.id),
      label: type.name,
      icon: () => <></>,
      onClick: () => {
         setFormData((prev) => ({ ...prev, vacationType: type.id }));
         setErrors((prev) => ({ ...prev, vacationType: undefined }));
      },
   }));

   const handleSubmit = async () => {
      if (!id) {
         toast.error(t("timeManagement.errors.employeeNotFound"));
         return;
      }

      const nextErrors: typeof errors = {};
      if (!selectedVacationType) {
         nextErrors.vacationType = t(
            "timeManagement.timeOffModal.validation.vacationType"
         );
      }
      if (!formData.requestDate) {
         nextErrors.requestDate = t(
            "timeManagement.timeOffModal.validation.requestDate"
         );
      }
      if (!formData.startTime) {
         nextErrors.startTime = t("timeManagement.timeOffModal.validation.startTime");
      }
      if (!formData.endTime) {
         nextErrors.endTime = t("timeManagement.timeOffModal.validation.endTime");
      }
      if (
         formData.startTime &&
         formData.endTime &&
         formData.startTime >= formData.endTime
      ) {
         nextErrors.endTime = t(
            "timeManagement.timeOffModal.validation.endTimeBeforeStartTime"
         );
      }
      if (!formData.reason.trim()) {
         nextErrors.reason = t("timeManagement.timeOffModal.validation.reason");
      }

      if (Object.keys(nextErrors).length > 0) {
         setErrors(nextErrors);
         return;
      }

      try {
         await addHourLeaveMutation.mutateAsync({
            id,
            payload: {
               vacation_type_id: selectedVacationType.id,
               request_date: formatDubaiDate(formData.requestDate!),
               start_time: formData.startTime,
               end_time: formData.endTime,
               reason: formData.reason.trim(),
            },
         });

         toast.success(t("timeManagement.timeOffModal.toast.success"));
         setFormData(defaultFormData);
         setErrors({});
         onClose();
      } catch (error) {
         toast.error(t("timeManagement.timeOffModal.toast.error"));
         console.error("Error adding hour leave:", error);
      }
   };

   const isDirty = useMemo(
      () =>
         Boolean(
            formData.vacationType ||
               formData.requestDate ||
               formData.startTime ||
               formData.endTime ||
               formData.reason.trim()
         ),
      [formData]
   );

   const handleRequestClose = () => {
      if (isDirty) {
         setShowDiscardConfirm(true);
         return;
      }
      setFormData(defaultFormData);
      setErrors({});
      onClose();
   };

   return (
      <>
         <Modal
            isOpen={isOpen}
            onClose={handleRequestClose}
            title={t("timeManagement.addButtons.addHourLeave")}
            footer={
               <div className="r-btn-group xl:flex-row xl:justify-end xl:gap-3 w-full">
                  <Button
                     variant="secondary"
                     onClick={handleRequestClose}
                     disabled={addHourLeaveMutation.isPending}
                     className="r-btn-full text-sm font-medium xl:px-3 xl:py-2">
                     {t("timeManagement.timeOffModal.cancel")}
                  </Button>
                  <Button
                     variant="primary"
                     onClick={handleSubmit}
                     disabled={addHourLeaveMutation.isPending}
                     className="r-btn-full text-sm font-medium xl:px-3 xl:py-2">
                     {addHourLeaveMutation.isPending
                        ? t("timeManagement.timeOffModal.adding")
                        : t("timeManagement.timeOffModal.addRequest")}
                  </Button>
               </div>
            }
            size="medium"
            overflow="visible"
            contentClassName="r-p-sm xl:px-4 xl:py-4">
            <div className="flex flex-col r-gap w-full xl:gap-4">
               <div className="flex flex-col gap-1 w-full">
                  <label className="flex items-center gap-0.5 text-sm font-medium text-text-strong">
                     <span>{t("timeManagement.timeOffModal.vacationType")}</span>
                     <span className="text-primary">*</span>
                  </label>
                  <div className="relative w-full">
                     {hourTypes.length === 1 ? (
                        <div className="bg-background border border-border rounded-xl flex items-center px-3 py-2.5 w-full">
                           <span className="text-sm text-text-strong">
                              {hourTypes[0].name}
                           </span>
                        </div>
                     ) : (
                        <>
                           <button
                              ref={dropdownRef}
                              type="button"
                              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                              disabled={isLoadingTypes}
                              className="bg-background border border-border rounded-xl flex items-center justify-between gap-2 px-3 py-2.5 w-full hover:border-text-sub transition-colors disabled:opacity-50">
                              <span
                                 className={`text-sm ${
                                    selectedVacationType ? "text-text-strong" : "text-text-sub"
                                 }`}>
                                 {isLoadingTypes
                                    ? t("timeManagement.timeOffModal.loadingTypes")
                                    : selectedVacationType
                                    ? selectedVacationType.name
                                    : t("timeManagement.timeOffModal.selectVacationType")}
                              </span>
                              <ArrowDownSLine
                                 size={20}
                                 className={`fill-text-strong transition-transform ${
                                    isDropdownOpen ? "rotate-180" : ""
                                 }`}
                              />
                           </button>
                           <Dropdown
                              items={dropdownItems}
                              isOpen={isDropdownOpen}
                              onClose={() => setIsDropdownOpen(false)}
                              anchorRef={dropdownRef}
                              zIndex="z-[70]"
                              variant="match-width"
                           />
                        </>
                     )}
                     {errors.vacationType && (
                        <span className="text-xs text-danger">{errors.vacationType}</span>
                     )}
                  </div>
               </div>

               <div className="flex flex-col gap-1 w-full">
                  <label className="flex items-center gap-0.5 text-sm font-medium text-text-strong">
                     <span>{t("timeManagement.timeOffModal.requestDate")}</span>
                     <span className="text-primary">*</span>
                  </label>
                  <DatePicker
                     value={formData.requestDate}
                     onChange={(date) => {
                        setFormData((prev) => ({ ...prev, requestDate: date }));
                        setErrors((prev) => ({ ...prev, requestDate: undefined }));
                     }}
                     placeholder={t("timeManagement.timeOffModal.requestDatePlaceholder")}
                  />
                  {errors.requestDate && (
                     <span className="text-xs text-danger">{errors.requestDate}</span>
                  )}
               </div>

               <div className="r-stack r-gap-sm w-full xl:items-start xl:gap-4">
                  <div className="flex flex-col gap-1 w-full min-w-0 xl:flex-1">
                     <label className="flex items-center gap-0.5 text-sm font-medium text-text-strong">
                        <span>{t("timeManagement.timeOffModal.startTime")}</span>
                        <span className="text-primary">*</span>
                     </label>
                     <input
                        type="time"
                        value={formData.startTime}
                        onChange={(e) => {
                           setFormData((prev) => ({
                              ...prev,
                              startTime: e.target.value,
                           }));
                           setErrors((prev) => ({ ...prev, startTime: undefined }));
                        }}
                        className="bg-background border border-border rounded-xl px-3 py-2.5 text-sm text-text-strong outline-none focus:border-text-sub transition-colors"
                     />
                     {errors.startTime && (
                        <span className="text-xs text-danger">{errors.startTime}</span>
                     )}
                  </div>
                  <div className="flex flex-col gap-1 w-full min-w-0 xl:flex-1">
                     <label className="flex items-center gap-0.5 text-sm font-medium text-text-strong">
                        <span>{t("timeManagement.timeOffModal.endTime")}</span>
                        <span className="text-primary">*</span>
                     </label>
                     <input
                        type="time"
                        value={formData.endTime}
                        onChange={(e) => {
                           setFormData((prev) => ({
                              ...prev,
                              endTime: e.target.value,
                           }));
                           setErrors((prev) => ({ ...prev, endTime: undefined }));
                        }}
                        className="bg-background border border-border rounded-xl px-3 py-2.5 text-sm text-text-strong outline-none focus:border-text-sub transition-colors"
                     />
                     {errors.endTime && (
                        <span className="text-xs text-danger">{errors.endTime}</span>
                     )}
                  </div>
               </div>

               <div className="flex flex-col gap-1 w-full">
                  <label className="flex items-center gap-0.5 text-sm font-medium text-text-strong">
                     <span>{t("timeManagement.timeOffModal.reason")}</span>
                     <span className="text-primary">*</span>
                  </label>
                  <textarea
                     value={formData.reason}
                     onChange={(e) => {
                        setFormData((prev) => ({ ...prev, reason: e.target.value }));
                        setErrors((prev) => ({ ...prev, reason: undefined }));
                     }}
                     placeholder={t("timeManagement.timeOffModal.reasonPlaceholder")}
                     className="bg-background border border-border rounded-xl px-3 py-2.5 text-sm text-text-strong placeholder:text-text-sub outline-none focus:border-text-sub transition-colors resize-none min-h-[100px]"
                  />
                  {errors.reason && (
                     <span className="text-xs text-danger">{errors.reason}</span>
                  )}
               </div>
            </div>
         </Modal>

         <ConfirmModal
            isOpen={showDiscardConfirm}
            onClose={() => setShowDiscardConfirm(false)}
            onConfirm={() => {
               setShowDiscardConfirm(false);
               setFormData(defaultFormData);
               setErrors({});
               onClose();
            }}
            title={tCommon("unsavedChanges.title")}
            description={tCommon("unsavedChanges.description")}
            confirmText={tCommon("unsavedChanges.confirm")}
            cancelText={tCommon("unsavedChanges.cancel")}
         />
      </>
   );
}

export default AddHourLeaveModal;
