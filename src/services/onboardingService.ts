/** @format */

import apiClient from "@/config/axios";
import endPoints from "@/config/endPoints";

// File upload structure - only 3 fields needed
export interface FileUploadData {
   fileId: number;
   token: string;
   purpose: string;
}

// Types for onboarding requests and responses
export interface OnboardingStartRequest {
   first_name: string;
   last_name: string;
   email: string;
   phone_number: string;
   country?: string;
   date_of_birth?: string;
   gender?: string;
   marital_status?: string;
   national_id?: string;
   address?: string;
   attachments?: FileUploadData[];
   profileImage?: FileUploadData;
}

export interface OnboardingWorkRequest {
   job_title_id?: number;
   team_ids?: number[];
   role_id?: number;
   manager_id?: number;
   shift_id?: number;
   employment_type?:
      | "full_time"
      | "part_time"
      | "contract"
      | "intern"
      | "temporary";
   start_date?: string;
   hours_per_week?: number;
   probation_period?: number;
}

export interface OnboardingResidencyRequest {
   permit_number: string;
   permit_type: string;
   issue_date: string;
   expiration_date: string;
   country?: string;
   status?: string;
   document?: {
      fileId: number;
      token: string;
      purpose: string;
   };
}

export interface OnboardingResponse {
   onboarding_id: string;
   status: string;
   version: number;
   expires_at: string;
   payload: {
      core: {
         email: string;
         gender: string | null;
         address: string | null;
         country: string | null;
         last_name: string;
         member_id: string;
         first_name: string;
         national_id: string | null;
         phone_number: string;
         date_of_birth: string | null;
         marital_status: string | null;
         attachment_file_ids: number[];
         profile_image_file_id: number | null;
         profileImage?: FileUploadData;
         attachments?: FileUploadData[];
      };
      role: unknown;
      work: unknown;
      contract: unknown;
      residency: unknown;
      vacations: unknown;
   };
}

export interface OnboardingListItem {
   onboarding_id: string;
   status: string;
   version: number;
   employee_id: number;
   created_by: number;
   expires_at: string;
   created_at: string;
   updated_at: string;
}

export interface OnboardingListResponse {
   data: OnboardingListItem[];
   total: number;
   page: number;
   limit: number;
   total_pages: number;
}

export const onboardingService = {
   // GET - List onboarding sessions
   list: async (params?: {
      page?: number;
      limit?: number;
      status?: string;
      employee_id?: number;
   }): Promise<OnboardingListResponse> => {
      const response = await apiClient.get(endPoints.onboarding.list, {
         params,
      });
      return response.data;
   },

   // POST - Start onboarding (Step 1 - Basic Info)
   start: async (
      payload: OnboardingStartRequest
   ): Promise<OnboardingResponse> => {
      const response = await apiClient.post(
         endPoints.onboarding.start,
         payload
      );
      return response.data;
   },

   // PUT - Update work info (Step 2 - Work Info)
   updateWork: async (
      onboardingId: string,
      payload: OnboardingWorkRequest
   ): Promise<OnboardingResponse> => {
      const response = await apiClient.put(
         endPoints.onboarding.work(onboardingId),
         payload
      );
      return response.data;
   },

   // PUT - Update residency info (Step 3 - Residency Info)
   updateResidency: async (
      onboardingId: string,
      payload: OnboardingResidencyRequest
   ): Promise<OnboardingResponse> => {
      const response = await apiClient.put(
         endPoints.onboarding.residency(onboardingId),
         payload
      );
      return response.data;
   },

   // PATCH - Update contract info (if needed)
   updateContract: async (
      onboardingId: string,
      payload: unknown
   ): Promise<OnboardingResponse> => {
      const response = await apiClient.patch(
         endPoints.onboarding.contract(onboardingId),
         payload
      );
      return response.data;
   },

   // POST - Complete onboarding
   complete: async (onboardingId: string): Promise<OnboardingResponse> => {
      const response = await apiClient.post(
         endPoints.onboarding.complete(onboardingId)
      );
      return response.data;
   },

   // POST - Finalize onboarding (final step after work info)
   finalize: async (onboardingId: string): Promise<OnboardingResponse> => {
      const response = await apiClient.post(
         endPoints.onboarding.finalize(onboardingId)
      );
      return response.data;
   },

   // POST - Resend onboarding invitation
   resendInvite: async (onboardingId: string): Promise<{ message?: string }> => {
      const response = await apiClient.post(
         endPoints.onboarding.resendInvite(onboardingId)
      );
      return response.data;
   },
};
