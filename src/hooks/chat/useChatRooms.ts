/** @format */

import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
	getRooms,
	getRoom,
	createGroupRoom,
	createDirectRoom,
	updateRoom,
	pinRoom,
	unpinRoom,
	getTotalUnread,
} from "@/services/chat/chatService";
import {
	onUnreadTotal,
	onReceiveMessage as onSocketReceiveMessage,
} from "@/services/chat/socketService";
import type {
	Room,
	CreateGroupRoomRequest,
	CreateDirectRoomRequest,
	UpdateRoomRequest,
} from "@/services/chat/types";
import { getCurrentUserId } from "@/utils/auth";

/**
 * React Query hooks for chat rooms
 */
export const useChatRooms = (search?: string) => {
	return useQuery({
		queryKey: ["chat", "rooms", search],
		queryFn: () => getRooms(search),
		staleTime: 0, // Always consider data stale to enable real-time updates
		refetchOnMount: true, // Refetch when component mounts
		refetchOnWindowFocus: false, // Don't refetch on window focus (socket handles this)
	});
};

export const useChatRoom = (roomId: number | null) => {
	return useQuery({
		queryKey: ["chat", "room", roomId],
		queryFn: () => {
			if (!roomId) throw new Error("Room ID is required");
			return getRoom(roomId);
		},
		enabled: !!roomId,
		staleTime: 0, // Always refetch when roomId changes
		refetchOnMount: true, // Refetch when component mounts or roomId changes
		refetchOnWindowFocus: false, // Don't refetch on window focus
		gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
	});
};

export const useCreateGroupRoom = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: CreateGroupRoomRequest) => createGroupRoom(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["chat", "rooms"] });
		},
	});
};

export const useCreateDirectRoom = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: CreateDirectRoomRequest) => createDirectRoom(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["chat", "rooms"] });
		},
	});
};

export const useUpdateRoom = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			roomId,
			data,
		}: {
			roomId: number;
			data: UpdateRoomRequest;
		}) => updateRoom(roomId, data),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: ["chat", "rooms"] });
			queryClient.invalidateQueries({
				queryKey: ["chat", "room", variables.roomId],
			});
		},
	});
};

export const usePinRoom = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (roomId: number) => pinRoom(roomId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["chat", "rooms"] });
		},
	});
};

export const useUnpinRoom = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (roomId: number) => unpinRoom(roomId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["chat", "rooms"] });
		},
	});
};

/**
 * Hook to fetch total unread message count
 */
export const useTotalUnread = () => {
	return useQuery({
		queryKey: ["chat", "unread-total"],
		queryFn: getTotalUnread,
		staleTime: 0,
		refetchOnMount: true,
		refetchOnWindowFocus: false, // Socket handles real-time updates
	});
};

/**
 * Hook to listen for unread total updates via socket
 */
export const useUnreadTotal = () => {
	const queryClient = useQueryClient();

	useEffect(() => {
		const cleanup = onUnreadTotal((data) => {
			// Update unread total in query cache
			queryClient.setQueryData(["chat", "unread-total"], data);
		});

		return cleanup;
	}, [queryClient]);
};

/**
 * Hook to update room's last_message when new message arrives via socket
 */
export const useRoomSocketUpdates = () => {
	const queryClient = useQueryClient();

	useEffect(() => {
		const currentUserId = getCurrentUserId();
		const currentUserIdNum = currentUserId ? Number(currentUserId) : null;

		const cleanup = onSocketReceiveMessage((message) => {
			const isOwnMessage =
				currentUserIdNum !== null && message.sender_id === currentUserIdNum;

			// Update all possible room query keys (with and without search)
			const roomsQueries = queryClient.getQueryCache().findAll({
				queryKey: ["chat", "rooms"],
			});

			roomsQueries.forEach((query) => {
				const queryKey = query.queryKey;
				queryClient.setQueryData<{ data: Room[]; total: number }>(
					queryKey,
					(old) => {
						if (!old) return old;

						const updated = {
							...old,
							data: old.data.map((room) => {
								if (room.room_id === message.room_id) {
									const updatedRoom = {
										...room,
										last_message_at: message.timestamp,
										last_message: {
											message_id: message.message_id,
											message_text: message.message_text,
											timestamp: message.timestamp,
											sender_id: message.sender_id,
											sender_name: null, // Socket doesn't provide sender name
											has_attachment: !!message.attachment_file_id,
											attachment_mime_type: message.attachment?.mime_type || null,
										},
										has_unread: isOwnMessage ? room.has_unread : true,
									};
									return updatedRoom;
								}
								return room;
							}),
						};
						return updated;
					}
				);
			});
		});

		return cleanup;
	}, [queryClient]);
};
