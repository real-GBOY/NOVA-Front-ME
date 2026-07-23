/** @format */

import apiClient from "@/config/axios";
import endPoints from "@/config/endPoints";

export interface LegalCaseDto {
   case_id: number | string;
   case_number: string;
   title: string;
   summary?: string;
   client_name?: string;
   lawyer_id?: number | string;
   status?: string;
   type?: string;
   case_type?: string;
   case_type_id?: number;
   CaseType?: {
      type_id?: number;
      name?: string;
      slug?: string;
   };
   start_date?: string;
   end_date?: string;
   created_at: string;
   updated_at: string;
   Lawyer?: {
      employee_id?: number | string;
      first_name?: string;
      last_name?: string;
      job_title?: string;
      email?: string;
      avatar?: string;
   };
}

export interface LegalCaseListResponse {
   success: boolean;
   data: LegalCaseDto[];
   pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages?: number;
      total_pages?: number;
   };
}

export interface LegalCaseDetailResponse {
   success: boolean;
   data: LegalCaseDto;
}

export interface CreateLegalCaseRequest {
   case_number?: string;
   title: string;
   summary?: string;
   client_name?: string;
   lawyer_id?: number | string;
   status?: string;
   start_date?: string;
   end_date?: string;
   case_type_id?: number;
   people?: Array<{
      employee_id: number;
      role?: string;
   }>;
   core?: {
      attachments?: Array<{
         fileId: number | string;
         fileName?: string;
      }>;
   };
}

export interface UpdateLegalCaseRequest {
   title?: string;
   summary?: string;
   client_name?: string;
   lawyer_id?: number | string;
   status?: string;
   start_date?: string;
   end_date?: string;
   case_type_id?: number;
}

export interface CreateLegalCaseTypeRequest {
   name: string;
}

export interface LegalCaseType {
   type_id: number;
   name: string;
   slug: string;
}

export interface CreateLegalCaseEventRequest {
   event_title: string;
   event_date: string;
   description?: string;
   core?: {
      attachments?: Array<{
         fileId: number | string;
         fileName?: string;
      }>;
   };
}

export interface UpdateLegalCaseEventRequest {
   event_title?: string;
   event_date?: string;
   description?: string;
}

export interface CreateLegalCaseDocumentRequest {
   file_id: number | string;
   event_id?: number | string;
   file_name?: string;
   token?: string;
}

export interface LegalCase {
   id: string;
   case_number: string;
   title: string;
   type?: string;
   status: string;
   assigned_to?: string | number;
   assigned_to_name?: string;
   description?: string;
   client?: string;
   created_at: string;
   updated_at: string;
   start_date?: string;
   end_date?: string;
   case_type_id?: number;
   Lawyer?: {
      employee_id?: number | string;
      first_name?: string;
      last_name?: string;
      email?: string;
      avatar?: string;
      job_title?: string;
   };
}

export interface LegalCaseDocument {
   id: string | number;
   file_id: string | number;
   file_name: string;
   file_type?: string;
   file_size?: string;
   file_url?: string;
   created_at: string;
   uploaded_by?: string;
}

export interface LegalCaseEmployee {
   id: string | number;
   case_id: string | number;
   employee_id: string | number;
   role: string;
   assigned_at?: string;
   Employee?: {
      employee_id: string | number;
      first_name: string;
      last_name: string;
      email: string;
      avatar?: string;
      job_title?: string;
   };
   // Legacy fields for backward compatibility
   name?: string;
   avatar?: string;
}

export interface LegalCaseEvent {
   id: string | number;
   title: string;
   date: string;
   description?: string;
   created_at: string;
}

export interface LegalCaseActivity {
   id: string | number;
   action: string;
   description: string;
   performed_by: string;
   performed_at: string;
   metadata?: any;
}

const LEGAL_CASE_STATUS_MAP: Record<string, string> = {
   open: "Open",
   "in progress": "In Progress",
   closed: "Closed",
   "on hold": "On Hold",
   cancelled: "Cancelled",
};

