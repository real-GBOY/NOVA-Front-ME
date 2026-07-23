/** @format */

import { useState, useRef, useEffect } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { useShifts } from "@/hooks/shifts/useShifts";
import { useDebounce } from "@/hooks/useDebounce";
import { ArrowDownSLine } from "@/Icons";
import Loader from "@/designSystem/Loader";

type ShiftSelectorProps = {
   value?: number | null;
   onChange: (shiftId: number | null) => void;
   error?: string;
};

const WEEKDAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function ShiftSelector({ value, onChange, error }: ShiftSelectorProps) {
   const { t } = useTranslation("common");
   const [isOpen, setIsOpen] = useState(false);
   const [searchQuery, setSearchQuery] = useState("");
   const [hoveredShiftId, setHoveredShiftId] = useState<number | null>(null);
   const debouncedSearch = useDebounce(searchQuery.trim(), 300);
   const dropdownRef = useRef<HTMLDivElement>(null);
   const { useListShifts } = useShifts();
   const {
      data: shiftsData,
      isLoading,
      isError,
      error: shiftsError,
      refetch,
   } = useListShifts({
      search: debouncedSearch || undefined,
   });

   const shifts = shiftsData?.data || [];
   const selectedShift = shifts.find((s) => s.shift_id === value);

   // Close dropdown when clicking outside
   useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
         if (
            dropdownRef.current &&
            !dropdownRef.current.contains(event.target as Node)
         ) {
            setIsOpen(false);
            setHoveredShiftId(null);
            setSearchQuery("");
         }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () =>
         document.removeEventListener("mousedown", handleClickOutside);
   }, []);

   useEffect(() => {
      if (isOpen && !isLoading && !shiftsData) {
         refetch();
      }
   }, [isOpen, isLoading, shiftsData, refetch]);

   const handleSelect = (shiftId: number) => {
      onChange(shiftId);
      setIsOpen(false);
      setHoveredShiftId(null);
      setSearchQuery("");
   };

   const handleClear = (e: React.MouseEvent) => {
      e.stopPropagation();
      onChange(null);
   };

   return (
      <div className="flex flex-col gap-1">
         <label className="block text-sm font-medium text-text-sub">
            {t("members.shift.label")}
         </label>

         <div className="relative" ref={dropdownRef}>
            {/* Selector Button */}
            <button
               type="button"
               onClick={() => {
                  const next = !isOpen;
                  setIsOpen(next);
                  if (!next) {
                     setSearchQuery("");
                  }
               }}
               className={`w-full px-3 py-2.5 text-sm rounded-xl border ${
                  error ? "border-danger" : "border-border"
               } bg-background text-text-sub placeholder:text-text-soft focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent flex items-center justify-between`}>
               <span
                  className={
                     selectedShift ? "text-text-strong" : "text-text-soft"
                  }>
                  {selectedShift
                     ? selectedShift.name
                     : t("members.shift.placeholder")}
               </span>
               <div className="flex items-center gap-2">
                  {selectedShift && (
                     <span
                        role="button"
                        tabIndex={0}
                        aria-label="Clear shift"
                        onClick={handleClear}
                        onKeyDown={(event) => {
                           if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault();
                              handleClear(event as unknown as React.MouseEvent);
                           }
                        }}
                        className="text-text-soft hover:text-text-sub transition-colors">
                        ×
                     </span>
                  )}
                  <ArrowDownSLine
                     size={16}
                     className={`fill-icon-sub transition-transform ${
                        isOpen ? "rotate-180" : ""
                     }`}
                  />
               </div>
            </button>

            {/* Dropdown */}
            {isOpen && (
               <div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-xl shadow-lg">
                  <div className="p-2 border-b border-border">
                     <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(event) => {
                           if (event.key === "Enter") {
                              event.preventDefault();
                              event.stopPropagation();
                           }
                        }}
                        placeholder={t("members.shift.placeholder")}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-text-strong placeholder:text-text-soft focus:outline-none focus:ring-2 focus:ring-primary/20"
                     />
                  </div>
                  {isLoading ? (
                     <div className="flex items-center justify-center py-8">
                        <Loader label={t("members.shift.loading")} />
                     </div>
                  ) : isError ? (
                     <div className="px-4 py-6 text-center text-sm text-text-sub">
                        <p className="mb-2">
                           {shiftsError &&
                           typeof shiftsError === "object" &&
                           "response" in shiftsError
                              ? (
                                   shiftsError as {
                                      response?: {
                                         data?: { message?: string };
                                      };
                                   }
                                ).response?.data?.message ||
                                t("members.shift.noShifts")
                              : t("members.shift.noShifts")}
                        </p>
                        <button
                           type="button"
                           onClick={() => refetch()}
                           className="text-sm font-medium text-primary hover:underline">
                           {t("common:retry", "Retry")}
                        </button>
                     </div>
                  ) : shifts.length === 0 ? (
                     <div className="px-4 py-8 text-center text-sm text-text-sub">
                        {searchQuery.trim()
                           ? t(
                                "members.shift.noSearchResults",
                                "No matching shifts found",
                             )
                           : t("members.shift.noShifts")}
                     </div>
                  ) : (
                     <div className="py-1 max-h-64 overflow-y-auto">
                        {shifts.map((shift) => (
                           <button
                              key={shift.shift_id}
                              type="button"
                              onClick={() => handleSelect(shift.shift_id)}
                              onMouseEnter={() =>
                                 setHoveredShiftId(shift.shift_id)
                              }
                              onMouseLeave={() => setHoveredShiftId(null)}
                              className={`w-full px-4 py-2.5 text-left text-sm transition-colors ${
                                 value === shift.shift_id
                                    ? "bg-primary/10 text-primary"
                                    : "hover:bg-bg-weak text-text-strong"
                              }`}>
                              <div className="flex flex-col gap-0.5">
                                 <span className="font-medium">
                                    {shift.name}
                                 </span>
                                 <span className="text-xs text-text-sub">
                                    {shift.timezone} • {shift.segments.length}{" "}
                                    {shift.segments.length === 1
                                       ? "day"
                                       : "days"}
                                 </span>
                              </div>
                           </button>
                        ))}
                     </div>
                  )}

                  {/* Hover Tooltip - Outside the scrollable area */}
                  {hoveredShiftId &&
                     (() => {
                        const hoveredShift = shifts.find(
                           (s) => s.shift_id === hoveredShiftId,
                        );
                        if (!hoveredShift) return null;
                        return (
                           <div className="absolute end-0 bottom-full mt-2 z-[10000] w-72 bg-background border border-border rounded-xl shadow-xl p-4">
                              <div className="flex flex-col gap-3">
                                 <div>
                                    <h4 className="text-sm font-semibold text-text-strong">
                                       {hoveredShift.name}
                                    </h4>
                                    <p className="text-xs text-text-sub">
                                       {hoveredShift.timezone}
                                    </p>
                                 </div>

                                 <div className="flex flex-col gap-2">
                                    <p className="text-xs font-medium text-text-sub">
                                       {t("members.shift.schedule")}:
                                    </p>
                                    {hoveredShift.segments.map(
                                       (segment, idx) => (
                                          <div
                                             key={idx}
                                             className="flex items-center justify-between text-xs">
                                             <span className="text-text-strong font-medium">
                                                {WEEKDAY_NAMES[segment.weekday]}
                                             </span>
                                            <span className="text-text-sub">
                                                {segment.start_time}{" "}
                                                -{" "}
                                                {segment.end_time}
                                                {segment.break_minutes && (
                                                   <span className="text-text-soft ms-1">
                                                      ({segment.break_minutes}
                                                      min break)
                                                   </span>
                                                )}
                                             </span>
                                          </div>
                                       ),
                                    )}
                                 </div>
                              </div>
                           </div>
                        );
                     })()}
               </div>
            )}
         </div>

         {error && <p className="text-sm text-danger mt-1">{error}</p>}
      </div>
   );
}

export default ShiftSelector;
