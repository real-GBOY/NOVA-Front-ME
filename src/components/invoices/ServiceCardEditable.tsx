/** @format */

import { Trash, CheckCircle } from "@/Icons";
import type { InvoiceService } from "@/utilities/schemas/invoiceSchema";

type ServiceCardEditableProps = {
   service: InvoiceService;
   onUpdate: (id: string, field: keyof InvoiceService, value: string) => void;
   onDelete: (id: string) => void;
   onConfirm: (id: string) => void;
   disabled?: boolean;
};

export default function ServiceCardEditable({
   service,
   onUpdate,
   onDelete,
   onConfirm,
   disabled = false,
}: ServiceCardEditableProps) {
   const handleVatChange = (value: string) => {
      // Allow empty string
      if (value === "") {
         onUpdate(service.id, "tax", "");
         return;
      }

      // Remove any non-numeric characters except decimal point
      const cleaned = value.replace(/[^\d.]/g, "");
      const numValue = parseFloat(cleaned);

      // Limit to 100
      if (!isNaN(numValue)) {
         const limited = Math.min(numValue, 100);
         onUpdate(service.id, "tax", limited.toString());
      } else if (cleaned === "") {
         onUpdate(service.id, "tax", "");
      }
   };

   const toggleDiscountType = () => {
      const newType =
         service.discountType === "Percentage" ? "Fixed" : "Percentage";
      onUpdate(service.id, "discountType", newType);
   };

   return (
      <div className="p-4 rounded-2xl border border-border bg-bg-weak flex flex-col gap-4">
         {/* Service Name - Full Width */}
         <div className="flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
               <label className="block text-xs text-text-sub mb-1">
                  Service
               </label>
               <div className="w-full px-3 py-2.5 text-sm font-medium text-text-strong rounded-lg bg-transparent cursor-not-allowed truncate">
                  {service.service}
               </div>
            </div>
            {!disabled && (
               <div className="flex items-end gap-2 shrink-0">
                  <button
                     onClick={() => onDelete(service.id)}
                     className="p-3 rounded-lg bg-danger/20 hover:bg-background transition-colors">
                     <Trash className="w-5 h-5 fill-danger" />
                  </button>
                  <button
                     onClick={() => onConfirm(service.id)}
                     className="p-3 rounded-lg bg-success/20 hover:bg-background transition-colors">
                     <CheckCircle className="w-5 h-5 fill-success" />
                  </button>
               </div>
            )}
         </div>

         {/* Fields Grid - Responsive */}
         <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 w-full">
            <div className="w-full">
               <label className="block text-xs text-text-sub mb-1">
                  Unit Price
               </label>
               <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2">
                     <img
                        src="/icons/dirham.png"
                        alt="dirham"
                        className="w-4 h-4 object-contain"
                     />
                  </span>
                  <input
                     type="text"
                     value={service.unitPrice}
                     onChange={(e) =>
                        onUpdate(service.id, "unitPrice", e.target.value)
                     }
                     className="w-full pl-8 pr-3 py-2.5 text-sm font-medium text-primary rounded-lg border border-border bg-background outline-none focus:ring-2 focus:ring-primary"
                  />
               </div>
            </div>
            <div className="w-full">
               <label className="block text-xs text-text-sub mb-1">
                  Gov Fees
               </label>
               <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2">
                     <img
                        src="/icons/dirham.png"
                        alt="dirham"
                        className="w-4 h-4 object-contain"
                     />
                  </span>
                  <input
                     type="text"
                     value={service.govFees?.toString() || ""}
                     onChange={(e) =>
                        onUpdate(service.id, "govFees", e.target.value)
                     }
                     className="w-full pl-8 pr-3 py-2.5 text-sm font-medium text-primary rounded-lg border border-border bg-background outline-none focus:ring-2 focus:ring-primary"
                  />
               </div>
            </div>
            <div className="w-full">
               <label className="block text-xs text-text-sub mb-1">VAT</label>
               <div className="relative">
                  <input
                     type="text"
                     value={service.tax || ""}
                     onChange={(e) => handleVatChange(e.target.value)}
                     className="w-full ps-3 pe-8 py-2.5 text-sm font-medium text-primary rounded-lg border border-border bg-background outline-none focus:ring-2 focus:ring-primary"
                     placeholder="0"
                  />
                  <span className="absolute end-3 top-1/2 -translate-y-1/2 text-sm text-text-sub pointer-events-none">
                     %
                  </span>
               </div>
            </div>
            <div className="w-full">
               <button
                  type="button"
                  onClick={toggleDiscountType}
                  className="block text-xs text-text-sub mb-1 hover:text-primary transition-colors cursor-pointer text-start">
                  Discount{" "}
                  {service.discountType === "Percentage" ? "(%)" : "(AED)"}
               </button>
               <div className="relative">
                  {service.discountType !== "Percentage" && (
                     <span className="absolute left-3 top-1/2 -translate-y-1/2">
                        <img
                           src="/icons/dirham.png"
                           alt="dirham"
                           className="w-4 h-4 object-contain"
                        />
                     </span>
                  )}
                  <input
                     type="text"
                     value={service.discount || ""}
                     onChange={(e) =>
                        onUpdate(service.id, "discount", e.target.value)
                     }
                     className={`w-full ${
                        service.discountType === "Percentage"
                           ? "ps-3 pe-8"
                           : "pl-8 pr-3"
                     } py-2.5 text-sm font-medium text-primary rounded-lg border border-border bg-background outline-none focus:ring-2 focus:ring-primary`}
                     placeholder="0"
                  />
                  {service.discountType === "Percentage" && (
                     <span className="absolute end-3 top-1/2 -translate-y-1/2 text-sm text-text-sub pointer-events-none">
                        %
                     </span>
                  )}
               </div>
            </div>
            <div className="w-full">
               <label className="block text-xs text-text-sub mb-1">Fine</label>
               <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2">
                     <img
                        src="/icons/dirham.png"
                        alt="dirham"
                        className="w-4 h-4 object-contain"
                     />
                  </span>
                  <input
                     type="text"
                     value={service.fine || ""}
                     onChange={(e) =>
                        onUpdate(service.id, "fine", e.target.value)
                     }
                     className="w-full pl-8 pr-3 py-2.5 text-sm font-medium text-primary rounded-lg border border-border bg-background outline-none focus:ring-2 focus:ring-primary"
                     placeholder="0"
                  />
               </div>
            </div>
         </div>
      </div>
   );
}
