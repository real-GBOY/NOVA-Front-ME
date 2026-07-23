/** @format */

import { GridSquare, Users, InvoiceDollar, ClipboardText, Gear } from "@/Icons";
import type { CategoryConfig, QuickActionCategory } from "./types";

export const QUICK_ACTION_CATEGORIES: CategoryConfig[] = [
	{ id: "all", label: "commandPalette.categories.all", icon: GridSquare },
	{ id: "members", label: "commandPalette.categories.members", icon: Users },
	{ id: "invoices", label: "commandPalette.categories.invoices", icon: InvoiceDollar },
	{ id: "vouchers", label: "commandPalette.categories.vouchers", icon: InvoiceDollar },
	{ id: "legalCases", label: "commandPalette.categories.cases", icon: GridSquare },
	{ id: "contracts", label: "commandPalette.categories.contracts", icon: ClipboardText },
	{ id: "settings", label: "commandPalette.categories.settings", icon: Gear },
];

const categoryLabelMap = QUICK_ACTION_CATEGORIES.reduce(
	(acc, category) => ({ ...acc, [category.id]: category.label }),
	{} as Record<QuickActionCategory, string>
);

export const getCategoryLabel = (category: QuickActionCategory) =>
	categoryLabelMap[category] ?? category;
