/** @format */

import { useMemo } from "react";
import { useDashboardOverview } from "@/hooks/dashboard/dashboard.queries";
import { getDateRangeForPeriod } from "@/utilities/dateRange";
import type { DashboardDateRange } from "../header";
import { generateMockInvoiceData } from "./invoiceChartUtils";
import InvoiceChart from "./InvoiceChart";

type InvoiceChartContainerProps = {
	onCheckDrafts?: () => void;
	useMockData?: boolean;
	range?: DashboardDateRange;
};

/**
 * Container component that fetches real data from the API
 * and passes it to the InvoiceChart component
 */
function InvoiceChartContainer({
	onCheckDrafts,
	useMockData = false,
	range,
}: InvoiceChartContainerProps) {
	const hasRangeOverride = Boolean(range?.from_date && range?.to_date);
	const { from_date, to_date } = hasRangeOverride
		? { from_date: range?.from_date, to_date: range?.to_date }
		: getDateRangeForPeriod("thisWeek");

	const { data: overview, isLoading, error } = useDashboardOverview(
		{
			include: ["invoices"],
			from_date,
			to_date,
		},
		{ enabled: !useMockData }
	);

	// Transform the API response to chart data
	const chartData = useMemo(() => {
		const invoiceSummary = overview?.data?.invoices;
		if (!invoiceSummary || useMockData) {
			// Return mock data if API data is not available or mock mode is enabled
			return generateMockInvoiceData();
		}

		const totalInvoices = invoiceSummary.total_invoices || 0;
		const statusShare = invoiceSummary.status_share || {};
		const byStatus = invoiceSummary.by_status || {};
		const hasStatusShare = Object.keys(statusShare).length > 0;

		const fullyPaidCount = byStatus.Fully_Paid || 0;
		const pendingCount =
			(byStatus.Pending || 0) + (byStatus.Partially_Paid || 0);
		const draftCount = byStatus.Draft || 0;

		const fullyPaidShare = hasStatusShare
			? statusShare.Fully_Paid || 0
			: totalInvoices > 0
				? fullyPaidCount / totalInvoices
				: 0;
		const pendingShare = hasStatusShare
			? (statusShare.Pending || 0) + (statusShare.Partially_Paid || 0)
			: totalInvoices > 0
				? pendingCount / totalInvoices
				: 0;
		const draftShare = hasStatusShare
			? statusShare.Draft || 0
			: totalInvoices > 0
				? draftCount / totalInvoices
				: 0;

		return {
			totalValue: Math.round(invoiceSummary.total_amount || 0),
			currency: "AED",
			growthValue: 0,
			fullyPaidPercentage: Math.round(fullyPaidShare * 100),
			pendingPercentage: Math.round(pendingShare * 100),
			draftPercentage: Math.round(draftShare * 100),
		};
	}, [overview, useMockData]);

	// Show loading state
	if (isLoading) {
		return (
			<div className="bg-bg-weak border border-border rounded-3xl p-1.5">
				<div className="bg-background border border-border rounded-[20px] shadow-[0px_1px_2px_0px_rgba(10,13,20,0.08)] p-4 flex items-center justify-center h-[417px]">
					<div className="flex flex-col items-center gap-3">
						<div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
						<p className="text-sm text-text-sub">Loading invoice data...</p>
					</div>
				</div>
			</div>
		);
	}

	// Show error state
	if (error) {
		return (
			<div className="bg-bg-weak border border-border rounded-3xl p-1.5">
				<div className="bg-background border border-border rounded-[20px] shadow-[0px_1px_2px_0px_rgba(10,13,20,0.08)] p-4 flex items-center justify-center h-[417px]">
					<div className="flex flex-col items-center gap-3 text-center">
						<div className="w-12 h-12 rounded-full bg-danger/10 flex items-center justify-center">
							<svg
								width={24}
								height={24}
								viewBox="0 0 24 24"
								fill="none"
								className="stroke-danger">
								<path
									d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
									strokeWidth={2}
									strokeLinecap="round"
									strokeLinejoin="round"
								/>
							</svg>
						</div>
						<p className="text-sm text-text-strong font-medium">
							Failed to load invoice data
						</p>
						<p className="text-xs text-text-sub">
							{error instanceof Error ? error.message : "Unknown error occurred"}
						</p>
					</div>
				</div>
			</div>
		);
	}

	return (
		<InvoiceChart
			data={chartData}
			onCheckDrafts={onCheckDrafts}
		/>
	);
}

export default InvoiceChartContainer;
