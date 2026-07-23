import Button from "@/designSystem/Button";
import SortDropdown from "@/designSystem/SortDropdown";
import { useTranslation } from "@/hooks/useTranslation";
import { useLanguage } from "@/hooks/useLanguage";
import { Search2Line, MemoListPlusCircle } from "@/Icons";
import ContractsFilterDropdown from "./ContractsFilterDropdown";
import type { ContractFilters } from "./ContractsFilterDropdown";
import { PermissionGate } from "@/utilities/secure/PermissionGate";
import ExportButton from "@/components/common/ExportButton";

type ContractsToolbarProps = {
   searchQuery: string;
   onSearchChange: (value: string) => void;
   onSortChange: (optionId: string) => void;
   onAddContractClick: () => void;
   onFiltersApply?: (filters: ContractFilters) => void;
   exportData?: any[];
   rawData?: any[];
   rawDataIdField?: string;
};

function ContractsToolbar({
   searchQuery,
   onSearchChange,
   onSortChange,
   onAddContractClick,
   onFiltersApply,
   exportData = [],
   rawData = [],
   rawDataIdField = "id",
}: ContractsToolbarProps) {
   const { t } = useTranslation("common");
   const { isRTL } = useLanguage();

   const sortOptions = [
      { id: "id", label: t("contracts.id") },
      { id: "contractName", label: t("contracts.contractName") },
      { id: "assignedTo", label: t("contracts.assignedTo") },
      { id: "status", label: t("contracts.statusLabel") },
      { id: "startDate", label: t("contracts.assignMember.startDate") },
      { id: "endDate", label: t("contracts.assignMember.endDate") },
      { id: "contractAmount", label: t("contracts.contractAmount") },
   ];

   return (
      <div className="flex flex-col gap-3 mb-6 sm:flex-row sm:items-center sm:justify-between xl:whitespace-nowrap">
         <div className="w-full sm:flex-1">
            <div className="relative">
               <div
                  className={`absolute top-1/2 -translate-y-1/2 ${
                     isRTL ? "right-3" : "left-3"
                  }`}>
                  <Search2Line size={20} />
               </div>
               <div
                  className={`w-full text-xs md:text-sm xl:text-sm ${
                     isRTL ? "pr-10 pl-3" : "pl-10 pr-3"
                  } py-2 text-text-sub cursor-default`}
                  aria-label="Use filters to filter contract by user">
                  {searchQuery || "Use filters to filter contract by user"}
               </div>
            </div>
         </div>

         <div className="flex flex-col gap-2 w-full sm:flex-row sm:w-auto sm:flex-wrap sm:items-center">
            <div className="grid grid-cols-2 gap-2 w-full sm:w-auto sm:flex sm:items-center">
               <ContractsFilterDropdown
                  onApply={onFiltersApply}
                  triggerClassName="w-full justify-between"
               />
               <SortDropdown
                  label={t("actions.sortBy")}
                  options={sortOptions}
                  onSelect={onSortChange}
                  className="w-full sm:w-auto"
               />
            </div>

            <ExportButton
               data={exportData}
               rawData={rawData}
               idField={rawDataIdField}
               filename="contracts"
               sheetName="Contracts"
               className="w-full sm:w-auto text-xs sm:text-sm whitespace-nowrap justify-start"
            />

            <PermissionGate
               permission={["create_contract", "manage_contracts"]}>
               <Button
                  onClick={onAddContractClick}
                  className="w-full sm:w-auto flex items-center justify-start gap-2 px-3 py-2 text-xs sm:text-sm whitespace-nowrap">
                  <MemoListPlusCircle className="fill-current" />
                  <p className="text-sm tracking-tight whitespace-nowrap">
                     {t("actions.createContract")}
                  </p>
               </Button>
            </PermissionGate>
         </div>
      </div>
   );
}

export default ContractsToolbar;
