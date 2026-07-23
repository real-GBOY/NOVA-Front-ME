/** @format */

import { useMemo, useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import Modal from "@/designSystem/Modal";
import GenericForm, { FieldConfig } from "@/designSystem/GenericForm";
import Button from "@/designSystem/Button";
import ConfirmModal from "@/designSystem/ConfirmModal";
import * as yup from "yup";
import { useCreatePrettyCashName, useUpdatePrettyCashName } from "@/hooks/prettyCashNames/usePrettyCashNames";
import type { CreatePrettyCashNameRequest, UpdatePrettyCashNameRequest } from "@/services/prettyCashNameService";
import type { PrettyCashName } from "../types";
import toast from "@/utilities/toast";

type AddPrettyCashNameModalProps = {
   isOpen: boolean;
   onClose: () => void;
   prettyCashName?: PrettyCashName | null; // For editing
   onSuccess?: () => void;
};

type PrettyCashNameFormValues = {
   name: string;
   balance?: string;
   status: string;
};

function AddPrettyCashNameModal({
   isOpen,
   onClose,
   prettyCashName,
   onSuccess,
}: AddPrettyCashNameModalProps) {
   const { t } = useTranslation("settings");
   const { t: tCommon } = useTranslation("common");
   const isEditMode = !!prettyCashName;
   const createMutation = useCreatePrettyCashName();
   const updateMutation = useUpdatePrettyCashName();
   const [isDirty, setIsDirty] = useState(false);
   const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

   const schema = useMemo(() => {
      const shape = {
         name: yup.string().required(t("validation.required")),
         status: yup.string().required(t("validation.required")),
      };

      return yup.object().shape({
         ...shape,
         balance: isEditMode
            ? yup.string().optional()
            : yup.string().required(t("validation.required")),
      });
   }, [isEditMode, t]);

   const fields: FieldConfig[] = [
      {
         name: "name",
         type: "text",
         label: t("prettyCashNames.modal.name"),
         placeholder: t("prettyCashNames.modal.namePlaceholder"),
         required: true,
      },
      ...(!isEditMode
         ? [
              {
                 name: "balance",
                 type: "text", // Or currency input if available, but text for now to match mock data "500 AED"
                 label: t("prettyCashNames.modal.balance"),
                 placeholder: t("prettyCashNames.modal.balancePlaceholder"),
                 required: true,
              } as FieldConfig,
           ]
         : []),
      {
         name: "status",
         type: "select",
         label: t("prettyCashNames.modal.status"),
         placeholder: t("prettyCashNames.modal.statusPlaceholder"),
         required: true,
         options: [
            { id: "active", label: t("prettyCashNames.status.active") },
            { id: "inactive", label: t("prettyCashNames.status.inactive") },
         ],
      },
   ];

   // Compute default values based on prettyCashName prop
   const defaultValues = useMemo(() => {
      if (prettyCashName) {
         // Extract balance number from formatted string like "5000 AED" or use opening_balance
         let balanceValue = "";
         if (prettyCashName.balance) {
            // Extract number from formatted balance string
            const match = prettyCashName.balance.match(/[\d.]+/);
            balanceValue = match ? match[0] : "";
         } else if (prettyCashName.opening_balance !== undefined) {
            balanceValue = prettyCashName.opening_balance.toString();
         }
         
         return {
            name: prettyCashName.name || "",
            balance: balanceValue,
            status: (prettyCashName.status?.toLowerCase() || "active") as string,
         };
      }
      return {
         name: "",
         balance: "",
         status: "active",
      };
   }, [prettyCashName]);

   const handleSubmit = async (data: PrettyCashNameFormValues) => {
      try {
         if (prettyCashName) {
            // Update existing pretty cash name
            const prettyCashId = prettyCashName.petty_cash_id || prettyCashName.id;
            if (prettyCashId) {
               const payload: UpdatePrettyCashNameRequest = {
                  name: data.name || undefined,
                  currency: prettyCashName.currency || "AED", // Keep existing currency
                  status: data.status === "active" ? "Active" : "Inactive",
                  account_id: prettyCashName.account_id || undefined, // Keep existing account_id
               };
               await updateMutation.mutateAsync({
                  id: prettyCashId,
                  payload,
               });
               toast.success(t("prettyCashNames.toast.updateSuccess"));
            }
         } else {
            // Create new pretty cash name
            const payload: CreatePrettyCashNameRequest = {
               name: data.name,
               account_id: 1, // TODO: Get account_id from account selection if needed
               opening_balance: parseFloat(data.balance || "") || 0,
               currency: "AED", // TODO: Get currency from form if needed
               status: data.status === "active" ? "Active" : "Inactive",
            };
            await createMutation.mutateAsync(payload);
            toast.success(t("prettyCashNames.toast.createSuccess"));
         }
         if (onSuccess) onSuccess();
         onClose();
      } catch (error) {
         console.error("Error saving pretty cash name:", error);
         toast.error(t("prettyCashNames.toast.saveError"));
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
            {t("prettyCashNames.modal.cancel")}
         </Button>
         <Button type="submit" form="add-pretty-cash-name-form" disabled={isLoading}>
            {isLoading && (
               <span className="animate-spin mr-2 w-4 h-4 border-2 border-white border-t-transparent rounded-full inline-block align-middle" />
            )}
            {isEditMode
               ? t("prettyCashNames.modal.updateButton") || "Update Pretty Cash Name"
               : t("prettyCashNames.modal.addButton")}
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
         title={isEditMode ? t("prettyCashNames.modal.editTitle") || "Edit Pretty Cash Name" : t("prettyCashNames.modal.title")}
         width="w-[30rem]"
         size="medium"
         overflow="visible"
         footer={footer}>
         <GenericForm<PrettyCashNameFormValues>
            key={prettyCashName?.petty_cash_id || prettyCashName?.id || "new"} // Force remount when switching between create/edit
            id="add-pretty-cash-name-form"
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

export default AddPrettyCashNameModal;
