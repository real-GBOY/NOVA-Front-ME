/** @format */

import { ReactNode } from "react";
import type { Request } from "@/types/requests";
import { useTranslation } from "@/hooks/useTranslation";
import Modal from "@/designSystem/Modal";
import RequestModalFooter from "../ui/RequestModalFooter";

export type RequestModalType = "attendance" | "overtime" | "timeOff";

interface RequestDetailModalProps {
   request: Request | null;
   isOpen: boolean;
   onClose: () => void;
   titleKey: string;
   cancelLabelKey: string;
   content: ReactNode;
   contentClassName?: string;
   actionButton?: {
      label: string;
      onClick: () => void;
      variant: "danger" | "primary";
      isLoading?: boolean;
   };
}

function RequestDetailModal({
   request,
   isOpen,
   onClose,
   titleKey,
   cancelLabelKey,
   content,
   contentClassName,
   actionButton,
}: RequestDetailModalProps) {
   const { t } = useTranslation("requests");

   if (!request) return null;

   const footer = (
      <RequestModalFooter
         onCancel={onClose}
         cancelLabel={t(cancelLabelKey)}
         actionButton={actionButton}
      />
   );

   return (
      <Modal
         isOpen={isOpen}
         onClose={onClose}
         title={t(titleKey)}
         size="default"
         width="w-md"
         showHeaderDivider={false}
         footer={footer}
         contentClassName={`p-4 overflow-y-auto max-h-[70vh] scrollbar-hide ${contentClassName}`}>
         {content}
      </Modal>
   );
}

export default RequestDetailModal;
