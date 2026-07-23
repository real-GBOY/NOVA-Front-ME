/** @format */

import apiClient from "@/config/axios";
import endPoints from "@/config/endPoints";

// Types
// Backend uses: Draft, Pending, Partially_Paid, Fully_Paid, Cancelled, Refunded, Void
export type InvoiceStatus =
   | "Draft"
   | "Pending"
   | "Partially_Paid"
   | "Fully_Paid"
   | "Cancelled"
   | "Refunded"
   | "Void";

export interface InvoiceItem {
   id?: string | number;
   item_id?: string | number;
   invoice_id?: string | number;
   service_id?: string | number;
   service_name?: string;
   service_code?: string | null;
   application_number?: string;
   applicant_name?: string;
   description?: string;
   quantity: number;
   unit_price: number;
   government_fee?: number;
   service_charge?: number;
   fine_amount?: number;
   discount_type?: "Percentage" | "Fixed";
   discount_value?: number;
   discount_amount?: number;
   discount?: number; // Legacy field
   tax_rate?: number;
   tax_amount?: number;
   tax?: number; // Legacy field
   subtotal?: number;
   total: number;
   assigned_employee?: {
      employee_id: string | number;
      name?: string;
   } | null;
   assigned_employee_id?: string | number | null;
   notes?: string | null;
   sort_order?: number;
   created_at?: string;
   updated_at?: string;
}

export interface Invoice {
   invoice_id: string | number;
   invoice_code: string;
   token?: string;
   invoice_type?: string;
   invoice_date: string;
   due_date?: string;
   customer: {
      customer_id: string | number;
      customer_name: string;
      customer_trn?: string;
      customer_contact?: string;
      customer_email?: string;
      customer_address?: string;
      contact_number?: string;
      email?: string;
      trn?: string;
   };
   agent: {
      agent_id: string | number;
      agent_name?: string;
   };
   status: InvoiceStatus;
   subtotal?: number;
   total_discount?: number;
   discount?: number; // Legacy field
   total_tax?: number;
   tax?: number; // Legacy field
   total_amount: number;
   amount_paid: number;
   balance_due: number;
   payment_type?: string | null;
   currency?: string;
   remarks?: string;
   internal_notes?: string;
   notes?: string; // Legacy field
   items?: InvoiceItem[];
   created_by?: {
      employee_id: string | number;
      name?: string;
      first_name?: string;
      last_name?: string;
   };
   updated_by?: {
      employee_id: string | number;
      name?: string;
      first_name?: string;
      last_name?: string;
   };
   history?: Array<{
      history_id: string | number;
      action: string;
      description: string;
      changes?: any;
      item_id?: string | number | null;
      payment_id?: string | number | null;
      performed_by?: {
         employee_id: string | number;
         name?: string;
      };
      performed_at: string;
      created_at?: string;
   }>;
   payments?: any[];
   created_at: string;
   updated_at: string;
   // Legacy fields for backward compatibility (computed from new structure)
   id?: string | number;
   invoice_number?: string;
   customer_id?: string | number;
   customer_name?: string;
   agent_id?: string | number;
   agent_name?: string;
   issue_date?: string;
   total?: number;
   paid_amount?: number;
   remaining_amount?: number;
}

export interface InvoiceListResponse {
   success: boolean;
   data: Invoice[];
   pagination: {
      total: number;
      page: number;
      limit: number;
      total_pages: number;
   };
}

export interface InvoiceStats {
   total_invoices: number;
   total_amount: number;
   total_paid: number;
   total_due: number;
   by_status: Partial<Record<InvoiceStatus, number>>;
}

export interface CreateInvoiceRequest {
   token?: string;
   invoice_type?: string; // e.g., "Tax_Invoice"
   invoice_date: string; // Format: "YYYY-MM-DD"
   due_date: string; // Format: "YYYY-MM-DD"
   customer_id: string | number;
   customer_name?: string;
   customer_trn?: string;
   customer_contact?: string;
   customer_address?: string;
   agent_id?: string | number;
   remarks?: string; // Customer-facing notes
   internal_notes?: string; // Internal notes
   status?: InvoiceStatus; // Default: "Draft"
   items: Array<{
      service_id?: string | number;
      service_code?: string;
      service_name: string;
      service_name_en?: string;
      service_name_ar?: string;
      description_en?: string;
      description_ar?: string;
      application_number?: string;
      applicant_name?: string;
      unit_price: number;
      government_fee?: number;
      service_charge?: number;
      fine_amount?: number;
      quantity: number;
      discount_type?: "Percentage" | "Fixed";
      discount_value?: number;
      tax_rate?: number;
      assigned_employee_id?: string | number;
   }>;
}

