/** @format */

import { useTranslation } from "@/hooks/useTranslation";
import GenericForm from "@/designSystem/GenericForm";
import { GenericFormField } from "@/designSystem/GenericFormField";
import { createContractSchema } from "@/utilities/schemas/contractSchema";
import type { ContractFormData } from "./types";
import type { FieldConfig } from "@/designSystem/GenericForm";
import { UseFormReturn } from "react-hook-form";
import type { MutableRefObject } from "react";
import SearchableMultiSelect, {
   type DropdownItem,
} from "@/designSystem/SearchableMultiSelect";
import { useMemo } from "react";

type StepCompensationAssetsProps = {
   formData: ContractFormData;
   updateFormData: (field: keyof ContractFormData, value: unknown) => void;
   availableSalaryCycles: Array<{ id: string; label: string }>;
   availableAssets: Array<{ id: string; label: string; avatar?: string }>;
   formRef?: MutableRefObject<UseFormReturn<any> | null>;
};

function StepCompensationAssets({
   formData,
   updateFormData,
   availableSalaryCycles,
   formRef,
}: StepCompensationAssetsProps) {
   const { t } = useTranslation("common");
   const contractSchema = useMemo(() => createContractSchema(t), [t]);

   // Handle salary cycle selection

   // Handle salary cycle selection
   const selectedSalaryCycle = availableSalaryCycles.find(
      (sc) => sc.id === formData.salaryCycle
   );
   const handleSalaryCycleChange = (items: DropdownItem[]) => {
      if (items.length > 0) {
         updateFormData("salaryCycle", items[0].id);
      } else {
         updateFormData("salaryCycle", "");
      }
   };

   const fields: FieldConfig[] = [
      {
         name: "compensationHeader",
         type: "custom",
         render: () => (
            <div className="flex flex-col gap-2">
               <h2 className="text-lg font-medium text-text-strong tracking-tight">
                  {t("contracts.compensation.title")}
               </h2>
               <p className="text-sm text-text-sub tracking-tight">
                  {t("contracts.compensation.description")}
               </p>
            </div>
         ),
      },
      {
         name: "divider1",
         type: "custom",
         render: () => <div className="h-px bg-bg-weak" />,
      },
      {
         name: "baseSalary",
         type: "currency",
         label: t("contracts.compensation.baseSalary"),
         placeholder: t("contracts.compensation.baseSalaryPlaceholder"),
         currencyIconSrc: "/icons/dirham.png",
         currencySuffix: "AED",
      },
      {
         name: "salaryCycle",
         type: "custom",
         render: () => (
            <SearchableMultiSelect
               label={t("contracts.compensation.salaryCycle")}
               placeholder={t("contracts.compensation.selectSalaryCycle")}
               selectedItems={selectedSalaryCycle ? [selectedSalaryCycle] : []}
               availableItems={availableSalaryCycles}
               onChange={handleSalaryCycleChange}
               singleSelect
            />
         ),
      },
      {
         name: "overtimeRate",
         type: "currency",
         label: t("contracts.compensation.overtimeRate"),
         placeholder: t("contracts.compensation.overtimeRatePlaceholder"),
         currencyIconSrc: "/icons/dirham.png",
         currencySuffix: "AED",
      },
      {
         name: "divider2",
         type: "custom",
         render: () => <div className="h-px bg-bg-weak" />,
      },
   ];

   return (
      <div className="bg-background border rounded-2xl border-border flex flex-col w-full p-6 gap-8">
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
                        updateFormData(field as keyof ContractFormData, value)
                     }
                  />
               ));
            }}
         />
      </div>
   );
}

export default StepCompensationAssets;
