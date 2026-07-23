/** @format */

import { useRef, useMemo, useEffect, useState } from "react";
import Modal from "@/designSystem/Modal";
import Button from "@/designSystem/Button";
import { GenericFormField } from "@/designSystem/GenericFormField";
import FormValidationSummary from "@/designSystem/FormValidationSummary";
import { buildValidationSummaryItems } from "@/designSystem/GenericForm";
import ConfirmModal from "@/designSystem/ConfirmModal";
import { Xmark, Print } from "@/Icons";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import {
   voucherSchema,
   type VoucherFormData,
} from "@/utilities/schemas/voucherSchema";
import type { PaymentVoucherDetail } from "@/services/paymentVoucherService";
import type { ReceiptVoucherDetail } from "@/services/receiptVoucherService";
import { useListCustomers } from "@/hooks/customers/useCustomers";
import { useListExpenseTypes } from "@/hooks/expenseTypes/useExpenseTypes";
import { useListIncomeTypes } from "@/hooks/incomeTypes/useIncomeTypes";
import { useListBanks } from "@/hooks/banks/useBanks";
import { useListAgents } from "@/hooks/agents/useAgents";
import { useListEmployees } from "@/hooks/employees/useEmployee";
import { employeeService } from "@/services/employeeService";
import { useTranslation } from "@/hooks/useTranslation";
import { applyPrintWindowMeta } from "@/utils/printWindow";
import LoadingState from "@/designSystem/LoadingState";
import VoucherPaper from "@/components/common/paper/VoucherPaper";
import SearchableSelect from "@/components/invoices/SearchableSelect";

type AddPaymentVoucherModalProps = {
   isOpen: boolean;
   onClose: () => void;
   voucher?: PaymentVoucherDetail | ReceiptVoucherDetail | null; // For editing
   onSubmit?: (data: VoucherFormData) => void;
   voucherType: "payment" | "receipt";
};

