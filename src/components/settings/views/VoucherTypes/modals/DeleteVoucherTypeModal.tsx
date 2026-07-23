/** @format */

import { useTranslation } from "@/hooks/useTranslation";
import ConfirmModal from "@/designSystem/ConfirmModal";

type DeleteVoucherTypeModalProps = {
   isOpen: boolean;
   onClose: () => void;
   onConfirm: () => void;
   isLoading?: boolean;
   isSuccess?: boolean;
};

function DeleteVoucherTypeModal({
   isOpen,
   onClose,
   onConfirm,
   isLoading = false,
   isSuccess = false,
}: DeleteVoucherTypeModalProps) {
   const { t } = useTranslation("settings");

   return (
      <ConfirmModal
         isOpen={isOpen}
         onClose={onClose}
         onConfirm={onConfirm}
         title={t("voucherTypes.deleteModal.title")}
         description={t("voucherTypes.deleteModal.message")}
         confirmText={t("voucherTypes.deleteModal.confirmButton")}
         cancelText={t("voucherTypes.deleteModal.cancelButton")}
         variant="error"
         isLoading={isLoading}
         isSuccess={isSuccess}
      />
   );
}

export default DeleteVoucherTypeModal;
