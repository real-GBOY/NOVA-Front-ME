/** @format */

import { useRef, useState, useEffect } from "react";
import { CalendarLine } from "@/Icons";
import { useLanguage } from "@/hooks/useLanguage";
import Button from "@/designSystem/Button";

type DateInputProps = {
   value?: Date;
   onChange?: (date: Date | undefined) => void;
   placeholder?: string;
   className?: string;
};

function DateInput({
   value,
   onChange,
   placeholder = "DD / MM / YYYY",
   className = "",
}: DateInputProps) {
   const { isRTL } = useLanguage();
   const [isOpen, setIsOpen] = useState(false);
   const [selectedDate, setSelectedDate] = useState<Date | undefined>(value);
   const [currentMonth, setCurrentMonth] = useState(value || new Date());
   const containerRef = useRef<HTMLDivElement>(null);

   useEffect(() => {
      setSelectedDate(value);
      if (value) {
         setCurrentMonth(value);
      }
   }, [value]);

   useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
         if (
            containerRef.current &&
            !containerRef.current.contains(event.target as Node)
         ) {
            setIsOpen(false);
         }
      };

      if (isOpen) {
         document.addEventListener("mousedown", handleClickOutside);
      }

      return () => {
         document.removeEventListener("mousedown", handleClickOutside);
      };
   }, [isOpen]);

   const daysInMonth = (date: Date) => {
      return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
   };

   const firstDayOfMonth = (date: Date) => {
      return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
   };

   const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
   ];

   const handleDateClick = (day: number) => {
      const newDate = new Date(
         currentMonth.getFullYear(),
         currentMonth.getMonth(),
         day
      );
      setSelectedDate(newDate);
      onChange?.(newDate);
      setIsOpen(false);
   };

   const handlePrevMonth = () => {
      setCurrentMonth(
         new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)
      );
   };

   const handleNextMonth = () => {
      setCurrentMonth(
         new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)
      );
   };

   const formatDate = (date: Date) => {
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      return `${day} / ${month} / ${year}`;
   };

   const renderCalendar = () => {
      const days = [];
      const totalDays = daysInMonth(currentMonth);
      const firstDay = firstDayOfMonth(currentMonth);

      for (let i = 0; i < firstDay; i++) {
         days.push(<div key={`empty-${i}`} className="aspect-square" />);
      }

      for (let day = 1; day <= totalDays; day++) {
         const isSelected =
            selectedDate &&
            selectedDate.getDate() === day &&
            selectedDate.getMonth() === currentMonth.getMonth() &&
            selectedDate.getFullYear() === currentMonth.getFullYear();

         const isToday =
            new Date().getDate() === day &&
            new Date().getMonth() === currentMonth.getMonth() &&
            new Date().getFullYear() === currentMonth.getFullYear();

         days.push(
            <Button
               key={day}
               onClick={() => handleDateClick(day)}
               className={`
            !aspect-square !p-0 flex items-center justify-center !rounded-lg !text-sm !font-medium
            transition-colors hover:!bg-bg-weak
            ${
               isSelected
                  ? "!bg-primary !text-text-main hover:!bg-primary/90"
                  : ""
            }
            ${
               isToday && !isSelected
                  ? "!border !border-primary !text-primary"
                  : "!border-0"
            }
            ${!isSelected && !isToday ? "!text-text-sub !bg-transparent" : ""}
          `}>
               {day}
            </Button>
         );
      }

      return days;
   };

   return (
      <div ref={containerRef} className={`relative ${className}`}>
         <Button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className={`!w-full !px-4 !py-2.5 !bg-background !border !border-border !rounded-xl flex items-center gap-3 hover:!border-text-sub focus:outline-none focus:ring-2 focus:ring-primary focus:!border-transparent transition-all ${
               isRTL ? "flex-row-reverse" : ""
            }`}>
            <CalendarLine size={20} className="text-icon-sub shrink-0" />
            <span
               className={`flex-1 text-start ${
                  selectedDate ? "text-text-strong" : "text-text-sub"
               }`}>
               {selectedDate ? formatDate(selectedDate) : placeholder}
            </span>
         </Button>

         {isOpen && (
            <div
               className={`absolute z-50 mt-2 bg-background rounded-lg shadow-lg border border-border p-4 w-80 ${
                  isRTL ? "right-0" : "end-0"
               }`}>
               <div className="flex items-center justify-between mb-4">
                  <Button
                     onClick={handlePrevMonth}
                     className="!p-1.5 !bg-transparent !border-0 hover:!bg-bg-weak !text-inherit !rounded-md">
                     <svg
                        className="w-5 h-5 text-icon-sub"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24">
                        <path
                           strokeLinecap="round"
                           strokeLinejoin="round"
                           strokeWidth={2}
                           d="M15 19l-7-7 7-7"
                        />
                     </svg>
                  </Button>
                  <span className="font-semibold text-text-strong">
                     {monthNames[currentMonth.getMonth()]}{" "}
                     {currentMonth.getFullYear()}
                  </span>
                  <Button
                     onClick={handleNextMonth}
                     className="!p-1.5 !bg-transparent !border-0 hover:!bg-bg-weak !text-inherit !rounded-md">
                     <svg
                        className="w-5 h-5 text-icon-sub"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24">
                        <path
                           strokeLinecap="round"
                           strokeLinejoin="round"
                           strokeWidth={2}
                           d="M9 5l7 7-7 7"
                        />
                     </svg>
                  </Button>
               </div>

               <div className="grid grid-cols-7 gap-1 mb-2">
                  {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                     <div
                        key={day}
                        className="aspect-square flex items-center justify-center text-xs font-medium text-text-sub">
                        {day}
                     </div>
                  ))}
               </div>

               <div className="grid grid-cols-7 gap-1">{renderCalendar()}</div>
            </div>
         )}
      </div>
   );
}

export default DateInput;
