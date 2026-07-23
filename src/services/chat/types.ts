/** @format */

/**
 * Type definitions matching the Chat REST API and Socket Events
 * Ensures 100% consistency between backend API, socket events, and frontend UI (Best Practice #10)
 */

// ==================== User Types ====================

export interface ChatUser {
	employee_id: number;
	first_name: string;
	last_name: string;
	full_name: string;
	email?: string; // Optional - not always included in API response
	job_title_id: number | null;
	job_title: string | null;
	profile_picture_id: number | null;
	profile_picture_url: string | null;
}

// ==================== Room Types ====================

export interface RoomMember {
	employee_id: number;
	first_name: string;
	last_name: string;
	email: string;
	profile_picture_id: number | null;
	profile_picture_url: string | null;
	joined_at: string;
	is_active: boolean;
	last_read_message_id: number | null;
}

export interface MessageSummary {
	message_id: number;
	message_text: string | null;
	timestamp: string;
	sender_id: number;
	sender_name: string | null;
	has_attachment: boolean;
	attachment_mime_type: string | null; // MIME type to determine if image/voice/file
}

export interface Room {
	room_id: number;
	room_type: "direct" | "group";
	room_name: string | null;
	avatar_file_id: number | null;
	avatar_url: string | null;
	is_pinned: boolean;
	created_by: number;
	created_at: string;
	last_message_at: string | null;
	is_archived: boolean;
	has_unread: boolean; // Changed from unread_count (number) to has_unread (boolean)
	unread_count?: number;
	is_online?: boolean | null; // Online status for direct rooms (null for groups)
	members: RoomMember[];
	last_message: MessageSummary | null;
}

// ==================== Message Types ====================

export interface Attachment {
	file_id: number;
	storage_path: string;
	file_url?: string | null;
	original_filename: string;
	mime_type: string;
	file_size_kb: number | null;
}

export interface MessageSender {
	employee_id: number;
	first_name: string;
	last_name: string;
	email: string;
}

export interface RepliedToMessage {
	message_id: number;
	message_text: string | null;
	sender_id: number;
	sender: MessageSender | null;
	attachment_file_id?: number | null;
	attachment?: Attachment | null;
}

/**
 * Message object matching API response
 * Every message MUST have a unique ID (Best Practice #11)
 */
export interface Message {
	message_id: number; // Unique identifier (required)
	room_id: number;
	sender_id: number;
	message_text: string | null;
	attachment_file_id: number | null;
	reply_to_message_id: number | null;
	timestamp: string; // ISO-8601 UTC string
	client_message_id: string | null; // Idempotency key
	delivery_status: "sent" | "delivered" | "read";
	delivered_at: string | null;
	read_at: string | null;
	is_duplicate: boolean;
	sender?: MessageSender;
	attachment?: Attachment;
	replied_to?: RepliedToMessage;
}

// ==================== API Request Types ====================

export interface CreateGroupRoomRequest {
	name: string;
	member_ids: number[];
	avatar_file_id?: number;
	avatar_token?: string;
	avatar?: {
		fileId: number;
		token: string;
	};
}

export interface CreateDirectRoomRequest {
	employee_id: number;
}

export interface UpdateRoomRequest {
	name?: string;
	avatar_file_id?: number | null;
	avatar_token?: string;
	avatar?: {
		fileId: number;
		token: string;
		purpose?: string;
	};
}

export interface SendMessageRequest {
	message_text?: string;
	attachment_file_id?: number;
	attachment_token?: string;
	reply_to_message_id?: number;
	client_message_id?: string;
	// Optional metadata for optimistic UI updates (not sent to backend)
	_optimistic_attachment_metadata?: {
		fileName: string;
		fileSize: number;
		fileUrl: string;
		mimeType?: string;
	};
	_optimistic_reply?: {
		message_id: number;
		message_text: string | null;
		type: MessageType;
		fileName?: string;
		fileSize?: number;
		fileUrl?: string;
		sender?: MessageSender | null;
	};
}

export interface MarkReadRequest {
	last_message_id: number;
}

export interface AddMemberRequest {
	employee_id: number;
}

// ==================== API Response Types ====================

export interface PaginatedMessagesResponse {
	messages: Message[]; // Transformed from API 'data' array
	has_more: boolean;
	next_cursor: number | null; // Transformed from API string/number
}

export interface RoomsResponse {
	data: Room[];
	total: number;
}

export interface UsersResponse {
	data: ChatUser[];
	total: number;
}

export interface UnreadCountResponse {
	room_id: number;
	unread_count: number;
}

export interface TotalUnreadResponse {
	total_unread?: number;
	total_unread_direct?: number;
	total_unread_group?: number;
	total_unread_ticket_support?: number;
}

// ==================== Socket Event Types ====================

export interface SocketJoinRoomPayload {
	roomId: number;
}

export interface SocketSendMessagePayload {
	roomId: number;
	message_text?: string;
	attachment_file_id?: number;
	attachment_token?: string;
	reply_to_message_id?: number;
	client_message_id?: string;
}

export interface SocketSendMessageResponse {
	success: boolean;
	message_id?: number;
	is_duplicate?: boolean;
	error?: string;
}

export type SocketReceiveMessagePayload = Message;

export interface SocketTypingPayload {
	roomId: number;
}

export interface SocketUserTypingPayload {
	roomId: number;
	userId: number;
	userName: string;
}

export interface SocketMessageReadPayload {
	roomId: number;
	lastMessageId: number;
}

export interface SocketMessageReadReceiptPayload {
	roomId: number;
	userId: number;
	userName: string;
	lastMessageId: number;
	timestamp: string;
}

export interface SocketUserPresencePayload {
	userId: number;
	userName: string;
	timestamp: string;
}

export interface SocketOnlineUsersListPayload {
	userIds: string[];
}

export interface SocketUnreadTotalPayload {
	total_unread?: number;
	total_unread_direct?: number;
	total_unread_group?: number;
	total_unread_ticket_support?: number;
}

export interface SocketRateLimitPayload {
	event: string;
	max: number;
	window: number;
	retryAfter: number;
}

// ==================== Helper Types ====================

export type MessageType = "text" | "voice" | "file";

export interface TypingUser {
	userId: number;
	userName: string;
	roomId: number;
}
