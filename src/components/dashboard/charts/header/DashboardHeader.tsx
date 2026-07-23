import { useEffect, useMemo, useRef, useState } from "react";
import Avatar from "@/designSystem/Avatar";
import Button from "@/designSystem/Button";
import DatePicker from "@/designSystem/DatePicker";
import SortDropdown from "@/designSystem/SortDropdown";
import { Calendar, ArrowDownSLine } from "@/Icons";
import { useTranslation } from "@/hooks/useTranslation";
import { useLanguage } from "@/hooks/useLanguage";
import { getDateRangeForPeriod } from "@/utilities/dateRange";
import type { DashboardTimePeriod } from "@/types/dashboard";

type DateRangePreset = DashboardTimePeriod | "custom";

export type DashboardDateRange = {
   from_date?: string;
   to_date?: string;
};

type DashboardHeaderProps = {
   userName?: string;
   userAvatar?: string | null;
   newRequestsCount?: number;
   onDateRangeChange?: (range: DashboardDateRange) => void;
};

const monthLabels = (t: any) => [
   t("months.jan"),
   t("months.feb"),
   t("months.mar"),
   t("months.apr"),
   t("months.may"),
   t("months.jun"),
   t("months.jul"),
   t("months.aug"),
   t("months.sep"),
   t("months.oct"),
   t("months.nov"),
   t("months.dec"),
];

const formatDateLabel = (dateString?: string, monthNames?: string[]) => {
   if (!dateString) return "";
   const months = monthNames || [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
   ];

   // Handle date string format (YYYY-MM-DD)
   const parts = dateString.trim().split("-");
   if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10);
      const day = parseInt(parts[2], 10);

      if (!Number.isNaN(year) && !Number.isNaN(month) && !Number.isNaN(day) && month >= 1 && month <= 12) {
         return `${day} ${months[month - 1]} ${year}`;
      }
   }

   return dateString;
};

const toDateString = (date?: Date) => {
   if (!date) return "";
   const year = date.getFullYear();
   const month = String(date.getMonth() + 1).padStart(2, "0");
   const day = String(date.getDate()).padStart(2, "0");
   return `${year}-${month}-${day}`;
};

