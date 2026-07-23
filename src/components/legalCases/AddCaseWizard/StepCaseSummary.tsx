/** @format */

import GenericForm from "@/designSystem/GenericForm";
import { GenericFormField } from "@/designSystem/GenericFormField";
import { createCaseSchema } from "@/utilities/schemas/caseSchema";
import { UseFormReturn } from "react-hook-form";
import { useMemo, type MutableRefObject } from "react";
import { CaseFormData } from "./types";
import { useTranslation } from "@/hooks/useTranslation";

type StepCaseSummaryProps = {
   formData: CaseFormData;
   updateFormData: (field: keyof CaseFormData, value: unknown) => void;
   formRef?: MutableRefObject<UseFormReturn<any> | null>;
};

function StepCaseSummary({
   formData,
   updateFormData,
   formRef,
}: StepCaseSummaryProps) {
   const { t } = useTranslation("common");
   const caseSchema = useMemo(() => createCaseSchema(t), [t]);
   const maxLength = 200;

   return (
      <div className="w-full max-w-full">
         <div className="bg-background border rounded-xl sm:rounded-2xl border-border flex flex-col overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] w-full max-w-full sm:max-w-2xl md:max-w-full xl:max-w-[2400px] h-auto min-h-[500px] sm:min-h-[600px] md:min-h-[650px] xl:h-[720px] p-4 sm:p-5 md:p-6 gap-4 sm:gap-5 md:gap-6 xl:gap-8">
            {/* Header */}
            <div className="shrink-0">
               <h3 className="text-lg sm:text-xl font-semibold text-text-strong">
                  {t("legalCases.caseSummary.title")}
               </h3>
               <p className="mt-1 text-xs sm:text-sm text-text-soft">
                  {t("legalCases.caseSummary.description")}
               </p>
            </div>

            {/* Divider */}
            <div className="bg-bg-weak h-px w-full" />

            {/* Form Fields */}
            <GenericForm
               schema={caseSchema.pick(["summary"])}
               defaultValues={formData}
               onSubmit={() => {}}
               onFieldChange={updateFormData}
               showSubmitButton={false}
               mode="onChange"
               className="flex flex-col gap-1 flex-1"
               renderFields={(form) => {
                  if (formRef) {
                     formRef.current = form;
                  }

                  const summaryValue = form.watch("summary") || "";
                  const characterCount = summaryValue.length;

                  return (
                     <div className="flex flex-col gap-1 flex-1">
                        <label className="text-sm font-medium text-text-strong">
                           {t("legalCases.caseSummary.caseSummary")}{" "}
                           <span className="text-primary">*</span>
                        </label>
                        <div className="relative">
                           <GenericFormField
                              fieldConfig={{
                                 name: "summary",
                                 type: "textarea",
                                 label: "", // Label handled externally to match design with counter
                                 placeholder: t(
                                    "legalCases.caseSummary.summaryPlaceholder"
                                 ),
                                 required: true,
                              }}
                              form={form}
                              onFieldChange={(field, value) =>
                                 updateFormData(
                                    field as keyof CaseFormData,
                                    value
                                 )
                              }
                           />
                           {/* Character Counter */}
                           <div className="absolute bottom-3 right-3 flex items-center gap-1.5 pointer-events-none">
                              <span className="text-[11px] font-medium text-text-soft uppercase tracking-[0.22px]">
                                 {characterCount}/{maxLength}
                              </span>
                           </div>
                        </div>
                     </div>
                  );
               }}
            />
         </div>
      </div>
   );
}

export default StepCaseSummary;
