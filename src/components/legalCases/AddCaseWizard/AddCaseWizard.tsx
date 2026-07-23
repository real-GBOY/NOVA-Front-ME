/** @format */

import { useState, useEffect, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import Button from "@/designSystem/Button";
import StepIndicator from "@/designSystem/StepIndicator";
import StepCaseBasics from "./StepCaseBasics";
import StepPeopleAndFiles from "./StepPeopleAndFiles";
import StepCaseSummary from "./StepCaseSummary";
import { type AddCaseWizardProps, type CaseFormData } from "./types";
import { createCaseSchema } from "@/utilities/schemas/caseSchema";
import { UseFormReturn } from "react-hook-form";
import { buildValidationSummaryItems } from "@/designSystem/GenericForm";
import toast from "@/utilities/toast";
import ConfirmModal from "@/designSystem/ConfirmModal";
import { useTranslation } from "@/hooks/useTranslation";

function AddCaseWizard({
   onSubmit,
   onCancel,
   onFormDataChange,
   initialData,
}: AddCaseWizardProps) {
   const { t } = useTranslation("common");
   const caseSchema = useMemo(() => createCaseSchema(t), [t]);

   const STEPS = useMemo(
      () => [
         { id: 1, title: t("legalCases.wizard.steps.basics"), key: "basics" },
         { id: 2, title: t("legalCases.wizard.steps.people"), key: "people" },
         { id: 3, title: t("legalCases.wizard.steps.summary"), key: "summary" },
      ],
      [t]
   );

   const [currentStep, setCurrentStep] = useState(1);
   const [isValidating, setIsValidating] = useState(false);
   const [showExitConfirm, setShowExitConfirm] = useState(false);
   const step1FormRef = useRef<UseFormReturn<any> | null>(null);
   const step3FormRef = useRef<UseFormReturn<any> | null>(null);

   // Initialize form data
   const getInitialFormData = (): CaseFormData => {
      return (
         initialData || {
            title: "",
            case_type_id: undefined,
            case_number: "",
            client_name: "",
            status: "Open",
            people: [],
            files: [],
            summary: "",
         }
      );
   };

   const [formData, setFormData] = useState<CaseFormData>(getInitialFormData());

   // Reset form data when initialData changes
   useEffect(() => {
      if (initialData) {
         setFormData(initialData);
         setCurrentStep(1);
      } else {
         setFormData({
            title: "",
            case_type_id: undefined,
            case_number: "",
            client_name: "",
            status: "Open",
            people: [],
            files: [],
            summary: "",
         });
         setCurrentStep(1);
      }
   }, [initialData]);

   // Notify parent component of form data changes
   useEffect(() => {
      if (onFormDataChange) {
         onFormDataChange(formData);
      }
   }, [formData, onFormDataChange]);

   const validateStepOne = async () => {
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

   const validateStepTwo = async () => {
      try {
         await caseSchema
            .pick(["people", "files"])
            .validate(
               { people: formData.people, files: formData.files },
               { abortEarly: false }
            );
         return true;
      } catch (error) {
         if (error instanceof Error) {
            toast.error(t("legalCases.wizard.messages.validationError"));
         }
         return false;
      }
   };

   const validateStepThree = async () => {
      if (!step3FormRef.current) return true;
      let isValid = false;
      await step3FormRef.current.handleSubmit(
         () => {
            isValid = true;
         },
         (errors) => {
            isValid = false;
            const { items } = buildValidationSummaryItems(errors, {}, {});
            if (items[0]) {
               step3FormRef.current?.setFocus(items[0].field as never);
            }
         }
      )();
      return isValid;
   };

   const validateCurrentStep = async (): Promise<boolean> => {
      if (currentStep === 1) {
         return validateStepOne();
      }
      if (currentStep === 2) {
         return validateStepTwo();
      }
      if (currentStep === 3) {
         return validateStepThree();
      }
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
         const baseline = initialData || {
            title: "",
            case_type_id: undefined,
            case_number: "",
            client_name: "",
            people: [],
            files: [],
            summary: "",
         };
         const isDirty =
            formData.title !== baseline.title ||
            formData.case_type_id !== baseline.case_type_id ||
            formData.case_number !== baseline.case_number ||
            formData.client_name !== baseline.client_name ||
            formData.summary !== baseline.summary ||
            (formData.people?.length || 0) !== (baseline.people?.length || 0) ||
            (formData.files?.length || 0) !== (baseline.files?.length || 0);

         if (isDirty) {
            setShowExitConfirm(true);
            return;
         }

         onCancel({ skipConfirm: true });
      }
   };

   const updateFormData = (field: keyof CaseFormData, value: unknown) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
   };

   // Check if save button should be disabled
   const isSaveDisabled = useMemo(() => {
      return false;
   }, []);

   return (
      <div className="flex flex-col h-full">
         <div className="flex flex-col xl:flex-row flex-1 overflow-hidden">
            {/* Left Sidebar - Steps */}
            <div className="w-full xl:w-auto xl:min-w-[500px] bg-bg-weak ps-4 sm:ps-6 md:ps-8 xl:ps-32 pe-4 sm:pe-6 pt-4 pb-4 flex flex-col">
               <StepIndicator
                  steps={STEPS}
                  currentStep={currentStep}
                  onStepChange={async (step) => {
                     if (step <= currentStep) {
                        setCurrentStep(step);
                        return;
                     }
                     setIsValidating(true);
                     const isValid = await validateCurrentStep();
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
                        <StepCaseBasics
                           formData={formData}
                           updateFormData={updateFormData}
                           formRef={step1FormRef}
                        />
                     )}
                     {currentStep === 2 && (
                        <StepPeopleAndFiles
                           formData={formData}
                           updateFormData={updateFormData}
                        />
                     )}
                     {currentStep === 3 && (
                        <StepCaseSummary
                           formData={formData}
                           updateFormData={updateFormData}
                           formRef={step3FormRef}
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
               disabled={isValidating}
               className="w-full md:w-auto px-4 sm:px-6 py-2.5 sm:py-3 text-text-strong bg-bg-weak hover:bg-border rounded-xl sm:rounded-2xl !border-0">
               {t("legalCases.wizard.buttons.back")}
            </Button>
            <Button
               variant="primary"
               onClick={handleNext}
               disabled={isSaveDisabled || isValidating}
               className="w-full md:w-auto px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
               {isValidating
                  ? t("legalCases.wizard.buttons.validating")
                  : currentStep === STEPS.length
                  ? t("legalCases.wizard.buttons.createCase")
                  : t("legalCases.wizard.buttons.continue")}
            </Button>
         </div>

         <ConfirmModal
            isOpen={showExitConfirm}
            onClose={() => setShowExitConfirm(false)}
            onConfirm={() => {
               setShowExitConfirm(false);
               onCancel({ skipConfirm: true });
            }}
            title={t("unsavedChanges.title")}
            description={t("unsavedChanges.description")}
            confirmText={t("unsavedChanges.confirm")}
            cancelText={t("unsavedChanges.cancel")}
            variant="primary"
            icon="exclamation"
         />
      </div>
   );
}

export default AddCaseWizard;
