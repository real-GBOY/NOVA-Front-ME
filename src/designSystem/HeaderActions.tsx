/** @format */

import IconButton from "@/designSystem/IconButton";
import Button from "@/designSystem/Button";
import { GearOutline, FileText } from "@/Icons";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "@/hooks/useTranslation";
import { authService } from "@/services/authService";
import { getLoginStatus } from "@/config/axios";
import { useState, useEffect } from "react";
import { CommandPalette } from "@/components/commandPalette";
import NotificationCenter from "@/components/notifications/NotificationCenter";
import { QuickSearchButton } from "@/designSystem/QuickSearchButton";
import ColorModeSwitch from "@/designSystem/ColorModeSwitch";

function HeaderActions() {
	const navigate = useNavigate();
	const { t } = useTranslation("common");
	const [isLoggedIn, setIsLoggedIn] = useState(getLoginStatus());
	const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

	// Check login status on mount
	useEffect(() => {
		setIsLoggedIn(getLoginStatus());
	}, []);

	// Global keyboard shortcut to open command palette (Cmd+Shift+K or Ctrl+Shift+K)
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === "K") {
				e.preventDefault();
				setIsCommandPaletteOpen(true);
			}
		};

		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, []);

	const [isLoggingOut, setIsLoggingOut] = useState(false);

	const handleSearchClick = () => {
		setIsCommandPaletteOpen(true);
	};

	const handleLogout = async () => {
		try {
			setIsLoggingOut(true);
			await authService.logout();
			setIsLoggedIn(false);
			navigate("/login", { replace: true });
		} catch (error) {
			console.error("Logout failed:", error);
		} finally {
			setIsLoggingOut(false);
		}
	};

	return (
		<>
			<CommandPalette
				isOpen={isCommandPaletteOpen}
				onClose={() => setIsCommandPaletteOpen(false)}
			/>

			<div className='flex items-center gap-1.5 md:gap-2 flex-nowrap'>
				<ColorModeSwitch />
				<QuickSearchButton
					ariaLabel={t("actions.search")}
					onClick={handleSearchClick}
				/>
				<IconButton
					Icon={FileText}
					ariaLabel="Documentation"
					variant='ghost'
					onClick={() => navigate("/dashboard/documentation")}
				/>
				<IconButton
					Icon={GearOutline}
					ariaLabel={t("nav.settings")}
					variant='ghost'
					onClick={() => navigate("/settings")}
				/>
				<NotificationCenter />
				{isLoggedIn && (
					<Button
						onClick={handleLogout}
						disabled={isLoggingOut}
						variant='secondary'
						className='relative px-2 py-1.5 text-xs md:px-3 md:py-2 md:text-sm'>
						{isLoggingOut ? t("auth.loggingOut", "Logging out...") : t("auth.logout")}
					</Button>
				)}
			</div>
		</>
	);
}

export default HeaderActions;
