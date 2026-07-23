/** @format */

import { useState, useMemo } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import FilterModal from "@/designSystem/FilterModal";
import FilterSection from "@/designSystem/FilterSection";
import FilterDropdown from "./FilterDropdown";
import DatePicker from "@/designSystem/DatePicker";
import SearchableMultiSelect from "@/designSystem/SearchableMultiSelect";
import LoadingState from "@/designSystem/LoadingState";
import { useListJobTitles } from "@/hooks/jobTitles/useJobTitle";
import { useListRoles } from "@/hooks/roles/useRole";

export type MemberFilters = {
	jobTitleIds?: string[]; // Array of job title IDs
	joinedAtStart?: Date;
	joinedAtEnd?: Date;
	isPermissionOverride?: boolean;
	status?: ("Active" | "Inactive" | "Invited")[];
	roleIds?: string[]; // Array of role IDs
};

const initialFilters: MemberFilters = {
	jobTitleIds: [],
	joinedAtStart: undefined,
	joinedAtEnd: undefined,
	isPermissionOverride: undefined,
	status: [],
	roleIds: [],
};

type MembersFilterDropdownProps = {
	onApply?: (filters: MemberFilters) => void;
	triggerClassName?: string;
};

function MembersFilterDropdown({
	onApply,
	triggerClassName = "",
}: MembersFilterDropdownProps) {
	const { t } = useTranslation("members");
	const [isOpen, setIsOpen] = useState(false);
	const [filters, setFilters] = useState<MemberFilters>(initialFilters);

	// Fetch job titles from API
	const { data: jobTitlesData, isLoading: isLoadingJobTitles } =
		useListJobTitles();

	// Fetch roles from API
	const { data: rolesData, isLoading: isLoadingRoles } = useListRoles();

	// Transform job titles to SearchableMultiSelect format
	const jobTitleOptions = useMemo(
		() =>
			jobTitlesData?.data.map((jt) => ({
				id: jt.id.toString(),
				label: jt.title,
			})) || [],
		[jobTitlesData]
	);

	// Transform roles to SearchableMultiSelect format
	const roleOptions = useMemo(
		() =>
			rolesData?.data.map((role) => ({
				id: role.id.toString(),
				label: role.name,
			})) || [],
		[rolesData]
	);

	// Status options (static)
	const statusOptions = useMemo(
		() => [
			{ id: "Active", label: t("filters.active") },
			{ id: "Inactive", label: t("filters.inactive") },
			{ id: "Invited", label: t("filters.invited") },
		],
		[t]
	);

	// Permission options (static)
	const permissionOptions = [
		{ id: "override", label: t("filters.override") },
		{ id: "default", label: t("filters.default") },
	];

	// Get selected items for SearchableMultiSelect
	const selectedJobTitles = useMemo(
		() =>
			jobTitleOptions.filter((opt) =>
				filters.jobTitleIds?.includes(opt.id as string)
			),
		[jobTitleOptions, filters.jobTitleIds]
	);

	const selectedRoles = useMemo(
		() =>
			roleOptions.filter((opt) => filters.roleIds?.includes(opt.id as string)),
		[roleOptions, filters.roleIds]
	);

	const selectedStatuses = useMemo(
		() =>
			statusOptions.filter((opt) =>
				filters.status?.includes(opt.id as "Active" | "Inactive" | "Invited")
			),
		[filters.status, statusOptions]
	);

	const handleResetAll = () => {
		setFilters(initialFilters);
	};

	const handleResetField = (field: keyof MemberFilters) => {
		setFilters((prev) => ({
			...prev,
			[field]: Array.isArray(prev[field]) ? [] : undefined,
		}));
	};

	const handleResetDateRange = () => {
		setFilters((prev) => ({
			...prev,
			joinedAtStart: undefined,
			joinedAtEnd: undefined,
		}));
	};

	const handleApply = () => {
		if (onApply) {
			// Clean up empty arrays before applying
			const cleanedFilters: MemberFilters = {};
			if (filters.jobTitleIds && filters.jobTitleIds.length > 0) {
				cleanedFilters.jobTitleIds = filters.jobTitleIds;
			}
			if (filters.roleIds && filters.roleIds.length > 0) {
				cleanedFilters.roleIds = filters.roleIds;
			}
			if (filters.status && filters.status.length > 0) {
				cleanedFilters.status = filters.status;
			}
			if (filters.joinedAtStart) {
				cleanedFilters.joinedAtStart = filters.joinedAtStart;
			}
			if (filters.joinedAtEnd) {
				cleanedFilters.joinedAtEnd = filters.joinedAtEnd;
			}
			if (filters.isPermissionOverride !== undefined) {
				cleanedFilters.isPermissionOverride = filters.isPermissionOverride;
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
			triggerLabel={t("filters.filter")}
			title={t("filters.title")}
			resetAllLabel={t("filters.resetAll")}
			cancelLabel={t("common:actions.cancel")}
			applyLabel={t("common:actions.applyNow")}
			triggerClassName={triggerClassName}>
			{/* Job Title */}
			<FilterSection
				label={t("filters.jobTitle")}
				onReset={() => handleResetField("jobTitleIds")}
				resetLabel={t("filters.reset")}>
				{isLoadingJobTitles ? (
					<LoadingState size="small" label={t("common:filters.loadingJobTitles")} />
				) : (
					<SearchableMultiSelect
						placeholder={t("filters.selectJobTitle")}
						selectedItems={selectedJobTitles}
						availableItems={jobTitleOptions}
						onChange={(items) =>
							setFilters({
								...filters,
								jobTitleIds: items.map((item) => item.id as string),
							})
						}
					/>
				)}
			</FilterSection>

			{/* Date Range */}
			<FilterSection
				label={t("filters.dateRange")}
				onReset={handleResetDateRange}
				resetLabel={t("filters.reset")}>
				<div className="flex flex-col sm:flex-row gap-3">
					<div className="flex-1 flex flex-col gap-1">
						<label className="text-sm font-medium text-text-strong tracking-tight">
							{t("filters.startDate")}
						</label>
						<DatePicker
							value={filters.joinedAtStart}
							onChange={(date) =>
								setFilters({ ...filters, joinedAtStart: date })
							}
							placeholder={t("filters.datePlaceholder")}
						/>
					</div>
					<div className="flex-1 flex flex-col gap-1">
						<label className="text-sm font-medium text-text-strong tracking-tight">
							{t("filters.endDate")}
						</label>
						<DatePicker
							value={filters.joinedAtEnd}
							onChange={(date) => setFilters({ ...filters, joinedAtEnd: date })}
							placeholder={t("filters.datePlaceholder")}
							popoverAlign="right"
						/>
					</div>
				</div>
			</FilterSection>

			{/* Permissions */}
			<FilterSection
				label={t("filters.permissions")}
				onReset={() => handleResetField("isPermissionOverride")}
				resetLabel={t("filters.reset")}>
				<FilterDropdown
					placeholder={t("filters.selectPermissionType")}
					options={permissionOptions}
					value={
						filters.isPermissionOverride === true
							? "override"
							: filters.isPermissionOverride === false
							? "default"
							: ""
					}
					onChange={(value) =>
						setFilters({
							...filters,
							isPermissionOverride:
								value === "override"
									? true
									: value === "default"
									? false
									: undefined,
						})
					}
				/>
			</FilterSection>

			{/* Status */}
			<FilterSection
				label={t("filters.status")}
				onReset={() => handleResetField("status")}
				resetLabel={t("filters.reset")}>
				<SearchableMultiSelect
					placeholder={t("filters.selectStatus")}
					selectedItems={selectedStatuses}
					availableItems={statusOptions}
					onChange={(items) =>
						setFilters({
							...filters,
							status: items.map(
								(item) => item.id as "Active" | "Inactive" | "Invited"
							),
						})
					}
				/>
			</FilterSection>

			{/* Role */}
			<FilterSection
				label={t("filters.role")}
				onReset={() => handleResetField("roleIds")}
				resetLabel={t("filters.reset")}>
				{isLoadingRoles ? (
					<LoadingState size="small" label={t("common:filters.loadingRoles")} />
				) : (
					<SearchableMultiSelect
						placeholder={t("filters.selectRole")}
						selectedItems={selectedRoles}
						availableItems={roleOptions}
						onChange={(items) =>
							setFilters({
								...filters,
								roleIds: items.map((item) => item.id as string),
							})
						}
					/>
				)}
			</FilterSection>
		</FilterModal>
	);
}

export default MembersFilterDropdown;
