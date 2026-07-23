/** @format */

import type { UseFormRegister, FieldErrors } from "react-hook-form";
import type { GeneralSettingsFormData } from "../schema";
import PasswordField from "./PasswordField";
import { useTranslation } from "@/hooks/useTranslation";

type SecuritySectionProps = {
	register: UseFormRegister<GeneralSettingsFormData>;
	errors: FieldErrors<GeneralSettingsFormData>;
	showCurrentPassword: boolean;
	showNewPassword: boolean;
	showConfirmPassword: boolean;
	onToggleCurrentPassword: () => void;
	onToggleNewPassword: () => void;
	onToggleConfirmPassword: () => void;
};

function SecuritySection({
	register,
	errors,
	showCurrentPassword,
	showNewPassword,
	showConfirmPassword,
	onToggleCurrentPassword,
	onToggleNewPassword,
	onToggleConfirmPassword,
}: SecuritySectionProps) {
	const { t } = useTranslation("settings");

	return (
		<div className='flex flex-col items-start gap-4 p-0'>
			<h3 className='w-full text-base font-medium leading-6 text-text-strong tracking-[-0.011em]'>
				{t("generalSettingsPage.security.title")}
			</h3>
			<div className='h-px w-1/2 rounded-full bg-border' />
			<PasswordField
				name='currentPassword'
				label={t("generalSettingsPage.security.current")}
				register={register}
				errors={errors}
				showPassword={showCurrentPassword}
				onToggleShowPassword={onToggleCurrentPassword}
			/>
			<PasswordField
				name='newPassword'
				label={t("generalSettingsPage.security.new")}
				register={register}
				errors={errors}
				showPassword={showNewPassword}
				onToggleShowPassword={onToggleNewPassword}
			/>
			<PasswordField
				name='confirmNewPassword'
				label={t("generalSettingsPage.security.confirm")}
				register={register}
				errors={errors}
				showPassword={showConfirmPassword}
				onToggleShowPassword={onToggleConfirmPassword}
			/>
		</div>
	);
}

export default SecuritySection;

