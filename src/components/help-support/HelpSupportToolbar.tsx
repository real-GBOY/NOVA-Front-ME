/** @format */

import Button from "@/designSystem/Button";
import { useTranslation } from "@/hooks/useTranslation";
import { useLanguage } from "@/hooks/useLanguage";
import { Search2Line, AddLine } from "@/Icons";
import SortDropdown, { SortOption } from "@/designSystem/SortDropdown";
import HelpSupportFilterDropdown, { TicketFilters } from "./HelpSupportFilterDropdown";
import { TicketMeta } from "@/types/tickets";

type HelpSupportTab = "incoming" | "own" | "initiated";

type HelpSupportToolbarProps<OptionId extends string = string> = {
   activeTab: HelpSupportTab;
   onTabChange: (tab: HelpSupportTab) => void;
   showInitiatedTab?: boolean;
   showIncomingUnreadBadge?: boolean;
   searchQuery: string;
   onSearchChange: (value: string) => void;
   sortOptions: SortOption<OptionId>[];
   onSortChange: (optionId: OptionId) => void;
   onAddTicketClick?: () => void;
   ticketMeta?: TicketMeta;
   onFiltersApply?: (filters: TicketFilters) => void;
   incomingUnreadCount?: number;
   ownUnreadCount?: number;
   initiatedUnreadCount?: number;
};

function HelpSupportToolbar<OptionId extends string>({
   activeTab,
   onTabChange,
   searchQuery,
   onSearchChange,
   sortOptions,
   onSortChange,
   onAddTicketClick,
   ticketMeta,
   onFiltersApply,
   incomingUnreadCount = 0,
   ownUnreadCount = 0,
   initiatedUnreadCount = 0,
   showInitiatedTab = true,
   showIncomingUnreadBadge = true,
}: HelpSupportToolbarProps<OptionId>) {
   const { t } = useTranslation("helpSupport");
   const { isRTL } = useLanguage();

   const getTabClassName = (isActive: boolean) =>
      `!px-4 !py-1 !text-sm !font-medium !rounded-md !transition-colors ${
         isActive
            ? "!bg-background !shadow-sm !text-text-strong hover:!bg-background"
            : "!text-text-soft hover:!bg-background/50 !bg-transparent !border-0"
      }`;

   const renderUnreadBadge = (count: number) => {
      if (count <= 0) return null;

      if (count === 1) {
         return (
            <span
               className="inline-flex h-2.5 w-2.5 rounded-full bg-primary border-2 border-background"
               title="1 unread message"
            />
         );
      }

      const displayCount = count > 99 ? "99+" : count;
      return (
         <span
            className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-semibold text-primary bg-primary/10 border border-primary/20 rounded-full"
            title={`${count} unread messages`}>
            {displayCount}
         </span>
      );
   };

   return (
      <div
         className={`flex flex-col md:flex-row md:items-center gap-3 mb-6 xl:whitespace-nowrap ${
            isRTL ? "md:flex-row-reverse" : ""
         }`}
         dir={isRTL ? "rtl" : "ltr"}>
         <div className="bg-bg-weak flex p-0.5 rounded-lg w-fit max-w-full overflow-x-auto">
            <Button
               onClick={() => onTabChange("incoming")}
               className={getTabClassName(activeTab === "incoming")}>
               <span className="flex items-center gap-2">
                  {t("tabs.incoming")}
                  {showIncomingUnreadBadge
                     ? renderUnreadBadge(incomingUnreadCount)
                     : null}
               </span>
            </Button>
            <Button
               onClick={() => onTabChange("own")}
               className={getTabClassName(activeTab === "own")}>
               <span className="flex items-center gap-2">
                  {t("tabs.own")}
                  {renderUnreadBadge(ownUnreadCount)}
               </span>
            </Button>
            {showInitiatedTab && (
               <Button
                  onClick={() => onTabChange("initiated")}
                  className={getTabClassName(activeTab === "initiated")}>
                  <span className="flex items-center gap-2">
                     {t("tabs.initiated")}
                     {renderUnreadBadge(initiatedUnreadCount)}
                  </span>
               </Button>
            )}
         </div>

         <div
            className={`flex flex-col md:flex-row md:items-center gap-2 w-full md:flex-1 ${
               isRTL ? "md:justify-start" : "md:justify-end"
            }`}>
            <div className="w-full md:max-w-xs md:flex-1">
               <div className="relative">
                  <div
                     className={`absolute top-1/2 -translate-y-1/2 ${
                        isRTL ? "right-3" : "left-3"
                     }`}>
                     <Search2Line size={20} />
                  </div>
                  <input
                     type="text"
                     placeholder={t("searchTickets")}
                     value={searchQuery}
                     onChange={(e) => onSearchChange(e.target.value)}
                     className={`w-full text-xs md:text-sm xl:text-sm ${
                        isRTL ? "pr-10 pl-3" : "pl-10 pr-3"
                     } py-2 border border-border rounded-lg bg-background text-text-sub placeholder:text-text-soft focus:outline-none focus:ring-2 focus:ring-primary/20`}
                  />
               </div>
            </div>

            <div
               className={`grid grid-cols-2 gap-2 w-full sm:flex sm:flex-wrap sm:items-center md:w-auto md:justify-end ${
                  isRTL ? "sm:flex-row-reverse md:mr-auto" : "md:ml-auto"
               }`}>
               <HelpSupportFilterDropdown
                  meta={ticketMeta}
                  onApply={onFiltersApply}
                  triggerClassName="w-full justify-between"
               />
               <SortDropdown
                  label={t("sortBy")}
                  options={sortOptions}
                  onSelect={onSortChange}
                  className="w-full sm:w-auto"
               />
               {onAddTicketClick && (
                  <Button
                     onClick={onAddTicketClick}
                     className="col-span-2 w-full sm:w-auto flex items-center justify-start gap-2 px-3 py-2 text-xs sm:text-sm whitespace-nowrap">
                     <AddLine className="fill-current" size={20} />
                     <p className="text-sm tracking-tight whitespace-nowrap">
                        {t("addTicket")}
                     </p>
                  </Button>
               )}
            </div>
         </div>
      </div>
   );
}

export default HelpSupportToolbar;
