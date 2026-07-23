/** @format */

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "@/hooks/useTranslation";
import Button from "@/designSystem/Button";
import StepIndicator from "@/designSystem/StepIndicator";
import StepAssetInformation from "./AssetInformation/StepAssetInformation";
import StepReview from "./ReviewConfirm/StepReview";
import { type AddAssetWizardProps, type AssetFormData, STEPS } from "./types";
import { UseFormReturn } from "react-hook-form";
import type { MutableRefObject } from "react";
import { buildValidationSummaryItems } from "@/designSystem/GenericForm";

function AddAssetWizard({
   onSubmit,
   onCancel,
   onFormDataChange,
   initialData,
   assignedTo,
}: AddAssetWizardProps) {
   const { t } = useTranslation("settings");
   const [currentStep, setCurrentStep] = useState(1);
   const [isValidating, setIsValidating] = useState(false);
   const step1FormRef = useRef<UseFormReturn<any> | null>(null);

   // Initialize original data ref immediately if initialData is provided
   const getInitialFormData = (): AssetFormData => {
      return (
         initialData || {
            name: "",
            category: "",
            serial: "",
            condition: "",
            image: null,
         }
      );
   };

   const getInitialOriginalData = (): AssetFormData | null => {
      if (!initialData) return null;
      return {
         name: initialData.name,
         category: initialData.category || "",
         serial: initialData.serial || "",
         condition: initialData.condition || "",
         image: initialData.image || null,
      };
   };

   const [formData, setFormData] = useState<AssetFormData>(
      getInitialFormData()
   );
   const originalDataRef = useRef<AssetFormData | null>(
      getInitialOriginalData()
   );
   const initialDataKeyRef = useRef<string | null>(
      initialData
         ? `${initialData.name}-${initialData.category}-${initialData.serial}`
         : null
   );

   // Reset form data when initialData changes
   useEffect(() => {
      const currentKey = initialData
         ? `${initialData.name}-${initialData.category}-${initialData.serial}`
         : null;

      if (initialData && currentKey !== initialDataKeyRef.current) {
         setFormData(initialData);
         originalDataRef.current = {
            name: initialData.name,
            category: initialData.category || "",
            serial: initialData.serial || "",
            condition: initialData.condition || "",
            image: initialData.image || null,
         };
         initialDataKeyRef.current = currentKey;
         setCurrentStep(1);
      } else if (!initialData && initialDataKeyRef.current !== null) {
         setFormData({
            name: "",
            category: "",
            serial: "",
            condition: "",
            image: null,
         });
         originalDataRef.current = null;
         initialDataKeyRef.current = null;
         setCurrentStep(1);
      } else if (initialData && currentKey === initialDataKeyRef.current) {
         setFormData(initialData);
      }
   }, [initialData]);

   // Notify parent component of form data changes
   useEffect(() => {
      if (onFormDataChange) {
         onFormDataChange(formData);
      }
   }, [formData, onFormDataChange]);

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

   const validateCurrentStep = async () => {
      if (currentStep === 1) return validateStep(step1FormRef);
      return true;
   };

   const handleNext = async () => {
      setIsValidating(true);
      const isValid = await validateCurrentStep();
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

   const updateFormData = (field: keyof AssetFormData, value: unknown) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
   };

   // Check if form data has changed
   const hasChanges = useMemo(() => {
      const isEditMode = originalDataRef.current !== null;

      if (!isEditMode) {
         return !!(
            formData.name.trim() ||
            formData.category ||
            formData.serial.trim() ||
            formData.condition ||
            formData.image
         );
      }

      const original = originalDataRef.current;
      if (!original) return true;

      const normalizeString = (str: string | undefined): string => {
         return (str || "").trim();
      };

      if (normalizeString(formData.name) !== normalizeString(original.name)) {
         return true;
      }
      if (formData.category !== original.category) {
         return true;
      }
      if (
         normalizeString(formData.serial) !== normalizeString(original.serial)
      ) {
         return true;
      }
      if (formData.condition !== original.condition) {
         return true;
      }
      if (formData.image !== original.image) {
         return true;
      }

      return false;
   }, [formData]);

   const isImageUploaded = useCallback(() => {
      return (
         formData.image &&
         formData.image.fileId &&
         formData.image.token &&
         formData.image.fileUrl
      );
   }, [formData.image]);

   const isStepOneValid = () => {
      return (
         !!formData.name.trim() &&
         !!formData.category &&
         !!formData.serial.trim() &&
         !!formData.condition &&
         !!isImageUploaded()
      );
   };

   // Check if save/continue button should be disabled
   const isSaveDisabled = useMemo(() => {
      if (currentStep === 1) {
         // On first step, require name, category, serial, condition, and uploaded image with signed URL
         return (
            !formData.name.trim() ||
            !formData.category ||
            !formData.serial.trim() ||
            !formData.condition ||
            !isImageUploaded()
         );
      }

      // On last step (Save button)
      if (currentStep === STEPS.length) {
         if (!originalDataRef.current) {
            // For new asset, require all fields including uploaded image
            return (
               !formData.name.trim() ||
               !formData.category ||
               !formData.serial.trim() ||
               !formData.condition ||
               !isImageUploaded()
            );
         }
         // For edit mode, disable if nothing changed
         return !hasChanges;
      }

      return false;
   }, [currentStep, formData, hasChanges, isImageUploaded]);

   return (
      <div className="flex flex-col h-full">
         <div className="flex flex-col xl:flex-row flex-1 overflow-hidden">
            {/* Left Sidebar - Steps */}
            <div className="w-full xl:w-auto xl:min-w-[500px] bg-bg-weak ps-4 sm:ps-6 md:ps-8 xl:ps-32 pe-4 sm:pe-6 pt-4 pb-4 flex flex-col">
               <StepIndicator
                  steps={STEPS}
                  currentStep={currentStep}
                  onStepChange={(step) => {
                     if (step <= currentStep) {
                        setCurrentStep(step);
                        return;
                     }
                     setIsValidating(true);
                     const isValid = currentStep !== 1 || isStepOneValid();
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
                        <StepAssetInformation
                           formData={formData}
                           updateFormData={updateFormData}
                           formRef={step1FormRef}
                           assignedTo={assignedTo}
                        />
                     )}
                     {currentStep === 2 && (
                        <StepReview
                           formData={formData}
                           onNavigateToStep={setCurrentStep}
                        />
                     )}
                  </motion.div>
               </div>
            </div>
         </div>

         {/* Footer Actions */}
         <div className="flex items-center justify-end gap-3 px-5 py-5 border-t border-border">
            <Button
               variant="secondary"
               onClick={handleBack}
               disabled={isValidating}
               className="!px-4 !py-2.5 !text-sm !text-stroke-sub-300 !bg-bg-weak hover:!bg-bg-weak/80 !rounded-xl !border-0">
               {t("assets.addWizard.back")}
            </Button>
            <Button
               variant="primary"
               onClick={handleNext}
               disabled={isSaveDisabled || isValidating}
               className={`!px-5 !py-2.5 !text-sm !rounded-xl !border-0 ${
                  isSaveDisabled
                     ? "!text-text-soft !bg-bg-weak hover:!bg-bg-weak/80"
                     : "!bg-primary"
               } disabled:!opacity-100 disabled:!cursor-not-allowed transition-all`}>
               {isValidating
                  ? "Validating..."
                  : currentStep === STEPS.length
                  ? t("assets.addWizard.save")
                  : t("assets.addWizard.continue")}
            </Button>
         </div>
      </div>
   );
}

export default AddAssetWizard;
