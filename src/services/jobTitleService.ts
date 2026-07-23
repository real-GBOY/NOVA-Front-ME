/** @format */

import apiClient from "../config/axios";
import endPoints from "../config/endPoints";

// Types
export interface JobTitleRole {
   id: number;
   name: string;
   description?: string;
   is_default: boolean;
}

export interface JobTitle {
   id: number;
   title: string;
   description?: string | null;
   roles?: JobTitleRole[];
   member_count: number;
   created_at?: string;
   updated_at?: string;
}

export interface CreateJobTitleRequest {
   title: string;
   description?: string | null;
   roles?: string[] | null;
}

export interface UpdateJobTitleRequest {
   title?: string;
   description?: string | null;
   default_role_id?: number | null;
}

export interface JobTitleListResponse {
   data: JobTitle[];
   pagination: {
      page: number;
      limit: number;
      total: number;
   };
}

// Service functions
export const jobTitleService = {
   // GET - List job titles
   list: async (filters?: {
      page?: number;
      limit?: number;
      search?: string;
      role_ids?: number[] | string[];
   }): Promise<JobTitleListResponse> => {
      const response = await apiClient.get(endPoints.jobTitles.getAll, {
         params: filters,
      });
      return response.data;
   },

   // GET - Get job title by ID
   getById: async (id: string | number): Promise<JobTitle> => {
      const response = await apiClient.get(endPoints.jobTitles.getById(id));
      return response.data;
   },

   // POST - Create job title
   create: async (payload: CreateJobTitleRequest): Promise<JobTitle> => {
      const response = await apiClient.post(
         endPoints.jobTitles.create,
         payload
      );
      return response.data;
   },

   // PUT - Update job title
   update: async (
      id: string | number,
      payload: UpdateJobTitleRequest
   ): Promise<JobTitle> => {
      const response = await apiClient.put(
         endPoints.jobTitles.update(id),
         payload
      );
      return response.data;
   },

   // DELETE - Delete job title
   delete: async (id: string | number): Promise<void> => {
      await apiClient.delete(endPoints.jobTitles.delete(id));
   },
};