const normalizeLegalCaseStatus = (value: unknown): string | undefined => {
   if (Array.isArray(value)) {
      return value.length ? normalizeLegalCaseStatus(value[0]) : undefined;
   }

   if (value && typeof value === "object") {
      const candidate =
         (value as Record<string, unknown>).status ??
         (value as Record<string, unknown>).id ??
         (value as Record<string, unknown>).value ??
         (value as Record<string, unknown>).label;
      return normalizeLegalCaseStatus(candidate);
   }

   if (typeof value !== "string") return undefined;
   const normalized = value
      .trim()
      .replace(/_/g, " ")
      .replace(/\s+/g, " ")
      .toLowerCase();
   return LEGAL_CASE_STATUS_MAP[normalized];
};

const mapStatus = (status?: string) => {
   if (!status) return "open";
   const normalized = status.toLowerCase().replace(/\s+/g, "_");
   return normalized;
};

const mapLegalCase = (dto: LegalCaseDto): LegalCase => {
   const lawyerName =
      dto.Lawyer && (dto.Lawyer.first_name || dto.Lawyer.last_name)
         ? `${dto.Lawyer.first_name ?? ""} ${dto.Lawyer.last_name ?? ""}`.trim()
         : undefined;
   const caseType =
      dto.CaseType?.name?.trim() ||
      dto.case_type?.trim() ||
      dto.type?.trim() ||
      "Other";

   return {
      id: String(dto.case_id),
      case_number: dto.case_number,
      title: dto.title,
      type: caseType,
      status: mapStatus(dto.status),
      assigned_to: dto.lawyer_id,
      assigned_to_name: lawyerName,
      description: dto.summary,
      client: dto.client_name,
      created_at: dto.created_at,
      updated_at: dto.updated_at,
      start_date: dto.start_date,
      end_date: dto.end_date,
      case_type_id: dto.case_type_id ?? dto.CaseType?.type_id,
      Lawyer: dto.Lawyer,
   };
};

const mapLegalCaseEvent = (data: any): LegalCaseEvent => ({
   id: data.event_id || data.id,
   title: data.event_title || data.title,
   date: data.event_date || data.date,
   description: data.description,
   created_at: data.created_at,
});