export interface UpdateInvoiceRequest {
   token?: string;
   customer_id?: string | number;
   customer_name?: string;
   agent_id?: string | number;
   issue_date?: string;
   due_date?: string;
   items?: Omit<InvoiceItem, "id" | "total">[];
   discount?: number;
   tax?: number;
   remarks?: string;
   internal_notes?: string;
   currency?: string;
}

export interface ChangeInvoiceStatusRequest {
   status: InvoiceStatus; // Draft, Pending, Partially_Paid, Fully_Paid, Cancelled, Refunded
}

export interface VoidInvoiceRequest {
   note: string;
}

export interface CreateInvoiceItemRequest {
   service_id?: string | number;
   service_name: string;
   application_number?: string;
   applicant_name?: string;
   description?: string;
   quantity: number;
   customer_email?: string;
   unit_price: number;
   government_fee?: number;
   service_charge?: number;
   fine_amount?: number;
   discount_type?: "Percentage" | "Fixed";
   discount_value?: number;
   tax_rate?: number;
   tax?: number;
}

export interface UpdateInvoiceItemRequest {
   service_id?: string | number;
   service_name?: string;
   customer_trn?: string;
   customer_contact?: string;
   customer_email?: string;
   customer_address?: string;
   description?: string;
   quantity?: number;
   unit_price?: number;
   government_fee?: number;
   service_charge?: number;
   fine_amount?: number;
   discount?: number;
   tax_rate?: number;
   tax?: number;
}

export interface RecordPaymentRequest {
   amount: number;
   payment_date: string;
   payment_method?: string;
   account_id?: string | number;
   reference?: string;
   notes?: string;
}

export interface BulkRecordPaymentRequest {
   customer_id: string | number;
   invoice_ids: Array<string | number>;
   amount: number;
   payment_date?: string;
   payment_method?: string;
   account_id?: string | number;
   reference_number?: string;
   remarks?: string;
}

export interface BulkRecordPaymentResult {
   payments: Array<{
      invoice_id: number;
      payment_id: number;
      amount: number;
   }>;
   total_applied: number;
   remaining_amount: number;
}

export interface LookupItem {
   id: string | number;
   name: string;
   label?: string;
   subLabel?: string;
}

