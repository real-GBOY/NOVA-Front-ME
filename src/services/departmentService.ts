/** @format */

import apiClient from "../config/axios";
import endPoints from "../config/endPoints";

// Types
export interface Department {
   id: string | number;
   code: string;
   nameEn: string;
   nameAr: string;
   status: "active" | "inactive";
   created_at?: string;
   updated_at?: string;
   categoriesCount?: number;
   servicesCount?: number;
}

export interface CreateDepartmentRequest {
   nameEn: string;
   nameAr: string;
   status: "active" | "inactive";
}

export interface UpdateDepartmentRequest {
   nameEn?: string;
   nameAr?: string;
   status?: "active" | "inactive";
}

// Backend payload types (snake_case)
interface CreateDepartmentPayload {
   department_name_en: string;
   department_name_ar: string;
   status: "Active" | "Inactive";
}

interface UpdateDepartmentPayload {
   department_name_en?: string;
   department_name_ar?: string;
   status?: "Active" | "Inactive";
}

export interface DepartmentListResponse {
   data: Department[];
   pagination: {
      page: number;
      limit: number;
      total: number;
      total_pages: number;
   };
}

// Backend response type (snake_case)
interface DepartmentBackendResponse {
   department_id: number;
   department_code: string;
   department_name_en: string;
   department_name_ar: string;
   status: "Active" | "Inactive";
   created_at?: string;
   updated_at?: string;
   categories_count?: number;
   services_count?: number;
   description_en?: string | null;
   description_ar?: string | null;
}

// Transform backend response to frontend format
const transformDepartment = (dept: DepartmentBackendResponse): Department => ({
   id: dept.department_id,
   code: dept.department_code,
   nameEn: dept.department_name_en,
   nameAr: dept.department_name_ar,
   status: dept.status
      ? (dept.status.toLowerCase() as "active" | "inactive")
      : "inactive",
   created_at: dept.created_at,
   updated_at: dept.updated_at,
   categoriesCount: dept.categories_count,
   servicesCount: dept.services_count,
});

const toApiStatus = (status: string): string => {
   const normalized = status.trim().toLowerCase();
   if (normalized === "active") return "Active";
   if (normalized === "inactive") return "Inactive";
   return status;
};

// Service functions
export const departmentService = {
   // GET - List departments
   list: async (filters?: {
      page?: number;
      limit?: number;
      search?: string;
      status?: string | string[];
      sort_by?: string;
      sort_order?: "asc" | "desc";
   }): Promise<DepartmentListResponse> => {
      const params = filters
         ? {
              ...filters,
              status: Array.isArray(filters.status)
                 ? filters.status.map(toApiStatus)
                 : filters.status
                   ? toApiStatus(filters.status)
                   : filters.status,
           }
         : undefined;

      const response = await apiClient.get(endPoints.departments.getAll, {
         params,
      });

      // Backend returns { success: true, data: [...], pagination: {...} }
      // If backend response structure differs, adjust here. 
      // Assuming similar structure to customers/agents but let's be careful.
      // The original code was:
      // const backendData = response.data;
      // return {
      //    data: backendData.data.map(transformDepartment),
      //    pagination: backendData.pagination,
      // };
      
      const backendData = response.data;
      const pagination = backendData.pagination || { page: 1, limit: 10, total: 0 };

      return {
         data: (backendData.data || []).map(transformDepartment),
         pagination: {
            ...pagination,
            page: Number(pagination.page),
            limit: Number(pagination.limit),
            total: pagination.total,
            total_pages: Math.ceil((pagination.total || 0) / (pagination.limit || 10))
         },
      };
   },

   // GET - Get department by ID
   getById: async (id: string | number): Promise<Department> => {
      const response = await apiClient.get(endPoints.departments.getById(id));
      return transformDepartment(response.data);
   },

   // POST - Create department
   create: async (payload: CreateDepartmentRequest): Promise<Department> => {
      // Transform to snake_case for API
      const apiPayload: CreateDepartmentPayload = {
         department_name_en: payload.nameEn,
         department_name_ar: payload.nameAr,
         status: payload.status === "active" ? "Active" : "Inactive",
      };

      const response = await apiClient.post(
         endPoints.departments.create,
         apiPayload
      );
      return transformDepartment(response.data);
   },

   // PUT - Update department
   update: async (
      id: string | number,
      payload: UpdateDepartmentRequest
   ): Promise<Department> => {
      // Transform to snake_case for API
      const apiPayload: UpdateDepartmentPayload = {};
      if (payload.nameEn !== undefined)
         apiPayload.department_name_en = payload.nameEn;
      if (payload.nameAr !== undefined)
         apiPayload.department_name_ar = payload.nameAr;
      if (payload.status !== undefined)
         apiPayload.status =
            payload.status === "active" ? "Active" : "Inactive";

      const response = await apiClient.put(
         endPoints.departments.update(id),
         apiPayload
      );
      return transformDepartment(response.data);
   },

   // DELETE - Delete department
   delete: async (id: string | number): Promise<void> => {
      await apiClient.delete(endPoints.departments.delete(id));
   },
};
