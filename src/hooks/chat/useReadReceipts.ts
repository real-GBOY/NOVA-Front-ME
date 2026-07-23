/** @format */

import { useEffect } from "react";
import { onMessageReadReceipt } from "@/services/chat/socketService";
import type { Message } from "@/services/chat/types";

/**
 * Hook to handle read receipts from other users
 */
export const useReadReceipts = (
	messages: Message[],
	setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
	currentUserId: number | null
) => {
	useEffect(() => {
		if (currentUserId === null) return;

		const cleanup = onMessageReadReceipt((data) => {
			// Update message read status in UI
			setMessages((prev) =>
				prev.map((msg) => {
					// Only update messages that:
					// 1. Are in the same room
					// 2. Have message_id <= lastMessageId (were read)
					// 3. Are not from the current user (we don't mark our own messages as read)
					if (
						msg.room_id === data.roomId &&
						msg.message_id <= data.lastMessageId &&
						msg.sender_id !== currentUserId
					) {
						return {
							...msg,
							delivery_status: "read" as const,
							read_at: data.timestamp,
						};
					}
					return msg;
				})
			);
		});

		return cleanup;
	}, [setMessages, currentUserId]);
};
