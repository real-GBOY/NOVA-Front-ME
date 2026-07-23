import { format } from "date-fns";
import apiClient from "@/config/axios";
import endPoints from "@/config/endPoints";

export interface PayrollItem {
   id: number;
   payrollId: number;
   itemName: string;
   componentType: string;
   amount: number;
   effectiveDate: string;
   notes?: string;
   reason?: string;
   sourceType?: string;
   isManual?: boolean;
}

export interface Payroll {
   id: number;
   employeeId: number;
   periodStart: string;
   periodEnd: string;
   cycleType: string;
   notes?: string;
   items?: PayrollItem[];
}

interface PayrollItemsPagination {
   page: number;
   limit: number;
   total: number;
   totalPages: number;
}

const unwrapData = <T>(payload: T): T => {
   let value: unknown = payload;
   while (value && typeof value === "object" && "data" in value) {
      value = (value as { data: unknown }).data;
   }
   return value as T;
};

const normalizePayroll = (raw: Record<string, unknown> | null) => {
   if (!raw) return null;
   const payrollId =
      (raw as { payroll_id?: unknown }).payroll_id ??
      (raw as { id?: unknown }).id ??
      (raw as { payrollId?: unknown }).payrollId;
   return {
      ...raw,
      id: payrollId,
      payrollId,
   };
};

const normalizeItem = (raw: Record<string, unknown>): PayrollItem => {
   return {
      id: (raw as { item_id?: number; id?: number }).item_id ?? (raw as { id?: number }).id ?? 0,
      payrollId:
         (raw as { payroll_id?: number; payrollId?: number }).payroll_id ??
         (raw as { payrollId?: number }).payrollId ??
         0,
      itemName:
         (raw as { item_name?: string; itemName?: string }).item_name ??
         (raw as { itemName?: string }).itemName ??
         "",
      componentType:
         (raw as { component_type?: string; componentType?: string }).component_type ??
         (raw as { componentType?: string }).componentType ??
         "",
      amount: Number((raw as { amount?: unknown }).amount ?? 0),
      effectiveDate:
         (raw as { effective_date?: string; effectiveDate?: string }).effective_date ??
         (raw as { effectiveDate?: string }).effectiveDate ??
         "",
      notes: (raw as { notes?: string }).notes,
      sourceType:
         (raw as { source_type?: string; sourceType?: string }).source_type ??
         (raw as { sourceType?: string }).sourceType,
      isManual:
         (raw as { is_manual?: boolean; isManual?: boolean }).is_manual ??
         (raw as { isManual?: boolean }).isManual,
   };
};

export const getEmployeePayrolls = async (
   employeeId: string,
   page = 1,
   limit = 10,
   additionalParams?: Record<string, unknown>
) => {
   const response = await apiClient.get(endPoints.payrolls.getForEmployee(employeeId), {
      params: { page, limit, ...additionalParams },
   });
   return response.data;
};

// Dashboard payroll type with employee info included
export interface DashboardPayroll {
   payroll_id: string;
   parent_payroll_id: string | null;
   employee_id: number;
   period_start: string;
   period_end: string;
   cycle_type: string;
   run_type: string;
   pay_group: string | null;
   status: string;
   currency: string;
   base_salary: string;
   gross_total: string;
   deduction_total: string;
   net_pay: string;
   employer_cost: string;
   payable_account_id: number | null;
   warnings: Array<{ type: string; message: string }>;
   notes: string;
   created_by: number;
   generated_at: string;
   submitted_by: number | null;
   approved_by: number | null;
   finalized_at: string | null;
   created_at: string;
   updated_at: string;
   Employee: {
      employee_id: number;
      first_name: string;
      last_name: string;
      member_id: string;
      profilePicture?: {
         storage_path: string;
      } | null;
      JobTitle?: {
         title: string;
      } | null;
   };
}

export interface GetAllPayrollsParams {
   page?: number;
   limit?: number;
   search?: string;
   status?: string;
   cycleType?: string;
   runType?: string;
   employeeId?: number;
   fromDate?: string;
   toDate?: string;
   sortBy?: 'period_start' | 'period_end' | 'created_at';
   sortOrder?: 'asc' | 'desc';
}

export interface GetAllPayrollsResponse {
   success: boolean;
   data: DashboardPayroll[];
   pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
   };
}

export const getAllPayrolls = async (params: GetAllPayrollsParams = {}): Promise<GetAllPayrollsResponse> => {
   const response = await apiClient.get(endPoints.payrolls.getAll, { params });
   return response.data;
};

export const getPayrollItems = async (payrollId: string, additionalParams?: any) => {
   const response = await apiClient.get(endPoints.payrolls.getItems(payrollId), {
      params: additionalParams,
   });
   return response.data;
};

export const createPayroll = async (employeeId: string, payload: {
   periodStart: string;
   periodEnd: string;
   cycleType: string;
   notes?: string;
}) => {
   const response = await apiClient.post(endPoints.payrolls.create, {
      employeeId: Number(employeeId),
      ...payload,
   });
   return response.data;
};

