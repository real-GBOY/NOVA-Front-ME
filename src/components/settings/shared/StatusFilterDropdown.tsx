/** @format */

import { useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import FilterModal from "@/designSystem/FilterModal";
import FilterSection from "@/designSystem/FilterSection";
import SearchableMultiSelect from "@/designSystem/SearchableMultiSelect";

export interface StatusFilters {
   status: string[];
}

interface StatusFilterDropdownProps {
   onApply: (filters: StatusFilters) => void;
   translationNamespace: string;
   translationPrefix: string;
   triggerClassName?: string;
}

const STATUS_OPTIONS = [
   { id: "active", label: "Active" },
   { id: "inactive", label: "Inactive" },
];

function StatusFilterDropdown({
   onApply,
   translationNamespace,
   translationPrefix,
   triggerClassName,
}: StatusFilterDropdownProps) {
   const { t } = useTranslation(translationNamespace);
   const [isOpen, setIsOpen] = useState(false);

   const initialFilters: StatusFilters = {
      status: [],
   };

   const [filters, setFilters] = useState<StatusFilters>(initialFilters);

   const handleResetAll = () => {
      setFilters(initialFilters);
   };

   const handleResetField = () => {
      setFilters({ status: [] });
   };

   const handleApply = () => {
      onApply(filters);
      setIsOpen(false);
   };

   const getSelectedItems = (
      options: { id: string; label: string }[],
      selectedValues: string[],
   ) => {
      return options.filter((opt) => selectedValues.includes(opt.id));
   };

   return (
      <FilterModal
         isOpen={isOpen}
         onClose={() => setIsOpen(!isOpen)}
         onApply={handleApply}
         onResetAll={handleResetAll}
         triggerLabel={t(`${translationPrefix}.filter`)}
         title={t(`${translationPrefix}.filterTitle`)}
         resetAllLabel={t(`${translationPrefix}.resetAll`)}
         cancelLabel={t(`${translationPrefix}.cancel`)}
         applyLabel={t(`${translationPrefix}.apply`)}
         triggerClassName={triggerClassName}>
         <FilterSection
            label={t(`${translationPrefix}.table.status`)}
            onReset={handleResetField}
            resetLabel={t(`${translationPrefix}.reset`)}>
            <SearchableMultiSelect
               placeholder={t(`${translationPrefix}.selectStatus`)}
               availableItems={STATUS_OPTIONS.map((s) => ({
                  ...s,
                  label: t(`${translationPrefix}.status.${s.id}`),
               }))}
               selectedItems={getSelectedItems(STATUS_OPTIONS, filters.status)}
               selectionClassName="min-h-12"
               singleSelect={true}
               onChange={(items) =>
                  setFilters({
                     status: items[0] ? [String(items[0].id)] : [],
                  })
               }
            />
            <div className="min-h-30"></div>
         </FilterSection>
      </FilterModal>
   );
}

export default StatusFilterDropdown;
