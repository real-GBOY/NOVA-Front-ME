/** @format */

import {
	useState,
	MutableRefObject,
	useMemo,
	useEffect,
	useCallback,
} from "react";
import { UseFormReturn } from "react-hook-form";
import GenericForm from "@/designSystem/GenericForm";
import { GenericFormField } from "@/designSystem/GenericFormField";
import type { MemberFormData } from "@/utilities/schemas/memberSchema";
import type { FieldConfig } from "@/designSystem/GenericForm";
import DatePicker from "@/designSystem/DatePicker";
import PhoneInput from "@/designSystem/ui/PhoneInput";
import { useFileUpload } from "@/hooks/useFileUpload";
import { COUNTRY_NAME_OPTIONS } from "@/utilities/constants/countries";
import { useTranslation } from "@/hooks/useTranslation";
import { createEditMemberSchema } from "@/utilities/schemas/editMemberSchema";

type EditStepBasicInfoProps = {
	formData: MemberFormData;
	updateFormData: (field: keyof MemberFormData, value: unknown) => void;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	formRef: MutableRefObject<UseFormReturn<any> | null>;
	employeeId: string | number;
	originalEmail?: string;
	originalNationalId?: string;
};

function EditStepBasicInfo({
	formData,
	updateFormData,
	formRef,
	employeeId,
	originalEmail,
	originalNationalId,
}: EditStepBasicInfoProps) {
	const { t } = useTranslation("common");
	const [profileImage, setProfileImage] = useState<string | null>(
		formData.profileImage?.fileUrl || null
	);
	const [isUploadingProfile, setIsUploadingProfile] = useState(false);
	const { uploadFile } = useFileUpload();

	// Create edit-specific schema with original values
	const schema = useMemo(
		() =>
			createEditMemberSchema(employeeId, originalEmail, originalNationalId)
				.stepBasicInfoSchema,
		[employeeId, originalEmail, originalNationalId]
	);

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
				label: t("members.basicInfo.maritalStatusOptions.married"),
			},
			{
				id: "Divorced",
				label: t("members.basicInfo.maritalStatusOptions.divorced"),
			},
			{
				id: "Widowed",
				label: t("members.basicInfo.maritalStatusOptions.widowed"),
			},
		],
		[t]
	);

	// Update profile image preview when formData changes
	useEffect(() => {
		if (formData.profileImage?.fileUrl) {
			setProfileImage(formData.profileImage.fileUrl);
		}
	}, [formData.profileImage?.fileUrl]);

	const handleImageUpload = useCallback(
		async (event: React.ChangeEvent<HTMLInputElement>) => {
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
					purpose: result.purpose || "employee_profile",
					fileName: file.name,
					fileSize: file.size,
					fileType: file.type,
					fileUrl: result.fileUrl,
				});
			} catch (error) {
				console.error("Profile image upload failed:", error);
				setProfileImage(formData.profileImage?.fileUrl || null);
			} finally {
				setIsUploadingProfile(false);
			}
		},
		[uploadFile, updateFormData, formData.profileImage?.fileUrl]
	);

	const handleRemoveImage = useCallback(() => {
		setProfileImage(null);
		updateFormData("profileImage", null);
	}, [updateFormData]);

	const fields: FieldConfig[] = useMemo(
		() => [
			{
				name: "profileImageSection",
				type: "custom",
				render: () => (
					<div className='flex flex-col gap-2'>
						<label className='text-sm font-medium text-text-main'>
							{t("members.basicInfo.uploadImageHeader")}
						</label>
						<div className='flex items-center gap-4'>
							{profileImage && (
								<div className='relative'>
									<img
										src={profileImage}
										alt='Profile'
										className='w-20 h-20 rounded-full object-cover border-2 border-border'
									/>
									{isUploadingProfile && (
										<div className='absolute inset-0 flex items-center justify-center bg-black/50 rounded-full'>
											<div className='w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin' />
										</div>
									)}
								</div>
							)}
							<div className='flex gap-2'>
								<label className='px-4 py-2 bg-primary text-white rounded-lg cursor-pointer hover:bg-primary/90 transition-colors'>
									{t("members.basicInfo.uploadButton")}
									<input
										type='file'
										accept='image/*'
										onChange={handleImageUpload}
										className='hidden'
										disabled={isUploadingProfile}
									/>
								</label>
								{profileImage && (
									<button
										type='button'
										onClick={handleRemoveImage}
										className='px-4 py-2 bg-danger text-white rounded-lg hover:bg-danger/90 transition-colors'>
										{t("members.basicInfo.removeButton")}
									</button>
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
					<div className='flex gap-4 w-full'>
						<div className='flex-1'>
							<label className='block text-sm font-medium text-text-sub mb-1'>
								{t("members.basicInfo.firstName")}
								<span className='text-primary'>*</span>
							</label>
							<input
								type='text'
								{...form.register("firstName")}
								placeholder={t("members.basicInfo.firstNamePlaceholder")}
								className='w-full px-3 py-2.5 text-sm rounded-xl border border-border bg-background text-text-sub placeholder:text-text-soft focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent'
								onChange={(e) => {
									form.setValue("firstName", e.target.value, {
										shouldValidate: true,
										shouldDirty: true,
									});
									updateFormData("firstName", e.target.value);
								}}
							/>
							{form.formState.errors.firstName && (
								<p className='text-sm text-danger mt-1'>
									{form.formState.errors.firstName.message as string}
								</p>
							)}
						</div>
						<div className='flex-1'>
							<label className='block text-sm font-medium text-text-sub mb-1'>
								{t("members.basicInfo.lastName")}
								<span className='text-primary'>*</span>
							</label>
							<input
								type='text'
								{...form.register("lastName")}
								placeholder={t("members.basicInfo.lastNamePlaceholder")}
								className='w-full px-3 py-2.5 text-sm rounded-xl border border-border bg-background text-text-sub placeholder:text-text-soft focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent'
								onChange={(e) => {
									form.setValue("lastName", e.target.value, {
										shouldValidate: true,
										shouldDirty: true,
									});
									updateFormData("lastName", e.target.value);
								}}
							/>
							{form.formState.errors.lastName && (
								<p className='text-sm text-danger mt-1'>
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
					<div className='flex flex-col gap-1'>
						<label className='block text-sm font-medium text-text-sub'>
							{t("members.basicInfo.phone")}
							<span className='text-primary'>*</span>
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
							placeholder={t("members.basicInfo.phonePlaceholder")}
						/>
						{form.formState.errors.phoneNumber && (
							<p className='text-sm text-danger mt-1'>
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
					<div className='flex flex-col gap-1'>
						<label className='block text-sm font-medium text-text-sub'>
							{t("members.basicInfo.dateOfBirth")}
							<span className='text-primary'>*</span>
						</label>
						<DatePicker
							variant='dateOfBirth'
							value={
								formData.dateOfBirth
									? new Date(formData.dateOfBirth)
									: undefined
							}
							onChange={(value: Date) => {
								const dateStr = value.toISOString().split("T")[0];
								form.setValue("dateOfBirth", dateStr, {
									shouldValidate: true,
									shouldDirty: true,
								});
								updateFormData("dateOfBirth", dateStr);
							}}
						/>
						{form.formState.errors.dateOfBirth && (
							<p className='text-sm text-danger mt-1'>
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
					<div className='flex flex-col gap-6 mt-2'>
						<div className='flex flex-col gap-2'>
							<h3 className='text-lg font-semibold text-text-strong'>
								{t("members.basicInfo.personalDetailsHeader")}
							</h3>
							<p className='text-sm text-text-sub'>
								{t("members.basicInfo.personalDetailsSubtitle")}
							</p>
						</div>
						<div className='bg-bg-weak h-px w-full' />
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
				placeholder: t("members.basicInfo.maritalStatusPlaceholder"),
				options: MARITAL_STATUS_OPTIONS,
			},
			{
				name: "nationalId",
				type: "text",
				label: t("members.basicInfo.nationalId"),
				placeholder: t("members.basicInfo.nationalIdPlaceholder"),
				required: false,
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
		],
		[
			t,
			formData,
			updateFormData,
			GENDER_OPTIONS,
			MARITAL_STATUS_OPTIONS,
			profileImage,
			isUploadingProfile,
			handleImageUpload,
			handleRemoveImage,
		]
	);

	return (
		<div className='bg-background border rounded-2xl border-border flex flex-col w-full p-6 gap-8'>
			<div className='flex flex-col gap-6'>
				<div className='flex flex-col gap-2'>
					<h3 className='text-lg font-semibold text-text-strong'>
						{t("members.basicInfo.title")}
					</h3>
					<p className='text-sm text-text-sub'>
						{t("members.basicInfo.subtitle") ||
							"Update the basic information for this employee"}
					</p>
				</div>

				<div className='bg-bg-weak h-px w-full' />

				<GenericForm
					schema={schema}
					defaultValues={formData}
					formData={formData}
					onSubmit={() => {}}
					onFieldChange={updateFormData}
					showSubmitButton={false}
					mode='onChange'
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
											updateFormData(field as keyof MemberFormData, value)
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

export default EditStepBasicInfo;
