import React, { createContext, useContext, useState, ReactNode } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { getSettingsSidebarGroups } from "../../components/settings/sidebar/constants";

export type ActiveTabContextType = {
   activeTab: string;
   setActiveTab: (tab: string) => void;
};

const ActiveTabContext = createContext<ActiveTabContextType | undefined>(
   undefined
);

export const ActiveTabProvider = ({ children }: { children: ReactNode }) => {
   const { t } = useTranslation("settings");
   const settingsSidebarGroups = getSettingsSidebarGroups(t);

   // Get the first tab title from settingsSidebarGroups
   const defaultTab = settingsSidebarGroups[0]?.tabs[0]?.title || "";
   const [activeTab, setActiveTab] = useState<string>(defaultTab);

   return (
      <ActiveTabContext.Provider value={{ activeTab, setActiveTab }}>
         {children}
      </ActiveTabContext.Provider>
   );
};

export const useActiveTab = () => {
   const context = useContext(ActiveTabContext);
   if (!context) {
      throw new Error("useActiveTab must be used within an ActiveTabProvider");
   }
   return context;
};
