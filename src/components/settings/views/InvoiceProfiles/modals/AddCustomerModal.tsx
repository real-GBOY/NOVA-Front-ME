/** @format */

import { useMemo, useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import Modal from "@/designSystem/Modal";
import GenericForm, { FieldConfig } from "@/designSystem/GenericForm";
import Button from "@/designSystem/Button";
import ConfirmModal from "@/designSystem/ConfirmModal";
import PhoneInput from "@/designSystem/ui/PhoneInput";
import * as yup from "yup";
import type { Customer } from "../types";

type AddCustomerModalProps = {
   isOpen: boolean;
   onClose: () => void;
   isLoading?: boolean;
   customer?: Customer | null; // For editing
   onSuccess?: (customer: Omit<Customer, "id">) => void;
};

type CustomerFormValues = {
   name: string;
   type: "Individual" | "Company";
   trnId: string;
   contactNumber: string;
   email: string;
   status: "active" | "inactive";
};

function AddCustomerModal({
   isOpen,
   onClose,
   isLoading = false,
   customer,
   onSuccess,
}: AddCustomerModalProps) {
   const { t } = useTranslation("settings");
   const { t: tCommon } = useTranslation("common");
   const isEditMode = !!customer;
   const [isDirty, setIsDirty] = useState(false);
   const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

   const schema = yup.object().shape({
      name: yup.string().required(t("validation.required")),
      type: yup
         .string()
         .oneOf(["Individual", "Company"])
         .required(t("validation.required")),
      trnId: yup.string().optional(),
      contactNumber: yup.string().required(t("validation.required")),
      email: yup
         .string()
         .email(t("validation.email"))
         .required(t("validation.required")),
      status: yup
         .string()
         .oneOf(["active", "inactive"])
         .required(t("validation.required")),
   });

   const fields: FieldConfig[] = useMemo(
      () => [
         {
            name: "name",
            label: t("invoiceProfiles.modal.customerName"),
            placeholder: t("invoiceProfiles.modal.customerNamePlaceholder"),
            type: "text",
            required: true,
            disabled: isLoading,
         },
         {
            name: "type",
            label: t("invoiceProfiles.modal.type"),
            placeholder: t("invoiceProfiles.modal.typePlaceholder"),
            type: "select",
            required: true,
            disabled: isLoading,
            options: [
               {
                  id: "Individual",
                  label: t("invoiceProfiles.modal.typeIndividual"),
               },
               { id: "Company", label: t("invoiceProfiles.modal.typeCompany") },
            ],
         },
         {
            name: "trnId",
            label: t("invoiceProfiles.modal.trnId"),
            placeholder: t("invoiceProfiles.modal.trnIdPlaceholder"),
            type: "text",
            required: false,
            disabled: isLoading,
         },
         {
            name: "contactNumber",
            type: "custom",
            label: t("invoiceProfiles.modal.contactNumber"),
            required: true,
            render: (form) => (
               <div className="flex flex-col gap-1">
                  <label className="block text-sm font-medium text-text-strong">
                     {t("invoiceProfiles.modal.contactNumber")}
                     <span className="text-primary">*</span>
                  </label>
                  <PhoneInput
                     value={form.watch("contactNumber") || ""}
                     onChange={(value) => {
                        form.setValue("contactNumber", value || "", {
                           shouldValidate: true,
                           shouldDirty: true,
                        });
                     }}
                     placeholder={t(
                        "invoiceProfiles.modal.contactNumberPlaceholder"
                     )}
                     disabled={isLoading}
                  />
                  {form.formState.errors.contactNumber && (
                     <p className="text-sm text-danger mt-1">
                        {form.formState.errors.contactNumber.message as string}
                     </p>
                  )}
               </div>
            ),
         },
         {
            name: "email",
            type: "custom",
            label: t("invoiceProfiles.modal.emailAddress"),
            required: true,
            render: (form) => (
               <div className="flex flex-col gap-1">
                  <label className="block text-sm font-medium text-text-strong">
                     {t("invoiceProfiles.modal.emailAddress")}
                     <span className="text-primary">*</span>
                  </label>
                  <input
                     type="email"
                     {...form.register("email")}
                     placeholder={t(
                        "invoiceProfiles.modal.emailAddressPlaceholder"
                     )}
                     disabled={isLoading}
                     className="w-full px-3 py-2.5 text-sm rounded-lg border border-border bg-background text-text-sub placeholder:text-text-soft focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  {form.formState.errors.email && (
                     <p className="text-sm text-danger mt-1">
                        {form.formState.errors.email.message as string}
                     </p>
                  )}
               </div>
            ),
         },
         {
            name: "status",
            label: t("invoiceProfiles.modal.status"),
            placeholder: t("invoiceProfiles.modal.statusPlaceholder"),
            type: "select",
            required: true,
            disabled: isLoading,
            options: [
               { id: "active", label: t("invoiceProfiles.status.active") },
               { id: "inactive", label: t("invoiceProfiles.status.inactive") },
            ],
         },
      ],
      [t, isLoading]
   );

   const handleSubmit = async (data: CustomerFormValues) => {
      if (isLoading) {
         return;
      }
      if (onSuccess) {
         onSuccess({
            name: data.name,
            type: data.type,
            trnId: data.trnId,
            contactNumber: data.contactNumber,
            email: data.email,
            status: data.status,
         });
      }
      onClose();
   };

   const handleClose = () => {
      if (isLoading) return;
      if (isDirty) {
         setShowDiscardConfirm(true);
         return;
      }
      onClose();
   };

   // Compute default values based on customer prop
   const defaultValues = useMemo(() => {
      if (customer) {
         return {
            name: customer.customer_name || customer.name || "",
            type: (customer.customer_type || customer.type || "Individual") as
               | "Individual"
               | "Company",
            trnId: customer.trn || customer.trnId || "",
            contactNumber:
               customer.contact_number || customer.contactNumber || "",
            email: customer.email || "",
            status: (customer.status?.toLowerCase() || "active") as
               | "active"
               | "inactive",
         };
      }
      return {
         name: "",
         type: "Individual" as "Individual" | "Company",
         trnId: "",
         contactNumber: "",
         email: "",
         status: "active" as "active" | "inactive",
      };
   }, [customer]);

   const footer = (
      <div className="flex justify-end gap-3 w-full">
         <Button variant="secondary" onClick={handleClose} disabled={isLoading}>
            {t("invoiceProfiles.modal.cancel")}
         </Button>
         <Button type="submit" form="add-customer-form" disabled={isLoading}>
            {isLoading && (
               <span className="animate-spin mr-2 w-4 h-4 border-2 border-white border-t-transparent rounded-full inline-block align-middle" />
            )}
            {t(
               isEditMode
                  ? "invoiceProfiles.modal.updateCustomerButton"
                  : "invoiceProfiles.modal.addCustomerButton"
            )}
         </Button>
      </div>
   );

   return (
      <Modal
         isOpen={isOpen}
         onClose={handleClose}
         title={t(
            isEditMode
               ? "invoiceProfiles.modal.editCustomerTitle"
               : "invoiceProfiles.modal.addCustomerTitle"
         )}
         width="w-[30rem]"
         size="medium"
         footer={footer}>
         <GenericForm<CustomerFormValues>
            key={customer?.customer_id || customer?.id || "new"} // Force remount when switching between create/edit
            id="add-customer-form"
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

export default AddCustomerModal;
