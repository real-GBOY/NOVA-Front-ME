/** @format */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import * as yup from "yup";
import Modal from "@/designSystem/Modal";
import ConfirmModal from "@/designSystem/ConfirmModal";
import DirhamLabel from "@/designSystem/DirhamLabel";
import GenericForm, { FieldConfig } from "@/designSystem/GenericForm";
import Button from "@/designSystem/Button";
import { DollarCircle } from "@/Icons";
import type { Invoice } from "./data";
import { useTranslation } from "@/hooks/useTranslation";
import { useListBanks } from "@/hooks/banks/useBanks";
import { useListPrettyCashNames } from "@/hooks/prettyCashNames/usePrettyCashNames";

interface BulkPaymentModalProps {
	isOpen: boolean;
	onClose: () => void;
	invoices: Invoice[];
	onSubmit: (data: {
		amount: number;
		payment_date: string;
		payment_method?: string;
		account_id?: number;
		reference_number?: string;
		remarks?: string;
	}) => void;
	isLoading?: boolean;
}

type BulkPaymentFormValues = {
	amount: string;
	payment_date: string;
	payment_method: string;
	account_type: string;
	account_id: string;
	reference_number: string;
	remarks: string;
};

const FORM_ID = "bulk-payment-form";
const PAYMENT_METHOD_KEYS = ["cash", "bank_transfer", "card", "cheque"] as const;

const formatCurrencyValue = (value: number) =>
	Number.isFinite(value) ? value.toFixed(2) : "0.00";

const getTodayDate = () => new Date().toISOString().split("T")[0];
const parseAmount = (value: string) => {
	const normalized = value.replace(/,/g, "").trim();
	const amount = Number(normalized);
	return Number.isFinite(amount) ? amount : NaN;
};

