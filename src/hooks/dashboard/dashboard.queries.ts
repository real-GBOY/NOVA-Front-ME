/** @format */

import { useQuery } from "@tanstack/react-query";
import { reactQueryKeys } from "@/config/reactQueryKeys";
import {
	dashboardService,
	type DashboardOverviewFilters,
} from "@/services/dashboardService";

const dashboardKeys = reactQueryKeys.dashboard;

export const useDashboardOverview = (
	filters?: DashboardOverviewFilters,
	options?: {
		enabled?: boolean;
	}
) =>
	useQuery({
		queryKey: dashboardKeys.overview(filters),
		queryFn: async () => dashboardService.getOverview(filters),
		enabled: options?.enabled !== false,
		staleTime: 5 * 60 * 1000,
		refetchOnWindowFocus: false,
	});
