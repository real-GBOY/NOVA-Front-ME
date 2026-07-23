/** @format */

import { apiClient } from "@/config/axios";
import { endPoints } from "@/config/endPoints";

// Types
export interface PaymentVoucherListItem {
   voucher_id: number;
   voucher_code: string;
   voucher_date: string;
   due_date?: string;
   from_account?: {
      account_id: number;
      account_name: string;
      account_code?: string | null;
   };
   to_type?: string;
   to_customer?: { customer_id: number; customer_name: string };
   to_agent?: { agent_id: number; agent_name: string };
   to_employee?: {
      employee_id: number;
      first_name?: string;
      last_name?: string;
      name?: string;
   };
   to_account?: {
      account_id: number;
      account_name: string;
      account_code?: string | null;
   };
   to_entity_name?: string;
   expense_type?: { type_id: number; type_name: string };
   amount: number;
   commission: number;
   tax_amount: number;
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

export interface PaymentVoucherDetail {
   voucher_id: number;
   voucher_code: string;
   voucher_date: string;
   due_date?: string;
   from_type?: string;
   from_account?: {
      account_id: number;
      account_name: string;
      account_type: string;
      currency: string;
   };
   to_type?: string;
   to_customer?: {
      customer_id: number;
      customer_name: string;
      contact_person?: string;
   };
   to_agent?: {
      agent_id: number;
      agent_name: string;
   };
   to_employee?: {
      employee_id: number;
      first_name?: string;
      last_name?: string;
      name?: string;
   };
   to_account?: {
      account_id: number;
      account_name: string;
      account_type?: string;
      currency?: string;
   };
   to_entity_name?: string;
   expense_type?: { type_id: number; type_name: string };
   amount: number;
   commission: number;
   tax_type?: string;
   tax_rate?: number;
   tax_amount: number;
   total_amount: number;
   currency: string;
   status: string;
   payment_method?: string;
   bank_name?: string;
   transaction_details?: string;
   remarks?: string;
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
   approved_by?: {
      employee_id: number;
      name?: string;
      first_name?: string;
      last_name?: string;
   };
   approved_at?: string;
   linked_invoices?: Array<{
      invoice_id: number;
      invoice_code: string;
      invoice_date: string;
      payment_amount: number;
   }>;
}

export interface PaymentVoucherListResponse {
   success: boolean;
   message: string;
   data: PaymentVoucherListItem[];
   pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
      total_pages: number; // Added for server table data
   };
}

export interface PaymentVoucherDetailResponse {
   success: boolean;
   data: PaymentVoucherDetail;
}

export interface CreatePaymentVoucherRequest {
   voucher_date: string;
   due_date?: string;
   from_type: string;
   from_account_id?: number;
   to_type: string;
   to_customer_id?: number;
   to_agent_id?: number;
   to_employee_id?: number;
   to_account_id?: number;
   to_entity_name?: string;
   expense_type_id?: number;
   amount: number;
   commission?: number;
   tax_type?: string;
   tax_rate?: number;
   currency?: string;
   payment_method?: string;
   bank_name?: string;
   cheque_number?: string;
   invoice_id?: number;
   transaction_details?: string;
   remarks?: string;
   status?: string;
}

export interface UpdatePaymentVoucherRequest {
   voucher_date?: string;
   due_date?: string;
   from_type?: string;
   from_account_id?: number;
   to_type?: string;
   to_customer_id?: number;
   to_agent_id?: number;
   to_employee_id?: number;
   to_account_id?: number;
   to_entity_name?: string;
   expense_type_id?: number;
   amount?: number;
   commission?: number;
   tax_type?: string;
   tax_rate?: number;
   currency?: string;
   payment_method?: string;
   bank_name?: string;
   cheque_number?: string;
   invoice_id?: number;
   transaction_details?: string;
   remarks?: string;
   status?: string;
}

