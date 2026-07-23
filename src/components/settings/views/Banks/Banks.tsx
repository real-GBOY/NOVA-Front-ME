/** @format */

import { useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import SearchInput from "@/designSystem/SearchInput";
import SortDropdown from "@/designSystem/SortDropdown";
import { Plus } from "@/Icons";
import BanksTab from "./tabs/BanksTab";
import AddBankModal from "./modals/AddBankModal";
import StatusFilterDropdown, {
   StatusFilters,
} from "../../shared/StatusFilterDropdown";
import type { Bank } from "./types";
import { usePermissions } from "@/contexts/PermissionContext";
import { useDebounce } from "@/hooks/useDebounce";

function Banks() {
   const { t } = useTranslation("settings");
   const { can } = usePermissions();
   const canCreateBank = can("create_bank");
   const [searchTerm, setSearchTerm] = useState("");
   const debouncedSearchTerm = useDebounce(searchTerm, 400);
   const [isAddModalOpen, setIsAddModalOpen] = useState(false);
   const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
   const [filters, setFilters] = useState<StatusFilters>({ status: [] });
   const [sortBy, setSortBy] = useState<string>("name_asc");

   return (
      <div className="flex size-full flex-col gap-6">
         {/* Title and Description */}
         <div className="flex flex-col gap-1">
            <h1 className="text-lg font-medium leading-6 tracking-[-0.27px] text-text-strong">
               {t("banks.title")}
            </h1>
            <p className="text-sm leading-5 tracking-[-0.084px] text-text-sub">
               {t("banks.description")}
            </p>
         </div>

         {/* Action Bar */}
         <div className="flex flex-col gap-3 w-full sm:flex-row sm:items-center sm:justify-between">
            <SearchInput
               value={searchTerm}
               onChange={setSearchTerm}
               placeholder={t("banks.searchPlaceholder")}
               className="w-full sm:w-[280px]"
            />

            <div className="flex flex-col gap-2 w-full sm:flex-row sm:w-auto sm:flex-wrap sm:items-center">
               <div className="grid grid-cols-2 gap-2 w-full sm:w-auto sm:flex sm:items-center">
                  <StatusFilterDropdown
                     onApply={setFilters}
                     translationNamespace="settings"
                     translationPrefix="banks"
                     triggerClassName="w-full justify-start"
                  />

                  <SortDropdown
                     label={t("banks.sortBy")}
                     options={[
                        {
                           id: "name_asc",
                           label: t("banks.sortOptions.nameAsc"),
                        },
                        {
                           id: "name_desc",
                           label: t("banks.sortOptions.nameDesc"),
                        },
                        {
                           id: "newest",
                           label: t("banks.sortOptions.newest"),
                        },
                        {
                           id: "oldest",
                           label: t("banks.sortOptions.oldest"),
                        },
                     ]}
                     onSelect={(id) => setSortBy(id)}
                     className="w-full sm:w-auto"
                  />
               </div>

               {canCreateBank && (
                  <button
                     className="bg-text-strong text-background w-full sm:w-auto flex items-center justify-start gap-1.5 px-3 py-2 rounded-lg hover:bg-bg-dark/90 transition-colors text-xs sm:text-sm font-medium leading-5 tracking-[-0.084px] whitespace-nowrap"
                     onClick={() => {
                        setSelectedBank(null);
                        setIsAddModalOpen(true);
                     }}>
                     <Plus size={20} className="fill-background" />
                     {t("banks.addButton")}
                  </button>
               )}
            </div>
         </div>

         <BanksTab
            searchQuery={debouncedSearchTerm}
            filters={filters}
            sortBy={sortBy}
            onEdit={(bank) => {
               setSelectedBank(bank);
               setIsAddModalOpen(true);
            }}
         />

         <AddBankModal
            isOpen={isAddModalOpen}
            onClose={() => {
               setIsAddModalOpen(false);
               setSelectedBank(null);
            }}
            bank={selectedBank}
            onSuccess={() => {
               setIsAddModalOpen(false);
               setSelectedBank(null);
            }}
         />
      </div>
   );
}

export default Banks;
