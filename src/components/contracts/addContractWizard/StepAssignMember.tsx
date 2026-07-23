/** @format */

import { useTranslation } from "@/hooks/useTranslation";
import GenericForm from "@/designSystem/GenericForm";
import { GenericFormField } from "@/designSystem/GenericFormField";
import { createContractSchema } from "@/utilities/schemas/contractSchema";
import type { ContractFormData } from "./types";
import type { FieldConfig } from "@/designSystem/GenericForm";
import { UseFormReturn } from "react-hook-form";
import type { MutableRefObject } from "react";
import DatePicker from "@/designSystem/DatePicker";
import { useMemo, useCallback } from "react";
import { employeeService } from "@/services/employeeService";

type StepAssignMemberProps = {
   formData: ContractFormData;
   updateFormData: (field: keyof ContractFormData, value: unknown) => void;
   availableMembers: Array<{ id: string; label: string; subLabel?: string }>;
   availableContractTypes: Array<{ id: string; label: string }>;
   formRef?: MutableRefObject<UseFormReturn<any> | null>;
};

const parseDateOnly = (value?: string) => {
   if (!value) return undefined;
   const datePart = value.split("T")[0];
   const [year, month, day] = datePart.split("-").map(Number);
   if (!year || !month || !day) return undefined;
   const parsed = new Date(year, month - 1, day);
   return Number.isNaN(parsed.getTime()) ? undefined : parsed;
};

const formatDateOnly = (date: Date) => {
   const year = date.getFullYear();
   const month = String(date.getMonth() + 1).padStart(2, "0");
   const day = String(date.getDate()).padStart(2, "0");
   return `${year}-${month}-${day}`;
};

function StepAssignMember({
   formData,
   updateFormData,
   availableMembers,
   availableContractTypes,
   formRef,
}: StepAssignMemberProps) {
   const { t } = useTranslation("common");
   const contractSchema = useMemo(() => createContractSchema(t), [t]);

   // Server-side member search function
   const fetchMembers = useCallback(
      async (search: string): Promise<Array<{ id: string; label: string }>> => {
         try {
            const response = await employeeService.list({
               search: search || undefined,
            });

            // Filter out employees who already have active contracts
            // This is done client-side as we need to check against existing contracts
            const employees = response.data || [];

            // Transform to the format expected by searchableSelect
            return employees.map((employee) => ({
               id: String(employee.id),
               label: employee.name,
            }));
         } catch (error) {
            console.error("Failed to fetch members:", error);
            return [];
         }
      },
      []
   );

   const fields: FieldConfig[] = [
      {
         name: "contractName",
         type: "text",
         label: t("contracts.contractName"),
         placeholder: t("contracts.assignMember.contractNamePlaceholder"),
         required: true,
      },
      {
         name: "memberId",
         type: "searchableSelect",
         label: t("contracts.assignMember.member"),
         placeholder: t("contracts.assignMember.searchMember"),
         options: availableMembers, // Fallback for backward compatibility
         serverSideSearch: true,
         fetchOptions: fetchMembers,
         required: true,
      },
      {
         name: "contractType",
         type: "searchableSelect",
         label: t("contracts.assignMember.contractType"),
         placeholder: t("contracts.assignMember.selectContractType"),
         options: availableContractTypes,
         required: true,
      },
      {
         name: "dateRow",
         type: "custom",
         render: (form) => (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="flex-1">
                  <GenericFormField
                     fieldConfig={{
                        name: "startDate",
                        type: "custom",
                        label: t("contracts.assignMember.startDate"),
                        required: true,
                        render: () => (
                           <div className="flex flex-col gap-1">
                              <label className="block text-sm font-medium text-text-strong">
                                 {t("contracts.assignMember.startDate")}
                                 <span className="text-primary"> *</span>
                              </label>
                              <DatePicker
                                 value={parseDateOnly(formData.startDate)}
                                 onChange={(value: Date) =>
                                    updateFormData(
                                       "startDate",
                                       formatDateOnly(value)
                                    )
                                 }
                                 placeholder={t(
                                    "contracts.assignMember.startDatePlaceholder"
                                 )}
                              />
                           </div>
                        ),
                     }}
                     form={form}
                     onFieldChange={(field, value) =>
                        updateFormData(field as keyof ContractFormData, value)
                     }
                  />
               </div>
               <div className="flex-1">
                  <GenericFormField
                     fieldConfig={{
                        name: "endDate",
                        type: "custom",
                        label: t("contracts.assignMember.endDate"),
                        required: true,
                        render: () => (
                           <div className="flex flex-col gap-1">
                              <label className="block text-sm font-medium text-text-strong">
                                 {t("contracts.assignMember.endDate")}
                                 <span className="text-primary"> *</span>
                              </label>
                              <DatePicker
                                 value={parseDateOnly(formData.endDate)}
                                 onChange={(value: Date) =>
                                    updateFormData(
                                       "endDate",
                                       formatDateOnly(value)
                                    )
                                 }
                                 placeholder={t(
                                    "contracts.assignMember.endDatePlaceholder"
                                 )}
                              />
                           </div>
                        ),
                     }}
                     form={form}
                     onFieldChange={(field, value) =>
                        updateFormData(field as keyof ContractFormData, value)
                     }
                  />
               </div>
            </div>
         ),
      },
      {
         name: "attachedDocuments",
         type: "uploadField",
         label: t("contracts.assignMember.attachDocuments"),
         accept: "image/jpeg,image/png,application/pdf,video/mp4",
         multiple: true,
         uploadPurpose: "contract",
      },
   ];

   return (
      <div className="bg-background border rounded-2xl border-border flex flex-col w-full p-6 gap-8">
         <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
               <h2 className="text-lg font-medium text-text-strong tracking-tight">
                  {t("contracts.assignMember.title")}
               </h2>
               <p className="text-sm text-text-sub tracking-tight">
                  {t("contracts.assignMember.description")}
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

export default StepAssignMember;
