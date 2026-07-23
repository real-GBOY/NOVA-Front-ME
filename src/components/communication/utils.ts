/** @format */

import type { Room, RoomMember, UsersResponse } from "@/services/chat/types";
import { buildStorageUrl } from "@/utils/storageUrl";

export const buildMediaUrl = (url?: string | null): string => {
	if (!url) return "";
	return buildStorageUrl(url);
};

/**
 * Find the other member in a direct chat room (the member that is NOT the current user)
 * @param room - The room object
 * @param currentUserId - The current user's employee ID
 * @returns The other member, or null if not found
 */
export function findOtherMember(
	room: Room,
	currentUserId: number | null
): RoomMember | null {
	if (room.room_type !== "direct") {
		return null;
	}

	if (currentUserId === null) {
		// If no current user ID, return first member as fallback
		return room.members.length > 0 ? room.members[0] : null;
	}

	const currentUserIdNum = Number(currentUserId);

	// Find the member that is NOT the current user
	for (const member of room.members) {
		const memberId = Number(member.employee_id);
		if (memberId !== currentUserIdNum) {
			return member;
		}
	}

	// Fallback: return first member if no other member found
	return room.members.length > 0 ? room.members[0] : null;
}

/**
 * Get display name for a room
 * For direct chats: returns the other member's name
 * For group chats: returns the room name
 */
export function getRoomDisplayName(
	room: Room,
	currentUserId: number | null
): string {
	// Groups → use room_name
	if (room.room_type === "group") {
		return room.room_name || "Unnamed Group";
	}

	// Direct chat → find and show the other member's name
	const otherMember = findOtherMember(room, currentUserId);
	if (otherMember) {
		return `${otherMember.first_name} ${otherMember.last_name || ""}`.trim();
	}

	// Fallback
	return room.room_name || "Unknown User";
}

/**
 * Get group initials from a group name
 * Returns first letter of first two words, or first two letters of the name
 */
export function getGroupInitials(name: string): string {
	const words = name.split(" ");
	if (words.length >= 2) {
		return (words[0][0] + words[1][0]).toUpperCase();
	}
	return name.substring(0, 2).toUpperCase();
}

/**
 * Format timestamp in a human-readable format
 * - "Just now" (< 1 minute)
 * - "5m ago" (< 1 hour)
 * - "2h ago" (< 24 hours)
 * - "Yesterday"
 * - "3d ago" (< 7 days)
 * - Time format for today
 * - Date format for older messages
 */
export function formatTimestamp(timestamp: string | null): string {
	if (!timestamp) return "";
	const date = new Date(timestamp);
	const now = new Date();
	const diffMs = now.getTime() - date.getTime();
	const diffMins = Math.floor(diffMs / 60000);
	const diffHours = Math.floor(diffMs / 3600000);
	const diffDays = Math.floor(diffMs / 86400000);

	if (diffMins < 1) return "Just now";
	if (diffMins < 60) return `${diffMins}m ago`;
	if (diffHours < 24) return `${diffHours}h ago`;
	if (diffDays === 1) return "Yesterday";
	if (diffDays < 7) return `${diffDays}d ago`;

	// Format as time if today, otherwise as date
	const isToday = date.toDateString() === now.toDateString();
	if (isToday) {
		return date.toLocaleTimeString("en-US", {
			hour: "numeric",
			minute: "2-digit",
			hour12: true,
		});
	}
	return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/**
 * Resolve avatar URL for a user by checking multiple sources in order.
 * This universal function works the same way for both own and other users,
 * ensuring consistent avatar resolution across all clients.
 *
 * Fallback order:
 * 1. senderProfilesMap (pre-built map for performance)
 * 2. room.members (room member data - works for both direct and group chats)
 * 3. allUsersData (all users list - fallback for missing avatars)
 * 4. Empty string as final fallback
 *
 * @param id - The employee ID to resolve avatar for
 * @param room - The room object containing members
 * @param allUsersData - All users data response
 * @param map - Pre-built map of user IDs to avatar URLs
 * @returns Avatar URL string or empty string if not found
 */
export function resolveAvatar(
	id: number,
	room: Room | null | undefined,
	allUsersData: UsersResponse | undefined,
	_currentUserMember: RoomMember | null | undefined,
	map: Map<number, string>
): string {
	// Universal resolution - same logic for all users (own and others)
	const relativeUrl =
		map.get(id) ||
		room?.members.find((m) => Number(m.employee_id) === id)
			?.profile_picture_url ||
		allUsersData?.data?.find((u) => Number(u.employee_id) === id)
			?.profile_picture_url ||
		"";

	return buildMediaUrl(relativeUrl);
}
