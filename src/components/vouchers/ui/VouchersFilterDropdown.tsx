/** @format */

import { useState, useMemo } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import FilterModal from "@/designSystem/FilterModal";
import FilterSection from "@/designSystem/FilterSection";
import SearchableMultiSelect from "@/designSystem/SearchableMultiSelect";
import DatePicker from "@/designSystem/DatePicker";

export type VoucherFilters = {
	status?: string;
	dateFrom?: Date;
	dateTo?: Date;
	minAmount?: number;
	maxAmount?: number;
	fromAccountId?: string;
	toAccountId?: string;
	fromCustomerId?: string;
	fromAgentId?: string;
	toCustomerId?: string;
	toAgentId?: string;
};

const initialFilters: VoucherFilters = {
	status: undefined,
	dateFrom: undefined,
	dateTo: undefined,
	minAmount: undefined,
	maxAmount: undefined,
	fromAccountId: undefined,
	toAccountId: undefined,
	fromCustomerId: undefined,
	fromAgentId: undefined,
	toCustomerId: undefined,
	toAgentId: undefined,
};

type VouchersFilterDropdownProps = {
	onApply?: (filters: VoucherFilters) => void;
	activeTab: "payment" | "receipt";
	accountOptions: Array<{ id: string; label: string }>;
	customerOptions: Array<{ id: string; label: string }>;
	agentOptions: Array<{ id: string; label: string }>;
	triggerClassName?: string;
};

