/** @format */

import PageHeader from "@/designSystem/PageHeader";
import IconButton from "@/designSystem/IconButton";
import { Search, GearOutline, Notifications } from "@/Icons";
import { useActiveTab } from "@/services/contexts/ActiveTabContext";
import { useTranslation } from "@/hooks/useTranslation";
import PeopleAccessView from "../views/PeopleAccess/PeopleAccessView";
import SettingsPlaceholder from "../views/SettingsPlaceholder";
import GeneralSettingsView from "../Generalsettings/GeneralSettingsView";
import NotificationsSettingsView from "./NotificationsSettingsView";
import CompanySettingsView from "../CompanySettings/CompanySettingsView";
import AssetsView from "../views/Assets";
import ServiceCatalog from "../views/ServiceCatalog";

function SettingsContent() {
   const { activeTab } = useActiveTab();
   const { t } = useTranslation("settings");

   return (
      <div className="flex h-screen flex-1 min-w-0 flex-col rounded-2xl bg-background">
         <PageHeader title={t("title")} actions={<HeaderActions />} />
         <div className="mx-6 h-px bg-border"></div>
         <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide pr-1 py-6 mx-6">
            {activeTab === t("tabs.peopleAccess") && <PeopleAccessView />}
            {activeTab === t("tabs.generalSettings") && <GeneralSettingsView />}
            {activeTab === t("tabs.notifications") && (
               <NotificationsSettingsView />
            )}
            {activeTab === t("tabs.companySettings") && <CompanySettingsView />}
            {activeTab === t("tabs.assets") && <AssetsView />}
            {activeTab === t("tabs.serviceCatalog") && <ServiceCatalog />}
            {activeTab !== t("tabs.peopleAccess") &&
               activeTab !== t("tabs.generalSettings") &&
               activeTab !== t("tabs.notifications") &&
               activeTab !== t("tabs.companySettings") &&
               activeTab !== t("tabs.assets") &&
               activeTab !== t("tabs.serviceCatalog") && (
                  <SettingsPlaceholder tabTitle={activeTab} />
               )}
         </div>
      </div>
   );
}

function HeaderActions() {
   const { t } = useTranslation("settings");

   return (
      <div className="flex items-center gap-2">
         <IconButton
            Icon={Search}
            ariaLabel={t("headerActions.search")}
            variant="ghost"
         />
         <IconButton
            Icon={GearOutline}
            ariaLabel={t("headerActions.quickPreferences")}
         />
         <IconButton
            Icon={Notifications}
            ariaLabel={t("headerActions.notifications")}
            variant="ghost"
         />
      </div>
   );
}

export default SettingsContent;
