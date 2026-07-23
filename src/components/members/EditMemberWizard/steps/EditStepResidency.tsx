/** @format */

import { MutableRefObject, useMemo } from "react";
import { UseFormReturn } from "react-hook-form";
import GenericForm from "@/designSystem/GenericForm";
import { GenericFormField } from "@/designSystem/GenericFormField";
import type { MemberFormData } from "@/utilities/schemas/memberSchema";
import type { FieldConfig } from "@/designSystem/GenericForm";
import DatePicker from "@/designSystem/DatePicker";
import { useTranslation } from "@/hooks/useTranslation";
import { createEditMemberSchema } from "@/utilities/schemas/editMemberSchema";

type EditStepResidencyProps = {
   formData: MemberFormData;
   updateFormData: (field: keyof MemberFormData, value: unknown) => void;
   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   formRef: MutableRefObject<UseFormReturn<any> | null>;
   employeeId: string | number;
};

function EditStepResidency({
   formData,
   updateFormData,
   formRef,
   employeeId,
}: EditStepResidencyProps) {
   const { t } = useTranslation("common");

   // Create edit-specific schema
   const schema = useMemo(
      () => createEditMemberSchema(employeeId).stepResidencyInfoSchema,
      [employeeId]
   );

   const RESIDENCY_STATUS_OPTIONS = useMemo(
      () => [
         {
            id: "Active",
            label: t("members.residencyDetails.statusOptions.active"),
         },
         {
            id: "Expired",
            label: t("members.residencyDetails.statusOptions.expired"),
         },
         {
            id: "Pending",
            label: t("members.residencyDetails.statusOptions.pending"),
         },
         {
            id: "Renewal",
            label: t("members.residencyDetails.statusOptions.renewal") || "Renewal",
         },
      ],
      [t]
   );

   const RESIDENCY_TYPE_OPTIONS = useMemo(
      () => [
         {
            id: "Local",
            label: t("members.residencyDetails.visaTypeOptions.local"),
         },
         {
            id: "Employment Visa",
            label: t("members.residencyDetails.visaTypeOptions.employmentVisa"),
         },
         {
            id: "Visit Visa",
            label: t("members.residencyDetails.visaTypeOptions.visitVisa"),
         },
         {
            id: "Golden Visa",
            label: t("members.residencyDetails.visaTypeOptions.goldenVisa"),
         },
         {
            id: "Student Visa",
            label: t("members.residencyDetails.visaTypeOptions.studentVisa"),
         },
         {
            id: "Dependent Visa",
            label: t("members.residencyDetails.visaTypeOptions.dependentVisa"),
         },
      ],
      [t]
   );

   const fields: FieldConfig[] = [
      {
         name: "residencyStatus",
         type: "select",
         label: t("members.residencyDetails.residencyStatus"),
         placeholder: t("members.residencyDetails.residencyStatusPlaceholder"),
         options: RESIDENCY_STATUS_OPTIONS,
         required: true,
      },
      {
         name: "residencyCountry",
         type: "searchableSelect",
         label: t("members.residencyDetails.countryOfResidency"),
         placeholder: t("members.residencyDetails.countryOfResidencyPlaceholder"),
         options: [
            { id: "United Arab Emirates", label: "United Arab Emirates" },
         ],
         required: true,
         disabled: true,
      },
      {
         name: "residencyType",
         type: "select",
         label: t("members.residencyDetails.visaType"),
         placeholder: t("members.residencyDetails.visaTypePlaceholder"),
         options: RESIDENCY_TYPE_OPTIONS,
         required: true,
      },
      {
         name: "residencyNumber",
         type: "text",
         label: t("members.residencyDetails.visaNumber"),
         placeholder: t("members.residencyDetails.visaNumberPlaceholder"),
         required: true,
      },
      {
         name: "dateRow",
         type: "custom",
         render: (form) => (
            <div className="flex gap-4 w-full">
               <div className="flex-1 flex flex-col gap-1">
                  <label className="block text-sm font-medium text-text-sub">
                     {t("members.residencyDetails.issueDate")}
                     <span className="text-primary">*</span>
                  </label>
                  <DatePicker
                     placeholder={t("members.residencyDetails.issueDatePlaceholder")}
                     value={
                        formData.residencyIssueDate
                           ? new Date(formData.residencyIssueDate)
                           : undefined
                     }
                     onChange={(value: Date) => {
                        const dateStr = value.toISOString().split("T")[0];
                        form.setValue("residencyIssueDate", dateStr, {
                           shouldValidate: true,
                           shouldDirty: true,
                        });
                        updateFormData("residencyIssueDate", dateStr);
                     }}
                  />
                  {form.formState.errors.residencyIssueDate && (
                     <p className="text-sm text-danger mt-1">
                        {
                           form.formState.errors.residencyIssueDate
                              .message as string
                        }
                     </p>
                  )}
               </div>
               <div className="flex-1 flex flex-col gap-1">
                  <label className="block text-sm font-medium text-text-sub">
                     {t("members.residencyDetails.expiryDate")}
                     <span className="text-primary">*</span>
                  </label>
                  <DatePicker
                     placeholder={t("members.residencyDetails.expiryDatePlaceholder")}
                     disabled={!formData.residencyIssueDate}
                     value={
                        formData.residencyExpiryDate
                           ? new Date(formData.residencyExpiryDate)
                           : undefined
                     }
                     onChange={(value: Date) => {
                        const dateStr = value.toISOString().split("T")[0];
                        form.setValue("residencyExpiryDate", dateStr, {
                           shouldValidate: true,
                           shouldDirty: true,
                        });
                        updateFormData("residencyExpiryDate", dateStr);
                     }}
                  />
                  {form.formState.errors.residencyExpiryDate && (
                     <p className="text-sm text-danger mt-1">
                        {
                           form.formState.errors.residencyExpiryDate
                              .message as string
                        }
                     </p>
                  )}
               </div>
            </div>
         ),
      },
      {
         name: "residencyDocument",
         type: "uploadField",
         label: t("members.residencyDetails.emiratesIdUpload"),
         accept: "image/jpeg,image/png,application/pdf,video/mp4",
         multiple: true,
         uploadPurpose: "employee_document",
      },
   ];

   return (
      <div className="bg-background border rounded-2xl border-border flex flex-col w-full p-6 gap-8">
         <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
               <h3 className="text-lg font-semibold text-text-strong">
                  {t("members.residencyDetails.title")}
               </h3>
               <p className="text-sm text-text-sub">
                  {t("members.residencyDetails.description") ||
                     "Update residency information for this employee"}
               </p>
            </div>

            <div className="bg-bg-weak h-px w-full" />

            <GenericForm
               schema={schema}
               defaultValues={formData}
               formData={formData}
               onSubmit={() => {}}
               onFieldChange={updateFormData}
               showSubmitButton={false}
               mode="onChange"
               fields={fields}
               renderFields={(form) => {
                  formRef.current = form;

                  return (
                     <>
                        {fields.map((fieldConfig) => (
                           <GenericFormField
                              key={fieldConfig.name}
                              fieldConfig={fieldConfig}
                              form={form}
                              onFieldChange={(field, value) =>
                                 updateFormData(
                                    field as keyof MemberFormData,
                                    value
                                 )
                              }
                           />
                        ))}
                     </>
                  );
               }}
            />
         </div>
      </div>
   );
}

export default EditStepResidency;

