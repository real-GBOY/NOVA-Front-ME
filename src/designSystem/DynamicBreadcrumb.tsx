/** @format */

import { useLocation, useNavigate } from "react-router-dom";
import {
   Breadcrumb,
   BreadcrumbItem,
   BreadcrumbLink,
   BreadcrumbList,
   BreadcrumbPage,
   BreadcrumbSeparator,
} from "@/designSystem/ui/breadcrumb";
import { useTranslation } from "@/hooks/useTranslation";

interface BreadcrumbConfig {
   [key: string]: string;
}

interface DynamicBreadcrumbProps {
   breadcrumbConfig?: BreadcrumbConfig;
}

function DynamicBreadcrumb({ breadcrumbConfig }: DynamicBreadcrumbProps) {
   const location = useLocation();
   const navigate = useNavigate();
   const { t } = useTranslation("common");

   const DEFAULT_CONFIG: BreadcrumbConfig = {
      members: t("nav.members"),
      profile: t("nav.profile"),
      settings: t("nav.settings"),
      roles: t("nav.roles"),
      "role-details": t("nav.roleDetails"),
      permissions: t("nav.permissions"),
      documents: t("nav.documents"),
   };

   const effectiveBreadcrumbConfig = breadcrumbConfig || DEFAULT_CONFIG;

   // Split the pathname and filter out empty strings
   const pathSegments = location.pathname
      .split("/")
      .filter((segment) => segment !== "");

   // For dashboard routes, skip the "dashboard" segment when there are
   // deeper segments so breadcrumbs start from the sidebar section
   // e.g. /dashboard/members/profile -> Members / Member's Profile
   const effectiveSegments =
      pathSegments[0] === "dashboard" && pathSegments.length > 1
         ? pathSegments.slice(1)
         : pathSegments;

   // Generate breadcrumb items from path segments
   const breadcrumbItems = effectiveSegments.map((segment, index) => ({
      label:
         effectiveBreadcrumbConfig[segment] ||
         segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " "),
      path: "/" + effectiveSegments.slice(0, index + 1).join("/"),
      isActive: index === effectiveSegments.length - 1,
   }));

   return (
      <Breadcrumb>
         <BreadcrumbList>
            {breadcrumbItems.map((item, index) => (
               <div key={item.path} className="flex items-center gap-1.5">
                  {index > 0 && <BreadcrumbSeparator />}
                  <BreadcrumbItem>
                     {item.isActive ? (
                        <BreadcrumbPage className="text-lg">
                           {item.label}
                        </BreadcrumbPage>
                     ) : (
                        <BreadcrumbLink
                           onClick={() => navigate(item.path)}
                           className="text-text-soft cursor-pointer text-lg">
                           {item.label}
                        </BreadcrumbLink>
                     )}
                  </BreadcrumbItem>
               </div>
            ))}
         </BreadcrumbList>
      </Breadcrumb>
   );
}

export default DynamicBreadcrumb;
