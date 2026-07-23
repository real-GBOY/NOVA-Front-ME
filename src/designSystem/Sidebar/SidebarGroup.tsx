/** @format */

import SidebarRow from "@/designSystem/SidebarRow";
import { SidebarGroupType } from "@/designSystem/Sidebar/types";

interface SidebarGroupProps {
   group: SidebarGroupType;
   activeTab: string;
   onTabClick: (tab: string) => void;
}

function SidebarGroup({ group, activeTab, onTabClick }: SidebarGroupProps) {
   return (
      <div className="mb-5 md:mb-6 xl:mb-6 last:mb-0">
         {group.title && (
            <h1 className="mb-2.5 md:mb-3 xl:mb-3 text-text-soft text-[10px] md:text-xs xl:text-xs uppercase tracking-wider">
               {group.title}
            </h1>
         )}
         <div className="flex flex-col gap-2">
            {group.tabs.map((tab, idx) => (
               <SidebarRow
                  key={tab.title + idx}
                  Icon={tab.icon}
                  Title={tab.title}
                  active={activeTab === tab.title && !tab.disabled}
                  disabled={tab.disabled}
                  statusIcon={tab.statusIcon}
                  statusTooltip={tab.statusTooltip}
                  showBadge={tab.showBadge}
                  badgeLabel={tab.badgeLabel}
                  badgeColorClassName={tab.badgeColorClassName}
                  onClick={() => onTabClick(tab.title)}
               />
            ))}
         </div>
      </div>
   );
}

export default SidebarGroup;
