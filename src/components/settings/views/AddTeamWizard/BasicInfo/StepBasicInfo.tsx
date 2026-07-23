/** @format */

import GenericForm from "@/designSystem/GenericForm";
import { GenericFormField } from "@/designSystem/GenericFormField";
import { getTeamSchema } from "@/utilities/schemas/teamSchema";
import { TeamFormData, MAX_DESCRIPTION_LENGTH } from "../types";
import SearchableMultiSelect from "@/designSystem/SearchableMultiSelect";
import { UseFormReturn } from "react-hook-form";
import { type MutableRefObject, useMemo } from "react";
import { useTranslation } from "@/hooks/useTranslation";

type StepBasicInfoProps = {
   formData: TeamFormData;
   updateFormData: (field: keyof TeamFormData, value: unknown) => void;
   availableJobTitles?: { id: string; title: string }[];
   formRef?: MutableRefObject<UseFormReturn<any> | null>;
};

function StepBasicInfo({
   formData,
   updateFormData,
   availableJobTitles = [],
   formRef,
}: StepBasicInfoProps) {
   const selectedJobTitles = availableJobTitles.filter((jobTitle) =>
      formData.jobTitles?.includes(jobTitle.id)
   );

   const { t } = useTranslation("settings");
   const teamSchema = useMemo(() => getTeamSchema(t), [t]);

   const fields = useMemo(
      () => [
         {
            name: "name",
            type: "text" as const,
            label: t("wizard.team.teamName"),
            placeholder: t("wizard.team.teamNamePlaceholder"),
            required: true,
         },
         {
            name: "description",
            type: "textarea" as const,
            label: t("wizard.team.teamDescription"),
            placeholder: t("wizard.team.teamDescriptionPlaceholder"),
            rows: 9,
            maxLength: MAX_DESCRIPTION_LENGTH,
         },
         {
            name: "jobTitles",
            type: "custom" as const,
            label: t("wizard.team.jobTitleLabel"),
            render: () => (
               <SearchableMultiSelect
                  label={t("wizard.team.jobTitleLabel")}
                  placeholder={t("wizard.team.searchJobTitles")}
                  selectedItems={selectedJobTitles.map((j) => ({
                     id: j.id,
                     label: j.title,
                  }))}
                  availableItems={availableJobTitles.map((j) => ({
                     id: j.id,
                     label: j.title,
                  }))}
                  onChange={(items) =>
                     updateFormData(
                        "jobTitles",
                        items.map((i) => i.id)
                     )
                  }
                  optional
               />
            ),
         },
      ],
      [t, selectedJobTitles, availableJobTitles, updateFormData]
   );

   return (
      <div className="w-full max-w-full">
         <div className="bg-background border rounded-xl sm:rounded-2xl border-border flex flex-col overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] w-full max-w-full sm:max-w-2xl md:max-w-full xl:max-w-[2400px] h-auto min-h-[500px] sm:min-h-[600px] md:min-h-[650px] xl:h-[720px] p-4 sm:p-5 md:p-6 gap-4 sm:gap-5 md:gap-6 xl:gap-8">
            {/* Team Information Section */}
            <div className="space-y-4 sm:space-y-5">
               <div className="shrink-0">
                  <h3 className="text-lg sm:text-xl font-semibold text-text-strong">
                     {t("wizard.team.title")}
                  </h3>
                  <p className="mt-1 text-xs sm:text-sm text-text-soft">
                     {t("wizard.team.subtitle")}
                  </p>
               </div>

               <GenericForm
                  schema={teamSchema}
                  defaultValues={formData}
                  onSubmit={() => {}} // Not used - navigation handled by wizard
                  onFieldChange={updateFormData}
                  showSubmitButton={false}
                  mode="onChange"
                  className="space-y-3"
                  fields={fields}
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
                              updateFormData(field as keyof TeamFormData, value)
                           }
                        />
                     ));
                  }}
               />
            </div>
         </div>

         {/* ...existing code... */}
      </div>
   );
}

export default StepBasicInfo;
