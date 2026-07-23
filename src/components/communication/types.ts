/** @format */

export interface ChatUser {
	id: string;
	name: string;
	jobTitle: string;
	avatar: string;
	isOnline: boolean;
}

export interface GroupMember {
	id: string;
	name: string;
	role: string;
	avatar?: string;
	isOnline?: boolean;
}

export interface GroupChat {
	id: string;
	name: string;
	avatar?: string;
	members: GroupMember[];
	memberCount: number;
	onlineCount: number;
	lastMessage: string;
	timestamp: string;
	isPinned?: boolean;
	hasUnread?: boolean;
	messageType?: "text" | "voice" | "file";
	isTyping?: boolean;
	isActive?: boolean;
}

export interface IndividualChat {
	id: string;
	user: ChatUser;
	lastMessage: string;
	timestamp: string;
	isPinned?: boolean;
	hasUnread?: boolean;
	messageType?: "text" | "voice" | "file";
	isTyping?: boolean;
	isActive?: boolean;
}

// Union type for chat list items
export type ChatListItem = IndividualChat | GroupChat;

// Type guard to check if chat is a group
export function isGroupChat(chat: ChatListItem): chat is GroupChat {
	return "members" in chat && "memberCount" in chat;
}

// Type guard to check if chat is an individual chat
export function isIndividualChat(chat: ChatListItem): chat is IndividualChat {
	return "user" in chat;
}

export interface ReplyMessage {
	id: string;
	content: string;
	type: "text" | "voice" | "file";
	fileName?: string;
	fileSize?: string;
	fileUrl?: string;
	senderName?: string;
}

export interface ChatMessage {
	id: string;
	senderId: string;
	senderName: string;
	senderRole: string;
	senderIsOnline?: boolean;
	senderAvatar: string;
	content?: string;
	timestamp: string;
	originalTimestamp?: string; // ISO timestamp from backend for date separators
	type: "text" | "voice" | "file";
	voiceDuration?: string;
	fileName?: string;
	fileSize?: string;
	fileUrl?: string;
	isPinned?: boolean;
	hasUnread?: boolean;
	replyTo?: ReplyMessage;
	mimeType?: string;
}