// Function to get "current" payroll items for the profile view
export const getEmployeePayrollStructure = async (employeeId: string, params?: any) => {
   try {
      const {
         search,
         sort_by,
         sort_order,
         page = 1,
         limit = 10,
         ...payrollFilters
      } = params || {};
      const payrollsRes = await getEmployeePayrolls(employeeId, 1, 1, payrollFilters);
      const payrolls = unwrapData(payrollsRes);
      const payrollList = Array.isArray(payrolls)
         ? payrolls
         : Array.isArray(payrolls?.data)
            ? payrolls.data
            : [];
      
      let currentPayroll = null;

      if (payrollList.length > 0) {
         currentPayroll = normalizePayroll(unwrapData(payrollList[0]));
      } else {
         // Only auto-create if no filters are applied (viewing current month)
         // If filtering and no payroll found, return empty
         if (params && Object.keys(params).length > 0) {
            return { payrollId: null, payroll: null, items: [] };
         }
         
         // No payrolls found and no filters, create default payroll for current cycle
         // Payroll cycle: 25th of previous month -> 24th of current month
         const now = new Date();
         const periodStart = format(
            new Date(now.getFullYear(), now.getMonth() - 1, 25),
            "yyyy-MM-dd"
         );
         const periodEnd = format(
            new Date(now.getFullYear(), now.getMonth(), 24),
            "yyyy-MM-dd"
         );
         
         const newPayroll = normalizePayroll(unwrapData(await createPayroll(employeeId, {
            periodStart,
            periodEnd,
            cycleType: "Monthly",
            notes: `Auto-generated payroll for ${format(now, "MMMM yyyy")}`,
         })));
         currentPayroll = newPayroll;
      }

      if (currentPayroll?.id) {
         const itemParams: Record<string, unknown> = {};
         itemParams.page = page;
         itemParams.limit = limit;
         if (search) itemParams.search = search;
         if (sort_by) itemParams.sort_by = sort_by;
         if (sort_order) itemParams.sort_order = sort_order;

         const itemsRes = await getPayrollItems(
            String(currentPayroll.id),
            itemParams
         );
         const itemsPayload = (itemsRes as any)?.data ?? itemsRes;
         const rawItems = Array.isArray(itemsPayload?.data)
            ? itemsPayload.data
            : Array.isArray(itemsPayload)
            ? itemsPayload
            : [];
         const rawPagination = (itemsPayload as any)?.pagination || (itemsRes as any)?.pagination;
         const totalItems = Number(rawPagination?.total ?? rawItems.length) || 0;
         const pageLimit = Number(rawPagination?.limit ?? limit ?? 1) || 1;
         const pagination: PayrollItemsPagination = {
            page: Number(rawPagination?.page ?? page),
            limit: Number(rawPagination?.limit ?? limit),
            total: Number(rawPagination?.total ?? rawItems.length),
            totalPages:
               Number(
                  rawPagination?.totalPages ??
                     rawPagination?.total_pages ??
                     Math.max(1, Math.ceil(totalItems / pageLimit))
               ) || 1,
         };
         const items = Array.isArray(rawItems) ? rawItems.map(normalizeItem) : [];
         return {
            payrollId: currentPayroll.id,
            payroll: currentPayroll,
            items,
            pagination,
         };
      }
      
      // Should not be reached if createPayroll is successful
      return {
         payrollId: null,
         payroll: null,
         items: [],
         pagination: {
            page: Number(page),
            limit: Number(limit),
            total: 0,
            totalPages: 1,
         },
      };

   } catch (error) {
      console.error("Failed to fetch or create payroll structure", error);
      // Return null payrollId to indicate no payroll is available
      return {
         payrollId: null,
         payroll: null,
         items: [],
         pagination: {
            page: Number(params?.page ?? 1),
            limit: Number(params?.limit ?? 10),
            total: 0,
            totalPages: 1,
         },
      };
   }
};

export const createPayrollItem = async (payrollId: string, data: Partial<PayrollItem>) => {
   const response = await apiClient.post(endPoints.payrolls.createItem(payrollId), data);
   return response.data;
};

export const updatePayrollItem = async (payrollId: string, itemId: number, data: Partial<PayrollItem>) => {
   const response = await apiClient.put(endPoints.payrolls.updateItem(payrollId, itemId), data);
   return response.data;
};

export const deletePayrollItem = async (payrollId: string, itemId: number) => {
   const response = await apiClient.delete(endPoints.payrolls.deleteItem(payrollId, itemId));
   return response.data;
};

export const approvePayroll = async (payrollId: string | number): Promise<{ success: boolean; data: DashboardPayroll }> => {
   const response = await apiClient.post(endPoints.payrolls.approve(payrollId));
   return response.data;
};

export interface CreateVoucherPayload {
   financialAccountId: number;
   valueDate: string;
   reference?: string;
   notes?: string;
}

export interface CreateVoucherResponse {
   success: boolean;
   data: {
      voucher_id: number;
      payroll_id: string;
      amount: string;
      status: string;
   };
}

export const createPayrollVoucher = async (
   payrollId: string | number,
   payload: CreateVoucherPayload
): Promise<CreateVoucherResponse> => {
   const response = await apiClient.post(
      endPoints.payrolls.createVoucher(payrollId),
      payload
   );
   return response.data;
};
