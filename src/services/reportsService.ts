/** @format */

import apiClient from "@/config/axios";
import endPoints from "@/config/endPoints";

export type ReportParameter = {
	name: string;
	type?: string;
	required?: boolean;
};

export type ReportDefinition = {
	key: string;
	title: string;
	category: string;
	description: string;
	parameters: ReportParameter[];
};

type ListReportsResponse = {
	success: boolean;
	data: ReportDefinition[];
};

export const reportsService = {
	async list(filters?: {
		search?: string;
		category?: string;
		sort_by?: string;
		sort_order?: "asc" | "desc";
	}) {
		const response = await apiClient.get<ListReportsResponse>(endPoints.reports.list, {
			params: filters,
		});
		return response.data.data;
	},
	async export(
		key: string,
		params: Record<string, unknown>,
		format: "xls" | "csv" = "xls"
	) {
		const response = await apiClient.get(endPoints.reports.export(key), {
			params: { ...params, format },
			responseType: "blob",
		});
		
		// Check if response is actually a blob (not an error JSON wrapped in blob)
		const blob = response.data as Blob;
		
		// If the blob is JSON (error response), parse and throw it
		// Only application/json should be treated as an error
		// text/csv and application/vnd.ms-excel are valid responses
		if (blob.type === "application/json") {
			const text = await blob.text();
			try {
				const errorData = JSON.parse(text);
				throw new Error(errorData.message || "Failed to export report");
			} catch {
				// If it's not valid JSON, throw a generic error
				throw new Error("Failed to export report");
			}
		}
		
		return blob;
	},
};

export default reportsService;
