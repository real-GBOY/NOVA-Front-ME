/** @format */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Popover, PopoverContent, PopoverTrigger } from "@/designSystem/ui/popover";
import { useNotificationsStore } from "@/hooks/useNotificationsStore";
import {
	markRead,
	clearByCategory,
	type InAppNotification,
	type InAppNotificationAction,
} from "@/services/notifications/notificationsStore";
import { getRouteForAction } from "@/services/notifications/notificationEvents";
import {
	Notifications,
	Xmark,
	ClipboardXmark,
	ClipboardClock,
	LaptopExchange,
	InfoCircle,
} from "@/Icons";
import Avatar from "@/designSystem/Avatar";
import IconButton from "@/designSystem/IconButton";
import { useTranslation } from "@/hooks/useTranslation";
import { cn } from "@/utilities/index";
import { useQueryClient } from "@tanstack/react-query";
import { Trash } from "@/Icons";

type Tab = "all" | "requests" | "contracts" | "messages" | "system";

const TABS: Tab[] = ["all", "requests", "contracts", "messages", "system"];

function formatNotificationTime(createdAt: string): { date: string; time: string } {
	const date = new Date(createdAt);
	const now = new Date();
	const diffMs = now.getTime() - date.getTime();
	const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
	const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

	let dateStr: string;
	if (diffDays === 0) {
		dateStr = "Today";
	} else if (diffDays === 1) {
		dateStr = "Yesterday";
	} else {
		dateStr = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
	}

	let timeStr: string;
	if (diffMs < 60000) {
		timeStr = "Just Now";
	} else if (diffHours < 1) {
		const mins = Math.floor(diffMs / 60000);
		timeStr = `${mins}m ago`;
	} else if (diffHours < 24) {
		timeStr = `${diffHours}h ago`;
	} else {
		timeStr = date.toLocaleTimeString("en-US", {
			hour: "2-digit",
			minute: "2-digit",
			hour12: true,
		});
	}

	return { date: dateStr, time: timeStr };
}

function getCategoryFromType(notificationType: string | null): string {
	const t = (notificationType || "").toLowerCase();
	// Contracts
	if (t.includes("contract")) return "Contract";
	// Requests (vacation, overtime, time off)
	if (
		t.includes("request") ||
		t.includes("timeoff") ||
		t.includes("time_off") ||
		t.includes("overtime") ||
		t.includes("vacation")
	)
		return "Requests";
	// Assets
	if (t.includes("asset")) return "Assets";
	// Messages and Chat
	if (t.includes("message") || t.includes("chat")) return "Messages";
	// Onboarding
	if (t.includes("onboarding")) return "Onboarding";
	// Support Tickets
	if (t.includes("support")) return "Support";
	// Payroll
	if (t.includes("payroll")) return "Payroll";
	// Attendance
	if (t.includes("attendance")) return "Attendance";
	// Shifts
	if (t.includes("shift")) return "Shift";
	// Profile
	if (t.includes("profile")) return "Profile";
	// Default
	return "System";
}

function getIconTypeFromNotification(n: InAppNotification): InAppNotification["iconType"] {
	if (n.iconType) return n.iconType;
	const t = (n.notificationType || "").toLowerCase();
	const title = n.title.toLowerCase();

	if (title.includes("reject") || title.includes("denied")) return "error";
	if (title.includes("expir") || title.includes("warning")) return "warning";
	if (title.includes("pending") || title.includes("request")) return "pending";
	if (title.includes("approved") || title.includes("success")) return "success";
	if (t.includes("asset") || title.includes("asset")) return "asset";
	return "info";
}

