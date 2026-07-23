/** @format */

import { useParams, Navigate } from "react-router-dom";
import { useTranslation } from "@/hooks/useTranslation";
import PeopleAccessView from "./views/PeopleAccess/PeopleAccessView";
import SettingsPlaceholder from "./views/SettingsPlaceholder";
import GeneralSettingsView from "./Generalsettings/GeneralSettingsView";
import NotificationsSettingsView from "./NotificationsSettings/NotificationsSettingsView";
import CompanySettingsView from "./CompanySettings/CompanySettingsView";
import InvoiceProfilesView from "./views/InvoiceProfiles";
import AssetsView from "./views/Assets";
import ServiceCatalog from "./views/ServiceCatalog";
// import InvoiceProfilesView from "./views/InvoiceProfiles";
// import VoucherTypes from "./views/VoucherTypes";
import ExpenseTypes from "./views/ExpenseTypes";
import IncomeTypes from "./views/IncomeTypes";
import Banks from "./views/Banks";
import PrettyCashNames from "./views/PrettyCashNames";
import { getRouteToTabMap } from "./sidebar/routeMapping";

function SettingsContent() {
	const { tab } = useParams<{ tab: string }>();
   const { t } = useTranslation("settings");
	const routeToTabMap = getRouteToTabMap(t);
	const activeTab = tab ? routeToTabMap[tab] : "";

	// Redirect to general if invalid route
	if (tab && !activeTab) {
		return <Navigate to='/settings/general' replace />;
	}

	return (
		<div className='flex flex-1 min-w-0 min-h-0 flex-col rounded-none md:rounded-2xl bg-background'>
			<div className='mx-4 md:mx-6 h-px bg-border'></div>
			<div className='flex-1 min-h-0 overflow-y-auto scrollbar-hide py-4 md:py-6 px-4 md:px-6'>
				{activeTab === t("tabs.peopleAccess") && <PeopleAccessView />}
				{activeTab === t("tabs.generalSettings") && <GeneralSettingsView />}
				{activeTab === t("tabs.notifications") && <NotificationsSettingsView />}
				{activeTab === t("tabs.companySettings") && <CompanySettingsView />}
				{activeTab === t("tabs.assets") && <AssetsView />}
				{activeTab === t("tabs.serviceCatalog") && <ServiceCatalog />}
				{activeTab === t("tabs.invoiceProfiles") && <InvoiceProfilesView />}
				{/* {activeTab === t("tabs.voucherTypes") && <VoucherTypes />} */}
				{activeTab === t("tabs.expenseTypes") && <ExpenseTypes />}
				{activeTab === t("tabs.incomeTypes") && <IncomeTypes />}
				{activeTab === t("tabs.banks") && <Banks />}
				{activeTab === t("tabs.prettyCashNames") && <PrettyCashNames />}
				{activeTab &&
					activeTab !== t("tabs.peopleAccess") &&
					activeTab !== t("tabs.generalSettings") &&
					activeTab !== t("tabs.notifications") &&
					activeTab !== t("tabs.companySettings") &&
					activeTab !== t("tabs.assets") &&
					activeTab !== t("tabs.serviceCatalog") &&
					activeTab !== t("tabs.invoiceProfiles") &&
					// activeTab !== t("tabs.voucherTypes") &&
					activeTab !== t("tabs.expenseTypes") &&
					activeTab !== t("tabs.incomeTypes") &&
					activeTab !== t("tabs.banks") &&
				activeTab !== t("tabs.prettyCashNames") && (
						<SettingsPlaceholder tabTitle={activeTab} />
					)}
			</div>
		</div>
	);
}

export default SettingsContent;
