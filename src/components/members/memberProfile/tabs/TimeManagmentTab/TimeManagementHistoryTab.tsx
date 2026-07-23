/** @format */

import { useTranslation } from "@/hooks/useTranslation";
import { useGetTimeOffSummary } from "@/hooks/employees/employee.queries";

interface TimeManagementHistoryTabProps {
   employeeId: string | number;
}

const NON_ALLOCATED_POLICY_CODES = new Set(["unpaid", "emergency", "nursing"]);

const NON_ALLOCATED_NAME_TOKENS = ["unpaid", "emergency", "nursing"];
const HOUR_BASED_NAME_TOKENS = ["emergency", "nursing"];

const formatMetricValue = (value: number | string | null | undefined) => {
   if (value === null || value === undefined) return "0";
   if (typeof value === "number") return Number.isFinite(value) ? `${value}` : "0";
   const trimmed = String(value).trim();
   return trimmed.length ? trimmed : "0";
};

function TimeManagementHistoryTab({ employeeId }: TimeManagementHistoryTabProps) {
   const { t } = useTranslation("members");
   const { data, isLoading } = useGetTimeOffSummary(employeeId, undefined, {
      enabled: !!employeeId,
   });

   const shouldHideAllocated = (balance: NonNullable<typeof data>["balances"][number]) => {
      const policyCode = String(balance.vacation_type?.policy_code || "")
         .toLowerCase()
         .trim();
      if (NON_ALLOCATED_POLICY_CODES.has(policyCode)) {
         return true;
      }

      const normalizedName = String(balance.vacation_type?.name || "")
         .toLowerCase()
         .trim();

      return NON_ALLOCATED_NAME_TOKENS.some((token) => normalizedName.includes(token));
   };

   const shouldRenderDhms = (
      balance: NonNullable<typeof data>["balances"][number],
   ) => {
      const policyCode = String(balance.vacation_type?.policy_code || "")
         .toLowerCase()
         .trim();
      if (policyCode === "emergency" || policyCode === "nursing") {
         return true;
      }

      const normalizedName = String(balance.vacation_type?.name || "")
         .toLowerCase()
         .trim();
      return HOUR_BASED_NAME_TOKENS.some((token) => normalizedName.includes(token));
   };

   const formatUsedDisplay = (
      balance: NonNullable<typeof data>["balances"][number],
   ) => {
      if (!shouldRenderDhms(balance)) {
         return `${formatMetricValue(balance.used)} ${t("timeManagement.history.used")}`;
      }

      const matchingCounter = (data?.hour_counters || []).find(
         (counter) => counter.vacation_type_id === balance.vacation_type.id,
      );

      if (!matchingCounter) {
         return `${formatMetricValue(balance.used)} ${t("timeManagement.history.used")}`;
      }

      const remainderMinutes = Math.max(0, Number(matchingCounter.remainder_minutes) || 0);
      const hours = Math.floor(remainderMinutes / 60);
      const minutes = remainderMinutes % 60;
      return `${matchingCounter.converted_days}d ${hours}h ${minutes}m ${t("timeManagement.history.used")}`;
   };

   if (isLoading) {
      return (
         <div className="flex items-center justify-center py-8">
            <p className="text-text-soft">{t("loading.general")}</p>
         </div>
      );
   }

   return (
      <div className="space-y-4">
         <div className="bg-background border border-border rounded-lg p-4">
            <h3 className="text-base font-semibold text-text-strong mb-3">
               {t("timeManagement.history.balancesTitle")}
            </h3>
            {data?.balances?.length ? (
               <div className="space-y-2">
                  {data.balances.map((balance) => (
                     <div
                        key={`balance-${balance.vacation_type.id}`}
                        className="flex items-center justify-between border border-border rounded-md px-3 py-2.5"
                     >
                        <p className="text-sm font-medium text-text-strong">
                           {balance.vacation_type.name}
                        </p>
                        <div className="flex items-center gap-1.5">
                           <span className="inline-flex items-center rounded-full bg-bg-weak px-2 py-0.5 text-xs font-medium text-text-strong">
                              {formatUsedDisplay(balance)}
                           </span>
                           {!shouldHideAllocated(balance) && (
                              <span className="inline-flex items-center rounded-full bg-bg-weak px-2 py-0.5 text-xs font-medium text-text-sub">
                                 {formatMetricValue(balance.allocated)}{" "}
                                 {t("timeManagement.history.allocated")}
                              </span>
                           )}
                        </div>
                     </div>
                  ))}
               </div>
            ) : (
               <p className="text-sm text-text-sub">{t("timeManagement.history.noBalances")}</p>
            )}
         </div>

         <div className="bg-background border border-border rounded-lg p-4">
            <h3 className="text-base font-semibold text-text-strong mb-3">
               {t("timeManagement.history.requestsTitle")}
            </h3>
            {data?.requests?.length ? (
               <div className="max-h-[420px] overflow-y-auto pr-1 space-y-2">
                  {data.requests.map((request) => (
                     <div
                        key={`request-${request.id}`}
                        className="border border-border rounded-md px-3 py-2 space-y-1"
                     >
                        <div className="flex items-center justify-between">
                           <p className="text-sm font-medium text-text-strong">
                              {request.vacation_type?.name || "-"}
                           </p>
                           <p className="text-xs text-text-sub">{request.status}</p>
                        </div>
                        <p className="text-xs text-text-sub">
                           {request.request_unit === "hour"
                              ? `${request.request_date || "-"} • ${request.start_time || "--:--"} - ${request.end_time || "--:--"}`
                              : `${request.start_date || "-"} → ${request.end_date || "-"}`
                           }
                        </p>
                        {request.reason ? (
                           <p className="text-xs text-text-strong">{request.reason}</p>
                        ) : null}
                     </div>
                  ))}
               </div>
            ) : (
               <p className="text-sm text-text-sub">{t("timeManagement.history.noRequests")}</p>
            )}
         </div>

         <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <div className="bg-background border border-border rounded-lg p-4">
               <h3 className="text-base font-semibold text-text-strong mb-3">
                  {t("timeManagement.history.hourCountersTitle")}
               </h3>
               {data?.hour_counters?.length ? (
                  <div className="space-y-2">
                     {data.hour_counters.map((counter) => (
                        <div
                           key={`counter-${counter.vacation_type_id}-${counter.year}`}
                           className="border border-border rounded-md px-3 py-2 text-sm text-text-strong"
                        >
                           <p>
                              {counter.year}: {counter.total_minutes}m
                           </p>
                           <p className="text-xs text-text-sub">
                              {counter.converted_days}d + {counter.remainder_minutes}m
                           </p>
                        </div>
                     ))}
                  </div>
               ) : (
                  <p className="text-sm text-text-sub">{t("timeManagement.history.noHourCounters")}</p>
               )}
            </div>

            <div className="bg-background border border-border rounded-lg p-4">
               <h3 className="text-base font-semibold text-text-strong mb-3">
                  {t("timeManagement.history.nursingTitle")}
               </h3>
               {data?.nursing_status?.active ? (
                  <div className="space-y-1">
                     <p className="text-sm text-text-strong">
                        {t("timeManagement.history.nursingActive")}
                     </p>
                     <p className="text-xs text-text-sub">
                        {t("timeManagement.history.nursingApprovedAt")}:{" "}
                        {data.nursing_status.approved_at || "-"}
                     </p>
                     <p className="text-xs text-text-sub">
                        {t("timeManagement.history.nursingEndDate")}:{" "}
                        {data.nursing_status.nursing_end_date || "-"}
                     </p>
                  </div>
               ) : (
                  <p className="text-sm text-text-sub">{t("timeManagement.history.nursingInactive")}</p>
               )}
            </div>
         </div>
      </div>
   );
}

export default TimeManagementHistoryTab;
