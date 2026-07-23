/** @format */

import { useState, useEffect, useCallback, useRef } from "react";
import {
	useInfiniteQuery,
	useMutation,
	useQueryClient,
	type InfiniteData,
} from "@tanstack/react-query";
import {
	getMessages,
	markMessagesAsRead,
	sendMessage as sendMessageHttp,
} from "@/services/chat/chatService";
import {
	onReceiveMessage,
	sendMessageViaSocket,
} from "@/services/chat/socketService";
import type {
	Message,
	SendMessageRequest,
	PaginatedMessagesResponse,
	Room,
} from "@/services/chat/types";
import { useReadReceipts } from "./useReadReceipts";
// Generate unique ID for client_message_id
const generateClientMessageId = (): string => {
	return `client_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

/**
 * Hook for managing messages with Socket.io integration
 *
 * Best Practices:
 * #3: Use Socket.io for sending (backend saves to DB automatically)
 * #4: Optimistic updates - add message immediately, replace with real ID when backend responds
 * #7: ALWAYS sort messages by timestamp
 * #9: Use callback state updates to prevent race conditions
 * #11: Every message MUST have a unique ID
 * #16: Handle own messages from socket broadcast to prevent duplicates
 */
export const useMessages = (
	roomId: number | null,
	currentUserId: number | null,
	options?: {
		onRoomRead?: (lastMessageId: number) => void;
	}
) => {
	const queryClient = useQueryClient();
	const [messages, setMessages] = useState<Message[]>([]);
	const [isLoadingMore, setIsLoadingMore] = useState(false);
	const pendingMessagesRef = useRef<Map<string, Message>>(new Map());
	const updateRoomsLastMessage = useCallback(
		(nextRoomId: number, nextMessage: Room["last_message"]) => {
			const roomsQueries = queryClient.getQueryCache().findAll({
				queryKey: ["chat", "rooms"],
			});

			roomsQueries.forEach((query) => {
				queryClient.setQueryData<{ data: Room[]; total: number }>(
					query.queryKey,
					(old) => {
						if (!old) return old;

						return {
							...old,
							data: old.data.map((room) => {
								if (room.room_id !== nextRoomId) {
									return room;
								}

								return {
									...room,
									last_message_at: nextMessage?.timestamp || room.last_message_at,
									last_message: nextMessage,
								};
							}),
						};
					}
				);
			});
		},
		[queryClient]
	);

	// Clear messages when room changes
	useEffect(() => {
		setMessages([]);
		pendingMessagesRef.current.clear();
	}, [roomId]);

	// Fetch initial messages from API using infinite query for pagination
	const {
		data: messagesData,
		isLoading,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
	} = useInfiniteQuery<
		PaginatedMessagesResponse,
		Error,
		InfiniteData<PaginatedMessagesResponse>,
		(string | number | null)[],
		number | undefined
	>({
		queryKey: ["chat", "messages", roomId],
		queryFn: async ({ pageParam }: { pageParam: number | undefined }) => {
			if (!roomId) {
				throw new Error("Room ID is required");
			}
			return await getMessages(roomId, pageParam);
		},
		enabled: !!roomId,
		staleTime: 0, // Always consider stale - socket updates should trigger refetches
		refetchOnMount: true, // Always refetch when component mounts
		refetchOnWindowFocus: false, // Don't refetch on window focus
		getNextPageParam: (
			lastPage: PaginatedMessagesResponse | null
		): number | undefined => {
			if (!lastPage || !lastPage.has_more) return undefined;
			const cursor = lastPage.next_cursor;
			return cursor !== null && cursor !== undefined
				? Number(cursor)
				: undefined;
		},
		initialPageParam: undefined,
	});

	// Load messages into state and sort by timestamp (Best Practice #7)
	useEffect(() => {
		if (!messagesData?.pages) return;

		const allMessages: Message[] = [];
		messagesData.pages.forEach((page: PaginatedMessagesResponse) => {
			if (page?.messages && Array.isArray(page.messages)) {
				allMessages.push(...page.messages);
			}
		});

		// Remove duplicates by message_id
		const uniqueMessages = Array.from(
			new Map(allMessages.map((msg) => [msg.message_id, msg])).values()
		);

		// Sort by timestamp (chronological order - oldest first)
		const sortedMessages = uniqueMessages.sort((a, b) => {
			return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
		});

		// Merge with existing messages to preserve any socket messages that arrived before API response
		setMessages((prev) => {
			const merged = [...prev, ...sortedMessages];
			const unique = Array.from(
				new Map(merged.map((msg) => [msg.message_id, msg])).values()
			);
			return unique.sort((a, b) => {
				return (
					new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
				);
			});
		});
	}, [messagesData]);

	// Socket listener for new messages (Best Practice #2: Clean up listeners)
	useEffect(() => {
		if (!roomId || currentUserId === null) return;

		const cleanup = onReceiveMessage((socketMessage: Message) => {
			// Only process messages for current room
			if (socketMessage.room_id !== roomId) return;

			// Handle our own messages (from socket broadcast after sending)
			if (socketMessage.sender_id === currentUserId) {
				const clientId = socketMessage.client_message_id;
				if (clientId && pendingMessagesRef.current.has(clientId)) {
					// This is our own message - replace optimistic message with real one
					setMessages((prev) => {
						const exists = prev.some(
							(msg) => msg.message_id === socketMessage.message_id
						);
						if (exists) return prev; // Already have it with real ID

						// Replace optimistic message with real message from backend
						return prev
							.map((msg) =>
								msg.client_message_id === clientId ? socketMessage : msg
							)
							.sort((a, b) => {
								return (
									new Date(a.timestamp).getTime() -
									new Date(b.timestamp).getTime()
								);
							});
					});
					pendingMessagesRef.current.delete(clientId);
				}
				return; // Don't add our own messages again
			}

			// Message from someone else - add it (with deduplication)
			setMessages((prev) => {
				// Check if message already exists (prevent duplicates)
				const exists = prev.some(
					(msg) => msg.message_id === socketMessage.message_id
				);
				if (exists) return prev;

				// Add new message and sort (Best Practice #7, #9)
				const updated = [...prev, socketMessage];
				return updated.sort((a, b) => {
					return (
						new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
					);
				});
			});
		});

		return cleanup;
	}, [roomId, currentUserId]);

	// Send message via Socket.io for text-only messages, HTTP API for attachments
	// ARCHITECTURE:
	// - Text-only messages: Use Socket.io (faster, real-time)
	// - Messages with attachments: Use HTTP API (requires token for persistence)
	// - Socket broadcasts are still received for all messages for real-time updates
	const sendMessageMutation = useMutation<Message, Error, SendMessageRequest>({
		mutationFn: async (data: SendMessageRequest): Promise<Message> => {
			if (!roomId) {
				throw new Error("No room selected");
			}
			if (currentUserId === null) {
				throw new Error("User not authenticated");
			}

			// Generate client_message_id for idempotency (Best Practice #11)
			const clientMessageId =
				data.client_message_id || generateClientMessageId();
			const payload: SendMessageRequest = {
				...data,
				client_message_id: clientMessageId,
			};

			// Create optimistic message for immediate UI update
			const optimisticMessage: Message = {
				message_id: -1, // Temporary ID, will be replaced by real ID
				room_id: roomId,
				sender_id: currentUserId,
				message_text: data.message_text || null,
				attachment_file_id: data.attachment_file_id || null,
				reply_to_message_id: data.reply_to_message_id || null,
				timestamp: new Date().toISOString(),
				client_message_id: clientMessageId,
				delivery_status: "sent",
				delivered_at: null,
				read_at: null,
				is_duplicate: false,
				// Add optimistic attachment if metadata is provided
				attachment: data._optimistic_attachment_metadata
					? {
							file_id: data.attachment_file_id!,
							storage_path: data._optimistic_attachment_metadata.fileUrl,
							file_url: data._optimistic_attachment_metadata.fileUrl,
							original_filename: data._optimistic_attachment_metadata.fileName,
							mime_type:
								data._optimistic_attachment_metadata.mimeType ||
								"application/octet-stream", // Will be updated from backend
							file_size_kb: data._optimistic_attachment_metadata.fileSize,
					  }
					: undefined,
				replied_to: data._optimistic_reply
					? {
							message_id: data._optimistic_reply.message_id,
							message_text: data._optimistic_reply.message_text,
							sender_id: data._optimistic_reply.sender?.employee_id || 0,
							sender: data._optimistic_reply.sender || null,
							attachment_file_id: data._optimistic_reply.fileName
								? data._optimistic_reply.message_id
								: null,
							attachment: data._optimistic_reply.fileName
								? {
										file_id: data._optimistic_reply.message_id,
										storage_path: data._optimistic_reply.fileUrl || "",
										file_url: data._optimistic_reply.fileUrl || null,
										original_filename: data._optimistic_reply.fileName,
										mime_type: "application/octet-stream",
										file_size_kb: data._optimistic_reply.fileSize ?? null,
								  }
								: undefined,
					  }
					: undefined,
			};

			// Store pending message to track it
			pendingMessagesRef.current.set(clientMessageId, optimisticMessage);

			// Add optimistic message to UI immediately
			setMessages((prev) => {
				const updated = [...prev, optimisticMessage];
				return updated.sort((a, b) => {
					return (
						new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
					);
				});
			});

			updateRoomsLastMessage(roomId, {
				message_id: optimisticMessage.message_id,
				message_text: optimisticMessage.message_text,
				timestamp: optimisticMessage.timestamp,
				sender_id: optimisticMessage.sender_id,
				sender_name: null,
				has_attachment: !!optimisticMessage.attachment_file_id,
				attachment_mime_type: optimisticMessage.attachment?.mime_type || null,
			});

			// Strip optimistic metadata before sending (backend doesn't expect it)
			const cleanPayload = { ...payload };
			delete cleanPayload._optimistic_attachment_metadata;
			delete cleanPayload._optimistic_reply;

			// ROUTING LOGIC:
			// - If message has attachment with token -> Use HTTP API
			// - If text-only message -> Use Socket.io
			const hasAttachment = !!data.attachment_file_id && !!data.attachment_token;

			if (hasAttachment) {
				try {
					const message = await sendMessageHttp(roomId, cleanPayload);

					// Update optimistic message with real message from backend
					setMessages((prev) =>
						prev.map((msg) =>
							msg.client_message_id === clientMessageId
								? message
								: msg
						)
					);

					// Remove from pending
					pendingMessagesRef.current.delete(clientMessageId);

					updateRoomsLastMessage(roomId, {
						message_id: message.message_id,
						message_text: message.message_text,
						timestamp: message.timestamp,
						sender_id: message.sender_id,
						sender_name: null,
						has_attachment: !!message.attachment_file_id,
						attachment_mime_type: message.attachment?.mime_type || null,
					});

					// Socket will broadcast the message to all clients (including us)
					// We'll receive it via onReceiveMessage and update accordingly
					return message;
				} catch (error) {
					// Remove optimistic message on error
					setMessages((prev) =>
						prev.filter((msg) => msg.client_message_id !== clientMessageId)
					);
					pendingMessagesRef.current.delete(clientMessageId);
					throw error;
				}
			} else {
				return new Promise<Message>((resolve, reject) => {
					sendMessageViaSocket(
						{
							roomId,
							...cleanPayload,
						},
						(response) => {
							if (response.error) {
								// Remove optimistic message on error
								setMessages((prev) =>
									prev.filter((msg) => msg.client_message_id !== clientMessageId)
								);
								pendingMessagesRef.current.delete(clientMessageId);
								reject(new Error(response.error));
								return;
							}

							if (!response.success || !response.message_id) {
								reject(new Error("Failed to send message"));
								return;
							}

							// Update optimistic message with real ID from backend
							setMessages((prev) =>
								prev.map((msg) =>
									msg.client_message_id === clientMessageId
										? { ...msg, message_id: response.message_id! }
										: msg
								)
							);

							// Remove from pending
							pendingMessagesRef.current.delete(clientMessageId);

							updateRoomsLastMessage(roomId, {
								message_id: response.message_id,
								message_text: optimisticMessage.message_text,
								timestamp: optimisticMessage.timestamp,
								sender_id: optimisticMessage.sender_id,
								sender_name: null,
								has_attachment: !!optimisticMessage.attachment_file_id,
								attachment_mime_type: optimisticMessage.attachment?.mime_type || null,
							});

							// Return the updated message
							resolve({
								...optimisticMessage,
								message_id: response.message_id,
							});
						}
					);
				});
			}
		},
		onSuccess: () => {
		},
		onError: (error: Error) => {
			console.error("❌ [sendMessageMutation] Failed to send message:", error);
			// Clean up pending messages on error
			pendingMessagesRef.current.clear();
		},
	});

	const sendMessage = useCallback(
		(
			data: SendMessageRequest,
			options?: {
				onSuccess?: () => void;
				onError?: (error: Error) => void;
			}
		): void => {
			sendMessageMutation.mutate(data, {
				onSuccess: () => {
					options?.onSuccess?.();
				},
				onError: (error: Error) => {
					options?.onError?.(error);
				},
			});
		},
		[sendMessageMutation]
	);

	// Mark messages as read
	const markReadMutation = useMutation<void, Error, number>({
		mutationFn: async (lastMessageId: number): Promise<void> => {
			if (!roomId) {
				throw new Error("No room selected");
			}
			await markMessagesAsRead(roomId, { last_message_id: lastMessageId });
		},
		onSuccess: (_data, lastMessageId) => {
			options?.onRoomRead?.(lastMessageId);

			// Invalidate and refetch rooms query to update unread counts immediately
			queryClient.invalidateQueries({
				queryKey: ["chat", "rooms"],
				refetchType: 'active' // Only refetch active queries
			});
			queryClient.invalidateQueries({
				queryKey: ["chat", "unread-total"],
				refetchType: "active",
			});

			if (roomId !== null) {
				// Also update the specific room query
				queryClient.invalidateQueries({
					queryKey: ["chat", "room", roomId],
					refetchType: 'active'
				});
				queryClient.invalidateQueries({
					queryKey: ["chat", "unread", roomId],
					refetchType: 'active'
				});
			}
		},
		onError: (error) => {
			console.error('❌ [markReadMutation] Failed to mark as read:', error);
		}
	});

	// Load more messages
	const loadMore = useCallback(async (): Promise<void> => {
		if (!hasNextPage || isFetchingNextPage || isLoadingMore) return;

		setIsLoadingMore(true);
		try {
			await fetchNextPage();
		} catch (error) {
			console.error("Failed to load more messages:", error);
		} finally {
			setIsLoadingMore(false);
		}
	}, [hasNextPage, isFetchingNextPage, fetchNextPage, isLoadingMore]);

	// Mark messages as read when viewing
	const markAsRead = useCallback(
		(lastMessageId: number): void => {
			if (!roomId) return;
			markReadMutation.mutate(lastMessageId);
		},
		[roomId, markReadMutation]
	);

	// Handle read receipts from other users
	useReadReceipts(messages, setMessages, currentUserId);

	return {
		messages,
		isLoading,
		isLoadingMore,
		hasMore: hasNextPage ?? false,
		loadMore,
		sendMessage,
		isSending: sendMessageMutation.isPending,
		markAsRead,
	} as const;
};
