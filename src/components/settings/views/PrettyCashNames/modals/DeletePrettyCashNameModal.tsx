/** @format */

import { useTranslation } from "@/hooks/useTranslation";
import ConfirmModal from "@/designSystem/ConfirmModal";

type DeletePrettyCashNameModalProps = {
   isOpen: boolean;
   onClose: () => void;
   onConfirm: () => void;
   isLoading?: boolean;
   isSuccess?: boolean;
};

function DeletePrettyCashNameModal({
   isOpen,
   onClose,
   onConfirm,
   isLoading = false,
   isSuccess = false,
}: DeletePrettyCashNameModalProps) {
   const { t } = useTranslation("settings");

   return (
      <ConfirmModal
         isOpen={isOpen}
         onClose={onClose}
         onConfirm={onConfirm}
         title={t("prettyCashNames.deleteModal.title")}
         description={t("prettyCashNames.deleteModal.message")}
         confirmText={t("prettyCashNames.deleteModal.confirmButton")}
         cancelText={t("prettyCashNames.deleteModal.cancelButton")}
         variant="error"
         isLoading={isLoading}
         isSuccess={isSuccess}
      />
   );
}

export default DeletePrettyCashNameModal;
