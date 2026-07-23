/** @format */

import { useState, useEffect, useMemo } from "react";
import { addMonths, endOfMonth, startOfMonth } from "date-fns";
import { useTranslation } from "@/hooks/useTranslation";
import { useVacationTypes } from "@/hooks/vacationTypes/vacationType.queries";
import FilterModal from "@/designSystem/FilterModal";
import FilterSection from "@/designSystem/FilterSection";
import DatePicker from "@/designSystem/DatePicker";
import SearchableSelect from "@/components/invoices/SearchableSelect";

export interface TimeManagementFilters {
    status?: string;
    type?: string; // For Time Off (vacation_type_id)
    dateFrom?: Date;
    dateTo?: Date;
}

type TabType = "shift" | "attendance" | "timeOff" | "overtime" | "history";

interface TimeManagementFilterDropdownProps {
    activeTab: TabType;
    onApply: (filters: TimeManagementFilters) => void;
    currentFilters: TimeManagementFilters;
    defaultFilters: TimeManagementFilters;
}

// Static options
const TIME_OFF_STATUS_OPTIONS = [
    { id: "pending", label: "Pending" },
    { id: "approved", label: "Approved" },
    { id: "rejected", label: "Rejected" },
    { id: "cancelled", label: "Cancelled" },
];

const OVERTIME_STATUS_OPTIONS = [
    { id: "pending", label: "Pending" },
    { id: "approved", label: "Approved" },
    { id: "rejected", label: "Rejected" },
];

