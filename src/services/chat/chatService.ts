/** @format */

import apiClient from "@/config/axios";
import endPoints from "@/config/endPoints";
import type {
	Room,
	Message,
	CreateGroupRoomRequest,
	CreateDirectRoomRequest,
	UpdateRoomRequest,
	SendMessageRequest,
	MarkReadRequest,
	AddMemberRequest,
	PaginatedMessagesResponse,
	RoomsResponse,
	UsersResponse,
	UnreadCountResponse,
	TotalUnreadResponse,
} from "./types";

/**
 * Chat REST API Service
 * Handles all HTTP requests to the chat API
 *
 * NOTE: For sending messages, use Socket.io `sendMessageViaSocket` instead.
 * This service is primarily for loading message history and room management.
 * Socket.io automatically saves messages to DB when sending.
 */

// ==================== User Directory ====================

export const getChatUsers = async (search?: string): Promise<UsersResponse> => {
	const params = search ? { search } : {};
	const response = await apiClient.get<UsersResponse>(endPoints.chat.getUsers, {
		params,
	});
	return response.data;
};

// ==================== Room Management ====================

export const getRooms = async (search?: string): Promise<RoomsResponse> => {

	const params = search ? { search } : {};
	const response = await apiClient.get<RoomsResponse>(endPoints.chat.getRooms, {
		params,
	});

	return response.data;
};

export const getRoom = async (roomId: number): Promise<Room> => {
	const response = await apiClient.get<Room>(endPoints.chat.getRoom(roomId));
	return response.data;
};

export const createGroupRoom = async (
	data: CreateGroupRoomRequest
): Promise<Room> => {
	// Normalize avatar payload (support avatar object with fileId/token)
	const payload: Record<string, unknown> = { ...data };
	if (data.avatar) {
		payload.avatar_file_id = data.avatar.fileId;
		payload.avatar_token = data.avatar.token;
	}
	const response = await apiClient.post<Room>(
		endPoints.chat.createGroupRoom,
		payload
	);
	return response.data;
};

export const createDirectRoom = async (
	data: CreateDirectRoomRequest
): Promise<Room> => {
	const response = await apiClient.post<Room>(
		endPoints.chat.createDirectRoom,
		data
	);
	return response.data;
};

export const updateRoom = async (
	roomId: number,
	data: UpdateRoomRequest
): Promise<Room> => {
	const payload: Record<string, unknown> = { ...data };
	if (data.avatar) {
		payload.avatar_file_id = data.avatar.fileId;
		payload.avatar_token = data.avatar.token;
		delete payload.avatar;
	}
	const response = await apiClient.patch<Room>(
		endPoints.chat.updateRoom(roomId),
		payload
	);
	return response.data;
};

export const pinRoom = async (roomId: number): Promise<void> => {
	await apiClient.post(endPoints.chat.pinRoom(roomId));
};

export const unpinRoom = async (roomId: number): Promise<void> => {
	await apiClient.delete(endPoints.chat.unpinRoom(roomId));
};

// ==================== Messaging ====================

export const getMessages = async (
	roomId: number,
	cursor?: number,
	limit: number = 50
): Promise<PaginatedMessagesResponse> => {
	const params: { cursor?: number | string; limit: number } = { limit };
	if (cursor !== undefined && cursor !== null) {
		params.cursor = cursor;
	}
	type ApiMessage = {
		message_id: string | number;
		room_id: number;
		sender_id?: number;
		message_text: string | null;
		attachment_file_id: number | null;
		reply_to_message_id: number | null;
		timestamp: string;
		client_message_id: string | null;
		delivery_status: "sent" | "delivered" | "read";
		delivered_at: string | null;
		read_at: string | null;
		is_duplicate: boolean;
		sender?: {
			employee_id: number;
			first_name: string;
			last_name: string;
			email: string;
		};
		attachment?: {
			file_id: number;
			storage_path: string;
			file_url?: string | null;
			original_filename: string;
			mime_type: string;
			file_size_kb?: number | null;
		};
		replied_to?: {
			message_id: number;
			message_text: string | null;
			sender_id: number;
			sender?: {
				employee_id: number;
				first_name: string;
				last_name: string;
			};
		};
	};

	const apiResponse = await apiClient.get<{
		data: ApiMessage[];
		has_more: boolean;
		next_cursor: string | number | null;
	}>(endPoints.chat.getMessages(roomId), { params });

	const transformed: PaginatedMessagesResponse = {
		messages: apiResponse.data.data.map((msg) => ({
			message_id: Number(msg.message_id),
			room_id: msg.room_id,
			sender_id:
				typeof msg.sender_id === "number"
					? msg.sender_id
					: msg.sender?.employee_id || 0,
			message_text: msg.message_text,
			attachment_file_id: msg.attachment_file_id,
			reply_to_message_id: msg.reply_to_message_id,
			timestamp: msg.timestamp,
			client_message_id: msg.client_message_id || null,
			delivery_status: msg.delivery_status,
			delivered_at: msg.delivered_at,
			read_at: msg.read_at,
			is_duplicate: msg.is_duplicate,
			sender: msg.sender
				? {
						employee_id: msg.sender.employee_id,
						first_name: msg.sender.first_name,
						last_name: msg.sender.last_name,
						email: msg.sender.email,
				  }
				: undefined,
			attachment: msg.attachment
				? {
						file_id: msg.attachment.file_id,
						storage_path: msg.attachment.storage_path,
						file_url: msg.attachment.file_url ?? null,
						original_filename: msg.attachment.original_filename,
						mime_type: msg.attachment.mime_type,
						file_size_kb: msg.attachment.file_size_kb ?? undefined,
				  }
				: undefined,
			replied_to: msg.replied_to,
		})),
		has_more: apiResponse.data.has_more,
		next_cursor:
			apiResponse.data.next_cursor !== null &&
			apiResponse.data.next_cursor !== undefined
				? Number(apiResponse.data.next_cursor)
				: null,
	};

	return transformed;
};

/**
 * Send message via REST API
 *
 * NOTE: For real-time chat, use Socket.io `sendMessageViaSocket` instead.
 * This REST endpoint is available as a fallback or for specific use cases.
 * The Socket.io `send_message` event automatically saves to DB.
 *
 * @deprecated For chat messages, prefer Socket.io for real-time delivery
 */
export const sendMessage = async (
	roomId: number,
	data: SendMessageRequest
): Promise<Message> => {
	const response = await apiClient.post<Message>(
		endPoints.chat.sendMessage(roomId),
		data
	);
	return response.data;
};

// ==================== Member Management ====================

export const addMember = async (
	roomId: number,
	data: AddMemberRequest
): Promise<void> => {
	await apiClient.post(endPoints.chat.addMember(roomId), data);
};

export const removeMember = async (
	roomId: number,
	employeeId: number
): Promise<void> => {
	await apiClient.delete(endPoints.chat.removeMember(roomId, employeeId));
};

// ==================== Read Status ====================

export const markMessagesAsRead = async (
	roomId: number,
	data: MarkReadRequest
): Promise<void> => {
	await apiClient.post(endPoints.chat.markRead(roomId), data);
};

export const getUnreadCount = async (
	roomId: number
): Promise<UnreadCountResponse> => {
	const response = await apiClient.get<UnreadCountResponse>(
		endPoints.chat.getUnreadCount(roomId)
	);
	return response.data;
};

export const getTotalUnread = async (): Promise<TotalUnreadResponse> => {
	const response = await apiClient.get<TotalUnreadResponse>(
		endPoints.chat.getTotalUnread
	);
	return response.data;
};
