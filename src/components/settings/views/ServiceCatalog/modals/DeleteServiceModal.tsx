/** @format */

import { useTranslation } from "@/hooks/useTranslation";
import ConfirmModal from "@/designSystem/ConfirmModal";

type DeleteServiceModalProps = {
   isOpen: boolean;
   onClose: () => void;
   onConfirm: () => void;
   isLoading?: boolean;
   isSuccess?: boolean;
};

function DeleteServiceModal({
   isOpen,
   onClose,
   onConfirm,
   isLoading = false,
   isSuccess = false,
}: DeleteServiceModalProps) {
   const { t } = useTranslation("settings");

   return (
      <ConfirmModal
         isOpen={isOpen}
         onClose={onClose}
         onConfirm={onConfirm}
         title={t("serviceCatalog.modal.deleteServiceTitle")}
         description={t("serviceCatalog.modal.deleteServiceDescription")}
         confirmText={t("serviceCatalog.modal.deleteServiceButton")}
         cancelText={t("serviceCatalog.modal.cancel")}
         variant="error"
         icon="exclamation"
         isLoading={isLoading}
         isSuccess={isSuccess}
      />
   );
}

export default DeleteServiceModal;
