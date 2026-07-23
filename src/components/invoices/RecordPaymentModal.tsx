/** @format */

import { useMemo, useState, useEffect } from "react";
import DirhamLabel from "@/designSystem/DirhamLabel";
import Modal from "@/designSystem/Modal";
import DatePicker from "@/designSystem/DatePicker";
import Select from "@/designSystem/Select";
import ConfirmModal from "@/designSystem/ConfirmModal";
import { DollarCircle } from "@/Icons";
import type { Invoice } from "./data";
import { useListBanks } from "@/hooks/banks/useBanks";
import { useListPrettyCashNames } from "@/hooks/prettyCashNames/usePrettyCashNames";
import { useTranslation } from "@/hooks/useTranslation";

interface RecordPaymentModalProps {
	isOpen: boolean;
	onClose: () => void;
	invoice: Invoice | null;
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

export default function RecordPaymentModal({
	isOpen,
	onClose,
	invoice,
	onSubmit,
	isLoading = false,
}: RecordPaymentModalProps) {
	const { t } = useTranslation("common");

	const PAYMENT_METHODS = [
		{ value: "cash", label: t("invoices.recordPayment.paymentMethodOptions.cash") },
		{ value: "bank_transfer", label: t("invoices.recordPayment.paymentMethodOptions.bankTransfer") },
		{ value: "card", label: t("invoices.recordPayment.paymentMethodOptions.card") },
		{ value: "cheque", label: t("invoices.recordPayment.paymentMethodOptions.cheque") },
	];
	const ACCOUNT_TYPES = [
		{ value: "cash", label: t("invoices.recordPayment.accountTypeOptions.cash") },
		{ value: "bank", label: t("invoices.recordPayment.accountTypeOptions.bank") },
	];
	const [amount, setAmount] = useState("");
	const [paymentDate, setPaymentDate] = useState<Date>(new Date());
	const [paymentMethod, setPaymentMethod] = useState("cash");
	const [accountType, setAccountType] = useState("");
	const [accountId, setAccountId] = useState("");
	const [referenceNumber, setReferenceNumber] = useState("");
	const [remarks, setRemarks] = useState("");
	const { data: banksData, isLoading: isBanksLoading } = useListBanks(
		{ page: 1, limit: 100 },
		{ enabled: isOpen }
	);
	const { data: prettyCashData, isLoading: isPrettyCashLoading } =
		useListPrettyCashNames({ page: 1, limit: 100 }, { enabled: isOpen });

	// Confirmation modals
	const [showCloseConfirm, setShowCloseConfirm] = useState(false);
	const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);

	const balanceDue = invoice?.balance_due ?? 0;

	// Check if form has changes
	const hasChanges = amount !== "" || referenceNumber !== "" || remarks !== "";

	// Reset form when modal opens
	useEffect(() => {
		if (isOpen) {
			setAmount("");
			setPaymentDate(new Date());
			setPaymentMethod("cash");
			setAccountType("");
			setAccountId("");
			setReferenceNumber("");
			setRemarks("");
		}
	}, [isOpen]);

	const bankOptions = useMemo(
		() =>
			banksData?.data.map((bank) => ({
				value: String(bank.account_id),
				label: bank.bank_name || bank.account_name || String(bank.account_id),
			})) || [],
		[banksData]
	);

	const prettyCashOptions = useMemo(
		() =>
			prettyCashData?.data.map((cash) => ({
				value: String(cash.account_id),
				label: cash.account_name || String(cash.account_id),
			})) || [],
		[prettyCashData]
	);

	const accountOptions =
		accountType === "bank" ? bankOptions : prettyCashOptions;

	const handlePayFull = () => {
		setAmount(balanceDue.toString());
	};

	const handleCloseAttempt = () => {
		if (hasChanges) {
			setShowCloseConfirm(true);
		} else {
			onClose();
		}
	};

	const handleConfirmClose = () => {
		setShowCloseConfirm(false);
		onClose();
	};

	const handleSubmitAttempt = () => {
		const amountNum = parseFloat(amount);
		if (isNaN(amountNum) || amountNum <= 0) return;
		if (amountNum > balanceDue) return;
		if (!accountType || !accountId) return;
		setShowSubmitConfirm(true);
	};

	const handleConfirmSubmit = () => {
		setShowSubmitConfirm(false);
		const amountNum = parseFloat(amount);
		const accountIdValue = accountId.trim();
		const resolvedAccountId = accountIdValue
			? Number(accountIdValue)
			: undefined;
		onSubmit({
			amount: amountNum,
			payment_date: paymentDate.toISOString().split("T")[0],
			payment_method: paymentMethod,
			account_id: Number.isNaN(resolvedAccountId as number)
				? undefined
				: resolvedAccountId,
			reference_number: referenceNumber || undefined,
			remarks: remarks || undefined,
		});
	};

	const isValidAmount =
		amount !== "" && parseFloat(amount) > 0 && parseFloat(amount) <= balanceDue;
	const isValidAccount = Boolean(accountType) && Boolean(accountId);
	const isFormValid = isValidAmount && isValidAccount;

	if (!isOpen) return null;

