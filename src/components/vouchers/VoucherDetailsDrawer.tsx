/** @format */

import { ReactNode, useRef } from "react";

import Drawer from "@/designSystem/Drawer";
import LoadingState from "@/designSystem/LoadingState";
import {
	AngleLeftSmall,
	AngleRightSmall,
	Print,
	CloseLine,
	SelectBoxCircleFill,
	Check,
} from "@/Icons";
import type { Voucher } from "./data";
import DirhamLabel from "@/designSystem/DirhamLabel";
import { useTranslation } from "@/hooks/useTranslation";
import { useLanguage } from "@/hooks/useLanguage";
import VoucherPaper from "@/components/common/paper/VoucherPaper";
import { applyPrintWindowMeta } from "@/utils/printWindow";
import { isEnglishText, cn } from "@/utilities/index";

interface VoucherDetailsDrawerProps {
	isOpen: boolean;
	onClose: () => void;
	voucher: Voucher | null;
	voucherIndex?: number;
	totalVouchers?: number;
	onNavigateNext?: () => void;
	onNavigatePrev?: () => void;
	isLoading?: boolean;
	onApprove?: (voucher: Voucher) => void;
}

export default function VoucherDetailsDrawer({
	isOpen,
	onClose,
	voucher,
	voucherIndex = 1,
	totalVouchers = 1,
	onNavigateNext,
	onNavigatePrev,
	isLoading = false,
	onApprove,
	}: VoucherDetailsDrawerProps) {
	const { t } = useTranslation("vouchers");
	const { isRTL } = useLanguage();
	const voucherPreviewRef = useRef<HTMLDivElement>(null);

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
               <title>Voucher - ${voucher?.paymentCode || "Preview"}</title>
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
			`Voucher ${voucher?.paymentCode || "Preview"}`
		);
		printWindow.focus();
		setTimeout(() => {
			printWindow.print();
			printWindow.close();
		}, 250);
	};

   const shouldShowLoader = isLoading || !voucher;

   // Normalize status label for display
   const getStatusLabel = (label?: string, status?: string) => {
      if (label) {
         if (label === "Pending_Approval") return "Pending Approval";
         if (label === "Active" || label === "Approved") return "Approved";
         return label;
      }
      if (status === "active") return "Approved";
      return "Pending Approval";
   };

   const statusLabel = getStatusLabel(voucher?.statusLabel, voucher?.status);
   const statusDotClass =
      statusLabel === "Approved"
         ? "fill-success"
         : statusLabel === "Pending Approval"
         ? "fill-warning"
         : "fill-text-sub";
   const voucherPaperData = voucher
      ? {
           date: voucher.voucherDate || voucher.dateCreated,
           amount: voucher.amount,
           currency: voucher.currency || "AED",
           from: voucher.from,
           to: voucher.to,
           method: voucher.paymentMethod || "-",
           classificationLabel:
              voucher.type === "payment" ? "Expense Type" : "Income Type",
           classificationValue:
              voucher.type === "payment"
                 ? voucher.expenseType || "-"
                 : voucher.incomeType || "-",
           accountName: voucher.type === "receipt" ? voucher.to : undefined,
           remarks: voucher.remarks || undefined,
           referenceNumber: voucher.referenceNumber || undefined,
           code: voucher.paymentCode,
        }
      : null;

	const formatCurrency = (amount: number | undefined) => {
		if (amount === undefined || amount === null)
			return <DirhamLabel value={0} />;
		return <DirhamLabel value={amount.toFixed(2)} />;
	};

	if (!isOpen) return null;

	return (
		<>
			<Drawer isOpen={isOpen} onClose={onClose} width='max-w-[600px]'>
				<div className='flex flex-col h-full bg-background rounded-[24px] overflow-hidden'>
					{/* Header with Navigation - Matches Figma 'Modal Header [1.1]' */}
					<div className='flex items-center gap-3 px-5 py-4 border-b border-border bg-background shrink-0'>
						<div className='flex-1 flex items-center gap-4'>
							<div className='flex items-center gap-2'>
								<div className='flex items-center border border-border rounded-lg shadow-sm'>
									<button
										type='button'
										onClick={onNavigatePrev}
										disabled={!onNavigatePrev}
										className='p-2 flex items-center justify-center disabled:opacity-50 hover:bg-bg-weak transition-colors rounded-s-lg'>
										{isRTL ? (
											<AngleRightSmall className='w-5 h-5' isRTL={isRTL} />
										) : (
											<AngleLeftSmall className='w-5 h-5' isRTL={isRTL} />
										)}
									</button>
									<div className='w-px h-5 bg-border' />
									<button
										type='button'
										onClick={onNavigateNext}
										disabled={!onNavigateNext}
										className='p-2 flex items-center justify-center disabled:opacity-50 hover:bg-bg-weak transition-colors rounded-e-lg'>
										{isRTL ? (
											<AngleLeftSmall className='w-5 h-5' isRTL={isRTL} />
										) : (
											<AngleRightSmall className='w-5 h-5' isRTL={isRTL} />
										)}
									</button>
								</div>
								<p className={cn('text-sm text-text-soft font-medium tracking-tight', isEnglishText(`${voucherIndex} ${t("common:pagination.of")} ${totalVouchers}`) && 'font-english')}>
									{voucherIndex} {t("common:pagination.of")} {totalVouchers}
								</p>
							</div>
						</div>
						<div className='flex items-center gap-2'>
							<button
								type='button'
								onClick={handlePrint}
								className='flex items-center gap-1.5 px-1.5 py-1.5 rounded-[10px] border border-border bg-background shadow-sm hover:bg-bg-weak transition-colors'>
								<Print className='w-5 h-5 fill-text-sub' />
								<span className='text-sm font-medium text-text-sub leading-5 pr-1'>
									{t("details.print")}
								</span>
							</button>
							<button
								type='button'
								onClick={onClose}
								className='p-0.5 rounded-md hover:bg-bg-weak transition-colors'>
								<CloseLine className='w-5 h-5 fill-text-sub' />
							</button>
						</div>
					</div>

					{shouldShowLoader ? (
						<div className='flex-1 px-4 py-6'>
							<LoadingState
								size='medium'
								label={t("loading")}
								minHeight='200px'
								fullHeight
							/>
						</div>
					) : (
						<>
							{/* Voucher Header Info - Matches Figma 'Content' */}
							<div className='px-4 py-4 border-b border-border bg-background shrink-0'>
								<div className='flex flex-col gap-2'>
									<div className='flex items-center gap-2'>
										<p className='text-base font-medium text-text-strong tracking-[-0.176px] leading-6 truncate'>
											{voucher.paymentCode}
										</p>
										{/* Status Badge */}
										<div className='flex items-center gap-1 pl-1 pr-2 py-1 rounded-lg border border-border bg-background'>
											<SelectBoxCircleFill
												className={`w-4 h-4 ${statusDotClass}`}
											/>
											<p className='text-xs font-medium text-text-sub leading-4'>
												{statusLabel}
											</p>
										</div>
									</div>
									<p className='text-sm text-text-soft font-normal tracking-[-0.084px] leading-5'>
										{/* Use provided date string or format it if it's a date object */}
										{voucher.dateCreated}
									</p>
								</div>
							</div>

							{/* Scrollable Content */}
							<div className='flex-1 overflow-y-auto px-4 py-6'>
								<div className='flex flex-col gap-6'>
									{/* Role Information Section - Matches Figma 'Role information' */}
									<div className='bg-bg-weak border border-border rounded-2xl p-4 flex flex-col gap-4'>
										<InfoField
											label={t("details.paymentCode")}
											value={voucher.paymentCode}
										/>
										<InfoField label={t("details.from")} value={voucher.from} />
										<InfoField label={t("details.to")} value={voucher.to} />
										{voucher.type === "payment" && voucher.expenseType && (
											<InfoField
												label={t("details.expenseType")}
												value={voucher.expenseType}
											/>
										)}
										{voucher.type === "receipt" && voucher.incomeType && (
											<InfoField
												label={t("details.incomeType")}
												value={voucher.incomeType}
											/>
										)}
										{voucher.type === "receipt" && voucher.paymentMethod && (
											<InfoField
												label={t("details.paymentMethod")}
												value={voucher.paymentMethod}
											/>
										)}
										{voucher.type === "receipt" && voucher.referenceNumber && (
											<InfoField
												label={t("details.referenceNumber")}
												value={voucher.referenceNumber}
											/>
										)}
										{voucher.type === "receipt" && voucher.bankName && (
											<InfoField label={t("details.bankName")} value={voucher.bankName} />
										)}
										{voucher.type === "receipt" &&
											voucher.transactionDetails && (
												<InfoField
													label={t("details.transactionDetails")}
													value={voucher.transactionDetails}
												/>
											)}
										{voucher.customerName && (
											<InfoField
												label={t("details.customerName")}
												value={voucher.customerName}
											/>
										)}
										<InfoField
											label={t("details.amount")}
											value={formatCurrency(voucher.amount)}
										/>
										{voucher.type === "receipt" &&
											voucher.totalAmount !== undefined && (
												<InfoField
													label={t("details.totalAmount")}
													value={formatCurrency(voucher.totalAmount)}
												/>
											)}
										{voucher.commission !== undefined && (
											<InfoField
												label={t("details.commission")}
												value={formatCurrency(voucher.commission)}
											/>
										)}
										{voucher.tax !== undefined && (
											<InfoField
												label={t("details.tax")}
												value={formatCurrency(voucher.tax)}
											/>
										)}
										{voucher.remarks && (
											<InfoField
												label={t("details.remarks")}
												value={voucher.remarks}
												valueClassName='break-words whitespace-pre-wrap'
											/>
										)}
									</div>

									{/* Linked Invoices Section - Matches Figma 'Linked Invoices' */}
									{voucher.linkedInvoices &&
										voucher.linkedInvoices.length > 0 && (
											<div className='flex flex-col gap-4'>
												<h2 className='text-xl font-medium text-text-strong leading-7 tracking-normal'>
													{t("details.linkedInvoices")}
												</h2>
												<div className='bg-background border border-border rounded-lg overflow-hidden shadow-sm'>
													<table className='w-full border-collapse'>
														<thead>
															<tr className='bg-bg-weak border-b border-border'>
																<th className='px-2 py-2.5 text-left w-[120px] border-r border-border'>
																	<p className='text-[10px] font-medium text-text-sub leading-3'>
																		{t("details.invoiceNumber")}
																	</p>
																</th>
																<th className='px-2 py-2.5 text-left border-r border-border'>
																	<p className='text-[10px] font-medium text-text-sub leading-3'>
																		{t("details.pending")}
																	</p>
																</th>
																<th className='px-2 py-2.5 text-left'>
																	<p className='text-[10px] font-medium text-text-sub leading-3'>
																		{t("details.pay")}
																	</p>
																</th>
															</tr>
														</thead>
														<tbody>
															{voucher.linkedInvoices.map((invoice, index) => (
																<tr
																	key={index}
																	className='border-b border-border last:border-b-0'>
																	<td
																		className={cn(
																			"px-2 py-1 h-8 border-r border-border text-center",
																			isEnglishText(invoice.invoiceNumber) &&
																				"font-english"
																		)}>
																		<p className='text-[10px] font-medium text-text-strong leading-3'>
																			{invoice.invoiceNumber}
																		</p>
																	</td>
																	<td
																		className={cn(
																			"px-2 py-1 h-8 border-r border-border text-center",
																			isEnglishText(
																				formatCurrency(invoice.pending)
																			) && "font-english"
																		)}>
																		<p className='text-[10px] font-medium text-text-strong leading-3'>
																			{formatCurrency(invoice.pending)}
																		</p>
																	</td>
																	<td
																		className={cn(
																			"px-2 py-1 h-8 text-center",
																			isEnglishText(
																				formatCurrency(invoice.pay)
																			) && "font-english"
																		)}>
																		<p className='text-[10px] font-medium text-text-strong leading-3'>
																			{formatCurrency(invoice.pay)}
																		</p>
																	</td>
																</tr>
															))}
														</tbody>
													</table>
												</div>
											</div>
										)}
								</div>
							</div>

							{/* Footer with Approve Button */}
							{voucher && statusLabel !== "Approved" && onApprove && (
								<div className='px-4 py-4 border-t border-border bg-background shrink-0'>
									<button
										type='button'
										onClick={() => onApprove(voucher)}
										className='w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors'>
										<Check className='w-5 h-5 fill-current' />
										<span>{t("actions.approve")}</span>
									</button>
								</div>
							)}
						</>
					)}
				</div>
			</Drawer>

			{voucher && voucherPaperData && (
				<div style={{ display: "none" }}>
					<VoucherPaper
						ref={voucherPreviewRef}
						voucherType={voucher.type}
						voucherData={voucherPaperData}
					/>
				</div>
			)}
		</>
	);
}

// Helper component for info fields matching Figma 'Info'
function InfoField({
	label,
	value,
	valueClassName,
}: {
	label: string;
	value: ReactNode;
	valueClassName?: string;
}) {
	return (
		<div className='flex flex-col gap-2'>
			<p className='text-sm text-text-sub font-normal tracking-[-0.084px] leading-5'>
				{label}
			</p>
			<div
				className={`text-base text-text-strong font-normal tracking-[-0.176px] leading-6 ${
					valueClassName || ""
				}`}>
				{value}
			</div>
		</div>
	);
}