export const DashboardHeader = ({
   userName: userNameProp,
   userAvatar: userAvatarProp,
   newRequestsCount: newRequestsCountProp,
   onDateRangeChange,
}: DashboardHeaderProps): JSX.Element => {
   const { t } = useTranslation("dashboard");
   const { t: tCommon } = useTranslation("common");
   const { isRTL } = useLanguage();
   const userName = userNameProp && userNameProp.trim().length > 0 ? userNameProp : t("header.fallbackName", { defaultValue: "User" });
   const userAvatar =
      (userAvatarProp && userAvatarProp.trim()) ||
      "/icons/defAvatar.png";
   const newRequestsCount = Number.isFinite(newRequestsCountProp)
      ? Number(newRequestsCountProp)
      : 0;
   const [isRangeOpen, setIsRangeOpen] = useState(false);
   const [preset, setPreset] = useState<DateRangePreset>("thisWeek");
   const [customStart, setCustomStart] = useState<string>("");
   const [customEnd, setCustomEnd] = useState<string>("");
   const [rangeError, setRangeError] = useState<string>("");
   const rangeRef = useRef<HTMLDivElement>(null);

   useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
         if (
            rangeRef.current &&
            !rangeRef.current.contains(event.target as Node)
         ) {
            setIsRangeOpen(false);
         }
      };

      if (isRangeOpen) {
         document.addEventListener("mousedown", handleClickOutside);
      }

      return () => {
         document.removeEventListener("mousedown", handleClickOutside);
      };
   }, [isRangeOpen]);

   const dateRangeLabel = useMemo(() => {
      const months = monthLabels(tCommon);
      if (preset === "custom") {
         if (!customStart || !customEnd) {
            return t("header.dateRangeLabel");
         }
         return `${formatDateLabel(customStart, months)} - ${formatDateLabel(
            customEnd,
            months
         )}`;
      }

      const range = getDateRangeForPeriod(preset);
      return `${formatDateLabel(range.from_date, months)} - ${formatDateLabel(
         range.to_date,
         months
      )}`;
   }, [customEnd, customStart, preset, tCommon, t]);

   const presetOptions = [
      {
         value: "thisWeek",
         label: t("common:charts.timePeriods.thisWeek"),
      },
      {
         value: "lastWeek",
         label: t("common:charts.timePeriods.lastWeek"),
      },
      {
         value: "thisMonth",
         label: t("common:charts.timePeriods.thisMonth"),
      },
      {
         value: "lastMonth",
         label: t("common:charts.timePeriods.lastMonth"),
      },
      { value: "custom", label: t("common:actions.custom") },
   ];

   const handlePresetChange = (value: string) => {
      setPreset(value as DateRangePreset);
      setRangeError("");
   };

   const presetLabel =
      presetOptions.find((option) => option.value === preset)?.label ??
      t("header.dateRangeLabel");

   const handleApplyRange = () => {
      if (preset === "custom") {
         if (!customStart || !customEnd) {
            setRangeError(t("header.dateRangeRequired"));
            return;
         }
         if (customEnd < customStart) {
            setRangeError(t("header.dateRangeError"));
            return;
         }
         onDateRangeChange?.({
            from_date: customStart,
            to_date: customEnd,
         });
      } else {
         const range = getDateRangeForPeriod(preset);
         onDateRangeChange?.(range);
      }
      setIsRangeOpen(false);
   };

   const handleCancelRange = () => {
      setIsRangeOpen(false);
   };

   return (
      <div className="flex flex-col gap-4 w-full px-4 pb-4 md:flex-row md:items-center md:justify-between md:px-6">
         <div className="flex items-center gap-3 md:flex-1">
            <Avatar
               src={userAvatar}
               alt={t("header.avatarAlt", { name: userName })}
               size="xl"
            />
            <div>
               <p className="text-lg md:text-2xl font-semibold text-text-strong leading-7 md:leading-8">
                  {t("header.welcome", { name: userName })}
               </p>
               <p className="text-sm md:text-base font-medium text-text-sub leading-5 md:leading-6">
                  {t("header.newRequests", { count: newRequestsCount })}
               </p>
            </div>
         </div>

         <div className="flex items-center gap-3 relative w-full md:w-auto" ref={rangeRef}>
            <Button
               variant="secondary"
               onClick={() => setIsRangeOpen((prev) => !prev)}
               className="flex w-full items-center justify-between gap-2 rounded-full border border-border bg-background px-4 text-xs md:text-sm font-medium text-text-sub shadow-[0px_5px_20px_rgba(48,63,159,0.12)] md:w-auto">
               <Calendar className="fill-icon-sub" size={18} />
               <span>{dateRangeLabel}</span>
               <ArrowDownSLine className="fill-icon-sub" size={18} />
            </Button>

            {isRangeOpen && (
               <div className="absolute z-50 mt-2 end-0 top-full w-[calc(100vw-2rem)] max-w-[420px] rounded-3xl border border-border bg-background shadow-lg p-4">
                  <div className="flex flex-col gap-4">
                     <SortDropdown
                        label={presetLabel}
                        options={presetOptions.map((option) => ({
                           id: option.value,
                           label: option.label,
                        }))}
                        onSelect={handlePresetChange}
                     />

                     {preset === "custom" && (
                        <div className="flex flex-col gap-2">
                           <div className="flex gap-2 items-center">
                              <div className="flex-1">
                                 <DatePicker
                                    value={
                                       customStart
                                          ? new Date(customStart)
                                          : undefined
                                    }
                                    popoverAlign={isRTL ? "left" : "right"}
                                    onChange={(date) => {
                                       setCustomStart(toDateString(date));
                                       setRangeError("");
                                    }}
                                    placeholder={t("header.dateFrom")}
                                 />
                              </div>
                              <span className="text-text-sub">-</span>
                              <div className="flex-1">
                                 <DatePicker
                                    value={
                                       customEnd
                                          ? new Date(customEnd)
                                          : undefined
                                    }
                                    popoverAlign={isRTL ? "left" : "right"}
                                    onChange={(date) => {
                                       setCustomEnd(toDateString(date));
                                       setRangeError("");
                                    }}
                                    placeholder={t("header.dateTo")}
                                 />
                              </div>
                           </div>
                           {rangeError && (
                              <p className="text-xs text-danger">
                                 {rangeError}
                              </p>
                           )}
                        </div>
                     )}

                     <div className="flex items-center justify-end gap-2">
                        <Button variant="secondary" onClick={handleCancelRange}>
                           {t("common:actions.cancel")}
                        </Button>
                        <Button onClick={handleApplyRange}>
                           {t("common:actions.applyNow")}
                        </Button>
                     </div>
                  </div>
               </div>
            )}
         </div>
      </div>
   );
};
