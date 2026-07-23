/** @format */

import apiClient from "@/config/axios";
import endPoints from "@/config/endPoints";
import type { InvoiceStatus } from "@/services/invoiceService";

export type DashboardOverviewSection =
   | "members"
   | "attendance"
   | "requests"
   | "invoices"
   | "vouchers";

export type DashboardOverviewFilters = {
   from_date?: string;
   to_date?: string;
   include?: DashboardOverviewSection[] | string;
};

export type DashboardMembersSummary = {
   total: number;
   active: number;
   inactive: number;
   overrides?: number;
};

export type DashboardAttendanceSummary = {
   range?: {
      from_date: string;
      to_date: string;
   };
   rate?: number;
   rate_percent?: number;
   breakdown?: {
      late_arrivals: number;
      day_offs: number;
      on_time: number;
   };
   totals?: {
      working_days: number;
      days_present: number;
      days_absent: number;
      late_arrivals: number;
   };
};

export type DashboardRequestsTypeSummary = {
   pending: number;
   approved: number;
   rejected: number;
};

export type DashboardRequestsSummary = {
   attendance?: DashboardRequestsTypeSummary;
   time_off?: DashboardRequestsTypeSummary;
   overtime?: DashboardRequestsTypeSummary;
   totals?: DashboardRequestsTypeSummary;
};

export type DashboardInvoicesSummary = {
   total_invoices: number;
   total_amount: number;
   total_paid: number;
   total_due: number;
   by_status?: Partial<Record<InvoiceStatus, number>>;
   status_share?: Partial<Record<InvoiceStatus, number>>;
};

export type DashboardVouchersSummary = {
   payment?: {
      total_count: number;
      draft_count: number;
      pending_count: number;
      approved_count: number;
      total_amount: number;
   };
   receipt?: {
      total_count: number;
      active_count: number;
      cancelled_count: number;
      total_amount: number;
   };
   days?: Array<{
      date: string;
      total_payment_amount: number;
      total_receipt_amount: number;
   }>;
};

export type DashboardOverviewData = {
   range?: {
      from_date: string;
      to_date: string;
   };
   members?: DashboardMembersSummary;
   attendance?: DashboardAttendanceSummary;
   requests?: DashboardRequestsSummary;
   invoices?: DashboardInvoicesSummary;
   vouchers?: DashboardVouchersSummary;
};

export type DashboardOverviewResponse = {
   data: DashboardOverviewData;
   meta?: {
      requested_sections?: string[];
      denied_sections?: string[];
      unknown_sections?: string[];
      range_label?: string;
   };
};

export const dashboardService = {
   getOverview: async (
      filters?: DashboardOverviewFilters
   ): Promise<DashboardOverviewResponse> => {
      const params: Record<string, string> = {};

      if (filters?.from_date) params.from_date = filters.from_date;
      if (filters?.to_date) params.to_date = filters.to_date;

      if (filters?.include) {
         params.include = Array.isArray(filters.include)
            ? filters.include.join(",")
            : filters.include;
      }

      const response = await apiClient.get(endPoints.dashboard.overview, {
         params,
      });

      return response.data;
   },
};
