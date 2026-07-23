/** @format */

import { useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import SearchInput from "@/designSystem/SearchInput";
import SortDropdown from "@/designSystem/SortDropdown";
import { Plus } from "@/Icons";
import IncomeTypesTab from "./tabs/IncomeTypesTab";
import AddIncomeTypeModal from "./modals/AddIncomeTypeModal";
import type { IncomeType } from "../../types";
import { usePermissions } from "@/contexts/PermissionContext";
import { useDebounce } from "@/hooks/useDebounce";

function IncomeTypes() {
   const { t } = useTranslation("settings");
   const { can } = usePermissions();
   const canCreateIncomeType = can("create_expense_type");
   const [searchTerm, setSearchTerm] = useState("");
   const debouncedSearchTerm = useDebounce(searchTerm, 400);
   const [isAddModalOpen, setIsAddModalOpen] = useState(false);
   const [selectedIncomeType, setSelectedIncomeType] =
      useState<IncomeType | null>(null);
   const [sortBy, setSortBy] = useState<string>("name_asc");

   return (
      <div className="flex size-full flex-col gap-6">
         {/* Title and Description */}
         <div className="flex flex-col gap-1">
            <h1 className="text-lg font-medium leading-6 tracking-[-0.27px] text-text-strong">
               {t("incomeTypes.title") || "Income Types"}
            </h1>
            <p className="text-sm leading-5 tracking-[-0.084px] text-text-sub">
               {t("incomeTypes.description") || "Manage your income types."}
            </p>
         </div>

         {/* Action Bar */}
         <div className="flex flex-col gap-3 w-full sm:flex-row sm:items-center sm:justify-between">
            <SearchInput
               value={searchTerm}
               onChange={setSearchTerm}
               placeholder={
                  t("incomeTypes.searchPlaceholder") || "Search income types..."
               }
               className="w-full sm:w-[280px]"
            />

            <div className="flex flex-col gap-2 w-full sm:flex-row sm:w-auto sm:flex-wrap sm:items-center">
               <SortDropdown
                  label={t("incomeTypes.sortBy") || "Sort by"}
                  options={[
                     {
                        id: "name_asc",
                        label:
                           t("incomeTypes.sortOptions.nameAsc") || "Name (A-Z)",
                     },
                     {
                        id: "name_desc",
                        label:
                           t("incomeTypes.sortOptions.nameDesc") ||
                           "Name (Z-A)",
                     },
                     {
                        id: "newest",
                        label:
                           t("incomeTypes.sortOptions.newest") ||
                           "Newest first",
                     },
                     {
                        id: "oldest",
                        label:
                           t("incomeTypes.sortOptions.oldest") ||
                           "Oldest first",
                     },
                  ]}
                  onSelect={(id) => setSortBy(id)}
                  className="w-full sm:w-auto"
               />

               {canCreateIncomeType && (
                  <button
                     className="bg-text-strong text-background w-full sm:w-auto flex items-center justify-start gap-1.5 px-3 py-2 rounded-lg hover:bg-bg-dark/90 transition-colors text-xs sm:text-sm font-medium leading-5 tracking-[-0.084px] whitespace-nowrap"
                     onClick={() => {
                        setSelectedIncomeType(null);
                        setIsAddModalOpen(true);
                     }}>
                     <Plus size={20} className="fill-background" />
                     {t("incomeTypes.addButton") || "Add Income Type"}
                  </button>
               )}
            </div>
         </div>

         <IncomeTypesTab
            searchQuery={debouncedSearchTerm}
            sortBy={sortBy}
            onEdit={(incomeType) => {
               setSelectedIncomeType(incomeType);
               setIsAddModalOpen(true);
            }}
         />

         <AddIncomeTypeModal
            isOpen={isAddModalOpen}
            onClose={() => {
               setIsAddModalOpen(false);
               setSelectedIncomeType(null);
            }}
            incomeType={selectedIncomeType}
            onSuccess={async () => {
               setIsAddModalOpen(false);
               setSelectedIncomeType(null);
            }}
         />
      </div>
   );
}

export default IncomeTypes;
