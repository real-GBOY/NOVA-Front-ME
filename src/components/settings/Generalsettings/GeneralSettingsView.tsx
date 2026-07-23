/** @format */

import { useState, useEffect } from "react";
import GenericForm from "@/designSystem/GenericForm";
import { type FieldValues } from "react-hook-form";
import { useFileUpload } from "@/hooks/useFileUpload";
import type { ProfileImageValue } from "./types";
import {
   getGeneralSettingsSchema,
   type GeneralSettingsFormData,
} from "./schema";
import { useMemo } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import GeneralSettingsHeader from "./components/GeneralSettingsHeader";
import ProfileImageUpload from "./components/ProfileImageUpload";
import NameFields from "./components/NameFields";
import EmailPhoneFields from "./components/EmailPhoneFields";
import LanguageSelector from "./components/LanguageSelector";
// import SecuritySection from "./components/SecuritySection";
import VerifyIdentityModal from "./components/VerifyIdentityModal";
import VerifyCodeModal from "./components/VerifyCodeModal";
import NewMobileNumberModal from "./components/NewMobileNumberModal";
import ConfirmMobileNumberModal from "./components/ConfirmMobileNumberModal";
import { getCurrentUserId } from "@/utils/auth";
import {
   useGetEmployeeDetails,
   useUpdateEmployeeProfile,
   useRequestContactUpdate,
   useVerifyContactUpdate,
} from "@/hooks/employees/employee.queries";
import ConfirmModal from "@/designSystem/ConfirmModal";
import Loader from "@/designSystem/Loader";
import toast from "@/utilities/toast";
import { usePermissions } from "@/contexts/PermissionContext";
import NoPermissionMessage from "@/components/common/NoPermissionMessage";
import { formatPermissionName } from "@/utilities/permissionFormatters";