function NotificationIcon({
	notification,
	className = "",
}: {
	notification: InAppNotification;
	className?: string;
}) {
	const iconType = getIconTypeFromNotification(notification);

	// If notification has an avatar URL, show avatar with status badge
	if (notification.avatarUrl) {
		const badgeColors: Record<string, string> = {
			warning: "bg-warning",
			info: "bg-primary",
			success: "bg-success",
			error: "bg-danger",
			pending: "bg-primary", // Figma uses blue for pending
			asset: "bg-primary",
		};

		let badgeColor = badgeColors[iconType || "info"];
		if (notification.title.toLowerCase().includes("pending")) badgeColor = "bg-primary";
		if (notification.title.toLowerCase().includes("expir")) badgeColor = "bg-warning";

		const BadgeIcon =
			iconType === "asset"
				? LaptopExchange
				: iconType === "error"
					? ClipboardXmark
					: ClipboardClock;

		return (
			<div className={cn("relative size-[40px] shrink-0", className)}>
				<Avatar src={notification.avatarUrl} className="size-full rounded-full" alt="" />
				<div
					className={cn(
						"absolute -bottom-0 -right-0 flex size-[16px] items-center justify-center rounded-full border-[0.5px] border-border",
						badgeColor
					)}>
					<BadgeIcon size={8} className="text-white" />
				</div>
			</div>
		);
	}

	// Icon-based notification (system, asset, etc.)
	const IconComponent =
		iconType === "error"
			? ClipboardXmark
			: iconType === "warning" || iconType === "pending"
				? ClipboardClock
				: iconType === "asset"
					? LaptopExchange
					: InfoCircle;

	const iconStyles: Record<string, string> = {
		error: "text-danger",
		warning: "text-warning",
		info: "text-text-sub",
		success: "text-success",
		pending: "text-primary",
		asset: "text-text-sub",
	};

	let iconColor = iconStyles[iconType || "info"];
	if (notification.title.toLowerCase().includes("reject")) iconColor = "text-danger";

	return (
		<div
			className={cn(
				"flex size-[40px] shrink-0 items-center justify-center rounded-full border border-border bg-bg-weak shadow-[0px_1px_2px_0px_rgba(10,13,20,0.03)]",
				className
			)}>
			<div className="relative size-[20px]">
				<IconComponent className={cn("size-full", iconColor)} />
			</div>
		</div>
	);
}

function NotificationItem({
	notification,
	onAction,
}: {
	notification: InAppNotification;
	onAction: (action: InAppNotificationAction, notification: InAppNotification) => void;
}) {
	const { date, time } = formatNotificationTime(notification.createdAt);
	const categoryTag = notification.categoryTag || getCategoryFromType(notification.notificationType);

	return (
		<div className="flex gap-[12px] border-b border-border bg-background px-[20px] py-[16px] transition-colors hover:bg-bg-weak/50 last:border-b-0">
			<NotificationIcon notification={notification} />

			<div className="flex min-w-0 flex-1 flex-col gap-[16px]">
				<div className="flex w-full flex-col gap-[4px]">
					{/* Title & Tag */}
					<div className="flex w-full items-center gap-[8px]">
						<p className="text-[14px] font-medium leading-[20px] tracking-[-0.084px] text-text-strong">
							{notification.title}
						</p>
						<div className="flex items-center justify-center rounded-[6px] border-[0.5px] border-border bg-background px-[6px] py-[2px]">
							<p className="text-[12px] font-medium leading-[16px] text-text-sub">
								{categoryTag}
							</p>
						</div>
					</div>

					{/* Body */}
					<p className="whitespace-pre-wrap text-[14px] font-normal leading-[20px] tracking-[-0.084px] text-text-sub">
						{notification.body}
					</p>

					{/* Timestamp */}
					<div className="flex items-center gap-[4px] text-[12px] font-normal leading-[16px] text-text-soft">
						<span>{date}</span>
						<span>•</span>
						<span>{time}</span>
					</div>
				</div>

				{/* Reason text */}
				{notification.reasonText && (
					<div className="flex w-full items-center rounded-[10px] border border-border bg-bg-weak px-[8px] py-[6px] shadow-[0px_1px_2px_0px_rgba(10,13,20,0.03)]">
						<p className="flex-1 text-[14px] font-normal leading-[20px] tracking-[-0.084px] text-text-sub">
							"{notification.reasonText}"
						</p>
					</div>
				)}

				{/* Action buttons */}
				{notification.actions.length > 0 && (
					<div className="flex w-full items-start gap-[8px]">
						{notification.actions.slice(0, 2).map((action) => {
							const isPrimary =
								action.style?.toLowerCase() === "primary" ||
								action.title.toLowerCase().includes("extend") ||
								action.title.toLowerCase().includes("approve");

							return (
								<button
									key={action.action}
									type="button"
									onClick={() => onAction(action, notification)}
									className={cn(
										"flex items-center justify-center gap-[2px] overflow-hidden rounded-[10px] p-[6px] px-[6px] transition-colors",
										isPrimary
											? "bg-primary text-white hover:bg-primary/90"
											: "border border-border bg-background text-text-sub shadow-[0px_1px_2px_0px_rgba(10,13,20,0.03)] hover:bg-bg-weak"
									)}>
									<div className="flex items-center justify-center px-[4px]">
										<p className="whitespace-nowrap text-[14px] font-medium leading-[20px] tracking-[-0.084px]">
											{action.title}
										</p>
									</div>
								</button>
							);
						})}
					</div>
				)}
			</div>
		</div>
	);
}