	return (
		<>
			<Modal
				isOpen={isOpen}
				onClose={handleCloseAttempt}
				title={t("invoices.recordPayment.title")}
				size="medium">
				<div className="flex flex-col gap-6">
					{/* Balance Due Header */}
					<div className="p-4 bg-warning/10 border border-warning/20 rounded-xl flex items-center gap-4">
						<div className="w-12 h-12 rounded-full bg-warning/20 flex items-center justify-center">
							<DollarCircle className="w-6 h-6 fill-warning" />
						</div>
						<div>
							<p className="text-sm text-text-sub">{t("invoices.recordPayment.title")}</p>
							<p className="text-2xl font-semibold text-text-strong">
								<DirhamLabel value={balanceDue} />
							</p>
						</div>
						<button
							type="button"
							onClick={handlePayFull}
							className="ms-auto px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
						>
							{t("actions.applyNow")}
						</button>
					</div>

					{/* Form Fields */}
					<div className="flex flex-col gap-4">
						{/* Amount */}
						<div className="flex flex-col gap-1.5">
							<label className="text-sm font-medium text-text-strong">
								Amount *
							</label>
							<div className="relative">
								<span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-sub">
									<img src="/icons/dirham.png" alt="AED" className="w-4 h-4" />
								</span>
								<input
									type="number"
									value={amount}
									onChange={(e) => setAmount(e.target.value)}
									placeholder="0.00"
									min="0"
									max={balanceDue}
									step="0.01"
									className="w-full ps-14 pe-4 py-2.5 border border-border rounded-lg bg-background text-text-strong placeholder:text-text-sub focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
								/>
							</div>
							{parseFloat(amount) > balanceDue && (
								<p className="text-xs text-danger">
									Amount cannot exceed balance due
								</p>
							)}
						</div>

						{/* Payment Date */}
						<div className="flex flex-col gap-1.5">
							<label className="text-sm font-medium text-text-strong">
								Payment Date *
							</label>
							<DatePicker
								value={paymentDate}
								onChange={(date) => setPaymentDate(date)}
								placeholder="Select payment date"
							/>
						</div>

						{/* Payment Method */}
						<div className="flex flex-col gap-1.5">
							<label className="text-sm font-medium text-text-strong">
								Payment Method
							</label>
							<Select
								options={PAYMENT_METHODS}
								value={paymentMethod}
								onChange={setPaymentMethod}
								placeholder="Select payment method"
							/>
						</div>

						{/* Account Type */}
						<div className="flex flex-col gap-1.5">
							<label className="text-sm font-medium text-text-strong">
								Account Type
							</label>
							<Select
								options={ACCOUNT_TYPES}
								value={accountType}
								onChange={(value) => {
									setAccountType(value);
									setAccountId("");
								}}
								placeholder="Select account type"
							/>
						</div>

						{/* Account */}
						{accountType && (
							<div className="flex flex-col gap-1.5">
								<label className="text-sm font-medium text-text-strong">
									{accountType === "bank" ? "Bank Account" : "Cash Account"}
								</label>
								<Select
									options={accountOptions}
									value={accountId}
									onChange={setAccountId}
									placeholder={
										accountType === "bank"
											? "Select bank account"
											: "Select cash account"
									}
									disabled={
										(accountType === "bank" && isBanksLoading) ||
										(accountType === "cash" && isPrettyCashLoading)
									}
								/>
								{accountType && !accountId && (
									<p className="text-xs text-danger">
										Select an account to continue
									</p>
								)}
							</div>
						)}

						{/* Reference Number */}
						<div className="flex flex-col gap-1.5">
							<label className="text-sm font-medium text-text-strong">
								Reference Number
							</label>
							<input
								type="text"
								value={referenceNumber}
								onChange={(e) => setReferenceNumber(e.target.value)}
								placeholder="Transaction reference"
								className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-text-strong placeholder:text-text-sub focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
							/>
						</div>

						{/* Remarks */}
						<div className="flex flex-col gap-1.5">
							<label className="text-sm font-medium text-text-strong">
								Remarks
							</label>
							<textarea
								value={remarks}
								onChange={(e) => setRemarks(e.target.value)}
								placeholder="Additional notes"
								rows={3}
								className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-text-strong placeholder:text-text-sub focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
							/>
						</div>
					</div>

					{/* Actions */}
					<div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
						<button
							type="button"
							onClick={handleCloseAttempt}
							disabled={isLoading}
							className="px-4 py-2.5 text-sm font-medium text-text-sub hover:text-text-strong transition-colors"
						>
							Cancel
						</button>
						<button
							type="button"
							onClick={handleSubmitAttempt}
							disabled={!isFormValid || isLoading}
							className="px-6 py-2.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
						>
							{isLoading && (
								<div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
							)}
							Record Payment
						</button>
					</div>
				</div>
			</Modal>

			{/* Close Confirmation Modal */}
			<ConfirmModal
				isOpen={showCloseConfirm}
				onClose={() => setShowCloseConfirm(false)}
				onConfirm={handleConfirmClose}
				title="Discard Changes?"
				description="You have unsaved changes. Are you sure you want to close this form? All changes will be lost."
				confirmText="Discard"
				cancelText="Keep Editing"
				variant="error"
				icon="exclamation"
			/>

			{/* Submit Confirmation Modal */}
			<ConfirmModal
				isOpen={showSubmitConfirm}
				onClose={() => setShowSubmitConfirm(false)}
				onConfirm={handleConfirmSubmit}
				title="Confirm Payment"
				description={`Are you sure you want to record a payment of ${parseFloat(amount || "0").toFixed(2)} AED?`}
				confirmText="Record Payment"
				cancelText="Cancel"
				variant="primary"
				icon="info"
				isLoading={isLoading}
			/>
		</>
	);
}