export const legalCasesService = {
   async list(filters?: {
      page?: number;
      limit?: number;
      search?: string;
      sort_by?: string;
      sort_order?: "asc" | "desc";
      status?: string | string[];
      lawyer_id?: string | string[];
      from_date?: string;
      to_date?: string;
   }) {
      const params = filters
         ? {
              page: filters.page,
              limit: filters.limit,
              search: filters.search,
              sort_by: filters.sort_by,
              sort_order: filters.sort_order,
              status: Array.isArray(filters.status)
                 ? filters.status[0]
                 : filters.status,
              lawyer_id: filters.lawyer_id,
              from_date: filters.from_date,
              to_date: filters.to_date,
           }
         : undefined;
      const hasParams = params
         ? Object.values(params).some((value) =>
              Array.isArray(value)
                 ? value.length > 0
                 : value !== undefined && value !== "",
           )
         : false;
      const response = hasParams
         ? await apiClient.get<LegalCaseListResponse>(
              endPoints.legalCases.getAll,
              { params },
           )
         : await apiClient.get<LegalCaseListResponse>(
              endPoints.legalCases.getAll,
           );

      return {
         success: response.data.success,
         data: (response.data.data || []).map(mapLegalCase),
         pagination: response.data.pagination,
      };
   },

   async listTypes() {
      const response = await apiClient.get<{
         success: boolean;
         data: LegalCaseType[];
      }>(endPoints.legalCases.getTypes);
      return response.data.data || [];
   },

   async createType(payload: CreateLegalCaseTypeRequest) {
      const response = await apiClient.post<{
         success: boolean;
         data: LegalCaseType;
      }>(endPoints.legalCases.createType, payload);
      return response.data.data;
   },

   async getById(id: string | number) {
      const response = await apiClient.get<LegalCaseDetailResponse>(
         endPoints.legalCases.getById(id),
      );

      return {
         success: response.data.success,
         data: mapLegalCase(response.data.data),
      };
   },

   async create(payload: CreateLegalCaseRequest) {
      const normalizedStatus =
         normalizeLegalCaseStatus(payload.status) || "Open";
      const response = await apiClient.post<LegalCaseDetailResponse>(
         endPoints.legalCases.getAll,
         {
            ...payload,
            status: normalizedStatus,
         },
      );
      return {
         success: response.data.success,
         data: mapLegalCase(response.data.data),
      };
   },

   async update(id: string | number, payload: UpdateLegalCaseRequest) {
      const normalizedStatus =
         payload.status === undefined
            ? undefined
            : normalizeLegalCaseStatus(payload.status);
      const requestPayload =
         payload.status === undefined
            ? payload
            : {
                 ...payload,
                 ...(normalizedStatus ? { status: normalizedStatus } : {}),
              };
      const response = await apiClient.put<LegalCaseDetailResponse>(
         endPoints.legalCases.update(id),
         requestPayload,
      );
      return {
         success: response.data.success,
         data: mapLegalCase(response.data.data),
      };
   },

   async delete(id: string | number) {
      const response = await apiClient.delete(endPoints.legalCases.delete(id));
      return {
         success: response.data.success || true,
      };
   },

   // ==================== Employees ====================

   async getEmployees(id: string | number) {
      const response = await apiClient.get(
         endPoints.legalCases.getEmployees(id),
      );
      return {
         success: response.data.success,
         data: response.data.data as LegalCaseEmployee[],
      };
   },

   async addEmployee(
      caseId: string | number,
      payload: { employee_id: string | number; role?: string },
   ) {
      const response = await apiClient.post(
         endPoints.legalCases.assignEmployee(caseId),
         payload,
      );
      return {
         success: response.data.success,
         data: response.data.data,
      };
   },

   async removeEmployee(caseId: string | number, employeeId: string | number) {
      const response = await apiClient.delete(
         endPoints.legalCases.removeEmployee(caseId, employeeId),
      );
      return {
         success: response.data.success,
      };
   },

   // ==================== Events ====================

   async getEvents(id: string | number) {
      const response = await apiClient.get(endPoints.legalCases.getEvents(id));
      return {
         success: response.data.success,
         data: (response.data.data || []).map(mapLegalCaseEvent),
      };
   },

   async createEvent(
      caseId: string | number,
      payload: CreateLegalCaseEventRequest,
   ) {
      const response = await apiClient.post(
         endPoints.legalCases.createEvent(caseId),
         payload,
      );
      return {
         success: response.data.success,
         data: mapLegalCaseEvent(response.data.data),
      };
   },

   async updateEvent(
      caseId: string | number,
      eventId: string | number,
      payload: UpdateLegalCaseEventRequest,
   ) {
      const response = await apiClient.put(
         endPoints.legalCases.updateEvent(caseId, eventId),
         payload,
      );
      return {
         success: response.data.success,
         data: mapLegalCaseEvent(response.data.data),
      };
   },

   // ==================== Documents ====================

   async getDocuments(id: string | number) {
      const response = await apiClient.get(
         endPoints.legalCases.getDocuments(id),
      );
      return {
         success: response.data.success,
         data: response.data.data as LegalCaseDocument[],
      };
   },

   async attachDocument(
      caseId: string | number,
      payload: CreateLegalCaseDocumentRequest,
   ) {
      const response = await apiClient.post(
         endPoints.legalCases.attachDocument(caseId),
         payload,
      );
      return {
         success: response.data.success,
         data: response.data.data as LegalCaseDocument,
      };
   },

   async removeDocument(caseId: string | number, documentId: string | number) {
      const response = await apiClient.delete(
         endPoints.legalCases.removeDocument(caseId, documentId),
      );
      return {
         success: response.data.success,
      };
   },

   // ==================== Activities ====================

   async getActivities(id: string | number) {
      const response = await apiClient.get(
         endPoints.legalCases.getActivities(id),
      );
      return {
         success: response.data.success,
         data: response.data.data as LegalCaseActivity[],
      };
   },
};

export default legalCasesService;
