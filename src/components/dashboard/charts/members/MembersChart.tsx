import { Users } from "@/Icons";
import { Separator } from "@/designSystem/ui/separator";
import { useTranslation } from "@/hooks/useTranslation";
import type { DashboardMembersSummary } from "@/services/dashboardService";

type MembersChartProps = {
   data?: DashboardMembersSummary;
};

export const MembersChart = ({ data }: MembersChartProps): JSX.Element => {
   const { t } = useTranslation("common");
   const active = data?.active ?? 0;
   const inactive = data?.inactive ?? 0;

   return (
      <div className="flex flex-col items-start gap-2 p-1.5 relative bg-bg-weak rounded-3xl border border-solid border-border h-full">
         <div className="flex flex-col items-start gap-4 p-4 relative self-stretch w-full bg-background rounded-[20px] overflow-hidden border border-solid border-border shadow-[0px_1px_2px_0px_rgba(10,13,20,0.08)] h-full">
            {/* Header */}
            <div className="flex items-center justify-center relative shrink-0 w-full ">
               <div className="flex flex-1 gap-3 items-center min-h-px min-w-px relative shrink-0">
                  <div className="bg-background border border-border rounded-[10px] flex items-center p-1.5 shadow-[0px_1px_2px_0px_rgba(10,13,20,0.03)] shrink-0">
                     <Users className="fill-chart-receipt" size={20} />
                  </div>
                  <p className="flex-1 font-medium leading-6 min-h-px min-w-px text-base text-text-strong tracking-[-0.176px]">
                     {t("charts.members.title")}
                  </p>
               </div>
            </div>

            <Separator className="bg-border h-px w-full" />

            {/* Content */}
            <div className="flex flex-col gap-4 w-full flex-1">
               {/* Active Members */}
               <div className="flex items-center gap-2 p-3 bg-chart-members-active-bg rounded-xl w-full">
                  <p className="flex-1 font-medium text-sm text-text-strong tracking-[-0.084px] leading-5">
                     {active}
                  </p>
                  <p className="text-xs font-medium text-text-sub leading-4">
                     {t("charts.members.active")}
                  </p>
               </div>

               {/* Inactive Members */}
               <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-chart-members-inactive-bg-start to-chart-members-inactive-bg-end rounded-xl w-full">
                  <p className="flex-1 font-medium text-sm text-text-strong tracking-[-0.084px] leading-5">
                     {inactive}
                  </p>
                  <p className="text-xs font-medium text-text-sub leading-4">
                     {t("charts.members.inactive")}
                  </p>
               </div>
            </div>
         </div>
      </div>
   );
};