export default function NotificationCenter() {
	const { t } = useTranslation("common");
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const [open, setOpen] = useState(false);
	const [tab, setTab] = useState<Tab>("all");

	const { items, unreadCount } = useNotificationsStore(tab);
	const hasUnread = unreadCount > 0;

	const handleTriggerClick = () => {
		setOpen((o) => !o);
	};

	const handleClearTab = () => {
		clearByCategory(tab);
	};

	const handleAction = (action: InAppNotificationAction, notification: InAppNotification) => {
		markRead(notification.id);

		// Invalidate chat queries when marking message notifications as read
		const isMessageNotification =
			notification.notificationType?.toLowerCase().includes("message") ||
			notification.notificationType?.toLowerCase().includes("chat");

		if (isMessageNotification) {
			// Invalidate chat rooms to update unread counts in sidebar
			queryClient.invalidateQueries({ queryKey: ["chat", "rooms"] });
		}

		// Handle Reply action for messages - navigate to messages with location state
		if (action.action === "reply" || action.title.toLowerCase() === "reply") {
			// Extract sender name from title
			const senderName =
				(notification.payload?.senderName as string | undefined) ||
				notification.title.replace(/^New message from /i, "").trim();

			// Use location state instead of URL query
			navigate("/dashboard/messages", {
				state: { searchQuery: senderName }
			});
			setOpen(false);
			return;
		}

		// Check for URL or path in payload
		const url = notification.payload?.url || notification.payload?.href;
		if (typeof url === "string" && url) {
			window.location.assign(url);
			return;
		}

		const path = notification.payload?.path || notification.payload?.route;
		if (typeof path === "string" && path) {
			navigate(path);
			setOpen(false);
			return;
		}

		// Fallback: Use action-to-route mapping
		const mappedRoute = getRouteForAction(action.action, notification.payload);
		if (mappedRoute) {
			navigate(mappedRoute);
			setOpen(false);
			return;
		}

		// Close dropdown if no navigation
		setOpen(false);
	};

	const tabLabels: Record<Tab, string> = {
		all: "All",
		requests: "Requests",
		contracts: "Contracts",
		messages: "Messages",
		system: "System",
	};

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<div className="relative cursor-pointer" onClick={() => void handleTriggerClick()}>
					<IconButton Icon={Notifications} ariaLabel={t("notifications")} variant="ghost" />
					{hasUnread && (
						<span className="absolute end-1.5 top-1.5 size-2 rounded-full bg-danger" />
					)}
				</div>
			</PopoverTrigger>

			<PopoverContent
				align="end"
				className="w-[400px] rounded-[12px] border border-border bg-bg-weak p-0 shadow-[0px_4px_6px_-2px_rgba(10,13,20,0.03),0px_12px_16px_-4px_rgba(10,13,20,0.08)]"
				sideOffset={8}>
				<div className="flex w-full flex-col">
					{/* Header */}
					<div className="flex flex-col gap-[16px] border-b border-border p-2">
						<div className="flex w-full items-center justify-between">
							<p className="text-[16px] font-medium leading-[24px] tracking-[-0.176px] text-text-strong">
								Notifications
							</p>
							<div className="flex items-center gap-2">
								{items.length > 0 && (
									<button
										type="button"
										aria-label={`Clear ${tab === "all" ? "all" : tab} notifications`}
										onClick={handleClearTab}
										className="flex size-[28px] items-center justify-center rounded-[8px] text-text-sub hover:bg-bg-weak hover:text-text-strong transition-colors">
										<Trash size={16} />
									</button>
								)}
								<button
									type="button"
									aria-label="Close"
									onClick={() => setOpen(false)}
									className="flex size-[28px] items-center justify-center rounded-[8px] text-text-sub hover:bg-bg-weak hover:text-text-strong transition-colors">
									<Xmark size={16} />
								</button>
							</div>
						</div>

						{/* Segmented Control Tabs */}
						<div className="flex w-full gap-[4px] rounded-[8px] bg-bg-weak p-[2px]">
							{TABS.map((t) => (
								<button
									key={t}
									type="button"
									onClick={() => setTab(t)}
									className={cn(
										"flex flex-1 items-center justify-center rounded-[6px] p-[4px] transition-all",
										tab === t
											? "bg-background text-text-strong shadow-[0px_1px_2px_0px_rgba(10,13,20,0.03)]"
											: "text-text-soft hover:text-text-sub"
									)}>
									<p className="text-center text-[14px] font-medium leading-[20px] tracking-[-0.084px]">
										{tabLabels[t]}
									</p>
								</button>
							))}
						</div>
					</div>

					{/* Notifications List */}
					<div className="max-h-[480px] overflow-y-auto">
						{items.length === 0 ? (
							<div className="flex flex-col items-center justify-center gap-2 px-[20px] py-12 text-center">
								<Notifications size={32} className="text-text-soft" />
								<p className="text-sm text-text-sub">No notifications yet</p>
							</div>
						) : (
							items.map((n) => (
								<NotificationItem key={n.id} notification={n} onAction={handleAction} />
							))
						)}
					</div>
				</div>
			</PopoverContent>
		</Popover>
	);
}
