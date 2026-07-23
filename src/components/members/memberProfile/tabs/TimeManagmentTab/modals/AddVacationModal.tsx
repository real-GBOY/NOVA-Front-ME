/** @format */

import { useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import Modal from "@/designSystem/Modal";
import Button from "@/designSystem/Button";
import Dropdown, { DropdownItem } from "@/designSystem/Dropdown";
import DatePicker from "@/designSystem/DatePicker";
import ConfirmModal from "@/designSystem/ConfirmModal";
import { useTranslation } from "@/hooks/useTranslation";
import { useAddTimeOff } from "@/hooks/employees/useEmployee";
import { useVacationTypes } from "@/hooks/vacationTypes/vacationType.queries";
import toast from "@/utilities/toast";
import { formatDubaiDate } from "@/utilities/timeTransform";
import ArrowDownSLine from "@/Icons/arrow-down-s-line";

interface AddVacationModalProps {
   isOpen: boolean;
   onClose: () => void;
}

interface VacationFormData {
   vacationType: number | null;
   startDate: Date | undefined;
   endDate: Date | undefined;
   reason: string;
}

function AddVacationModal({ isOpen, onClose }: AddVacationModalProps) {
   const { t } = useTranslation("members");
   const { t: tCommon } = useTranslation("common");
   const { id } = useParams<{ id: string }>();
   const [isDropdownOpen, setIsDropdownOpen] = useState(false);
   const dropdownRef = useRef<HTMLButtonElement>(null);

   const addTimeOffMutation = useAddTimeOff();
   const { data: allVacationTypes = [], isLoading: isLoadingTypes } = useVacationTypes({
      enabled: isOpen,
   });
   const vacationTypes = useMemo(
      () => allVacationTypes.filter((type) => type.unit === "day"),
      [allVacationTypes],
   );

   const defaultFormData = useMemo<VacationFormData>(
      () => ({
         vacationType: null,
         startDate: undefined,
         endDate: undefined,
         reason: "",
      }),
      []
   );
   const [formData, setFormData] = useState<VacationFormData>(defaultFormData);
   const [errors, setErrors] = useState<{
      vacationType?: string;
      startDate?: string;
      endDate?: string;
      reason?: string;
   }>({});
   const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

   const dropdownItems: DropdownItem[] = vacationTypes.map((type) => ({
      id: String(type.id),
      label: type.name,
      icon: () => <></>,
      onClick: () => {
         setFormData((prev) => ({ ...prev, vacationType: type.id }));
         setErrors((prev) => ({ ...prev, vacationType: undefined }));
      },
   }));

   const selectedVacationType = vacationTypes.find(
      (type) => type.id === formData.vacationType
   );

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
      if (!formData.startDate) {
         nextErrors.startDate = t("timeManagement.timeOffModal.validation.startDate");
      }
      if (!formData.endDate) {
         nextErrors.endDate = t("timeManagement.timeOffModal.validation.endDate");
      }
      if (!formData.reason.trim()) {
         nextErrors.reason = t("timeManagement.timeOffModal.validation.reason");
      }

      if (formData.startDate && formData.endDate) {
         const start = new Date(formData.startDate);
         const end = new Date(formData.endDate);
         start.setHours(0, 0, 0, 0);
         end.setHours(0, 0, 0, 0);
         if (end < start) {
            nextErrors.endDate = t(
               "timeManagement.timeOffModal.validation.endDateBeforeStart"
            );
         }
      }

      if (Object.keys(nextErrors).length > 0) {
         setErrors(nextErrors);
         return;
      }

      try {
         await addTimeOffMutation.mutateAsync({
            id,
            payload: {
               vacation_type_id: selectedVacationType.id,
               start_date: formatDubaiDate(formData.startDate!),
               end_date: formatDubaiDate(formData.endDate!),
               reason: formData.reason.trim(),
            },
         });

         toast.success(t("timeManagement.timeOffModal.toast.success"));
         setFormData(defaultFormData);
         setErrors({});
         onClose();
      } catch (error) {
         toast.error(t("timeManagement.timeOffModal.toast.error"));
         console.error("Error adding vacation:", error);
      }
   };

   const isDirty = useMemo(
      () =>
         Boolean(
            formData.vacationType ||
               formData.startDate ||
               formData.endDate ||
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
            title={t("timeManagement.timeOffModal.title")}
            footer={
               <div className="r-btn-group xl:flex-row xl:justify-end xl:gap-3 w-full">
                  <Button
                     variant="secondary"
                     onClick={handleRequestClose}
                     disabled={addTimeOffMutation.isPending}
                     className="r-btn-full text-sm font-medium xl:px-3 xl:py-2">
                     {t("timeManagement.timeOffModal.cancel")}
                  </Button>
                  <Button
                     variant="primary"
                     onClick={handleSubmit}
                     disabled={addTimeOffMutation.isPending}
                     className="r-btn-full text-sm font-medium xl:px-3 xl:py-2">
                     {addTimeOffMutation.isPending
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
                     {errors.vacationType && (
                        <span className="text-xs text-danger">{errors.vacationType}</span>
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

               <div className="r-stack r-gap-sm w-full xl:items-start xl:gap-4">
                  <div className="flex flex-col gap-1 w-full min-w-0 xl:flex-1">
                     <label className="flex items-center gap-0.5 text-sm font-medium text-text-strong">
                        <span>{t("timeManagement.timeOffModal.startDate")}</span>
                        <span className="text-primary">*</span>
                     </label>
                     <DatePicker
                        value={formData.startDate}
                        onChange={(date) => {
                           setFormData((prev) => ({ ...prev, startDate: date }));
                           setErrors((prev) => ({ ...prev, startDate: undefined }));
                        }}
                        placeholder={t("timeManagement.timeOffModal.startDatePlaceholder")}
                     />
                     {errors.startDate && (
                        <span className="text-xs text-danger">{errors.startDate}</span>
                     )}
                  </div>
                  <div className="flex flex-col gap-1 w-full min-w-0 xl:flex-1">
                     <label className="flex items-center gap-0.5 text-sm font-medium text-text-strong">
                        <span>{t("timeManagement.timeOffModal.endDate")}</span>
                        <span className="text-primary">*</span>
                     </label>
                     <DatePicker
                        value={formData.endDate}
                        onChange={(date) => {
                           setFormData((prev) => ({ ...prev, endDate: date }));
                           setErrors((prev) => ({ ...prev, endDate: undefined }));
                        }}
                        placeholder={t("timeManagement.timeOffModal.endDatePlaceholder")}
                     />
                     {errors.endDate && (
                        <span className="text-xs text-danger">{errors.endDate}</span>
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

export default AddVacationModal;
