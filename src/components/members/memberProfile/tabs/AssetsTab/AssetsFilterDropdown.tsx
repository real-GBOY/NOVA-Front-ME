/** @format */

import { useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import FilterModal from "@/designSystem/FilterModal";
import FilterSection from "@/designSystem/FilterSection";
import SearchableMultiSelect from "@/designSystem/SearchableMultiSelect";
import DatePicker from "@/designSystem/DatePicker";

export interface AssetsFilters {
   status: string[];
   assetType: string[];
   dateFrom?: Date;
   dateTo?: Date;
}

interface AssetsFilterDropdownProps {
   onApply: (filters: AssetsFilters) => void;
}

// Static options based on mock data
const STATUS_OPTIONS = [
   { id: "active", label: "Active" },
   { id: "inactive", label: "Inactive" },
   { id: "returned", label: "Returned" },
   { id: "pending", label: "Pending" },
];

const ASSET_TYPE_OPTIONS = [
   { id: "Laptop", label: "Laptop" },
   { id: "Phone", label: "Phone" },
   { id: "Access Card", label: "Access Card" },
   { id: "Monitor", label: "Monitor" },
   { id: "Peripheral", label: "Peripheral" },
   { id: "Accessory", label: "Accessory" },
   { id: "Tablet", label: "Tablet" },
];

function AssetsFilterDropdown({ onApply }: AssetsFilterDropdownProps) {
   const { t } = useTranslation("members");
   const [isOpen, setIsOpen] = useState(false);

   const initialFilters: AssetsFilters = {
      status: [],
      assetType: [],
      dateFrom: undefined,
      dateTo: undefined,
   };

   const [filters, setFilters] = useState<AssetsFilters>(initialFilters);

   const handleResetAll = () => {
      setFilters(initialFilters);
   };

   const handleResetField = (field: keyof AssetsFilters) => {
      setFilters((prev) => ({
         ...prev,
         [field]: Array.isArray(initialFilters[field]) ? [] : undefined,
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
      onApply(filters);
      setIsOpen(false);
   };

   const getSelectedItems = (
      options: { id: string; label: string }[],
      selectedValues: string[]
   ) => {
      return options.filter((opt) => selectedValues.includes(opt.id));
   };

   return (
      <FilterModal
         isOpen={isOpen}
         onClose={() => setIsOpen(!isOpen)}
         onApply={handleApply}
         onResetAll={handleResetAll}
         triggerLabel={t("profile.assets.filter")}
         title={t("profile.assets.filterTitle")}
         resetAllLabel={t("profile.assets.resetAll")}
         cancelLabel={t("profile.assets.cancel")} // Assuming common cancels exist or add to json
         applyLabel={t("profile.assets.apply")}>
         {/* Status */}
         <FilterSection
            label={t("profile.assets.status")}
            onReset={() => handleResetField("status")}
            resetLabel={t("profile.assets.reset")}>
            <SearchableMultiSelect
               placeholder={t("profile.assets.selectStatus")}
               availableItems={STATUS_OPTIONS.map((s) => ({
                  ...s,
                  label: t(`profile.assets.statusOptions.${s.id}`, s.label),
               }))}
               selectedItems={getSelectedItems(STATUS_OPTIONS, filters.status)}
               onChange={(items) =>
                  setFilters({ ...filters, status: items.map((i) => i.id) })
               }
            />
         </FilterSection>

         {/* Asset Type */}
         <FilterSection
            label={t("profile.assets.assetType")}
            onReset={() => handleResetField("assetType")}
            resetLabel={t("profile.assets.reset")}>
            <SearchableMultiSelect
               placeholder={t("profile.assets.selectType")}
               availableItems={ASSET_TYPE_OPTIONS}
               selectedItems={getSelectedItems(
                  ASSET_TYPE_OPTIONS,
                  filters.assetType
               )}
               onChange={(items) =>
                  setFilters({ ...filters, assetType: items.map((i) => i.id) })
               }
            />
         </FilterSection>

         {/* Date Range */}
         <FilterSection
            label={t("profile.assets.dateRange")}
            onReset={handleResetDateRange}
            resetLabel={t("profile.assets.reset")}>
            <div className="r-stack r-gap-sm xl:gap-3">
               <div className="w-full flex flex-col gap-1 xl:flex-1">
                  <label className="text-sm font-medium text-text-strong tracking-tight">
                     {t("profile.assets.dateFrom")}
                  </label>
                  <DatePicker
                     value={filters.dateFrom}
                     onChange={(date) =>
                        setFilters({ ...filters, dateFrom: date })
                     }
                     placeholder="DD/MM/YYYY"
                  />
               </div>
               <div className="w-full flex flex-col gap-1 xl:flex-1">
                  <label className="text-sm font-medium text-text-strong tracking-tight">
                     {t("profile.assets.dateTo")}
                  </label>
                  <DatePicker
                     value={filters.dateTo}
                     onChange={(date) =>
                        setFilters({ ...filters, dateTo: date })
                     }
                     placeholder="DD/MM/YYYY"
                     popoverAlign="right"
                  />
               </div>
            </div>
         </FilterSection>
      </FilterModal>
   );
}

export default AssetsFilterDropdown;
