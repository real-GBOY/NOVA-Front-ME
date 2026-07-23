import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { Calendar, ChevronDown } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useTranslation } from "@/hooks/useTranslation";

interface DatePickerProps {
   value?: Date;
   onChange?: (date: Date) => void;
   placeholder?: string;
   className?: string;
   popoverAlign?: "left" | "right";
   renderInPortal?: boolean;
   variant?: "default" | "dateOfBirth";
   id?: string;
   ariaInvalid?: boolean;
   ariaDescribedBy?: string;
   buttonClassName?: string;
   status?: "default" | "error";
   disabled?: boolean;
   monthYearDropdownDirection?: "up" | "down";
   popoverDirection?: "up" | "down";
}

interface SelectDropdownProps {
   value: number;
   options: { value: number; label: string }[];
   onChange: (value: number) => void;
   className?: string;
   openDirection?: "up" | "down";
}

function SelectDropdown({
   value,
   options,
   onChange,
   className = "",
   openDirection = "down",
}: SelectDropdownProps) {
   const [isOpen, setIsOpen] = useState(false);
   const dropdownRef = useRef<HTMLDivElement>(null);

   useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
         if (
            dropdownRef.current &&
            !dropdownRef.current.contains(event.target as Node)
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

   const selectedOption = options.find((opt) => opt.value === value);

   return (
      <div ref={dropdownRef} className={`relative ${className}`}>
         <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="w-full h-8 px-2 py-1 text-sm font-semibold text-text-strong bg-background border border-border rounded-md hover:border-text-sub focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all cursor-pointer flex items-center justify-between gap-1">
            <span>{selectedOption?.label}</span>
            <ChevronDown
               className={`w-4 h-4 text-icon-sub transition-transform ${
                  isOpen ? "rotate-180" : ""
               }`}
            />
         </button>

         {isOpen && (
            <div
               className={`absolute z-50 w-full max-h-60 overflow-y-auto bg-background border border-border rounded-md shadow-lg flex flex-col [&::-webkit-scrollbar]:w-0.5! [&::-webkit-scrollbar-track]:bg-transparent! [&::-webkit-scrollbar-thumb]:bg-border! [&::-webkit-scrollbar-thumb]:rounded-full! hover:[&::-webkit-scrollbar-thumb]:bg-text-sub! ${
                  openDirection === "up" ? "bottom-full mb-1" : "top-full mt-1"
               }`}>
               {options.map((option) => (
                  <button
                     key={option.value}
                     type="button"
                     onClick={() => {
                        onChange(option.value);
                        setIsOpen(false);
                     }}
                     className={`w-full px-2 py-1.5 text-sm text-left transition-colors ${
                        option.value === value
                           ? "bg-primary/10 text-primary font-semibold"
                           : "text-text-strong hover:bg-bg-weak"
                     }`}>
                     {option.label}
                  </button>
               ))}
            </div>
         )}
      </div>
   );
}

export default function DatePicker({
   value,
   onChange,
   placeholder,
   className = "",
   popoverAlign = "left",
   renderInPortal = false,
   variant = "default",
   id,
   ariaInvalid,
   ariaDescribedBy,
   buttonClassName = "",
   status = "default",
   disabled = false,
   monthYearDropdownDirection = "down",
   popoverDirection = "down",
}: DatePickerProps) {
   const { isRTL } = useLanguage();
   const { t } = useTranslation("common");
   const defaultPlaceholder = placeholder || t("dateTime.selectDate");
   const maxYear = variant === "dateOfBirth" ? 2008 : 2035;
   const minYear = variant === "dateOfBirth" ? 1924 : 1925;
   const getDefaultMonth = useCallback(
      () => (variant === "dateOfBirth" ? new Date(maxYear, 0, 1) : new Date()),
      [variant, maxYear]
   );
   const [isOpen, setIsOpen] = useState(false);
   const [selectedDate, setSelectedDate] = useState<Date | undefined>(value);
   const [currentMonth, setCurrentMonth] = useState<Date>(
      value || getDefaultMonth()
   );
   const containerRef = useRef<HTMLDivElement>(null);
   const popoverRef = useRef<HTMLDivElement>(null);
   const [popoverStyle, setPopoverStyle] = useState<{
      top: number;
      left: number;
      width: number;
   } | null>(null);

   // Update currentMonth when isOpen changes to always show current date if no date selected
   useEffect(() => {
      if (isOpen && !selectedDate) {
         setCurrentMonth(getDefaultMonth());
      } else if (isOpen && selectedDate) {
         setCurrentMonth(selectedDate);
      }
   }, [isOpen, selectedDate, getDefaultMonth]);

   useEffect(() => {
      if (value) {
         setSelectedDate(value);
         setCurrentMonth(value);
         return;
      }

      setSelectedDate(undefined);
      if (variant === "dateOfBirth") {
         setCurrentMonth(getDefaultMonth());
      }
   }, [value, variant, getDefaultMonth]);

   useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
         if (
            containerRef.current &&
            !containerRef.current.contains(event.target as Node) &&
            (!popoverRef.current ||
               !popoverRef.current.contains(event.target as Node))
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

   const updatePopoverPosition = useCallback(() => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const width = 320;
      const estimatedPopoverHeight = 360;
      const left =
         popoverAlign === "right" ? rect.right - width : rect.left;
      setPopoverStyle({
         top:
            popoverDirection === "up"
               ? Math.max(8, rect.top - estimatedPopoverHeight - 8)
               : rect.bottom + 8,
         left,
         width,
      });
   }, [popoverAlign, popoverDirection]);

   useEffect(() => {
      if (!isOpen) return;
      updatePopoverPosition();

      const handleScroll = () => updatePopoverPosition();
      window.addEventListener("resize", handleScroll);
      window.addEventListener("scroll", handleScroll, true);
      return () => {
         window.removeEventListener("resize", handleScroll);
         window.removeEventListener("scroll", handleScroll, true);
      };
   }, [isOpen, updatePopoverPosition]);

   useEffect(() => {
      if (disabled) {
         setIsOpen(false);
      }
   }, [disabled]);

   const daysInMonth = (date: Date) => {
      return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
   };

   const firstDayOfMonth = (date: Date) => {
      return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
   };

   const monthNames = [
      t("months.january"),
      t("months.february"),
      t("months.march"),
      t("months.april"),
      t("months.may"),
      t("months.june"),
      t("months.july"),
      t("months.august"),
      t("months.september"),
      t("months.october"),
      t("months.november"),
      t("months.december"),
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

   const handleMonthChange = (monthIndex: number) => {
      setCurrentMonth(new Date(currentMonth.getFullYear(), monthIndex, 1));
   };

   const handleYearChange = (year: number) => {
      setCurrentMonth(new Date(year, currentMonth.getMonth(), 1));
   };

   const formatDate = (date: Date) => {
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      return `${day} / ${month} / ${year}`;
   };

   // Generate year range based on variant
   const yearRange = Array.from(
      { length: maxYear - minYear + 1 },
      (_, i) => maxYear - i
   );

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
            <button
               key={day}
               onClick={() => handleDateClick(day)}
               className={`
            aspect-square flex items-center justify-center rounded-lg text-sm font-medium
            transition-colors hover:bg-bg-weak
            ${isSelected ? "bg-primary text-text-main hover:bg-primary/90" : ""}
            ${
               isToday && !isSelected
                  ? "border border-primary text-primary"
                  : ""
            }
            ${!isSelected && !isToday ? "text-text-sub" : ""}
          `}>
               {day}
            </button>
         );
      }

      return days;
   };

   return (
      <div ref={containerRef} className={`relative ${className}`}>
         <button
            type="button"
            id={id}
            aria-invalid={ariaInvalid}
            aria-describedby={ariaDescribedBy}
            aria-disabled={disabled}
            disabled={disabled}
            onClick={() => {
               if (disabled) return;
               setIsOpen(!isOpen);
            }}
            className={`w-full px-4 py-2.5 bg-background border rounded-xl flex items-center gap-3 focus:outline-none focus:ring-2 transition-all ${
               disabled
                  ? "cursor-not-allowed opacity-60"
                  : "hover:border-text-sub"
            } ${
               status === "error"
                  ? "border-danger/60 bg-danger/5 focus:ring-danger/30 focus:border-danger/60"
                  : "border-border focus:ring-primary focus:border-transparent"
            } ${buttonClassName}`}>
            <Calendar className="w-5 h-5 text-icon-sub" />
            <span
               className={selectedDate ? "text-text-strong" : "text-text-sub"}>
               {selectedDate ? formatDate(selectedDate) : defaultPlaceholder}
            </span>
         </button>

         {isOpen &&
            popoverStyle &&
            typeof document !== "undefined" &&
            renderInPortal &&
            createPortal(
               <div
                  ref={popoverRef}
                  data-datepicker-portal="true"
                  className="fixed z-[80] bg-background rounded-lg shadow-lg border border-border p-4"
                  style={{
                     top: popoverStyle.top,
                     left: popoverStyle.left,
                     width: popoverStyle.width,
                  }}>
                  <div className="flex items-center justify-between mb-4 gap-2">
                     <button
                        onClick={handlePrevMonth}
                        className="p-1.5 hover:bg-bg-weak rounded-md transition-colors shrink-0">
                        <svg
                           className="w-5 h-5 text-icon-sub"
                           fill="none"
                           stroke="currentColor"
                           viewBox="0 0 24 24">
                           <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d={isRTL ? "M9 5l7 7-7 7" : "M15 19l-7-7 7-7"}
                           />
                        </svg>
                     </button>

                     <div className="flex items-center gap-2 flex-1">
                        <SelectDropdown
                           value={currentMonth.getMonth()}
                           options={monthNames.map((month, index) => ({
                              value: index,
                              label: month,
                           }))}
                           onChange={handleMonthChange}
                           className="flex-1"
                           openDirection={monthYearDropdownDirection}
                        />

                        <SelectDropdown
                           value={currentMonth.getFullYear()}
                           options={yearRange.map((year) => ({
                              value: year,
                              label: String(year),
                           }))}
                           onChange={handleYearChange}
                           className="w-24 shrink-0"
                           openDirection={monthYearDropdownDirection}
                        />
                     </div>

                     <button
                        onClick={handleNextMonth}
                        className="p-1.5 hover:bg-bg-weak rounded-md transition-colors shrink-0">
                        <svg
                           className="w-5 h-5 text-icon-sub"
                           fill="none"
                           stroke="currentColor"
                           viewBox="0 0 24 24">
                           <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d={isRTL ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"}
                           />
                        </svg>
                     </button>
                  </div>

                  <div className="grid grid-cols-7 gap-1 mb-2">
                     {["su", "mo", "tu", "we", "th", "fr", "sa"].map((day) => (
                        <div
                           key={day}
                           className="aspect-square flex items-center justify-center text-xs font-medium text-text-sub">
                           {t(`weekdays.${day}`)}
                        </div>
                     ))}
                  </div>

                  <div className="grid grid-cols-7 gap-1">
                     {renderCalendar()}
                  </div>
               </div>,
               document.body
            )}

         {isOpen && !renderInPortal && (
            <div
               ref={popoverRef}
               className={`absolute z-[70] bg-background rounded-lg shadow-lg border border-border p-4 w-80 ${
                  popoverAlign === "right" ? "end-0" : "start-0"
               } ${
                  popoverDirection === "up"
                     ? "bottom-full mb-2"
                     : "top-full mt-2"
               }`}>
               <div className="flex items-center justify-between mb-4 gap-2">
                  <button
                     onClick={handlePrevMonth}
                     className="p-1.5 hover:bg-bg-weak rounded-md transition-colors shrink-0">
                     <svg
                        className="w-5 h-5 text-icon-sub"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24">
                        <path
                           strokeLinecap="round"
                           strokeLinejoin="round"
                           strokeWidth={2}
                           d={isRTL ? "M9 5l7 7-7 7" : "M15 19l-7-7 7-7"}
                        />
                     </svg>
                  </button>

                  <div className="flex items-center gap-2 flex-1">
                     <SelectDropdown
                        value={currentMonth.getMonth()}
                        options={monthNames.map((month, index) => ({
                           value: index,
                           label: month,
                        }))}
                        onChange={handleMonthChange}
                        className="flex-1"
                        openDirection={monthYearDropdownDirection}
                     />

                     <SelectDropdown
                        value={currentMonth.getFullYear()}
                        options={yearRange.map((year) => ({
                           value: year,
                           label: String(year),
                        }))}
                        onChange={handleYearChange}
                        className="w-24 shrink-0"
                        openDirection={monthYearDropdownDirection}
                     />
                  </div>

                  <button
                     onClick={handleNextMonth}
                     className="p-1.5 hover:bg-bg-weak rounded-md transition-colors shrink-0">
                     <svg
                        className="w-5 h-5 text-icon-sub"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24">
                        <path
                           strokeLinecap="round"
                           strokeLinejoin="round"
                           strokeWidth={2}
                           d={isRTL ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"}
                        />
                     </svg>
                  </button>
               </div>

               <div className="grid grid-cols-7 gap-1 mb-2">
                  {["su", "mo", "tu", "we", "th", "fr", "sa"].map((day) => (
                     <div
                        key={day}
                        className="aspect-square flex items-center justify-center text-xs font-medium text-text-sub">
                        {t(`weekdays.${day}`)}
                     </div>
                  ))}
               </div>

               <div className="grid grid-cols-7 gap-1">{renderCalendar()}</div>
            </div>
         )}
      </div>
   );
}
