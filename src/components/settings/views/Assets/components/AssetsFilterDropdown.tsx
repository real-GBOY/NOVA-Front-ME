/** @format */

import { useState, useMemo } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import FilterModal from "@/designSystem/FilterModal";
import FilterSection from "@/designSystem/FilterSection";
import SearchableMultiSelect from "@/designSystem/SearchableMultiSelect";
import { useEmployeeDictionary } from "@/hooks/employees/useEmployee";
import { useDebounce } from "@/hooks/useDebounce";

export type AssetFilters = {
	category?: string[];
	status?: ("available" | "assigned" | "maintenance" | "retired")[];
	assignedTo?: string[]; // Employee IDs
};

const initialFilters: AssetFilters = {
	category: [],
	status: [],
	assignedTo: [],
};

type AssetsFilterDropdownProps = {
	onApply?: (filters: AssetFilters) => void;
	triggerClassName?: string;
};

function AssetsFilterDropdown({
	onApply,
	triggerClassName = "",
}: AssetsFilterDropdownProps) {
	const { t } = useTranslation("settings");
	const [isOpen, setIsOpen] = useState(false);
	const [filters, setFilters] = useState<AssetFilters>(initialFilters);
	const [assignedToSearchQuery, setAssignedToSearchQuery] = useState("");
	const [selectedAssignedToItems, setSelectedAssignedToItems] = useState<
		Array<{ id: string | number; label: string; subLabel?: string }>
	>([]);
	const debouncedAssignedToSearchQuery = useDebounce(assignedToSearchQuery, 300);

	// Fetch employees from API
	const { data: employeesData = [] } =
		useEmployeeDictionary(
			{
				search: debouncedAssignedToSearchQuery || undefined,
				limit: 50,
			},
			{ enabled: isOpen }
		);

	// Transform employees to SearchableMultiSelect format
	const employeeOptions = useMemo(
		() =>
			employeesData.map((emp) => ({
				id: emp.id,
				label: emp.label,
				subLabel: emp.subLabel,
			})),
		[employeesData]
	);

	// Category options (static)
	const categoryOptions = useMemo(
		() => [
			{ id: "laptop", label: t("assets.categories.laptop") },
			{ id: "mobile", label: t("assets.categories.mobile") },
			{ id: "tablet", label: t("assets.categories.tablet") },
			{ id: "monitor", label: t("assets.categories.monitor") },
			{ id: "keyboard", label: t("assets.categories.keyboard") },
			{ id: "mouse", label: t("assets.categories.mouse") },
			{ id: "other", label: t("assets.categories.other") },
		],
		[t]
	);

	// Status options (static)
	const statusOptions = useMemo(
		() => [
			{ id: "available", label: t("assets.statuses.available") },
			{ id: "assigned", label: t("assets.statuses.assigned") },
			{ id: "maintenance", label: t("assets.statuses.maintenance") },
			{ id: "retired", label: t("assets.statuses.retired") },
		],
		[t]
	);

	// Get selected items for SearchableMultiSelect
	const selectedCategories = useMemo(
		() =>
			categoryOptions.filter((opt) =>
				filters.category?.includes(opt.id as string)
			),
		[filters.category, categoryOptions]
	);

	const selectedStatuses = useMemo(
		() =>
			statusOptions.filter((opt) =>
				filters.status?.includes(
					opt.id as "available" | "assigned" | "maintenance" | "retired"
				)
			),
		[filters.status, statusOptions]
	);

	const handleResetAll = () => {
		setFilters(initialFilters);
		setAssignedToSearchQuery("");
		setSelectedAssignedToItems([]);
	};

	const handleResetField = (field: keyof AssetFilters) => {
		setFilters((prev) => ({
			...prev,
			[field]: [],
		}));
		if (field === "assignedTo") {
			setAssignedToSearchQuery("");
			setSelectedAssignedToItems([]);
		}
	};

	const handleApply = () => {
		if (onApply) {
			// Clean up empty arrays before applying
			const cleanedFilters: AssetFilters = {};
			if (filters.category && filters.category.length > 0) {
				cleanedFilters.category = filters.category;
			}
			if (filters.status && filters.status.length > 0) {
				cleanedFilters.status = filters.status;
			}
			if (filters.assignedTo && filters.assignedTo.length > 0) {
				cleanedFilters.assignedTo = filters.assignedTo;
			}

			onApply(cleanedFilters);
		}
		setIsOpen(false);
	};

	return (
		<FilterModal
			isOpen={isOpen}
			onClose={() => setIsOpen(!isOpen)}
			onApply={handleApply}
			onResetAll={handleResetAll}
			triggerLabel={t("assets.filter")}
			title={t("assets.filterTitle")}
			resetAllLabel={t("assets.resetAll")}
			cancelLabel={t("assets.cancel")}
			applyLabel={t("assets.apply")}
			triggerClassName={triggerClassName}>
			{/* Category */}
			<FilterSection
				label={t("assets.category")}
				onReset={() => handleResetField("category")}
				resetLabel={t("assets.reset")}>
				<SearchableMultiSelect
					placeholder={t("assets.selectCategory")}
					selectedItems={selectedCategories}
					availableItems={categoryOptions}
					onChange={(items) =>
						setFilters({
							...filters,
							category: items.map((item) => item.id as string),
						})
					}
				/>
			</FilterSection>

			{/* Status */}
			<FilterSection
				label={t("assets.status")}
				onReset={() => handleResetField("status")}
				resetLabel={t("assets.reset")}>
				<SearchableMultiSelect
					placeholder={t("assets.selectStatus")}
					selectedItems={selectedStatuses}
					availableItems={statusOptions}
					onChange={(items) =>
						setFilters({
							...filters,
							status: items.map(
								(item) =>
									item.id as "available" | "assigned" | "maintenance" | "retired"
							),
						})
					}
				/>
			</FilterSection>

			{/* Assigned To */}
			<FilterSection
				label={t("assets.assignedTo")}
				onReset={() => handleResetField("assignedTo")}
				resetLabel={t("assets.reset")}>
				<SearchableMultiSelect
					placeholder={t("assets.selectEmployee")}
					selectedItems={selectedAssignedToItems}
					availableItems={employeeOptions}
					serverSideSearch
					onSearchQueryChange={setAssignedToSearchQuery}
					onChange={(items) => {
						setSelectedAssignedToItems(items);
						setFilters({
							...filters,
							assignedTo: items.map((item) => item.id as string),
						});
					}}
				/>
			</FilterSection>
		</FilterModal>
	);
}

export default AssetsFilterDropdown;
