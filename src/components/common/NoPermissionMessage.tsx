/** @format */

import React from "react";
import { useTranslation } from "@/hooks/useTranslation";
import LockCircle from "@/Icons/lock-circle";

interface NoPermissionMessageProps {
	/** Custom message to display */
	message?: string;
	/** Custom description text */
	description?: string;
	/** Custom icon to display */
	icon?: React.ReactNode;
	/** Size variant */
	size?: "small" | "medium" | "large";
	/** Additional CSS class */
	className?: string;
}

/**
 * NoPermissionMessage
 * 
 * A reusable component for displaying "No permission" state in tables/sections.
 * Follows the design pattern of MembersNoResults and similar empty states.
 */
export function NoPermissionMessage({
	message,
	description,
	icon,
	size = "medium",
	className = "",
}: NoPermissionMessageProps) {
	const { t } = useTranslation("common");

	const sizeClasses = {
		small: {
			container: "gap-3 pt-6",
			icon: "size-10",
			title: "text-sm",
			description: "text-xs w-[240px]",
		},
		medium: {
			container: "gap-6 pt-12",
			icon: "size-16",
			title: "text-lg",
			description: "text-sm w-[308px]",
		},
		large: {
			container: "gap-8 pt-16",
			icon: "size-20",
			title: "text-xl",
			description: "text-base w-[360px]",
		},
	};

	const sizeClass = sizeClasses[size];

	return (
		<div
			className={`flex w-full flex-col items-center justify-center ${sizeClass.container} ${className}`}
		>
			{/* Icon */}
			<div
				className={`${sizeClass.icon} flex items-center justify-center rounded-full bg-danger/10`}
			>
				{icon || (
					<LockCircle
						size={size === "small" ? 24 : size === "medium" ? 32 : 40}
						className="fill-danger"
					/>
				)}
			</div>

			{/* Text content */}
			<div className="flex flex-col items-center gap-2 text-center">
				<p
					className={`font-medium leading-6 text-text-strong tracking-tight ${sizeClass.title}`}
				>
					{message || t("permissions.noAccess")}
				</p>
				<p
					className={`text-text-sub font-normal leading-5 ${sizeClass.description}`}
				>
					{description || t("permissions.noAccessDescription")}
				</p>
			</div>
		</div>
	);
}

export default NoPermissionMessage;
