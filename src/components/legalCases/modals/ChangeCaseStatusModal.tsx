/** @format */

import { useEffect, useMemo, useState } from "react";
import Modal from "@/designSystem/Modal";
import Button from "@/designSystem/Button";
import Select from "@/designSystem/Select";
import { useTranslation } from "@/hooks/useTranslation";
import type { LegalCase } from "../data";

interface ChangeCaseStatusModalProps {
   isOpen: boolean;
   onClose: () => void;
   legalCase: LegalCase | null;
   onConfirm: (status: string) => void;
   isLoading?: boolean;
}

const STATUS_OPTIONS = [
   { value: "Open", statusKey: "open" },
   { value: "In Progress", statusKey: "inProgress" },
   { value: "On Hold", statusKey: "onHold" },
   { value: "Pending", statusKey: "pending" },
   { value: "Closed", statusKey: "closed" },
   { value: "Cancelled", statusKey: "cancelled" },
];

const toApiStatus = (status?: string) => {
   if (!status) return "Open";
   const normalized = status.toLowerCase().replace(/_/g, " ");
   if (normalized === "open") return "Open";
   if (normalized === "in progress") return "In Progress";
   if (normalized === "on hold") return "On Hold";
   if (normalized === "pending") return "Pending";
   if (normalized === "closed") return "Closed";
   if (normalized === "cancelled") return "Cancelled";
   return status;
};

export default function ChangeCaseStatusModal({
   isOpen,
   onClose,
   legalCase,
   onConfirm,
   isLoading = false,
}: ChangeCaseStatusModalProps) {
   const { t } = useTranslation("settings");
   const { t: tCommon } = useTranslation("common");

   const currentStatus = useMemo(
      () => toApiStatus(legalCase?.status),
      [legalCase?.status],
   );
   const [selectedStatus, setSelectedStatus] = useState<string>(currentStatus);

   useEffect(() => {
      if (isOpen) {
         setSelectedStatus(currentStatus);
      }
   }, [isOpen, currentStatus]);

   return (
      <Modal
         isOpen={isOpen}
         onClose={onClose}
         title={t("legalCases.changeStatusModal.title")}
         size="medium"
         footer={
            <div className="flex items-center justify-end gap-3 w-full">
               <Button
                  variant="secondary"
                  onClick={onClose}
                  disabled={isLoading}
                  className="cursor-pointer">
                  {tCommon("actions.cancel")}
               </Button>
               <Button
                  onClick={() => onConfirm(selectedStatus)}
                  disabled={isLoading || !selectedStatus}
                  isLoading={isLoading}
                  className="cursor-pointer">
                  {t("legalCases.changeStatusModal.confirm")}
               </Button>
            </div>
         }>
         <div className="space-y-4 min-h-[360px]">
            <p className="text-sm text-text-sub">
               {t("legalCases.changeStatusModal.description", {
                  caseNumber: legalCase?.case_number || "-",
               })}
            </p>
            <div className="space-y-2">
               <label className="text-sm font-medium text-text-strong">
                  {t("legalCases.changeStatusModal.fieldLabel")}
               </label>
               <Select
                  value={selectedStatus}
                  onChange={setSelectedStatus}
                  placeholder={t("legalCases.changeStatusModal.placeholder")}
                  options={STATUS_OPTIONS.map((option) => ({
                     value: option.value,
                     label: t(`legalCases.status.${option.statusKey}`),
                  }))}
               />
            </div>
         </div>
      </Modal>
   );
}
