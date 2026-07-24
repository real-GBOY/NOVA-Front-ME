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
								{t("auth:forgotPasswordTitle")}
							</h2>
							<p className="font-vt323! font-normal! text-lg text-[#555555] mt-1 text-center">
								{t("auth:forgotPasswordDescription")}
							</p>
						</div>
					</div>
				</div>

				<div className="grid gap-2">
					<Label htmlFor="email" className="font-vt323! font-normal! text-lg! text-black!">
						{t("auth:emailAddress")}
					</Label>
					<Input
						id="email"
						type="email"
						placeholder={t("auth:emailPlaceholder")}
						className="rounded-none! border-[3px]! border-black! bg-white! font-vt323! font-normal! text-lg! text-black! placeholder:text-[#999999]! focus-visible:ring-0! h-12!"
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
					className="w-full rounded-none! border-[3px]! border-black! bg-black! text-white! hover:bg-black/85! font-press-start! text-sm! uppercase! h-12! shadow-[6px_6px_0_#c4c4c4]!">
					{isLoading ? t("auth:resetting") : t("auth:resetPassword")}
				</Button>
			</div>

			<div className="flex flex-col gap-1 items-center">
				<Link
					to="/login"
					className="font-vt323! font-normal! text-sm underline-offset-4 hover:underline text-[#555555] hover:text-black transition-colors">
					{t("auth:backToLogin")}
				</Link>
			</div>
		</form>
	);
}

export default ForgotPasswordForm;
