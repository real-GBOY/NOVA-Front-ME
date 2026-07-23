/** @format */

import { useState, useEffect, useRef } from "react";
import Modal from "@/designSystem/Modal";
import Button from "@/designSystem/Button";
import ConfirmModal from "@/designSystem/ConfirmModal";
import { useTranslation } from "@/hooks/useTranslation";

type VerifyCodeModalProps = {
	isOpen: boolean;
	onClose: () => void;
	onSubmit: (code: string) => void;
	onResend?: () => Promise<void> | void;
	email: string;
};

function VerifyCodeModal({
	isOpen,
	onClose,
	onSubmit,
	onResend,
	email,
}: VerifyCodeModalProps) {
	const { t } = useTranslation("settings");
	const { t: tCommon } = useTranslation("common");
	const [code, setCode] = useState<string[]>(["", "", "", "", "", ""]);
	const [timeLeft, setTimeLeft] = useState(60); // 60 seconds
	const [canResend, setCanResend] = useState(false);
	const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
	const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

	useEffect(() => {
		if (isOpen) {
			setTimeLeft(60);
			setCanResend(false);
			setCode(["", "", "", "", "", ""]);
			// Focus first input when modal opens
			setTimeout(() => {
				inputRefs.current[0]?.focus();
			}, 100);
		}
	}, [isOpen]);

	useEffect(() => {
		if (isOpen && timeLeft > 0) {
			const timer = setInterval(() => {
				setTimeLeft((prev) => {
					if (prev <= 1) {
						setCanResend(true);
						return 0;
					}
					return prev - 1;
				});
			}, 1000);

			return () => clearInterval(timer);
		}
	}, [isOpen, timeLeft]);

	const handleCodeChange = (index: number, value: string) => {
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

	const handleKeyDown = (
		index: number,
		e: React.KeyboardEvent<HTMLInputElement>
	) => {
		if (e.key === "Backspace" && !code[index] && index > 0) {
			inputRefs.current[index - 1]?.focus();
		}
	};

	const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
		e.preventDefault();
		const pastedData = e.clipboardData.getData("text").slice(0, 6);
		if (/^\d+$/.test(pastedData)) {
			const newCode = pastedData
				.split("")
				.concat(["", "", "", "", "", ""])
				.slice(0, 6);
			setCode(newCode);
			// Focus the next empty input or the last one
			const nextIndex = Math.min(pastedData.length, 5);
			inputRefs.current[nextIndex]?.focus();
		}
	};

	const handleSubmit = () => {
		const codeString = code.join("");
		if (codeString.length === 6) {
			onSubmit(codeString);
		}
	};

	const handleResend = async () => {
		try {
			await onResend?.();
		} catch (error) {
			console.error("Failed to resend verification code", error);
			return;
		}
		setTimeLeft(60);
		setCanResend(false);
		setCode(["", "", "", "", "", ""]);
		inputRefs.current[0]?.focus();
	};

	const formatTime = (seconds: number) => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
	};

	const isCodeComplete = code.every((digit) => digit !== "");
	const isDirty = code.some((digit) => digit !== "");

	const handleRequestClose = () => {
		if (isDirty) {
			setShowDiscardConfirm(true);
			return;
		}
		onClose();
	};

	return (
		<>
			<Modal
				isOpen={isOpen}
				onClose={handleRequestClose}
				title={t("generalSettingsModals.verifyCode.title")}
				width="max-w-md"
				footer={
					<div className="flex items-center justify-end gap-3">
						<Button variant="secondary" onClick={handleRequestClose}>
							{t("generalSettingsModals.verifyCode.cancel")}
						</Button>
						<Button
							onClick={handleSubmit}
							disabled={!isCodeComplete}
							className="disabled:opacity-50 disabled:cursor-not-allowed">
							{t("generalSettingsModals.verifyCode.submit")}
						</Button>
					</div>
				}>
				<div className="flex flex-col gap-4">
					<p className="text-sm text-text-sub">
						{t("generalSettingsModals.verifyCode.description")}{" "}
						<span className="font-medium text-text-strong">{email}</span>
					</p>

				<div className="flex items-center justify-center gap-2">
					{code.map((digit, index) => (
						<input
							key={index}
							ref={(el) => (inputRefs.current[index] = el)}
							type="text"
							inputMode="numeric"
							maxLength={1}
							value={digit}
							onChange={(e) => handleCodeChange(index, e.target.value)}
							onKeyDown={(e) => handleKeyDown(index, e)}
							onPaste={index === 0 ? handlePaste : undefined}
							className="w-12 h-12 text-center text-lg font-medium rounded-lg border border-border bg-background text-text-strong focus:outline-none"
						/>
					))}
				</div>

				<div className="flex items-center justify-center gap-2 text-sm">
					{canResend ? (
						<>
							<span className="text-text-sub">
								{t("generalSettingsModals.verifyCode.resendPrompt")}
							</span>
							<Button
								variant="secondary"
								onClick={handleResend}
								className="px-0 py-0 h-auto bg-transparent border-0 text-primary font-medium hover:underline shadow-none">
								{t("generalSettingsModals.verifyCode.resend")}
							</Button>
						</>
					) : (
						<span className="text-text-sub">
							{t("generalSettingsModals.verifyCode.resendAfter", {
								time: formatTime(timeLeft),
							})}
						</span>
					)}
				</div>
			</div>
			</Modal>
			<ConfirmModal
				isOpen={showDiscardConfirm}
				onClose={() => setShowDiscardConfirm(false)}
				onConfirm={() => {
					setShowDiscardConfirm(false);
					onClose();
				}}
				title={tCommon("unsavedChanges.title")}
				description={tCommon("unsavedChanges.description")}
				confirmText={tCommon("unsavedChanges.confirm")}
				cancelText={tCommon("unsavedChanges.cancel")}
			/>
		</>
	);
}

export default VerifyCodeModal;
