/** @format */

import { useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import FilterModal from "@/designSystem/FilterModal";
import FilterSection from "@/designSystem/FilterSection";
import SearchableMultiSelect from "@/designSystem/SearchableMultiSelect";

export type HolidaysFilters = {
	year?: string[]; // Year numbers as strings
	month?: string[]; // Month numbers as strings (1-12)
};

const initialFilters: HolidaysFilters = {
	year: [],
	month: [],
};

type HolidaysFilterDropdownProps = {
	onApply?: (filters: HolidaysFilters) => void;
};

function HolidaysFilterDropdown({ onApply }: HolidaysFilterDropdownProps) {
	const { t } = useTranslation("settings");
	const [isOpen, setIsOpen] = useState(false);
	const [filters, setFilters] = useState<HolidaysFilters>(initialFilters);

	// Generate Years (Start small, 2023-2030 for now)
	const currentYear = new Date().getFullYear();
	const years = Array.from({ length: 8 }, (_, i) => ({
		id: (currentYear - 2 + i).toString(),
		label: (currentYear - 2 + i).toString(),
	}));

	// Generate Months
	const months = Array.from({ length: 12 }, (_, i) => {
		const date = new Date(2000, i, 1);
		return {
			id: (i + 1).toString(),
			label: date.toLocaleString("default", { month: "long" }),
		};
	});

	// Get selected items helpers
	const getSelectedYears = () =>
		years.filter((y) => filters.year?.includes(y.id));
	const getSelectedMonths = () =>
		months.filter((m) => filters.month?.includes(m.id));

	const handleResetAll = () => {
		setFilters(initialFilters);
	};

	const handleResetField = (field: keyof HolidaysFilters) => {
		setFilters((prev) => ({
			...prev,
			[field]: [],
		}));
	};

	const handleApply = () => {
		if (onApply) {
			const cleanedFilters: HolidaysFilters = {};
			if (filters.year && filters.year.length > 0)
				cleanedFilters.year = filters.year;
			if (filters.month && filters.month.length > 0)
				cleanedFilters.month = filters.month;

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
			triggerLabel={t("companySettings.holidays.filters.filter")}
			title={t("companySettings.holidays.filters.title")}
			resetAllLabel={t("companySettings.holidays.filters.resetAll")}
			cancelLabel={t("common:actions.cancel")}
			applyLabel={t("common:actions.applyNow")}>
			{/* Year Filter */}
			<FilterSection
				label={t("companySettings.holidays.filters.year")}
				onReset={() => handleResetField("year")}
				resetLabel={t("companySettings.holidays.filters.reset")}>
				<SearchableMultiSelect
					placeholder={t("companySettings.holidays.filters.selectYear")}
					selectedItems={getSelectedYears()}
					availableItems={years}
					onChange={(items) =>
						setFilters({ ...filters, year: items.map((i) => i.id) })
					}
				/>
			</FilterSection>

			{/* Month Filter */}
			<FilterSection
				label={t("companySettings.holidays.filters.month")}
				onReset={() => handleResetField("month")}
				resetLabel={t("companySettings.holidays.filters.reset")}>
				<SearchableMultiSelect
					placeholder={t("companySettings.holidays.filters.selectMonth")}
					selectedItems={getSelectedMonths()}
					availableItems={months}
					onChange={(items) =>
						setFilters({ ...filters, month: items.map((i) => i.id) })
					}
				/>
			</FilterSection>
		</FilterModal>
	);
}

export default HolidaysFilterDropdown;
