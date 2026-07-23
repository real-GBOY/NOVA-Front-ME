/** @format */

import { useState, useRef, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { UseFormReturn } from "react-hook-form";
import Button from "@/designSystem/Button";
import StepIndicator from "@/designSystem/StepIndicator";
import { STEPS, type AddMemberWizardProps } from "./types";
import StepBasicInfo from "./StepBasicInfo";
import StepWorkInfo from "./StepWorkInfo";
import StepResidency from "./StepResidency";
import StepReview from "./StepReview";
import { type MemberFormData } from "@/utilities/schemas/memberSchema";
import { useOnboarding } from "@/hooks/onboarding/useOnboarding";
import type {
   OnboardingStartRequest,
   OnboardingWorkRequest,
   OnboardingResidencyRequest,
} from "@/services/onboardingService";
import toast from "@/utilities/toast";
import { buildValidationSummaryItems } from "@/designSystem/GenericForm";
import type { MutableRefObject } from "react";
import Loader from "@/designSystem/Loader";
import { useTranslation } from "@/hooks/useTranslation";
import {
   filterReadyUploads,
   getFirstReadyUpload,
   isUploadReady,
} from "@/utils/uploadValidation";


type SubmitStep = "start" | "work" | "residency" | "finalize";
type StepKey = "basic" | "work" | "residency" | "review";

function AddMemberWizard({
   onClose,
   onComplete,
   onFormDataChange,
   initialData,
   availableJobTitles = [],
   availableTeams = [],
   availableRoles = [],
   availableManagers = [],
}: AddMemberWizardProps) {
   const { t } = useTranslation("common");
   const [currentStep, setCurrentStep] = useState(1);
   const [isSubmitting, setIsSubmitting] = useState(false);
   const [isValidating, setIsValidating] = useState(false);
   const [completedSteps, setCompletedSteps] = useState<number[]>([]);
   const [onboardingId, setOnboardingId] = useState<string | null>(null);
   const [submitQueueIndex, setSubmitQueueIndex] = useState(0);

   // Initialize onboarding mutations
   const {
      useStartOnboarding,
      useUpdateOnboardingWork,
      useUpdateOnboardingResidency,
      useFinalizeOnboarding,
   } = useOnboarding();
   const startOnboarding = useStartOnboarding();
   const updateWork = useUpdateOnboardingWork();
   const updateResidency = useUpdateOnboardingResidency();
   const finalize = useFinalizeOnboarding();

   // Form refs for each step
   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   const step1FormRef = useRef<UseFormReturn<any> | null>(null);
   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   const step2FormRef = useRef<UseFormReturn<any> | null>(null);
   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   const step3FormRef = useRef<UseFormReturn<any> | null>(null);

   const [formData, setFormData] = useState<MemberFormData>({
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      country: "",
      dateOfBirth: "",
      gender: "",
      maritalStatus: "",
      nationalId: "",
      address: "",
      jobTitle: "",
      team_ids: [],
      role: "",
      manager: "",
      shiftId: null,
      employmentType: "",
      startDate: "",
      hoursPerWeek: "",
      probationPeriod: "",
      salary: "",
      contractType: "",
      documents: [],
      // Residency Defaults
      residencyStatus: "",
      residencyCountry: "United Arab Emirates",
      residencyType: "",
      residencyNumber: "",
      residencyIssueDate: "",
      residencyExpiryDate: "",
      residencyDocument: [],
      ...initialData,
   });

   const steps = useMemo(() => {
      return STEPS.map((step, index) => ({
         ...step,
         id: index + 1,
         title:
            step.key === "basic"
               ? t("members.wizard.steps.basic")
               : step.key === "work"
               ? t("members.wizard.steps.work")
               : step.key === "residency"
               ? t("members.wizard.steps.residency")
               : step.key === "review"
               ? t("members.wizard.steps.review")
               : step.title,
      }));
   }, [t]);

   const submitQueue = useMemo(() => {
      return ["start", "work", "residency", "finalize"] as const;
   }, []);

   const stepIdByKey = useMemo(() => {
      return steps.reduce((acc, step) => {
         acc.set(step.key, step.id);
         return acc;
      }, new Map<string, number>());
   }, [steps]);

   useEffect(() => {
      if (currentStep > steps.length) {
         setCurrentStep(steps.length);
      }
   }, [currentStep, steps.length]);

   useEffect(() => {
      if (submitQueueIndex > submitQueue.length) {
         setSubmitQueueIndex(submitQueue.length);
      }
   }, [submitQueueIndex, submitQueue.length]);

   const updateFormData = (field: keyof MemberFormData, value: unknown) => {
      setFormData((prev) => {
         const updated = {
            ...prev,
            [field]: value,
         };
         return updated;
      });
   };

   // Notify parent component of form data changes
   useEffect(() => {
      if (onFormDataChange) {
         onFormDataChange(formData);
      }
   }, [formData, onFormDataChange]);

   // Check if any files are currently uploading
   // Helper to handle both boolean and string "true"/"false" from some uploaders
   const checkIsUploading = (doc: any) => {
      if (!doc) return false;
      if (typeof doc.isUploading === "string") {
         return doc.isUploading === "true";
      }
      return !!doc.isUploading;
   };

   const isAnyUploading =
      formData.documents?.some(checkIsUploading) ||
      (Array.isArray(formData.residencyDocument) &&
         formData.residencyDocument.some(checkIsUploading)) ||
      checkIsUploading(formData.profileImage);

   const navigateToStepKey = (stepKey: StepKey) => {
      const stepId = stepIdByKey.get(stepKey);
      if (stepId) {
         setCurrentStep(stepId);
      }
   };

   const getServerFieldErrors = (
      error: unknown
   ): Array<{ field: string; message: string }> => {
      const data = (error as { response?: { data?: unknown } })?.response?.data;
      if (!data || typeof data !== "object") return [];

      const errorPayload =
         (data as { errors?: unknown }).errors ||
         (data as { fieldErrors?: unknown }).fieldErrors ||
         (data as { fields?: unknown }).fields ||
         (data as { error?: { errors?: unknown } }).error?.errors;

      if (!errorPayload) return [];

      if (Array.isArray(errorPayload)) {
         return errorPayload
            .map((item) => {
               if (!item || typeof item !== "object") {
                  return null;
               }
               const field =
                  (item as { field?: string }).field ||
                  (item as { path?: string }).path ||
                  (item as { name?: string }).name;
               const message =
                  (item as { message?: string }).message ||
                  (item as { msg?: string }).msg ||
                  (item as { error?: string }).error;
               if (!field) return null;
               return {
                  field,
                  message: message || "Invalid value",
               };
            })
            .filter(
               (item): item is { field: string; message: string } => !!item
            );
      }

      if (typeof errorPayload === "object") {
         return Object.entries(errorPayload as Record<string, unknown>)
            .map(([field, value]) => {
               if (typeof value === "string") {
                  return { field, message: value };
               }
               if (Array.isArray(value) && typeof value[0] === "string") {
                  return { field, message: value[0] };
               }
               if (value && typeof value === "object" && "message" in value) {
                  const message = (value as { message?: string }).message;
                  if (typeof message === "string") {
                     return { field, message };
                  }
               }
               return null;
            })
            .filter(
               (item): item is { field: string; message: string } => !!item
            );
      }

      return [];
   };

   const applyServerErrorsToStep = (
      step: Exclude<SubmitStep, "finalize">,
      error: unknown
   ) => {
      const stepKey: StepKey =
         step === "start" ? "basic" : step === "work" ? "work" : "residency";
      const formRef =
         step === "start"
            ? step1FormRef
            : step === "work"
            ? step2FormRef
            : step3FormRef;
      const fieldMap: Partial<Record<string, keyof MemberFormData>> = {};
      if (step === "start") {
         fieldMap.first_name = "firstName";
         fieldMap.last_name = "lastName";
         fieldMap.email = "email";
         fieldMap.phone_number = "phoneNumber";
         fieldMap.country = "country";
         fieldMap.date_of_birth = "dateOfBirth";
         fieldMap.gender = "gender";
         fieldMap.marital_status = "maritalStatus";
         fieldMap.national_id = "nationalId";
         fieldMap.address = "address";
      }
      if (step === "work") {
         fieldMap.job_title = "jobTitle";
         fieldMap.job_title_id = "jobTitle";
         fieldMap.team_ids = "team_ids";
         fieldMap.role_id = "role";
         fieldMap.manager_id = "manager";
         fieldMap.shift_id = "shiftId";
         fieldMap.employment_type = "employmentType";
         fieldMap.start_date = "startDate";
         fieldMap.hours_per_week = "hoursPerWeek";
         fieldMap.probation_period = "probationPeriod";
      }
      if (step === "residency") {
         fieldMap.permit_number = "residencyNumber";
         fieldMap.permit_type = "residencyType";
         fieldMap.issue_date = "residencyIssueDate";
         fieldMap.expiration_date = "residencyExpiryDate";
         fieldMap.country = "residencyCountry";
         fieldMap.status = "residencyStatus";
         fieldMap.document = "residencyDocument";
      }

      const fieldErrors = getServerFieldErrors(error);
      navigateToStepKey(stepKey);

      if (fieldErrors.length === 0) {
         return;
      }

      setTimeout(() => {
         if (!formRef.current) return;
         let firstField: keyof MemberFormData | null = null;
         fieldErrors.forEach(({ field, message }) => {
            const mappedField =
               fieldMap[field] || (field as keyof MemberFormData);
            formRef.current?.setError(mappedField as never, {
               type: "server",
               message,
            });
            if (!firstField) {
               firstField = mappedField;
            }
         });

         if (firstField) {
            formRef.current?.setFocus(firstField as never);
         }
      }, 0);
   };

   const getErrorMessage = (error: unknown, fallback: string) => {
      let message = fallback;
      if (error && typeof error === "object") {
         // eslint-disable-next-line @typescript-eslint/no-explicit-any
         const axiosError = error as any;
         if (axiosError.response) {
            const status = axiosError.response.status;
            const data = axiosError.response.data;

            if (status === 409) {
               message =
                  "Conflict: This email may already be in use or an onboarding session already exists.";
            } else if (status === 400) {
               message = `Validation Error: ${
                  data?.message || "Invalid data provided"
               }`;
            } else if (data?.message) {
               message = data.message;
            }
         } else if (error instanceof Error) {
            message = error.message;
         }
      }
      return message;
   };

   const handleNext = async () => {
      setIsValidating(true);

      try {
         const validateStep = async (
            formRef: MutableRefObject<UseFormReturn<any> | null>
         ) => {
            if (!formRef.current) return true;
            let isValid = false;
            await formRef.current.handleSubmit(
               () => {
                  isValid = true;
               },
               (errors) => {
                  isValid = false;
                  const { items } = buildValidationSummaryItems(errors, {}, {});
                  if (items[0]) {
                     formRef.current?.setFocus(items[0].field as never);
                  }
               }
            )();
            return isValid;
         };

         let isValid = false;
         const currentStepKey = steps[currentStep - 1]?.key;

         if (currentStepKey === "basic") {
            isValid = await validateStep(step1FormRef);
         } else if (currentStepKey === "work") {
            isValid = await validateStep(step2FormRef);
         } else if (currentStepKey === "residency") {
            isValid = await validateStep(step3FormRef);
         } else if (currentStepKey === "review") {
            isValid = true;
         }

         setIsValidating(false);

         // If validation fails, don't proceed (errors are displayed inline by react-hook-form)
         if (!isValid) {
            console.error("❌ Validation failed for step", currentStep);
            return;
         }

         // Mark this step as completed
         if (!completedSteps.includes(currentStep)) {
            setCompletedSteps([...completedSteps, currentStep]);
         }

         // Navigate to next step or submit
         if (currentStep < steps.length) {
            setCurrentStep(currentStep + 1);
         } else {
            // Step 4: Submit everything
            handleSubmit();
         }
      } catch (error) {
         setIsValidating(false);
         console.error("❌ Validation error:", error);
         toast.error(t("members.wizard.messages.validationError"));
      }
   };

   const handleBack = () => {
      if (currentStep > 1) {
         setCurrentStep(currentStep - 1);
      } else {
         if (onClose) onClose();
      }
   };

   const handleSubmit = async () => {
      try {
         setIsSubmitting(true);

         // Read freshest upload state directly from form refs to avoid
         // race conditions between local component state and wizard formData.
         const latestBasicValues =
            step1FormRef.current?.getValues?.() as Partial<MemberFormData>;
         const latestResidencyValues =
            step3FormRef.current?.getValues?.() as Partial<MemberFormData>;

         const basicDocuments =
            latestBasicValues?.documents || formData.documents || [];
         const latestProfileImage =
            latestBasicValues?.profileImage || formData.profileImage;
         const residencyDocuments =
            latestResidencyValues?.residencyDocument ||
            formData.residencyDocument ||
            [];

         // Transform documents to only include required fields
         const attachments = filterReadyUploads(basicDocuments)
            .map((doc) => ({
               fileId: doc.fileId,
               token: doc.token,
               purpose: doc.purpose || "employee_document",
            }));

         // Transform profile image to only include required fields
         const profileImage =
            isUploadReady(latestProfileImage)
               ? {
                    fileId: latestProfileImage.fileId,
                    token: latestProfileImage.token,
                    purpose:
                       latestProfileImage.purpose || "employee_profile",
                 }
               : undefined;

         const residencyDocument = getFirstReadyUpload(residencyDocuments);

         // Format date_of_birth properly
         let formattedDateOfBirth: string | undefined = undefined;
         if (formData.dateOfBirth) {
            try {
               // Always try to create a Date object and convert to ISO string
               const date = new Date(formData.dateOfBirth);
               if (!isNaN(date.getTime())) {
                  formattedDateOfBirth = date.toISOString();
               } else {
                  console.warn(
                     "⚠️ Invalid date_of_birth value:",
                     formData.dateOfBirth
                  );
               }
            } catch (error) {
               console.error("❌ Error formatting date_of_birth:", error);
            }
         }

         // Helper to convert day strings like "90 days" to numbers
         const parseDaysValue = (value?: string) => {
            if (!value) return undefined;
            const digits = value.replace(/[^0-9]/g, "");
            return digits ? Number(digits) : undefined;
         };

         const startPayload: OnboardingStartRequest = {
            first_name: formData.firstName,
            last_name: formData.lastName,
            email: formData.email,
            phone_number: formData.phoneNumber,
            country: formData.country || undefined,
            date_of_birth: formattedDateOfBirth,
            gender: formData.gender || undefined,
            marital_status: formData.maritalStatus || undefined,
            national_id: formData.nationalId || undefined,
            address: formData.address || undefined,
            attachments,
            profileImage,
         };

         const workPayload: OnboardingWorkRequest = {
            job_title_id: formData.jobTitle
               ? Number(formData.jobTitle)
               : undefined,
            team_ids: formData.team_ids
               ? formData.team_ids.map((id) => Number(id))
               : [],
            role_id: formData.role ? Number(formData.role) : undefined,
            manager_id: formData.manager ? Number(formData.manager) : undefined,
            shift_id: formData.shiftId ? Number(formData.shiftId) : undefined,
            employment_type: formData.employmentType as
               | "full_time"
               | "part_time"
               | "contract"
               | "intern"
               | "temporary"
               | undefined,
            start_date: formData.startDate || undefined,
            hours_per_week: formData.hoursPerWeek
               ? Number(formData.hoursPerWeek)
               : undefined,
            probation_period: parseDaysValue(formData.probationPeriod),
         };
         const residencyPayload: OnboardingResidencyRequest = {
            permit_number: formData.residencyNumber || "",
            permit_type: formData.residencyType || "",
            issue_date: formData.residencyIssueDate || "",
            expiration_date: formData.residencyExpiryDate || "",
            country: formData.residencyCountry || undefined,
            status: formData.residencyStatus || undefined,
            document: residencyDocument
               ? {
                    fileId: residencyDocument.fileId,
                    token: residencyDocument.token,
                    purpose: residencyDocument.purpose || "employee_document",
                 }
               : undefined,
         };

         const queueStartIndex = onboardingId ? submitQueueIndex : 0;
         if (!onboardingId && submitQueueIndex !== 0) {
            setSubmitQueueIndex(0);
         }

         let activeOnboardingId = onboardingId;

         for (
            let index = queueStartIndex;
            index < submitQueue.length;
            index++
         ) {
            const step = submitQueue[index];
            try {
               if (step === "start") {
                  const startResponse = await startOnboarding.mutateAsync(
                     startPayload
                  );
                  activeOnboardingId = startResponse.onboarding_id;
                  setOnboardingId(activeOnboardingId);
               } else {
                  if (!activeOnboardingId) {
                     const startResponse = await startOnboarding.mutateAsync(
                        startPayload
                     );
                     activeOnboardingId = startResponse.onboarding_id;
                     setOnboardingId(activeOnboardingId);
                  }
                  if (step === "work") {
                     await updateWork.mutateAsync({
                        onboardingId: activeOnboardingId,
                        payload: workPayload,
                     });
                  } else if (step === "residency") {
                     await updateResidency.mutateAsync({
                        onboardingId: activeOnboardingId,
                        payload: residencyPayload,
                     });
                  } else if (step === "finalize") {
                     await finalize.mutateAsync(activeOnboardingId);
                  }
               }
            } catch (error) {
               console.error(`❌ Error during onboarding step: ${step}`, error);
               if (step === "start") {
                  applyServerErrorsToStep("start", error);
                  toast.error(
                     getErrorMessage(
                        error,
                        t("members.wizard.messages.startError")
                     )
                  );
               } else if (step === "work") {
                  applyServerErrorsToStep("work", error);
                  toast.error(
                     getErrorMessage(
                        error,
                        t("members.wizard.messages.saveWorkError")
                     )
                  );
               } else if (step === "residency") {
                  applyServerErrorsToStep("residency", error);
                  toast.error(
                     getErrorMessage(
                        error,
                        t("members.wizard.messages.saveResidencyError")
                     )
                  );
               } else {
                  navigateToStepKey("review");
                  toast.error(
                     getErrorMessage(
                        error,
                        t("members.wizard.messages.finalizeError")
                     )
                  );
               }
               setIsSubmitting(false);
               return;
            }

            setSubmitQueueIndex(index + 1);
         }

         toast.success(
            t("members.wizard.messages.successFormat", {
               firstName: formData.firstName,
               lastName: formData.lastName,
            })
         );

         if (onComplete) {
            await onComplete(formData);
         }

         setSubmitQueueIndex(0);
         setOnboardingId(null);
         setIsSubmitting(false);
      } catch (error) {
         console.error("❌ Error in onboarding process:", error);
         toast.error(
            getErrorMessage(error, t("members.wizard.messages.validationError"))
         );
         setIsSubmitting(false);
      }
   };

   // eslint-disable-next-line @typescript-eslint/no-unused-vars
   const handleNavigateToStep = (_step: number) => {
      // User requested to disable navigation through left sidebar
      // except for programmatic navigation
      // keeping the function signature but effectively disabling it for click events
      // if it's used by the step indicator
      toast.info(t("members.wizard.messages.navigationError"));
   };

   return (
      <div className="flex flex-col h-full relative">
         {/* Loading Overlay */}
         {isSubmitting && (
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
               <Loader label={t("members.wizard.buttons.processing")} />
            </div>
         )}

         <div className="flex flex-col xl:flex-row flex-1 overflow-hidden">
            {/* Left Sidebar - Steps */}
            <div className="w-full xl:w-auto xl:min-w-[500px] bg-bg-weak ps-4 sm:ps-6 md:ps-8 xl:ps-32 pe-4 sm:pe-6 pt-4 pb-4 flex flex-col">
               <StepIndicator
                  steps={steps}
                  currentStep={currentStep}
                  onStepChange={handleNavigateToStep} // Changed to use the restricted navigation handler
                  disableHoverEffects
               />
            </div>

            {/* Right Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
               <div className="flex-1 overflow-y-auto pl-4 sm:pl-6 md:pl-8 xl:pl-32 pr-4 sm:pr-6 md:pr-8 pt-4 pb-4 bg-bg-weak [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  <motion.div
                     key={currentStep}
                     initial={{ opacity: 0, x: 0, y: 10 }}
                     animate={{ opacity: 1, x: 0, y: 0 }}
                     exit={{ opacity: 0, x: 0, y: -10 }}
                     transition={{ duration: 0.3 }}>
                     {steps[currentStep - 1]?.key === "basic" && (
                        <StepBasicInfo
                           formData={formData}
                           updateFormData={updateFormData}
                           formRef={step1FormRef}
                        />
                     )}
                     {steps[currentStep - 1]?.key === "work" && (
                        <StepWorkInfo
                           formData={formData}
                           updateFormData={updateFormData}
                           availableJobTitles={availableJobTitles}
                           availableTeams={availableTeams}
                           availableRoles={availableRoles}
                           availableManagers={availableManagers}
                           formRef={step2FormRef}
                        />
                     )}
                     {steps[currentStep - 1]?.key === "residency" && (
                        <StepResidency
                           formData={formData}
                           updateFormData={updateFormData}
                           formRef={step3FormRef}
                        />
                     )}
                     {steps[currentStep - 1]?.key === "review" && (
                        <StepReview
                           formData={formData}
                           onNavigateToStep={(step) => setCurrentStep(step)} // Internal navigation from Review step is still allowed? Or should also be restricted?
                           // Usually review step "Edit" buttons want to go back.
                           // The user said "disable navigating through the on left".
                           // So internal navigation (back/edit) should be fine.
                           availableJobTitles={availableJobTitles}
                           availableTeams={availableTeams}
                           availableRoles={availableRoles}
                           availableManagers={availableManagers}
                           showResidency={true}
                        />
                     )}
                  </motion.div>
               </div>
            </div>
         </div>

         {/* Footer Actions */}
         <div className="flex flex-col md:flex-row items-stretch md:items-center justify-end gap-2 sm:gap-3 px-4 sm:px-6 md:px-8 pt-3 sm:pt-4 pb-3 sm:pb-4 border-t border-border">
            <Button
               variant="secondary"
               onClick={handleBack}
               disabled={isSubmitting || isValidating}
               className="w-full md:w-auto px-4 sm:px-6 py-2.5 sm:py-3 text-text-sub bg-bg-weak hover:bg-bg-soft rounded-xl sm:rounded-2xl border border-border">
               {t("members.wizard.buttons.back")}
            </Button>
            <Button
               variant="primary"
               onClick={handleNext}
               disabled={isSubmitting || isValidating || !!isAnyUploading}
               className="w-full md:w-auto px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
               {isSubmitting
                  ? t("members.wizard.buttons.processing")
                  : isValidating
                  ? t("members.wizard.buttons.validating")
                  : isAnyUploading
                  ? t("members.wizard.buttons.uploading")
                  : currentStep === steps.length
                  ? t("members.wizard.buttons.addMember")
                  : t("members.wizard.buttons.continue")}
            </Button>
         </div>
      </div>
   );
}

export default AddMemberWizard;
