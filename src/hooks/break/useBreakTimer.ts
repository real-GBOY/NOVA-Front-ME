/** @format */

import { useCallback, useEffect, useMemo, useState } from "react";

const BREAK_TIMER_STORAGE_KEY = "active_break_start_time";
const BREAK_TIMER_EVENT_NAME = "break-timer-state-change";

const readBreakStartTime = (): string | null => {
   if (typeof window === "undefined") return null;
   const value = window.localStorage.getItem(BREAK_TIMER_STORAGE_KEY);
   return value || null;
};

const writeBreakStartTime = (value: string | null) => {
   if (typeof window === "undefined") return;
   if (value) {
      window.localStorage.setItem(BREAK_TIMER_STORAGE_KEY, value);
   } else {
      window.localStorage.removeItem(BREAK_TIMER_STORAGE_KEY);
   }
   window.dispatchEvent(new Event(BREAK_TIMER_EVENT_NAME));
};

const formatElapsed = (elapsedMs: number): string => {
   const totalSeconds = Math.max(0, Math.floor(elapsedMs / 1000));
   const hours = Math.floor(totalSeconds / 3600);
   const minutes = Math.floor((totalSeconds % 3600) / 60);
   const seconds = totalSeconds % 60;
   return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0"
   )}:${String(seconds).padStart(2, "0")}`;
};

export const useBreakTimer = () => {
   const [breakStartTime, setBreakStartTime] = useState<string | null>(() =>
      readBreakStartTime()
   );
   const [nowMs, setNowMs] = useState<number>(() => Date.now());

   useEffect(() => {
      if (!breakStartTime) return;
      const intervalId = window.setInterval(() => {
         setNowMs(Date.now());
      }, 1000);
      return () => window.clearInterval(intervalId);
   }, [breakStartTime]);

   useEffect(() => {
      const syncFromStorage = () => {
         setBreakStartTime(readBreakStartTime());
         setNowMs(Date.now());
      };

      window.addEventListener("storage", syncFromStorage);
      window.addEventListener(BREAK_TIMER_EVENT_NAME, syncFromStorage);
      return () => {
         window.removeEventListener("storage", syncFromStorage);
         window.removeEventListener(BREAK_TIMER_EVENT_NAME, syncFromStorage);
      };
   }, []);

   const startBreakTimer = useCallback((startTime?: string) => {
      const nextStartTime = startTime || new Date().toISOString();
      writeBreakStartTime(nextStartTime);
      setBreakStartTime(nextStartTime);
      setNowMs(Date.now());
   }, []);

   const stopBreakTimer = useCallback(() => {
      writeBreakStartTime(null);
      setBreakStartTime(null);
      setNowMs(Date.now());
   }, []);

   const elapsedMs = useMemo(() => {
      if (!breakStartTime) return 0;
      const startMs = new Date(breakStartTime).getTime();
      if (Number.isNaN(startMs)) return 0;
      return Math.max(0, nowMs - startMs);
   }, [breakStartTime, nowMs]);

   return {
      isOnBreak: Boolean(breakStartTime),
      breakStartTime,
      elapsedMs,
      formattedElapsed: formatElapsed(elapsedMs),
      startBreakTimer,
      stopBreakTimer,
   };
};

