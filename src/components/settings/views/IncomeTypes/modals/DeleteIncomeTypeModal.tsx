/** @format */

import Modal from "@/designSystem/Modal";
import Button from "@/designSystem/Button";
import { useTranslation } from "@/hooks/useTranslation";
import { Trash } from "@/Icons";

interface DeleteIncomeTypeModalProps {
   isOpen: boolean;
   onClose: () => void;
   onConfirm: () => void;
   isLoading: boolean;
   isSuccess?: boolean;
}

export default function DeleteIncomeTypeModal({
   isOpen,
   onClose,
   onConfirm,
   isLoading,
   isSuccess,
}: DeleteIncomeTypeModalProps) {
   const { t } = useTranslation("settings");

   if (isSuccess) {
      return null;
   }

   const footer = (
      <div className="flex justify-end gap-3 w-full">
         <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            {t("incomeTypes.deleteModal.cancel") || "Cancel"}
         </Button>
         <Button variant="danger" onClick={onConfirm} disabled={isLoading}>
            {isLoading ? (
               <>
                  <span className="animate-spin mr-2 w-4 h-4 border-2 border-white border-t-transparent rounded-full inline-block align-middle" />
                  {t("incomeTypes.deleteModal.deleting") || "Deleting..."}
               </>
            ) : (
               t("incomeTypes.deleteModal.confirm") || "Delete"
            )}
         </Button>
      </div>
   );

   return (
      <Modal
         isOpen={isOpen}
         onClose={isLoading ? () => {} : onClose}
         title={t("incomeTypes.deleteModal.title") || "Delete Income Type"}
         width="w-[30rem]"
         footer={footer}>
         <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 text-text-sub bg-bg-weak p-4 rounded-lg border border-border-weak">
               <div className="bg-red-100 p-2 rounded-full">
                  <Trash className="w-5 h-5 fill-red-600" />
               </div>
               <p className="text-sm leading-relaxed">
                  {t("incomeTypes.deleteModal.message") || "Are you sure you want to delete this income type? This action cannot be undone."}
               </p>
            </div>
         </div>
      </Modal>
   );
}
