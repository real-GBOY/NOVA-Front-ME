/** @format */

export type PermissionCategory = {
	category: string;
	permissions: string[];
};

export const PERMISSION_CATEGORIES: PermissionCategory[] = [
	{
		category: "Dashboard",
		permissions: ["View Dashboard"],
	},
	{
		category: "Employee",
		permissions: [
			"View Employees Info",
			"Add Employees",
			"Edit Employee Info",
			"Remove / Deactivate Employees",
		],
	},
	{
		category: "Attendance",
		permissions: ["View Attendance Logs", "Edit Corrections"],
	},
	{
		category: "Leave Management",
		permissions: ["View Leave Requests", "Approve / Reject Leaves"],
	},
	{
		category: "Payroll",
		permissions: [
			"View Payroll",
			"Run Payroll",
			"Edit Payroll",
			"Export Payroll",
			"Manage Benefits & Deductions",
		],
	},
];

export const ADDITIONAL_PERMISSIONS = [
	"Reports",
	"Contracts",
	"Integrations",
	"Support Tickets",
	"Announcements",
];
