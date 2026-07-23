/** @format */

import { useState, useRef } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import Button from "@/designSystem/Button";
import Dropdown from "@/designSystem/Dropdown";
import {
   MoreVertical,
   Trash,
   AddLine,
   ArrowRotateLeft,
   LaptopExchange,
} from "@/Icons";
import type { ViewAssetModalAssetHeaderProps } from "./types";

function ViewAssetModalAssetHeader({
   asset,
   imagePath,
   categoryName,
   addedDate,
   isAssigned,
   onRequestReturn,
   onAssignClick,
   onReturnClick,
   onTransferClick,
   onDeleteClick,
   canAssign = false,
   canReturn = false,
   canTransfer = false,
   canDelete = false,
}: ViewAssetModalAssetHeaderProps) {
   const { t } = useTranslation("settings");
   const menuButtonRef = useRef<HTMLButtonElement>(null);
   const [isDropdownOpen, setIsDropdownOpen] = useState(false);

   // Build dropdown items based on asset assignment status
   const dropdownItems = [];

   // Assign to Member - only show if asset is NOT assigned and allowed
   if (!isAssigned && canAssign) {
      dropdownItems.push({
         id: "assign",
         label: t("assets.actions.assignToMember"),
         icon: AddLine,
         variant: "primary" as const,
         onClick: () => {
            setTimeout(() => {
               onAssignClick();
               setIsDropdownOpen(false);
            }, 0);
         },
      });
   }

   // Mark as Returned - only show if allowed
   if (canReturn) {
      dropdownItems.push({
         id: "return",
         label: t("assets.actions.markAsReturned"),
         icon: ArrowRotateLeft,
         onClick: () => {
            setTimeout(() => {
               onReturnClick();
               setIsDropdownOpen(false);
            }, 0);
         },
      });
   }

   // Transfer Asset - only show if asset IS assigned and allowed
   if (isAssigned && canTransfer) {
      dropdownItems.push({
         id: "transfer",
         label: t("assets.actions.transferAsset"),
         icon: LaptopExchange,
         onClick: () => {
            setTimeout(() => {
               onTransferClick();
               setIsDropdownOpen(false);
            }, 0);
         },
      });
   }

   // Delete Asset - only show if allowed
   if (canDelete) {
      dropdownItems.push({
         id: "delete",
         label: t("assets.actions.deleteAsset"),
         icon: Trash,
         variant: "danger" as const,
         onClick: () => {
            setTimeout(() => {
               onDeleteClick();
               setIsDropdownOpen(false);
            }, 0);
         },
      });
   }

   return (
      <div className="flex items-center gap-3 px-4 py-4 border-b border-border">
         {imagePath && (
            <div className="w-12 h-12 rounded-full bg-bg-weak flex items-center justify-center overflow-hidden shrink-0">
               <img
                  src={imagePath}
                  alt={categoryName}
                  className="w-full h-full object-cover"
               />
            </div>
         )}
         <div className="flex-1 min-w-0">
            <h2 className="text-base font-medium text-text-strong truncate">
               {asset.name}
            </h2>
            <div className="flex items-center gap-2 mt-1">
               <div className="inline-flex items-center justify-center py-1 px-2 gap-0.5 h-6 bg-background border border-stroke-sub-300 rounded-md shadow-subtle">
                  <span className="text-xs font-medium leading-4 whitespace-nowrap text-text-sub">
                     {categoryName.charAt(0).toUpperCase() +
                        categoryName.slice(1)}
                  </span>
               </div>
               <span className="text-sm text-text-soft">•</span>
               <span className="text-sm text-text-soft">
                  {t("assets.viewModal.addedAt")} {addedDate}
               </span>
            </div>
         </div>
         <div className="flex items-center gap-2 relative">
            <button
               ref={menuButtonRef}
               onClick={() => setIsDropdownOpen(!isDropdownOpen)}
               className={`flex items-center justify-center p-2 bg-background border border-border rounded-lg shrink-0 transition-colors hover:bg-bg-weak ${
                  isDropdownOpen ? "bg-bg-weak" : ""
               }`}
               aria-label="More options">
               <MoreVertical size={20} />
            </button>
            <Dropdown
               items={dropdownItems}
               isOpen={isDropdownOpen}
               onClose={() => setIsDropdownOpen(false)}
               anchorRef={menuButtonRef}
               zIndex="z-80"
            />
            {asset.status === "assigned" && canReturn && (
               <Button
                  variant="primary"
                  onClick={onRequestReturn}
                  className="!bg-bg-dark hover:!opacity-90 !text-white">
                  {t("assets.viewModal.requestReturn")}
               </Button>
            )}
         </div>
      </div>
   );
}

export default ViewAssetModalAssetHeader;
