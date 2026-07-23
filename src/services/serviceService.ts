/** @format */

import apiClient from "../config/axios";
import endPoints from "../config/endPoints";

// Types
export interface Service {
   id: string | number;
   code?: string;
   nameEn: string;
   nameAr: string;
   departmentId: string | number;
   departmentNameEn?: string;
   departmentNameAr?: string;
   categoryId: string | number;
   categoryNameEn?: string;
   categoryNameAr?: string;
   serviceCharge: number;
   govFees: number;
   vat: number;
   vatPercentage?: number;
   totalAmount?: number;
   status: "active" | "inactive";
   created_at?: string;
   updated_at?: string;
}

export interface CreateServiceRequest {
   nameEn: string;
   nameAr: string;
   departmentId: string | number;
   categoryId: string | number;
   serviceCharge: number;
   govFees: number;
   vatPercentage?: number;
   vat?: number;
   status: "active" | "inactive";
}

export interface UpdateServiceRequest {
   nameEn?: string;
   nameAr?: string;
   departmentId?: string | number;
   categoryId?: string | number;
   serviceCharge?: number;
   govFees?: number;
   vatPercentage?: number;
   vat?: number;
   status?: "active" | "inactive";
}

// Backend payload types (snake_case)
interface CreateServicePayload {
   service_name_en: string;
   service_name_ar: string;
   department_id: string | number;
   category_id: string | number;
   service_charge: number;
   gov_fees: number;
   vat_percentage: number;
   status: "Active" | "Inactive";
}

interface UpdateServicePayload {
   service_name_en?: string;
   service_name_ar?: string;
   department_id?: string | number;
   category_id?: string | number;
   service_charge?: number;
   gov_fees?: number;
   vat_percentage?: number;
   status?: "Active" | "Inactive";
}

export interface ServiceListResponse {
   data: Service[];
   pagination: {
      page: number;
      limit: number;
      total: number;
      total_pages: number;
   };
}

// Backend response type (snake_case)
interface ServiceBackendResponse {
   service_id: number;
   service_code?: string;
   service_name_en: string;
   service_name_ar: string;
   department_id: number;
   category_id: number;
   department_name_en?: string;
   department_name_ar?: string;
   category_name_en?: string;
   category_name_ar?: string;
   department?: {
      department_id: number;
      department_code?: string;
      department_name_en?: string;
      department_name_ar?: string;
   };
   category?: {
      category_id: number;
      category_code?: string;
      category_name_en?: string;
      category_name_ar?: string;
   };
   service_charge: number;
   gov_fees: number;
   vat_percentage?: number;
   vat_amount?: number;
   total_amount?: number;
   status: "Active" | "Inactive";
   created_at?: string;
   updated_at?: string;
}

// Transform backend response to frontend format
const transformService = (svc: ServiceBackendResponse): Service => ({
   id: svc.service_id,
   code: svc.service_code || "",
   nameEn: svc.service_name_en,
   nameAr: svc.service_name_ar,
   departmentId: svc.department_id,
   categoryId: svc.category_id,
   departmentNameEn:
      svc.department_name_en || svc.department?.department_name_en || "",
   departmentNameAr:
      svc.department_name_ar || svc.department?.department_name_ar || "",
   categoryNameEn:
      svc.category_name_en || svc.category?.category_name_en || "",
   categoryNameAr:
      svc.category_name_ar || svc.category?.category_name_ar || "",
   serviceCharge: svc.service_charge,
   govFees: svc.gov_fees,
   vat: svc.vat_amount ?? svc.vat_percentage ?? 0,
   vatPercentage: svc.vat_percentage ?? svc.vat_amount ?? 0,
   totalAmount: svc.total_amount,
   status: (svc.status || "Inactive").toLowerCase() as "active" | "inactive",
   created_at: svc.created_at,
   updated_at: svc.updated_at,
});

const normalizeStatusValue = (value: string) => {
   const normalized = value.trim().toLowerCase();
   if (normalized === "active") return "Active";
   if (normalized === "inactive") return "Inactive";
   return value;
};

// Service functions
export const serviceService = {
   // GET - List services
   list: async (filters?: {
      page?: number;
      limit?: number;
      search?: string;
      status?: string | string[];
      category_ids?: number[] | string[];
      sort_by?: string;
      sort_order?: "asc" | "desc";
   }): Promise<ServiceListResponse> => {
      const normalizedFilters = { ...(filters || {}) } as typeof filters;
      if (normalizedFilters?.status) {
         normalizedFilters.status = Array.isArray(normalizedFilters.status)
            ? normalizedFilters.status.map(normalizeStatusValue)
            : normalizeStatusValue(normalizedFilters.status);
      }

      const response = await apiClient.get(endPoints.services.getAll, {
         params: normalizedFilters,
      });

      const backendData = response.data;
      const pagination = backendData.pagination || { page: 1, limit: 10, total: 0 };
      
      return {
         data: (backendData.data || []).map(transformService),
         pagination: {
            ...pagination,
            page: Number(pagination.page),
            limit: Number(pagination.limit),
            total: pagination.total,
            total_pages: Math.ceil((pagination.total || 0) / (pagination.limit || 10))
         },
      };
   },

   // GET - Get service by ID
   getById: async (id: string | number): Promise<Service> => {
      const response = await apiClient.get(endPoints.services.getById(id));
      return transformService(response.data);
   },

   // POST - Create service
   create: async (payload: CreateServiceRequest): Promise<Service> => {
      // Transform to snake_case for API
      const vatValue =
         payload.vatPercentage ??
         payload.vat ??
         0;

      const apiPayload: CreateServicePayload = {
         service_name_en: payload.nameEn,
         service_name_ar: payload.nameAr,
         department_id: payload.departmentId,
         category_id: payload.categoryId,
         service_charge: payload.serviceCharge,
         gov_fees: payload.govFees,
         vat_percentage: vatValue,
         status: payload.status === "active" ? "Active" : "Inactive",
      };

      const response = await apiClient.post(
         endPoints.services.create,
         apiPayload
      );
      return transformService(response.data);
   },

   // PUT - Update service
   update: async (
      id: string | number,
      payload: UpdateServiceRequest
   ): Promise<Service> => {
      // Transform to snake_case for API
      const apiPayload: UpdateServicePayload = {};
      if (payload.nameEn !== undefined)
         apiPayload.service_name_en = payload.nameEn;
      if (payload.nameAr !== undefined)
         apiPayload.service_name_ar = payload.nameAr;
      if (payload.departmentId !== undefined)
         apiPayload.department_id = payload.departmentId;
      if (payload.categoryId !== undefined)
         apiPayload.category_id = payload.categoryId;
      if (payload.serviceCharge !== undefined)
         apiPayload.service_charge = payload.serviceCharge;
      if (payload.govFees !== undefined) apiPayload.gov_fees = payload.govFees;
      if (payload.vatPercentage !== undefined || payload.vat !== undefined) {
         apiPayload.vat_percentage =
            payload.vatPercentage ?? payload.vat ?? 0;
      }
      if (payload.status !== undefined)
         apiPayload.status =
            payload.status === "active" ? "Active" : "Inactive";

      const response = await apiClient.put(
         endPoints.services.update(id),
         apiPayload
      );
      return transformService(response.data);
   },

   // DELETE - Delete service
   delete: async (id: string | number): Promise<void> => {
      await apiClient.delete(endPoints.services.delete(id));
   },
};
