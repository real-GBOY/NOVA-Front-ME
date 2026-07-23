/** @format */

import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useDebouncedCallback } from "use-debounce";
import type { CommandPaletteItem, QuickActionCategory } from "@/components/commandPalette/types";
import { recentItemsService } from "@/services/recentItemsService";
import { commandPaletteSearchService } from "@/services/commandPaletteSearchService";
import { navigationActions } from "@/config/commandPaletteNavigation";
import { createQuickActions, type ActionContext } from "@/config/commandPaletteActions";
import { getCategoryLabel } from "@/components/commandPalette/constants";
import {
	Users,
	InvoiceDollar,
	ClipboardText,
	Gear,
	GridSquare,
	ChatText,
	ChartSquare,
	HeadphoneSimple,
	FolderOpen,
	UserPlusCircleAlt,
} from "@/Icons";

// Icon name mapping for serialization
const iconNameMap: Record<string, React.ComponentType<any>> = {
	Users,
	InvoiceDollar,
	ClipboardText,
	Gear,
	GridSquare,
	ChatText,
	ChartSquare,
	HeadphoneSimple,
	FolderOpen,
	UserPlusCircleAlt,
};

const getIconComponent = (iconName: string): React.ComponentType<any> => {
	return iconNameMap[iconName] || Users;
};

import { useTranslation } from "@/hooks/useTranslation";

export const useCommandPalette = (actionContext?: Partial<ActionContext>) => {
	const navigate = useNavigate();
	const { t } = useTranslation("common"); 
	const [searchQuery, setSearchQuery] = useState("");
	const [activeCategory, setActiveCategory] = useState<QuickActionCategory | null>(null);
	const [searchResults, setSearchResults] = useState<CommandPaletteItem[]>([]);
	const [isSearching, setIsSearching] = useState(false);

	// Get recent items from localStorage and convert icon names to components
	const recentItems = useMemo(() => {
		const items = recentItemsService.getRecentItems();
		return items.map((item) => ({
			id: item.id,
			type: item.type as CommandPaletteItem["type"],
			label: (item.type === 'navigation' || item.type === 'action') ? t(item.label) : item.label,
			description: item.subtitle,
			icon: getIconComponent(item.iconName),
			category: item.category,
			path: item.path,
			metadata: {
				entityId: item.entityId,
				subtitle: item.subtitle,
				badge: item.badge,
				timestamp: item.avatarUrl, // Avatar URL for members
			},
		})) as CommandPaletteItem[];
	}, [t]);

	// Get quick actions with context
	const quickActions = useMemo(() => {
		return createQuickActions({
			navigate,
			...actionContext,
		});
	}, [navigate, actionContext]);

	// Get navigation items
	const navigationItems = useMemo(() => {
		return navigationActions;
	}, []);

	// Debounced search function
	const debouncedSearch = useDebouncedCallback(
		async (query: string, category: QuickActionCategory | null) => {
			if (!query.trim()) {
				setSearchResults([]);
				setIsSearching(false);
				return;
			}

			setIsSearching(true);
			try {
				const results = await commandPaletteSearchService.search(query, category || undefined);
				setSearchResults(results);
			} catch (error) {
				console.error("Search failed:", error);
				setSearchResults([]);
			} finally {
				setIsSearching(false);
			}
		},
		300
	);

	// Trigger search when query or category changes
	useEffect(() => {
		debouncedSearch(searchQuery, activeCategory);
	}, [searchQuery, activeCategory, debouncedSearch]);

	// Get icon name from component for serialization
	const getIconName = (IconComponent: React.ComponentType<any>): string => {
		const entry = Object.entries(iconNameMap).find(([, component]) => component === IconComponent);
		return entry ? entry[0] : "Users";
	};

	// Handle item selection
	const handleItemSelect = useCallback(
		(item: CommandPaletteItem) => {
			// Add to recent items
			recentItemsService.addRecentItem({
				id: item.id,
				type: item.type,
				label: item.label,
				category: item.category,
				path: item.path,
				entityId: item.metadata?.entityId,
				iconName: getIconName(item.icon),
				subtitle: item.metadata?.subtitle || item.description,
				avatarUrl: item.metadata?.timestamp, // Avatar URL stored in timestamp field
				badge: item.metadata?.badge ?? getCategoryLabel(item.category),
			});

			// Execute action or navigate
			if (item.action) {
				item.action();
			} else if (item.path) {
				navigate(item.path);
			}
		},
		[navigate]
	);

	// Clear category filter
	const clearCategory = useCallback(() => {
		setActiveCategory(null);
		setSearchQuery("");
	}, []);

	// Combined items for display when not searching
	const defaultItems = useMemo(() => {
		const items = [...quickActions, ...navigationItems];
		return items.map(item => {
			if (item.type === 'navigation' || item.type === 'action') {
				return {
					...item,
					label: t(item.label),
					description: item.description ? t(item.description) : undefined
				};
			}
			return item;
		});
	}, [quickActions, navigationItems, t]);

	// Items to display based on search state
	const displayItems = useMemo(() => {
		if (searchQuery.trim()) {
			// If searching, only show server results
			return searchResults;
		} else {
			// If not searching, show default items (filtered by category if active)
			if (activeCategory && activeCategory !== "all") {
				return defaultItems.filter((item) => item.category === activeCategory);
			}
			return defaultItems;
		}
	}, [searchQuery, searchResults, activeCategory, defaultItems]);

	return {
		// State
		searchQuery,
		setSearchQuery,
		activeCategory,
		setActiveCategory,
		searchResults,
		isSearching,

		// Data
		recentItems,
		quickActions,
		navigationItems,
		displayItems,

		// Actions
		handleItemSelect,
		clearCategory,
	};
};
