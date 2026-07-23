/** @format */

import { useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import SearchInput from "@/designSystem/SearchInput";
import SortDropdown from "@/designSystem/SortDropdown";
import { Plus } from "@/Icons";
import ExpenseTypesTab from "./tabs/ExpenseTypesTab";
import AddExpenseTypeModal from "./modals/AddExpenseTypeModal";
import StatusFilterDropdown, {
   StatusFilters,
} from "../../shared/StatusFilterDropdown";
import type { ExpenseType } from "./types";
import { usePermissions } from "@/contexts/PermissionContext";
import { useDebounce } from "@/hooks/useDebounce";

function ExpenseTypes() {
   const { t } = useTranslation("settings");
   const { can } = usePermissions();
   const canCreateExpenseType = can("create_expense_type");
   const [searchTerm, setSearchTerm] = useState("");
   const debouncedSearchTerm = useDebounce(searchTerm, 400);
   const [isAddModalOpen, setIsAddModalOpen] = useState(false);
   const [selectedExpenseType, setSelectedExpenseType] =
      useState<ExpenseType | null>(null);
   const [filters, setFilters] = useState<StatusFilters>({ status: [] });
   const [sortBy, setSortBy] = useState<string>("name_asc");

   return (
      <div className="flex size-full flex-col gap-6">
         {/* Title and Description */}
         <div className="flex flex-col gap-1">
            <h1 className="text-lg font-medium leading-6 tracking-[-0.27px] text-text-strong">
               {t("expenseTypes.title")}
            </h1>
            <p className="text-sm leading-5 tracking-[-0.084px] text-text-sub">
               {t("expenseTypes.description")}
            </p>
         </div>

         {/* Action Bar */}
         <div className="flex flex-col gap-3 w-full sm:flex-row sm:items-center sm:justify-between">
            <SearchInput
               value={searchTerm}
               onChange={setSearchTerm}
               placeholder={t("expenseTypes.searchPlaceholder")}
               className="w-full sm:w-[280px]"
            />

            <div className="flex flex-col gap-2 w-full sm:flex-row sm:w-auto sm:flex-wrap sm:items-center">
               <div className="grid grid-cols-2 gap-2 w-full sm:w-auto sm:flex sm:items-center">
                  <StatusFilterDropdown
                     onApply={setFilters}
                     translationNamespace="settings"
                     translationPrefix="expenseTypes"
                     triggerClassName="w-full justify-start"
                  />

                  <SortDropdown
                     label={t("expenseTypes.sortBy")}
                     options={[
                        {
                           id: "name_asc",
                           label: t("expenseTypes.sortOptions.nameAsc"),
                        },
                        {
                           id: "name_desc",
                           label: t("expenseTypes.sortOptions.nameDesc"),
                        },
                        {
                           id: "newest",
                           label: t("expenseTypes.sortOptions.newest"),
                        },
                        {
                           id: "oldest",
                           label: t("expenseTypes.sortOptions.oldest"),
                        },
                     ]}
                     onSelect={(id) => setSortBy(id)}
                     className="w-full sm:w-auto"
                  />
               </div>

               {canCreateExpenseType && (
                  <button
                     className="bg-text-strong text-background w-full sm:w-auto flex items-center justify-start gap-1.5 px-3 py-2 rounded-lg hover:bg-bg-dark/90 transition-colors text-xs sm:text-sm font-medium leading-5 tracking-[-0.084px] whitespace-nowrap"
                     onClick={() => {
                        setSelectedExpenseType(null);
                        setIsAddModalOpen(true);
                     }}>
                     <Plus size={20} className="fill-background" />
                     {t("expenseTypes.addButton")}
                  </button>
               )}
            </div>
         </div>

         <ExpenseTypesTab
            searchQuery={debouncedSearchTerm}
            filters={filters}
            sortBy={sortBy}
            onEdit={(expenseType) => {
               setSelectedExpenseType(expenseType);
               setIsAddModalOpen(true);
            }}
         />

         <AddExpenseTypeModal
            isOpen={isAddModalOpen}
            onClose={() => {
               setIsAddModalOpen(false);
               setSelectedExpenseType(null);
            }}
            expenseType={selectedExpenseType}
            onSuccess={async () => {
               setIsAddModalOpen(false);
               setSelectedExpenseType(null);
            }}
         />
      </div>
   );
}

export default ExpenseTypes;
