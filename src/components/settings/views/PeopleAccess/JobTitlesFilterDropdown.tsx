/** @format */

import { useState, useMemo } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import FilterModal from "@/designSystem/FilterModal";
import FilterSection from "@/designSystem/FilterSection";
import SearchableMultiSelect from "@/designSystem/SearchableMultiSelect";
import LoadingState from "@/designSystem/LoadingState";
import { useRole } from "@/hooks/roles/useRole";

export type JobTitleFilters = {
	roles?: string[]; // Role IDs
};

const initialFilters: JobTitleFilters = {
	roles: [],
};

type JobTitlesFilterDropdownProps = {
	onApply?: (filters: JobTitleFilters) => void;
};

function JobTitlesFilterDropdown({ onApply }: JobTitlesFilterDropdownProps) {
	const { t } = useTranslation("settings");
	const [isOpen, setIsOpen] = useState(false);
	const [filters, setFilters] = useState<JobTitleFilters>(initialFilters);

	// Fetch roles from API
	const { useListRoles } = useRole();
	const { data: rolesData, isLoading: isLoadingRoles } = useListRoles();

	// Transform roles to SearchableMultiSelect format
	const roleOptions = useMemo(
		() =>
			rolesData?.data?.map((role) => ({
				id: role.id.toString(),
				label: role.name,
			})) || [],
		[rolesData]
	);

	// Get selected items for SearchableMultiSelect
	const selectedRoles = useMemo(
		() => roleOptions.filter((opt) => filters.roles?.includes(opt.id)),
		[roleOptions, filters.roles]
	);

	const handleResetAll = () => {
		setFilters(initialFilters);
	};

	const handleResetField = (field: keyof JobTitleFilters) => {
		setFilters((prev) => ({
			...prev,
			[field]: [],
		}));
	};

	const handleApply = () => {
		if (onApply) {
			// Clean up empty arrays before applying
			const cleanedFilters: JobTitleFilters = {};
			if (filters.roles && filters.roles.length > 0) {
				cleanedFilters.roles = filters.roles;
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
			triggerLabel={t("jobTitles.filters.filter")}
			title={t("jobTitles.filters.title")}
			resetAllLabel={t("jobTitles.filters.resetAll")}
			cancelLabel={t("common:actions.cancel")}
			applyLabel={t("common:actions.applyNow")}>
			{/* Roles */}
			<FilterSection
				label={t("jobTitles.filters.roles")}
				onReset={() => handleResetField("roles")}
				resetLabel={t("jobTitles.filters.reset")}>
				{isLoadingRoles ? (
					<LoadingState size="small" label={t("common:filters.loadingRoles")} />
				) : (
					<SearchableMultiSelect
						placeholder={t("jobTitles.filters.selectRoles")}
						selectedItems={selectedRoles}
						availableItems={roleOptions}
						onChange={(items) =>
							setFilters({
								...filters,
								roles: items.map((item) => item.id as string),
							})
						}
					/>
				)}
			</FilterSection>
		</FilterModal>
	);
}

export default JobTitlesFilterDropdown;
