/** @format */

import { useRef, useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { Button } from "@/designSystem/ui/button";

function VerificationCodeForm() {
	const { t } = useTranslation("auth");
	const [code, setCode] = useState(["", "", "", "", "", ""]);
	const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

	const handleChange = (index: number, value: string) => {
		// Only allow single digit
		if (value.length > 1) return;
		// Only allow numbers
		if (value && !/^\d$/.test(value)) return;

		const newCode = [...code];
		newCode[index] = value;
		setCode(newCode);

		// Auto-focus next input
		if (value && index < 5) {
			inputRefs.current[index + 1]?.focus();
		}
	};

	const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Backspace" && !code[index] && index > 0) {
			inputRefs.current[index - 1]?.focus();
		}
	};

	const handlePaste = (e: React.ClipboardEvent) => {
		e.preventDefault();
		const pastedData = e.clipboardData.getData("text").slice(0, 6);
		if (/^\d+$/.test(pastedData)) {
			const newCode = [...code];
			for (let i = 0; i < 6; i++) {
				newCode[i] = pastedData[i] || "";
			}
			setCode(newCode);
			// Focus the last filled input or the last input
			const lastFilledIndex = Math.min(pastedData.length - 1, 5);
			inputRefs.current[lastFilledIndex]?.focus();
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		const fullCode = code.join("");
		if (fullCode.length === 6) {
			// After successful verification, navigate to reset password page
		}
	};

	const isCodeComplete = code.every((digit) => digit !== "");

	return (
		<form onSubmit={handleSubmit} className="space-y-8">
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
								{t("enterVerificationCode")}
							</h2>
							<p className="font-vt323! font-normal! text-lg text-[#555555] mt-1 text-center">
								{t("verificationCodeDescription", {
									email: "your email",
								})}
							</p>
						</div>
					</div>
				</div>

				<div className="flex gap-2.5 justify-center">
					{code.map((digit, index) => (
						<input
							key={index}
							ref={(el) => (inputRefs.current[index] = el)}
							type="text"
							inputMode="numeric"
							maxLength={1}
							value={digit}
							onChange={(e) => handleChange(index, e.target.value)}
							onKeyDown={(e) => handleKeyDown(index, e)}
							onPaste={index === 0 ? handlePaste : undefined}
							className="flex-1 h-12 min-w-0 rounded-none border-[3px] border-black bg-white text-black text-center text-lg font-vt323 focus-visible:outline-none focus-visible:ring-0"
						/>
					))}
				</div>

				<Button
					type="submit"
					disabled={!isCodeComplete}
					className="w-full rounded-none! border-[3px]! border-black! bg-black! text-white! hover:bg-black/85! font-press-start! text-sm! uppercase! h-12! shadow-[6px_6px_0_#c4c4c4]! disabled:cursor-not-allowed disabled:opacity-60">
					{t("submitCode")}
				</Button>
			</div>

			<div className="flex flex-col gap-1 items-center">
				<p className="font-vt323! font-normal! text-sm text-[#666666] text-center">
					{t("experiencingIssues")}
				</p>
				<button
					type="button"
					onClick={() => {
					}}
					className="font-vt323! font-normal! text-sm underline-offset-4 hover:underline text-[#555555] hover:text-black transition-colors">
					{t("resendCode")}
				</button>
			</div>
		</form>
	);
}

export default VerificationCodeForm;
