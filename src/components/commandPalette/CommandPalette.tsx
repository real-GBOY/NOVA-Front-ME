/** @format */

import { useEffect, useState, useRef, type ReactNode } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import {
   CommandPaletteItem,
   CommandPaletteProps,
   QuickActionCategory,
} from "./types";
import { QUICK_ACTION_CATEGORIES } from "./constants";
import { useCommandPalette } from "@/hooks/commandPalette";
import Avatar from "@/designSystem/Avatar";
import Search from "@/Icons/search";
import Xmark from "@/Icons/xmark";

interface ResultListItemProps {
   item: CommandPaletteItem;
   isSelected?: boolean;
   onMouseEnter?: () => void;
   onSelect: () => void;
   rightNode?: ReactNode;
}

const ResultListItem = ({
   item,
   isSelected = false,
   onMouseEnter,
   onSelect,
   rightNode,
}: ResultListItemProps) => {
   const { t } = useTranslation("common");
   const Icon = item.icon;
   const isMember = item.type === "member";
   const avatarUrl = item.metadata?.timestamp;
   const badgeText = item.metadata?.badge;
   const secondaryText = item.description || item.metadata?.subtitle;

   return (
      <div
         className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
            isSelected ? "bg-bg-weak" : "hover:bg-bg-weak/50"
         }`}
         onClick={onSelect}
         onMouseEnter={onMouseEnter}>
         {isMember && avatarUrl ? (
            <Avatar
               src={avatarUrl}
               alt={item.label}
               size="md"
               className="ps-0.5"
            />
         ) : (
            <div className="bg-background border border-border rounded-xl p-1.5 shadow-subtle">
               <Icon size={20} className="fill-text-sub" />
            </div>
         )}
         <div className="flex flex-1 flex-col gap-1">
            <div className="flex items-center gap-2">
               <span className="text-sm font-medium text-text-strong tracking-[-0.084px] leading-5">
                  {item.label}
               </span>
               {badgeText && (
                  <span className="text-xs text-text-soft">
                     - {t(badgeText)}
                  </span>
               )}
            </div>
            {secondaryText && (
               <span className="text-xs text-text-soft leading-4">
                  {secondaryText}
               </span>
            )}
         </div>
         {rightNode && <div className="flex items-center">{rightNode}</div>}
      </div>
   );
};

function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
   const { t } = useTranslation("common");
   const searchInputRef = useRef<HTMLInputElement>(null);
   const [selectedIndex, setSelectedIndex] = useState(0);

   // Use the command palette hook
   const {
      searchQuery,
      setSearchQuery,
      activeCategory,
      setActiveCategory,
      isSearching,
      recentItems,
      displayItems,
      handleItemSelect,
      clearCategory: clearCategoryFilter,
   } = useCommandPalette();

   // Quick action categories
   const categories = QUICK_ACTION_CATEGORIES;

   const handleCategoryClick = (categoryId: QuickActionCategory) => {
      if (activeCategory === categoryId) {
         setActiveCategory(null);
      } else {
         setActiveCategory(categoryId);
         searchInputRef.current?.focus();
      }
   };

   const clearCategory = () => {
      clearCategoryFilter();
   };

   // Lock body scroll when modal is open
   useEffect(() => {
      if (isOpen) {
         document.body.style.overflow = "hidden";
         // Focus search input when opened
         setTimeout(() => searchInputRef.current?.focus(), 100);
      } else {
         document.body.style.overflow = "";
      }

      return () => {
         document.body.style.overflow = "";
      };
   }, [isOpen]);

   // Keyboard navigation
   useEffect(() => {
      if (!isOpen) return;

      const handleKeyDown = (e: KeyboardEvent) => {
         // Close on Escape
         if (e.key === "Escape") {
            onClose();
            return;
         }

         // Navigate with arrow keys
         if (e.key === "ArrowDown") {
            e.preventDefault();
            setSelectedIndex((prev) => (prev + 1) % displayItems.length);
         }

         if (e.key === "ArrowUp") {
            e.preventDefault();
            setSelectedIndex(
               (prev) => (prev - 1 + displayItems.length) % displayItems.length
            );
         }

         // Execute action on Enter
         if (e.key === "Enter") {
            e.preventDefault();
            const item = displayItems[selectedIndex];
            if (item) {
               handleItemSelect(item);
               onClose();
            }
         }

         // Shortcut keys (Cmd+key or Ctrl+key)
         const key = e.key.toLowerCase();
         if (e.metaKey || e.ctrlKey) {
            const action = displayItems.find(
               (a) => a.shortcut?.toLowerCase() === key
            );
            if (action) {
               e.preventDefault();
               handleItemSelect(action);
               onClose();
            }
         }
      };

      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
   }, [isOpen, selectedIndex, displayItems, onClose, handleItemSelect]);

   if (!isOpen) return null;

   return (
      <div
         className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
         onClick={onClose}>
         {/* Modal Content */}
         <div
            className="relative w-full max-w-[700px] bg-background rounded-3xl shadow-[0px_16px_32px_-12px_rgba(53,56,73,0.1)] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}>
            {/* Search Header */}
            <div className="flex items-center gap-2 px-6 py-4 border-b border-border">
               <Search size={20} className="fill-text-soft" />

               {/* Category Tag (if active) */}
               {activeCategory &&
                  (() => {
                     const activeCat = categories.find(
                        (cat) => cat.id === activeCategory
                     );
                     if (!activeCat) return null;
                     const CategoryIcon = activeCat.icon;
                     return (
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-bg-weak rounded-md border border-border">
                           <CategoryIcon size={16} className="fill-text-sub" />
                           <span className="text-sm font-medium text-text-sub capitalize">
                              {t(activeCat.label)}
                           </span>
                           <button
                              onClick={clearCategory}
                              className="p-0 hover:opacity-70 transition-opacity"
                              aria-label="Clear filter">
                              <Xmark size={12} className="fill-text-sub" />
                           </button>
                        </div>
                     );
                  })()}

               <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={
                     activeCategory
                        ? t("commandPalette.searchPlaceholder", "Search...")
                        : t(
                             "commandPalette.searchPlaceholder",
                             "Tab to Start Searching..."
                          )
                  }
                  className="flex-1 text-sm text-text-strong tracking-[-0.084px] leading-5 bg-transparent border-0 outline-none placeholder:text-text-soft"
               />
               <button
                  onClick={onClose}
                  className="p-0 hover:opacity-70 transition-opacity"
                  aria-label="Close">
                  <Xmark size={16} className="fill-text-soft" />
               </button>
            </div>

            {/* Quick Action Categories */}
            <div className="border-b border-border p-4">
               <div className="flex items-start gap-3 flex-wrap">
                  {/* Show "All" button only when a category is active */}
                  {activeCategory &&
                     (() => {
                        const allCategory = categories.find(
                           (cat) => cat.id === "all"
                        );
                        if (!allCategory) return null;
                        const AllIcon = allCategory.icon;
                        return (
                           <button
                              key="all"
                              onClick={clearCategory}
                              className="flex items-center gap-1.5 px-2 py-1.5 rounded-xl border border-border bg-background shadow-subtle hover:bg-bg-weak transition-colors">
                              <AllIcon size={16} className="fill-text-sub" />
                              <span className="text-sm font-medium text-text-sub tracking-[-0.084px] leading-5">
                                 {t(allCategory.label)}
                              </span>
                           </button>
                        );
                     })()}

                  {categories
                     .filter(
                        (cat) => cat.id !== "all" && cat.id !== activeCategory
                     )
                     .map((category) => {
                        const Icon = category.icon;
                        return (
                           <button
                              key={category.id}
                              onClick={() => handleCategoryClick(category.id)}
                              className="flex items-center gap-1.5 px-2 py-1.5 rounded-xl border border-border bg-background shadow-subtle hover:bg-bg-weak transition-colors">
                              <Icon size={16} className="fill-text-sub" />
                              <span className="text-sm font-medium text-text-sub tracking-[-0.084px] leading-5">
                                 {t(category.label)}
                              </span>
                           </button>
                        );
                     })}
               </div>
            </div>

            {/* Content Section */}
            <div className="flex flex-col gap-3 p-3 max-h-[400px] overflow-y-auto">
               {/* Show search results if searching */}
               {searchQuery.trim() ? (
                  <>
                     {isSearching ? (
                        <div className="flex items-center justify-center py-8 text-sm text-text-soft">
                           Searching...
                        </div>
                     ) : displayItems.length > 0 ? (
                        <div className="flex flex-col gap-1">
                           {displayItems.map((item, index) => (
                              <ResultListItem
                                 key={item.id}
                                 item={item}
                                 isSelected={index === selectedIndex}
                                 onMouseEnter={() => setSelectedIndex(index)}
                                 onSelect={() => {
                                    handleItemSelect(item);
                                    onClose();
                                 }}
                              />
                           ))}
                        </div>
                     ) : (
                        <div className="flex items-center justify-center py-8 text-sm text-text-soft">
                           No results found
                        </div>
                     )}
                  </>
               ) : (
                  <>
                     {/* Recent Section */}
                     {!activeCategory && recentItems.length > 0 && (
                        <>
                           <h3 className="text-base font-medium text-text-sub tracking-[-0.176px] leading-6">
                              Recent
                           </h3>
                           <div className="flex flex-col gap-1">
                              {recentItems.map((item) => (
                                 <ResultListItem
                                    key={item.id}
                                    item={item}
                                    onSelect={() => {
                                       handleItemSelect(item);
                                       onClose();
                                    }}
                                 />
                              ))}
                           </div>
                        </>
                     )}

                     {/* Quick Actions Section */}
                     <h3 className="text-base font-medium text-text-sub tracking-[-0.176px] leading-6">
                        {t("commandPalette.quickActions")}
                     </h3>
                     <div className="flex flex-col gap-1">
                        {displayItems.map((item, index) => (
                           <ResultListItem
                              key={item.id}
                              item={item}
                              isSelected={index === selectedIndex}
                              onMouseEnter={() => setSelectedIndex(index)}
                              onSelect={() => {
                                 handleItemSelect(item);
                                 onClose();
                              }}
                              rightNode={
                                 item.shortcut ? (
                                    <div className="flex items-center gap-1">
                                       <div className="bg-bg-weak border-[0.5px] border-border rounded-md px-1.5 py-1 shadow-subtle min-w-4 flex items-center justify-center">
                                          <span className="text-xs font-medium text-text-sub leading-4">
                                             {item.shortcut}
                                          </span>
                                       </div>
                                    </div>
                                 ) : null
                              }
                           />
                        ))}
                     </div>
                  </>
               )}
            </div>

            {/* Footer */}
            <div className="bg-bg-weak border-t border-border px-6 py-4">
               <div className="flex items-center gap-4">
                  {/* Navigate */}
                  <div className="flex items-center gap-1.5">
                     <div className="flex items-center gap-1">
                        <div className="bg-background border-[0.5px] border-border rounded-md px-1 py-1 shadow-subtle flex items-center">
                           <svg
                              width="16"
                              height="16"
                              viewBox="0 0 16 16"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                              className="text-text-soft">
                              <path
                                 d="M8 3.33333L8 12.6667M8 12.6667L11.3333 9.33333M8 12.6667L4.66667 9.33333"
                                 stroke="currentColor"
                                 strokeWidth="1.2"
                                 strokeLinecap="round"
                                 strokeLinejoin="round"
                              />
                           </svg>
                        </div>
                        <div className="bg-background border-[0.5px] border-border rounded-md px-1 py-1 shadow-subtle flex items-center">
                           <svg
                              width="16"
                              height="16"
                              viewBox="0 0 16 16"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                              className="text-text-soft">
                              <path
                                 d="M8 12.6667L8 3.33333M8 3.33333L11.3333 6.66667M8 3.33333L4.66667 6.66667"
                                 stroke="currentColor"
                                 strokeWidth="1.2"
                                 strokeLinecap="round"
                                 strokeLinejoin="round"
                              />
                           </svg>
                        </div>
                     </div>
                     <span className="text-sm text-text-soft tracking-[-0.084px] leading-5 whitespace-nowrap">
                        To Navigate
                     </span>
                  </div>

                  {/* Escape */}
                  <div className="flex items-center gap-1.5">
                     <div className="bg-background border-[0.5px] border-border rounded-md px-1.5 py-1 shadow-subtle flex items-center">
                        <span className="text-xs font-medium text-text-soft leading-4">
                           esc
                        </span>
                     </div>
                     <span className="text-sm text-text-soft tracking-[-0.084px] leading-5 whitespace-nowrap">
                        To Close
                     </span>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
}

export default CommandPalette;