function AddPaymentVoucherModal({
   isOpen,
   onClose,
   onSubmit,
   voucherType,
   voucher,
}: AddPaymentVoucherModalProps) {
   const voucherPreviewRef = useRef<HTMLDivElement>(null);
   const { t } = useTranslation("common");

   // Fetch dynamic data
   const { data: customersData, isLoading: isCustomersLoading } =
      useListCustomers({ limit: 100, page: 1 }, { enabled: isOpen });
   const { data: expenseTypesData, isLoading: isExpenseTypesLoading } =
      useListExpenseTypes(
         {
            limit: 100,
            page: 1,
         },
         { enabled: isOpen }
      );
   const { data: incomeTypesData, isLoading: isIncomeTypesLoading } =
      useListIncomeTypes(
         {
            limit: 100,
            page: 1,
         },
         { enabled: isOpen }
      );
   const { data: banksData, isLoading: isBanksLoading } = useListBanks(
      { limit: 100, page: 1 },
      { enabled: isOpen }
   );
   const { data: agentsData, isLoading: isAgentsLoading } = useListAgents(
      { limit: 100, page: 1 },
      { enabled: isOpen }
   );
   const { data: employeesData, isLoading: isEmployeesLoading } =
      useListEmployees({ limit: 100, page: 1 }, { enabled: isOpen });

   const isOptionsLoading =
      isCustomersLoading ||
      isExpenseTypesLoading ||
      isIncomeTypesLoading ||
      isBanksLoading ||
      isAgentsLoading ||
      isEmployeesLoading;

   // Map options
   const customerOptions = useMemo(
      () =>
         customersData?.data.map((c) => ({
            id: String(c.customer_id),
            label: c.customer_name,
         })) || [],
      [customersData]
   );

   const expenseOptions = useMemo(
      () =>
         expenseTypesData?.data.map((e) => ({
            id: String(e.expense_type_id),
            label: e.type_name,
         })) || [],
      [expenseTypesData]
   );

   const incomeOptions = useMemo(
      () =>
         incomeTypesData?.data.map((i) => ({
            id: String(i.income_type_id),
            label: i.type_name,
         })) || [],
      [incomeTypesData]
   );

   const bankOptions = useMemo(
      () =>
         banksData?.data.map((b) => ({
            id: String(b.account_id),
            label: b.bank_name,
         })) || [],
      [banksData]
   );

   const agentOptions = useMemo(
      () =>
         agentsData?.data.map((a) => ({
            id: String(a.agent_id),
            label: a.name || a.agent_code || `Agent ${a.agent_id}`,
         })) || [],
      [agentsData]
   );

  const employeeOptions = useMemo(
      () =>
         employeesData?.data.map((e) => ({
            id: String(e.id),
            label: e.name || `Employee ${e.id}`,
            avatarUrl: e.avatar || undefined,
         })) || [],
      [employeesData]
   );

   const fetchEmployeeOptions = async (search: string) => {
      const response = await employeeService.getDictionary({
         page: 1,
         limit: 20,
         search: search || undefined,
      });
      return response.map((emp) => ({
         id: String(emp.id),
         label: emp.label,
         avatarUrl: emp.avatar || undefined,
      }));
   };

   const resolverContext = useRef({ voucherType });
   resolverContext.current.voucherType = voucherType;
   const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

   const form = useForm<VoucherFormData>({
      resolver: yupResolver(voucherSchema) as any,
      context: resolverContext.current,
      defaultValues: {
         date: new Date(),
         toType: "",
         customerName: "",
         fromType: "",
         prettyCashName: "",
         bank: "",
         amount: 0,
         currency: "AED",
         commission: 0,
         taxType: "",
         tax: 0,
         transactionDetails: "",
         notes: "",
         status: "Pending_Approval" as const,
         // New fields
         fromCustomerId: "",
         fromAgentId: "",
         fromEmployeeId: "",
         fromEntityName: "",
         fromAccountId: "",
         toCustomerId: "",
         toAgentId: "",
         toEmployeeId: "",
         toAccountId: "",
         referenceNumber: "",
         bankCommission: 0,
         taxAmount: 0,
         taxRate: 0,
         toEntityName: "",
         bankName: "",
         paymentMethod: "Bank Transfer",
         expenseTypeId: "",
         incomeTypeId: "",
      },
      mode: "onChange",
   });

   const {
      watch,
      handleSubmit: hookFormSubmit,
      reset,
      setFocus,
      formState,
   } = form;
   const formValues = watch();
   const { errors, submitCount } = formState;
   const isDirty = formState.isDirty;
   const { items: validationItems, globalMessage } = useMemo(
      () => buildValidationSummaryItems(errors, {}, {}),
      [errors]
   );
   const summaryDescription = [
      t("validationSummary.description"),
      globalMessage,
   ]
      .filter(Boolean)
      .join(" ");
   const shouldShowSummary = submitCount > 0 && validationItems.length > 0;

   const handleFocusField = (fieldName: string) => {
      if (!fieldName) return;
      setFocus(fieldName as never);

      if (typeof document === "undefined") return;
      const safeFieldName =
         typeof CSS !== "undefined" && "escape" in CSS
            ? CSS.escape(fieldName)
            : fieldName;
      const target =
         document.getElementById(fieldName) ||
         document.querySelector(`[data-field="${safeFieldName}"]`) ||
         document.querySelector(`[name="${safeFieldName}"]`);
      if (target && "scrollIntoView" in target) {
         target.scrollIntoView({ behavior: "smooth", block: "center" });
      }
   };

   const getFieldFeedback = (field: keyof VoucherFormData) => {
      const fieldState = form.getFieldState(field, formState);
      const message = fieldState.error?.message;
      const shouldShow =
         fieldState.isTouched || fieldState.isDirty || submitCount > 0;
      return {
         shouldShow: Boolean(message) && shouldShow,
         message: message ? String(message) : "",
      };
   };

   const toEmployeeFeedback = getFieldFeedback("toEmployeeId");
   const remarksFeedback = getFieldFeedback("remarks");

   // Reset form when opening or changing type, or populate when editing
   useEffect(() => {
      if (isOpen) {
         if (voucher) {
            // Populate form with voucher data for editing
            const isPayment = voucherType === "payment";
            const paymentVoucher = isPayment
               ? (voucher as PaymentVoucherDetail)
               : null;
            const receiptVoucher = !isPayment
               ? (voucher as ReceiptVoucherDetail)
               : null;

            reset({
               date: paymentVoucher
                  ? new Date(paymentVoucher.voucher_date)
                  : receiptVoucher
                  ? new Date(receiptVoucher.receipt_date)
                  : new Date(),
               amount: paymentVoucher?.amount || receiptVoucher?.amount || 0,
               currency:
                  paymentVoucher?.currency || receiptVoucher?.currency || "AED",
               paymentMethod:
                  paymentVoucher?.payment_method ||
                  receiptVoucher?.payment_method ||
                  "",
               transactionDetails:
                  paymentVoucher?.transaction_details ||
                  receiptVoucher?.transaction_details ||
                  "",
               remarks:
                  paymentVoucher?.remarks || receiptVoucher?.remarks || "",
               status: (paymentVoucher?.status ||
                  receiptVoucher?.status ||
                  "Pending_Approval") as "Pending_Approval" | "Approved",
               // Payment voucher specific
               fromType:
                  paymentVoucher?.from_type || receiptVoucher?.from_type || "",
               fromAccountId: paymentVoucher?.from_account?.account_id
                  ? String(paymentVoucher.from_account.account_id)
                  : "",
               toType:
                  paymentVoucher?.to_type ||
                  (receiptVoucher?.to_account ? "Bank" : ""),
               toCustomerId: paymentVoucher?.to_customer?.customer_id
                  ? String(paymentVoucher.to_customer.customer_id)
                  : "",
               toAgentId: paymentVoucher?.to_agent?.agent_id
                  ? String(paymentVoucher.to_agent.agent_id)
                  : "",
               toAccountId:
                  paymentVoucher?.to_account?.account_id ||
                  receiptVoucher?.to_account?.account_id
                     ? String(
                          paymentVoucher?.to_account?.account_id ||
                             receiptVoucher?.to_account?.account_id
                       )
                     : "",
               toEntityName: paymentVoucher?.to_entity_name || "",
               expenseTypeId: paymentVoucher?.expense_type?.type_id
                  ? String(paymentVoucher.expense_type.type_id)
                  : "",
               commission: paymentVoucher?.commission || 0,
               taxType: paymentVoucher?.tax_type || "",
               taxRate: paymentVoucher?.tax_rate || 0,
               bankName:
                  paymentVoucher?.bank_name || receiptVoucher?.bank_name || "",
               // Receipt voucher specific
               incomeTypeId: receiptVoucher?.income_type?.income_type_id
                  ? String(receiptVoucher.income_type.income_type_id)
                  : receiptVoucher?.income_type?.type_id
                  ? String(receiptVoucher.income_type.type_id)
                  : "",
               fromCustomerId: receiptVoucher?.from_customer?.customer_id
                  ? String(receiptVoucher.from_customer.customer_id)
                  : "",
               fromAgentId: receiptVoucher?.from_agent?.agent_id
                  ? String(receiptVoucher.from_agent.agent_id)
                  : "",
               fromEntityName: receiptVoucher?.from_entity_name || "",
               toEmployeeId: paymentVoucher?.to_employee?.employee_id
                  ? String(paymentVoucher.to_employee.employee_id)
                  : "",
               referenceNumber: receiptVoucher?.reference_number || "",
               bankCommission: receiptVoucher?.bank_commission || 0,
               taxAmount: receiptVoucher?.tax_amount || 0,
               // Legacy fields
               customerName: "",
               prettyCashName: "",
               bank: "",
               notes: "",
               tax:
                  paymentVoucher?.tax_amount || receiptVoucher?.tax_amount || 0,
            });
         } else {
            // Reset to defaults for new voucher
            reset();
         }
      }
   }, [isOpen, voucherType, voucher, reset]);

   const handlePrint = () => {
      if (!voucherPreviewRef.current) return;

      const printWindow = window.open("", "_blank");
      if (!printWindow) return;

      const voucherContent = voucherPreviewRef.current.innerHTML;
      const stylesheets = Array.from(document.styleSheets)
         .map((styleSheet) => {
            try {
               return Array.from(styleSheet.cssRules)
                  .map((rule) => rule.cssText)
                  .join("\n");
            } catch {
               const link = styleSheet.href;
               return link ? `@import url("${link}");` : "";
            }
         })
         .join("\n");

      printWindow.document.write(`
         <!DOCTYPE html>
         <html>
            <head>
               <title>${
                  voucherType === "payment" ? "Payment" : "Receipt"
               } Voucher - Preview</title>
               <style>
                  ${stylesheets}
                  @media print {
                     body { margin: 0; padding: 20px; }
                     @page { margin: 0.5in; }
                  }
               </style>
            </head>
            <body>${voucherContent}</body>
         </html>
      `);

      printWindow.document.close();
      applyPrintWindowMeta(
         printWindow,
         `${voucherType === "payment" ? "Payment" : "Receipt"} Voucher Preview`
      );
      printWindow.focus();
      setTimeout(() => {
         printWindow.print();
         printWindow.close();
      }, 250);
   };

   const handleFormSubmit = (data: VoucherFormData) => {
      if (onSubmit) {
         onSubmit(data);
      }
   };

   const handleFormError = (formErrors: typeof errors) => {
      const { items } = buildValidationSummaryItems(formErrors, {}, {});
      if (items[0]) {
         handleFocusField(items[0].field);
      }
   };
   const handleRequestClose = () => {
      if (isDirty) {
         setShowDiscardConfirm(true);
         return;
      }
      onClose();
   };

   return (
      <Modal
         isOpen={isOpen}
         onClose={handleRequestClose}
         showCloseButton={false}
         size="large"
         contentClassName="p-0">
         <form
            onSubmit={hookFormSubmit(handleFormSubmit, handleFormError)}
            className="flex h-full flex-col bg-background rounded-2xl">
            {/* Header */}
            <div className="flex items-center justify-between px-6 pb-4 border-b border-border">
               <div className="flex items-center gap-4">
                  <button
                     type="button"
                     onClick={handleRequestClose}
                     className="flex items-center justify-center w-10 h-10 rounded-[10px] border border-border bg-background shadow-sm hover:bg-bg-weak transition-colors">
                     <Xmark className="w-5 h-5 fill-text-sub" />
                  </button>
                  <div className="w-px h-6 bg-border" />
                  <h1 className="text-xl font-medium text-text-strong">
                     {voucher
                        ? voucherType === "payment"
                           ? "Update Payment"
                           : "Update Receipt"
                        : voucherType === "payment"
                        ? "Create Payment"
                        : "Create Receipt"}
                  </h1>
               </div>
               <Button type="submit">
                  {voucher
                     ? voucherType === "payment"
                        ? "Update Payment"
                        : "Update Receipt"
                     : voucherType === "payment"
                     ? "Create Payment"
                     : "Create Receipt"}
               </Button>
            </div>

            {/* Content */}
            <div className="flex flex-1 overflow-hidden">
               {/* Left Panel: Form */}
               <div className="w-2/5 flex flex-col p-6 gap-6 overflow-y-auto">
                  {shouldShowSummary && (
                     <FormValidationSummary
                        items={validationItems}
                        title={t("validationSummary.title")}
                        description={summaryDescription}
                        onSelectField={handleFocusField}
                     />
                  )}
                  {isOptionsLoading && (
                     <LoadingState
                        size="small"
                        label="Loading options..."
                        minHeight="64px"
                     />
                  )}
                  {/* Voucher Details Section */}
                  <div className="flex flex-col gap-5">
                     <h2 className="text-2xl font-medium text-text-strong">
                        Voucher Details
                     </h2>
                     <div className="flex flex-col gap-4">
                        {/* Date hidden as per design
								<div className='flex flex-col gap-2' data-field='date'>
									<label
										className={`block text-sm font-medium ${
											dateFeedback.shouldShow ? "text-danger" : "text-text-sub"
										}`}>
										Date
									</label>
									<Controller
										name='date'
										control={form.control}
										render={({ field }) => (
											<DatePicker
												id='date'
												ariaInvalid={dateFeedback.shouldShow}
												ariaDescribedBy={
													dateFeedback.shouldShow ? "date-error" : undefined
												}
												status={dateFeedback.shouldShow ? "error" : "default"}
												value={field.value || undefined}
												onChange={field.onChange}
												placeholder='DD / MM / YYYY'
											/>
										)}
									/>
									{dateFeedback.shouldShow && (
										<p id='date-error' className='text-xs text-danger'>
											{dateFeedback.message}
										</p>
									)}
								</div> */}

                        {/* Payment Voucher Specific Fields */}
                        {voucherType === "payment" && (
                           <>
                              {/* From Type/Account hidden as per design */}

                              <GenericFormField
                                 form={form}
                                 fieldConfig={{
                                    name: "toType",
                                    label: "To Type",
                                    type: "select",
                                    placeholder: "Choose Type",
                                    options: [
                                       { id: "Customer", label: "Customer" },
                                       { id: "Agent", label: "Agent" },
                                       { id: "Employee", label: "Employee" },
                                       { id: "Bank", label: "Bank" },
                                       { id: "Other", label: "Other" },
                                    ],
                                    required: true,
                                 }}
                              />
                              <GenericFormField
                                 form={form}
                                 fieldConfig={{
                                    name: "expenseTypeId",
                                    label: "Expense Type",
                                    type: "select",
                                    placeholder: isExpenseTypesLoading
                                       ? "Loading expense types..."
                                       : "Choose Expense Type",
                                    options: expenseOptions,
                                    required: true,
                                    disabled: isExpenseTypesLoading,
                                 }}
                              />
                              {formValues.toType === "Customer" && (
                                 <GenericFormField
                                    form={form}
                                    fieldConfig={{
                                       name: "toCustomerId",
                                       label: "Customer Name",
                                       type: "select",
                                       placeholder: isCustomersLoading
                                          ? "Loading customers..."
                                          : "Find Customer",
                                       options: customerOptions,
                                       disabled: isCustomersLoading,
                                    }}
                                 />
                              )}
                              {formValues.toType === "Agent" && (
                                 <GenericFormField
                                    form={form}
                                    fieldConfig={{
                                       name: "toAgentId",
                                       label: "Agent Name",
                                       type: "select",
                                       placeholder: isAgentsLoading
                                          ? "Loading agents..."
                                          : "Select Agent",
                                       options: agentOptions,
                                       required: true,
                                       disabled: isAgentsLoading,
                                    }}
                                 />
                              )}
                              {formValues.toType === "Employee" && (
                                 <div
                                    className="flex flex-col gap-2"
                                    data-field="toEmployeeId">
                                    <Controller
                                       name="toEmployeeId"
                                       control={form.control}
                                       render={({ field }) => (
                                          <SearchableSelect
                                             label="Employee"
                                             required
                                             value={field.value || ""}
                                             onChange={field.onChange}
                                             options={employeeOptions}
                                             serverSideSearch={true}
                                             fetchOptions={fetchEmployeeOptions}
                                             placeholder={
                                                isEmployeesLoading
                                                   ? "Loading employees..."
                                                   : "Select Employee"
                                             }
                                             disabled={isEmployeesLoading}
                                          />
                                       )}
                                    />
                                    {toEmployeeFeedback.shouldShow && (
                                       <p className="text-xs text-danger">
                                          {toEmployeeFeedback.message}
                                       </p>
                                    )}
                                 </div>
                              )}
                              {formValues.toType === "Bank" && (
                                 <GenericFormField
                                    form={form}
                                    fieldConfig={{
                                       name: "toAccountId",
                                       label: "Bank Account",
                                       type: "select",
                                       placeholder: isBanksLoading
                                          ? "Loading accounts..."
                                          : "Select Bank Account",
                                       options: bankOptions,
                                       required: true,
                                       disabled: isBanksLoading,
                                    }}
                                 />
                              )}
                              {formValues.toType === "Other" && (
                                 <GenericFormField
                                    form={form}
                                    fieldConfig={{
                                       name: "toEntityName",
                                       label: "To Entity Name",
                                       type: "text",
                                       placeholder: "Enter Entity Name",
                                    }}
                                 />
                              )}
                           </>
                        )}

                        {/* Receipt Voucher Specific Fields */}
                        {voucherType === "receipt" && (
                           <>
                              <GenericFormField
                                 form={form}
                                 fieldConfig={{
                                    name: "fromType",
                                    label: "Received From",
                                    type: "select",
                                    placeholder: "Choose Type",
                                    options: [
                                       { id: "Customer", label: "Customer" },
                                       { id: "Agent", label: "Agent" },
                                       { id: "Other", label: "Other" },
                                    ],
                                    required: true,
                                 }}
                              />
                              {formValues.fromType === "Customer" && (
                                 <GenericFormField
                                    form={form}
                                    fieldConfig={{
                                       name: "fromCustomerId",
                                       label: "Customer",
                                       type: "select",
                                       placeholder: isCustomersLoading
                                          ? "Loading customers..."
                                          : "Select Customer",
                                       options: customerOptions,
                                       required: true,
                                       disabled: isCustomersLoading,
                                    }}
                                 />
                              )}
                              {formValues.fromType === "Agent" && (
                                 <GenericFormField
                                    form={form}
                                    fieldConfig={{
                                       name: "fromAgentId",
                                       label: "Agent",
                                       type: "select",
                                       placeholder: isAgentsLoading
                                          ? "Loading agents..."
                                          : "Select Agent",
                                       options: agentOptions,
                                       required: true,
                                       disabled: isAgentsLoading,
                                    }}
                                 />
                              )}
                              {formValues.fromType === "Other" && (
                                 <GenericFormField
                                    form={form}
                                    fieldConfig={{
                                       name: "fromEntityName",
                                       label: "Entity Name",
                                       type: "text",
                                       placeholder: "Enter Entity Name",
                                       required: true,
                                    }}
                                 />
                              )}
                              <GenericFormField
                                 form={form}
                                 fieldConfig={{
                                    name: "incomeTypeId",
                                    label: "Income Type",
                                    type: "select",
                                    placeholder: isIncomeTypesLoading
                                       ? "Loading income types..."
                                       : "Select Income Type",
                                    options: incomeOptions,
                                    required: true,
                                    disabled: isIncomeTypesLoading,
                                 }}
                              />
                           </>
                        )}
                     </div>
                  </div>

                  <div className="h-px bg-border w-full" />

                  {/* Payment Details Section */}
                  <div className="flex flex-col gap-5">
                     <h2 className="text-2xl font-medium text-text-strong">
                        Payment Details
                     </h2>
                     <div className="flex flex-col gap-4">
                        {voucherType === "payment" && (
                           <div className="flex gap-4">
                              <div className="flex-1">
                                 <GenericFormField
                                    form={form}
                                    fieldConfig={{
                                       name: "fromType",
                                       label: "From Type",
                                       type: "select",
                                       placeholder: "Choose Type",
                                       options: [
                                          { id: "Cash", label: "Cash" },
                                          { id: "Bank", label: "Bank" },
                                       ],
                                       required: true,
                                    }}
                                 />
                              </div>
                              <div className="flex-1">
                                 {formValues.fromType === "Cash" && (
                                    <GenericFormField
                                       form={form}
                                       fieldConfig={{
                                          name: "fromAccountId", // Map to fromAccountId for backend
                                          label: "Pretty Cash Name",
                                          type: "select",
                                          placeholder: "Choose Cash Name",
                                          options: [
                                             { id: "1", label: "Main Cash" }, // Placeholder IDs - ensure these exist in backend or are mapped
                                             { id: "2", label: "Petty Cash 1" },
                                          ],
                                          required: true,
                                       }}
                                    />
                                 )}
                                 {formValues.fromType === "Bank" && (
                                    <GenericFormField
                                       form={form}
                                       fieldConfig={{
                                          name: "fromAccountId",
                                          label: "From Account",
                                          type: "select",
                                          placeholder: isBanksLoading
                                             ? "Loading accounts..."
                                             : "Select Account",
                                          options: bankOptions,
                                          required: true,
                                          disabled: isBanksLoading,
                                       }}
                                    />
                                 )}
                              </div>
                           </div>
                        )}

                        {voucherType === "receipt" && (
                           <div className="flex gap-4">
                              <div className="flex-1">
                                 <GenericFormField
                                    form={form}
                                    fieldConfig={{
                                       name: "toType",
                                       label: "To Type",
                                       type: "select",
                                       placeholder: "Choose Type",
                                       options: [
                                          { id: "Cash", label: "Cash" },
                                          { id: "Bank", label: "Bank" },
                                       ],
                                       required: true,
                                    }}
                                 />
                              </div>
                              <div className="flex-1">
                                 {formValues.toType === "Cash" && (
                                    <GenericFormField
                                       form={form}
                                       fieldConfig={{
                                          name: "toAccountId",
                                          label: "Pretty Cash Name",
                                          type: "select",
                                          placeholder: "Choose Cash Name",
                                          options: [
                                             { id: "1", label: "Main Cash" },
                                             { id: "2", label: "Petty Cash 1" },
                                          ],
                                          required: true,
                                       }}
                                    />
                                 )}
                                 {formValues.toType === "Bank" && (
                                    <GenericFormField
                                       form={form}
                                       fieldConfig={{
                                          name: "toAccountId",
                                          label: "To Account",
                                          type: "select",
                                          placeholder: isBanksLoading
                                             ? "Loading accounts..."
                                             : "Select Account",
                                          options: bankOptions,
                                          required: true,
                                          disabled: isBanksLoading,
                                       }}
                                    />
                                 )}
                              </div>
                           </div>
                        )}

                        <GenericFormField
                           form={form}
                           fieldConfig={{
                              name: "amount",
                              label: "Amount",
                              type: "currency",
                              placeholder: "0.00",
                              required: true,
                              currencyIconSrc: "/icons/dirham.png",
                              currencySuffix: "AED",
                           }}
                        />

                        <GenericFormField
                           form={form}
                           fieldConfig={{
                              name: "commission",
                              label: "Commission",
                              type: "currency",
                              placeholder: "0.00",
                              currencyIconSrc: "/icons/dirham.png",
                              currencySuffix: "AED",
                           }}
                        />

                        <div className="flex gap-4">
                           <div className="flex-1">
                              <GenericFormField
                                 form={form}
                                 fieldConfig={{
                                    name: "taxType",
                                    label: "Tax Type",
                                    type: "select",
                                    placeholder: "Choose Tax Type",
                                    options: [
                                       {
                                          id: "Percentage",
                                          label: "Percentage",
                                       },
                                       { id: "Fixed", label: "Fixed" },
                                    ],
                                    required: true,
                                 }}
                              />
                           </div>
                           <div className="flex-1">
                              <GenericFormField
                                 form={form}
                                 fieldConfig={{
                                    name: "taxRate", // Using taxRate for "Tax" field as per previous logic, or 'tax' if it's amount? Design says "Tax", usually implies rate if type is selected, or amount. keeping taxRate/tax logic.
                                    label: "Tax",
                                    type: "currency",
                                    placeholder: "0.00",
                                    currencyIconSrc: "/icons/dirham.png",
                                    currencySuffix: "AED",
                                 }}
                              />
                           </div>
                        </div>

                        <GenericFormField
                           form={form}
                           fieldConfig={{
                              name: "transactionDetails",
                              label: "Transaction Details",
                              type: "text",
                              placeholder: "Enter Transaction Details",
                           }}
                        />

                        <div
                           className="flex flex-col gap-2"
                           data-field="remarks">
                           <label
                              className={`block text-sm font-medium ${
                                 remarksFeedback.shouldShow
                                    ? "text-danger"
                                    : "text-text-sub"
                              }`}>
                              Notes
                           </label>
                           <div className="relative">
                              <Controller
                                 name="remarks"
                                 control={form.control}
                                 render={({ field }) => (
                                    <div className="relative">
                                       <textarea
                                          id="remarks"
                                          aria-invalid={
                                             remarksFeedback.shouldShow
                                          }
                                          aria-describedby={
                                             remarksFeedback.shouldShow
                                                ? "remarks-error"
                                                : undefined
                                          }
                                          {...field}
                                          value={field.value || ""}
                                          placeholder="Enter notes here"
                                          rows={5}
                                          maxLength={200}
                                          className={`w-full px-3 py-2.5 bg-background border rounded-xl text-sm text-text-strong placeholder:text-text-soft focus:outline-none focus:ring-2 resize-none ${
                                             remarksFeedback.shouldShow
                                                ? "border-danger/60 bg-danger/5 focus:ring-danger/30 focus:border-danger/60"
                                                : "border-border focus:ring-primary focus:border-transparent"
                                          }`}
                                       />
                                       <div className="absolute bottom-2 right-2 flex items-center gap-1.5">
                                          <span className="text-[11px] font-medium text-text-soft uppercase tracking-wider">
                                             {field.value?.length || 0}/200
                                          </span>
                                          {/* Resize handle icon if needed, but textarea usually has one or is disabled */}
                                       </div>
                                    </div>
                                 )}
                              />
                           </div>
                           {remarksFeedback.shouldShow && (
                              <p
                                 id="remarks-error"
                                 className="text-xs text-danger">
                                 {remarksFeedback.message}
                              </p>
                           )}
                        </div>
                     </div>
                  </div>
               </div>

               {/* Right Panel: Preview */}
               <div className="flex-1 bg-bg-weak flex flex-col p-6 m-4 rounded-2xl overflow-y-auto">
                  <div className="w-full max-w-[691px] mx-auto flex flex-col gap-5">
                     <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-medium text-text-strong">
                           Preview
                        </h2>
                        <button
                           type="button"
                           onClick={handlePrint}
                           className="flex items-center gap-1.5 px-3 py-1.5 bg-background border border-border rounded-xl shadow-sm text-text-sub hover:text-text-strong transition-colors">
                           <Print className="w-4 h-4 fill-current" />
                           <span className="text-sm font-medium">Print</span>
                        </button>
                     </div>

                     {/* Voucher Paper */}
                     <div className="flex justify-center pb-4 rounded-2xl">
                        <VoucherPaper
                           ref={voucherPreviewRef}
                           voucherType={voucherType}
                           voucherData={{
                              date: formValues.date,
                              amount: Number(formValues.amount),
                              currency: formValues.currency || "AED",
                              from:
                                 voucherType === "payment"
                                    ? formValues.fromType || "-"
                                    : formValues.fromType === "Customer"
                                    ? customerOptions.find(
                                         (c) =>
                                            c.id === formValues.fromCustomerId
                                      )?.label || "-"
                                    : formValues.fromType === "Agent"
                                    ? agentOptions.find(
                                         (a) => a.id === formValues.fromAgentId
                                      )?.label || "-"
                                    : formValues.fromType === "Other"
                                    ? formValues.fromEntityName || "-"
                                    : formValues.fromType || "-",
                              to:
                                 voucherType === "payment"
                                    ? formValues.toEntityName ||
                                      (formValues.toType === "Customer" &&
                                      formValues.toCustomerId
                                         ? customerOptions.find(
                                              (c) =>
                                                 c.id ===
                                                 formValues.toCustomerId
                                           )?.label
                                         : formValues.toType === "Agent" &&
                                           formValues.toAgentId
                                         ? agentOptions.find(
                                              (a) =>
                                                 a.id === formValues.toAgentId
                                           )?.label
                                         : formValues.toType) ||
                                      "-"
                                    : bankOptions.find(
                                         (b) => b.id === formValues.toAccountId
                                      )?.label || "-",
                              method: formValues.paymentMethod || "-",
                              classificationLabel:
                                 voucherType === "payment"
                                    ? "Expense Type"
                                    : "Income Type",
                              classificationValue:
                                 voucherType === "payment"
                                    ? expenseOptions.find(
                                         (e) =>
                                            e.id === formValues.expenseTypeId
                                      )?.label
                                    : incomeOptions.find(
                                         (i) => i.id === formValues.incomeTypeId
                                      )?.label,
                              accountName:
                                 voucherType === "receipt"
                                    ? bankOptions.find(
                                         (b) => b.id === formValues.toAccountId
                                      )?.label
                                    : undefined,
                              remarks: formValues.remarks || undefined,
                              referenceNumber:
                                 formValues.referenceNumber || undefined,
                           }}
                        />
                     </div>
                  </div>
               </div>
            </div>
            <ConfirmModal
               isOpen={showDiscardConfirm}
               onClose={() => setShowDiscardConfirm(false)}
               onConfirm={onClose}
               title={t("unsavedChanges.title")}
               description={t("unsavedChanges.description")}
               confirmText={t("unsavedChanges.confirm")}
               cancelText={t("unsavedChanges.cancel")}
               variant="primary"
               icon="exclamation"
            />
         </form>
      </Modal>
   );
}

export default AddPaymentVoucherModal;
