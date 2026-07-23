/** @format */

import {
   BuildingPen,
   Gear,
   LaptopMobile,
   UserGearAlt,
   LayerGroup,
   UsersGroup,
   // ArrowRightLeft,
   ReceiptDollar,
   WalletSimple,
   Bank,
} from "@/Icons";
import { SidebarGroupType } from "@/designSystem/Sidebar";

type SidebarTabConfig = SidebarGroupType["tabs"][number] & {
   requiredPermissions?: string[];
};

type SidebarGroupConfig = Omit<SidebarGroupType, "tabs"> & {
   tabs: SidebarTabConfig[];
};

export const getSettingsSidebarGroups = (
   t: (key: string) => string,
   can?: (permission: string) => boolean
): SidebarGroupType[] => {
   const groups: SidebarGroupConfig[] = [
   {
      title: t("sidebarGroups.general"),
      tabs: [
         {
            icon: Gear,
            title: t("tabs.generalSettings"),
            requiredPermissions: ["read_employee_basic", "read_employee_detailed"],
         },
         {
            icon: UserGearAlt,
            title: t("tabs.peopleAccess"),
            requiredPermissions: [
               "read_role",
               "create_role",
               "update_role",
               "delete_role",
               "read_role_member",
               "read_job_title",
               "create_job_title",
               "update_job_title",
               "delete_job_title",
               "read_team",
               "create_team",
               "update_team",
               "delete_team",
               "read_permission",
            ],
         },
            // Temporarily removed
            // {
            //    icon: BellUnlock,
            //    title: t("tabs.notifications"),
            // },
         ],
      },
   {
      title: t("sidebarGroups.company"),
      tabs: [
         {
            icon: BuildingPen,
            title: t("tabs.companySettings"),
            requiredPermissions: [
               "read_office_info",
               "manage_office_info",
               "read_holidays",
               "manage_holidays",
               "read_legal_case_type",
               "create_legal_case_type",
               "shift.view",
               "shift.manage",
               "shift.assign",
            ],
         },
         {
            icon: LaptopMobile,
            title: t("tabs.assets"),
            requiredPermissions: [
               "read_asset",
               "read_assets",
               "manage_assets",
               "create_asset",
               "update_asset",
               "delete_asset",
               "assign_asset",
               "return_asset",
            ],
         },
      ],
   },
      {
         title: t("sidebarGroups.serviceCatalog"),
         tabs: [
            {
               icon: LayerGroup,
               title: t("tabs.serviceCatalog"),
               requiredPermissions: [
                  "view_service_catalog",
                  "view_services",
                  "view_departments",
                  "view_categories",
               ],
            },
            {
               icon: UsersGroup,
               title: t("tabs.invoiceProfiles"),
               requiredPermissions: [
                  "view_service_catalog",
                  "view_customers",
                  "view_agents",
               ],
            },
         ],
      },
      {
         title: t("sidebarGroups.financial"),
         tabs: [
            // {
            //    icon: ArrowRightLeft,
            //    title: t("tabs.voucherTypes"),
            //    requiredPermissions: [
            //       "view_financial_settings",
            //       "view_voucher_types",
            //    ],
            // },
            {
               icon: ReceiptDollar,
               title: t("tabs.expenseTypes"),
               requiredPermissions: [
                  "view_financial_settings",
                  "view_expense_types",
               ],
            },
            {
               icon: ReceiptDollar,
               title: t("tabs.incomeTypes"),
               requiredPermissions: [
                  "view_financial_settings",
                  "view_income_types",
                  "view_expense_types",
               ],
            },
            {
               icon: WalletSimple,
               title: t("tabs.prettyCashNames"),
               requiredPermissions: [
                  "view_financial_settings",
                  "view_petty_cash",
               ],
            },
            {
               icon: Bank,
               title: t("tabs.banks"),
               requiredPermissions: [
                  "view_financial_settings",
                  "view_banks",
               ],
            },
         ],
      },
   ];

   const filteredGroups = groups
      .map((group) => {
         const tabs = group.tabs.filter((tab) => {
            if (!tab.requiredPermissions || tab.requiredPermissions.length === 0) {
               return true;
            }
            if (!can) return true;
            return tab.requiredPermissions.some((permission) => can(permission));
         });

         const sanitizedTabs = tabs.map(({ requiredPermissions, ...tab }) => tab);

         return { ...group, tabs: sanitizedTabs };
      })
      .filter((group) => group.tabs.length > 0);

   return filteredGroups;
};