export default function BulkPaymentModal({
	isOpen,
	onClose,
	invoices,
	onSubmit,
	isLoading = false,
}: BulkPaymentModalProps) {
	const { t } = useTranslation("settings");
	const { t: tCommon } = useTranslation("common");
	const formRef = useRef<UseFormReturn<BulkPaymentFormValues> | null>(null);
	const [isDirty, setIsDirty] = useState(false);
	const [showCloseConfirm, setShowCloseConfirm] = useState(false);
	const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
	const [pendingSubmission, setPendingSubmission] =
		useState<BulkPaymentFormValues | null>(null);
	const { data: banksData, isLoading: isBanksLoading } = useListBanks(
		{ page: 1, limit: 100 },
		{ enabled: isOpen }
	);
	const { data: prettyCashData, isLoading: isPrettyCashLoading } =
		useListPrettyCashNames({ page: 1, limit: 100 }, { enabled: isOpen });

	const defaultValues = useMemo<BulkPaymentFormValues>(
		() => ({
			amount: "",
			payment_date: getTodayDate(),
			payment_method: "cash",
			account_type: "",
			account_id: "",
			reference_number: "",
			remarks: "",
		}),
		[isOpen]
	);

	const [formValues, setFormValues] =
		useState<BulkPaymentFormValues>(defaultValues);

	useEffect(() => {
		if (!isOpen) return;
		setIsDirty(false);
		setShowCloseConfirm(false);
		setShowSubmitConfirm(false);
		setPendingSubmission(null);
		setFormValues(defaultValues);
	}, [isOpen, defaultValues]);

	const totalBalanceDue = useMemo(
		() =>
			invoices.reduce((sum, invoice) => {
				const due = Number(invoice.balance_due ?? invoice.remaining_amount ?? 0);
				return sum + (Number.isNaN(due) ? 0 : due);
			}, 0),
		[invoices]
	);

	const customerName = useMemo(() => {
		const first = invoices[0];
		return (
			first?.customer?.customer_name ||
			first?.customer_name ||
			t("invoices.bulkPaymentModal.customerFallback", "Selected Customer")
		);
	}, [invoices, t]);

	const previewInvoices = invoices.slice(0, 4);
	const remainingCount = Math.max(invoices.length - previewInvoices.length, 0);

	const amountValue = Number(formValues.amount);
	const isOverpay =
		Number.isFinite(amountValue) && amountValue > totalBalanceDue;

	const schema = useMemo(
		() =>
			yup.object<BulkPaymentFormValues>().shape({
				amount: yup
					.string()
					.required(t("validation.required"))
					.test("is-number", t("validation.required"), (value) =>
						Number.isFinite(parseAmount(value ?? ""))
					)
					.test("min-amount", t("validation.minValue", { min: 0.01 }), (value) =>
						parseAmount(value ?? "") >= 0.01
					),
				payment_date: yup.string().required(t("validation.required")),
				payment_method: yup.string().required(t("validation.required")),
				account_type: yup.string().nullable(),
				account_id: yup
					.string()
					.nullable()
					.when("account_type", {
						is: (value: string) => Boolean(value),
						then: (schema) => schema.required(t("validation.required")),
					}),
				reference_number: yup.string().nullable(),
				remarks: yup.string().nullable(),
			}),
		[t]
	);

	const paymentMethodOptions = useMemo(
		() =>
			PAYMENT_METHOD_KEYS.map((method) => ({
				id: method,
				label: t(`invoices.paymentMethods.${method}`),
			})),
		[t]
	);

	const bankOptions = useMemo(
		() =>
			banksData?.data.map((bank) => ({
				id: String(bank.account_id),
				label: bank.bank_name || bank.account_name || String(bank.account_id),
			})) || [],
		[banksData]
	);

	const prettyCashOptions = useMemo(
		() =>
			prettyCashData?.data.map((cash) => ({
				id: String(cash.account_id),
				label: cash.account_name || String(cash.account_id),
			})) || [],
		[prettyCashData]
	);

	const accountTypeOptions = useMemo(
		() => [
			{ id: "cash", label: t("invoices.accountTypes.cash", "Cash") },
			{ id: "bank", label: t("invoices.accountTypes.bank", "Bank") },
		],
		[t]
	);

	const accountType = formValues.account_type;
	const accountOptions =
		accountType === "bank" ? bankOptions : prettyCashOptions;
	const accountLabel =
		accountType === "bank"
			? t("invoices.bulkPaymentModal.accountLabelBank", "Bank Account")
			: t("invoices.bulkPaymentModal.accountLabelCash", "Cash Account");
	const accountPlaceholder =
		accountType === "bank"
			? t(
					"invoices.bulkPaymentModal.accountPlaceholderBank",
					"Select bank account"
			  )
			: t(
					"invoices.bulkPaymentModal.accountPlaceholderCash",
					"Select cash account"
			  );

	const fields = useMemo<FieldConfig[]>(
		() => {
			const baseFields: FieldConfig[] = [
				{
					name: "amount",
					type: "currency",
					label: t("invoices.bulkPaymentModal.amountLabel"),
					placeholder: t("invoices.bulkPaymentModal.amountPlaceholder"),
					required: true,
					helperText: isOverpay
						? t("invoices.bulkPaymentModal.overpayHint")
						: undefined,
				},
				{
					name: "payment_date",
					type: "date",
					label: t("invoices.bulkPaymentModal.paymentDateLabel"),
					placeholder: t("invoices.bulkPaymentModal.paymentDatePlaceholder"),
					required: true,
				},
				{
					name: "payment_method",
					type: "select",
					label: t("invoices.bulkPaymentModal.paymentMethodLabel"),
					placeholder: t("invoices.bulkPaymentModal.paymentMethodPlaceholder"),
					required: true,
					options: paymentMethodOptions,
				},
				{
					name: "account_type",
					type: "select",
					label: t("invoices.bulkPaymentModal.accountTypeLabel"),
					placeholder: t("invoices.bulkPaymentModal.accountTypePlaceholder"),
					options: accountTypeOptions,
				},
				{
					name: "reference_number",
					type: "text",
					label: t("invoices.bulkPaymentModal.referenceNumberLabel"),
					placeholder: t("invoices.bulkPaymentModal.referenceNumberPlaceholder"),
				},
				{
					name: "remarks",
					type: "textarea",
					label: t("invoices.bulkPaymentModal.remarksLabel"),
					placeholder: t("invoices.bulkPaymentModal.remarksPlaceholder"),
					rows: 3,
				},
			];

			if (accountType) {
				baseFields.splice(4, 0, {
					name: "account_id",
					type: "select",
					label: accountLabel,
					placeholder: accountPlaceholder,
					options: accountOptions,
					required: true,
					disabled:
						(accountType === "bank" && isBanksLoading) ||
						(accountType === "cash" && isPrettyCashLoading),
				});
			}

			return baseFields;
		},
		[
			accountLabel,
			accountOptions,
			accountPlaceholder,
			accountType,
			accountTypeOptions,
			isBanksLoading,
			isOverpay,
			isPrettyCashLoading,
			paymentMethodOptions,
			t,
		]
	);

	const handleFieldChange = useCallback(
		(field: string, _value: unknown, allData: BulkPaymentFormValues) => {
			if (field === "account_type") {
				const nextValues = { ...allData, account_id: "" };
				setFormValues(nextValues);
				formRef.current?.setValue("account_id", "", {
					shouldDirty: true,
					shouldTouch: true,
					shouldValidate: true,
				});
				return;
			}
			setFormValues(allData);
		},
		[]
	);

	const handleCloseAttempt = () => {
		if (isDirty) {
			setShowCloseConfirm(true);
			return;
		}
		onClose();
	};

	const handleConfirmClose = () => {
		setShowCloseConfirm(false);
		onClose();
	};

	const handlePayFull = () => {
		const value = formatCurrencyValue(totalBalanceDue);
		setFormValues((prev) => ({ ...prev, amount: value }));
		formRef.current?.setValue("amount", value, {
			shouldDirty: true,
			shouldTouch: true,
			shouldValidate: true,
		});
	};

	const handleValidatedSubmit = (data: BulkPaymentFormValues) => {
		setPendingSubmission(data);
		setShowSubmitConfirm(true);
	};

	const handleConfirmSubmit = () => {
		if (!pendingSubmission) return;
		setShowSubmitConfirm(false);
		const amount = Number(pendingSubmission.amount);
		if (!Number.isFinite(amount)) return;
		const accountIdValue = pendingSubmission.account_id?.trim();
		const accountId = accountIdValue ? Number(accountIdValue) : undefined;
		onSubmit({
			amount,
			payment_date: pendingSubmission.payment_date,
			payment_method: pendingSubmission.payment_method || undefined,
			account_id: Number.isNaN(accountId as number) ? undefined : accountId,
			reference_number: pendingSubmission.reference_number || undefined,
			remarks: pendingSubmission.remarks || undefined,
		});
	};

	const confirmAmount = formatCurrencyValue(
		Number(pendingSubmission?.amount ?? formValues.amount ?? 0)
	);

	const footer = (
		<div className="flex items-center justify-end gap-3 w-full">
			<Button
				variant="secondary"
				onClick={handleCloseAttempt}
				disabled={isLoading}
				className="px-3 py-2 text-sm cursor-pointer">
				{tCommon("actions.cancel")}
			</Button>
			<Button
				type="submit"
				form={FORM_ID}
				disabled={isLoading || invoices.length === 0}
				className="cursor-pointer">
				{isLoading && (
					<span className="animate-spin mr-2 w-4 h-4 border-2 border-white border-t-transparent rounded-full inline-block align-middle" />
				)}
				{t("invoices.bulkPaymentModal.confirmButton")}
			</Button>
		</div>
	);

	if (!isOpen) return null;

	return (
		<>
			<Modal
				isOpen={isOpen}
				onClose={handleCloseAttempt}
				title={t("invoices.bulkPaymentModal.title")}
				size="medium"
				footer={footer}>
				<div className="flex flex-col gap-6">
					<div className="p-4 bg-warning/10 border border-warning/20 rounded-xl flex items-center gap-4">
						<div className="w-12 h-12 rounded-full bg-warning/20 flex items-center justify-center">
							<DollarCircle className="w-6 h-6 fill-warning" />
						</div>
						<div>
							<p className="text-sm text-text-sub">
								{t("invoices.bulkPaymentModal.customerLabel")}
							</p>
							<p className="text-lg font-semibold text-text-strong">
								{customerName}
							</p>
						</div>
					</div>

					<div className="flex flex-col gap-3">
						<div className="flex items-center justify-between gap-3">
							<div>
								<p className="text-sm text-text-sub">
									{t("invoices.bulkPaymentModal.totalBalanceLabel")} (
									{invoices.length}{" "}
									{t("invoices.bulkPaymentModal.invoiceCountLabel", "invoices")})
								</p>
								<div className="text-lg font-semibold text-text-strong">
									<DirhamLabel value={totalBalanceDue} />
								</div>
							</div>
							<button
								type="button"
								onClick={handlePayFull}
								className="ms-auto px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors">
								{t("invoices.bulkPaymentModal.payFullAmount")}
							</button>
						</div>
						<div className="flex flex-wrap gap-2">
							{previewInvoices.map((invoice) => (
								<span
									key={invoice.invoice_id || invoice.id}
									className="text-xs text-text-sub bg-bg-weak px-2.5 py-1 rounded-full">
									{invoice.invoice_code || invoice.invoice_number}
								</span>
							))}
							{remainingCount > 0 && (
								<span className="text-xs text-text-sub bg-bg-weak px-2.5 py-1 rounded-full">
									+{remainingCount}{" "}
									{t("invoices.bulkPaymentModal.moreLabel", "more")}
								</span>
							)}
						</div>
					</div>

					<GenericForm<BulkPaymentFormValues>
						id={FORM_ID}
						schema={schema}
						defaultValues={defaultValues}
						formData={isOpen ? defaultValues : undefined}
						onSubmit={handleValidatedSubmit}
						onFieldChange={handleFieldChange}
						fields={fields}
						showSubmitButton={false}
						validationBehavior="touched"
						onDirtyChange={setIsDirty}
						formRef={formRef}
					/>
				</div>
			</Modal>

			<ConfirmModal
				isOpen={showCloseConfirm}
				onClose={() => setShowCloseConfirm(false)}
				onConfirm={handleConfirmClose}
				title={tCommon("unsavedChanges.title")}
				description={tCommon("unsavedChanges.description")}
				confirmText={tCommon("unsavedChanges.confirm")}
				cancelText={tCommon("unsavedChanges.cancel")}
				variant="error"
				icon="exclamation"
			/>

			<ConfirmModal
				isOpen={showSubmitConfirm}
				onClose={() => setShowSubmitConfirm(false)}
				onConfirm={handleConfirmSubmit}
				title={t("invoices.bulkPaymentModal.confirmTitle")}
				description={t("invoices.bulkPaymentModal.confirmDescription", {
					amount: confirmAmount,
					count: invoices.length,
				})}
				confirmText={t("invoices.bulkPaymentModal.confirmButton")}
				cancelText={tCommon("actions.cancel")}
				variant="primary"
				icon="info"
				isLoading={isLoading}
			/>
		</>
	);
}
