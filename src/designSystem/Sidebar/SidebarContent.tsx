/** @format */

import SidebarGroup from "@/designSystem/Sidebar/SidebarGroup";
import { SidebarGroupType } from "@/designSystem/Sidebar/types";

interface SidebarContentProps {
   groups: SidebarGroupType[];
   activeTab: string;
   onTabClick: (tab: string) => void;
}

function SidebarContent({
   groups,
   activeTab,
   onTabClick,
}: SidebarContentProps) {
   return (
      <div className="px-3 md:px-4 xl:px-4 py-4 md:py-5 xl:py-6 flex-1 overflow-y-auto min-w-0">
         {groups.map((group, idx) => (
            <SidebarGroup
               key={(group.title || "group") + idx}
               group={group}
               activeTab={activeTab}
               onTabClick={onTabClick}
            />
         ))}
      </div>
   );
}

export default SidebarContent;
