/** @format */

import {
	GridSquare,
	HeadphoneSimple,
	Users,
	DollarCircle,
	IdCardClipText,
	ClipboardClock,
	Briefcase,
	ChatText,
	WalletClock,
	ChartSquare,
	SackDollar,
	FileText,
	ExclamationCircle,
} from "@/Icons";
import { SidebarGroupType } from "@/designSystem/Sidebar";
import type { IconProps } from "@/designSystem/Sidebar/types";

const MaintenanceIcon = ({ size = 16, active }: IconProps) =>
	ExclamationCircle({ size, active, className: "fill-text-soft" });

export const SYNERGY_LOGO = "https://i.postimg.cc/P5qXfsDy/image.png";

export const AVATAR_SRC = "/icons/defAvatar.png";

export const getMainSidebarGroups = (
	t: (key: string) => string
): SidebarGroupType[] => [
	{
		title: t("sidebarGroups.main"),
		tabs: [
			{
				icon: GridSquare,
				title: t("nav.dashboard"),
				requiredPermissions: ["dashboard.view"],
			},
			{
				icon: Users,
				title: t("nav.members"),
				requiredPermissions: [
					"read_employee_basic",
					"add_employee",
					"update_employee",
					"deactivate_employee",
					"grant_permission",
				],
			},
			{
				icon: IdCardClipText,
				title: t("nav.contracts"),
				requiredPermissions: [
					"read_contract",
					"create_contract",
					"update_contract",
					"terminate_contract",
				],
			},
			{
				icon: ClipboardClock,
				title: t("nav.requests"),
				requiredPermissions: [
					"view_attendance_requests",
					"view_vacation_requests",
					"view_overtime_requests",
					"approve_attendance",
					"approve_vacation",
					"approve_overtime",
				],
			},
		],
	},
	{
		title: t("sidebarGroups.operations"),
		tabs: [
			{
				icon: ChartSquare,
				title: t("nav.reports"),
				requiredPermissions: ["reports.view"],
			},
			{
				icon: WalletClock,
				title: t("nav.vouchers"),
				requiredPermissions: [
					"view_vouchers",
					"create_vouchers",
					"update_vouchers",
					"delete_vouchers",
					"approve_vouchers",
				],
			},
			{
				icon: Briefcase,
				title: t("nav.legalCases"),
				requiredPermissions: [
					"read_legal_case",
					"create_legal_case",
					"update_legal_case",
					"delete_legal_case",
				],
			},
			{
				icon: DollarCircle,
				title: t("nav.loansAdvances"),
				requiredPermissions: [
					"view_invoices",
					"create_invoice",
					"update_invoice",
					"delete_invoice",
					"manage_invoice_payments",
				],
			},
			{
				icon: SackDollar,
				title: t("nav.payrolls"),
				requiredPermissions: [
					"payroll.view_basic",
					"payroll.run_create",
					"payroll.manage_items",
					"payroll.approve",
					"payroll.finalize",
				],
			},
		],
	},
	{
		title: t("sidebarGroups.communication"),
		tabs: [
			{
				icon: ChatText,
				title: t("nav.communication"),
				// Communication is generally available to all authenticated users
			},
			{
				icon: HeadphoneSimple,
				title: t("nav.helpSupport"),
				requiredPermissions: [
					"view_support_tickets",
					"create_support_ticket",
				],
			},
		],
	},
	{
		title: t("sidebarGroups.legal"),
		tabs: [
			{
				icon: FileText,
				title: t("nav.termsAndConditions"),
				// Terms and conditions is generally available to all authenticated users
			},
		],
	},
];
