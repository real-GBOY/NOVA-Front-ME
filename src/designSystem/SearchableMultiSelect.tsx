/** @format */

import { useState, useRef, useEffect, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "./Button";
import { useTranslation } from "@/hooks/useTranslation";
import { useLanguage } from "@/hooks/useLanguage";

export type DropdownItem = {
   id: string | number;
   label: string;
   subLabel?: string;
   avatar?: string;
};

export type SearchableMultiSelectProps<T extends DropdownItem> = {
   label?: string;
   placeholder?: string;
   selectedItems: T[];
   availableItems: T[];
   onChange: (items: T[]) => void;
   optional?: boolean;
   singleSelect?: boolean;
   renderItem?: (item: T) => ReactNode;
   renderChip?: (item: T, onRemove: (id: string | number) => void) => ReactNode;
   selectionClassName?: string;
   serverSideSearch?: boolean;
   onSearchQueryChange?: (query: string) => void;
};

function SearchableMultiSelect<T extends DropdownItem>({
   label,
   placeholder,
   selectedItems,
   availableItems,
   onChange,
   optional = false,
   singleSelect = false,
   renderItem,
   renderChip,
   selectionClassName = "",
   serverSideSearch = false,
   onSearchQueryChange,
}: SearchableMultiSelectProps<T>) {
   const { t } = useTranslation("common");
   const { isRTL } = useLanguage();
   const [searchQuery, setSearchQuery] = useState("");
   const [isDropdownOpen, setIsDropdownOpen] = useState(false);
   const inputRef = useRef<HTMLInputElement>(null);
   const dropdownRef = useRef<HTMLDivElement>(null);

   const selectableItems = availableItems.filter(
      (item) => !selectedItems.find((si) => si.id === item.id),
   );

   const filteredItems = serverSideSearch
      ? selectableItems
      : selectableItems.filter(
           (item) =>
              item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
              item.subLabel?.toLowerCase().includes(searchQuery.toLowerCase()),
        );

   const handleSelectItem = (item: T) => {
      if (singleSelect) {
         onChange([item]);
      } else {
         onChange([...selectedItems, item]);
      }
      setSearchQuery("");
      onSearchQueryChange?.("");
      if (singleSelect) {
         setIsDropdownOpen(false);
      } else {
         inputRef.current?.focus();
      }
   };

   const handleRemoveItem = (itemId: string | number) => {
      onChange(selectedItems.filter((i) => i.id !== itemId));
   };

   useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
         if (
            dropdownRef.current &&
            !dropdownRef.current.contains(event.target as Node)
         ) {
            setIsDropdownOpen(false);
         }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () =>
         document.removeEventListener("mousedown", handleClickOutside);
   }, []);

   const displayLabel = label || "";
   const displayPlaceholder = placeholder || "Select...";

   return (
      <div className="space-y-2">
         {displayLabel && (
            <label className="block text-sm font-medium text-text-strong">
               {displayLabel}
               {optional && (
                  <span className="text-text-soft">
                     ({t("actions.optional")})
                  </span>
               )}
            </label>
         )}

         <div ref={dropdownRef} className="relative">
            <div
               className={`w-full min-h-10 px-3 py-1.5 rounded-lg border border-border bg-background focus-within:ring-2 focus-within:ring-primary focus-within:border-transparent transition-all cursor-text flex items-center ${selectionClassName}`}
               onClick={() => inputRef.current?.focus()}
               dir={isRTL ? "rtl" : "ltr"}>
               <div className="flex flex-wrap items-center gap-2 w-full">
                  {selectedItems.map((item) =>
                     renderChip ? (
                        renderChip(item, handleRemoveItem)
                     ) : (
                        <DefaultChip
                           key={item.id}
                           item={item}
                           onRemove={handleRemoveItem}
                        />
                     )
                  )}
                  <input
                     ref={inputRef}
                     type="text"
                     value={searchQuery}
                     onChange={(e) => {
                        setSearchQuery(e.target.value);
                        onSearchQueryChange?.(e.target.value);
                        setIsDropdownOpen(true);
                     }}
                     onFocus={() => setIsDropdownOpen(true)}
                     placeholder={
                        selectedItems.length === 0 ? displayPlaceholder : ""
                     }
                     className="flex-1 min-w-[120px] outline-none text-sm text-text-strong placeholder:text-text-soft bg-transparent"
                     dir={isRTL ? "rtl" : "ltr"}
                  />
               </div>
            </div>

            {/* Dropdown */}
            <AnimatePresence>
               {isDropdownOpen && filteredItems.length > 0 && (
                  <motion.div
                     initial={{ opacity: 0, y: -10 }}
                     animate={{ opacity: 1, y: 0 }}
                     exit={{ opacity: 0, y: -10 }}
                     transition={{ duration: 0.2 }}
                     className={`absolute z-50 w-full mt-2 bg-background rounded-lg border border-border shadow-lg max-h-60 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] ${
                        isRTL ? "end-0" : "start-0"
                     }`}
                     dir={isRTL ? "rtl" : "ltr"}>
                     {filteredItems.map((item) => (
                        <Button
                           key={item.id}
                           variant="secondary"
                           onClick={() => handleSelectItem(item)}
                           className={`w-full block hover:bg-bg-weak transition-colors p-0 h-auto rounded-none border-0 ${
                              isRTL ? "text-right" : "text-left"
                           }`}>
                           {renderItem ? (
                              renderItem(item)
                           ) : (
                              <DefaultItem item={item} />
                           )}
                        </Button>
                     ))}
                  </motion.div>
               )}
            </AnimatePresence>
         </div>
      </div>
   );
}

function DefaultItem({ item }: { item: DropdownItem }) {
   return (
      <div className="flex items-center gap-3 px-4 py-3">
         {item.avatar && (
            <div className="w-8 h-8 rounded-full overflow-hidden shrink-0">
               <img
                  src={item.avatar}
                  alt={item.label}
                  className="w-full h-full object-cover"
               />
            </div>
         )}
         <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-text-strong truncate">
               {item.label}
            </p>
            {item.subLabel && (
               <p className="text-xs text-text-sub truncate">{item.subLabel}</p>
            )}
         </div>
      </div>
   );
}

function DefaultChip({
   item,
   onRemove,
}: {
   item: DropdownItem;
   onRemove: (id: string | number) => void;
}) {
   return (
      <motion.div
         initial={{ scale: 0.8, opacity: 0 }}
         animate={{ scale: 1, opacity: 1 }}
         exit={{ scale: 0.8, opacity: 0 }}
         className="flex items-center gap-2 pl-2 pr-1 py-1 bg-bg-weak rounded-lg border border-border">
         {item.avatar && (
            <div className="w-6 h-6 rounded-full overflow-hidden shrink-0">
               <img
                  src={item.avatar}
                  alt={item.label}
                  className="w-full h-full object-cover"
               />
            </div>
         )}
         <span className="text-sm font-medium text-text-strong">
            {item.label}
         </span>
         <button
            type="button"
            onClick={(e) => {
               e.stopPropagation();
               onRemove(item.id);
            }}
            className="w-5 h-5 flex items-center justify-center rounded hover:bg-border transition-colors text-text-sub hover:text-text-strong">
            <svg
               xmlns="http://www.w3.org/2000/svg"
               width="14"
               height="14"
               viewBox="0 0 24 24"
               fill="none"
               stroke="currentColor"
               strokeWidth="2"
               strokeLinecap="round"
               strokeLinejoin="round">
               <line x1="18" y1="6" x2="6" y2="18" />
               <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
         </button>
      </motion.div>
   );
}

export default SearchableMultiSelect;
