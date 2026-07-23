/** @format */

import GenericForm, { FieldConfig } from "@/designSystem/GenericForm";
import { GenericFormField } from "@/designSystem/GenericFormField";
import { createCaseBasicsSchema } from "@/utilities/schemas/caseSchema";
import type { CaseFormData } from "./types";
import { UseFormReturn } from "react-hook-form";
import { useMemo, type MutableRefObject } from "react";
import { useListLegalCaseTypes } from "@/hooks/legalCases/legalCase.queries";
import { useTranslation } from "@/hooks/useTranslation";

type StepCaseBasicsProps = {
   formData: CaseFormData;
   updateFormData: (field: keyof CaseFormData, value: unknown) => void;
   formRef?: MutableRefObject<UseFormReturn<any> | null>;
};

function StepCaseBasics({
   formData,
   updateFormData,
   formRef,
}: StepCaseBasicsProps) {
   const { t } = useTranslation("common");
   const caseBasicsSchema = useMemo(() => createCaseBasicsSchema(t), [t]);
   const { data: caseTypes, isLoading: isCaseTypesLoading } =
      useListLegalCaseTypes();
   const caseTypeOptions =
      caseTypes?.map((type) => ({
         id: String(type.type_id),
         label: type.name,
      })) || [];
   const caseTypeHelperText = isCaseTypesLoading
      ? t("companySettings.caseTypes.helpers.loading")
      : !caseTypeOptions.length
      ? t("companySettings.caseTypes.helpers.empty")
      : undefined;

   return (
      <div className="w-full max-w-full">
         <div className="bg-background border rounded-xl sm:rounded-2xl border-border flex flex-col overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] w-full max-w-full sm:max-w-2xl md:max-w-full xl:max-w-[2400px] h-auto min-h-[500px] sm:min-h-[600px] md:min-h-[650px] xl:h-[720px] p-4 sm:p-5 md:p-6 gap-4 sm:gap-5 md:gap-6 xl:gap-8">
            {/* Header */}
            <div className="shrink-0">
               <h3 className="text-lg sm:text-xl font-semibold text-text-strong">
                  {t("legalCases.caseBasics.title")}
               </h3>
               <p className="mt-1 text-xs sm:text-sm text-text-soft">
                  {t("legalCases.caseBasics.description")}
               </p>
            </div>

            {/* Divider */}
            <div className="bg-bg-weak h-px w-full" />

            {/* Form Fields */}
            <GenericForm
               schema={caseBasicsSchema}
               defaultValues={formData}
               onSubmit={() => {}} // Not used - navigation handled by wizard
               onFieldChange={updateFormData}
               showSubmitButton={false}
               mode="onChange"
               className="space-y-4 flex-1"
               renderFields={(form) => {
                  if (formRef) {
                     formRef.current = form;
                  }
                  const fields: FieldConfig[] = [
                     {
                        name: "title",
                        type: "text",
                        label: t("legalCases.caseBasics.caseTitle"),
                        placeholder: t(
                           "legalCases.caseBasics.caseTitlePlaceholder"
                        ),
                        required: true,
                     },
                     {
                        name: "case_number",
                        type: "text",
                        label: t("legalCases.caseBasics.caseNumber"),
                        placeholder: t(
                           "legalCases.caseBasics.caseNumberPlaceholder"
                        ),
                        required: false,
                     },
                     {
                        name: "client_name",
                        type: "text",
                        label: t("legalCases.caseBasics.clientName"),
                        placeholder: t(
                           "legalCases.caseBasics.clientNamePlaceholder"
                        ),
                        required: true,
                     },
                     {
                        name: "case_type_id",
                        type: "select",
                        label: t("legalCases.caseBasics.caseType"),
                        placeholder: t(
                           "legalCases.caseBasics.caseTypePlaceholder"
                        ),
                        required: true,
                        options: caseTypeOptions,
                        disabled: isCaseTypesLoading || !caseTypeOptions.length,
                        helperText: caseTypeHelperText,
                     },
                     {
                        name: "status",
                        type: "select",
                        label: t("legalCases.caseBasics.status"),
                        placeholder: t(
                           "legalCases.caseBasics.statusPlaceholder"
                        ),
                        required: true,
                        options: [
                           {
                              id: "Open",
                              label: t(
                                 "legalCases.caseBasics.statusOptions.open"
                              ),
                           },
                           {
                              id: "In Progress",
                              label: t(
                                 "legalCases.caseBasics.statusOptions.inProgress"
                              ),
                           },
                           {
                              id: "Closed",
                              label: t(
                                 "legalCases.caseBasics.statusOptions.closed"
                              ),
                           },
                           {
                              id: "On Hold",
                              label: t(
                                 "legalCases.caseBasics.statusOptions.onHold"
                              ),
                           },
                           {
                              id: "Cancelled",
                              label: t(
                                 "legalCases.caseBasics.statusOptions.cancelled"
                              ),
                           },
                        ],
                     },
                     {
                        name: "dates",
                        type: "custom",
                        render: () => (
                           <div className="flex gap-4">
                              <div className="flex-1">
                                 <GenericFormField
                                    fieldConfig={{
                                       name: "start_date",
                                       type: "date",
                                       label: t(
                                          "legalCases.caseBasics.startDate"
                                       ),
                                       placeholder: t(
                                          "legalCases.caseBasics.startDatePlaceholder"
                                       ),
                                       required: false,
                                    }}
                                    form={form}
                                    onFieldChange={(field, value) =>
                                       updateFormData(
                                          field as keyof CaseFormData,
                                          value
                                       )
                                    }
                                 />
                              </div>
                              <div className="flex-1">
                                 <GenericFormField
                                    fieldConfig={{
                                       name: "end_date",
                                       type: "date",
                                       label: t(
                                          "legalCases.caseBasics.endDate"
                                       ),
                                       placeholder: t(
                                          "legalCases.caseBasics.endDatePlaceholder"
                                       ),
                                       required: false,
                                    }}
                                    form={form}
                                    onFieldChange={(field, value) =>
                                       updateFormData(
                                          field as keyof CaseFormData,
                                          value
                                       )
                                    }
                                 />
                              </div>
                           </div>
                        ),
                     },
                  ];
                  return fields.map((fieldConfig) => (
                     <GenericFormField
                        key={fieldConfig.name}
                        fieldConfig={fieldConfig}
                        form={form}
                        onFieldChange={(field, value) =>
                           updateFormData(field as keyof CaseFormData, value)
                        }
                     />
                  ));
               }}
            />
         </div>
      </div>
   );
}

export default StepCaseBasics;
