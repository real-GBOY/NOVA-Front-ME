/** @format */

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useTranslation } from "@/hooks/useTranslation";
import { useRequestPasswordReset } from "@/hooks/auth/auth.mutations";
import { Label } from "@/designSystem/ui/label";
import { Input } from "@/designSystem/ui/input";
import { Link } from "react-router-dom";
import { Button } from "@/designSystem/ui/button";

interface ForgotPasswordFormData {
	email: string;
}

function ForgotPasswordForm() {
	const { t } = useTranslation(["auth", "validation"]);
	const requestPasswordResetMutation = useRequestPasswordReset();

	const schema = yup.object({
		email: yup
			.string()
			.required(t("validation:required"))
			.email(t("validation:email")),
	});

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<ForgotPasswordFormData>({
		resolver: yupResolver(schema),
		defaultValues: {
			email: "",
		},
	});

	const onSubmit = async (data: ForgotPasswordFormData) => {
		const baseUrl = window.location.origin;
		await requestPasswordResetMutation.mutateAsync({
			email: data.email,
			resetUrl: `${baseUrl}/reset-password`,
			clientUrl: `${baseUrl}/reset-password`,
			ttlMinutes: 15,
		});
	};

	const isLoading = isSubmitting || requestPasswordResetMutation.isPending;

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
								{t("auth:forgotPasswordTitle")}
							</h2>
							<p className="text-sm text-text-main mt-1 text-center">
								{t("auth:forgotPasswordDescription")}
							</p>
						</div>
					</div>
				</div>

				<div className="grid gap-2">
					<Label htmlFor="email" className="text-text-main">
						{t("auth:emailAddress")}
					</Label>
					<Input
						id="email"
						type="email"
						placeholder={t("auth:emailPlaceholder")}
						className="bg-background/30 border-border text-text-strong/80 focus-visible:ring-0"
						{...register("email")}
						disabled={isLoading}
					/>
					{errors.email && (
						<p className="text-sm text-danger">{errors.email.message}</p>
					)}
				</div>

				<Button
					type="submit"
					disabled={isLoading}
					className="w-full text-text-main">
					{isLoading ? t("auth:resetting") : t("auth:resetPassword")}
				</Button>
			</div>

			<div className="flex flex-col gap-1 items-center">
				<Link
					to="/login"
					className="text-sm underline-offset-4 hover:underline text-primary hover:text-primary/80 transition-colors">
					{t("auth:backToLogin")}
				</Link>
			</div>
		</form>
	);
}

export default ForgotPasswordForm;
