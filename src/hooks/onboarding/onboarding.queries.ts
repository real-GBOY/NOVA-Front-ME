/** @format */

import { useQuery } from "@tanstack/react-query";
import { reactQueryKeys } from "@/config/reactQueryKeys";
import { onboardingService } from "@/services/onboardingService";

const onboardingKeys = reactQueryKeys.onboarding;

// GET - List onboarding sessions
export const useListOnboarding = (
   filters?: {
      page?: number;
      limit?: number;
      status?: string;
      employee_id?: number;
   },
   options?: {
      enabled?: boolean;
   }
) =>
   useQuery({
      queryKey: onboardingKeys.list(filters),
      queryFn: async () => onboardingService.list(filters),
      enabled: options?.enabled !== false,
      staleTime: 5 * 60 * 1000,
   });
