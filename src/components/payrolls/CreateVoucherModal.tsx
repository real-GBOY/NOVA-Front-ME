/** @format */

import { useMemo, useRef, useState, useCallback } from "react";
import type { UseFormReturn } from "react-hook-form";
import Modal from "@/designSystem/Modal";
import Button from "@/designSystem/Button";
import GenericForm, { FieldConfig } from "@/designSystem/GenericForm";
import { useTranslation } from "@/hooks/useTranslation";
import { useListBanks } from "@/hooks/banks/bank.queries";
import { useListPrettyCashNames } from "@/hooks/prettyCashNames/usePrettyCashNames";
import { format } from "date-fns";
import { DashboardPayroll } from "@/services/payrollService";
import * as yup from "yup";

interface CreateVoucherModalProps {
   isOpen: boolean;
   onClose: () => void;
   onSubmit: (data: CreateVoucherFormData) => Promise<void>;
   payroll: DashboardPayroll | null;
   isLoading?: boolean;
}

export interface CreateVoucherFormData {
   financialAccountId: number;
   valueDate: string;
   reference?: string;
   notes?: string;
}

type CreateVoucherFormValues = {
   accountType: string;
   financialAccountId: string;
   valueDate: string;
   reference?: string;
   notes?: string;
};

export default function CreateVoucherModal({
   isOpen,
   onClose,
   onSubmit,
   payroll,
   isLoading = false,
}: CreateVoucherModalProps) {
   const { t } = useTranslation("payrolls");
   const { t: tCommon } = useTranslation("common");
   const formRef = useRef<UseFormReturn<CreateVoucherFormValues> | null>(null);
   const defaultAccountType = "bank";
   const [accountType, setAccountType] = useState(defaultAccountType);

   // Fetch bank accounts
   const { data: banksData, isLoading: isLoadingBanks } = useListBanks(
      { page: 1, limit: 100 },
      { enabled: isOpen }
   );
   const { data: prettyCashData, isLoading: isLoadingPrettyCash } =
      useListPrettyCashNames({ page: 1, limit: 100 }, { enabled: isOpen });

   const bankOptions = useMemo(
      () =>
         banksData?.data
            .map((bank) => {
               const id = String(
                  bank.account_id ?? bank.id ?? bank.bank_id ?? ""
               );
               const labelParts = [bank.bank_name, bank.account_number].filter(
                  Boolean
               );
               const label = labelParts.length
                  ? labelParts.join(" - ")
                  : bank.account_name || id;
               return { id, label };
            })
            .filter((option) => option.id) || [],
      [banksData]
   );
   const prettyCashOptions = useMemo(
      () =>
         prettyCashData?.data
            .map((cash) => {
               const id = String(cash.account_id ?? "");
               const label = cash.account_name || cash.name || id;
               return { id, label };
            })
            .filter((option) => option.id) || [],
      [prettyCashData]
   );

   const accountTypeOptions = useMemo(
      () => [
         { id: "bank", label: t("modal.createVoucher.accountTypeBank") },
         { id: "cash", label: t("modal.createVoucher.accountTypeCash") },
      ],
      [t]
   );

   const accountOptions = useMemo(() => {
      if (accountType === "cash") return prettyCashOptions;
      if (accountType === "bank") return bankOptions;
      return [];
   }, [accountType, bankOptions, prettyCashOptions]);

   const isAccountLoading =
      accountType === "bank"
         ? isLoadingBanks
         : accountType === "cash"
         ? isLoadingPrettyCash
         : false;

   // Generate default reference based on payroll period
   const defaultReference = useMemo(() => {
      if (!payroll) return "";
      const periodStart = new Date(payroll.period_start);
      return `PAY-${format(periodStart, "yyyy-MM")}`;
   }, [payroll]);

   const schema = useMemo(
      () =>
         yup.object({
            accountType: yup.string().required(tCommon("validation.required")),
            financialAccountId: yup.string().when("accountType", {
               is: (value: string) => Boolean(value),
               then: (schema) =>
                  schema.required(tCommon("validation.required")),
               otherwise: (schema) => schema.notRequired(),
            }),
            valueDate: yup.string().required(tCommon("validation.required")),
            reference: yup.string().optional(),
            notes: yup.string().optional(),
         }),
      [tCommon]
   );

   const defaultValues = useMemo<CreateVoucherFormValues>(
      () => ({
         accountType: defaultAccountType,
         financialAccountId: "",
         valueDate: format(new Date(), "yyyy-MM-dd"),
         reference: "",
         notes: "",
      }),
      [defaultAccountType]
   );

   const fields = useMemo<FieldConfig[]>(() => {
      const accountLabel =
         accountType === "cash"
            ? t("modal.createVoucher.cashAccount")
            : t("modal.createVoucher.bankAccount");
      const accountPlaceholder =
         accountType === "cash"
            ? t("modal.createVoucher.cashAccountPlaceholder")
            : t("modal.createVoucher.bankAccountPlaceholder");

      return [
         {
            name: "accountType",
            label: t("modal.createVoucher.accountType"),
            type: "select",
            placeholder: t("modal.createVoucher.accountTypePlaceholder"),
            options: accountTypeOptions,
            required: true,
            disabled: isLoading,
         },
         ...(accountType
            ? [
                 {
                    name: "financialAccountId",
                    label: accountLabel,
                    type: "searchableSelect",
                    placeholder: accountPlaceholder,
                    options: accountOptions,
                    required: true,
                    disabled:
                       isLoading ||
                       isAccountLoading ||
                       accountOptions.length === 0,
                 },
              ]
            : []),
         {
            name: "valueDate",
            label: t("modal.createVoucher.valueDate"),
            type: "date",
            placeholder: "DD / MM / YYYY",
            required: true,
            disabled: isLoading,
         },
         {
            name: "reference",
            label: t("modal.createVoucher.reference"),
            type: "text",
            placeholder:
               defaultReference ||
               t("modal.createVoucher.referencePlaceholder"),
            disabled: isLoading,
         },
         {
            name: "notes",
            label: t("modal.createVoucher.notes"),
            type: "textarea",
            placeholder: t("modal.createVoucher.notesPlaceholder"),
            rows: 3,
            disabled: isLoading,
         },
      ];
   }, [
      t,
      accountType,
      accountTypeOptions,
      accountOptions,
      defaultReference,
      isLoading,
      isAccountLoading,
   ]);

   const handleFieldChange = useCallback(
      (field: keyof CreateVoucherFormValues, value: unknown) => {
         if (field !== "accountType") return;
         const nextAccountType = typeof value === "string" ? value : "";
         setAccountType(nextAccountType);
         formRef.current?.setValue("financialAccountId", "", {
            shouldValidate: true,
            shouldDirty: true,
            shouldTouch: true,
         });
      },
      []
   );

   if (!payroll) return null;

   const employeeName = `${payroll.Employee.first_name} ${payroll.Employee.last_name}`;
   const footer = (
      <div className="flex justify-end gap-3 w-full">
         <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            {t("modal.createVoucher.cancel")}
         </Button>
         <Button
            type="submit"
            form="create-payroll-voucher-form"
            disabled={isLoading}>
            {isLoading && (
               <span className="animate-spin mr-2 w-4 h-4 border-2 border-white border-t-transparent rounded-full inline-block align-middle" />
            )}
            {t("modal.createVoucher.create")}
         </Button>
      </div>
   );

   return (
      <Modal
         isOpen={isOpen}
         onClose={onClose}
         title={t("modal.createVoucher.title")}
         size="medium"
         overflow="visible"
         contentClassName="flex flex-col gap-5"
         footer={footer}>
         <p className="text-sm text-text-sub">
            {t("modal.createVoucher.description")}
         </p>
         <div className="flex items-center justify-between rounded-xl border border-border bg-bg-weak px-4 py-3">
            <div>
               <p className="text-sm font-medium text-text-strong">
                  {employeeName}
               </p>
               <p className="text-xs text-text-sub">
                  {format(new Date(payroll.period_start), "dd MMM yyyy")} -{" "}
                  {format(new Date(payroll.period_end), "dd MMM yyyy")}
               </p>
            </div>
            <div className="text-end">
               <p className="text-sm font-medium text-text-strong">
                  {parseFloat(payroll.net_pay).toLocaleString("en-AE", {
                     style: "currency",
                     currency: "AED",
                  })}
               </p>
               <p className="text-xs text-text-sub">{t("fields.netPay")}</p>
            </div>
         </div>
         <GenericForm<CreateVoucherFormValues>
            id="create-payroll-voucher-form"
            schema={schema}
            defaultValues={defaultValues}
            formRef={formRef}
            onFieldChange={handleFieldChange}
            onSubmit={(data) =>
               onSubmit({
                  financialAccountId: Number(data.financialAccountId),
                  valueDate: data.valueDate,
                  reference:
                     data.reference?.trim() || defaultReference || undefined,
                  notes: data.notes?.trim() || undefined,
               })
            }
            fields={fields}
            showSubmitButton={false}
            mode="onChange"
         />
      </Modal>
   );
}
