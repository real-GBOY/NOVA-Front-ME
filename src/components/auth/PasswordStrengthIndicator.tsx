/** @format */

import { useMemo } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { CheckCircle } from "@/Icons";

interface PasswordStrengthIndicatorProps {
	password: string;
	className?: string;
}

interface PasswordRequirement {
	key: string;
	label: string;
	test: (password: string) => boolean;
}

function PasswordStrengthIndicator({
	password,
	className = "",
}: PasswordStrengthIndicatorProps) {
	const { t } = useTranslation("auth");

	const requirements: PasswordRequirement[] = useMemo(
		() => [
			{
				key: "minLength",
				label: t("passwordRequirements.minLength"),
				test: (pwd: string) => pwd.length >= 8,
			},
			{
				key: "uppercase",
				label: t("passwordRequirements.uppercase"),
				test: (pwd: string) => /[A-Z]/.test(pwd),
			},
			{
				key: "lowercase",
				label: t("passwordRequirements.lowercase"),
				test: (pwd: string) => /[a-z]/.test(pwd),
			},
			{
				key: "number",
				label: t("passwordRequirements.number"),
				test: (pwd: string) => /\d/.test(pwd),
			},
			{
				key: "special",
				label: t("passwordRequirements.special"),
				test: (pwd: string) => /[!@#$%^&*(),.?":{}|<>]/.test(pwd),
			},
		],
		[t]
	);

	const fulfilledCount = useMemo(
		() => requirements.filter((req) => req.test(password)).length,
		[password, requirements]
	);

	const strengthPercentage = (fulfilledCount / requirements.length) * 100;

	const getStrengthColor = () => {
		if (strengthPercentage <= 20) return "bg-danger";
		if (strengthPercentage <= 40) return "bg-warning";
		if (strengthPercentage <= 60) return "bg-yellow-500";
		if (strengthPercentage <= 80) return "bg-blue-500";
		return "bg-success";
	};

	const getStrengthLabel = () => {
		if (strengthPercentage <= 20) return t("passwordStrength.veryWeak");
		if (strengthPercentage <= 40) return t("passwordStrength.weak");
		if (strengthPercentage <= 60) return t("passwordStrength.fair");
		if (strengthPercentage <= 80) return t("passwordStrength.good");
		return t("passwordStrength.strong");
	};

	return (
		<div className={`flex flex-col gap-3 font-vt323 ${className}`}>
			{/* Strength Bar */}
			<div className="flex flex-col gap-1.5">
				<div className="flex items-center justify-between">
					<span className="font-vt323! font-normal! text-base text-[#555555]">
						{t("passwordStrength.label")}
					</span>
					<span className="font-vt323! font-normal! text-base text-black">
						{getStrengthLabel()}
					</span>
				</div>
				<div className="h-2 w-full border border-black/20 bg-white overflow-hidden">
					<div
						className={`h-full transition-all duration-300 ease-out ${getStrengthColor()}`}
						style={{ width: `${strengthPercentage}%` }}
					/>
				</div>
			</div>

			{/* Requirements List */}
			<div className="flex flex-col gap-1.5">
				{requirements.map((req) => {
					const isFulfilled = req.test(password);
					return (
						<div
							key={req.key}
							className="flex items-center gap-2 text-sm transition-colors duration-200">
							<CheckCircle
								size={14}
								className={`shrink-0 transition-colors duration-200 ${
									isFulfilled ? "text-success" : "text-[#999999]"
								}`}
							/>
							<span
								className={`font-vt323! font-normal! transition-colors duration-200 ${
									isFulfilled ? "text-black" : "text-[#999999]"
								}`}>
								{req.label}
							</span>
						</div>
					);
				})}
			</div>
		</div>
	);
}

export default PasswordStrengthIndicator;