function TimeManagementFilterDropdown({
    activeTab,
    onApply,
    currentFilters,
    defaultFilters,
}: TimeManagementFilterDropdownProps) {
    const { t } = useTranslation("members");
    const [isOpen, setIsOpen] = useState(false);
    const { data: vacationTypesResponse = [], isLoading: isLoadingTypes } = useVacationTypes({
        enabled: isOpen && activeTab === "timeOff",
    });
    const vacationTypes = useMemo(
        () => vacationTypesResponse.map((type) => ({ id: type.id, name: type.name })),
        [vacationTypesResponse],
    );
    
    const [filters, setFilters] = useState<TimeManagementFilters>(currentFilters);

    // Keep modal state in sync with active applied filters from parent
    useEffect(() => {
        setFilters(currentFilters);
    }, [activeTab, currentFilters]);

    const handleResetAll = () => {
        setFilters(defaultFilters);
    };

    const handleResetField = (field: keyof TimeManagementFilters) => {
        setFilters((prev) => ({
            ...prev,
            [field]: field === "dateFrom" || field === "dateTo" ? undefined : undefined,
        }));
    };

    const handleResetDateRange = () => {
        setFilters((prev) => ({
            ...prev,
            dateFrom: defaultFilters.dateFrom,
            dateTo: defaultFilters.dateTo,
        }));
    };

    const handleApply = () => {
        onApply({
            status: filters.status ? filters.status.toLowerCase() : undefined,
            type: filters.type || undefined,
            dateFrom: filters.dateFrom,
            dateTo: filters.dateTo,
        });
        setIsOpen(false);
    };

    const applyMonthRangeImmediately = (targetDate: Date) => {
        const nextFilters: TimeManagementFilters = {
            ...filters,
            dateFrom: startOfMonth(targetDate),
            dateTo: endOfMonth(targetDate),
        };
        setFilters(nextFilters);
        onApply({
            status: nextFilters.status ? nextFilters.status.toLowerCase() : undefined,
            type: nextFilters.type || undefined,
            dateFrom: nextFilters.dateFrom,
            dateTo: nextFilters.dateTo,
        });
    };

    const handlePrevMonth = () => {
        const anchor = filters.dateFrom || new Date();
        applyMonthRangeImmediately(addMonths(anchor, -1));
    };

    const handleNextMonth = () => {
        const anchor = filters.dateFrom || new Date();
        applyMonthRangeImmediately(addMonths(anchor, 1));
    };

    // Helper to translate status labels
    const getStatusLabel = (status: string) => {
        const key = status.toLowerCase();
        // Assume keys exist in members.json under profile.{activeTab}.status
        // Or generic status
        // Fallback to capitalized
        return t(
            `profile.${activeTab}.status.${key}`,
            status.charAt(0).toUpperCase() + status.slice(1)
        );
    };

    const vacationTypeOptions = useMemo(
        () => vacationTypes.map((type) => ({ id: String(type.id), label: type.name })),
        [vacationTypes]
    );

    const statusOptions =
        activeTab === "overtime" ? OVERTIME_STATUS_OPTIONS : TIME_OFF_STATUS_OPTIONS;

    return (
        <FilterModal
            isOpen={isOpen}
            onClose={() => setIsOpen(!isOpen)}
            onApply={handleApply}
            onResetAll={handleResetAll}
            triggerLabel={t("timeManagement.header.filter")}
            title={t("timeManagement.header.filter")} // reuse or specific title
            resetAllLabel={t("profile.assets.resetAll")} // reuse generic
            cancelLabel={t("profile.assets.cancel")}
            applyLabel={t("profile.assets.apply")}
        >
            {/* Status - For TimeOff and Overtime */}
            {(activeTab === "timeOff" || activeTab === "overtime") && (
                <FilterSection
                    label={t("profile.assets.table.status")} // Reuse "Status" label
                    onReset={() => handleResetField("status")}
                    resetLabel={t("profile.assets.reset")}
                >
                    <SearchableSelect
                        value={filters.status || ""}
                        onChange={(value) => setFilters({ ...filters, status: value })}
                        options={statusOptions.map((s) => ({
                            id: s.id,
                            label: getStatusLabel(s.id),
                        }))}
                        placeholder={t("profile.assets.selectStatus")}
                    />
                </FilterSection>
            )}

            {/* Type - Only for TimeOff */}
            {activeTab === "timeOff" && (
                <FilterSection
                    label={t("profile.timeOff.table.timeOffType")}
                    onReset={() => handleResetField("type")}
                    resetLabel={t("profile.assets.reset")}
                >
                    <SearchableSelect
                        value={filters.type || ""}
                        onChange={(value) => setFilters({ ...filters, type: value })}
                        options={vacationTypeOptions}
                        placeholder={t("profile.assets.selectType")}
                        disabled={isLoadingTypes}
                    />
                </FilterSection>
            )}

            {/* Date Range - Common */}
            <FilterSection
                label={t("profile.assets.dateRange")}
                onReset={handleResetDateRange}
                resetLabel={t("profile.assets.reset")}
            >
                <div className="r-stack r-gap-sm xl:gap-3">
                    <div className="w-full flex flex-col gap-1 xl:flex-1">
                        <label className="text-sm font-medium text-text-strong tracking-tight">
                            {t("profile.assets.dateFrom")}
                        </label>
                        <DatePicker
                            value={filters.dateFrom}
                            onChange={(date) => setFilters({ ...filters, dateFrom: date })}
                            placeholder="DD/MM/YYYY"
                            renderInPortal
                            monthYearDropdownDirection="up"
                            popoverDirection="up"
                        />
                    </div>
                    <div className="w-full flex flex-col gap-1 xl:flex-1">
                         <label className="text-sm font-medium text-text-strong tracking-tight">
                            {t("profile.assets.dateTo")}
                        </label>
                        <DatePicker
                            value={filters.dateTo}
                            onChange={(date) => setFilters({ ...filters, dateTo: date })}
                            placeholder="DD/MM/YYYY"
                            popoverAlign="right"
                            renderInPortal
                            monthYearDropdownDirection="up"
                            popoverDirection="up"
                        />
                    </div>
                </div>
                <div className="flex items-center justify-between mt-2 w-full">
                    <button
                        type="button"
                        onClick={handlePrevMonth}
                        className="px-3 py-1.5 text-xs font-medium border border-border rounded-lg hover:bg-bg-weak transition-colors"
                    >
                        Prev Month
                    </button>
                    <button
                        type="button"
                        onClick={handleNextMonth}
                        className="px-3 py-1.5 text-xs font-medium border border-border rounded-lg hover:bg-bg-weak transition-colors"
                    >
                        Next Month
                    </button>
                </div>
            </FilterSection>
        </FilterModal>
    );
}

export default TimeManagementFilterDropdown;
