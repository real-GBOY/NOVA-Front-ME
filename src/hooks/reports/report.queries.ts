/** @format */

import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { reactQueryKeys } from "@/config/reactQueryKeys";
import { reportsService, type ReportDefinition } from "@/services/reportsService";

export const useListReports = (
	filters?: { search?: string; category?: string; sort_by?: string; sort_order?: "asc" | "desc" },
	options?: Omit<UseQueryOptions<ReportDefinition[], Error>, "queryKey" | "queryFn">
) =>
	useQuery({
		queryKey: reactQueryKeys.reports.list(filters),
		queryFn: () => reportsService.list(filters),
		staleTime: 5 * 60 * 1000,
		...options,
	});
