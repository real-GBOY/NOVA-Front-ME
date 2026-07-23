/** @format */

import { useState, useMemo } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import FilterModal from "@/designSystem/FilterModal";
import FilterSection from "@/designSystem/FilterSection";
import SearchableMultiSelect from "@/designSystem/SearchableMultiSelect";
import LoadingState from "@/designSystem/LoadingState";
import { useJobTitle } from "@/hooks/jobTitles/useJobTitle";

export type RolesFilters = {
	jobTitles?: string[]; // Job Title IDs
};

const initialFilters: RolesFilters = {
	jobTitles: [],
};

type RolesFilterDropdownProps = {
	onApply?: (filters: RolesFilters) => void;
};

function RolesFilterDropdown({ onApply }: RolesFilterDropdownProps) {
	const { t } = useTranslation("settings");
	const [isOpen, setIsOpen] = useState(false);
	const [filters, setFilters] = useState<RolesFilters>(initialFilters);

	// Fetch job titles from API
	const { useListJobTitles } = useJobTitle();
	const { data: jobTitlesData, isLoading: isLoadingJobTitles } =
		useListJobTitles();

	// Transform job titles to SearchableMultiSelect format
	const jobTitleOptions = useMemo(
		() =>
			jobTitlesData?.data?.map((jt) => ({
				id: jt.id.toString(),
				label: jt.title,
			})) || [],
		[jobTitlesData]
	);

	// Get selected items for SearchableMultiSelect
	const selectedJobTitles = useMemo(
		() =>
			jobTitleOptions.filter((opt) => filters.jobTitles?.includes(opt.id)),
		[jobTitleOptions, filters.jobTitles]
	);

	const handleResetAll = () => {
		setFilters(initialFilters);
	};

	const handleResetField = (field: keyof RolesFilters) => {
		setFilters((prev) => ({
			...prev,
			[field]: [],
		}));
	};

	const handleApply = () => {
		if (onApply) {
			// Clean up empty arrays before applying
			const cleanedFilters: RolesFilters = {};
			if (filters.jobTitles && filters.jobTitles.length > 0) {
				cleanedFilters.jobTitles = filters.jobTitles;
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
			triggerLabel={t("roles.filters.filter")}
			title={t("roles.filters.title")}
			resetAllLabel={t("roles.filters.resetAll")}
			cancelLabel={t("common:actions.cancel")}
			applyLabel={t("common:actions.applyNow")}>
			{/* Job Titles */}
			<FilterSection
				label={t("roles.filters.jobTitles")}
				onReset={() => handleResetField("jobTitles")}
				resetLabel={t("roles.filters.reset")}>
				{isLoadingJobTitles ? (
					<LoadingState size="small" label={t("common:filters.loadingJobTitles")} />
				) : (
					<SearchableMultiSelect
						placeholder={t("roles.filters.selectJobTitles")}
						selectedItems={selectedJobTitles}
						availableItems={jobTitleOptions}
						onChange={(items) =>
							setFilters({
								...filters,
								jobTitles: items.map((item) => item.id as string),
							})
						}
					/>
				)}
			</FilterSection>
		</FilterModal>
	);
}

export default RolesFilterDropdown;
