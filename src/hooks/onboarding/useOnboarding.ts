/** @format */

import {
   useStartOnboarding,
   useUpdateOnboardingWork,
   useUpdateOnboardingResidency,
   useUpdateOnboardingContract,
   useCompleteOnboarding,
   useFinalizeOnboarding,
   useResendOnboardingInvite,
} from "./onboarding.mutations";

export const useOnboarding = () => {
   return {
      useStartOnboarding,
      useUpdateOnboardingWork,
      useUpdateOnboardingResidency,
      useUpdateOnboardingContract,
      useCompleteOnboarding,
      useFinalizeOnboarding,
      useResendOnboardingInvite,

      useStart: useStartOnboarding,
      useUpdateWork: useUpdateOnboardingWork,
      useUpdateResidency: useUpdateOnboardingResidency,
      useUpdateContract: useUpdateOnboardingContract,
      useComplete: useCompleteOnboarding,
      useFinalize: useFinalizeOnboarding,
      useResendInvite: useResendOnboardingInvite,
   };
};

export {
   useStartOnboarding,
   useUpdateOnboardingWork,
   useUpdateOnboardingResidency,
   useUpdateOnboardingContract,
   useCompleteOnboarding,
   useFinalizeOnboarding,
   useResendOnboardingInvite,
} from "./onboarding.mutations";
