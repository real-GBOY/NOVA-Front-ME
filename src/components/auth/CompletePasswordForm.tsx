/** @format */

import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "@/hooks/useTranslation";
import { useCompletePassword } from "@/hooks/auth/auth.mutations";
import { Lock2LineAuth, EyeLine } from "@/Icons";
import { Label } from "@/designSystem/ui/label";
import { Input } from "@/designSystem/ui/input";
import { toast } from "@/utilities/toast";
import PasswordStrengthIndicator from "./PasswordStrengthIndicator";
import { Button } from "@/designSystem/ui/button";

interface CompletePasswordFormData {
	password: string;
	confirmPassword: string;
}

function CompletePasswordForm() {
	const { t } = useTranslation(["auth", "validation"]);
	const [searchParams] = useSearchParams();
	const completePasswordMutation = useCompletePassword();
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
	} = useForm<CompletePasswordFormData>({
		resolver: yupResolver(schema),
		defaultValues: {
			password: "",
			confirmPassword: "",
		},
	});

	// Watch password for strength indicator
	const watchedPassword = watch("password", "");

	const onSubmit = async (data: CompletePasswordFormData) => {
		const employeeId = searchParams.get("employeeId");
		const inviteToken = searchParams.get("inviteToken");

		if (!employeeId || !inviteToken) {
			toast.error(t("auth:invalidInviteLink"));
			return;
		}

		await completePasswordMutation.mutateAsync({
			employeeId: parseInt(employeeId, 10),
			inviteToken,
			password: data.password,
		});
	};

	const isLoading = isSubmitting || completePasswordMutation.isPending;

	// Show error if missing required params
	const employeeId = searchParams.get("employeeId");
	const inviteToken = searchParams.get("inviteToken");

	if (!employeeId || !inviteToken) {
		return (
			<div className="flex flex-col gap-4 items-center text-center">
				<p className="text-sm text-danger">{t("auth:invalidInviteLink")}</p>
				<p className="text-sm text-text-sub">
					{t("auth:invalidInviteLinkDescription")}
				</p>
			</div>
		);
	}

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6 w-full">
			<div className="flex flex-col gap-2">
				<Label htmlFor="password" className="text-sm font-medium text-text-strong">
					{t("auth:yourPassword")}
				</Label>
				<div className="relative flex items-center gap-3 rounded-xl border border-border bg-background px-4 py-3 shadow-subtle transition-all focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15">
					<Lock2LineAuth size={20} className="text-text-soft shrink-0" />
					<Input
						id="password"
						type={showPassword ? "text" : "password"}
						placeholder={t("auth:passwordPlaceholder")}
						{...register("password")}
						className="flex-1 border-0 bg-transparent px-0 py-0 text-sm text-text-strong placeholder:text-text-soft focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none"
						disabled={isLoading}
					/>
					<button
						type="button"
						onClick={() => setShowPassword(!showPassword)}
						className="shrink-0 text-text-soft hover:text-text-sub transition-colors"
						aria-label={showPassword ? "Hide password" : "Show password"}>
						<EyeLine size={20} />
					</button>
				</div>
				{errors.password && (
					<p className="text-sm text-danger">{errors.password.message}</p>
				)}
			</div>

			{/* Password Strength Indicator */}
			<PasswordStrengthIndicator password={watchedPassword} />

			<div className="flex flex-col gap-2">
				<Label
					htmlFor="confirmPassword"
					className="text-sm font-medium text-text-strong">
					{t("auth:confirmPassword")}
				</Label>
				<div className="relative flex items-center gap-3 rounded-xl border border-border bg-background px-4 py-3 shadow-subtle transition-all focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15">
					<Lock2LineAuth size={20} className="text-text-soft shrink-0" />
					<Input
						id="confirmPassword"
						type={showConfirmPassword ? "text" : "password"}
						placeholder={t("auth:confirmPasswordPlaceholder")}
						{...register("confirmPassword")}
						className="flex-1 border-0 bg-transparent px-0 py-0 text-sm text-text-strong placeholder:text-text-soft focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none"
						disabled={isLoading}
					/>
					<button
						type="button"
						onClick={() => setShowConfirmPassword(!showConfirmPassword)}
						className="shrink-0 text-text-soft hover:text-text-sub transition-colors"
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
				className="h-11 w-full rounded-xl text-sm font-semibold shadow-[0_10px_30px_-12px_rgba(0,0,0,0.25)] hover:scale-[1.01] active:scale-[0.99]">
				{isLoading ? t("auth:continuing") : t("auth:continue")}
			</Button>

			<div className="flex flex-col gap-1 items-center">
				<p className="text-sm text-text-sub text-center">
					{t("auth:dontHaveAccess")}
				</p>
				<Link
					to="/forgot-password"
					className="text-sm text-text-strong hover:text-primary underline transition-colors">
					{t("auth:tryAnotherMethod")}
				</Link>
			</div>
		</form>
	);
}

export default CompletePasswordForm;
