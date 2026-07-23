/** @format */

import { useTranslation } from "@/hooks/useTranslation";
import GenericForm from "@/designSystem/GenericForm";
import { GenericFormField } from "@/designSystem/GenericFormField";
import { createContractSchema } from "@/utilities/schemas/contractSchema";
import type { ContractFormData } from "./types";
import type { FieldConfig } from "@/designSystem/GenericForm";
import { UseFormReturn } from "react-hook-form";
import type { MutableRefObject } from "react";
import { useMemo } from "react";

type StepPolicyLimitsProps = {
   formData: ContractFormData;
   updateFormData: (field: keyof ContractFormData, value: unknown) => void;
   formRef?: MutableRefObject<UseFormReturn<any> | null>;
};

// Component for number input with "Days" suffix - defined outside to prevent re-creation
const DaysInput = ({
   label,
   value,
   onChange,
   placeholder,
   required = false,
   suffix = "Days",
}: {
   label: string;
   value: string | undefined;
   onChange: (value: string) => void;
   placeholder?: string;
   required?: boolean;
   suffix?: string;
}) => (
   <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-text-strong">
         {label}
         {required && <span className="text-primary"> *</span>}
      </label>

      <div className="relative flex items-stretch rounded-lg border border-border bg-background overflow-hidden">
         {/* Number Input */}
         <div className="flex-1">
            <input
               type="text"
               value={value || ""}
               onChange={(e) => {
                  const newValue = e.target.value.replace(/[^0-9]/g, "");
                  onChange(newValue);
               }}
               placeholder={placeholder}
               className="w-full px-3 py-2.5 text-sm text-text-strong placeholder:text-text-soft bg-transparent outline-none"
            />
         </div>

         {/* Days Label */}
         <div className="flex items-center border-l border-border bg-background px-3 py-2.5">
            <span className="text-sm text-text-strong">{suffix}</span>
         </div>
      </div>
   </div>
);

function StepPolicyLimits({
   formData,
   updateFormData,
   formRef,
}: StepPolicyLimitsProps) {
   const { t } = useTranslation("common");
   const contractSchema = useMemo(() => createContractSchema(t), [t]);

   const daysLabel = t("contracts.policyLimits.days");

   const fields: FieldConfig[] = [
      {
         name: "noticePeriod",
         type: "custom",
         render: () => (
            <DaysInput
               label={t("contracts.policyLimits.noticePeriod")}
               value={formData.noticePeriod}
               onChange={(value) => updateFormData("noticePeriod", value)}
               placeholder={t("contracts.policyLimits.enterNoticePeriod")}
               suffix={daysLabel}
               required
            />
         ),
      },
      {
         name: "sickLeave",
         type: "custom",
         render: () => (
            <DaysInput
               label={t("contracts.policyLimits.sickLeave")}
               value={formData.sickLeave}
               onChange={(value) => updateFormData("sickLeave", value)}
               placeholder={t("contracts.policyLimits.enterSickLeave")}
               suffix={daysLabel}
               required
            />
         ),
      },
      {
         name: "casualLeave",
         type: "custom",
         render: () => (
            <DaysInput
               label={t("contracts.policyLimits.casualLeave")}
               value={formData.casualLeave}
               onChange={(value) => updateFormData("casualLeave", value)}
               placeholder={t("contracts.policyLimits.enterCasualLeave")}
               suffix={daysLabel}
               required
            />
         ),
      },
      {
         name: "annualLeave",
         type: "custom",
         render: () => (
            <DaysInput
               label={t("contracts.policyLimits.annualLeave")}
               value={formData.annualLeave}
               onChange={(value) => updateFormData("annualLeave", value)}
               placeholder={t("contracts.policyLimits.enterAnnualLeave")}
               suffix={daysLabel}
               required
            />
         ),
      },
      {
         name: "absenceLimit",
         type: "custom",
         render: () => (
            <DaysInput
               label={t("contracts.policyLimits.absenceLimit")}
               value={formData.absenceLimit}
               onChange={(value) => updateFormData("absenceLimit", value)}
               placeholder={t("contracts.policyLimits.enterAbsenceLimit")}
               suffix={daysLabel}
               required
            />
         ),
      },
   ];

   return (
      <div className="bg-background border rounded-2xl border-border flex flex-col w-full p-6 gap-8">
         <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
               <h2 className="text-lg font-medium text-text-strong tracking-tight">
                  {t("contracts.policyLimits.title")}
               </h2>
               <p className="text-sm text-text-sub tracking-tight">
                  {t("contracts.policyLimits.description")}
               </p>
            </div>

            <div className="bg-bg-weak h-px w-full" />

            <GenericForm
               schema={contractSchema}
               defaultValues={formData}
               formData={formData}
               onSubmit={() => {}}
               onFieldChange={updateFormData}
               showSubmitButton={false}
               mode="onChange"
               renderFields={(form) => {
                  if (formRef) {
                     formRef.current = form;
                  }
                  return fields.map((fieldConfig) => (
                     <GenericFormField
                        key={fieldConfig.name}
                        fieldConfig={fieldConfig}
                        form={form}
                        onFieldChange={(field, value) =>
                           updateFormData(
                              field as keyof ContractFormData,
                              value
                           )
                        }
                     />
                  ));
               }}
            />
         </div>
      </div>
   );
}

export default StepPolicyLimits;
