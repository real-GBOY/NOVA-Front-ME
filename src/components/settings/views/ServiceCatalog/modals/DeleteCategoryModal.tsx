/** @format */

import { useTranslation } from "@/hooks/useTranslation";
import ConfirmModal from "@/designSystem/ConfirmModal";

type DeleteCategoryModalProps = {
   isOpen: boolean;
   onClose: () => void;
   onConfirm: () => void;
   isLoading?: boolean;
   isSuccess?: boolean;
};

function DeleteCategoryModal({
   isOpen,
   onClose,
   onConfirm,
   isLoading = false,
   isSuccess = false,
}: DeleteCategoryModalProps) {
   const { t } = useTranslation("settings");

   return (
      <ConfirmModal
         isOpen={isOpen}
         onClose={onClose}
         onConfirm={onConfirm}
         title={t("serviceCatalog.modal.deleteCategoryTitle")}
         description={t("serviceCatalog.modal.deleteCategoryDescription")}
         confirmText={t("serviceCatalog.modal.deleteCategoryButton")}
         cancelText={t("serviceCatalog.modal.cancel")}
         variant="error"
         icon="exclamation"
         isLoading={isLoading}
         isSuccess={isSuccess}
      />
   );
}

export default DeleteCategoryModal;
