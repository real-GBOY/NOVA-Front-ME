/** @format */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { reactQueryKeys } from "@/config/reactQueryKeys";
import {
   onboardingService,
   type OnboardingStartRequest,
   type OnboardingWorkRequest,
} from "@/services/onboardingService";

const onboardingKeys = reactQueryKeys.onboarding;

// POST - Start onboarding (Step 1)
export const useStartOnboarding = () => {
   const queryClient = useQueryClient();
   return useMutation({
      mutationKey: onboardingKeys.start(),
      mutationFn: (payload: OnboardingStartRequest) =>
         onboardingService.start(payload),
      onSuccess: () => {
         // Invalidate any employee lists if needed
         queryClient.invalidateQueries({
            queryKey: ["employees"],
         });
      },
      onError: (error) => {
         console.error("❌ Error starting onboarding:", error);
      },
   });
};

// PATCH - Update work info (Step 2)
export const useUpdateOnboardingWork = () => {
   const queryClient = useQueryClient();
   return useMutation({
      mutationKey: onboardingKeys.all,
      mutationFn: ({
         onboardingId,
         payload,
      }: {
         onboardingId: string;
         payload: OnboardingWorkRequest;
      }) => onboardingService.updateWork(onboardingId, payload),
      onSuccess: (data, variables) => {
         // Invalidate the specific onboarding work query
         queryClient.invalidateQueries({
            queryKey: onboardingKeys.work(variables.onboardingId),
         });
      },
      onError: (error) => {
         console.error("❌ Error updating work info:", error);
      },
   });
};

// PUT - Update residency info (Step 3)
export const useUpdateOnboardingResidency = () => {
   const queryClient = useQueryClient();
   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   return useMutation<any, any, any>({
      mutationKey: onboardingKeys.all,
       
      mutationFn: ({
         onboardingId,
         payload,
      }: {
         onboardingId: string;
         // eslint-disable-next-line @typescript-eslint/no-explicit-any
         payload: any;
      }) => onboardingService.updateResidency(onboardingId, payload),
      onSuccess: (_data: unknown, variables: { onboardingId: string }) => {
         void _data;
         // Invalidate the specific onboarding work query
         queryClient.invalidateQueries({
            queryKey: onboardingKeys.work(variables.onboardingId),
         });
      },
      onError: (error) => {
         console.error("❌ Error updating residency info:", error);
      },
   });
};

// PATCH - Update contract info
export const useUpdateOnboardingContract = () => {
   const queryClient = useQueryClient();
   return useMutation({
      mutationKey: onboardingKeys.all,
      mutationFn: ({
         onboardingId,
         payload,
      }: {
         onboardingId: string;
         payload: unknown;
      }) => onboardingService.updateContract(onboardingId, payload),
      onSuccess: (_data, variables) => {
         void _data;
         queryClient.invalidateQueries({
            queryKey: onboardingKeys.contract(variables.onboardingId),
         });
      },
      onError: (error) => {
         console.error("❌ Error updating contract info:", error);
      },
   });
};

// POST - Complete onboarding
export const useCompleteOnboarding = () => {
   const queryClient = useQueryClient();
   return useMutation({
      mutationKey: onboardingKeys.all,
      mutationFn: (onboardingId: string) =>
         onboardingService.complete(onboardingId),
      onSuccess: () => {
         // Invalidate employee lists
         queryClient.invalidateQueries({
            queryKey: ["employees"],
         });
      },
      onError: (error) => {
         console.error("❌ Error completing onboarding:", error);
      },
   });
};

// POST - Finalize onboarding (final step)
export const useFinalizeOnboarding = () => {
   const queryClient = useQueryClient();
   return useMutation({
      mutationKey: onboardingKeys.all,
      mutationFn: (onboardingId: string) =>
         onboardingService.finalize(onboardingId),
      onSuccess: () => {
         // Invalidate employee lists
         queryClient.invalidateQueries({
            queryKey: ["employees"],
         });
      },
      onError: (error) => {
         console.error("❌ Error finalizing onboarding:", error);
      },
   });
};

// POST - Resend onboarding invitation
export const useResendOnboardingInvite = () =>
   useMutation({
      mutationKey: onboardingKeys.all,
      mutationFn: (onboardingId: string) =>
         onboardingService.resendInvite(onboardingId),
      onError: (error) => {
         console.error("❌ Error resending onboarding invite:", error);
      },
   });
