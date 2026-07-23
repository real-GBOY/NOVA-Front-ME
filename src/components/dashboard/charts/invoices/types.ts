/** @format */

export type InvoiceChartData = {
	totalValue: number;
	currency: string;
	growthValue: number;
	growthLabel: string;
	fullyPaidPercentage: number;
	pendingPercentage: number;
	draftPercentage: number;
};

export type InvoiceChartProps = {
	data: InvoiceChartData;
	onCheckDrafts?: () => void;
};
