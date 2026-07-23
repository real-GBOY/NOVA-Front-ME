/** @format */

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Modal from "@/designSystem/Modal";
import Button from "@/designSystem/Button";

const LOGIN_WARNING_KEY = "show-login-warning";

export function shouldShowLoginWarning(): boolean {
	if (typeof window === "undefined") return false;
	return sessionStorage.getItem(LOGIN_WARNING_KEY) === "true";
}

export function clearLoginWarning(): void {
	if (typeof window === "undefined") return;
	sessionStorage.removeItem(LOGIN_WARNING_KEY);
}

export function setLoginWarning(): void {
	if (typeof window === "undefined") return;
	sessionStorage.setItem(LOGIN_WARNING_KEY, "true");
}

function LoginWarningModal() {
	const { t } = useTranslation("common");
	const [isOpen, setIsOpen] = useState(false);

	useEffect(() => {
		if (shouldShowLoginWarning()) {
			setIsOpen(true);
		}
	}, []);

	const handleClose = () => {
		clearLoginWarning();
		setIsOpen(false);
	};

	if (!isOpen) return null;

	return (
		<Modal
			isOpen={isOpen}
			onClose={handleClose}
			title={t("loginWarning.title")}
			size="medium"
			showCloseButton={true}
			footer={
				<div className="flex justify-end">
					<Button variant="primary" onClick={handleClose}>
						{t("loginWarning.understand")}
					</Button>
				</div>
			}>
			<div className="space-y-4">
				<p className="text-sm text-text-strong leading-relaxed">
					{t("loginWarning.message")}
				</p>
				<p className="text-sm text-text-strong leading-relaxed">
					{t("loginWarning.message2")}
				</p>
				<p className="text-sm text-text-strong leading-relaxed">
					{t("loginWarning.message3")}
				</p>
				<p className="text-sm text-text-strong leading-relaxed">
					{t("loginWarning.message4")}
				</p>
			</div>
		</Modal>
	);
}

export default LoginWarningModal;
