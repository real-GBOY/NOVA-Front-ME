/** @format */

import { useState, useMemo } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import FilterModal from "@/designSystem/FilterModal";
import FilterSection from "@/designSystem/FilterSection";
import SearchableMultiSelect from "@/designSystem/SearchableMultiSelect";
import LoadingState from "@/designSystem/LoadingState";
import { useJobTitle } from "@/hooks/jobTitles/useJobTitle";

export type TeamsFilters = {
	jobTitles?: string[]; // Job Title IDs
};

const initialFilters: TeamsFilters = {
	jobTitles: [],
};

type TeamsFilterDropdownProps = {
	onApply?: (filters: TeamsFilters) => void;
};

function TeamsFilterDropdown({ onApply }: TeamsFilterDropdownProps) {
	const { t } = useTranslation("settings");
	const [isOpen, setIsOpen] = useState(false);
	const [filters, setFilters] = useState<TeamsFilters>(initialFilters);

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

	const handleResetField = (field: keyof TeamsFilters) => {
		setFilters((prev) => ({
			...prev,
			[field]: [],
		}));
	};

	const handleApply = () => {
		if (onApply) {
			const cleanedFilters: TeamsFilters = {};
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
			triggerLabel={t("teams.filters.filter")}
			title={t("teams.filters.title")}
			resetAllLabel={t("teams.filters.resetAll")}
			cancelLabel={t("common:actions.cancel")}
			applyLabel={t("common:actions.applyNow")}>
			{/* Job Titles */}
			<FilterSection
				label={t("teams.filters.jobTitles")}
				onReset={() => handleResetField("jobTitles")}
				resetLabel={t("teams.filters.reset")}>
				{isLoadingJobTitles ? (
					<LoadingState size="small" label={t("common:filters.loadingJobTitles")} />
				) : (
					<SearchableMultiSelect
						placeholder={t("teams.filters.selectJobTitles")}
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

export default TeamsFilterDropdown;
