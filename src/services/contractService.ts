/** @format */

import apiClient from "@/config/axios";
import endPoints from "@/config/endPoints";

// File upload structure
export interface FileUploadData {
   fileId: number;
   token: string;
   purpose: string;
}

// Contract request types
export interface ContractCoreRequest {
   contract_name: string;
   employee_id: number;
   contract_type: string;
   start_date: string;
   end_date?: string | null;
   attachments?: FileUploadData[];
}

export interface ContractCompensationRequest {
   salary?: number;
   salary_cycle?: string;
   overtime_hourly_rate?: number;
   currency?: string;
}

export interface ContractAssetRequest {
   asset_id: number;
}

export interface ContractVacationsRequest {
   notice_period_days?: number;
   sick_leave_days?: number;
   casual_leave_days?: number;
   annual_leave_days?: number;
   absence_limit_days?: number;
}

export interface CreateContractRequest {
   core: ContractCoreRequest;
   compensation?: ContractCompensationRequest;
   assets?: ContractAssetRequest[];
   vacations?: ContractVacationsRequest;
   attachmentFileIds?: number[];
   contractAttachmentFileIds?: number[];
}

// Contract response types
export interface ContractResponse {
   id: number;
   status: string;
   core: {
      contract_name: string;
      employee_id: number;
      employee: {
         id: number;
         name: string;
         email: string;
         avatar?: string | null;
         job_title?: string | null;
      };
      contract_type: string;
      start_date: string;
      end_date?: string | null;
   };
   custom_fields?: {
      termination?: {
         date: string;
         reason: string;
         terminated_at: string;
         notice_period_waived: boolean;
      };
   };
   compensation?: {
      salary?: number;
      salary_cycle?: string;
      overtime_hourly_rate?: number;
   };
   vacations?: {
      notice_period_days?: number;
      sick_leave_days?: number;
      casual_leave_days?: number;
      annual_leave_days?: number;
      absence_limit_days?: number;
      auto_termination?: boolean;
      types?: Array<{
         vacation_type_id: number;
         type_name: string;
         allocated_days: number;
      }>;
   };
   assets?: Array<{
      asset_id: number;
      asset?: {
         id: number;
         name: string;
      };
   }>;
   attachments?: Array<{
      file_id: number;
      file_name: string | null;
      status?: string | null;
      url: string;
   }>;
   created_at: string;
   updated_at: string;
}

export interface ContractListResponse {
   data: ContractResponse[];
   pagination: {
      total: number;
      page: number;
      limit: number;
   };
}

export interface ApiResponse<T> {
   success: boolean;
   message: string;
   data: T;
}

export const contractService = {
   // POST - Create contract
   create: async (
      payload: CreateContractRequest
   ): Promise<ApiResponse<ContractResponse>> => {
      const response = await apiClient.post(
         endPoints.contracts.create,
         payload
      );
      return response.data;
   },

   // GET - List contracts
   list: async (filters?: {
      page?: number;
      limit?: number;
      search?: string;
      status?: string | string[];
      employee_id?: number | number[];
      min_amount?: number;
      max_amount?: number;
      sort_by?: string;
      sort_order?: "asc" | "desc";
   }): Promise<ContractListResponse> => {
      const response = await apiClient.get(endPoints.contracts.getAll, {
         params: filters,
      });
      return response.data;
   },

   // GET - Get contract by ID
   getById: async (
      id: string | number
   ): Promise<ApiResponse<ContractResponse>> => {
      const response = await apiClient.get(endPoints.contracts.getById(id));
      return response.data;
   },

   // PATCH - Update contract
   update: async (
      id: string | number,
      payload: Partial<CreateContractRequest>
   ): Promise<ApiResponse<ContractResponse>> => {
      const response = await apiClient.patch(
         endPoints.contracts.update(id),
         payload
      );
      return response.data;
   },

   // DELETE - Delete contract
   delete: async (id: string | number): Promise<ApiResponse<void>> => {
      const response = await apiClient.delete(endPoints.contracts.delete(id));
      return response.data;
   },

   // PATCH - End contract
   end: async (
      id: string | number,
      payload: {
         reason: string;
         termination_date: string; // ISO date string format
      }
   ): Promise<ApiResponse<ContractResponse>> => {
      const response = await apiClient.post(
         endPoints.contracts.end(id),
         payload
      );
      return response.data;
   },
};
