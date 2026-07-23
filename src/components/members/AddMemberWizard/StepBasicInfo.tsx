/** @format */

import { useState, MutableRefObject, useMemo } from "react";
import { UseFormReturn } from "react-hook-form";
import GenericForm from "@/designSystem/GenericForm";
import { GenericFormField } from "@/designSystem/GenericFormField";
import { stepBasicInfoSchema } from "@/utilities/schemas/memberSchema";
import type { MemberFormData } from "./types";
import type { FieldConfig } from "@/designSystem/GenericForm";
import DatePicker from "@/designSystem/DatePicker";
import PhoneInput from "@/designSystem/ui/PhoneInput";
import { useFileUpload } from "@/hooks/useFileUpload";
import { COUNTRY_NAME_OPTIONS } from "@/utilities/constants/countries";
import { useTranslation } from "@/hooks/useTranslation";

type StepBasicInfoProps = {
   formData: MemberFormData;
   updateFormData: (field: keyof MemberFormData, value: unknown) => void;
   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   formRef: MutableRefObject<UseFormReturn<any> | null>;
};

function StepBasicInfo({
   formData,
   updateFormData,
   formRef,
}: StepBasicInfoProps) {
   const { t } = useTranslation("common");
   const [profileImage, setProfileImage] = useState<string | null>(null);
   const [isUploadingProfile, setIsUploadingProfile] = useState(false);
   const { uploadFile } = useFileUpload();

   const GENDER_OPTIONS = useMemo(
      () => [
         {
            id: "Male",
            label: t("members.basicInfo.genderOptions.male"),
         },
         {
            id: "Female",
            label: t("members.basicInfo.genderOptions.female"),
         },
      ],
      [t]
   );

   const MARITAL_STATUS_OPTIONS = useMemo(
      () => [
         {
            id: "Single",
            label: t("members.basicInfo.maritalStatusOptions.single"),
         },
         {
            id: "Married",
            label: t(
               "members.basicInfo.maritalStatusOptions.married"
            ),
         },
         {
            id: "Divorced",
            label: t(
               "members.basicInfo.maritalStatusOptions.divorced"
            ),
         },
         {
            id: "Widowed",
            label: t(
               "members.basicInfo.maritalStatusOptions.widowed"
            ),
         },
      ],
      [t]
   );

   const handleImageUpload = async (
      event: React.ChangeEvent<HTMLInputElement>
   ) => {
      const file = event.target.files?.[0];
      if (!file) return;

      // Show preview immediately
      const reader = new FileReader();
      reader.onloadend = () => {
         setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload to server using the hook
      try {
         setIsUploadingProfile(true);
         const result = await uploadFile(file, {
            purpose: "employee_profile",
            onProgress: () => {},
         });

         // Update form data with upload result
         updateFormData("profileImage", {
            fileId: result.fileId,
            token: result.token,
            purpose: result.purpose,
            // Store additional data for UI but won't be sent to API
            fileUrl: result.fileUrl,
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
         });
         setIsUploadingProfile(false);
      } catch (error) {
         console.error("Profile image upload failed:", error);
         setIsUploadingProfile(false);
         setProfileImage(null);
      }
   };

   const handleRemoveImage = () => {
      setProfileImage(null);
      updateFormData("profileImage", undefined);
   };

   const fields: FieldConfig[] = [
      {
         name: "profileImage",
         type: "custom",
         render: () => (
            <div className="flex gap-5 items-start">
               <div className="relative w-16 h-16 rounded-full bg-bg-weak overflow-hidden flex items-center justify-center">
                  {profileImage ? (
                     <img
                        src={profileImage}
                        alt="Profile"
                        className="w-full h-full object-cover"
                     />
                  ) : (
                     <div className="w-full h-full bg-bg-weak" />
                  )}
                  {isUploadingProfile && (
                     <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                        <div className="text-xs text-text-sub">
                           {t(
                              "members.wizard.buttons.uploading"
                           )}
                        </div>
                     </div>
                  )}
               </div>
               <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1">
                     <p className="text-base font-medium text-text-strong">
                        {t("members.basicInfo.uploadImageHeader")}
                     </p>
                     <p className="text-sm text-text-sub">
                        {t(
                           "members.basicInfo.uploadImageHelper"
                        )}
                     </p>
                  </div>
                  <div className="flex gap-3">
                     {profileImage ? (
                        <>
                           <button
                              type="button"
                              onClick={handleRemoveImage}
                              disabled={isUploadingProfile}
                              className="bg-background border border-error rounded-lg px-3 py-1.5 text-sm font-medium text-error hover:bg-error/5 transition-colors disabled:opacity-50">
                              {t(
                                 "members.basicInfo.removeButton"
                              )}
                           </button>
                           <label className="bg-background border border-border rounded-lg px-3 py-1.5 cursor-pointer inline-flex items-center justify-center hover:bg-bg-weak transition-colors">
                              <span className="text-sm font-medium text-text-sub">
                                 {t(
                                    "members.basicInfo.changeButton"
                                 )}
                              </span>
                              <input
                                 type="file"
                                 accept="image/png,image/jpeg"
                                 onChange={handleImageUpload}
                                 disabled={isUploadingProfile}
                                 className="hidden"
                              />
                           </label>
                        </>
                     ) : (
                        <label className="bg-background border border-border rounded-lg px-3 py-1.5 cursor-pointer inline-flex items-center justify-center hover:bg-bg-weak transition-colors">
                           <span className="text-sm font-medium text-text-sub">
                              {isUploadingProfile
                                 ? t(
                                      "members.wizard.buttons.uploading"
                                   )
                                 : t(
                                      "members.basicInfo.uploadButton"
                                   )}
                           </span>
                           <input
                              type="file"
                              accept="image/png,image/jpeg"
                              onChange={handleImageUpload}
                              disabled={isUploadingProfile}
                              className="hidden"
                           />
                        </label>
                     )}
                  </div>
               </div>
            </div>
         ),
      },
      {
         name: "nameRow",
         type: "custom",
         render: (form) => (
            <div className="flex gap-4 w-full">
               <div className="flex-1">
                  <label className="block text-sm font-medium text-text-sub mb-1">
                     {t("members.basicInfo.firstName")}
                     <span className="text-primary">*</span>
                  </label>
                  <input
                     type="text"
                     {...form.register("firstName")}
                     placeholder={t(
                        "members.basicInfo.firstName"
                     )}
                     className="w-full px-3 py-2.5 text-sm rounded-xl border border-border bg-background text-text-sub placeholder:text-text-soft focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                     onChange={(e) => {
                        form.setValue("firstName", e.target.value, {
                           shouldValidate: true,
                           shouldDirty: true,
                        });
                        updateFormData("firstName", e.target.value);
                     }}
                  />
                  {form.formState.errors.firstName && (
                     <p className="text-sm text-danger mt-1">
                        {form.formState.errors.firstName.message as string}
                     </p>
                  )}
               </div>
               <div className="flex-1">
                  <label className="block text-sm font-medium text-text-sub mb-1">
                     {t("members.basicInfo.lastName")}
                     <span className="text-primary">*</span>
                  </label>
                  <input
                     type="text"
                     {...form.register("lastName")}
                     placeholder={t(
                        "members.basicInfo.lastName"
                     )}
                     className="w-full px-3 py-2.5 text-sm rounded-xl border border-border bg-background text-text-sub placeholder:text-text-soft focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                     onChange={(e) => {
                        form.setValue("lastName", e.target.value, {
                           shouldValidate: true,
                           shouldDirty: true,
                        });
                        updateFormData("lastName", e.target.value);
                     }}
                  />
                  {form.formState.errors.lastName && (
                     <p className="text-sm text-danger mt-1">
                        {form.formState.errors.lastName.message as string}
                     </p>
                  )}
               </div>
            </div>
         ),
      },
      {
         name: "email",
         type: "text",
         label: t("members.basicInfo.email"),
         placeholder: t("members.basicInfo.emailPlaceholder"),
         required: true,
      },
      {
         name: "phoneNumber",
         type: "custom",
         label: t("members.basicInfo.phone"),
         required: true,
         render: (form) => (
            <div className="flex flex-col gap-1">
               <label className="block text-sm font-medium text-text-sub">
                  {t("members.basicInfo.phone")}
                  <span className="text-primary">*</span>
               </label>
               <PhoneInput
                  value={formData.phoneNumber || ""}
                  onChange={(value) => {
                     form.setValue("phoneNumber", value, {
                        shouldValidate: true,
                        shouldDirty: true,
                     });
                     updateFormData("phoneNumber", value);
                  }}
                  placeholder={t(
                     "members.basicInfo.phone"
                  )}
               />
               {form.formState.errors.phoneNumber && (
                  <p className="text-sm text-danger mt-1">
                     {form.formState.errors.phoneNumber.message as string}
                  </p>
               )}
            </div>
         ),
      },
      {
         name: "country",
         type: "searchableSelect",
         label: t("members.basicInfo.country"),
         placeholder: t("members.basicInfo.countryPlaceholder"),
         options: COUNTRY_NAME_OPTIONS,
         required: true,
      },
      {
         name: "dateOfBirth",
         type: "custom",
         label: t("members.basicInfo.dateOfBirth"),
         required: true,
         render: (form) => (
            <div className="flex flex-col gap-1">
               <label className="block text-sm font-medium text-text-sub">
                  {t("members.basicInfo.dateOfBirth")}
                  <span className="text-primary">*</span>
               </label>
               <DatePicker
                  variant="dateOfBirth"
                  value={
                     formData.dateOfBirth
                        ? new Date(formData.dateOfBirth)
                        : undefined
                  }
                  onChange={(value: Date) => {
                     // Convert Date to ISO string for storage
                     const isoString = value.toISOString();
                     form.setValue("dateOfBirth", isoString, {
                        shouldValidate: true,
                        shouldDirty: true,
                     });
                     updateFormData("dateOfBirth", isoString);
                  }}
               />
               {form.formState.errors.dateOfBirth && (
                  <p className="text-sm text-danger mt-1">
                     {form.formState.errors.dateOfBirth.message as string}
                  </p>
               )}
            </div>
         ),
      },
      {
         name: "personalDetailsHeader",
         type: "custom",
         render: () => (
            <div className="flex flex-col gap-6 mt-2">
               <div className="flex flex-col gap-2">
                  <h3 className="text-lg font-semibold text-text-strong">
                     {t("members.basicInfo.personalDetailsHeader")}
                  </h3>
                  <p className="text-sm text-text-sub">
                     {t("members.basicInfo.personalDetailsSubtitle")}
                  </p>
               </div>
               <div className="bg-bg-weak h-px w-full" />
            </div>
         ),
      },
      {
         name: "gender",
         type: "select",
         label: t("members.basicInfo.gender"),
         placeholder: t("members.basicInfo.genderPlaceholder"),
         options: GENDER_OPTIONS,
      },
      {
         name: "maritalStatus",
         type: "select",
         label: t("members.basicInfo.maritalStatus"),
         placeholder: t(
            "members.basicInfo.maritalStatus"
         ),
         options: MARITAL_STATUS_OPTIONS,
      },
      {
         name: "nationalId",
         type: "text",
         label: t("members.basicInfo.nationalId"),
         placeholder: t("members.basicInfo.nationalIdPlaceholder"),
      },
      {
         name: "address",
         type: "text",
         label: t("members.basicInfo.address"),
         placeholder: t("members.basicInfo.addressPlaceholder"),
      },
      {
         name: "documents",
         type: "uploadField",
         label: t("members.basicInfo.attachDocuments"),
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
                  {t("members.basicInfo.title")}
               </h3>
               <p className="text-sm text-text-sub">
                  {t("members.basicInfo.subtitle")}
               </p>
            </div>

            <div className="bg-bg-weak h-px w-full" />

            <GenericForm
               schema={stepBasicInfoSchema}
               defaultValues={formData}
               formData={formData}
               onSubmit={() => {}}
               onFieldChange={updateFormData}
               showSubmitButton={false}
               mode="onChange"
               fields={fields}
               renderFields={(form) => {
                  // Store form instance in ref for parent access
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

export default StepBasicInfo;
