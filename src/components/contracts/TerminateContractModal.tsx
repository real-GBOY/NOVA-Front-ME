/** @format */

import { useMemo, useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import Modal from "@/designSystem/Modal";
import DatePicker from "@/designSystem/DatePicker";
import ConfirmModal from "@/designSystem/ConfirmModal";

interface TerminateContractModalProps {
   isOpen: boolean;
   onClose: () => void;
   onConfirm: (reason: string, terminationDate: Date) => void;
   isLoading?: boolean;
}

function TerminateContractModal({
   isOpen,
   onClose,
   onConfirm,
   isLoading = false,
}: TerminateContractModalProps) {
   const { t } = useTranslation("common");
   const [reason, setReason] = useState("");
   const [terminationDate, setTerminationDate] = useState<Date | null>(null);
   const [errors, setErrors] = useState<{
      reason?: string;
      terminationDate?: string;
   }>({});
   const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

   const handleSubmit = () => {
      // Validate fields
      const newErrors: { reason?: string; terminationDate?: string } = {};

      if (!reason.trim()) {
         newErrors.reason =
            t("contracts.terminate.reasonRequired") || "Reason is required";
      }

      if (!terminationDate) {
         newErrors.terminationDate =
            t("contracts.terminate.dateRequired") ||
            "Termination date is required";
      }

      if (Object.keys(newErrors).length > 0) {
         setErrors(newErrors);
         return;
      }

      // Clear errors and submit
      setErrors({});
      onConfirm(reason, terminationDate!);
   };

   const handleClose = () => {
      setReason("");
      setTerminationDate(null);
      setErrors({});
      onClose();
   };

   const isDirty = useMemo(
      () => Boolean(reason.trim() || terminationDate),
      [reason, terminationDate]
   );

   const handleRequestClose = () => {
      if (isDirty) {
         setShowDiscardConfirm(true);
         return;
      }
      handleClose();
   };

   return (
      <>
         <Modal
            isOpen={isOpen}
            onClose={handleRequestClose}
            overflow="visible"
            title={t("contracts.terminateContractTitle") || "Terminate Contract"}
            size="medium">
            <div className="flex flex-col gap-6 p-2">
            {/* Description */}
            <p className="text-sm text-text-sub">
               {t("contracts.terminate.description") ||
                  "Please provide the reason and effective date for contract termination."}
            </p>

            {/* Termination Date */}
            <div className="flex flex-col gap-2">
               <label className="text-sm font-medium text-text-strong">
                  {t("contracts.terminate.terminationDate") ||
                     "Termination Date"}
                  <span className="text-danger ms-1">*</span>
               </label>
               <DatePicker
                  value={terminationDate || undefined}
                  onChange={(date) => {
                     setTerminationDate(date);
                     setErrors((prev) => ({
                        ...prev,
                        terminationDate: undefined,
                     }));
                  }}
                  placeholder={
                     t("contracts.terminate.selectDate") ||
                     "Select termination date"
                  }
               />
               {errors.terminationDate && (
                  <span className="text-xs text-danger">
                     {errors.terminationDate}
                  </span>
               )}
            </div>

            {/* Reason */}
            <div className="flex flex-col gap-2">
               <label className="text-sm font-medium text-text-strong">
                  {t("contracts.terminate.reason") || "Reason"}
                  <span className="text-danger ms-1">*</span>
               </label>
               <textarea
                  value={reason}
                  onChange={(e) => {
                     setReason(e.target.value);
                     setErrors((prev) => ({ ...prev, reason: undefined }));
                  }}
                  placeholder={
                     t("contracts.terminate.reasonPlaceholder") ||
                     "Enter the reason for termination..."
                  }
                  rows={4}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-text-strong placeholder:text-text-soft focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
               />
               {errors.reason && (
                  <span className="text-xs text-danger">{errors.reason}</span>
               )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
               <button
                  type="button"
                  onClick={handleRequestClose}
                  disabled={isLoading}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-text-sub bg-background border border-border hover:bg-bg-weak transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  {t("actions.cancel")}
               </button>
               <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-text-main bg-danger hover:bg-danger/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  {isLoading
                     ? t("contracts.terminate.terminating") || "Terminating..."
                     : t("actions.terminate")}
               </button>
            </div>
         </div>
         </Modal>
         <ConfirmModal
            isOpen={showDiscardConfirm}
            onClose={() => setShowDiscardConfirm(false)}
            onConfirm={() => {
               setShowDiscardConfirm(false);
               handleClose();
            }}
            title={t("unsavedChanges.title")}
            description={t("unsavedChanges.description")}
            confirmText={t("unsavedChanges.confirm")}
            cancelText={t("unsavedChanges.cancel")}
         />
      </>
   );
}

export default TerminateContractModal;
