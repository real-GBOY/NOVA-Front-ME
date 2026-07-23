/** @format */

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { getLoginStatus } from "@/config/axios";
import { Notifications, Xmark } from "@/Icons";
import Button from "@/designSystem/Button";

const PROMPT_DISMISSED_KEY = "notification_prompt_dismissed";
const PROMPT_DELAY_MS = 3000; // Show prompt 3 seconds after app loads

/**
 * A component that prompts the user to enable push notifications.
 * Shows automatically when:
 * - User is logged in
 * - Push notifications are supported
 * - Permission hasn't been granted or denied yet
 * - User hasn't dismissed the prompt before
 */
export default function NotificationPermissionPrompt() {
	const [showPrompt, setShowPrompt] = useState(false);
	const { status, enable, busy } = usePushNotifications();

	useEffect(() => {
		const loggedIn = getLoginStatus();

		if (!loggedIn || !status.supported || status.permission !== "default") {
			setShowPrompt(false);
			return;
		}

		const dismissed = localStorage.getItem(PROMPT_DISMISSED_KEY);
		if (dismissed === "true") {
			setShowPrompt(false);
			return;
		}

		const timer = setTimeout(() => {
			setShowPrompt(true);
		}, PROMPT_DELAY_MS);

		return () => clearTimeout(timer);
	}, [status.supported, status.permission]);

	const handleEnable = async () => {
		await enable();
		setShowPrompt(false);
	};

	const handleDismiss = () => {
		localStorage.setItem(PROMPT_DISMISSED_KEY, "true");
		setShowPrompt(false);
	};

	return (
		<AnimatePresence>
			{showPrompt && (
				<motion.div
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0, y: -20 }}
					transition={{ duration: 0.2 }}
					className="fixed end-4 top-4 z-50 w-[360px] rounded-xl border border-border bg-background p-4 shadow-lg">
					<div className="flex gap-3">
						<div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
							<Notifications size={20} className="text-primary" />
						</div>
						<div className="min-w-0 flex-1">
							<div className="flex items-start justify-between gap-2">
								<h3 className="text-sm font-medium text-text-strong">
									Enable Notifications
								</h3>
								<button
									type="button"
									onClick={handleDismiss}
									aria-label="Dismiss"
									className="text-text-soft hover:text-text-sub">
									<Xmark size={16} />
								</button>
							</div>
							<p className="mt-1 text-sm text-text-sub">
								Stay updated with important alerts about requests, contracts, and more.
							</p>
							<div className="mt-3 flex gap-2">
								<Button
									variant="secondary"
									onClick={handleDismiss}
									disabled={busy}
									className="flex-1">
									Not now
								</Button>
								<Button
									variant="primary"
									onClick={handleEnable}
									disabled={busy}
									isLoading={busy}
									className="flex-1">
									Enable
								</Button>
							</div>
						</div>
					</div>
				</motion.div>
			)}
		</AnimatePresence>
	);
}
