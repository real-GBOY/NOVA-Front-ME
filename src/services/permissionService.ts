/** @format */

import apiClient from "../config/axios";
import endPoints from "../config/endPoints";

// Types
export interface Permission {
   permission_id: number;
   permission_name: string;
   description?: string;
   scope?: string;
   scope_default?: string;
   scope_options?: string[];
}

export interface PermissionCategory {
   category: string;
   permissions: Permission[];
}

export interface PermissionDictionaryResponse {
   data: PermissionCategory[];
}

export interface PermissionListResponse {
   permissions: Permission[];
   total: number;
   page: number;
   limit: number;
}

// Service functions
export const permissionService = {
   // GET - Get permissions dictionary (grouped by category)
   getDictionary: async (): Promise<PermissionDictionaryResponse> => {
      const response = await apiClient.get(endPoints.permissions.getDictionary);
      return response.data;
   },

   // GET - List permissions (paginated)
   list: async (filters?: {
      page?: number;
      limit?: number;
      search?: string;
   }): Promise<PermissionListResponse> => {
      const params = { ...filters };
      if (typeof params.limit === "number" && params.limit > 100) {
         params.limit = 100;
      }
      const response = await apiClient.get(endPoints.permissions.getAll, {
         params,
      });
      return response.data;
   },
};
