/** @format */

import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import Modal from "@/designSystem/Modal";
import Button from "@/designSystem/Button";
import TimePicker from "@/designSystem/TimePicker";
import DatePicker from "@/designSystem/DatePicker";
import ConfirmModal from "@/designSystem/ConfirmModal";
import { useTranslation } from "@/hooks/useTranslation";
import { useAddOvertime } from "@/hooks/employees/useEmployee";
import toast from "@/utilities/toast";
import {
   buildLocalIsoFromLocalDateAndTime,
   getIsoDatePart,
} from "./timeUtils";

interface AddOvertimeModalProps {
   isOpen: boolean;
   onClose: () => void;
}

export interface OvertimeFormData {
   requestedDate: Date | undefined;
   overtimeDate: Date | undefined;
   clockIn: string;
   clockOut: string;
   reason: string;
}

function AddOvertimeModal({ isOpen, onClose }: AddOvertimeModalProps) {
   const { t } = useTranslation("members");
   const { t: tCommon } = useTranslation("common");
   const { id } = useParams<{ id: string }>();

   const addOvertimeMutation = useAddOvertime();

   const defaultFormData = useMemo<OvertimeFormData>(
      () => ({
         requestedDate: undefined,
         overtimeDate: undefined,
         clockIn: "18:00",
         clockOut: "20:00",
         reason: "",
      }),
      []
   );

   const [formData, setFormData] = useState<OvertimeFormData>(defaultFormData);

   const [characterCount, setCharacterCount] = useState(0);
   const maxCharacters = 200;
   const [errors, setErrors] = useState<{
      requestedDate?: string;
      overtimeDate?: string;
      clockIn?: string;
      clockOut?: string;
   }>({});
   const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

   const handleReasonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value;
      if (value.length <= maxCharacters) {
         setFormData({ ...formData, reason: value });
         setCharacterCount(value.length);
      }
   };

   const handleSubmit = async () => {
      if (!id) {
         toast.error(t("timeManagement.errors.employeeNotFound"));
         return;
      }

      // Validation
      const nextErrors: typeof errors = {};
      if (!formData.requestedDate) {
         nextErrors.requestedDate = t(
            "timeManagement.overtimeModal.validation.requestedDate"
         );
      }
      if (!formData.overtimeDate) {
         nextErrors.overtimeDate = t(
            "timeManagement.overtimeModal.validation.overtimeDate"
         );
      }
      if (!formData.clockIn) {
         nextErrors.clockIn = t(
            "timeManagement.overtimeModal.validation.clockIn"
         );
      }
      if (!formData.clockOut) {
         nextErrors.clockOut = t(
            "timeManagement.overtimeModal.validation.clockOut"
         );
      }

      const startTimeIso =
         formData.overtimeDate && formData.clockIn
            ? buildLocalIsoFromLocalDateAndTime(formData.overtimeDate, formData.clockIn)
            : null;
      const endTimeIso =
         formData.overtimeDate && formData.clockOut
            ? buildLocalIsoFromLocalDateAndTime(formData.overtimeDate, formData.clockOut)
            : null;

      if (!startTimeIso) {
         nextErrors.clockIn = t(
            "timeManagement.overtimeModal.validation.clockIn"
         );
      }
      if (!endTimeIso) {
         nextErrors.clockOut = t(
            "timeManagement.overtimeModal.validation.clockOut"
         );
      }

      if (Object.keys(nextErrors).length > 0) {
         setErrors(nextErrors);
         return;
      }

      try {
         await addOvertimeMutation.mutateAsync({
            id,
            payload: {
               date: getIsoDatePart(startTimeIso!),
               start_time: startTimeIso!,
               end_time: endTimeIso!,
               reason: formData.reason,
            },
         });

         toast.success(t("timeManagement.overtimeModal.toast.success"));
         handleCancel();
      } catch (error) {
         toast.error(t("timeManagement.overtimeModal.toast.error"));
         console.error("Error adding overtime:", error);
      }
   };

   const handleCancel = () => {
      setFormData(defaultFormData);
      setCharacterCount(0);
      setErrors({});
      onClose();
   };

   const isFormValid =
      formData.requestedDate &&
      formData.overtimeDate &&
      formData.clockIn &&
      formData.clockOut;
   const isDirty = useMemo(
      () =>
         Boolean(
            formData.requestedDate ||
               formData.overtimeDate ||
               formData.clockIn !== defaultFormData.clockIn ||
               formData.clockOut !== defaultFormData.clockOut ||
               formData.reason.trim()
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
            disabled={addOvertimeMutation.isPending}
            className="r-btn-full text-sm font-medium xl:px-3 xl:py-2">
            {t("timeManagement.overtimeModal.cancel")}
         </Button>
         <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={addOvertimeMutation.isPending || !isFormValid}
            className="r-btn-full text-sm font-medium xl:px-3 xl:py-2">
            {addOvertimeMutation.isPending
               ? t("timeManagement.overtimeModal.adding")
               : t("timeManagement.overtimeModal.addOvertime")}
         </Button>
      </div>
   );

   return (
      <>
         <Modal
            isOpen={isOpen}
            onClose={handleRequestClose}
            title={t("timeManagement.overtimeModal.title")}
            footer={footer}
            size="medium"
            overflow="visible"
            contentClassName="r-p-sm xl:px-4 xl:py-4">
            <div className="flex flex-col r-gap w-full xl:gap-4">
            {/* Requested Date Field */}
            <div className="flex flex-col gap-1 w-full">
               <label className="flex items-center gap-0.5 text-sm font-medium text-text-strong">
                  <span>{t("timeManagement.overtimeModal.requestedDate")}</span>
                  <span className="text-primary">*</span>
               </label>
               <DatePicker
                  value={formData.requestedDate}
                  onChange={(date) => {
                     setFormData({ ...formData, requestedDate: date });
                     setErrors((prev) => ({ ...prev, requestedDate: undefined }));
                  }}
                  placeholder={t(
                     "timeManagement.overtimeModal.datePlaceholder"
                  )}
               />
               {errors.requestedDate && (
                  <span className="text-xs text-danger">
                     {errors.requestedDate}
                  </span>
               )}
            </div>

            {/* Overtime Date Field */}
            <div className="flex flex-col gap-1 w-full">
               <label className="flex items-center gap-0.5 text-sm font-medium text-text-strong">
                  <span>{t("timeManagement.overtimeModal.overtimeDate")}</span>
                  <span className="text-primary">*</span>
               </label>
               <DatePicker
                  value={formData.overtimeDate}
                  onChange={(date) => {
                     setFormData({ ...formData, overtimeDate: date });
                     setErrors((prev) => ({ ...prev, overtimeDate: undefined }));
                  }}
                  placeholder={t(
                     "timeManagement.overtimeModal.datePlaceholder"
                  )}
               />
               {errors.overtimeDate && (
                  <span className="text-xs text-danger">
                     {errors.overtimeDate}
                  </span>
               )}
            </div>

            {/* Clock In & Clock Out Fields */}
            <div className="r-stack r-gap-sm w-full xl:items-start xl:gap-4">
               {/* Clock In */}
               <div className="flex flex-col gap-1 w-full min-w-0 xl:flex-1">
                  <label className="flex items-center gap-0.5 text-sm font-medium text-text-strong">
                     <span>{t("timeManagement.overtimeModal.clockIn")}</span>
                     <span className="text-primary">*</span>
                  </label>
                  <TimePicker
                     value={formData.clockIn}
                     onChange={(value) => {
                        setFormData({ ...formData, clockIn: value });
                        setErrors((prev) => ({ ...prev, clockIn: undefined }));
                     }}
                     defaultValue="18:00"
                  />
                  {errors.clockIn && (
                     <span className="text-xs text-danger">{errors.clockIn}</span>
                  )}
               </div>

               {/* Clock Out */}
               <div className="flex flex-col gap-1 w-full min-w-0 xl:flex-1">
                  <label className="flex items-center gap-0.5 text-sm font-medium text-text-strong">
                     <span>{t("timeManagement.overtimeModal.clockOut")}</span>
                     <span className="text-primary">*</span>
                  </label>
                  <TimePicker
                     value={formData.clockOut}
                     onChange={(value) => {
                        setFormData({ ...formData, clockOut: value });
                        setErrors((prev) => ({ ...prev, clockOut: undefined }));
                     }}
                     defaultValue="20:00"
                  />
                  {errors.clockOut && (
                     <span className="text-xs text-danger">{errors.clockOut}</span>
                  )}
               </div>
            </div>

            {/* Reason Field */}
            <div className="flex flex-col gap-1 w-full">
               <label className="text-sm font-medium text-text-strong">
                  {t("timeManagement.overtimeModal.reason")}
               </label>
               <div className="relative">
                  <textarea
                     value={formData.reason}
                     onChange={handleReasonChange}
                     placeholder={t(
                        "timeManagement.overtimeModal.reasonPlaceholder"
                     )}
                     className="bg-background border border-border r-rounded px-3 py-2.5 w-full min-h-[156px] text-sm text-text-strong placeholder:text-text-soft focus:outline-none focus:border-text-sub transition-colors resize-none xl:rounded-2xl xl:px-3 xl:py-2.5"
                  />
                  <div className="flex items-center justify-end gap-1.5 mt-2 px-1">
                     <span className="text-[11px] font-medium text-text-soft uppercase tracking-[0.22px]">
                        {characterCount}/{maxCharacters}
                     </span>
                  </div>
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

export default AddOvertimeModal;
