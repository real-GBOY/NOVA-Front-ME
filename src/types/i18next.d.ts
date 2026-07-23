/** @format */

import "react-i18next";
import type common from "@/locales/en/common.json";
import type dashboard from "@/locales/en/dashboard.json";
import type settings from "@/locales/en/settings.json";
import type members from "@/locales/en/members.json";
import type projects from "@/locales/en/projects.json";
import type payrolls from "@/locales/en/payrolls.json";
import type reports from "@/locales/en/reports.json";
import type roles from "@/locales/en/roles.json";
import type validation from "@/locales/en/validation.json";

declare module "react-i18next" {
   interface CustomTypeOptions {
      defaultNS: "common";
      resources: {
         common: typeof common;
         dashboard: typeof dashboard;
         settings: typeof settings;
         members: typeof members;
         projects: typeof projects;
         payrolls: typeof payrolls;
         reports: typeof reports;
         roles: typeof roles;
         validation: typeof validation;
      };
   }
}
