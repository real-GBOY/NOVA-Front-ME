/** @format */

import { apiClient } from "@/config/axios";
import { endPoints } from "@/config/endPoints";

// Types
export interface ReceiptVoucherListItem {
   receipt_id: number;
   receipt_code: string;
   receipt_date: string;
   due_date?: string;
   from_type?: string;
   from_customer?: { customer_id: number; customer_name: string };
   from_agent?: { agent_id: number; name?: string; agent_code?: string };
   from_entity_name?: string;
   to_account?: {
      account_id: number;
      account_name: string;
      account_code?: string | null;
   };
   income_type?: {
      income_type_id?: number;
      type_id?: number;
      type_name: string;
      gl_code?: string | null;
   };
   amount: number;
   tax_amount: number;
   bank_commission: number;
   total_amount: number;
   currency: string;
   status: string;
   payment_method?: string;
   created_by: {
      employee_id: number;
      name?: string;
      first_name?: string;
      last_name?: string;
   };
   created_at: string;
}

export interface ReceiptVoucherDetail {
   receipt_id: number;
   receipt_code: string;
   receipt_date: string;
   due_date?: string;
   from_type?: string;
   from_customer?: {
      customer_id: number;
      customer_name: string;
      contact_person?: string;
   };
   from_agent?: { agent_id: number; name?: string; agent_code?: string };
   from_entity_name?: string;
   to_account?: {
      account_id: number;
      account_name: string;
      account_type: string;
      currency: string;
   };
   income_type?: {
      income_type_id?: number;
      type_id?: number;
      type_name: string;
      gl_code?: string | null;
   };
   amount: number;
   tax_amount: number;
   bank_commission: number;
   total_amount: number;
   currency: string;
   status: string;
   payment_method?: string;
   bank_name?: string;
   transaction_details?: string;
   remarks?: string;
   reference_number?: string;
   created_by: {
      employee_id: number;
      name?: string;
      first_name?: string;
      last_name?: string;
   };
   created_at: string;
   updated_by?: {
      employee_id: number;
      name?: string;
      first_name?: string;
      last_name?: string;
   };
   updated_at?: string;
   linked_invoices?: Array<{
      invoice_id: number;
      invoice_code: string;
      invoice_date: string;
      receivable_amount: number;
      payable_amount: number;
   }>;
}

export interface ReceiptVoucherListResponse {
   success: boolean;
   message: string;
   data: ReceiptVoucherListItem[];
   pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
      total_pages: number; // Added for server table data
   };
}

export interface ReceiptVoucherDetailResponse {
   success: boolean;
   data: ReceiptVoucherDetail;
}

export interface CreateReceiptVoucherRequest {
   receipt_date: string;
   due_date?: string;
   from_type?: string;
   from_customer_id?: number;
   from_agent_id?: number;
   from_entity_name?: string;
   to_account_id: number;
   income_type_id: number;
   amount: number;
   tax_amount?: number;
   bank_commission?: number;
   currency?: string;
   payment_method?: string;
   reference_number?: string;
   bank_name?: string;
   transaction_details?: string;
   remarks?: string;
   status?: string;
}

export interface CreateReceiptVoucherResponse {
   success: boolean;
   message: string;
   data: {
      receipt_id: number;
      receipt_code: string;
      status: string;
      total_amount: number;
      created_by: { employee_id: number; name: string };
   };
}

export interface ReceiptVoucherFilters {
   page?: number;
   limit?: number;
   search?: string;
   status?: string | string[];
   income_type_id?: number;
   to_account_id?: number;
   date_from?: string;
   date_to?: string;
   amount_from?: number;
   amount_to?: number;
   sort_by?: string;
   sort_order?: string;
}

// Service functions
export const receiptVoucherService = {
   list: async (
      filters?: ReceiptVoucherFilters
   ): Promise<ReceiptVoucherListResponse> => {
      const response = await apiClient.get(endPoints.vouchers.receipts.list, {
         params: filters,
      });

      const backendData = response.data;
      const pagination = backendData.pagination || { page: 1, limit: 10, total: 0, pages: 0 };

      return {
         ...backendData,
         pagination: {
            ...pagination,
            page: Number(pagination.page),
            limit: Number(pagination.limit),
            total: pagination.total,
            pages: pagination.pages,
            // @ts-expect-error - Adding total_pages for consistency with other services
            total_pages: pagination.pages || Math.ceil((pagination.total || 0) / (pagination.limit || 10))
         }
      };
   },

   getById: async (receiptId: number): Promise<ReceiptVoucherDetail> => {
      const response = await apiClient.get(
         endPoints.vouchers.receipts.getById(receiptId)
      );
      return response.data.data;
   },

   create: async (
      data: CreateReceiptVoucherRequest
   ): Promise<CreateReceiptVoucherResponse> => {
      const response = await apiClient.post(
         endPoints.vouchers.receipts.create,
         data
      );
      return response.data;
   },

   update: async (
      receiptId: number,
      data: Partial<CreateReceiptVoucherRequest>
   ): Promise<CreateReceiptVoucherResponse> => {
      const response = await apiClient.put(
         endPoints.vouchers.receipts.update(receiptId),
         data
      );
      return response.data;
   },

   approve: async (
      receiptId: number
   ): Promise<{ success: boolean; message: string }> => {
      const response = await apiClient.post(
         endPoints.vouchers.receipts.approve(receiptId)
      );
      return response.data;
   },

   cancel: async (
      receiptId: number,
      remarks?: string
   ): Promise<{ success: boolean }> => {
      const response = await apiClient.post(
         endPoints.vouchers.receipts.cancel(receiptId),
         { remarks }
      );
      return response.data;
   },
};
