/** @format */

import type { QuickActionCategory, CommandPaletteItemType } from "@/components/commandPalette/types";

export interface RecentItem {
	id: string;
	type: CommandPaletteItemType;
	label: string;
	category: QuickActionCategory;
	path?: string;
	entityId?: number | string;
	timestamp: number;
	iconName: string;
	subtitle?: string;
	avatarUrl?: string;
	badge?: string;
}

class RecentItemsService {
	private readonly STORAGE_KEY = "command_palette_recent_items";
	private readonly MAX_ITEMS = 10;
	private readonly LEGACY_ROUTE_MAP: Record<string, string> = {
		"/dashboard/invoices": "/dashboard/loans-advances",
	};

	private normalizePath(path?: string): string | undefined {
		if (!path) return path;
		return this.LEGACY_ROUTE_MAP[path] ?? path;
	}

	/**
	 * Add an item to recent items
	 */
	addRecentItem(item: Omit<RecentItem, "timestamp">): void {
		try {
			const items = this.getRecentItems();

			// Remove if already exists (we'll add it to the front)
			const filteredItems = items.filter((i) => i.id !== item.id);

			// Add to front with current timestamp
			const newItem: RecentItem = {
				...item,
				timestamp: Date.now(),
			};

			const updatedItems = [newItem, ...filteredItems].slice(0, this.MAX_ITEMS);

			localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedItems));
		} catch (error) {
			console.error("Failed to add recent item:", error);
		}
	}

	/**
	 * Get all recent items sorted by timestamp (newest first)
	 */
	getRecentItems(): RecentItem[] {
		try {
			const stored = localStorage.getItem(this.STORAGE_KEY);
			if (!stored) return [];

			const items = JSON.parse(stored) as RecentItem[];
			return items
				.map((item) => ({
					...item,
					path: this.normalizePath(item.path),
				}))
				.sort((a, b) => b.timestamp - a.timestamp);
		} catch (error) {
			console.error("Failed to get recent items:", error);
			return [];
		}
	}

	/**
	 * Remove a specific item from recent items
	 */
	removeRecentItem(id: string): void {
		try {
			const items = this.getRecentItems();
			const filteredItems = items.filter((i) => i.id !== id);
			localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredItems));
		} catch (error) {
			console.error("Failed to remove recent item:", error);
		}
	}

	/**
	 * Clear all recent items
	 */
	clearRecentItems(): void {
		try {
			localStorage.removeItem(this.STORAGE_KEY);
		} catch (error) {
			console.error("Failed to clear recent items:", error);
		}
	}
}

export const recentItemsService = new RecentItemsService();
