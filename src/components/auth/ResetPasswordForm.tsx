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
					className="text-sm text-primary hover:underline">
					{t("auth:requestNewLink")}
				</Link>
			</div>
		);
	}

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
			<div className="space-y-6">
				<div className="flex flex-col items-center gap-4">
					<div className="flex justify-center mb-2">
						<img
							src="https://i.postimg.cc/FRZj99kX/2.png"
							alt="Logo"
							className="h-16 w-auto object-contain rounded-xl"
						/>
					</div>
					<div className="space-y-2 w-full">
						<div>
							<h2 className="text-2xl font-semibold text-text-main text-center">
								{t("auth:resetPasswordTitle")}
							</h2>
							<p className="text-sm text-text-main mt-1 text-center">
								{t("auth:resetPasswordDescription")}
							</p>
						</div>
					</div>
				</div>

				<div className="grid gap-2">
					<Label htmlFor="password" className="text-text-main">
						{t("auth:newPassword")}
					</Label>
					<div className="relative">
						<Input
							id="password"
							type={showPassword ? "text" : "password"}
							placeholder={t("auth:passwordPlaceholder")}
							{...register("password")}
							className="bg-background/30 border-border text-text-strong/80 focus-visible:ring-0 pr-12"
							disabled={isLoading}
						/>
						<button
							type="button"
							onClick={() => setShowPassword(!showPassword)}
							className="absolute right-3 top-1/2 -translate-y-1/2 text-text-soft hover:text-text-sub transition-colors"
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
					<Label htmlFor="confirmPassword" className="text-text-main">
						{t("auth:confirmPassword")}
					</Label>
					<div className="relative">
						<Input
							id="confirmPassword"
							type={showConfirmPassword ? "text" : "password"}
							placeholder={t("auth:confirmPasswordPlaceholder")}
							{...register("confirmPassword")}
							className="bg-background/30 border-border text-text-strong/80 focus-visible:ring-0 pr-12"
							disabled={isLoading}
						/>
						<button
							type="button"
							onClick={() => setShowConfirmPassword(!showConfirmPassword)}
							className="absolute right-3 top-1/2 -translate-y-1/2 text-text-soft hover:text-text-sub transition-colors"
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
					className="w-full text-text-main">
					{isLoading ? t("auth:resetting") : t("auth:setNewPassword")}
				</Button>
			</div>

			<div className="flex items-center justify-center">
				<Link
					to="/login"
					className="text-sm underline-offset-4 hover:underline text-primary hover:text-primary/80 transition-colors">
					{t("auth:backToLogin")}
				</Link>
			</div>
		</form>
	);
}

export default ResetPasswordForm;
