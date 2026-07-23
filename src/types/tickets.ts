/** @format */

// Employee reference type
export interface TicketEmployee {
   employee_id: number;
   name: string;
   job_title: string | null;
   avatar_url: string | null;
}

// Assigned to type
export interface TicketAssignment {
   role: string | null;
   employee: TicketEmployee | null;
}

// Attachment type
export interface TicketAttachment {
   fileId?: number;
   token?: string;
   purpose?: string;
   file_id?: number;
   file_name?: string;
   file_url?: string;
   mime_type?: string;
}

export interface TicketMessagePreview {
   message_id: string | number;
   sender_id: number;
   message_text: string;
   created_at: string;
}

// Ticket status type
export type TicketStatus = "Open" | "In_Progress" | "Resolved";

// Ticket category type
export type TicketCategory =
   | "technical_support"
   | "account_login"
   | "suggestions_feedback"
   | "complaints"
   | "general_inquiry"
   | "technical" // Backward compatibility
   | "hr"
   | "legal"
   | "financial"
   | "network" // Backward compatibility
   | "security" // Backward compatibility
   | "other";

// Ticket priority type
export type TicketPriority = "low" | "medium" | "high" | "urgent_critical";

// Ticket type
export type TicketType =
   | "bug_error"
   | "system_not_working"
   | "request"
   | "question"
   | "complaint"
   | "feature_request"
   | "installation_issue"
   | "performance_issue"
   | "other"
   | "support" // Backward compatibility
   | "suggestion"; // Backward compatibility

// Assigned role type
export type AssignedRole = "it" | "hr" | "legal";

// Main Ticket interface (for list view)
export interface Ticket {
   ticket_id: number;
   ticket_code: string;
   subject: string;
   category: TicketCategory;
   type: TicketType;
   priority: TicketPriority;
   status: TicketStatus;
   submitted_at: string;
   requested_by: TicketEmployee | null;
   assigned_to: TicketAssignment;
   chat_room_id: number | null;
   chat_room?: TicketChatRoom | null;
   unread_message_count: number;
}

// Detailed Ticket interface (for detail view)
export interface TicketDetail extends Ticket {
   description: string;
   attachments: TicketAttachment[];
   cc_employees: TicketEmployee[];
   resolution_notes: string | null;
   resolved_at: string | null;
   resolved_by: TicketEmployee | null;
   latest_message_preview: TicketMessagePreview | null;
   chat_room?: TicketChatRoom | null;
}

export interface TicketChatRoom {
   room_id: number;
   room_name: string;
   room_type: "group" | "direct" | string;
   is_archived: boolean;
}

export interface TicketChatRoomResponse {
   ticket_id: number;
   chat_room: TicketChatRoom;
   chat_links?: {
      rest_base: string;
      socket_room: number;
   };
}

export interface ArchiveTicketChatRoomRequest {
   archive: boolean;
}

export interface ArchiveTicketChatRoomResponse {
   ticket_id: number;
   chat_room_id: number;
   is_archived: boolean;
}

// Create Ticket Request
export interface CreateTicketRequest {
   subject: string;
   description: string;
   category: TicketCategory;
   type: TicketType;
   priority: TicketPriority;
   attachments?: TicketAttachment[];
   cc_employee_ids?: number[];
}

// Update Ticket Status Request
export interface UpdateTicketStatusRequest {
   status: TicketStatus;
   resolution_notes?: string;
} // Ticket List Response with pagination
export interface TicketListResponse {
   data: Ticket[];
   pagination: {
      page: number;
      limit: number;
      total: number;
      total_pages: number;
   };
}

// Ticket Meta - Category option
export interface TicketCategoryOption {
   key: TicketCategory;
   label: string;
}

// Ticket Meta - Sort option
export interface TicketSortOption {
   value: string;
   label: string;
}

// Ticket Meta Response
export interface TicketMeta {
   statuses: TicketStatus[];
   categories: Array<TicketCategoryOption | TicketCategory>;
   priorities: TicketPriority[];
   types: TicketType[];
   assigned_roles: AssignedRole[];
   sort_options: TicketSortOption[];
}

// API Response wrapper
export interface ApiResponse<T> {
   success?: boolean;
   message?: string;
   data?: T;
}

// List filters
export interface TicketListFilters {
   page?: number;
   limit?: number;
   search?: string;
   status?: TicketStatus | TicketStatus[];
   category?: TicketCategory | TicketCategory[];
   priority?: TicketPriority | TicketPriority[];
   type?: TicketType | TicketType[];
   sort_by?: "submitted_at" | "status" | "priority";
   sort_order?: "asc" | "desc";
   submitted_from?: string; // ISO date format
   submitted_to?: string; // ISO date format
   assigned_to_role?: AssignedRole;
   assigned_to_employee_id?: number;
   requested_by_employee_id?: number;
}
