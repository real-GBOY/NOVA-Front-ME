/** @format */

import { useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import FilterModal from "@/designSystem/FilterModal";
import FilterSection from "@/designSystem/FilterSection";
import SearchableMultiSelect from "@/designSystem/SearchableMultiSelect";

export interface CategoriesFilters {
    status: string;
}

interface CategoriesFilterDropdownProps {
    onApply: (filters: CategoriesFilters) => void;
    triggerClassName?: string;
}

const STATUS_OPTIONS = [
    { id: "active", label: "Active" },
    { id: "inactive", label: "Inactive" },
];

function CategoriesFilterDropdown({ onApply, triggerClassName }: CategoriesFilterDropdownProps) {
    const { t } = useTranslation("settings");
    const [isOpen, setIsOpen] = useState(false);

    const initialFilters: CategoriesFilters = {
        status: "",
    };

    const [filters, setFilters] = useState<CategoriesFilters>(initialFilters);

    const handleResetAll = () => {
        setFilters(initialFilters);
    };

    const handleResetField = (field: keyof CategoriesFilters) => {
        setFilters((prev) => ({ ...prev, [field]: "" }));
    };

    const handleApply = () => {
        onApply(filters);
        setIsOpen(false);
    };

    const selectedStatusItems = filters.status
        ? STATUS_OPTIONS.filter((opt) => opt.id === filters.status)
        : [];

    return (
        <FilterModal
            isOpen={isOpen}
            onClose={() => setIsOpen(!isOpen)}
            onApply={handleApply}
            onResetAll={handleResetAll}
            triggerLabel={t("serviceCatalog.filter")}
            title={t("serviceCatalog.filterTitle")}
            resetAllLabel={t("serviceCatalog.resetAll")}
            cancelLabel={t("serviceCatalog.cancel")}
            applyLabel={t("serviceCatalog.apply")}
            triggerClassName={triggerClassName}
        >
            <FilterSection
                label={t("serviceCatalog.table.status")}
                onReset={() => handleResetField("status")}
                resetLabel={t("serviceCatalog.reset")}
            >
                <SearchableMultiSelect
                    placeholder={t("serviceCatalog.selectStatus")}
                    availableItems={STATUS_OPTIONS.map(s => ({ ...s, label: t(`serviceCatalog.status.${s.id}`) }))}
                    selectedItems={selectedStatusItems}
                    singleSelect={true}
                    onChange={(items) =>
                        setFilters({ ...filters, status: String(items[0]?.id || "") })
                    }
                />
            </FilterSection>
        </FilterModal>
    );
}

export default CategoriesFilterDropdown;
