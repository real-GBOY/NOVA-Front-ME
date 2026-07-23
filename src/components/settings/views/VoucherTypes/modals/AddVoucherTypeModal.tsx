/** @format */

import { useMemo, useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import Modal from "@/designSystem/Modal";
import GenericForm, { FieldConfig } from "@/designSystem/GenericForm";
import Button from "@/designSystem/Button";
import ConfirmModal from "@/designSystem/ConfirmModal";
import * as yup from "yup";
import { useCreateVoucherType, useUpdateVoucherType } from "@/hooks/voucherTypes/useVoucherTypes";
import type { CreateVoucherTypeRequest, UpdateVoucherTypeRequest } from "@/services/voucherTypeService";
import type { VoucherType } from "../types";
import toast from "@/utilities/toast";

type AddVoucherTypeModalProps = {
   isOpen: boolean;
   onClose: () => void;
   voucherType?: VoucherType | null; // For editing
   onSuccess?: () => void;
};

type VoucherTypeFormValues = {
   name: string;
   direction: string;
   description?: string;
   status: string;
};

function AddVoucherTypeModal({
   isOpen,
   onClose,
   voucherType,
   onSuccess,
}: AddVoucherTypeModalProps) {
   const { t } = useTranslation("settings");
   const { t: tCommon } = useTranslation("common");
   const isEditMode = !!voucherType;
   const createMutation = useCreateVoucherType();
   const updateMutation = useUpdateVoucherType();
   const [buttonState, setButtonState] = useState<"idle" | "loading" | "success">("idle");
   const [isDirty, setIsDirty] = useState(false);
   const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

   const schema = yup.object().shape({
      name: yup.string().required(t("validation.required")),
      direction: yup.string().required(t("validation.required")),
      description: yup.string(),
      status: yup.string().required(t("validation.required")),
   });

   const fields: FieldConfig[] = [
      {
         name: "name",
         type: "text",
         label: t("voucherTypes.modal.name"),
         placeholder: t("voucherTypes.modal.namePlaceholder"),
         required: true,
      },
      {
         name: "direction",
         type: "select",
         label: t("voucherTypes.modal.direction"),
         placeholder: t("voucherTypes.modal.directionPlaceholder"),
         required: true,
         options: [
            { id: "to", label: t("voucherTypes.direction.to") },
            { id: "from", label: t("voucherTypes.direction.from") },
            { id: "both", label: t("voucherTypes.direction.both") },
         ],
      },
      {
         name: "status",
         type: "select",
         label: t("voucherTypes.modal.status"),
         placeholder: t("voucherTypes.modal.statusPlaceholder"),
         required: true,
         options: [
            { id: "active", label: t("voucherTypes.status.active") },
            { id: "inactive", label: t("voucherTypes.status.inactive") },
         ],
      },
      {
         name: "description",
         type: "textarea",
         label: t("voucherTypes.modal.description"),
         placeholder: t("voucherTypes.modal.descriptionPlaceholder"),
         required: false,
      },
   ];

   // Compute default values based on voucherType prop
   const defaultValues = useMemo(() => {
      if (voucherType) {
         return {
            name: voucherType.voucher_type_name || voucherType.name || "",
            direction: voucherType.direction || "to",
            description: voucherType.description || "",
            status: (voucherType.status?.toLowerCase() || "active") as string,
         };
      }
      return {
         name: "",
         direction: "to",
         description: "",
         status: "active",
      };
   }, [voucherType]);

   const handleSubmit = async (data: VoucherTypeFormValues) => {
      if (buttonState === "loading") return;
      setButtonState("loading");
      try {
         if (voucherType) {
            // Update existing voucher type
            const voucherTypeId = voucherType.voucher_type_id || voucherType.id;
            if (voucherTypeId) {
               const payload: UpdateVoucherTypeRequest = {
                  voucher_type_name: data.name || undefined,
                  direction: data.direction || undefined,
                  description: data.description || undefined,
                  status: data.status === "active" ? "Active" : "Inactive",
               };
               await updateMutation.mutateAsync({
                  id: voucherTypeId,
                  payload,
               });
               toast.success(t("voucherTypes.toast.updateSuccess"));
            }
         } else {
            // Create new voucher type
            const payload: CreateVoucherTypeRequest = {
               voucher_type_name: data.name,
               direction: data.direction,
               description: data.description || undefined,
               status: data.status === "active" ? "Active" : "Inactive",
            };
            await createMutation.mutateAsync(payload);
            toast.success(t("voucherTypes.toast.createSuccess"));
         }
         if (onSuccess) onSuccess();
         setButtonState("idle");
         onClose();
      } catch (error) {
         console.error("Error saving voucher type:", error);
         toast.error(t("voucherTypes.toast.saveError"));
         setButtonState("idle");
      }
   };

   const isLoading = isEditMode ? updateMutation.isPending : createMutation.isPending;

   const footer = (
      <div className="flex justify-end gap-3 w-full">
         <Button
            variant="secondary"
            onClick={() => {
               if (isDirty) {
                  setShowDiscardConfirm(true);
                  return;
               }
               onClose();
            }}
            disabled={isLoading}>
            {t("voucherTypes.modal.cancel")}
         </Button>
         <Button
            type="submit"
            form="add-voucher-type-form"
            disabled={isLoading || buttonState === "loading"}>
            {(isLoading || buttonState === "loading") && (
               <span className="animate-spin mr-2 w-4 h-4 border-2 border-white border-t-transparent rounded-full inline-block align-middle" />
            )}
            {isEditMode
               ? t("voucherTypes.modal.updateButton") || "Update Voucher Type"
               : t("voucherTypes.modal.addButton")}
         </Button>
      </div>
   );

   return (
      <Modal
         isOpen={isOpen}
         onClose={() => {
            if (isDirty) {
               setShowDiscardConfirm(true);
               return;
            }
            onClose();
         }}
         title={isEditMode ? t("voucherTypes.modal.editTitle") || "Edit Voucher Type" : t("voucherTypes.modal.title")}
         width="w-[30rem]"
         size="medium"
         overflow="visible"
         footer={footer}>
         <GenericForm<VoucherTypeFormValues>
            key={voucherType?.voucher_type_id || voucherType?.id || "new"} // Force remount when switching between create/edit
            id="add-voucher-type-form"
            schema={schema}
            onSubmit={handleSubmit}
            fields={fields}
            showSubmitButton={false}
            defaultValues={defaultValues}
            onDirtyChange={setIsDirty}
         />
         <ConfirmModal
            isOpen={showDiscardConfirm}
            onClose={() => setShowDiscardConfirm(false)}
            onConfirm={onClose}
            title={tCommon("unsavedChanges.title")}
            description={tCommon("unsavedChanges.description")}
            confirmText={tCommon("unsavedChanges.confirm")}
            cancelText={tCommon("unsavedChanges.cancel")}
            variant="primary"
            icon="exclamation"
         />
      </Modal>
   );
}

export default AddVoucherTypeModal;
