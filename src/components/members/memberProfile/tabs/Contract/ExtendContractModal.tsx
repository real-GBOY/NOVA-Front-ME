/** @format */

import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import Modal from "@/designSystem/Modal";
import Button from "@/designSystem/Button";
import DatePicker from "@/designSystem/DatePicker";
import ConfirmModal from "@/designSystem/ConfirmModal";
import { useTranslation } from "@/hooks/useTranslation";
import { useExtendContract } from "@/hooks/employees/useEmployee";
import toast from "@/utilities/toast";

interface ExtendContractModalProps {
   isOpen: boolean;
   onClose: () => void;
   currentEndDate?: string;
}

function ExtendContractModal({
   isOpen,
   onClose,
   currentEndDate,
}: ExtendContractModalProps) {
   const { t } = useTranslation("members");
   const { t: tCommon } = useTranslation("common");
   const { id } = useParams<{ id: string }>();
   const extendContractMutation = useExtendContract();

   const [newEndDate, setNewEndDate] = useState<Date | undefined>(undefined);
   const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

   const formatDate = (date: Date): string => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
   };

   const handleSubmit = async () => {
      if (!id) {
         toast.error("Employee ID not found");
         return;
      }

      // Validation
      if (!newEndDate) {
         toast.error(t("profile.contract.extendModal.selectDate"));
         return;
      }

      // Validate that the new end date is in the future
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selectedDate = new Date(newEndDate);
      selectedDate.setHours(0, 0, 0, 0);

      if (selectedDate <= today) {
         toast.error(t("profile.contract.extendModal.futureDateRequired"));
         return;
      }

      // Validate that new end date is after current end date
      if (currentEndDate) {
         const currentEnd = new Date(currentEndDate);
         currentEnd.setHours(0, 0, 0, 0);

         if (selectedDate <= currentEnd) {
            toast.error(t("profile.contract.extendModal.afterCurrentDate"));
            return;
         }
      }

      try {
         await extendContractMutation.mutateAsync({
            id,
            payload: {
               new_end_date: formatDate(newEndDate),
            },
         });

         toast.success(t("profile.contract.extendModal.success"));
         setNewEndDate(undefined);
         onClose();
      } catch (error) {
         console.error("Error extending contract:", error);
         toast.error(
            t("profile.contract.extendModal.error") ||
               "Failed to extend contract"
         );
      }
   };

   const handleClose = () => {
      setNewEndDate(undefined);
      onClose();
   };

   const isDirty = useMemo(() => Boolean(newEndDate), [newEndDate]);

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
            size="medium"
            overflow="visible"
            title={t("profile.contract.extendModal.title")}>
            <div className="flex flex-col r-gap xl:gap-5">
            <div className="flex flex-col gap-2 xl:gap-2">
               <label className="text-sm font-medium text-text-strong">
                  {t("profile.contract.extendModal.newEndDate")}
               </label>
               <DatePicker
                  selected={newEndDate}
                  onChange={(date) => setNewEndDate(date || undefined)}
                  placeholderText={t(
                     "profile.contract.extendModal.selectNewDate"
                  )}
               />
               {currentEndDate && (
                  <p className="text-xs text-text-sub">
                     {t("profile.contract.extendModal.currentEndDate")}:{" "}
                     {new Date(currentEndDate).toLocaleDateString("en-GB")}
                  </p>
               )}
            </div>

            <div className="r-btn-group xl:flex-row xl:justify-end xl:gap-3">
               <Button variant="secondary" onClick={handleRequestClose} className="r-btn-full">
                  {t("profile.contract.extendModal.cancel")}
               </Button>
               <Button
                  variant="primary"
                  onClick={handleSubmit}
                  disabled={extendContractMutation.isPending}
                  className="r-btn-full">
                  {extendContractMutation.isPending
                     ? t("profile.contract.extendModal.extending")
                     : t("profile.contract.extendModal.extend")}
               </Button>
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
            title={tCommon("unsavedChanges.title")}
            description={tCommon("unsavedChanges.description")}
            confirmText={tCommon("unsavedChanges.confirm")}
            cancelText={tCommon("unsavedChanges.cancel")}
         />
      </>
   );
}

export default ExtendContractModal;
