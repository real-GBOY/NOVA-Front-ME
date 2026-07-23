/** @format */

import * as yup from "yup";

export const invoiceSchema = yup.object({
   token: yup
      .string()
      .required("Token is required")
      .max(50, "Token must be less than 50 characters"),
   invoiceNumber: yup
      .string()
      .optional()
      .max(50, "Invoice number must be less than 50 characters"),
   agent: yup.string().optional(),
   customerName: yup
      .string()
      .required("Customer Name is required")
      .test("is-valid-customer", "Customer Name is required", (value) => {
         // Allow any non-empty string (for inline customer creation or existing customer ID)
         return !!value && value.trim().length > 0;
      }),
   customerContact: yup.string().optional(),
   customerEmail: yup.string().optional(),
   customerTrn: yup.string().optional(),
   notes: yup.string().optional(),
});

export type InvoiceFormData = yup.InferType<typeof invoiceSchema>;

export type InvoiceService = {
   id: string;
   service: string;
   serviceId?: string | number; // Service ID from backend
   serviceCode?: string; // Service code from backend
   serviceNameEn?: string; // Service name in English
   serviceNameAr?: string; // Service name in Arabic
   descriptionEn?: string; // Description in English
   descriptionAr?: string; // Description in Arabic
   unitPrice: string; // This will be service_charge
   serviceCharge?: number; // Service charge from backend
   govFees?: number; // Government fees from backend
   fine: string; // UI field (not sent as fine_amount)
   fineAmount?: number; // Actual fine amount to send to API
   discount: string;
   discountType?: "Percentage" | "Fixed"; // Discount type
   tax: string;
   assignedEmployeeId?: string | number; // Employee ID
   confirmed: boolean;
};
