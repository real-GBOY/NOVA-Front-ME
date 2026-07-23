import { useState } from "react";
import { TimeSlot, ActivityType } from "./types";

const DUBAI_TIME_ZONE = "Asia/Dubai";
const SMALL_BREAK_DOT_MINUTES = 10;

interface TimeTimelineProps {
   slots: TimeSlot[];
   shiftStartTime?: string;
   shiftEndTime?: string;
   onResolveShiftStart?: () => void;
   onResolveShiftEnd?: () => void;
   isResolvingShiftBounds?: boolean;
}

interface HoverTooltip {
   label: string;
   timeRange: string;
   color: string;
   x: number;
   y: number;
}

type RenderSlot = {
   type: ActivityType | "gap";
   duration: number;
   start?: number;
   end?: number;
   label?: string;
   startTime?: string;
   endTime?: string;
   color?: string;
   textClass?: string;
};

function TimeTimeline({
   slots,
   shiftStartTime,
   shiftEndTime,
   onResolveShiftStart,
   onResolveShiftEnd,
   isResolvingShiftBounds = false,
}: TimeTimelineProps) {
   const [tooltip, setTooltip] = useState<HoverTooltip | null>(null);

   const getStyleForType = (type: ActivityType) => {
      switch (type) {
         case "working":
            return { backgroundColor: "#9B59B6", textClass: "text-white" };
         case "late":
            return { backgroundColor: "#E74C3C", textClass: "text-white" };
         case "absence":
            return { backgroundColor: "#FF69B4", textClass: "text-white" };
         case "dayOff":
            return { backgroundColor: "#F39C12", textClass: "text-white" };
         case "overtime":
            return { backgroundColor: "#FF69B4", textClass: "text-white" };
         case "break":
            return { backgroundColor: "#2ECC71", textClass: "text-white" };
         case "earlyLeave":
            return { backgroundColor: "#3498DB", textClass: "text-white" };
         case "requestedDayOff":
            return { backgroundColor: "#F1C40F", textClass: "text-black" };
         default:
            return { backgroundColor: "#E5E7EB", textClass: "text-text-sub" };
      }
   };

   const getLabel = (slot: TimeSlot) => {
      if (slot.label) return slot.label;

      switch (slot.type) {
         case "working":
            return "Working-time";
         case "overtime":
            return "Overtime";
         case "late":
            return "Late";
         case "break":
            return "Break";
         case "absence":
            return "Absence";
         case "earlyLeave":
            return "Early Leave";
         case "dayOff":
            return "Day off";
         case "requestedDayOff":
            return "Requested day off";
         default:
            return "";
      }
   };

   const parseTime = (timeStr: string): number => {
      if (timeStr.includes("T")) {
         const parsed = new Date(timeStr);
         if (!Number.isNaN(parsed.getTime())) {
            const formatter = new Intl.DateTimeFormat("en-CA", {
               timeZone: DUBAI_TIME_ZONE,
               hour: "2-digit",
               minute: "2-digit",
               hour12: false,
            });
            const parts = formatter.formatToParts(parsed);
            const hourPart = parts.find((part) => part.type === "hour")?.value;
            const minutePart = parts.find((part) => part.type === "minute")?.value;
            const hours = Number(hourPart);
            const minutes = Number(minutePart);
            if (!Number.isNaN(hours) && !Number.isNaN(minutes)) {
               return hours * 60 + minutes;
            }
         }
      }

      const match = timeStr.match(/(\d{2}):(\d{2})(?::\d{2})?/);
      if (!match) return 0;
      const hours = Number(match[1]);
      const minutes = Number(match[2]);
      if (Number.isNaN(hours) || Number.isNaN(minutes)) return 0;
      return hours * 60 + minutes;
   };

   const formatMinutesToHHmm = (minutes: number): string => {
      const normalized =
         ((Math.round(minutes) % (24 * 60)) + 24 * 60) % (24 * 60);
      const hours = Math.floor(normalized / 60);
      const mins = Math.floor(normalized % 60);
      return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
   };

   const formatTimeLabel = (minutes: number): string => {
      const minutesInDay =
         ((Math.round(minutes) % (24 * 60)) + 24 * 60) % (24 * 60);
      const hours24 = Math.floor(minutesInDay / 60);
      const mins = Math.floor(minutesInDay % 60);
      const period = hours24 >= 12 ? "PM" : "AM";
      const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
      return `${hours12}:${String(mins).padStart(2, "0")} ${period}`;
   };

   const slotsWithStart = slots.filter(
      (slot): slot is TimeSlot & { startTime: string } =>
         Boolean(slot.startTime),
   );
   const firstSegment = slotsWithStart[0];
   const firstSlotStart = firstSegment?.startTime
      ? parseTime(firstSegment.startTime)
      : null;
   const shiftStartMinutes = shiftStartTime ? parseTime(shiftStartTime) : null;
   // Keep normalization anchored to actual segment data so segments earlier than
   // shift start (e.g. Late) don't wrap to the next day.
   const segmentNormalizeAnchor = firstSlotStart ?? shiftStartMinutes;

   const firstSegmentStart =
      shiftStartMinutes != null
         ? shiftStartMinutes
         : firstSegment?.startTime
           ? parseTime(firstSegment.startTime)
           : null;

   const normalizeSegmentFromAnchor = (minutes: number): number => {
      if (segmentNormalizeAnchor == null) return minutes;
      let normalized = minutes;
      while (normalized < segmentNormalizeAnchor) {
         normalized += 24 * 60;
      }
      return normalized;
   };

   const slotBounds = slots.reduce(
      (acc, slot) => {
         if (!slot.startTime) return acc;
         const start = normalizeSegmentFromAnchor(parseTime(slot.startTime));
         const endRaw = slot.endTime
            ? normalizeSegmentFromAnchor(parseTime(slot.endTime))
            : start + (slot.durationMinutes || 0);
         const end = endRaw < start ? endRaw + 24 * 60 : endRaw;

         return {
            min: Math.min(acc.min, start),
            max: Math.max(acc.max, end),
         };
      },
      { min: Number.POSITIVE_INFINITY, max: Number.NEGATIVE_INFINITY },
   );

   const hasSlotBounds = Number.isFinite(slotBounds.min);
   const timelineStartMinutes =
      firstSegmentStart ?? (hasSlotBounds ? slotBounds.min : 8 * 60);

   const normalizeToTimelineStart = (minutes: number): number => {
      let normalized = minutes;
      while (normalized < timelineStartMinutes) {
         normalized += 24 * 60;
      }
      return normalized;
   };

   const shiftEndNormalized = shiftEndTime
      ? normalizeToTimelineStart(parseTime(shiftEndTime))
      : null;
   const timelineEndMinutes =
      shiftEndNormalized ?? (hasSlotBounds ? slotBounds.max : 24 * 60);

   const totalTimelineMinutes = Math.max(
      1,
      timelineEndMinutes - timelineStartMinutes,
   );
   const shouldShowStartPlaceholder = !shiftStartTime;
   const shouldShowEndPlaceholder = !shiftEndTime;
   const buildTimelineLabels = () => {
      const points = [timelineStartMinutes, timelineEndMinutes];
      return points.map((minute, index) => ({
         key: `timeline-edge-${minute}-${index}`,
         label:
            shouldShowStartPlaceholder && index === 0
               ? isResolvingShiftBounds
                  ? "Loading..."
                  : "Start"
               : shouldShowEndPlaceholder && index === points.length - 1
                 ? isResolvingShiftBounds
                    ? "Loading..."
                    : "End"
                 : formatTimeLabel(minute),
         leftPercent:
            ((minute - timelineStartMinutes) / totalTimelineMinutes) * 100,
         isFirst: index === 0,
         isLast: index === points.length - 1,
      }));
   };

   const desktopTimelineLabels = buildTimelineLabels();
   const mobileTimelineLabels = buildTimelineLabels();

   const sortedSlots = [...slots].sort((a, b) => {
      const aStart = a.startTime
         ? normalizeSegmentFromAnchor(parseTime(a.startTime))
         : Number.POSITIVE_INFINITY;
      const bStart = b.startTime
         ? normalizeSegmentFromAnchor(parseTime(b.startTime))
         : Number.POSITIVE_INFINITY;
      return aStart - bStart;
   });

   const renderSlots: RenderSlot[] = [];
   let cursor = timelineStartMinutes;

   const addGap = (duration: number) => {
      if (duration <= 0) return;
      const last = renderSlots[renderSlots.length - 1];
      if (last?.type === "gap") {
         last.duration += duration;
         last.end = (last.end || 0) + duration;
         return;
      }
      renderSlots.push({
         type: "gap",
         duration,
         start: cursor,
         end: cursor + duration,
      });
   };

   sortedSlots.forEach((slot) => {
      if (!slot.startTime) return;

      let rawStart = normalizeSegmentFromAnchor(parseTime(slot.startTime));
      let rawEnd: number;

      if (slot.endTime) {
         const endParsed = normalizeSegmentFromAnchor(parseTime(slot.endTime));
         rawEnd = endParsed < rawStart ? endParsed + 24 * 60 : endParsed;
      } else if (slot.durationMinutes && slot.durationMinutes > 0) {
         rawEnd = rawStart + slot.durationMinutes;
      } else {
         rawEnd = rawStart + (slot.type === "break" ? 5 : 15);
      }

      // Day-off style segments should always fill the whole visible timeline.
      if (slot.type === "dayOff" || slot.type === "requestedDayOff") {
         rawStart = timelineStartMinutes;
         rawEnd = timelineEndMinutes;
      }

      // For short breaks, show a dot marker and keep working segment continuous.
      if (slot.type === "break" && rawEnd - rawStart <= SMALL_BREAK_DOT_MINUTES) {
         const markerStart = Math.max(rawStart, timelineStartMinutes);
         if (markerStart <= timelineEndMinutes) {
            const style = getStyleForType(slot.type as ActivityType);
            renderSlots.push({
               type: slot.type,
               duration: 0,
               start: markerStart,
               end: markerStart,
               label: getLabel(slot),
               startTime: formatMinutesToHHmm(rawStart),
               endTime: formatMinutesToHHmm(rawEnd),
               color: style.backgroundColor,
               textClass: style.textClass,
            });
         }
         return;
      }

      if (rawStart > cursor) {
         addGap(rawStart - cursor);
         cursor = rawStart;
      }

      const start = Math.max(rawStart, cursor);
      const end = Math.max(rawEnd, start);
      const clippedStart = Math.max(start, timelineStartMinutes);
      const clippedEnd = Math.min(end, timelineEndMinutes);
      if (clippedEnd <= clippedStart) return;

      const style = getStyleForType(slot.type as ActivityType);
      renderSlots.push({
         type: slot.type,
         duration: clippedEnd - clippedStart,
         start: clippedStart,
         end: clippedEnd,
         label: getLabel(slot),
         startTime: formatMinutesToHHmm(clippedStart),
         endTime: formatMinutesToHHmm(clippedEnd),
         color: style.backgroundColor,
         textClass: style.textClass,
      });

      cursor = Math.max(cursor, end);
   });

   if (cursor < timelineEndMinutes) {
      addGap(timelineEndMinutes - cursor);
   }

   const positionedSlots = renderSlots.map((slot) => {
      const slotStart = slot.start ?? timelineStartMinutes;
      const slotEnd = slot.end ?? slotStart;
      return {
         slot,
         leftPercent: ((slotStart - timelineStartMinutes) / totalTimelineMinutes) * 100,
         widthPercent: ((slotEnd - slotStart) / totalTimelineMinutes) * 100,
      };
   });

   return (
      <div className="flex flex-1 flex-col gap-2 h-full items-start min-h-px min-w-px overflow-visible relative">
         <div className="relative w-full h-4 text-[10px] text-text-soft font-normal leading-3 md:hidden">
            {mobileTimelineLabels.map((item) => (
               <button
                  key={item.key}
                  type="button"
                  disabled={
                     isResolvingShiftBounds ||
                     ((item.isFirst &&
                        (!shouldShowStartPlaceholder || !onResolveShiftStart)) ||
                        (item.isLast &&
                           (!shouldShowEndPlaceholder || !onResolveShiftEnd)) ||
                        (!item.isFirst && !item.isLast))
                  }
                  onClick={
                     item.isFirst && shouldShowStartPlaceholder
                        ? onResolveShiftStart
                        : item.isLast && shouldShowEndPlaceholder
                          ? onResolveShiftEnd
                          : undefined
                  }
                  className="absolute whitespace-nowrap bg-transparent border-0 p-0 text-inherit disabled:cursor-default enabled:cursor-pointer enabled:underline"
                  style={{
                     left: `${item.leftPercent}%`,
                     transform:
                        item.isFirst
                           ? "translateX(0)"
                           : item.isLast
                             ? "translateX(-100%)"
                             : "translateX(-50%)",
                  }}>
                  {item.label}
               </button>
            ))}
         </div>

         <div className="relative w-full h-5 text-xs text-text-soft font-normal leading-4 hidden md:block">
            {desktopTimelineLabels.map((item) => (
               <button
                  key={item.key}
                  type="button"
                  disabled={
                     isResolvingShiftBounds ||
                     ((item.isFirst &&
                        (!shouldShowStartPlaceholder || !onResolveShiftStart)) ||
                        (item.isLast &&
                           (!shouldShowEndPlaceholder || !onResolveShiftEnd)) ||
                        (!item.isFirst && !item.isLast))
                  }
                  onClick={
                     item.isFirst && shouldShowStartPlaceholder
                        ? onResolveShiftStart
                        : item.isLast && shouldShowEndPlaceholder
                          ? onResolveShiftEnd
                          : undefined
                  }
                  className="absolute whitespace-nowrap bg-transparent border-0 p-0 text-inherit disabled:cursor-default enabled:cursor-pointer enabled:underline"
                  style={{
                     left: `${item.leftPercent}%`,
                     transform:
                        item.isFirst
                           ? "translateX(0)"
                           : item.isLast
                             ? "translateX(-100%)"
                             : "translateX(-50%)",
                  }}>
                  {item.label}
               </button>
            ))}
         </div>

         <div className="bg-bg-weak relative rounded-md w-full h-5 overflow-hidden">
            {positionedSlots.map(
               ({ slot, leftPercent, widthPercent }, index) => {
                  if (slot.type === "gap") {
                     return (
                        <div
                           key={`gap-${index}`}
                           className="absolute top-0 bottom-0"
                           style={{
                              left: `${leftPercent}%`,
                              width: `${widthPercent}%`,
                           }}
                        />
                     );
                  }

                  const timeRange = `${slot.startTime || "--:--"} - ${slot.endTime || "--:--"}`;
                  const isTinySegment = slot.duration <= 20;
                  const isTinyBreak = slot.type === "break" && slot.duration <= 10;
                  const isWorkingSegment = slot.type === "working";
                  const segmentWidthPercent = isTinyBreak
                     ? Math.max(widthPercent, 0.35)
                     : isWorkingSegment
                        ? Math.max(widthPercent, 1.8)
                        : widthPercent;
                  return (
                     <div
                        key={`segment-${index}-${slot.type}-${slot.startTime}-${slot.endTime}`}
                        className={`${slot.textClass || "text-white"} box-border absolute top-0 bottom-0 flex min-w-0 items-center justify-center overflow-clip ${
                           isTinySegment ? "px-0.5" : "px-1"
                        } ${isTinyBreak ? "overflow-visible" : ""} py-0 rounded-md transition-all duration-150 hover:-translate-y-[1px] hover:brightness-105 cursor-default`}
                        style={{
                           left: `${leftPercent}%`,
                           width: `${segmentWidthPercent}%`,
                           minWidth: isWorkingSegment ? "12px" : undefined,
                           zIndex: isTinyBreak ? 3 : isWorkingSegment ? 2 : 1,
                           backgroundColor: isTinyBreak ? "transparent" : slot.color,
                        }}
                        onMouseEnter={(event) => {
                           setTooltip({
                              label: slot.label || "Segment",
                              timeRange,
                              color: slot.color || "#94A3B8",
                              x: event.clientX,
                              y: event.clientY,
                           });
                        }}
                        onMouseMove={(event) => {
                           setTooltip((prev) =>
                              prev
                                 ? {
                                      ...prev,
                                      x: event.clientX,
                                      y: event.clientY,
                                   }
                                 : prev,
                           );
                        }}
                        onMouseLeave={() => setTooltip(null)}>
                        {isTinyBreak && (
                           <span
                              className="absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-background"
                              style={{ backgroundColor: slot.color }}
                           />
                        )}
                        {!isTinySegment && !isTinyBreak && (
                           <p className="font-medium leading-4 relative text-xs truncate min-w-0">
                              {slot.label}
                           </p>
                        )}
                        {isTinySegment && slot.type === "working" && (
                           <p className="font-medium leading-4 relative text-[10px] truncate min-w-0">
                              WT
                           </p>
                        )}
                     </div>
                  );
               },
            )}
         </div>

         {tooltip && (
            <div
               className="fixed z-50 pointer-events-none"
               style={{
                  left: tooltip.x + 12,
                  top: tooltip.y - 12,
               }}>
               <div className="rounded-md border border-stroke-sub-300 bg-background px-2.5 py-1.5 shadow-lg">
                  <div className="flex items-center gap-2">
                     <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: tooltip.color }}
                     />
                     <p className="text-[11px] font-semibold leading-4 text-text-strong">
                        {tooltip.label}
                     </p>
                  </div>
                  <p className="text-[11px] leading-4 text-text-sub">
                     {tooltip.timeRange}
                  </p>
               </div>
            </div>
         )}
      </div>
   );
}

export default TimeTimeline;
