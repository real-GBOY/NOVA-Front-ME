/** @format */

import { useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import SearchInput from "@/designSystem/SearchInput";
import SortDropdown from "@/designSystem/SortDropdown";
import { Plus } from "@/Icons";
import VoucherTypesTab from "./tabs/VoucherTypesTab";
import AddVoucherTypeModal from "./modals/AddVoucherTypeModal";
import StatusFilterDropdown, {
   StatusFilters,
} from "../../shared/StatusFilterDropdown";
import { usePermissions } from "@/contexts/PermissionContext";
import { useDebounce } from "@/hooks/useDebounce";

function VoucherTypes() {
   const { t } = useTranslation("settings");
   const { can } = usePermissions();
   const canCreateVoucherType = can("create_voucher_type");
   const [searchQuery, setSearchQuery] = useState("");
   const debouncedSearchQuery = useDebounce(searchQuery, 400);
   const [isAddModalOpen, setIsAddModalOpen] = useState(false);
   const [selectedVoucherType, setSelectedVoucherType] = useState<any>(null);
   const [filters, setFilters] = useState<StatusFilters>({ status: [] });
   const [sortBy, setSortBy] = useState<string>("name_asc");

   return (
      <div className="flex size-full flex-col gap-6">
         {/* Title and Description */}
         <div className="flex flex-col gap-1">
            <h1 className="text-lg font-medium leading-6 tracking-[-0.27px] text-text-strong">
               {t("voucherTypes.title")}
            </h1>
            <p className="text-sm leading-5 tracking-[-0.084px] text-text-sub">
               {t("voucherTypes.description")}
            </p>
         </div>

         {/* Action Bar */}
         <div className="flex flex-col gap-3 w-full sm:flex-row sm:items-center sm:justify-between">
            <SearchInput
               value={searchQuery}
               onChange={setSearchQuery}
               placeholder={t("voucherTypes.searchPlaceholder")}
               className="w-full sm:w-[280px]"
            />

            <div className="flex flex-col gap-2 w-full sm:flex-row sm:w-auto sm:flex-wrap sm:items-center">
               <div className="grid grid-cols-2 gap-2 w-full sm:w-auto sm:flex sm:items-center">
                  <StatusFilterDropdown
                     onApply={setFilters}
                     translationNamespace="settings"
                     translationPrefix="voucherTypes"
                     triggerClassName="w-full justify-start"
                  />

                  <SortDropdown
                     label={t("voucherTypes.sortBy")}
                     options={[
                        {
                           id: "name_asc",
                           label: t("voucherTypes.sortOptions.nameAsc"),
                        },
                        {
                           id: "name_desc",
                           label: t("voucherTypes.sortOptions.nameDesc"),
                        },
                        {
                           id: "newest",
                           label: t("voucherTypes.sortOptions.newest"),
                        },
                        {
                           id: "oldest",
                           label: t("voucherTypes.sortOptions.oldest"),
                        },
                     ]}
                     onSelect={(id) => setSortBy(id)}
                     className="w-full sm:w-auto"
                  />
               </div>

               {canCreateVoucherType && (
                  <button
                     className="bg-text-strong text-background w-full sm:w-auto flex items-center justify-start gap-1.5 px-3 py-2 rounded-lg hover:bg-bg-dark/90 transition-colors text-xs sm:text-sm font-medium leading-5 tracking-[-0.084px] whitespace-nowrap"
                     onClick={() => {
                        setSelectedVoucherType(null);
                        setIsAddModalOpen(true);
                     }}>
                     <Plus size={20} className="fill-background" />
                     {t("voucherTypes.addButton")}
                  </button>
               )}
            </div>
         </div>

         {/* Content */}
         <VoucherTypesTab
            searchQuery={debouncedSearchQuery}
            filters={filters}
            sortBy={sortBy}
            onEdit={(voucherType) => {
               setSelectedVoucherType(voucherType);
               setIsAddModalOpen(true);
            }}
         />

         {/* Modals */}
         <AddVoucherTypeModal
            isOpen={isAddModalOpen}
            onClose={() => {
               setIsAddModalOpen(false);
               setSelectedVoucherType(null);
            }}
            voucherType={selectedVoucherType}
            onSuccess={() => {
               setIsAddModalOpen(false);
               setSelectedVoucherType(null);
            }}
         />
      </div>
   );
}

export default VoucherTypes;
