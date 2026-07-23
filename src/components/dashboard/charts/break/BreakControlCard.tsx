import { useMemo } from "react";
import { WalletClock, Play, Pause } from "@/Icons";
import { Separator } from "@/designSystem/ui/separator";
import Button from "@/designSystem/Button";
import { useTranslation } from "@/hooks/useTranslation";
import { useRequests } from "@/hooks/requests/useRequests";
import { useBreakTimer } from "@/hooks/break/useBreakTimer";
import toast from "@/utilities/toast";
import { getIsoDatePart, toLocalIsoString } from "@/components/members/memberProfile/tabs/TimeManagmentTab/modals/timeUtils";

const buildBreakPayload = () => {
   const break_time = toLocalIsoString(new Date());
   return {
      log_date: getIsoDatePart(break_time),
      break_time,
   };
};

export const BreakControlCard = (): JSX.Element => {
   const { t } = useTranslation("common");
   const { useAttendanceBreakStart, useAttendanceBreakEnd } = useRequests();
   const { isOnBreak, formattedElapsed, startBreakTimer, stopBreakTimer } =
      useBreakTimer();

   const startBreakMutation = useAttendanceBreakStart();
   const endBreakMutation = useAttendanceBreakEnd();

   const isLoading = startBreakMutation.isPending || endBreakMutation.isPending;

   const actions = useMemo(
      () => [
         {
            id: "start",
            label: t("charts.break.start", { defaultValue: "Start Break" }),
            icon: Play,
            disabled: isOnBreak,
            onClick: async () => {
               try {
                  await startBreakMutation.mutateAsync(buildBreakPayload());
                  startBreakTimer();
                  toast.success(
                     t("charts.break.startSuccess", {
                        defaultValue: "Break started successfully",
                     })
                  );
               } catch (error: unknown) {
                  const message =
                     (error as { response?: { data?: { message?: string } } })?.response
                        ?.data?.message ||
                     t("charts.break.startError", {
                        defaultValue: "Failed to start break",
                     });
                  toast.error(message);
               }
            },
            variant: "primary" as const,
         },
         {
            id: "end",
            label: t("charts.break.stop", { defaultValue: "Stop Break" }),
            icon: Pause,
            disabled: !isOnBreak,
            onClick: async () => {
               try {
                  await endBreakMutation.mutateAsync(buildBreakPayload());
                  stopBreakTimer();
                  toast.success(
                     t("charts.break.stopSuccess", {
                        defaultValue: "Break ended successfully",
                     })
                  );
               } catch (error: unknown) {
                  const message =
                     (error as { response?: { data?: { message?: string } } })?.response
                        ?.data?.message ||
                     t("charts.break.stopError", {
                        defaultValue: "Failed to stop break",
                     });
                  toast.error(message);
               }
            },
            variant: "secondary" as const,
         },
      ],
      [
         endBreakMutation,
         isOnBreak,
         startBreakMutation,
         startBreakTimer,
         stopBreakTimer,
         t,
      ]
   );

   return (
      <div className="flex flex-col items-start gap-2 p-1.5 relative bg-bg-weak rounded-3xl border border-solid border-border h-full">
         <div className="flex flex-col items-start gap-4 p-4 relative self-stretch w-full bg-background rounded-[20px] overflow-hidden border border-solid border-border shadow-[0px_1px_2px_0px_rgba(10,13,20,0.08)] h-full">
            <div className="flex items-center justify-center relative shrink-0 w-full">
               <div className="flex flex-1 gap-3 items-center min-h-px min-w-px relative shrink-0">
                  <div className="bg-background border border-border rounded-[10px] flex items-center p-1.5 shadow-[0px_1px_2px_0px_rgba(10,13,20,0.03)] shrink-0">
                     <WalletClock className="fill-chart-voucher-approved" size={20} />
                  </div>
                  <p className="flex-1 font-medium leading-6 min-h-px min-w-px text-base text-text-strong tracking-[-0.176px]">
                     {t("charts.break.title", { defaultValue: "Break Controls" })}
                  </p>
               </div>
            </div>

            <Separator className="bg-border h-px w-full" />

            <div className="w-full flex items-center justify-center">
               {isOnBreak ? (
                  <div className="inline-flex items-center gap-2 rounded-full border border-danger/30 bg-danger/10 px-3 py-1">
                     <span className="h-2 w-2 rounded-full bg-danger animate-pulse" />
                     <span className="text-xs font-medium text-danger">
                        {formattedElapsed}
                     </span>
                  </div>
               ) : (
                  <div className="inline-flex items-center gap-2 rounded-full border border-border bg-bg-weak px-3 py-1">
                     <span className="h-2 w-2 rounded-full bg-text-soft" />
                     <span className="text-xs font-medium text-text-sub">
                        {t("charts.break.idle", { defaultValue: "Not on break" })}
                     </span>
                  </div>
               )}
            </div>

            <div className="flex flex-col gap-3 w-full flex-1 justify-center">
               {actions.map((action) => {
                  const Icon = action.icon;
                  return (
                     <Button
                        key={action.id}
                        variant={action.variant}
                        onClick={action.onClick}
                        disabled={isLoading || Boolean(action.disabled)}
                        className="w-full justify-center gap-2 rounded-xl">
                        <Icon size={16} className="fill-current" />
                        {action.label}
                     </Button>
                  );
               })}
            </div>
         </div>
      </div>
   );
};
