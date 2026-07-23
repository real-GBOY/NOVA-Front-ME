/** @format */

import { DetailSectionData, DetailItem } from "./types";
import {
   UserSimpleAlt,
   Briefcase,
   LocationSimpleUser,
   IdBadge,
   IdCardClipText,
   PenToSquare,
} from "@/Icons";
import { ComponentType, useState } from "react";
import InfoCard from "@/designSystem/InfoCard";

const sectionIcons: Record<
   string,
   ComponentType<{ size?: number; className?: string }>
> = {
   personal: UserSimpleAlt,
   work: Briefcase,
   address: LocationSimpleUser,
   compensation: IdBadge,
   contact: IdCardClipText,
};

interface DetailSectionsGridProps {
   sections: DetailSectionData[];
   gridClassName?: string;
   itemsPerRow?: number;
   onEdit?: (sectionId: string) => void;
   canEdit?: boolean;
}

function DetailSectionsGrid({
   sections,
   gridClassName = "",
   itemsPerRow = 2,
   onEdit,
   canEdit = false,
}: DetailSectionsGridProps) {
   return (
      <section className={`grid r-gap xl:gap-6 ${gridClassName}`.trim()}>
         {sections.map((section) => (
            <DetailSectionCard
               key={section.id}
               section={section}
               itemsPerRow={itemsPerRow}
               onEdit={onEdit}
               canEdit={canEdit}
            />
         ))}
      </section>
   );
}

function DetailSectionCard({
   section,
   itemsPerRow = 2,
   onEdit,
   canEdit = false,
}: {
   section: DetailSectionData;
   itemsPerRow?: number;
   onEdit?: (sectionId: string) => void;
   canEdit?: boolean;
}) {
   const IconComponent = sectionIcons[section.id];
   const hasStandaloneFirstItem =
      section.id === "address" && section.items.length > 2;

   return (
      <InfoCard
         title={
            <div className="flex items-center justify-between w-full">
               <span>{section.title}</span>
               {canEdit && onEdit && (
                  <button
                     type="button"
                     onClick={() => onEdit(section.id)}
                     className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-primary hover:text-primary/80 hover:bg-primary/10 rounded-md transition-colors"
                     title="Edit">
                     <PenToSquare size={14} className="fill-primary" />
                     <span>Edit</span>
                  </button>
               )}
            </div>
         }
         icon={
            IconComponent && (
               <IconComponent size={24} className="fill-text-sub" />
            )
         }>
         {section.items.length === 1 ? (
            // Single item - full width
            section.items.map((item) => (
               <DetailItemRow key={item.label} item={item} />
            ))
         ) : (
            <>
               {/* Optional standalone first row (Street Address in Address section) */}
               {hasStandaloneFirstItem && (
                  <div className="flex flex-col gap-3 items-start overflow-visible sm:flex-row sm:gap-4 xl:gap-4">
                     <div className="w-full min-w-0 overflow-visible sm:flex-1">
                        <DetailItemRow item={section.items[0]} />
                     </div>
                     <div className="hidden min-w-0 sm:block sm:flex-1" />
                  </div>
               )}

               {/* Group remaining items into rows */}
               {Array.from({
                  length: Math.ceil(
                     (section.items.length - (hasStandaloneFirstItem ? 1 : 0)) /
                        itemsPerRow
                  ),
               }).map((_, rowIndex) => {
                  const baseIndex = hasStandaloneFirstItem ? 1 : 0;
                  const startIdx = baseIndex + rowIndex * itemsPerRow;
                  const rowItems = section.items.slice(
                     startIdx,
                     startIdx + itemsPerRow
                  );

                  return (
                     <div
                        key={`row-${rowIndex}`}
                        className="flex flex-col gap-3 items-start overflow-visible sm:flex-row sm:gap-4 xl:gap-4">
                        {rowItems.map((item) => (
                           <div
                              key={item.label}
                              className="w-full min-w-0 overflow-visible sm:flex-1">
                              <DetailItemRow item={item} />
                           </div>
                        ))}
                        {/* Add spacers if incomplete row */}
                        {Array.from({
                           length: itemsPerRow - rowItems.length,
                        }).map((_, idx) => (
                           <div
                              key={`spacer-${idx}`}
                              className="hidden min-w-0 sm:block sm:flex-1"
                           />
                        ))}
                     </div>
                  );
               })}
            </>
         )}
      </InfoCard>
   );
}

