/** @format */

import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "@/hooks/useTranslation";
import { useConfirmPasswordReset } from "@/hooks/auth/auth.mutations";
import { EyeLine } from "@/Icons";
import { Label } from "@/designSystem/ui/label";
import { Input } from "@/designSystem/ui/input";
import { toast } from "@/utilities/toast";
import PasswordStrengthIndicator from "./PasswordStrengthIndicator";
import { Button } from "@/designSystem/ui/button";

interface ResetPasswordFormData {
	password: string;
	confirmPassword: string;
}

function ResetPasswordForm() {
	const { t } = useTranslation(["auth", "validation"]);
	const [searchParams] = useSearchParams();
	const confirmPasswordResetMutation = useConfirmPasswordReset();
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	// Get email and token from URL (from the reset email link)
	const email = searchParams.get("email") || "";
	const token = searchParams.get("token") || "";

	const schema = yup.object({
		password: yup
			.string()
			.required(t("validation:required"))
			.min(8, t("validation:minLength", { min: 8 }))
			.matches(/[A-Z]/, t("validation:passwordUppercase"))
			.matches(/[a-z]/, t("validation:passwordLowercase"))
			.matches(/\d/, t("validation:passwordNumber"))
			.matches(/[!@#$%^&*(),.?":{}|<>]/, t("validation:passwordSpecial")),
		confirmPassword: yup
			.string()
			.required(t("validation:required"))
			.oneOf([yup.ref("password")], t("validation:passwordMatch")),
	});

	const {
		register,
		handleSubmit,
		watch,
		formState: { errors, isSubmitting },
	} = useForm<ResetPasswordFormData>({
		resolver: yupResolver(schema),
		defaultValues: {
			password: "",
			confirmPassword: "",
		},
	});

	// Watch password for strength indicator
	const watchedPassword = watch("password", "");

	const onSubmit = async (data: ResetPasswordFormData) => {
		if (!email || !token) {
			toast.error(t("auth:invalidResetLink"));
			return;
		}

		await confirmPasswordResetMutation.mutateAsync({
			email,
			token,
			newPassword: data.password,
		});
	};

	const isLoading = isSubmitting || confirmPasswordResetMutation.isPending;

	// Show error if missing required params
	if (!email || !token) {
		return (
			<div className="flex flex-col gap-4 items-center text-center">
				<p className="text-sm text-danger">{t("auth:invalidResetLink")}</p>
				<Link
					to="/forgot-password"
					className="font-vt323! font-normal! text-sm text-[#555555] hover:text-black hover:underline">
					{t("auth:requestNewLink")}
				</Link>
			</div>
		);
	}

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
			<div className="space-y-8">
				<div className="flex flex-col items-center gap-4">
					<div className="flex justify-center mb-2 border-[3px] border-black bg-white p-1">
						<img
							src="https://i.postimg.cc/P5qXfsDy/image.png"
							alt="Logo"
							className="h-14 w-auto object-contain"
						/>
					</div>
					<div className="space-y-3 w-full">
						<div>
							<h2 className="font-press-start text-lg leading-loose tracking-[2px] text-black text-center uppercase">
								{t("auth:resetPasswordTitle")}
							</h2>
							<p className="font-vt323! font-normal! text-lg text-[#555555] mt-1 text-center">
								{t("auth:resetPasswordDescription")}
							</p>
						</div>
					</div>
				</div>

				<div className="grid gap-2">
					<Label htmlFor="password" className="font-vt323! font-normal! text-lg! text-black!">
						{t("auth:newPassword")}
					</Label>
					<div className="relative">
						<Input
							id="password"
							type={showPassword ? "text" : "password"}
							placeholder={t("auth:passwordPlaceholder")}
							{...register("password")}
							className="rounded-none! border-[3px]! border-black! bg-white! font-vt323! font-normal! text-lg! text-black! placeholder:text-[#999999]! focus-visible:ring-0! h-12! pr-12!"
							disabled={isLoading}
						/>
						<button
							type="button"
							onClick={() => setShowPassword(!showPassword)}
							className="absolute right-3 top-1/2 -translate-y-1/2 text-[#999999] hover:text-black transition-colors"
							aria-label={showPassword ? "Hide password" : "Show password"}>
							<EyeLine size={20} />
						</button>
					</div>
					{errors.password && (
						<p className="text-sm text-danger">{errors.password.message}</p>
					)}
				</div>

				<PasswordStrengthIndicator password={watchedPassword} />

				<div className="grid gap-2">
					<Label htmlFor="confirmPassword" className="font-vt323! font-normal! text-lg! text-black!">
						{t("auth:confirmPassword")}
					</Label>
					<div className="relative">
						<Input
							id="confirmPassword"
							type={showConfirmPassword ? "text" : "password"}
							placeholder={t("auth:confirmPasswordPlaceholder")}
							{...register("confirmPassword")}
							className="rounded-none! border-[3px]! border-black! bg-white! font-vt323! font-normal! text-lg! text-black! placeholder:text-[#999999]! focus-visible:ring-0! h-12! pr-12!"
							disabled={isLoading}
						/>
						<button
							type="button"
							onClick={() => setShowConfirmPassword(!showConfirmPassword)}
							className="absolute right-3 top-1/2 -translate-y-1/2 text-[#999999] hover:text-black transition-colors"
							aria-label={
								showConfirmPassword ? "Hide password" : "Show password"
							}>
							<EyeLine size={20} />
						</button>
					</div>
					{errors.confirmPassword && (
						<p className="text-sm text-danger">
							{errors.confirmPassword.message}
						</p>
					)}
				</div>

				<Button
					type="submit"
					disabled={isLoading}
					className="w-full rounded-none! border-[3px]! border-black! bg-black! text-white! hover:bg-black/85! font-press-start! text-sm! uppercase! h-12! shadow-[6px_6px_0_#c4c4c4]!">
					{isLoading ? t("auth:resetting") : t("auth:setNewPassword")}
				</Button>
			</div>

			<div className="flex items-center justify-center">
				<Link
					to="/login"
					className="font-vt323! font-normal! text-sm underline-offset-4 hover:underline text-[#555555] hover:text-black transition-colors">
					{t("auth:backToLogin")}
				</Link>
			</div>
		</form>
	);
}

export default ResetPasswordForm;