function VouchersFilterDropdown({
	onApply,
	activeTab,
	accountOptions,
	customerOptions,
	agentOptions,
	triggerClassName = "",
}: VouchersFilterDropdownProps) {
	const { t } = useTranslation("settings");
	const [isOpen, setIsOpen] = useState(false);
	const [filters, setFilters] = useState<VoucherFilters>(initialFilters);

	// Status options (static)
	const statusOptions = useMemo(
		() => [
			{
				id: "Pending_Approval",
				label: t("vouchers.statuses.pendingApproval"),
			},
			{ id: "Approved", label: t("vouchers.statuses.approved") },
		],
		[t]
	);

	// Get selected items for SearchableMultiSelect
	const selectedStatuses = useMemo(
		() =>
			statusOptions.filter((opt) => opt.id === filters.status),
		[filters.status, statusOptions]
	);

	const getMonthRange = (baseDate: Date) => {
		const year = baseDate.getFullYear();
		const month = baseDate.getMonth();
		const start = new Date(year, month, 1);
		const end = new Date(year, month + 1, 0);
		return { start, end };
	};

	const handleCurrentMonth = () => {
		const { start, end } = getMonthRange(new Date());
		setFilters((prev) => ({
			...prev,
			dateFrom: start,
			dateTo: end,
		}));
	};

	const handlePrevMonth = () => {
		const base = filters.dateFrom || new Date();
		const prevMonthDate = new Date(base.getFullYear(), base.getMonth() - 1, 1);
		const { start, end } = getMonthRange(prevMonthDate);
		setFilters((prev) => ({
			...prev,
			dateFrom: start,
			dateTo: end,
		}));
	};

	const handleNextMonth = () => {
		const base = filters.dateFrom || new Date();
		const nextMonthDate = new Date(base.getFullYear(), base.getMonth() + 1, 1);
		const { start, end } = getMonthRange(nextMonthDate);
		setFilters((prev) => ({
			...prev,
			dateFrom: start,
			dateTo: end,
		}));
	};

	const handleResetAll = () => {
		setFilters(initialFilters);
	};

	const handleResetField = (field: keyof VoucherFilters) => {
		setFilters((prev) => ({
			...prev,
			[field]: Array.isArray(prev[field]) ? [] : undefined,
		}));
	};

	const handleApply = () => {
		if (onApply) {
			// Clean up empty arrays and undefined values before applying
			const cleanedFilters: VoucherFilters = {};
			if (filters.status) {
				cleanedFilters.status = filters.status;
			}
			if (filters.dateFrom) {
				cleanedFilters.dateFrom = filters.dateFrom;
			}
			if (filters.dateTo) {
				cleanedFilters.dateTo = filters.dateTo;
			}
			if (filters.minAmount !== undefined && filters.minAmount !== null) {
				cleanedFilters.minAmount = filters.minAmount;
			}
			if (filters.maxAmount !== undefined && filters.maxAmount !== null) {
				cleanedFilters.maxAmount = filters.maxAmount;
			}
			if (filters.fromAccountId) {
				cleanedFilters.fromAccountId = filters.fromAccountId;
			}
			if (filters.toAccountId) {
				cleanedFilters.toAccountId = filters.toAccountId;
			}
			if (filters.fromCustomerId) {
				cleanedFilters.fromCustomerId = filters.fromCustomerId;
			}
			if (filters.fromAgentId) {
				cleanedFilters.fromAgentId = filters.fromAgentId;
			}
			if (filters.toCustomerId) {
				cleanedFilters.toCustomerId = filters.toCustomerId;
			}
			if (filters.toAgentId) {
				cleanedFilters.toAgentId = filters.toAgentId;
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
			triggerLabel={t("vouchers.filter")}
			title={t("vouchers.filterTitle")}
			resetAllLabel={t("vouchers.resetAll")}
			cancelLabel={t("common:actions.cancel")}
			applyLabel={t("common:actions.applyNow")}
			triggerClassName={triggerClassName}>
			{/* Status */}
			<FilterSection
				label={t("vouchers.filters.status")}
				onReset={() => handleResetField("status")}
				resetLabel={t("vouchers.reset")}>
				<SearchableMultiSelect
					placeholder={t("vouchers.filters.selectStatus")}
					selectedItems={selectedStatuses}
					availableItems={statusOptions}
					onChange={(items) =>
						setFilters({
							...filters,
							status: (items[0]?.id as string) || undefined,
						})
					}
				/>
			</FilterSection>

			{/* From/To */}
			<FilterSection
				label={t("vouchers.filters.from")}
				onReset={() => {
					setFilters((prev) => ({
						...prev,
						fromAccountId: undefined,
						fromCustomerId: undefined,
						fromAgentId: undefined,
					}));
				}}
				resetLabel={t("vouchers.reset")}>
				<div className="flex flex-col gap-3">
					{activeTab === "payment" && (
						<div>
							<label className="block text-sm font-medium text-text-sub mb-1.5">
								{t("vouchers.filters.fromAccount")}
							</label>
							<SearchableMultiSelect
								placeholder={t("vouchers.filters.selectAccount")}
								selectedItems={
									filters.fromAccountId
										? accountOptions.filter(
												(opt) => opt.id === filters.fromAccountId
											)
										: []
								}
								availableItems={accountOptions}
								onChange={(items) =>
									setFilters({
										...filters,
										fromAccountId: items[0]?.id as string | undefined,
									})
								}
							/>
						</div>
					)}
					{activeTab === "receipt" && (
						<>
							<div>
								<label className="block text-sm font-medium text-text-sub mb-1.5">
									{t("vouchers.filters.fromCustomer")}
								</label>
								<SearchableMultiSelect
									placeholder={t("vouchers.filters.selectCustomer")}
									selectedItems={
										filters.fromCustomerId
											? customerOptions.filter(
													(opt) => opt.id === filters.fromCustomerId
												)
											: []
									}
									availableItems={customerOptions}
									onChange={(items) =>
										setFilters({
											...filters,
											fromCustomerId: items[0]?.id as string | undefined,
										})
									}
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-text-sub mb-1.5">
									{t("vouchers.filters.fromAgent")}
								</label>
								<SearchableMultiSelect
									placeholder={t("vouchers.filters.selectAgent")}
									selectedItems={
										filters.fromAgentId
											? agentOptions.filter(
													(opt) => opt.id === filters.fromAgentId
												)
											: []
									}
									availableItems={agentOptions}
									onChange={(items) =>
										setFilters({
											...filters,
											fromAgentId: items[0]?.id as string | undefined,
										})
									}
								/>
							</div>
						</>
					)}
				</div>
			</FilterSection>

			<FilterSection
				label={t("vouchers.filters.to")}
				onReset={() => {
					setFilters((prev) => ({
						...prev,
						toAccountId: undefined,
						toCustomerId: undefined,
						toAgentId: undefined,
					}));
				}}
				resetLabel={t("vouchers.reset")}>
				<div className="flex flex-col gap-3">
					{activeTab === "receipt" && (
						<div>
							<label className="block text-sm font-medium text-text-sub mb-1.5">
								{t("vouchers.filters.toAccount")}
							</label>
							<SearchableMultiSelect
								placeholder={t("vouchers.filters.selectAccount")}
								selectedItems={
									filters.toAccountId
										? accountOptions.filter(
												(opt) => opt.id === filters.toAccountId
											)
										: []
								}
								availableItems={accountOptions}
								onChange={(items) =>
									setFilters({
										...filters,
										toAccountId: items[0]?.id as string | undefined,
									})
								}
							/>
						</div>
					)}
					{activeTab === "payment" && (
						<>
							<div>
								<label className="block text-sm font-medium text-text-sub mb-1.5">
									{t("vouchers.filters.toAccount")}
								</label>
								<SearchableMultiSelect
									placeholder={t("vouchers.filters.selectAccount")}
									selectedItems={
										filters.toAccountId
											? accountOptions.filter(
													(opt) => opt.id === filters.toAccountId
												)
											: []
									}
									availableItems={accountOptions}
									onChange={(items) =>
										setFilters({
											...filters,
											toAccountId: items[0]?.id as string | undefined,
										})
									}
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-text-sub mb-1.5">
									{t("vouchers.filters.toCustomer")}
								</label>
								<SearchableMultiSelect
									placeholder={t("vouchers.filters.selectCustomer")}
									selectedItems={
										filters.toCustomerId
											? customerOptions.filter(
													(opt) => opt.id === filters.toCustomerId
												)
											: []
									}
									availableItems={customerOptions}
									onChange={(items) =>
										setFilters({
											...filters,
											toCustomerId: items[0]?.id as string | undefined,
										})
									}
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-text-sub mb-1.5">
									{t("vouchers.filters.toAgent")}
								</label>
								<SearchableMultiSelect
									placeholder={t("vouchers.filters.selectAgent")}
									selectedItems={
										filters.toAgentId
											? agentOptions.filter(
													(opt) => opt.id === filters.toAgentId
												)
											: []
									}
									availableItems={agentOptions}
									onChange={(items) =>
										setFilters({
											...filters,
											toAgentId: items[0]?.id as string | undefined,
										})
									}
								/>
							</div>
						</>
					)}
				</div>
			</FilterSection>

			{/* Date Range */}
			<FilterSection
				label={t("vouchers.filters.dateRange")}
				onReset={() => {
					setFilters((prev) => ({
						...prev,
						dateFrom: undefined,
						dateTo: undefined,
					}));
				}}
				resetLabel={t("vouchers.reset")}>
				<div className="flex flex-col gap-3">
					<div>
						<label className="block text-sm font-medium text-text-sub mb-1.5">
							{t("vouchers.filters.startDate")}
						</label>
						<DatePicker
							value={filters.dateFrom || undefined}
							onChange={(date) =>
								setFilters({
									...filters,
									dateFrom: date || undefined,
								})
							}
							placeholder="DD / MM / YYYY"
						/>
					</div>
					<div>
						<label className="block text-sm font-medium text-text-sub mb-1.5">
							{t("vouchers.filters.endDate")}
						</label>
						<DatePicker
							value={filters.dateTo || undefined}
							onChange={(date) =>
								setFilters({
									...filters,
									dateTo: date || undefined,
								})
							}
							placeholder="DD / MM / YYYY"
							popoverAlign="right"
						/>
					</div>
				</div>
				<div className="flex items-center justify-between w-full gap-2">
					<button
						type="button"
						onClick={handlePrevMonth}
						className="px-3 py-1.5 text-xs font-medium border border-border rounded-lg hover:bg-bg-weak transition-colors">
						Prev Month
					</button>
					<button
						type="button"
						onClick={handleCurrentMonth}
						className="px-3 py-1.5 text-xs font-medium border border-border rounded-lg hover:bg-bg-weak transition-colors">
						Current Month
					</button>
					<button
						type="button"
						onClick={handleNextMonth}
						className="px-3 py-1.5 text-xs font-medium border border-border rounded-lg hover:bg-bg-weak transition-colors">
						Next Month
					</button>
				</div>
			</FilterSection>

			{/* Amount Range */}
			<FilterSection
				label={t("vouchers.filters.amountRange")}
				onReset={() => {
					setFilters((prev) => ({
						...prev,
						minAmount: undefined,
						maxAmount: undefined,
					}));
				}}
				resetLabel={t("vouchers.reset")}>
				<div className="flex flex-col gap-3">
					<div>
						<label className="block text-sm font-medium text-text-sub mb-1.5">
							{t("vouchers.filters.minAmount")}
						</label>
						<input
							type="number"
							className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background text-text-sub focus:outline-none focus:ring-2 focus:ring-primary/20"
							placeholder={t("vouchers.filters.enterMinAmount")}
							value={filters.minAmount ?? ""}
							onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
								setFilters({
									...filters,
									minAmount: e.target.value ? Number(e.target.value) : undefined,
								})
							}
						/>
					</div>
					<div>
						<label className="block text-sm font-medium text-text-sub mb-1.5">
							{t("vouchers.filters.maxAmount")}
						</label>
						<input
							type="number"
							className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background text-text-sub focus:outline-none focus:ring-2 focus:ring-primary/20"
							placeholder={t("vouchers.filters.enterMaxAmount")}
							value={filters.maxAmount ?? ""}
							onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
								setFilters({
									...filters,
									maxAmount: e.target.value ? Number(e.target.value) : undefined,
								})
							}
						/>
					</div>
				</div>
			</FilterSection>
		</FilterModal>
	);
}

export default VouchersFilterDropdown;
