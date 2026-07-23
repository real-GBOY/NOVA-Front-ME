/** @format */

import { RoleFormData } from "../types";
import { Edit } from "../../../../../Icons";
import IconContainer from "../../../../../designSystem/IconContainer";
import Button from "../../../../../designSystem/Button";
import { useTranslation } from "@/hooks/useTranslation";
import type { PermissionCategory } from "@/services/permissionService";

type StepReviewProps = {
   formData: RoleFormData;
   onNavigateToStep?: (step: number) => void;
   permissionCategories?: PermissionCategory[];
};

const formatPermissionName = (name: string): string => {
   return name
      .split(/[._]/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
};

const formatScopeLabel = (scope: string): string | null => {
   if (scope.startsWith("TEAM:")) {
      return null;
   }
   if (scope.startsWith("MANAGED_BY:")) {
      return "Managed by you";
   }
   return scope
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
};

function StepReview({
   formData,
   onNavigateToStep,
   permissionCategories = [],
}: StepReviewProps) {
   const permissionsByCategory = (() => {
      const grouped: { [key: string]: string[] } = {};
      const permissionLookup = new Map<
         number,
         { name: string; category: string }
      >();

      permissionCategories.forEach((category) => {
         category.permissions.forEach((permission) => {
            permissionLookup.set(permission.permission_id, {
               name: permission.permission_name,
               category: category.category,
            });
         });
      });

      formData.permissions.forEach((permission) => {
         const meta = permissionLookup.get(permission.permission_id);
         const displayName = meta?.name
            ? formatPermissionName(meta.name)
            : `Permission ${permission.permission_id}`;
         const displayScope =
            formatScopeLabel(permission.scope) || permission.scope;
         const label = `${displayName} (${displayScope})`;
         const categoryKey = meta?.category
            ? formatPermissionName(meta.category)
            : "Other";
         if (!grouped[categoryKey]) {
            grouped[categoryKey] = [];
         }
         grouped[categoryKey].push(label);
      });

      return Object.entries(grouped).filter(([, perms]) => perms.length > 0);
   })();

   const { t } = useTranslation("settings");

   return (
      <div className="w-full max-w-[840px] min-h-[730px] rounded-2xl sm:rounded-3xl border border-border p-4 sm:p-6 bg-background flex flex-col gap-4 sm:gap-6">
         {/* Review & Confirm Header */}
         <div>
            <h3 className="text-lg sm:text-xl font-semibold text-text-strong">
               {t("wizard.review.title")}
            </h3>
            <p className="mt-1 text-xs sm:text-sm text-text-soft">
               {t("wizard.review.roleSubtitle")}
            </p>
            <div className="mt-4 sm:mt-6 border-t border-border"></div>
         </div>

         {/* Role Information Section */}
         <div className="min-h-[292px] rounded-xl sm:rounded-2xl border border-border p-3 sm:p-4 bg-background flex flex-col gap-4 sm:gap-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
               <h4 className="text-xs sm:text-sm font-semibold text-text-sub uppercase tracking-wide">
                  {t("wizard.review.roleInfo")}
               </h4>
               <Button
                  variant="secondary"
                  onClick={() => onNavigateToStep?.(1)}
                  className="flex items-center gap-0.5 w-full sm:w-[68px] h-8 rounded-lg border border-border p-1.5 text-xs sm:text-sm font-medium text-text-strong hover:bg-bg-weak transition-colors !px-1.5 !py-1.5">
                  <IconContainer
                     Icon={() => <Edit size={16} active={false} />}
                     className="!p-0 !border-0 !shadow-none !bg-transparent"
                  />
                  <span>{t("wizard.edit")}</span>
               </Button>
            </div>
            <div className="space-y-4 sm:space-y-6 flex-1">
               <div>
                  <p className="text-xs font-medium text-text-sub mb-1">
                     {t("wizard.review.roleName")}
                  </p>
                  <p className="text-sm sm:text-base font-semibold text-text-strong break-words">
                     {formData.name || "—"}
                  </p>
               </div>
               <div>
                  <p className="text-xs font-medium text-text-sub mb-1">
                     {t("wizard.review.roleDescription")}
                  </p>
                  <p className="text-xs sm:text-sm text-text-strong break-words">
                     {formData.description || "No description provided"}
                  </p>
               </div>
               <div>
                  <p className="text-xs font-medium text-text-sub mb-2">
                     {t("wizard.permissions.assignedJobTitles")}
                  </p>
                  {formData.jobTitles && formData.jobTitles.length > 0 ? (
                     <div className="flex flex-wrap gap-2">
                        {formData.jobTitles.map((jobTitleId) => (
                           <div
                              key={jobTitleId}
                              className="px-2 sm:px-3 py-1.5 sm:py-2 bg-bg-weak rounded-lg">
                              <span className="text-xs sm:text-sm font-medium text-text-strong break-words">
                                 {jobTitleId}
                              </span>
                           </div>
                        ))}
                     </div>
                  ) : (
                     <p className="text-xs sm:text-sm text-text-soft">
                        {t("wizard.permissions.noJobTitlesAssigned")}
                     </p>
                  )}
               </div>
            </div>
         </div>

         {/* Permissions Overview Section */}
         <div className="p-4 sm:p-6 rounded-xl bg-background border border-border shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 mb-3 sm:mb-4">
               <h4 className="text-xs sm:text-sm font-semibold text-text-sub uppercase tracking-wide">
                  {t("wizard.permissions.overviewTitle")}
               </h4>
               <Button
                  variant="secondary"
                  onClick={() => onNavigateToStep?.(2)}
                  className="flex items-center gap-0.5 w-full sm:w-[68px] h-8 rounded-lg border border-border p-1.5 text-xs sm:text-sm font-medium text-text-strong hover:bg-bg-weak transition-colors !px-1.5 !py-1.5">
                  <IconContainer
                     Icon={() => <Edit size={16} active={false} />}
                     className="!p-0 !border-0 !shadow-none !bg-transparent"
                  />
                  <span>{t("wizard.edit")}</span>
               </Button>
            </div>
            {permissionsByCategory.length > 0 ? (
               <div className="space-y-2 sm:space-y-3">
                  {permissionsByCategory.map(([category, permissions]) => (
                     <div
                        key={category}
                        className="flex flex-col sm:flex-row items-start sm:items-start gap-1 sm:gap-2">
                        <span className="text-xs font-medium text-text-sub sm:whitespace-nowrap">
                           {category}:
                        </span>
                        <span className="text-xs sm:text-sm font-medium text-text-strong break-words">
                           {permissions.join(", ")}
                        </span>
                     </div>
                  ))}
               </div>
            ) : (
               <p className="text-xs sm:text-sm text-text-soft">
                  {t("wizard.permissions.noPermissionsSelected")}
               </p>
            )}
         </div>
      </div>
   );
}

export default StepReview;
