/** @format */

import type { UseFormRegister, FieldErrors } from "react-hook-form";
import type { GeneralSettingsFormData } from "../schema";
import { EyeLine } from "@/Icons";
import { useTranslation } from "@/hooks/useTranslation";

type PasswordFieldProps = {
	name: "currentPassword" | "newPassword" | "confirmNewPassword";
	label: string;
	register: UseFormRegister<GeneralSettingsFormData>;
	errors: FieldErrors<GeneralSettingsFormData>;
	showPassword: boolean;
	onToggleShowPassword: () => void;
};

function PasswordField({
	name,
	label,
	register,
	errors,
	showPassword,
	onToggleShowPassword,
}: PasswordFieldProps) {
	const error = errors[name];
	const { t } = useTranslation("settings");

	return (
		<div className='flex h-16 w-1/2 flex-col items-start gap-1 p-0'>
			<label className='h-5 text-sm font-medium leading-5 text-text-strong tracking-[-0.006em]'>
				{label}
			</label>
			<div className='relative flex h-10 w-full items-center gap-2 rounded-[10px] border border-border bg-background pl-3 pr-[10px] py-2.5 shadow-[0px_1px_2px_rgba(10,13,20,0.03)]'>
				<input
					type={showPassword ? "text" : "password"}
					{...register(name)}
					className='h-5 flex-1 text-sm font-normal leading-5 text-text-strong tracking-[-0.006em] placeholder:text-text-soft focus:outline-none'
					placeholder={t("generalSettingsPage.security.placeholder")}
				/>
				<button
					type='button'
					onClick={onToggleShowPassword}
					className='flex h-5 w-5 flex-none items-center justify-center'>
					<EyeLine size={20} />
				</button>
			</div>
			{error && (
				<p className='text-sm text-danger'>
					{error.message as string}
				</p>
			)}
		</div>
	);
}

export default PasswordField;

