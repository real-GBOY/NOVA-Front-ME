import { TabItem } from "../types";

export const getTabs = (
   t: (key: string) => string,
   counts?: { documentsCount?: number; assetsCount?: number },
): TabItem[] => [
   {
      id: "profile",
      label: t("profile.tabs.profile"),
   },
   { id: "contract", label: t("profile.tabs.contract") },
   { id: "time", label: t("profile.tabs.time") },
   {
      id: "documents",
      label: t("profile.tabs.documents"),
      count: counts?.documentsCount,
   },
   {
      id: "assets",
      label: t("profile.tabs.assets"),
      count: counts?.assetsCount,
   },
   {
      id: "payroll",
      label: t("profile.tabs.payroll"),
   },
   { id: "residency", label: t("profile.tabs.residency") },
];
