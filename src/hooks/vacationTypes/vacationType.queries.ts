/** @format */

import { useQuery } from "@tanstack/react-query";
import apiClient from "@/config/axios";
import endPoints from "@/config/endPoints";
import { reactQueryKeys } from "@/config/reactQueryKeys";

export interface VacationTypeOption {
   id: number;
   name: string;
   unit?: "day" | "hour" | "policy" | string;
}

const vacationTypeKeys = reactQueryKeys.vacationTypes;

export const useVacationTypes = (options?: { enabled?: boolean }) =>
   useQuery({
      queryKey: vacationTypeKeys.list(),
      queryFn: async () => {
         const response = await apiClient.get(endPoints.vacationTypes.getAll);
         return (response.data?.data || response.data || []) as VacationTypeOption[];
      },
      enabled: options?.enabled !== false,
      staleTime: 30 * 60 * 1000,
      refetchOnWindowFocus: false,
   });