export interface CreatePaymentVoucherResponse {
   success: boolean;
   message: string;
   data: {
      voucher_id: number;
      voucher_code: string;
      status: string;
      total_amount: number;
      created_by: { employee_id: number; name: string };
   };
}

export interface PaymentVoucherFilters {
   page?: number;
   limit?: number;
   search?: string;
   status?: string | string[];
   expense_type_id?: number;
   from_account_id?: number;
   to_account_id?: number;
   date_from?: string;
   date_to?: string;
   amount_from?: number;
   amount_to?: number;
   sort_by?: string;
   sort_order?: string;
}

export interface PaymentVoucherStats {
   total: number;
   total_amount: number;
   by_status: Record<string, { count: number; total_amount: number }>;
   by_expense_type: Array<{
      expense_type_id: number;
      expense_type_name: string;
      count: number;
      total_amount: number;
   }>;
}

export interface PaymentVoucherStatsResponse {
   success: boolean;
   data: PaymentVoucherStats;
}

export interface PaymentVoucherNavigation {
   previous?: {
      voucher_id: number;
      voucher_code: string;
   };
   next?: {
      voucher_id: number;
      voucher_code: string;
   };
}

export interface PaymentVoucherNavigationResponse {
   success: boolean;
   data: PaymentVoucherNavigation;
}

export interface LinkInvoicePaymentRequest {
   invoice_id: number;
   payment_amount?: number;
}

export interface LinkInvoicePaymentResponse {
   success: boolean;
   message: string;
   data: {
      voucher_id: number;
      invoice_id: number;
      payment_amount: number;
   };
}

// Service functions
export const paymentVoucherService = {
   list: async (
      filters?: PaymentVoucherFilters
   ): Promise<PaymentVoucherListResponse> => {
      const response = await apiClient.get(endPoints.vouchers.payments.list, {
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

   getById: async (voucherId: number): Promise<PaymentVoucherDetail> => {
      const response = await apiClient.get(
         endPoints.vouchers.payments.getById(voucherId)
      );
      return response.data.data;
   },

   create: async (
      data: CreatePaymentVoucherRequest
   ): Promise<CreatePaymentVoucherResponse> => {
      const response = await apiClient.post(
         endPoints.vouchers.payments.create,
         data
      );
      return response.data;
   },

   update: async (
      voucherId: number,
      data: UpdatePaymentVoucherRequest
   ): Promise<PaymentVoucherDetailResponse> => {
      const response = await apiClient.put(
         endPoints.vouchers.payments.update(voucherId),
         data
      );
      return response.data;
   },

   delete: async (voucherId: number): Promise<{ success: boolean }> => {
      const response = await apiClient.delete(
         endPoints.vouchers.payments.delete(voucherId)
      );
      return response.data;
   },

   approve: async (
      voucherId: number
   ): Promise<PaymentVoucherDetailResponse> => {
      const response = await apiClient.post(
         endPoints.vouchers.payments.approve(voucherId)
      );
      return response.data;
   },

   getStats: async (filters?: {
      date_from?: string;
      date_to?: string;
   }): Promise<PaymentVoucherStats> => {
      const response = await apiClient.get(endPoints.vouchers.payments.stats, {
         params: filters,
      });
      return response.data.data;
   },

   getNavigation: async (
      voucherId: number
   ): Promise<PaymentVoucherNavigation> => {
      const response = await apiClient.get(
         endPoints.vouchers.payments.navigation(voucherId)
      );
      return response.data.data;
   },

   linkInvoice: async (
      voucherId: number,
      data: LinkInvoicePaymentRequest
   ): Promise<LinkInvoicePaymentResponse> => {
      const response = await apiClient.post(
         endPoints.vouchers.payments.linkInvoice(voucherId),
         data
      );
      return response.data;
   },

   unlinkInvoice: async (
      voucherId: number,
      invoiceId: number
   ): Promise<{ success: boolean; message: string }> => {
      const response = await apiClient.delete(
         endPoints.vouchers.payments.unlinkInvoice(voucherId, invoiceId)
      );
      return response.data;
   },
};
