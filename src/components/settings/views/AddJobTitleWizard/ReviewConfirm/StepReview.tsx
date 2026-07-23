/** @format */

import { JobTitleFormData } from "../types";
import { Edit } from "@/Icons";
import IconContainer from "@/designSystem/IconContainer";
import Button from "@/designSystem/Button";
import { useTranslation } from "@/hooks/useTranslation";

type StepReviewProps = {
   formData: JobTitleFormData;
   onNavigateToStep?: (step: number) => void;
   availableRoles?: { id: string; title: string }[];
};

function StepReview({
   formData,
   onNavigateToStep,
   availableRoles = [],
}: StepReviewProps) {
   const selectedRoles = availableRoles.filter((role) =>
      formData.roles?.includes(role.id)
   );

   const { t } = useTranslation("settings");

   return (
      <div className="w-full max-w-[840px] min-h-[730px] rounded-2xl sm:rounded-3xl border border-border p-4 sm:p-6 bg-background flex flex-col gap-4 sm:gap-6 ">
         {/* Review & Confirm Header */}
         <div>
            <h3 className="text-lg sm:text-xl font-semibold text-text-strong">
               {t("wizard.review.title")}
            </h3>
            <p className="mt-1 text-xs sm:text-sm text-text-soft">
               {t("wizard.review.jobTitleSubtitle")}
            </p>
            <div className="mt-4 sm:mt-6 border-t border-border"></div>
         </div>

         {/* Job Title Information Section */}
         <div className="min-h-[292px] rounded-xl sm:rounded-2xl border border-border p-3 sm:p-4 bg-background flex flex-col gap-4 sm:gap-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
               <h4 className="text-xs sm:text-sm font-semibold text-text-sub uppercase tracking-wide">
                  {t("wizard.review.basicInfo")}
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
                     {t("wizard.jobTitle.jobTitleName")}
                  </p>
                  <p className="text-sm sm:text-base font-semibold text-text-strong break-words">
                     {formData.name || "—"}
                  </p>
               </div>
               <div>
                  <p className="text-xs font-medium text-text-sub mb-1">
                     {t("wizard.jobTitle.description")}
                  </p>
                  <p className="text-xs sm:text-sm text-text-strong break-words">
                     {formData.description || "No description provided"}
                  </p>
               </div>
               <div>
                  <p className="text-xs font-medium text-text-sub mb-1">
                     {t("wizard.review.assignedRoles")}
                  </p>
                  <p className="text-xs sm:text-sm text-text-strong break-words">
                     {selectedRoles.length > 0
                        ? selectedRoles.map((role) => role.title).join(", ")
                        : t("wizard.review.noRolesAssigned")}
                  </p>
               </div>
            </div>
         </div>
      </div>
   );
}

export default StepReview;
