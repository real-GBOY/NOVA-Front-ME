/** @format */

export const getTabToRouteMap = (
	t: (key: string) => string
): Record<string, string> => ({
	[t("tabs.generalSettings")]: "general",
	[t("tabs.peopleAccess")]: "people-access",
	[t("tabs.notifications")]: "notifications",
	[t("tabs.companySettings")]: "company",
	[t("tabs.assets")]: "assets",
	[t("tabs.serviceCatalog")]: "service-catalog",
	[t("tabs.invoiceProfiles")]: "invoice-profiles",
	[t("tabs.voucherTypes")]: "voucher-types",
	[t("tabs.expenseTypes")]: "expense-types",
	[t("tabs.incomeTypes")]: "income-types",
	[t("tabs.prettyCashNames")]: "pretty-cash-names",
	[t("tabs.banks")]: "banks",
});

export const getRouteToTabMap = (
	t: (key: string) => string
): Record<string, string> => ({
	general: t("tabs.generalSettings"),
	"people-access": t("tabs.peopleAccess"),
	notifications: t("tabs.notifications"),
	company: t("tabs.companySettings"),
	assets: t("tabs.assets"),
	"service-catalog": t("tabs.serviceCatalog"),
	"invoice-profiles": t("tabs.invoiceProfiles"),
	"voucher-types": t("tabs.voucherTypes"),
	"expense-types": t("tabs.expenseTypes"),
	"income-types": t("tabs.incomeTypes"),
	"pretty-cash-names": t("tabs.prettyCashNames"),
	banks: t("tabs.banks"),
});
