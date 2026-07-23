/** @format */

import { MoreVertical, Trash, Edit } from "@/Icons";
import type { InvoiceService } from "@/utilities/schemas/invoiceSchema";
import DirhamLabel from "@/designSystem/DirhamLabel";
import { useState, useRef, useEffect } from "react";

type ServiceCardConfirmedProps = {
   service: InvoiceService;
   calculateServiceTotal: (service: InvoiceService) => number;
   onDelete?: (id: string) => void;
   onEdit?: (id: string) => void;
   disabled?: boolean;
};

export default function ServiceCardConfirmed({
   service,
   calculateServiceTotal,
   onDelete,
   onEdit,
   disabled = false,
}: ServiceCardConfirmedProps) {
   const [isMenuOpen, setIsMenuOpen] = useState(false);
   const menuRef = useRef<HTMLDivElement>(null);

   // Close menu when clicking outside
   useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
         if (
            menuRef.current &&
            !menuRef.current.contains(event.target as Node)
         ) {
            setIsMenuOpen(false);
         }
      };

      if (isMenuOpen) {
         document.addEventListener("mousedown", handleClickOutside);
         return () =>
            document.removeEventListener("mousedown", handleClickOutside);
      }
   }, [isMenuOpen]);

   return (
      <div className="p-4 rounded-2xl border border-border bg-background shadow-sm flex flex-col gap-4">
         {/* Top Row */}
         <div className="flex items-center gap-3">
            {/* More Menu Button - Hidden when disabled */}
            {!disabled && (
               <div className="relative" ref={menuRef}>
                  <button
                     onClick={() => setIsMenuOpen(!isMenuOpen)}
                     className="flex items-center justify-center p-2.5 rounded-lg border border-border bg-background shadow-sm hover:bg-bg-weak transition-colors">
                     <MoreVertical className="w-5 h-5 fill-text-sub" />
                  </button>

                  {/* Dropdown Menu */}
                  {isMenuOpen && (
                     <div className="absolute start-0 top-full mt-1 w-40 bg-background border border-border rounded-lg shadow-lg z-10 overflow-hidden">
                        <button
                           onClick={() => {
                              onEdit?.(service.id);
                              setIsMenuOpen(false);
                           }}
                           className="w-full flex items-center gap-2 px-3 py-2 text-sm text-text-strong hover:bg-bg-weak transition-colors">
                           <Edit className="w-4 h-4 fill-text-sub" />
                           <span>Edit</span>
                        </button>
                        <button
                           onClick={() => {
                              onDelete?.(service.id);
                              setIsMenuOpen(false);
                           }}
                           className="w-full flex items-center gap-2 px-3 py-2 text-sm text-danger hover:bg-danger/10 transition-colors">
                           <Trash className="w-4 h-4 fill-danger" />
                           <span>Remove</span>
                        </button>
                     </div>
                  )}
               </div>
            )}

            {/* Service Info */}
            <div className="flex-1">
               <span className="text-sm font-medium text-text-strong">
                  {service.service}
               </span>
            </div>

            {/* Total Price */}
            <div className="flex flex-col items-end">
               <span className="text-xs text-text-sub">Total Price</span>
               <span className="text-base font-medium text-text-strong">
                  <DirhamLabel value={calculateServiceTotal(service)} />
               </span>
            </div>
         </div>
      </div>
   );
}
