/** @format */

export type LegalCaseStatus =
	| "open"
	| "closed"
	| "pending"
	| "in_progress"
	| "on_hold"
	| "cancelled";

export interface LegalCase {
	id: string;
	case_number: string;
	title: string;
	type: string;
	status: string;
	assigned_to: string;
	assigned_to_name?: string;
	client: string;
	description?: string;
	created_at: string;
	updated_at: string;
	priority?: "low" | "medium" | "high";
	start_date?: string;
	end_date?: string;
	Lawyer?: {
		employee_id: number;
		first_name: string;
		last_name: string;
		email: string;
		avatar?: string;
		job_title?: string;
	};
}

// Helper function to format date for display (DD/MM/YYYY format)
export const formatLegalCaseDate = (dateString: string): string => {
	if (!dateString) return "-";
	try {
		const date = new Date(dateString);
		const day = date.getDate().toString().padStart(2, "0");
		const month = (date.getMonth() + 1).toString().padStart(2, "0");
		const year = date.getFullYear();
		return `${day}/${month}/${year}`;
	} catch {
		return dateString;
	}
};

// Get display label for status
// Note: This function is used in the table cell component which handles translations
export const getLegalCaseStatusLabel = (status: string): string => {
	const normalized = status.toLowerCase().replace(/\s+/g, "_");
	const statusMap: Record<string, string> = {
		open: "open",
		closed: "closed",
		pending: "pending",
		in_progress: "inProgress",
		on_hold: "onHold",
		cancelled: "cancelled",
	};
	return statusMap[normalized] || status;
};

// Get badge variant for status
export const getLegalCaseStatusVariant = (
	status: string
): "success" | "warning" | "error" | "info" => {
	const normalizedStatus = status.toLowerCase().replace(/\s+/g, "_");
	if (normalizedStatus === "closed") return "success";
	if (
		normalizedStatus === "pending" ||
		normalizedStatus === "on_hold" ||
		normalizedStatus === "cancelled"
	)
		return "warning";
	if (normalizedStatus === "in_progress") return "info";
	return "info"; // open - using info (blue) for open status
};