function DetailItemRow({ item }: { item: DetailItem }) {
   const [copied, setCopied] = useState(false);
   const [showTooltip, setShowTooltip] = useState(false);

   const copyToClipboard = async (text: string) => {
      try {
         await navigator.clipboard.writeText(text);
         setCopied(true);
         setTimeout(() => {
            setCopied(false);
            setShowTooltip(false);
         }, 1000);
      } catch (err) {
         console.error("Failed to copy: ", err);
      }
   };

   const handleMouseEnter = () => {
      if (!copied) {
         setShowTooltip(true);
      }
   };

   const handleMouseLeave = () => {
      if (!copied) {
         setShowTooltip(false);
      }
   };

   // Manager with badge (tag with avatar)
   if (item.badge) {
      return (
         <div className="flex flex-col gap-1 justify-center min-h-11">
            <dt className="text-sm font-normal leading-5 text-text-sub tracking-tight">
               {item.label}
            </dt>
            <dd className="text-sm font-normal leading-5">
               <div className="inline-flex items-center gap-1 rounded-md border border-border bg-background pl-1 pr-2 py-0.5">
                  <div className="h-[12.8px] w-[12.8px] rounded-full bg-blue-200 overflow-hidden shrink-0">
                     <img
                        src="/icons/defAvatar.png"
                        alt=""
                        className="w-full h-full object-cover"
                     />
                  </div>
                  <span className="text-xs font-medium text-text-sub leading-4">
                     {item.value}
                  </span>
               </div>
            </dd>
         </div>
      );
   }

   // Permissions - highlighted in blue
   if (item.variant === "highlightedText") {
      return (
         <div className="flex flex-col gap-1 justify-center min-h-11">
            <dt className="text-sm font-normal leading-5 text-text-sub tracking-tight">
               {item.label}
            </dt>
            <dd className="text-sm font-normal leading-5 text-information truncate">
               {item.value}
            </dd>
         </div>
      );
   }

   // Permissions - warning
   if (item.variant === "warningText") {
      return (
         <div className="flex flex-col gap-1 justify-center min-h-11">
            <dt className="text-sm font-normal leading-5 text-text-sub tracking-tight">
               {item.label}
            </dt>
            <dd className="text-sm font-normal leading-5 text-warning truncate">
               {item.value}
            </dd>
         </div>
      );
   }

   // Contact info (Email/Mobile) with highlighted badge and copy functionality
   if (item.variant === "pill") {
      const valueAsString =
         typeof item.value === "string" ? item.value : String(item.value);

      return (
         <div className="flex flex-col gap-1 justify-center min-h-11">
            <dt className="text-sm font-normal leading-5 text-text-sub tracking-tight">
               {item.label}
            </dt>
            <dd className="text-sm font-normal leading-5">
               <div className="relative inline-block">
                  <div
                     onClick={() => copyToClipboard(valueAsString)}
                     onMouseEnter={handleMouseEnter}
                     onMouseLeave={handleMouseLeave}
                     className="inline-flex items-center gap-0.5 rounded-md bg-primary/10 px-2 py-0.5 cursor-pointer hover:bg-primary/15 transition-colors">
                     <span className="text-xs font-medium text-primary leading-4">
                        {item.value}
                     </span>
                  </div>
                  {showTooltip && (
                     <div className="absolute bottom-full end-0 mb-2 px-3 py-1 bg-gray-800 text-white text-sm rounded-md whitespace-nowrap z-9999 transition-opacity duration-200">
                        {copied ? "Copied!" : "Click to copy"}
                        <div className="absolute -bottom-1 left-4 w-2 h-2 bg-gray-800 rotate-45"></div>
                     </div>
                  )}
               </div>
            </dd>
         </div>
      );
   }

   // Street Address with link (underlined) - External or Map
   if (item.link && item.isExternalLink) {
      return (
         <div className="flex flex-col gap-1 justify-center min-h-11">
            <dt className="text-sm font-normal leading-5 text-text-sub tracking-tight">
               {item.label}
            </dt>
            <dd className="text-sm font-normal leading-5">
               <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-text-strong underline hover:text-primary transition-colors truncate block">
                  {item.value}
               </a>
            </dd>
         </div>
      );
   }

   // Regular link
   if (item.link) {
      return (
         <div className="flex flex-col gap-1 justify-center min-h-11">
            <dt className="text-sm font-normal leading-5 text-text-sub tracking-tight">
               {item.label}
            </dt>
            <dd className="text-sm font-normal leading-5">
               <a
                  href={item.link}
                  className="text-text-strong underline hover:text-primary transition-colors truncate block">
                  {item.value}
               </a>
            </dd>
         </div>
      );
   }

   // Regular item
   return (
      <div className="flex flex-col gap-1 justify-center min-h-11">
         <dt className="text-sm font-normal leading-5 text-text-sub tracking-tight">
            {item.label}
         </dt>
         <dd className="text-sm font-normal leading-5 truncate">
            <span
               className={item.muted ? "text-text-soft" : "text-text-strong"}>
               {item.value}
            </span>
         </dd>
      </div>
   );
}

export default DetailSectionsGrid;
