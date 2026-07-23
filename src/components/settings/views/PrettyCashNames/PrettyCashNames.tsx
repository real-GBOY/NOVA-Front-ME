/** @format */

import { useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import SearchInput from "@/designSystem/SearchInput";
import SortDropdown from "@/designSystem/SortDropdown";
import { Plus } from "@/Icons";
import PrettyCashNamesTab from "./tabs/PrettyCashNamesTab";
import AddPrettyCashNameModal from "./modals/AddPrettyCashNameModal";
import StatusFilterDropdown, {
   StatusFilters,
} from "../../shared/StatusFilterDropdown";
import type { PrettyCashName } from "./types";
import { usePermissions } from "@/contexts/PermissionContext";
import { useDebounce } from "@/hooks/useDebounce";

function PrettyCashNames() {
   const { t } = useTranslation("settings");
   const { can } = usePermissions();
   const canCreatePrettyCashName = can("create_pretty_cash_name");
   const [searchQuery, setSearchQuery] = useState("");
   const debouncedSearchQuery = useDebounce(searchQuery, 400);
   const [isAddModalOpen, setIsAddModalOpen] = useState(false);
   const [selectedPrettyCashName, setSelectedPrettyCashName] =
      useState<PrettyCashName | null>(null);
   const [filters, setFilters] = useState<StatusFilters>({ status: [] });
   const [sortBy, setSortBy] = useState<string>("name_asc");

   return (
      <div className="flex size-full flex-col gap-6">
         {/* Title and Description */}
         <div className="flex flex-col gap-1">
            <h1 className="text-lg font-medium leading-6 tracking-[-0.27px] text-text-strong">
               {t("prettyCashNames.title")}
            </h1>
            <p className="text-sm leading-5 tracking-[-0.084px] text-text-sub">
               {t("prettyCashNames.description")}
            </p>
         </div>

         {/* Action Bar */}
         <div className="flex flex-col gap-3 w-full sm:flex-row sm:items-center sm:justify-between">
            <SearchInput
               value={searchQuery}
               onChange={setSearchQuery}
               placeholder={t("prettyCashNames.searchPlaceholder")}
               className="w-full sm:w-[280px]"
            />

            <div className="flex flex-col gap-2 w-full sm:flex-row sm:w-auto sm:flex-wrap sm:items-center">
               <div className="grid grid-cols-2 gap-2 w-full sm:w-auto sm:flex sm:items-center">
                  <StatusFilterDropdown
                     onApply={setFilters}
                     translationNamespace="settings"
                     translationPrefix="prettyCashNames"
                     triggerClassName="w-full justify-start"
                  />

                  <SortDropdown
                     label={t("prettyCashNames.sortBy")}
                     options={[
                        {
                           id: "name_asc",
                           label: t("prettyCashNames.sortOptions.nameAsc"),
                        },
                        {
                           id: "name_desc",
                           label: t("prettyCashNames.sortOptions.nameDesc"),
                        },
                        {
                           id: "newest",
                           label: t("prettyCashNames.sortOptions.newest"),
                        },
                        {
                           id: "oldest",
                           label: t("prettyCashNames.sortOptions.oldest"),
                        },
                     ]}
                     onSelect={(id) => setSortBy(id)}
                     className="w-full sm:w-auto"
                  />
               </div>

               {canCreatePrettyCashName && (
                  <button
                     className="bg-text-strong text-background w-full sm:w-auto flex items-center justify-start gap-1.5 px-3 py-2 rounded-lg hover:bg-bg-dark/90 transition-colors text-xs sm:text-sm font-medium leading-5 tracking-[-0.084px] whitespace-nowrap"
                     onClick={() => {
                        setSelectedPrettyCashName(null);
                        setIsAddModalOpen(true);
                     }}>
                     <Plus size={20} className="fill-background" />
                     {t("prettyCashNames.addButton")}
                  </button>
               )}
            </div>
         </div>

         {/* Content */}
         <PrettyCashNamesTab
            searchQuery={debouncedSearchQuery}
            filters={filters}
            sortBy={sortBy}
            onEdit={(prettyCashName) => {
               setSelectedPrettyCashName(prettyCashName);
               setIsAddModalOpen(true);
            }}
         />

         {/* Modals */}
         <AddPrettyCashNameModal
            isOpen={isAddModalOpen}
            onClose={() => {
               setIsAddModalOpen(false);
               setSelectedPrettyCashName(null);
            }}
            prettyCashName={selectedPrettyCashName}
            onSuccess={() => {
               setIsAddModalOpen(false);
               setSelectedPrettyCashName(null);
            }}
         />
      </div>
   );
}

export default PrettyCashNames;
