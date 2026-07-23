/** @format */

import { useTranslation } from "@/hooks/useTranslation";
import ConfirmModal from "@/designSystem/ConfirmModal";

type DeleteExpenseTypeModalProps = {
   isOpen: boolean;
   onClose: () => void;
   onConfirm: () => void;
   isLoading?: boolean;
   isSuccess?: boolean;
};

function DeleteExpenseTypeModal({
   isOpen,
   onClose,
   onConfirm,
   isLoading = false,
   isSuccess = false,
}: DeleteExpenseTypeModalProps) {
   const { t } = useTranslation("settings");

   return (
      <ConfirmModal
         isOpen={isOpen}
         onClose={onClose}
         onConfirm={onConfirm}
         title={t("expenseTypes.deleteModal.title")}
         description={t("expenseTypes.deleteModal.description")}
         confirmText={t("expenseTypes.deleteModal.confirmButton")}
         cancelText={t("expenseTypes.modal.cancel")}
         variant="error"
         icon="exclamation"
         isLoading={isLoading}
         isSuccess={isSuccess}
      />
   );
}

export default DeleteExpenseTypeModal;
