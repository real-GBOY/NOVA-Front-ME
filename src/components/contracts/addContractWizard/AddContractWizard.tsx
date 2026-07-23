/** @format */

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Button from "@/designSystem/Button";
import StepIndicator from "@/designSystem/StepIndicator";
import ConfirmModal from "@/designSystem/ConfirmModal";
import LoadingOverlay from "@/designSystem/LoadingOverlay";
import { UseFormReturn } from "react-hook-form";
import type { MutableRefObject } from "react";
import { buildValidationSummaryItems } from "@/designSystem/GenericForm";
import {
   STEPS,
   type AddContractWizardProps,
   type ContractFormData,
} from "./types";
import StepAssignMember from "./StepAssignMember";
import StepCompensationAssets from "./StepCompensationAssets";
import StepPolicyLimits from "./StepPolicyLimits";
import StepReview from "./StepReview";
import { useTranslation } from "@/hooks/useTranslation";
import { useContracts } from "@/hooks/contracts/useContracts";
import type { CreateContractRequest } from "@/services/contractService";
import { filterReadyUploads } from "@/utils/uploadValidation";

function AddContractWizard({
   onClose,
   onComplete,
   onFormDataChange,
   initialData,
   availableMembers = [],
   availableContractTypes = [],
   availableSalaryCycles = [],
   availableAssets = [],
}: AddContractWizardProps) {
   const { t } = useTranslation("common");
   const [currentStep, setCurrentStep] = useState(1);
   const [showExitConfirm, setShowExitConfirm] = useState(false);
   const [isSubmitting, setIsSubmitting] = useState(false);
   const [isValidating, setIsValidating] = useState(false);

   const step1FormRef = useRef<UseFormReturn<ContractFormData> | null>(null);
   const step2FormRef = useRef<UseFormReturn<ContractFormData> | null>(null);
   const step3FormRef = useRef<UseFormReturn<ContractFormData> | null>(null);

   // Initialize contract mutation
   const { useCreate } = useContracts();
   const createContract = useCreate();
   const [formData, setFormData] = useState<ContractFormData>({
      contractName: "",
      memberId: "",
      contractType: "",
      startDate: "",
      endDate: "",
      attachedDocuments: [],
      baseSalary: "",
      salaryCurrency: "AED",
      salaryCycle: "",
      overtimeRate: "",
      overtimeCurrency: "AED",
      assets: [],
      noticePeriod: "30",
      sickLeave: "90",
      casualLeave: "0",
      annualLeave: "30",
      absenceLimit: "7",
      ...initialData,
   });

   // Create steps with translated titles
   const steps = STEPS.map((step) => ({
      ...step,
      title:
         step.key === "assignMember"
            ? t("contracts.wizard.steps.assignMember")
            : step.key === "compensationAssets"
            ? t("contracts.wizard.steps.compensationAssets")
            : step.key === "policyLimits"
            ? t("contracts.wizard.steps.policyLimits")
            : t("contracts.wizard.steps.review"),
   }));

   const updateFormData = (field: keyof ContractFormData, value: unknown) => {
      setFormData((prev) => ({
         ...prev,
         [field]: value,
      }));
   };

   useEffect(() => {
      if (onFormDataChange) {
         onFormDataChange(formData);
      }
   }, [formData, onFormDataChange]);

   // Check if any data has been entered
   const hasData = () => {
      return (
         formData.contractName !== "" ||
         formData.memberId !== "" ||
         formData.contractType !== "" ||
         formData.startDate !== "" ||
         formData.endDate !== "" ||
         (formData.attachedDocuments &&
            formData.attachedDocuments.length > 0) ||
         formData.baseSalary !== "" ||
         formData.salaryCycle !== "" ||
         formData.overtimeRate !== "" ||
         (formData.assets && formData.assets.length > 0) ||
         formData.noticePeriod !== "" ||
         formData.sickLeave !== "" ||
         formData.casualLeave !== "" ||
         formData.annualLeave !== "" ||
         formData.absenceLimit !== ""
      );
   };

   const handleCloseAttempt = () => {
      if (hasData()) {
         setShowExitConfirm(true);
      } else {
         if (onClose) onClose();
      }
   };

   const handleConfirmExit = () => {
      setShowExitConfirm(false);
      if (onClose) onClose();
   };

   const validateStep = async (
      formRef: MutableRefObject<UseFormReturn<ContractFormData> | null>
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
      if (currentStep === 1) {
         return validateStep(step1FormRef);
      }
      if (currentStep === 2) {
         return validateStep(step2FormRef);
      }
      if (currentStep === 3) {
         return validateStep(step3FormRef);
      }
      return true;
   };

   const handleNext = async () => {
      setIsValidating(true);
      const isValid = await validateCurrentStep();
      setIsValidating(false);
      if (!isValid) return;
      if (currentStep < steps.length) {
         setCurrentStep(currentStep + 1);
      } else {
         handleSubmit();
      }
   };

   const handleBack = () => {
      if (currentStep > 1) {
         setCurrentStep(currentStep - 1);
      } else {
         handleCloseAttempt();
      }
   };

   const handleSubmit = async () => {
      try {
         setIsSubmitting(true);

         const latestAssignStepValues =
            step1FormRef.current?.getValues?.() as Partial<ContractFormData>;
         const attachedDocuments =
            latestAssignStepValues?.attachedDocuments ||
            formData.attachedDocuments ||
            [];

         // Transform attachments to only include required fields
         const attachments = filterReadyUploads(attachedDocuments)
            .map((doc) => ({
               fileId: doc.fileId,
               token: doc.token,
               purpose: doc.purpose || "contract",
            }));

         // Build contract request payload
         const payload: CreateContractRequest = {
            core: {
               contract_name: formData.contractName,
               employee_id: Number(formData.memberId),
               contract_type: formData.contractType,
               start_date: formData.startDate,
               end_date: formData.endDate || null,
               attachments,
            },
            compensation: {
               salary: formData.baseSalary
                  ? Number(formData.baseSalary)
                  : undefined,
               salary_cycle: formData.salaryCycle || undefined,
               overtime_hourly_rate: formData.overtimeRate
                  ? Number(formData.overtimeRate)
                  : undefined,
               currency: formData.salaryCurrency || "AED",
            },
            assets: formData.assets?.map((assetId) => ({
               asset_id: Number(assetId),
            })),
            vacations: {
               notice_period_days: formData.noticePeriod
                  ? Number(formData.noticePeriod)
                  : undefined,
               sick_leave_days: formData.sickLeave
                  ? Number(formData.sickLeave)
                  : undefined,
               casual_leave_days: formData.casualLeave
                  ? Number(formData.casualLeave)
                  : undefined,
               annual_leave_days: formData.annualLeave
                  ? Number(formData.annualLeave)
                  : undefined,
               absence_limit_days: formData.absenceLimit
                  ? Number(formData.absenceLimit)
                  : undefined,
            },
         };

         await createContract.mutateAsync(payload);

         // Call the onComplete callback if provided
         if (onComplete) {
            await onComplete(formData);
         }

         setIsSubmitting(false);
      } catch (error) {
         console.error("❌ Error creating contract:", error);
         setIsSubmitting(false);
         // You might want to show an error toast here
      }
   };

   const handleNavigateToStep = async (step: number) => {
      if (step < 1 || step > steps.length) return;
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
   };

   // Notify parent when form data changes (if needed)
   useEffect(() => {
      // You can add external state sync logic here if needed
   }, [formData]);

   return (
      <div className="flex flex-col h-full">
         <div className="flex flex-col xl:flex-row flex-1 overflow-hidden">
            {/* Left Sidebar - Steps */}
            <div className="w-full xl:w-auto xl:min-w-[500px] bg-bg-weak ps-4 sm:ps-6 md:ps-8 xl:ps-32 pe-4 sm:pe-6 pt-4 pb-4 flex flex-col">
               <StepIndicator
                  steps={steps}
                  currentStep={currentStep}
                  onStepChange={handleNavigateToStep}
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
                        <StepAssignMember
                           formData={formData}
                           updateFormData={updateFormData}
                           availableMembers={availableMembers}
                           availableContractTypes={availableContractTypes}
                           formRef={step1FormRef}
                        />
                     )}
                     {currentStep === 2 && (
                        <StepCompensationAssets
                           formData={formData}
                           updateFormData={updateFormData}
                           availableSalaryCycles={availableSalaryCycles}
                           availableAssets={availableAssets}
                           formRef={step2FormRef}
                        />
                     )}
                     {currentStep === 3 && (
                        <StepPolicyLimits
                           formData={formData}
                           updateFormData={updateFormData}
                           formRef={step3FormRef}
                        />
                     )}
                     {currentStep === 4 && (
                        <StepReview
                           formData={formData}
                           onNavigateToStep={handleNavigateToStep}
                           availableMembers={availableMembers}
                           availableContractTypes={availableContractTypes}
                           availableSalaryCycles={availableSalaryCycles}
                           availableAssets={availableAssets}
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
               className="w-full md:w-auto px-4 sm:px-6 py-2.5 sm:py-3 text-text-strong bg-bg-weak hover:bg-border rounded-xl sm:rounded-2xl border-0!">
               {t("actions.back")}
            </Button>
            <Button
               variant="primary"
               onClick={handleNext}
               disabled={isSubmitting || isValidating}
               className="w-full md:w-auto px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
               {isSubmitting
                  ? t("members.wizard.buttons.processing")
                  : isValidating
                  ? t("members.wizard.buttons.validating")
                  : currentStep === steps.length
                  ? t("actions.createContract")
                  : t("actions.next")}
            </Button>
         </div>

         {/* Exit Confirmation Modal */}
         <ConfirmModal
            isOpen={showExitConfirm}
            onClose={() => setShowExitConfirm(false)}
            onConfirm={handleConfirmExit}
            title={t("contracts.exitConfirmation.title")}
            description={t("contracts.exitConfirmation.description")}
            confirmText={t("contracts.exitConfirmation.confirm")}
            cancelText={t("contracts.exitConfirmation.cancel")}
            variant="primary"
            icon="exclamation"
         />

         <LoadingOverlay
            isLoading={isSubmitting}
            message={t("actions.creatingContract", "Creating contract...")}
         />
      </div>
   );
}

export default AddContractWizard;