function GeneralSettingsView() {
   const { t } = useTranslation("settings");
   const { uploadFile } = useFileUpload();
   const { can } = usePermissions();
   const canViewProfile =
      can("read_employee_basic") || can("read_employee_detailed");
   const canUpdateProfile = can("update_employee");

   const [profileImage, setProfileImage] = useState<string | null>(null);
   const [originalProfileImage, setOriginalProfileImage] = useState<
      string | null
   >(null);
   const [isFormDirty, setIsFormDirty] = useState(false);
   const [hasProfileImageChange, setHasProfileImageChange] = useState(false);
   const [formKey, setFormKey] = useState(0);

   const [isUploadingProfile, setIsUploadingProfile] = useState(false);
   const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
   const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
   const [isVerifyCodeModalOpen, setIsVerifyCodeModalOpen] = useState(false);
   const [isNewMobileNumberModalOpen, setIsNewMobileNumberModalOpen] =
      useState(false);
   const [isConfirmMobileNumberModalOpen, setIsConfirmMobileNumberModalOpen] =
      useState(false);
   const [verificationEmail, setVerificationEmail] = useState("");
   const [isConfirmSaveOpen, setIsConfirmSaveOpen] = useState(false);
   const [pendingData, setPendingData] =
      useState<GeneralSettingsFormData | null>(null);
   const formSchema = useMemo(() => getGeneralSettingsSchema(t), [t]);

   const currentUserId = getCurrentUserId();
   const { data: employeeData, isLoading: isLoadingDetails } =
      useGetEmployeeDetails(currentUserId || 0, {
         enabled: !!currentUserId,
      });

   const updateProfileMutation = useUpdateEmployeeProfile();
   const requestContactMutation = useRequestContactUpdate();
   const verifyContactMutation = useVerifyContactUpdate();

   const getErrorMessage = (error: unknown, fallback: string) => {
      if (error && typeof error === "object") {
         const message = (
            error as { response?: { data?: { message?: string } } }
         ).response?.data?.message;
         if (message) return message;
      }
      if (error instanceof Error && error.message) {
         return error.message;
      }
      return fallback;
   };

   const handleImageUpload = async (
      file: File,
      onChange: (value: ProfileImageValue | null) => void
   ) => {
      if (!file) return;

      const reader = new FileReader();
      reader.onloadend = () => {
         setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);

      try {
         setIsUploadingProfile(true);
         const result = await uploadFile(file, {
            purpose: "employee_profile",
         });

         const value: ProfileImageValue = {
            fileId: result.fileId,
            token: result.token,
            purpose: result.purpose,
            fileUrl: result.fileUrl,
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
         };

         onChange(value);
         // Mark that profile image has changed
         setHasProfileImageChange(true);
      } catch (error) {
         console.error("Profile image upload failed:", error);
         setProfileImage(originalProfileImage); // Revert on failure
         onChange(null);
      } finally {
         setIsUploadingProfile(false);
      }
   };

   const handleRemoveImage = (
      onChange: (value: ProfileImageValue | null) => void
   ) => {
      setProfileImage(null);
      onChange(null);
      // Mark that profile image has changed (removed)
      setHasProfileImageChange(true);
   };

   const [defaultValues, setDefaultValues] = useState<GeneralSettingsFormData>({
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      language: "en-US",
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
      profileImage: null,
   });

   useEffect(() => {
      if (employeeData) {
         const personal = employeeData.personal;

         // Use the profile_picture_url directly from the backend
         const avatarUrl = personal.profile_picture_url;

         setDefaultValues({
            firstName: personal.first_name || "",
            lastName: personal.last_name || "",
            email: personal.email || "",
            phoneNumber: personal.phone_number || "",
            language: "en-US", // Default or from data if available
            currentPassword: "",
            newPassword: "",
            confirmNewPassword: "",
            profileImage: personal.profile_picture_id
               ? {
                    fileId:
                       typeof personal.profile_picture_id === "string"
                          ? parseInt(personal.profile_picture_id)
                          : personal.profile_picture_id,
                    token: "", // Token might not be available from GET
                    purpose: "employee_profile",
                    fileUrl: avatarUrl || undefined,
                 }
               : null,
         });

         if (avatarUrl) {
            setProfileImage(avatarUrl);
            setOriginalProfileImage(avatarUrl);
         } else {
            setProfileImage(null);
            setOriginalProfileImage(null);
         }
         // Reset profile image change tracking when data loads
         setHasProfileImageChange(false);
      }
   }, [employeeData]);

   const [contactUpdateToken, setContactUpdateToken] = useState("");
   const [contactUpdateValue, setContactUpdateValue] = useState("");
   const [contactUpdateType, setContactUpdateType] = useState<
      "email" | "phone"
   >("email");

   if (isLoadingDetails) {
      return (
         <div className="flex items-center justify-center p-20">
            <Loader label="Loading settings..." />
         </div>
      );
   }

   if (!canViewProfile) {
      return (
         <div className="p-6">
            <NoPermissionMessage
               message={t(
                  "permissions.noReadAccess.title",
                  "Access Restricted"
               )}
               description={`${t(
                  "permissions.noReadAccess.message",
                  "You don't have permission to view this section."
               )} (Missing: ${formatPermissionName("read_employee_basic")})`}
            />
         </div>
      );
   }

   const handleSubmitForm = async (data: GeneralSettingsFormData) => {
      setPendingData(data);
      setIsConfirmSaveOpen(true);
   };

   const handleConfirmSave = async () => {
      if (!pendingData || !currentUserId) return;

      try {
         await updateProfileMutation.mutateAsync({
            id: currentUserId,
            payload: {
               profile_image: pendingData.profileImage
                  ? {
                       fileId: pendingData.profileImage.fileId,
                       token: pendingData.profileImage.token,
                       purpose: "employee_profile",
                    }
                  : undefined,
            },
         });
         
         // Update original profile image to the new one after successful save
         if (pendingData.profileImage?.fileUrl) {
            setOriginalProfileImage(pendingData.profileImage.fileUrl);
         } else if (!pendingData.profileImage) {
            // If profile image was removed
            setOriginalProfileImage(null);
         }
         
         setIsFormDirty(false);
         setHasProfileImageChange(false);
         setIsConfirmSaveOpen(false);
         toast.success(
            t(
               "generalSettings.profileImageUpdateSuccess",
               "Profile image saved successfully"
            )
         );
      } catch (error) {
         console.error("Failed to update profile", error);
         toast.error(
            getErrorMessage(
               error,
               t(
                  "generalSettings.profileImageUpdateError",
                  "Failed to save profile image"
               )
            )
         );
      }
   };

   const handleSave = () => {
      // Trigger the hidden submit button
      const submitButton = document.getElementById("general-settings-submit");
      submitButton?.click();
   };

   const handleCancel = () => {
      setProfileImage(originalProfileImage);
      setFormKey((prev) => prev + 1);
      setIsFormDirty(false);
      setHasProfileImageChange(false);
   };

   const handleSendVerificationCode = async (newEmail: string) => {
      if (!currentUserId || !employeeData?.personal?.email) return;
      try {
         // Send OTP to CURRENT email
         const result = await requestContactMutation.mutateAsync({
            id: currentUserId,
            payload: { type: "email", email: employeeData.personal.email },
         });
         setContactUpdateToken(result.token);
         // Save the NEW email for the verification step
         setContactUpdateValue(newEmail);
         setContactUpdateType("email");
         setVerificationEmail(employeeData.personal.email);
         setIsVerifyModalOpen(false);
         setIsVerifyCodeModalOpen(true);
      } catch (error) {
         console.error("Failed to request email update", error);
      }
   };

   const handleResendEmailCode = async () => {
      if (!currentUserId || !employeeData?.personal?.email) return;
      try {
         // Resend OTP to CURRENT email
         const result = await requestContactMutation.mutateAsync({
            id: currentUserId,
            payload: { type: "email", email: employeeData.personal.email },
         });
         setContactUpdateToken(result.token);
         setContactUpdateType("email");
         setVerificationEmail(employeeData.personal.email);
      } catch (error) {
         console.error("Failed to resend email update", error);
         throw error;
      }
   };

   const handleVerifyCode = async (code: string) => {
      if (!currentUserId || !contactUpdateType || !contactUpdateValue) return;
      try {
         await verifyContactMutation.mutateAsync({
            id: currentUserId,
            payload: {
               type: contactUpdateType,
               value: contactUpdateValue,
               otp: code,
               token: contactUpdateToken,
            },
         });
         setIsVerifyCodeModalOpen(false);
         // If verifying for phone edit, show phone number modal
         if (contactUpdateType === "phone") {
            setIsNewMobileNumberModalOpen(true);
         } else {
            toast.success(
               t(
                  "generalSettings.emailUpdateSuccess",
                  "Email updated successfully"
               )
            );
         }
      } catch (error) {
         console.error("Failed to verify contact update", error);
         toast.error(getErrorMessage(error, "Invalid OTP"));
      }
   };

   const handleContinueMobileNumber = async (
      newPhone: string,
      confirmPhone: string
   ) => {
      if (
         !currentUserId ||
         newPhone !== confirmPhone ||
         !employeeData?.personal?.email
      )
         return;
      try {
         const result = await requestContactMutation.mutateAsync({
            id: currentUserId,
            payload: {
               type: "phone",
               phone: newPhone,
               email: employeeData.personal.email, // Send OTP to current email
            },
         });
         setContactUpdateToken(result.token);
         setContactUpdateValue(newPhone);
         setContactUpdateType("phone");
         setIsNewMobileNumberModalOpen(false);
         setIsConfirmMobileNumberModalOpen(true);
      } catch (error) {
         console.error("Failed to request phone update", error);
      }
   };

   const handleResendPhoneCode = async () => {
      if (
         !currentUserId ||
         !contactUpdateValue ||
         !employeeData?.personal?.email
      )
         return;
      try {
         const result = await requestContactMutation.mutateAsync({
            id: currentUserId,
            payload: {
               type: "phone",
               phone: contactUpdateValue,
               email: employeeData.personal.email, // Resend OTP to current email
            },
         });
         setContactUpdateToken(result.token);
         setContactUpdateType("phone");
      } catch (error) {
         console.error("Failed to resend phone update", error);
         throw error;
      }
   };

   const handleConfirmMobileNumber = async (code: string) => {
      if (!currentUserId || !contactUpdateValue) return;
      try {
         await verifyContactMutation.mutateAsync({
            id: currentUserId,
            payload: {
               type: "phone",
               value: contactUpdateValue,
               otp: code,
               token: contactUpdateToken,
            },
         });
         setIsConfirmMobileNumberModalOpen(false);
         toast.success(
            t(
               "generalSettings.phoneUpdateSuccess",
               "Phone number updated successfully"
            )
         );
      } catch (error) {
         console.error("Failed to verify phone update", error);
         toast.error(getErrorMessage(error, "Invalid OTP"));
      }
   };

   return (
      <div className="flex flex-col gap-6">
         <GeneralSettingsHeader
            onSave={handleSave}
            onCancel={handleCancel}
            isLoading={isUploadingProfile}
            hasChanges={isFormDirty || hasProfileImageChange}
         />

         <VerifyIdentityModal
            isOpen={isVerifyModalOpen}
            onClose={() => setIsVerifyModalOpen(false)}
            onSendCode={handleSendVerificationCode}
         />

         <VerifyCodeModal
            isOpen={isVerifyCodeModalOpen}
            onClose={() => setIsVerifyCodeModalOpen(false)}
            onSubmit={handleVerifyCode}
            onResend={handleResendEmailCode}
            email={verificationEmail}
         />

         <NewMobileNumberModal
            isOpen={isNewMobileNumberModalOpen}
            onClose={() => setIsNewMobileNumberModalOpen(false)}
            onContinue={handleContinueMobileNumber}
         />

         <ConfirmMobileNumberModal
            isOpen={isConfirmMobileNumberModalOpen}
            onClose={() => setIsConfirmMobileNumberModalOpen(false)}
            onConfirm={handleConfirmMobileNumber}
            onResend={handleResendPhoneCode}
            email={employeeData?.personal?.email || ""}
         />

         <ConfirmModal
            isOpen={isConfirmSaveOpen}
            onClose={() => setIsConfirmSaveOpen(false)}
            onConfirm={handleConfirmSave}
            title="Confirm Changes"
            description="Are you sure you want to save these changes to your profile?"
            confirmText="Save changes"
            cancelText="Cancel"
            variant="primary"
            isLoading={updateProfileMutation.isPending}
         />

         <div className="rounded-2xl bg-elevated pr-6 pt-6 pb-6">
            <GenericForm<GeneralSettingsFormData>
               key={formKey}
               schema={formSchema}
               formData={defaultValues}
               onSubmit={handleSubmitForm}
               onDirtyChange={(isDirty) => setIsFormDirty(isDirty)}
               showSubmitButton={false}
               renderFields={(form) => {
                  const errors = form.formState.errors as FieldValues;

                  return (
                     <div className="flex flex-col gap-8">
                        {/* General Settings Section */}
                        <div className="flex flex-col gap-6">
                           <div className="flex flex-col gap-6">
                              <ProfileImageUpload
                                 profileImage={profileImage}
                                 isUploadingProfile={isUploadingProfile}
                                 onImageUpload={handleImageUpload}
                                 onRemoveImage={handleRemoveImage}
                                 setValue={form.setValue}
                              />

                              <NameFields watch={form.watch} />

                              <EmailPhoneFields
                                 register={form.register}
                                 watch={form.watch}
                                 setValue={form.setValue}
                                 errors={errors as typeof form.formState.errors}
                                 onEditEmail={() => setIsVerifyModalOpen(true)}
                                 onEditPhone={() =>
                                    setIsNewMobileNumberModalOpen(true)
                                 }
                              />

                              <LanguageSelector
                                 isOpen={isLanguageDropdownOpen}
                                 onToggle={() =>
                                    setIsLanguageDropdownOpen((prev) => !prev)
                                 }
                              />
                           </div>
                        </div>

                        <div className="h-px w-full bg-bg-weak" />

                        {/* Hidden submit trigger so header Save button can submit */}
                        <button
                           type="submit"
                           id="general-settings-submit"
                           className="hidden"
                        />
                     </div>
                  );
               }}
            />
         </div>
      </div>
   );
}

export default GeneralSettingsView;
