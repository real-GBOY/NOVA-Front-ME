/** @format */

import type { InvoiceItem } from "@/services/invoiceService";

export interface InvoiceTotals {
   subtotal: number;
   total_discount: number;
   total_tax: number;
   total_amount: number;
   balance_due: number;
}

/**
 * Calculate invoice totals from items
 * This is for UI display only and doesn't modify the request payload
 * @param items - Array of invoice items
 * @param amountPaid - Amount already paid (default: 0)
 * @returns Calculated totals
 */
export function calculateInvoiceTotals(
   items: InvoiceItem[],
   amountPaid: number = 0
): InvoiceTotals {
   if (!items || !Array.isArray(items) || items.length === 0) {
      return {
         subtotal: 0,
         total_discount: 0,
         total_tax: 0,
         total_amount: 0,
         balance_due: 0,
      };
   }

   // Calculate subtotal: sum of item subtotals (or calculate from unit_price + government_fee + fine_amount if subtotal not available)
   const subtotal = items.reduce((sum, item) => {
      if (item.subtotal !== undefined && item.subtotal !== null) {
         return sum + (parseFloat(String(item.subtotal)) || 0);
      }
      // Fallback: calculate from unit_price + government_fee + fine_amount
      const unitPrice = parseFloat(String(item.unit_price)) || 0;
      const quantity = item.quantity || 1;
      const govFee = parseFloat(String(item.government_fee)) || 0;
      const fineAmount = parseFloat(String(item.fine_amount)) || 0;
      return sum + unitPrice * quantity + govFee + fineAmount;
   }, 0);

   // Calculate total discount: sum of item discount_amount
   const total_discount = items.reduce((sum, item) => {
      if (item.discount_amount !== undefined && item.discount_amount !== null) {
         return sum + (parseFloat(String(item.discount_amount)) || 0);
      }
      // Fallback: calculate from discount_value if available
      if (item.discount_value !== undefined && item.discount_value !== null) {
         const discountValue = parseFloat(String(item.discount_value)) || 0;
         if (item.discount_type === "Percentage") {
            // Calculate discount amount from percentage
            const itemSubtotal =
               item.subtotal !== undefined && item.subtotal !== null
                  ? parseFloat(String(item.subtotal)) || 0
                  : (parseFloat(String(item.unit_price)) || 0) *
                    (item.quantity || 1);
            return sum + (itemSubtotal * discountValue) / 100;
         } else {
            // Fixed discount
            return sum + discountValue;
         }
      }
      // Legacy discount field
      if (item.discount !== undefined && item.discount !== null) {
         return sum + (parseFloat(String(item.discount)) || 0);
      }
      return sum;
   }, 0);

   // Calculate total tax: sum of item tax_amount
   const total_tax = items.reduce((sum, item) => {
      if (item.tax_amount !== undefined && item.tax_amount !== null) {
         return sum + (parseFloat(String(item.tax_amount)) || 0);
      }
      // Fallback: calculate from tax_rate if available
      if (item.tax_rate !== undefined && item.tax_rate !== null) {
         const taxRate = parseFloat(String(item.tax_rate)) || 0;
         // Calculate tax on unit price only (not on total including gov fees)
         const unitPrice =
            (parseFloat(String(item.unit_price)) || 0) * (item.quantity || 1);
         return sum + (unitPrice * taxRate) / 100;
      }
      // Legacy tax field
      if (item.tax !== undefined && item.tax !== null) {
         return sum + (parseFloat(String(item.tax)) || 0);
      }
      return sum;
   }, 0);

   // Calculate total amount: sum of item totals
   const total_amount = items.reduce((sum, item) => {
      if (item.total !== undefined && item.total !== null) {
         return sum + (parseFloat(String(item.total)) || 0);
      }
      // Fallback: calculate from subtotal - discount + tax
      const itemSubtotal =
         item.subtotal !== undefined && item.subtotal !== null
            ? parseFloat(String(item.subtotal)) || 0
            : (parseFloat(String(item.unit_price)) || 0) * (item.quantity || 1);
      const itemDiscount =
         item.discount_amount !== undefined && item.discount_amount !== null
            ? parseFloat(String(item.discount_amount)) || 0
            : 0;
      const itemTax =
         item.tax_amount !== undefined && item.tax_amount !== null
            ? parseFloat(String(item.tax_amount)) || 0
            : 0;
      return sum + itemSubtotal - itemDiscount + itemTax;
   }, 0);

   // Calculate balance due: total_amount - amount_paid
   const balance_due = total_amount - (parseFloat(String(amountPaid)) || 0);

   return {
      subtotal,
      total_discount,
      total_tax,
      total_amount,
      balance_due,
   };
}
