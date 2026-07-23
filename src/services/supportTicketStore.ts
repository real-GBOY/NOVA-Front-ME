/** @format */

type HelpSupportTab = "incoming" | "own" | "initiated";

class SupportTicketStore {
	private readonly STORAGE_KEY = "help_support_initiated_ticket_ids";
	private readonly ACTIVE_TAB_KEY = "help_support_active_tab";
	private readonly MAX_ITEMS = 50;

	private canUseStorage() {
		return typeof window !== "undefined" && typeof localStorage !== "undefined";
	}

	getInitiatedTicketIds(): number[] {
		if (!this.canUseStorage()) return [];

		try {
			const stored = localStorage.getItem(this.STORAGE_KEY);
			if (!stored) return [];

			const parsed = JSON.parse(stored);
			if (!Array.isArray(parsed)) return [];

			return parsed
				.map((id) => Number(id))
				.filter((id) => Number.isFinite(id));
		} catch (error) {
			console.error("Failed to read initiated tickets:", error);
			return [];
		}
	}

	addInitiatedTicketId(ticketId: number): number[] {
		if (!this.canUseStorage() || !Number.isFinite(ticketId)) {
			return this.getInitiatedTicketIds();
		}

		try {
			const ids = this.getInitiatedTicketIds();
			const nextIds = [
				ticketId,
				...ids.filter((id) => id !== ticketId),
			].slice(0, this.MAX_ITEMS);

			localStorage.setItem(this.STORAGE_KEY, JSON.stringify(nextIds));
			return nextIds;
		} catch (error) {
			console.error("Failed to store initiated ticket:", error);
			return this.getInitiatedTicketIds();
		}
	}

	removeInitiatedTicketId(ticketId: number): number[] {
		if (!this.canUseStorage()) return [];

		try {
			const ids = this.getInitiatedTicketIds();
			const nextIds = ids.filter((id) => id !== ticketId);
			localStorage.setItem(this.STORAGE_KEY, JSON.stringify(nextIds));
			return nextIds;
		} catch (error) {
			console.error("Failed to remove initiated ticket:", error);
			return this.getInitiatedTicketIds();
		}
	}

	clearInitiatedTicketIds() {
		if (!this.canUseStorage()) return;

		try {
			localStorage.removeItem(this.STORAGE_KEY);
		} catch (error) {
			console.error("Failed to clear initiated tickets:", error);
		}
	}

	getActiveTab(): HelpSupportTab | null {
		if (!this.canUseStorage()) return null;

		try {
			const stored = localStorage.getItem(this.ACTIVE_TAB_KEY);
			if (stored === "incoming" || stored === "own" || stored === "initiated") {
				return stored;
			}
			return null;
		} catch (error) {
			console.error("Failed to read active tab:", error);
			return null;
		}
	}

	setActiveTab(tab: HelpSupportTab) {
		if (!this.canUseStorage()) return;

		try {
			localStorage.setItem(this.ACTIVE_TAB_KEY, tab);
		} catch (error) {
			console.error("Failed to store active tab:", error);
		}
	}
}

export const supportTicketStore = new SupportTicketStore();
