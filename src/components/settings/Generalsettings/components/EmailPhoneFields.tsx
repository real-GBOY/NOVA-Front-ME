/** @format */

import type { UseFormRegister, UseFormWatch, UseFormSetValue, FieldErrors } from "react-hook-form";
import type { GeneralSettingsFormData } from "../schema";
import PhoneInput from "@/designSystem/ui/PhoneInput";
import { useTranslation } from "@/hooks/useTranslation";

type EmailPhoneFieldsProps = {
	register: UseFormRegister<GeneralSettingsFormData>;
	watch: UseFormWatch<GeneralSettingsFormData>;
	setValue: UseFormSetValue<GeneralSettingsFormData>;
	errors: FieldErrors<GeneralSettingsFormData>;
	onEditEmail?: () => void;
	onEditPhone?: () => void;
};

function EmailPhoneFields({
	register,
	watch,
	setValue,
	errors,
	onEditEmail,
	onEditPhone,
}: EmailPhoneFieldsProps) {
	const { t } = useTranslation("settings");

	return (
		<div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
			{/* Email */}
			<div className='flex flex-col gap-1'>
				<div className='flex items-center justify-between'>
					<label className='text-sm font-medium text-text-sub'>
						{t("generalSettingsPage.contact.emailLabel")}
					</label>
					<button
						type='button'
						onClick={onEditEmail}
						className='text-sm font-medium text-primary'>
						{t("wizard.edit", "Edit")}
					</button>
				</div>
				<input
					type='email'
					{...register("email")}
					placeholder={t("generalSettingsPage.contact.emailPlaceholder")}
					readOnly
					aria-readonly='true'
					className='w-full rounded-[10px] border border-border bg-bg-weak px-3 py-2.5 text-sm text-text-strong placeholder:text-text-soft focus:outline-none'
				/>
				{errors.email && (
					<p className='mt-1 text-sm text-danger'>
						{errors.email.message as string}
					</p>
				)}
			</div>

			{/* Phone */}
			<div className='flex flex-col gap-1'>
				<div className='flex items-center justify-between'>
					<label className='text-sm font-medium text-text-sub'>
						{t("generalSettingsPage.contact.phoneLabel")}
					</label>
					<button
						type='button'
						onClick={onEditPhone}
						className='text-sm font-medium text-primary'>
						{t("wizard.edit", "Edit")}
					</button>
				</div>
				<PhoneInput
					value={watch("phoneNumber") || ""}
					onChange={(value) =>
						setValue("phoneNumber", value || "", {
							shouldValidate: true,
							shouldDirty: true,
						})
					}
					placeholder={t("generalSettingsPage.contact.phonePlaceholder")}
					disabled
				/>
				{errors.phoneNumber && (
					<p className='mt-1 text-sm text-danger'>
						{errors.phoneNumber.message as string}
					</p>
				)}
			</div>
		</div>
	);
}

export default EmailPhoneFields;
