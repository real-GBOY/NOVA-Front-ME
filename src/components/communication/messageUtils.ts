/** @format */

import type {
	Message,
	Room,
	RoomMember,
	ChatUser,
	UsersResponse,
} from "@/services/chat/types";
import type { ChatMessage, ReplyMessage } from "./types";
import { buildMediaUrl } from "./utils";

/**
 * Format file size from KB to human-readable string
 * @param sizeInKb - File size in kilobytes
 * @returns Formatted string (e.g., "1.5 MB", "256 KB") or undefined if invalid
 */
export const formatFileSizeLabel = (
	sizeInKb?: number | null
): string | undefined => {
	if (typeof sizeInKb !== "number" || sizeInKb <= 0) return undefined;
	return sizeInKb >= 1024
		? `${(sizeInKb / 1024).toFixed(2)} MB`
		: `${sizeInKb} KB`;
};

/**
 * Build reply message preview from backend Message
 * @param reply - Replied-to message from backend
 * @returns ReplyMessage for UI or undefined
 */
export const buildReplyMessage = (
	reply?: Message["replied_to"]
): ReplyMessage | undefined => {
	if (!reply) return undefined;

	const attachment = reply.attachment || undefined;
	const hasAttachment = Boolean(attachment);
	const replyType: ChatMessage["type"] = hasAttachment
		? attachment?.mime_type?.startsWith("audio")
			? "voice"
			: "file"
		: "text";
	const senderName = reply.sender
		? `${reply.sender.first_name} ${reply.sender.last_name || ""}`.trim()
		: undefined;

	return {
		id: reply.message_id.toString(),
		content:
			reply.message_text ||
			attachment?.original_filename ||
			senderName ||
			"",
		type: replyType,
		fileName: attachment?.original_filename || undefined,
	fileSize: formatFileSizeLabel(attachment?.file_size_kb ?? null),
	fileUrl: buildMediaUrl(
		attachment?.file_url || attachment?.storage_path || undefined
	),
		senderName,
	};
};

/**
 * Convert backend Message to UI ChatMessage
 * @param msg - Message from backend
 * @param room - Current room data
 * @param currentUserIdNum - Current user's ID
 * @param senderProfilesMap - Map of user IDs to profile picture URLs
 * @param allUsersData - All users data for fallback
 * @returns ChatMessage for UI rendering
 */
export const convertMessage = (
	msg: Message,
	room: Room | null | undefined,
	currentUserIdNum: number | null,
	senderProfilesMap: Map<number, string>,
	allUsersData: UsersResponse | undefined
): ChatMessage => {
	// Validate sender_id
	const senderIdNum = Number(msg.sender_id);
	if (isNaN(senderIdNum)) {
		console.warn("[messageUtils] Invalid sender_id:", msg.sender_id);
		// Return fallback message
		return {
			id: msg.message_id.toString(),
			senderId: "0",
			senderName: "Unknown User",
			senderRole: "",
			senderAvatar: "",
			senderIsOnline: false,
			content: msg.message_text || undefined,
			timestamp: msg.timestamp,
			type: msg.attachment ? "file" : "text",
			fileName: msg.attachment?.original_filename,
			fileSize: formatFileSizeLabel(msg.attachment?.file_size_kb ?? null),
	fileUrl: buildMediaUrl(
		msg.attachment?.file_url || msg.attachment?.storage_path || undefined
	),
			replyTo: buildReplyMessage(msg.replied_to),
		};
	}

	// Find sender in room members
	const senderMember = room?.members?.find(
		(m: RoomMember) => Number(m.employee_id) === senderIdNum
	);

	// Find user in global list to get job title
	const senderUser = allUsersData?.data?.find(
		(u: ChatUser) => Number(u.employee_id) === senderIdNum
	);

	// Determine sender name
	let senderName: string;
	if (msg.sender?.first_name) {
		senderName = `${msg.sender.first_name} ${
			msg.sender.last_name || ""
		}`.trim();
	} else if (senderMember) {
		senderName = `${senderMember.first_name} ${
			senderMember.last_name || ""
		}`.trim();
	} else {
		const isCurrentUser = senderIdNum === currentUserIdNum;
		senderName = isCurrentUser ? "You" : "Unknown User";
	}

	// Resolve avatar
	let senderAvatar = "";
	if (senderProfilesMap.has(senderIdNum)) {
		senderAvatar = senderProfilesMap.get(senderIdNum) || "";
	} else if (senderMember?.profile_picture_url) {
		senderAvatar = senderMember.profile_picture_url || "";
	} else if (senderUser?.profile_picture_url) {
		senderAvatar = senderUser.profile_picture_url;
	}
	if (senderAvatar && !senderAvatar.startsWith("http")) {
		senderAvatar = buildMediaUrl(senderAvatar);
	}

	// Determine message type
	const isVoice =
		msg.attachment?.mime_type?.startsWith("audio/") ||
		msg.attachment?.original_filename?.endsWith(".webm");

	// Format timestamp
	const formattedTime = new Date(msg.timestamp).toLocaleTimeString([], {
		hour: "numeric",
		minute: "2-digit",
	});

	return {
		id: msg.message_id.toString(),
		senderId: msg.sender_id.toString(),
		senderName,
		senderRole: senderUser?.job_title || "",
		senderAvatar,
		senderIsOnline: false, // Handled by MessageList at render time
		content: msg.message_text || undefined,
		timestamp: formattedTime,
		originalTimestamp: msg.timestamp, // Store original for date separators
		type: msg.attachment ? (isVoice ? "voice" : "file") : "text",
		fileName: msg.attachment?.original_filename,
		fileSize: formatFileSizeLabel(msg.attachment?.file_size_kb ?? null),
		fileUrl:
			msg.attachment?.file_url ||
			msg.attachment?.storage_path ||
			undefined,
		replyTo: buildReplyMessage(msg.replied_to),
		voiceDuration: isVoice ? "Voice Message" : undefined,
		mimeType: msg.attachment?.mime_type,
	};
};
