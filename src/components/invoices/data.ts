/** @format */

// Re-export types from service for convenience
export type {
	Invoice,
	InvoiceStatus,
	InvoiceItem,
} from "@/services/invoiceService";

// Helper function to format date for display
export const formatInvoiceDate = (dateString: string): string => {
	if (!dateString) return "-";
	try {
		const date = new Date(dateString);
		const hours = date.getHours();
		const minutes = date.getMinutes();
		const ampm = hours >= 12 ? "PM" : "AM";
		const displayHours = hours % 12 || 12;
		const displayMinutes = minutes.toString().padStart(2, "0");
		const day = date.getDate();
		const month = date.toLocaleString("default", { month: "short" });
		return `${displayHours}:${displayMinutes} ${ampm} • ${day} ${month}`;
	} catch {
		return dateString;
	}
};

// Map backend status to display status
// Backend uses: Draft, Pending, Partially_Paid, Fully_Paid, Cancelled, Refunded, Void
export const mapInvoiceStatusToDisplay = (
	status: string
): "fullyPaid" | "pending" | "draft" => {
	const normalizedStatus = status.toLowerCase();
	if (
		normalizedStatus === "fully_paid" ||
		normalizedStatus === "fullypaid"
	)
		return "fullyPaid";
	if (normalizedStatus === "pending") return "pending";
	if (normalizedStatus === "draft") return "draft";
	if (
		normalizedStatus === "partially_paid" ||
		normalizedStatus === "partiallypaid"
	)
		return "pending"; // Show as pending
	return "pending"; // default
};

// Get display label for backend status
export const getInvoiceStatusLabel = (status: string): string => {
	const statusMap: Record<string, string> = {
		Draft: "Draft",
		Pending: "Pending",
		Partially_Paid: "Partially Paid",
		Fully_Paid: "Fully Paid",
		Cancelled: "Cancelled",
		Void: "Void",
		Refunded: "Refunded",
		// Legacy support
		draft: "Draft",
		pending: "Pending",
		fullyPaid: "Fully Paid",
		fully_paid: "Fully Paid",
		void: "Void",
		partiallyPaid: "Partially Paid",
		partially_paid: "Partially Paid",
		overdue: "Overdue",
		cancelled: "Cancelled",
	};
	return statusMap[status] || status;
};

// Get badge variant for backend status
export const getInvoiceStatusVariant = (
	status: string
): "success" | "warning" | "error" | "info" => {
	const normalizedStatus = status.toLowerCase();
	if (
		normalizedStatus === "fully_paid" ||
		normalizedStatus === "fullypaid"
	)
		return "success";
	if (normalizedStatus === "pending")
		return "warning";
	if (
		normalizedStatus === "partially_paid" ||
		normalizedStatus === "partiallypaid"
	)
		return "info"; // Blue for partially paid
	if (
		normalizedStatus === "cancelled" ||
		normalizedStatus === "void" ||
		normalizedStatus === "overdue" ||
		normalizedStatus === "refunded"
	)
		return "error";
	return "info"; // Draft
};
