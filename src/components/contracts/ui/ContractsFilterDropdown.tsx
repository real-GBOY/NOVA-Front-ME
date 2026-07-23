/** @format */

import { useState, useMemo } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import FilterModal from "@/designSystem/FilterModal";
import FilterSection from "@/designSystem/FilterSection";
import SearchableMultiSelect from "@/designSystem/SearchableMultiSelect";
import LoadingState from "@/designSystem/LoadingState";
import { useEmployeeDictionary } from "@/hooks/employees/useEmployee";

export type ContractFilters = {
	status?: ("Active" | "Expired")[];
	assignedTo?: string[]; // Employee IDs
	minAmount?: number;
	maxAmount?: number;
};

const initialFilters: ContractFilters = {
	status: [],
	assignedTo: [],
	minAmount: undefined,
	maxAmount: undefined,
};

type ContractsFilterDropdownProps = {
	onApply?: (filters: ContractFilters) => void;
	triggerClassName?: string;
};

function ContractsFilterDropdown({
	onApply,
	triggerClassName = "",
}: ContractsFilterDropdownProps) {
	const { t } = useTranslation("common");
	const [isOpen, setIsOpen] = useState(false);
	const [filters, setFilters] = useState<ContractFilters>(initialFilters);

	// Fetch employees from API
	const { data: employeesData = [], isLoading: isLoadingEmployees } =
		useEmployeeDictionary();

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

	// Status options (static)
	const statusOptions = useMemo(
		() => [
			{ id: "Active", label: t("contracts.status.active") },
			{ id: "Expired", label: t("contracts.status.expired") },
		],
		[t]
	);

	// Get selected items for SearchableMultiSelect
	const selectedEmployees = useMemo(
		() =>
			employeeOptions.filter((opt) =>
				filters.assignedTo?.includes(opt.id as string)
			),
		[employeeOptions, filters.assignedTo]
	);

	const selectedStatuses = useMemo(
		() =>
			statusOptions.filter((opt) =>
				filters.status?.includes(opt.id as "Active" | "Expired")
			),
		[filters.status, statusOptions]
	);

	const handleResetAll = () => {
		setFilters(initialFilters);
	};

	const handleResetField = (field: keyof ContractFilters) => {
		setFilters((prev) => ({
			...prev,
			[field]: Array.isArray(prev[field]) ? [] : undefined,
		}));
	};

	const handleResetAmountRange = () => {
		setFilters((prev) => ({
			...prev,
			minAmount: undefined,
			maxAmount: undefined,
		}));
	};

	const handleApply = () => {
		if (onApply) {
			// Clean up empty arrays before applying
			const cleanedFilters: ContractFilters = {};
			if (filters.status && filters.status.length > 0) {
				cleanedFilters.status = filters.status;
			}
			if (filters.assignedTo && filters.assignedTo.length > 0) {
				cleanedFilters.assignedTo = filters.assignedTo;
			}
			if (filters.minAmount !== undefined) {
				cleanedFilters.minAmount = filters.minAmount;
			}
			if (filters.maxAmount !== undefined) {
				cleanedFilters.maxAmount = filters.maxAmount;
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
			triggerLabel={t("contracts.filters.filter")}
			title={t("contracts.filters.filter")}
			resetAllLabel={t("contracts.filters.resetAll")}
			cancelLabel={t("actions.cancel")}
			applyLabel={t("actions.applyNow")}
			triggerClassName={triggerClassName}>
			{/* Status */}
			<FilterSection
				label={t("contracts.statusLabel")}
				onReset={() => handleResetField("status")}
				resetLabel={t("contracts.filters.reset")}>
				<SearchableMultiSelect
					placeholder={t("contracts.filters.selectStatus")}
					selectedItems={selectedStatuses}
					availableItems={statusOptions}
					onChange={(items) =>
						setFilters({
							...filters,
							status: items.map((item) => item.id as "Active" | "Expired"),
						})
					}
				/>
			</FilterSection>

			{/* Assigned To */}
			<FilterSection
				label={t("contracts.assignedTo")}
				onReset={() => handleResetField("assignedTo")}
				resetLabel={t("contracts.filters.reset")}>
				{isLoadingEmployees ? (
					<LoadingState size="small" label={t("filters.loadingEmployees")} />
				) : (
					<SearchableMultiSelect
						placeholder={t("contracts.filters.selectMember")}
						selectedItems={selectedEmployees}
						availableItems={employeeOptions}
						singleSelect={true}
						onChange={(items) =>
							setFilters({
								...filters,
								assignedTo: items.map((item) => item.id as string),
							})
						}
					/>
				)}
			</FilterSection>

			{/* Amount Range */}
			<FilterSection
				label={t("contracts.filters.amountRange")}
				onReset={handleResetAmountRange}
				resetLabel={t("contracts.filters.reset")}>
				<div className="flex gap-3">
					<div className="flex-1 flex flex-col gap-1">
						<label className="text-sm font-medium text-text-strong tracking-tight">
							{t("contracts.filters.minValue")}
						</label>
						<input
							type="number"
							placeholder={t("contracts.filters.enterMinValue")}
							value={filters.minAmount ?? ""}
							onChange={(e) =>
								setFilters({
									...filters,
									minAmount: e.target.value ? Number(e.target.value) : undefined,
								})
							}
							className="w-full px-2 py-1.5 text-sm text-text-strong bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all placeholder:text-text-soft"
						/>
					</div>
					<div className="flex-1 flex flex-col gap-1">
						<label className="text-sm font-medium text-text-strong tracking-tight">
							{t("contracts.filters.maxValue")}
						</label>
						<input
							type="number"
							placeholder={t("contracts.filters.enterMaxValue")}
							value={filters.maxAmount ?? ""}
							onChange={(e) =>
								setFilters({
									...filters,
									maxAmount: e.target.value ? Number(e.target.value) : undefined,
								})
							}
							className="w-full px-2 py-1.5 text-sm text-text-strong bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all placeholder:text-text-soft"
						/>
					</div>
				</div>
			</FilterSection>
		</FilterModal>
	);
}

export default ContractsFilterDropdown;