// Service functions
export const invoiceService = {
   // GET - Get invoice statistics
   getStats: async (filters?: {
      from_date?: string;
      to_date?: string;
      date_from?: string; // Alias for from_date
      date_to?: string; // Alias for to_date
      customer_id?: string | number;
      agent_id?: string | number;
   }): Promise<InvoiceStats> => {
      // Map date_from/date_to to from_date/to_date for backend
      const params: Record<string, any> = { ...filters };
      if (params.date_from) {
         params.from_date = params.date_from;
         delete params.date_from;
      }
      if (params.date_to) {
         params.to_date = params.date_to;
         delete params.date_to;
      }

      const response = await apiClient.get(endPoints.invoices.stats, {
         params,
      });
      // Backend returns { success: true, data: {...} } or just the stats object
      return response.data?.data || response.data;
   },

   // GET - List invoices
   list: async (filters?: {
      page?: number;
      limit?: number;
      search?: string;
      status?: string;
      customer_id?: string | number | Array<string | number>;
      agent_id?: string | number | Array<string | number>;
      from_date?: string; // Backend uses from_date, not date_from
      to_date?: string; // Backend uses to_date, not date_to
      date_from?: string; // Alias for from_date
      date_to?: string; // Alias for to_date
      sort_by?: string;
      sort_order?: "asc" | "desc";
   }): Promise<InvoiceListResponse> => {
      // Map date_from/date_to to from_date/to_date for backend
      const params: Record<string, any> = { ...filters };
      if (params.date_from) {
         params.from_date = params.date_from;
         delete params.date_from;
      }
      if (params.date_to) {
         params.to_date = params.date_to;
         delete params.date_to;
      }
      if (typeof params.limit === "number" && params.limit > 100) {
         params.limit = 100;
      }

      const response = await apiClient.get(endPoints.invoices.getAll, {
         params,
      });
      const debugTime =
         typeof window !== "undefined" &&
         (((window as typeof window & { __TIME_DEBUG__?: boolean })
            .__TIME_DEBUG__ === true) ||
            (typeof localStorage !== "undefined" &&
               localStorage.getItem("timeDebug") === "true"));
      if (debugTime) {
         const first = response.data?.data?.[0];
         console.log("[TimeDebug][invoices.list] timezone:", Intl.DateTimeFormat().resolvedOptions().timeZone);
         console.log("[TimeDebug][invoices.list] created_at raw:", first?.created_at);
         console.log(
            "[TimeDebug][invoices.list] created_at Date():",
            first?.created_at ? new Date(first.created_at).toString() : null
         );
      }
      // Backend returns { success: true, data: [...], pagination: {...} }
      // Transform response to add backward compatibility fields
      if (response.data?.data) {
         response.data.data = response.data.data.map((invoice: Invoice) => ({
            ...invoice,
            // Add legacy fields for backward compatibility
            id: invoice.invoice_id,
            invoice_number: invoice.invoice_code,
            customer_id: invoice.customer?.customer_id,
            customer_name: invoice.customer?.customer_name,
            agent_id: invoice.agent?.agent_id,
            agent_name: invoice.agent?.agent_name,
            issue_date: invoice.invoice_date,
            total: invoice.total_amount,
            paid_amount: invoice.amount_paid,
            remaining_amount: invoice.balance_due,
         }));
      }
      return response.data;
   },

   // GET - Get invoice by ID
   getById: async (
      id: string | number,
      options?: {
         include_items?: boolean;
         include_history?: boolean;
      }
   ): Promise<Invoice> => {
      const response = await apiClient.get(endPoints.invoices.getById(id), {
         params: options,
      });
      const debugTime =
         typeof window !== "undefined" &&
         (((window as typeof window & { __TIME_DEBUG__?: boolean })
            .__TIME_DEBUG__ === true) ||
            (typeof localStorage !== "undefined" &&
               localStorage.getItem("timeDebug") === "true"));
      if (debugTime) {
         const raw = response.data?.data || response.data;
         console.log("[TimeDebug][invoices.getById] timezone:", Intl.DateTimeFormat().resolvedOptions().timeZone);
         console.log("[TimeDebug][invoices.getById] created_at raw:", raw?.created_at);
         console.log(
            "[TimeDebug][invoices.getById] created_at Date():",
            raw?.created_at ? new Date(raw.created_at).toString() : null
         );
      }
      // Backend returns { success: true, data: {...} } or just the invoice object
      const invoice = response.data?.data || response.data;
      // Transform response to add backward compatibility fields
      if (invoice) {
         return {
            ...invoice,
            // Add legacy fields for backward compatibility
            id: invoice.invoice_id,
            invoice_number: invoice.invoice_code,
            customer_id: invoice.customer?.customer_id,
            customer_name: invoice.customer?.customer_name,
            agent_id: invoice.agent?.agent_id,
            agent_name: invoice.agent?.agent_name,
            issue_date: invoice.invoice_date,
            total: invoice.total_amount,
            paid_amount: invoice.amount_paid,
            remaining_amount: invoice.balance_due,
         };
      }
      return invoice;
   },

   // POST - Create invoice
   create: async (payload: CreateInvoiceRequest): Promise<Invoice> => {
      const response = await apiClient.post(endPoints.invoices.create, payload);
      // Backend returns { success: true, data: {...} } or just the invoice object
      const invoice = response.data?.data || response.data;
      // Transform response to add backward compatibility fields
      if (invoice) {
         return {
            ...invoice,
            // Add legacy fields for backward compatibility
            id: invoice.invoice_id,
            invoice_number: invoice.invoice_code,
            customer_id: invoice.customer?.customer_id,
            customer_name: invoice.customer?.customer_name,
            agent_id: invoice.agent?.agent_id,
            agent_name: invoice.agent?.agent_name,
            issue_date: invoice.invoice_date,
            total: invoice.total_amount,
            paid_amount: invoice.amount_paid,
            remaining_amount: invoice.balance_due,
         };
      }
      return invoice;
   },

   // PUT - Update invoice
   update: async (
      id: string | number,
      payload: UpdateInvoiceRequest
   ): Promise<Invoice> => {
      const response = await apiClient.put(
         endPoints.invoices.update(id),
         payload
      );
      // Backend returns { success: true, data: {...} } or just the invoice object
      const invoice = response.data?.data || response.data;
      // Transform response to add backward compatibility fields
      if (invoice) {
         return {
            ...invoice,
            // Add legacy fields for backward compatibility
            id: invoice.invoice_id,
            invoice_number: invoice.invoice_code,
            customer_id: invoice.customer?.customer_id,
            customer_name: invoice.customer?.customer_name,
            agent_id: invoice.agent?.agent_id,
            agent_name: invoice.agent?.agent_name,
            issue_date: invoice.invoice_date,
            total: invoice.total_amount,
            paid_amount: invoice.amount_paid,
            remaining_amount: invoice.balance_due,
         };
      }
      return invoice;
   },

   // DELETE - Delete invoice
   delete: async (id: string | number): Promise<void> => {
      await apiClient.delete(endPoints.invoices.delete(id));
   },

   // PUT - Change invoice status
   changeStatus: async (
      id: string | number,
      payload: ChangeInvoiceStatusRequest
   ): Promise<Invoice> => {
      const response = await apiClient.put(
         endPoints.invoices.changeStatus(id),
         payload
      );
      // Backend returns { success: true, data: {...} } or just the invoice object
      const invoice = response.data?.data || response.data;
      // Transform response to add backward compatibility fields
      if (invoice) {
         return {
            ...invoice,
            // Add legacy fields for backward compatibility
            id: invoice.invoice_id,
            invoice_number: invoice.invoice_code,
            customer_id: invoice.customer?.customer_id,
            customer_name: invoice.customer?.customer_name,
            agent_id: invoice.agent?.agent_id,
            agent_name: invoice.agent?.agent_name,
            issue_date: invoice.invoice_date,
            total: invoice.total_amount,
            paid_amount: invoice.amount_paid,
            remaining_amount: invoice.balance_due,
         };
      }
      return invoice;
   },

   // PUT - Void invoice
   makeVoid: async (
      id: string | number,
      payload: VoidInvoiceRequest
   ): Promise<Invoice> => {
      const response = await apiClient.put(
         endPoints.invoices.makeVoid(id),
         payload
      );
      const invoice = response.data?.data || response.data;
      if (invoice) {
         return {
            ...invoice,
            id: invoice.invoice_id,
            invoice_number: invoice.invoice_code,
            customer_id: invoice.customer?.customer_id,
            customer_name: invoice.customer?.customer_name,
            agent_id: invoice.agent?.agent_id,
            agent_name: invoice.agent?.agent_name,
            issue_date: invoice.invoice_date,
            total: invoice.total_amount,
            paid_amount: invoice.amount_paid,
            remaining_amount: invoice.balance_due,
         };
      }
      return invoice;
   },

   // POST - Add item to invoice
   addItem: async (
      invoiceId: string | number,
      payload: CreateInvoiceItemRequest
   ): Promise<InvoiceItem> => {
      const response = await apiClient.post(
         endPoints.invoices.addItem(invoiceId),
         payload
      );
      return response.data;
   },

   // PUT - Update invoice item
   updateItem: async (
      invoiceId: string | number,
      itemId: string | number,
      payload: UpdateInvoiceItemRequest
   ): Promise<InvoiceItem> => {
      const response = await apiClient.put(
         endPoints.invoices.updateItem(invoiceId, itemId),
         payload
      );
      return response.data;
   },

   // DELETE - Delete invoice item
   deleteItem: async (
      invoiceId: string | number,
      itemId: string | number
   ): Promise<void> => {
      await apiClient.delete(endPoints.invoices.deleteItem(invoiceId, itemId));
   },

   // POST - Record payment
   recordPayment: async (
      invoiceId: string | number,
      payload: RecordPaymentRequest
   ): Promise<void> => {
      await apiClient.post(
         endPoints.invoices.recordPayment(invoiceId),
         payload
      );
   },

   // POST - Bulk record payments
   bulkRecordPayments: async (
      payload: BulkRecordPaymentRequest
   ): Promise<BulkRecordPaymentResult> => {
      const response = await apiClient.post(
         endPoints.invoices.bulkPayments,
         payload
      );
      return response.data?.data || response.data;
   },

   // GET - Get invoice history
   getHistory: async (id: string | number): Promise<any[]> => {
      const response = await apiClient.get(endPoints.invoices.getHistory(id));
      // Backend returns { success: true, data: [...] } or just the array
      return response.data?.data || response.data || [];
   },

   // GET - Lookup customers
   lookupCustomers: async (search?: string): Promise<LookupItem[]> => {
      const response = await apiClient.get(endPoints.invoices.lookupCustomers, {
         params: { search },
      });
      // Backend returns { success: true, data: [...] } or just the array
      return response.data?.data || response.data || [];
   },

   // GET - Lookup agents
   lookupAgents: async (search?: string): Promise<LookupItem[]> => {
      const response = await apiClient.get(endPoints.invoices.lookupAgents, {
         params: { search },
      });
      // Backend returns { success: true, data: [...] } or just the array
      return response.data?.data || response.data || [];
   },

   // GET - Lookup services
   lookupServices: async (search?: string): Promise<LookupItem[]> => {
      const response = await apiClient.get(endPoints.invoices.lookupServices, {
         params: { search },
      });
      // Backend returns { success: true, data: [...] } or just the array
      return response.data?.data || response.data || [];
   },

   // GET - Lookup employees
   lookupEmployees: async (search?: string): Promise<LookupItem[]> => {
      const response = await apiClient.get(endPoints.invoices.lookupEmployees, {
         params: { search },
      });
      // Backend returns { success: true, data: [...] } or just the array
      return response.data?.data || response.data || [];
   },
};
