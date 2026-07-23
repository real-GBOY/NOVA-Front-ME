/** @format */

import { useState, useRef, useEffect } from "react";
import { TimeLine } from "@/Icons";

interface TimePickerProps {
   value?: string;
   onChange?: (value: string) => void;
   className?: string;
   defaultValue?: string;
}

export default function TimePicker({
   value,
   onChange,
   className = "",
   defaultValue = "09:00",
}: TimePickerProps) {
   const [isFocused, setIsFocused] = useState(false);
   const containerRef = useRef<HTMLDivElement>(null);
   const lastEmittedValue = useRef<string>("");
   const isInitialized = useRef(false);

   // Parse time string to get initial state
   const parseTime = (timeString: string) => {
      const match = timeString.match(/(\d{2}):(\d{2})/);
      if (match) {
         const hour24 = parseInt(match[1]);
         const minuteValue = match[2];
         let hour12: string;
         let period: "AM" | "PM";

         if (hour24 === 0) {
            hour12 = "12";
            period = "AM";
         } else if (hour24 < 12) {
            hour12 = hour24.toString().padStart(2, "0");
            period = "AM";
         } else if (hour24 === 12) {
            hour12 = "12";
            period = "PM";
         } else {
            hour12 = (hour24 - 12).toString().padStart(2, "0");
            period = "PM";
         }

         return { hour: hour12, minute: minuteValue, period };
      }
      return { hour: "09", minute: "00", period: "AM" as "AM" | "PM" };
   };

   // Initialize state from value or defaultValue
   const initialState = parseTime(value || defaultValue);
   const [hour, setHour] = useState(initialState.hour);
   const [minute, setMinute] = useState(initialState.minute);
   const [period, setPeriod] = useState<"AM" | "PM">(initialState.period);

   // Mark as initialized after first render
   useEffect(() => {
      if (!isInitialized.current) {
         isInitialized.current = true;
      }
   }, []);

   // Only update internal state when value changes externally (and is different from what we emitted)
   useEffect(() => {
      if (
         value &&
         value !== lastEmittedValue.current &&
         isInitialized.current
      ) {
         const match24 = value.match(/^(\d{2}):(\d{2})$/);
         if (match24) {
            const hour24 = parseInt(match24[1]);
            const minuteValue = match24[2];

            if (hour24 === 0) {
               setHour("12");
               setPeriod("AM");
            } else if (hour24 < 12) {
               setHour(hour24.toString().padStart(2, "0"));
               setPeriod("AM");
            } else if (hour24 === 12) {
               setHour("12");
               setPeriod("PM");
            } else {
               setHour((hour24 - 12).toString().padStart(2, "0"));
               setPeriod("PM");
            }
            setMinute(minuteValue);
         }
      }
   }, [value]);

   // Emit changes only when internal state changes and value is different
   useEffect(() => {
      if (!isInitialized.current) return;

      // Convert to 24-hour format for the backend
      let hour24 = parseInt(hour || "0");

      if (period === "AM") {
         if (hour24 === 12) hour24 = 0;
      } else {
         if (hour24 !== 12) hour24 += 12;
      }

      const timeString = `${hour24
         .toString()
         .padStart(2, "0")}:${minute.padStart(2, "0")}`;

      // Only emit if the value has changed
      if (timeString !== lastEmittedValue.current) {
         lastEmittedValue.current = timeString;
         onChange?.(timeString);
      }
   }, [hour, minute, period, onChange]);

   const handleHourChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let val = e.target.value.replace(/\D/g, "");
      if (val === "") {
         setHour("");
         return;
      }
      if (val.length > 2) {
         val = val.slice(0, 2);
      }
      const num = parseInt(val);
      if (num > 12) {
         setHour("12");
         return;
      }
      setHour(val);
   };

   const handleMinuteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let val = e.target.value.replace(/\D/g, "");
      if (val === "") {
         setMinute("");
         return;
      }
      if (val.length > 2) {
         val = val.slice(0, 2);
      }
      const num = parseInt(val);
      if (num > 59) {
         setMinute("59");
         return;
      }
      setMinute(val);
   };

   const handleHourBlur = () => {
      if (hour === "" || parseInt(hour) < 1) {
         setHour("01");
      } else {
         setHour(parseInt(hour).toString().padStart(2, "0"));
      }
   };

   const handleMinuteBlur = () => {
      if (minute === "") {
         setMinute("00");
      } else {
         setMinute(parseInt(minute).toString().padStart(2, "0"));
      }
   };

   const togglePeriod = () => {
      setPeriod(period === "AM" ? "PM" : "AM");
   };

   return (
      <div
         ref={containerRef}
         className={`relative ${className}`}
         onFocus={() => setIsFocused(true)}
         onBlur={(e) => {
            if (!containerRef.current?.contains(e.relatedTarget as Node)) {
               setIsFocused(false);
            }
         }}>
         <div
            className={`w-full px-4 py-2 bg-background border rounded-2xl flex items-center gap-3 transition-all ${
               isFocused
                  ? "border-transparent ring-2 ring-primary"
                  : "border-border hover:border-text-soft"
            }`}>
            <TimeLine />

            <div className="flex items-center gap-1 flex-1">
               <input
                  type="text"
                  value={hour}
                  onChange={handleHourChange}
                  onBlur={handleHourBlur}
                  placeholder="00"
                  maxLength={2}
                  className="w-8 text-center text-text-strong bg-transparent outline-none text-sm font-medium"
               />
               <span className="text-text-strong font-medium">:</span>
               <input
                  type="text"
                  value={minute}
                  onChange={handleMinuteChange}
                  onBlur={handleMinuteBlur}
                  placeholder="00"
                  maxLength={2}
                  className="w-8 text-center text-text-strong bg-transparent outline-none text-sm font-medium"
               />
               <button
                  type="button"
                  onClick={togglePeriod}
                  className="ms-2 px-2 py-0.5 text-sm font-medium text-text-strong hover:bg-bg-weak rounded transition-colors">
                  {period}
               </button>
            </div>
         </div>
      </div>
   );
}
