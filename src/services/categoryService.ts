/** @format */

import apiClient from "../config/axios";
import endPoints from "../config/endPoints";

// Types
export interface Category {
   id: string | number;
   code: string;
   nameEn: string;
   nameAr: string;
   departmentId: string | number;
   departmentNameEn?: string;
   departmentNameAr?: string;
   status: "active" | "inactive";
   created_at?: string;
   updated_at?: string;
   servicesCount?: number;
}

export interface CreateCategoryRequest {
   nameEn: string;
   nameAr: string;
   departmentId: string | number;
   status: "active" | "inactive";
}

export interface UpdateCategoryRequest {
   nameEn?: string;
   nameAr?: string;
   departmentId?: string | number;
   status?: "active" | "inactive";
}

// Backend payload types (snake_case)
interface CreateCategoryPayload {
   category_name_en: string;
   category_name_ar: string;
   department_id: string | number;
   status: "Active" | "Inactive";
}

interface UpdateCategoryPayload {
   category_name_en?: string;
   category_name_ar?: string;
   department_id?: string | number;
   status?: "Active" | "Inactive";
}

export interface CategoryListResponse {
   data: Category[];
   pagination: {
      page: number;
      limit: number;
      total: number;
      total_pages: number;
   };
}

// Backend response type (snake_case)
interface CategoryBackendResponse {
   category_id: number;
   category_code: string;
   category_name_en: string;
   category_name_ar: string;
   department_id: number;
   department_name_en?: string;
   department_name_ar?: string;
   department?: {
      department_id: number;
      department_code: string;
      department_name_en?: string;
      department_name_ar?: string;
   };
   status: "Active" | "Inactive";
   created_at?: string;
   updated_at?: string;
   services_count?: number;
}

// Transform backend response to frontend format
const transformCategory = (cat: CategoryBackendResponse): Category => ({
   id: cat.category_id,
   code: cat.category_code,
   nameEn: cat.category_name_en,
   nameAr: cat.category_name_ar,
   departmentId: cat.department_id,
   departmentNameEn:
      cat.department_name_en || cat.department?.department_name_en || "",
   departmentNameAr:
      cat.department_name_ar || cat.department?.department_name_ar || "",
   status: (cat.status || "Inactive").toLowerCase() as "active" | "inactive",
   created_at: cat.created_at,
   updated_at: cat.updated_at,
   servicesCount: cat.services_count,
});

const normalizeStatusValue = (value: string) => {
   const normalized = value.trim().toLowerCase();
   if (normalized === "active") return "Active";
   if (normalized === "inactive") return "Inactive";
   return value;
};

// Service functions
export const categoryService = {
   // GET - List categories
   list: async (filters?: {
      page?: number;
      limit?: number;
      search?: string;
      status?: string | string[];
      sort_by?: string;
      sort_order?: "asc" | "desc";
   }): Promise<CategoryListResponse> => {
      const normalizedFilters = { ...(filters || {}) } as typeof filters;
      if (normalizedFilters?.status) {
         normalizedFilters.status = Array.isArray(normalizedFilters.status)
            ? normalizedFilters.status.map(normalizeStatusValue)
            : normalizeStatusValue(normalizedFilters.status);
      }

      const response = await apiClient.get(endPoints.categories.getAll, {
         params: normalizedFilters,
      });

      const backendData = response.data;
      const pagination = backendData.pagination || { page: 1, limit: 10, total: 0 };
      
      return {
         data: (backendData.data || []).map(transformCategory),
         pagination: {
            ...pagination,
            page: Number(pagination.page),
            limit: Number(pagination.limit),
            total: pagination.total,
            total_pages: Math.ceil((pagination.total || 0) / (pagination.limit || 10))
         },
      };
   },

   // GET - Get category by ID
   getById: async (id: string | number): Promise<Category> => {
      const response = await apiClient.get(endPoints.categories.getById(id));
      return transformCategory(response.data);
   },

   // POST - Create category
   create: async (payload: CreateCategoryRequest): Promise<Category> => {
      // Transform to snake_case for API
      const apiPayload: CreateCategoryPayload = {
         category_name_en: payload.nameEn,
         category_name_ar: payload.nameAr,
         department_id: payload.departmentId,
         status: payload.status === "active" ? "Active" : "Inactive",
      };

      const response = await apiClient.post(
         endPoints.categories.create,
         apiPayload
      );
      return transformCategory(response.data);
   },

   // PUT - Update category
   update: async (
      id: string | number,
      payload: UpdateCategoryRequest
   ): Promise<Category> => {
      // Transform to snake_case for API
      const apiPayload: UpdateCategoryPayload = {};
      if (payload.nameEn !== undefined)
         apiPayload.category_name_en = payload.nameEn;
      if (payload.nameAr !== undefined)
         apiPayload.category_name_ar = payload.nameAr;
      if (payload.departmentId !== undefined)
         apiPayload.department_id = payload.departmentId;
      if (payload.status !== undefined)
         apiPayload.status =
            payload.status === "active" ? "Active" : "Inactive";

      const response = await apiClient.put(
         endPoints.categories.update(id),
         apiPayload
      );
      return transformCategory(response.data);
   },

   // DELETE - Delete category
   delete: async (id: string | number): Promise<void> => {
      await apiClient.delete(endPoints.categories.delete(id));
   },
};
