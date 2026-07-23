/** @format */

import { useTranslation } from "@/hooks/useTranslation";
import ConfirmModal from "@/designSystem/ConfirmModal";

type DeleteBankModalProps = {
   isOpen: boolean;
   onClose: () => void;
   onConfirm: () => void;
   isLoading?: boolean;
   isSuccess?: boolean;
};

function DeleteBankModal({
   isOpen,
   onClose,
   onConfirm,
   isLoading = false,
   isSuccess = false,
}: DeleteBankModalProps) {
   const { t } = useTranslation("settings");

   return (
      <ConfirmModal
         isOpen={isOpen}
         onClose={onClose}
         onConfirm={onConfirm}
         title={t("banks.deleteModal.title")}
         description={t("banks.deleteModal.message")}
         confirmText={t("banks.deleteModal.confirmButton")}
         cancelText={t("banks.deleteModal.cancelButton")}
         variant="error"
         isLoading={isLoading}
         isSuccess={isSuccess}
      />
   );
}

export default DeleteBankModal;
