/** @format */

import { SummaryCardData, SummaryTone } from "./types";
import { Dot } from "@/Icons";

const badgeToneStyles: Record<SummaryTone, string> = {
   success: "text-text-sub bg-background border-border",
   warning: "text-text-sub bg-bg-weak border-border",
   info: "text-information bg-information/10 border-information/15",
   neutral: "text-text-sub bg-bg-weak border-border",
};

const levelIndicatorStyles = {
   low: {
      bars: [
         { height: "h-1", color: "bg-warning/30" },
         { height: "h-2", color: "bg-bg-weak" },
         { height: "h-3", color: "bg-bg-weak" },
      ],
   },
   medium: {
      bars: [
         { height: "h-1", color: "bg-warning/30" },
         { height: "h-2", color: "bg-warning" },
         { height: "h-3", color: "bg-bg-weak" },
      ],
   },
   high: {
      bars: [
         { height: "h-1", color: "bg-danger/30" },
         { height: "h-2", color: "bg-danger" },
         { height: "h-3", color: "bg-danger" },
      ],
   },
};

interface SummaryCardsSectionProps {
   cards: SummaryCardData[];
}

function SummaryCardsSection({ cards }: SummaryCardsSectionProps) {
   return (
      <section className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5 xl:gap-4">
         {cards.map((card) => (
            <ProfileSummaryCard key={card.id} card={card} />
         ))}
      </section>
   );
}

function ProfileSummaryCard({ card }: { card: SummaryCardData }) {
   const hasLevelIndicator =
      card.badge &&
      (card.badge.level === "low" ||
         card.badge.level === "medium" ||
         card.badge.level === "high");

   return (
      <div className="flex flex-col border border-border bg-background r-rounded gap-2 p-2 md:gap-3 md:p-3 xl:rounded-2xl xl:gap-3 xl:p-3">
         {/* Title row with icon */}
         <div className="flex items-center gap-2 w-full">
            <div className="rounded-md border border-border bg-background p-1 shadow-subtle md:rounded-lg md:p-1.5 xl:rounded-lg xl:p-1.5">
               {card.icon}
            </div>
            <p className="flex-1 text-sm font-medium leading-5 text-text-sub md:text-base md:leading-6 xl:text-base xl:leading-6">
               {card.title}
            </p>
         </div>

         {/* Value row */}
         <div className="flex items-center justify-between gap-2 w-full">
            {typeof card.value === "string" ? (
               <p className="flex-1 text-base font-medium leading-6 text-text-strong md:text-lg xl:text-lg">
                  {card.value}
               </p>
            ) : (
               card.value
            )}

            {card.badge &&
               (hasLevelIndicator ? (
                  <div className="rounded-lg border-0.5 border-border bg-bg-weak px-2 py-1 flex items-center gap-1.5">
                     <span className="text-xs font-medium text-text-sub">
                        {card.badge.label}
                     </span>
                     <div className="flex items-end gap-0.5">
                        {levelIndicatorStyles[
                           card.badge.level as keyof typeof levelIndicatorStyles
                        ].bars.map((bar, idx) => (
                           <div
                              key={idx}
                              className={`w-0.5 rounded-full ${bar.height} ${bar.color}`}
                           />
                        ))}
                     </div>
                  </div>
               ) : (
                  <div
                     className={`rounded-lg border-0.5 px-2 py-1 flex items-center gap-0.5 ${
                        badgeToneStyles[card.badge.tone]
                     }`}>
                     <Dot size={16} />
                     <span className="text-xs font-medium">
                        {card.badge.label}
                     </span>
                  </div>
               ))}
         </div>
      </div>
   );
}

export default SummaryCardsSection;
