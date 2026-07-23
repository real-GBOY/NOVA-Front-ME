/** @format */

import { useState, useEffect, useRef, useMemo } from "react";
import { motion } from "framer-motion";
import Button from "@/designSystem/Button";
import StepIndicator from "@/designSystem/StepIndicator";
import StepBasicInfo from "./BasicInfo/StepBasicInfo";
import StepReview from "./ReviewConfirm/StepReview";
import {
   type AddJobTitleWizardProps,
   type JobTitleFormData,
   STEPS,
} from "./types";
import { UseFormReturn } from "react-hook-form";
import { buildValidationSummaryItems } from "@/designSystem/GenericForm";
import { useTranslation } from "@/hooks/useTranslation";

function AddJobTitleWizard({
   onSubmit,
   onCancel,
   availableRoles = [],
   onFormDataChange,
   initialData,
}: AddJobTitleWizardProps) {
   const [currentStep, setCurrentStep] = useState(1);
   const [isValidating, setIsValidating] = useState(false);
   const step1FormRef = useRef<UseFormReturn<any> | null>(null);

   // Initialize original data ref immediately if initialData is provided
   const getInitialFormData = (): JobTitleFormData => {
      return (
         initialData || {
            name: "",
            description: "",
            roles: [],
         }
      );
   };

   const getInitialOriginalData = (): JobTitleFormData | null => {
      if (!initialData) return null;
      return {
         name: initialData.name,
         description: initialData.description || "",
         roles: initialData.roles ? [...initialData.roles] : [],
      };
   };

   const [formData, setFormData] = useState<JobTitleFormData>(
      getInitialFormData()
   );
   const originalDataRef = useRef<JobTitleFormData | null>(
      getInitialOriginalData()
   );
   const initialDataKeyRef = useRef<string | null>(
      initialData
         ? `${initialData.name}-${initialData.roles?.join(",") || ""}`
         : null
   );

   // Reset form data when initialData changes
   useEffect(() => {
      // Create a stable key from initialData to detect when we're editing a different job title
      const currentKey = initialData
         ? `${initialData.name}-${initialData.roles?.join(",") || ""}`
         : null;

      // Only update original data if we're switching to a different job title or entering edit mode
      if (initialData && currentKey !== initialDataKeyRef.current) {
         setFormData(initialData);
         // Store a deep copy of the original data for comparison
         originalDataRef.current = {
            name: initialData.name,
            description: initialData.description || "",
            roles: initialData.roles ? [...initialData.roles] : [],
         };
         initialDataKeyRef.current = currentKey;
         setCurrentStep(1);
      } else if (!initialData && initialDataKeyRef.current !== null) {
         // Switching to add mode
         setFormData({
            name: "",
            description: "",
            roles: [],
         });
         originalDataRef.current = null;
         initialDataKeyRef.current = null;
         setCurrentStep(1);
      } else if (initialData && currentKey === initialDataKeyRef.current) {
         // Same job title, just update form data (in case of data refresh)
         setFormData(initialData);
      }
   }, [initialData]);

   // Notify parent component of form data changes
   useEffect(() => {
      if (onFormDataChange) {
         onFormDataChange(formData);
      }
   }, [formData, onFormDataChange]);

   const validateStep = async () => {
      if (!step1FormRef.current) return true;
      let isValid = false;
      await step1FormRef.current.handleSubmit(
         () => {
            isValid = true;
         },
         (errors) => {
            isValid = false;
            const { items } = buildValidationSummaryItems(errors, {}, {});
            if (items[0]) {
               step1FormRef.current?.setFocus(items[0].field as never);
            }
         }
      )();
      return isValid;
   };

   const handleNext = async () => {
      setIsValidating(true);
      const isValid = currentStep === 1 ? await validateStep() : true;
      setIsValidating(false);
      if (!isValid) return;
      if (currentStep < STEPS.length) {
         setCurrentStep(currentStep + 1);
      } else {
         onSubmit(formData);
      }
   };

   const handleBack = () => {
      if (currentStep > 1) {
         setCurrentStep(currentStep - 1);
      } else {
         onCancel();
      }
   };

   const updateFormData = (field: keyof JobTitleFormData, value: unknown) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
   };

   // Helper function to compare arrays (order-independent)
   const arraysEqual = (
      a: string[] | undefined,
      b: string[] | undefined
   ): boolean => {
      const arrA = a || [];
      const arrB = b || [];
      if (arrA.length !== arrB.length) return false;
      if (arrA.length === 0 && arrB.length === 0) return true;
      const sortedA = [...arrA].sort();
      const sortedB = [...arrB].sort();
      return sortedA.every((val, index) => val === sortedB[index]);
   };

   // Check if form data has changed
   const hasChanges = useMemo(() => {
      const isEditMode = originalDataRef.current !== null;

      if (!isEditMode) {
         // For new job title, check if required fields are filled
         return !!(
            formData.name.trim() ||
            formData.description.trim() ||
            (formData.roles && formData.roles.length > 0)
         );
      }

      // For edit mode, compare with original data
      const original = originalDataRef.current;
      if (!original) return true;

      // Normalize strings for comparison
      const normalizeString = (str: string | undefined): string => {
         return (str || "").trim();
      };

      // Compare name
      if (normalizeString(formData.name) !== normalizeString(original.name)) {
         return true;
      }

      // Compare description
      if (
         normalizeString(formData.description) !==
         normalizeString(original.description)
      ) {
         return true;
      }

      // Compare roles (order-independent)
      const currentRoles = formData.roles || [];
      const originalRoles = original.roles || [];
      if (!arraysEqual(currentRoles, originalRoles)) {
         return true;
      }

      return false;
   }, [formData]);

   // Check if save button should be disabled
   const isSaveDisabled = useMemo(() => {
      // Only disable on the last step (Save button)
      if (currentStep !== STEPS.length) return false;

      // For new job title, require at least name
      if (!originalDataRef.current) {
         return !formData.name.trim();
      }

      // For edit mode, disable if nothing changed
      return !hasChanges;
   }, [currentStep, formData, hasChanges]);

   const { t } = useTranslation("settings");

   const steps = useMemo(() => {
      return STEPS.map((step: any) => ({
         ...step,
         title:
            step.key === "info"
               ? t("wizard.steps.basicInfo")
               : step.key === "review"
               ? t("wizard.steps.review")
               : step.title,
      }));
   }, [t]);

   return (
      <div className="flex flex-col h-full">
         <div className="flex flex-col xl:flex-row flex-1 overflow-hidden">
            {/* Left Sidebar - Steps */}
            <div className="w-full xl:w-auto xl:min-w-[500px] bg-bg-weak ps-4 sm:ps-6 md:ps-8 xl:ps-32 pe-4 sm:pe-6 pt-4 pb-4 flex flex-col">
               <StepIndicator
                  steps={steps}
                  currentStep={currentStep}
                  onStepChange={async (step) => {
                     if (step <= currentStep) {
                        setCurrentStep(step);
                        return;
                     }
                     setIsValidating(true);
                     const isValid = await validateStep();
                     setIsValidating(false);
                     if (isValid) {
                        setCurrentStep(step);
                     }
                  }}
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
                     {currentStep === 1 && (
                        <StepBasicInfo
                           formData={formData}
                           updateFormData={updateFormData}
                           availableRoles={availableRoles}
                           formRef={step1FormRef}
                        />
                     )}
                     {currentStep === 2 && (
                        <StepReview
                           formData={formData}
                           onNavigateToStep={setCurrentStep}
                           availableRoles={availableRoles}
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
               disabled={currentStep === 1 || isValidating}
               className="w-full md:w-auto px-4 sm:px-6 py-2.5 sm:py-3 text-text-strong bg-bg-weak hover:bg-border rounded-xl sm:rounded-2xl border-0! disabled:opacity-50 disabled:cursor-not-allowed">
               {t("wizard.back")}
            </Button>
            <Button
               variant="primary"
               onClick={handleNext}
               disabled={isSaveDisabled || isValidating}
               className="w-full md:w-auto px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
               {isValidating
                  ? t("wizard.validating")
                  : currentStep === STEPS.length
                  ? t("wizard.save")
                  : t("wizard.continue")}
            </Button>
         </div>
      </div>
   );
}

export default AddJobTitleWizard;
