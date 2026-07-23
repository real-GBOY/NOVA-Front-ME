/** @format */

import { useState, useMemo } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import FilterModal from "@/designSystem/FilterModal";
import FilterSection from "@/designSystem/FilterSection";
import SearchableMultiSelect from "@/designSystem/SearchableMultiSelect";
import DatePicker from "@/designSystem/DatePicker";
import type {
    TicketMeta,
    TicketListFilters,
    TicketStatus,
    TicketPriority,
    TicketCategory,
    TicketType,
} from "@/types/tickets";
import { format } from "date-fns";
import type { ChatStatusKey } from "./utils";

export type TicketFilters = Omit<TicketListFilters, "page" | "limit" | "search" | "sort_by" | "sort_order"> & {
    status?: TicketStatus[];
    priority?: TicketPriority[];
    category?: TicketCategory[];
    type?: TicketType[];
    chatStatus?: ChatStatusKey[];
    dateFrom?: Date;
    dateTo?: Date;
};

const normalizeCategoryValue = (value: string) =>
    value.trim().toLowerCase().replace(/\s+/g, "_");

interface HelpSupportFilterDropdownProps {
    meta?: TicketMeta;
    onApply?: (filters: TicketFilters) => void;
    triggerClassName?: string;
}

function HelpSupportFilterDropdown({
    meta,
    onApply,
    triggerClassName = "",
}: HelpSupportFilterDropdownProps) {
    const { t } = useTranslation("helpSupport");
    const [isOpen, setIsOpen] = useState(false);
    
    const initialFilters: TicketFilters = {
        status: [],
        priority: [],
        category: [],
        type: [],
        chatStatus: [],
        dateFrom: undefined,
        dateTo: undefined,
    };

    const [filters, setFilters] = useState<TicketFilters>(initialFilters);

    const handleResetAll = () => {
        setFilters(initialFilters);
    };

    const handleResetField = (field: keyof TicketFilters) => {
        setFilters((prev) => ({
            ...prev,
            [field]: Array.isArray(initialFilters[field as keyof TicketFilters]) ? [] : undefined,
        }));
    };

     const handleResetDateRange = () => {
        setFilters((prev) => ({
            ...prev,
            dateFrom: undefined,
            dateTo: undefined,
        }));
    };

    const handleApply = () => {
        if (onApply) {
            const formattedFilters: TicketFilters = {
                ...filters,
                submitted_from: filters.dateFrom ? format(filters.dateFrom, "yyyy-MM-dd") : undefined,
                submitted_to: filters.dateTo ? format(filters.dateTo, "yyyy-MM-dd") : undefined,
            };
            onApply(formattedFilters);
        }
        setIsOpen(false);
    };

    // Transform meta options for SearchableMultiSelect
    const statusOptions = useMemo(
        () =>
            meta?.statuses
                .filter((status) => status !== "In_Progress")
                .map((status) => ({ id: status, label: status })) || [],
        [meta?.statuses]
    );

    const priorityOptions = useMemo(() => 
        meta?.priorities.map(p => ({ id: p, label: t(`priority.${p}`, p) })) || [], 
        [meta?.priorities, t]
    );

    const categoryOptions = useMemo(
        () =>
            meta?.categories.map((category) => {
                if (typeof category === "string") {
                    const normalized = normalizeCategoryValue(category);
                    return {
                        id: normalized,
                        label: t(`category.${normalized}`, { defaultValue: category }),
                    };
                }

                const normalized = normalizeCategoryValue(category.key);
                return {
                    id: normalized,
                    label:
                        category.label ||
                        t(`category.${normalized}`, { defaultValue: category.key }),
                };
            }) || [],
        [meta?.categories, t]
    );

    const typeOptions = useMemo(
        () =>
            meta?.types.map((type) => ({
                id: type,
                label: t(`type.${type}`, { defaultValue: type }),
            })) || [],
        [meta?.types, t]
    );

    const chatStatusOptions = useMemo(
        (): Array<{ id: ChatStatusKey; label: string }> => [
            { id: "taken", label: t("table.chatStatus.taken") },
            { id: "waiting", label: t("table.chatStatus.waiting") },
            { id: "archived", label: t("table.chatStatus.archived") },
        ],
        [t]
    );

    // Helpers for selected items
    const getSelectedItems = (options: {id: string, label: string}[], selectedValues?: string[]) => {
        if (!selectedValues || !Array.isArray(selectedValues)) return [];
        return options.filter(opt => selectedValues.includes(opt.id));
    };

    return (
        <FilterModal
            isOpen={isOpen}
            onClose={() => setIsOpen(!isOpen)}
            onApply={handleApply}
            onResetAll={handleResetAll}
            triggerLabel={t("filter")}
            title={t("filterTickets")}
            resetAllLabel={t("resetAll")}
            cancelLabel={t("cancel")}
            applyLabel={t("apply")}
            triggerClassName={triggerClassName}
        >
            {/* Status */}
            <FilterSection
                label={t("statusLabel")}
                onReset={() => handleResetField("status")}
                resetLabel={t("reset")}
            >
                <SearchableMultiSelect
                    placeholder={t("selectStatus")}
                    availableItems={statusOptions}
                    selectedItems={getSelectedItems(statusOptions, filters.status)}
                    onChange={(items) => setFilters({...filters, status: items.map(i => i.id)})}
                />
            </FilterSection>

             {/* Priority */}
             <FilterSection
                label={t("priorityLabel")}
                onReset={() => handleResetField("priority")}
                resetLabel={t("reset")}
            >
                <SearchableMultiSelect
                    placeholder={t("selectPriority")}
                    availableItems={priorityOptions}
                    selectedItems={getSelectedItems(priorityOptions, filters.priority)}
                    onChange={(items) => setFilters({...filters, priority: items.map(i => i.id)})}
                />
            </FilterSection>

            {/* Category */}
            <FilterSection
                label={t("categoryLabel")}
                onReset={() => handleResetField("category")}
                resetLabel={t("reset")}
            >
                <SearchableMultiSelect
                    placeholder={t("selectCategory")}
                    availableItems={categoryOptions}
                    selectedItems={getSelectedItems(categoryOptions, filters.category)}
                    onChange={(items) => setFilters({...filters, category: items.map(i => i.id)})}
                />
            </FilterSection>

             {/* Type */}
             <FilterSection
                label={t("typeLabel")}
                onReset={() => handleResetField("type")}
                resetLabel={t("reset")}
            >
                <SearchableMultiSelect
                    placeholder={t("selectType")}
                    availableItems={typeOptions}
                    selectedItems={getSelectedItems(typeOptions, filters.type)}
                    onChange={(items) => setFilters({...filters, type: items.map(i => i.id)})}
                />
            </FilterSection>

            {/* Date Range */}
            <FilterSection
                label={t("dateRange")}
                onReset={handleResetDateRange}
                resetLabel={t("reset")}
            >
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1 flex flex-col gap-1">
                        <label className="text-sm font-medium text-text-strong tracking-tight">
                            {t("dateFrom")}
                        </label>
                        <DatePicker
                            value={filters.dateFrom}
                            onChange={(date) => setFilters({ ...filters, dateFrom: date })}
                            placeholder="DD/MM/YYYY"
                        />
                    </div>
                    <div className="flex-1 flex flex-col gap-1">
                         <label className="text-sm font-medium text-text-strong tracking-tight">
                            {t("dateTo")}
                        </label>
                        <DatePicker
                            value={filters.dateTo}
                            onChange={(date) => setFilters({ ...filters, dateTo: date })}
                            placeholder="DD/MM/YYYY"
                            popoverAlign="right"
                        />
                    </div>
                </div>
            </FilterSection>

            {/* Chat Status */}
            <FilterSection
                label={t("chatStatusLabel")}
                onReset={() => handleResetField("chatStatus")}
                resetLabel={t("reset")}
            >
                <SearchableMultiSelect
                    placeholder={t("selectChatStatus")}
                    availableItems={chatStatusOptions}
                    selectedItems={getSelectedItems(
                        chatStatusOptions,
                        filters.chatStatus
                    )}
                    onChange={(items) =>
                        setFilters({
                            ...filters,
                            chatStatus: items.map((item) => item.id),
                        })
                    }
                />
            </FilterSection>

        </FilterModal>
    );
}

export default HelpSupportFilterDropdown;
