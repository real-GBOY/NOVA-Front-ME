/** @format */

import type { CommandPaletteItem, QuickActionCategory } from "@/components/commandPalette/types";
import { getCategoryLabel } from "@/components/commandPalette/constants";
import { contractService, ContractResponse } from "@/services/contractService";
import { employeeService } from "@/services/employeeService";
import { invoiceService, Invoice } from "@/services/invoiceService";
import { paymentVoucherService, PaymentVoucherListItem } from "@/services/paymentVoucherService";
import { receiptVoucherService, ReceiptVoucherListItem } from "@/services/receiptVoucherService";
import legalCasesService, { LegalCase } from "@/services/legalCasesService";
import { Users, InvoiceDollar, ClipboardText, FolderOpen } from "@/Icons";

interface SearchableEntity {
	type: CommandPaletteItem["type"];
	category: QuickActionCategory;
	searchFn: (query: string) => Promise<CommandPaletteItem[]>;
	priority: number;
}

const formatAmount = (amount?: number, currency?: string) => {
	if (amount == null) return undefined;
	const normalized = Number(amount);
	const formatted =
		Number.isFinite(normalized)
			? new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(normalized)
			: String(amount);
	return currency ? `${formatted} ${currency}` : formatted;
};

const createBadge = (category: QuickActionCategory) => getCategoryLabel(category);

const mapInvoiceResult = (invoice: Invoice): CommandPaletteItem => {
	const label = invoice.invoice_code || invoice.invoice_number || `Invoice ${invoice.invoice_id ?? invoice.id ?? ""}`;
	const description = invoice.customer?.customer_name || invoice.customer_name;
	return {
		id: `invoice-${invoice.invoice_id ?? invoice.id}`,
		type: "invoice",
		label,
		description,
		icon: InvoiceDollar,
		category: "invoices",
		path: "/dashboard/loans-advances",
		metadata: {
			entityId: invoice.invoice_id ?? invoice.id,
			subtitle: formatAmount(invoice.total_amount ?? invoice.total, invoice.currency),
			badge: createBadge("invoices"),
		},
		rank: invoice.total_amount ?? invoice.total ?? 0,
	};
};

const mapPaymentVoucherResult = (voucher: PaymentVoucherListItem): CommandPaletteItem => ({
	id: `payment-voucher-${voucher.voucher_id}`,
	type: "voucher",
	label: voucher.voucher_code,
	description: voucher.status,
	icon: InvoiceDollar,
	category: "vouchers",
	path: "/dashboard/vouchers",
	metadata: {
		entityId: voucher.voucher_id,
		subtitle: formatAmount(voucher.total_amount, voucher.currency),
		badge: createBadge("vouchers"),
	},
	rank: voucher.total_amount,
});

const mapReceiptVoucherResult = (voucher: ReceiptVoucherListItem): CommandPaletteItem => ({
	id: `receipt-voucher-${voucher.receipt_id}`,
	type: "voucher",
	label: voucher.receipt_code,
	description: voucher.status,
	icon: InvoiceDollar,
	category: "vouchers",
	path: "/dashboard/vouchers",
	metadata: {
		entityId: voucher.receipt_id,
		subtitle: formatAmount(voucher.total_amount, voucher.currency),
		badge: createBadge("vouchers"),
	},
	rank: voucher.total_amount,
});

const mapLegalCaseResult = (legalCase: LegalCase): CommandPaletteItem => {
	const label = legalCase.title || legalCase.case_number;
	return {
      id: `case-${legalCase.id}`,
      type: "case",
      label,
      description: legalCase.client || legalCase.case_number,
      icon: FolderOpen,
      category: "legalCases",
      path: "/dashboard/legal-cases",
      metadata: {
         entityId: legalCase.id,
         subtitle: legalCase.case_number,
         badge: createBadge("legalCases"),
      },
      rank: 6,
	};
};

const mapContractResult = (contract: ContractResponse): CommandPaletteItem => {
	const employeeId = contract.core?.employee?.id ?? contract.core?.employee_id;
	const employeeLabel =
		contract.core?.employee?.name ?? `Employee ${employeeId ?? "N/A"}`;
	return {
		id: `contract-${contract.id}`,
		type: "contract",
		label: contract.core?.contract_name ?? employeeLabel,
		description: employeeLabel,
		icon: ClipboardText,
		category: "contracts",
		path: "/dashboard/contracts",
		metadata: {
			entityId: contract.id,
			subtitle: contract.core?.contract_type,
			badge: createBadge("contracts"),
		},
		rank: contract.id,
	};
};

export class CommandPaletteSearchService {
	private searchableEntities: SearchableEntity[] = [
		{
			type: "member",
			category: "members",
			priority: 10,
			searchFn: async (query: string) => {
				const response = await employeeService.list({
					search: query,
					limit: 5,
				});
				return response.data.map((emp) => ({
					id: `member-${emp.id}`,
					type: "member",
					label: emp.name,
					description: emp.job_title || undefined,
					icon: Users,
					category: "members",
					path: `/dashboard/members/profile/${emp.id}`,
					metadata: {
						entityId: emp.id,
						subtitle: emp.email,
						badge: createBadge("members"),
						timestamp: emp.avatar || undefined,
					},
					rank: 10,
				}));
			},
		},
		{
			type: "invoice",
			category: "invoices",
			priority: 8,
			searchFn: async (query: string) => {
				const response = await invoiceService.list({
					search: query,
					limit: 5,
				});
				return (response.data || []).map(mapInvoiceResult);
			},
		},
		{
			type: "voucher",
			category: "vouchers",
			priority: 7,
			searchFn: async (query: string) => {
				const [payments, receipts] = await Promise.all([
					paymentVoucherService.list({ search: query, limit: 3 }),
					receiptVoucherService.list({ search: query, limit: 3 }),
				]);
				return [
					...(payments.data || []).map(mapPaymentVoucherResult),
					...(receipts.data || []).map(mapReceiptVoucherResult),
				];
			},
		},
		{
			type: "case",
         category: "legalCases",
			priority: 6,
			searchFn: async (query: string) => {
				const response = await legalCasesService.list({
					search: query,
					limit: 5,
				});
				return (response.data || []).map(mapLegalCaseResult);
			},
		},
		{
			type: "contract",
			category: "contracts",
			priority: 5,
			searchFn: async (query: string) => {
				const response = await contractService.list({
					search: query,
					limit: 5,
				});
				return (response.data || []).map(mapContractResult);
			},
		},
	];

	/**
	 * Perform search across all entities or filtered by category
	 */
	async search(query: string, category?: QuickActionCategory): Promise<CommandPaletteItem[]> {
		if (!query.trim()) {
			return [];
		}

		const entitiesToSearch = category
			? this.searchableEntities.filter((e) => e.category === category)
			: this.searchableEntities;

		const results = await Promise.all(
			entitiesToSearch.map((entity) => entity.searchFn(query).catch(() => []))
		);

		return results
			.flat()
			.sort((a, b) => (b.rank || 0) - (a.rank || 0))
			.slice(0, 20); // Limit to 20 results
	}

	/**
	 * Add a new searchable entity dynamically
	 */
	registerSearchableEntity(entity: SearchableEntity): void {
		this.searchableEntities.push(entity);
	}
}

export const commandPaletteSearchService = new CommandPaletteSearchService();
