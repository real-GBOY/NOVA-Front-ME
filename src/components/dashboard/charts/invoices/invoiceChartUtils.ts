/** @format */

import type { InvoiceChartData } from "./types";
import type { InvoiceStats } from "@/services/invoiceService";

/**
 * Transform backend invoice stats to chart data
 */
export function transformInvoiceStatsToChartData(
	statsData: InvoiceStats | undefined,
	previousTotalAmount?: number
): InvoiceChartData {
	// Return mock data if no stats available
	if (!statsData) {
		return generateMockInvoiceData();
	}

	const totalInvoices = statsData.total_invoices || 0;

	// Calculate percentages
	const fullyPaidCount = statsData.by_status?.Fully_Paid || 0;
	const pendingCount =
		(statsData.by_status?.Pending || 0) +
		(statsData.by_status?.Partially_Paid || 0);
	const draftCount = statsData.by_status?.Draft || 0;

	const fullyPaidPercentage =
		totalInvoices > 0 ? Math.round((fullyPaidCount / totalInvoices) * 100) : 0;
	const pendingPercentage =
		totalInvoices > 0 ? Math.round((pendingCount / totalInvoices) * 100) : 0;
	const draftPercentage =
		totalInvoices > 0 ? Math.round((draftCount / totalInvoices) * 100) : 0;

	// Calculate growth (if previous data is available)
	const growthValue = previousTotalAmount
		? statsData.total_amount - previousTotalAmount
		: 0;

	return {
		totalValue: Math.round(statsData.total_amount || 0),
		currency: "AED", // Default currency, could be made dynamic
		growthValue: Math.round(Math.abs(growthValue)),
		fullyPaidPercentage,
		pendingPercentage,
		draftPercentage,
	};
}

/**
 * Generate mock data for development/testing
 */
export function generateMockInvoiceData(): InvoiceChartData {
	return {
		totalValue: 56000,
		currency: "AED",
		growthValue: 12000,
		fullyPaidPercentage: 67,
		pendingPercentage: 13,
		draftPercentage: 20,
	};
}
