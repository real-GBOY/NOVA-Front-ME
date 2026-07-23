import React, { useMemo, useState } from "react";
import { useQueries } from "@tanstack/react-query";
import { format } from "date-fns";
import { useTranslation } from "@/hooks/useTranslation";
import { useListLegalCases } from "@/hooks/legalCases/useLegalCases";
import { Calendar } from "@/Icons";
import { Separator } from "@/designSystem/ui/separator";
import { legalCasesService } from "@/services/legalCasesService";
import { reactQueryKeys } from "@/config/reactQueryKeys";

type UpcomingEvent = {
   id: string;
   date: Date;
   title: string;
   caseTitle?: string;
   caseType?: string;
   description?: string;
};

export function UpcomingList() {
   const { t } = useTranslation("common");

   // Fetch open cases so we can find their upcoming events.
	const { data: response, isLoading } = useListLegalCases({
		limit: 50,
		status: ["Open", "In Progress"],
	});

   const cases = response?.data || [];
   const [expandedEvents, setExpandedEvents] = useState<
      Record<string, boolean>
   >({});

   const toggleExpanded = (id: string) => {
      setExpandedEvents((prev) => ({ ...prev, [id]: !prev[id] }));
   };

   // Fetch events for all cases using React Query's useQueries
   const eventsQueries = useQueries({
      queries: cases.map((legalCase) => ({
         queryKey: reactQueryKeys.legalCases.events(legalCase.id),
         queryFn: () => legalCasesService.getEvents(legalCase.id),
         enabled: cases.length > 0,
         refetchOnWindowFocus: false,
      })),
   });

   const eventsLoading = eventsQueries.some((q) => q.isLoading);

   // Transform events data using useMemo (derived from query results)
   const nearestEvents = useMemo(() => {
      if (eventsLoading || cases.length === 0) return [];

      const now = new Date();
      const allEvents: UpcomingEvent[] = [];

      eventsQueries.forEach((query, index) => {
         if (!query.data) return;
         const legalCase = cases[index];
         (query.data.data || []).forEach((event) => {
            const eventDate = new Date(event.date);
            if (Number.isNaN(eventDate.getTime())) {
               return;
            }
            allEvents.push({
               id: `${legalCase.id}-${event.id}`,
               date: eventDate,
               title: event.title || legalCase.title,
               caseTitle: legalCase.title,
               caseType: legalCase.type,
               description: legalCase.description || legalCase.case_number,
            });
         });
      });

      const futureEvents = allEvents
         .filter((event) => event.date >= now)
         .sort((a, b) => a.date.getTime() - b.date.getTime());

      if (futureEvents.length) {
         return futureEvents.slice(0, 10);
      }

      return allEvents
         .sort(
            (a, b) =>
               Math.abs(a.date.getTime() - now.getTime()) -
               Math.abs(b.date.getTime() - now.getTime())
         )
         .slice(0, 10);
   }, [eventsQueries, cases, eventsLoading]);

   if (isLoading || eventsLoading) {
      return (
         <div className="flex flex-col items-start gap-2 p-1.5 relative bg-bg-weak rounded-3xl border border-solid border-border h-full min-h-[300px] animate-pulse">
            <div className="w-full h-full bg-background rounded-[20px]" />
         </div>
      );
   }

   return (
      <div className="bg-bg-weak border border-border border-solid flex flex-col items-start p-[6px] relative rounded-3xl w-full h-full">
         <div className="bg-background border border-border border-solid flex flex-col flex-1 gap-4 items-start overflow-hidden p-4 relative rounded-[20px] shadow-[0px_1px_2px_0px_rgba(10,13,20,0.08)] w-full">
            {/* Header */}
            <div className="flex gap-3 items-center justify-center relative shrink-0 w-full">
               <div className="bg-background border border-border border-solid flex items-center p-1.5 relative rounded-[10px] shadow-[0px_1px_2px_0px_rgba(10,13,20,0.03)] shrink-0">
                  <div className="relative shrink-0 size-5">
                     <Calendar className="fill-primary" size={20} />
                  </div>
               </div>
               <p className="flex-1 font-medium leading-6 min-h-px min-w-px text-base text-text-strong tracking-[-0.176px]">
                  {t("charts.upcomingEvents.title")}
               </p>
            </div>

            <Separator className="bg-border h-px w-full" />

            {/* List */}
            <div className="flex flex-col gap-4 items-start relative w-full flex-1 overflow-y-auto pr-1 max-h-[320px] md:max-h-[360px]">
               {nearestEvents.length === 0 ? (
                  <div className="flex items-center justify-center w-full h-full text-text-sub text-sm">
                     {t("charts.upcomingEvents.empty")}
                  </div>
               ) : (
                  nearestEvents.map((event) => {
                     const eventDate = event.date;

                     const month = format(eventDate, "MMM");
                     const day = format(eventDate, "dd");
                     const primaryLabel = event.caseType
                        ? `${event.caseType} • ${event.title}`
                        : event.title;
                     const secondaryLabel =
                        event.description || event.caseTitle || "";
                     const isExpanded = Boolean(expandedEvents[event.id]);
                     const showToggle = secondaryLabel.length > 90;

                     return (
                        <div
                           key={event.id}
                           className="bg-background border-l-[3px] border-l-primary border border-border border-solid flex flex-col items-start rounded-2xl shrink-0 w-full overflow-hidden">
                           <div className="bg-bg-weak border-b border-border border-solid flex flex-col items-start p-4 w-full">
                              <div className="flex gap-4 items-center relative w-full">
                                 {/* Date Box */}
                                 <div className="bg-primary/10 border border-primary/20 flex flex-col items-center justify-center p-2 rounded-lg shrink-0 size-[44px]">
                                    <p className="leading-4 text-xs text-text-sub font-medium">
                                       {month}
                                    </p>
                                    <p className="leading-5 text-sm text-text-strong font-medium tracking-[-0.084px]">
                                       {day}
                                    </p>
                                 </div>

                                 {/* Content */}
                                 <div className="flex flex-1 flex-col items-start justify-center min-w-0">
                                    <div className="flex flex-col gap-1 items-end w-full">
                                       <p className="font-medium leading-5 text-sm text-text-strong tracking-[-0.084px] w-full truncate">
                                          {primaryLabel}
                                       </p>
                                       <div className="w-full">
                                          <div
                                             className={`font-normal leading-4 text-xs text-text-sub w-full overflow-hidden transition-[max-height] duration-300 ease-in-out ${
                                                isExpanded
                                                   ? "max-h-[200px]"
                                                   : "max-h-[18px]"
                                             }`}>
                                             {secondaryLabel}
                                          </div>
                                          {showToggle && (
                                             <button
                                                type="button"
                                                onClick={() =>
                                                   toggleExpanded(event.id)
                                                }
                                                className="mt-1 text-xs font-medium text-primary hover:underline">
                                                {isExpanded
                                                   ? t(
                                                        "common:actions.showLess"
                                                     )
                                                   : t(
                                                        "common:actions.showMore"
                                                     )}
                                             </button>
                                          )}
                                       </div>
                                    </div>
                                 </div>

                                 {/* Meta Info */}
                              </div>
                           </div>
                        </div>
                     );
                  })
               )}
            </div>
         </div>
      </div>
   );
}
