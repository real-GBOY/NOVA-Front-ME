/** @format */

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { Plus as PlusIcon } from "@/Icons";
import SearchInput from "@/designSystem/SearchInput";
import { IndividualChatListItem } from "./individual";
import { GroupChatListItem } from "./group";
import LoadingState from "@/designSystem/LoadingState";
import { useTranslation } from "@/hooks/useTranslation";
import {
	ChatListItem as ChatListItemType,
	isGroupChat,
	isIndividualChat,
	IndividualChat,
	GroupChat,
} from "./types";
import { CreateGroupChatModal, CreateGroupDetailsModal } from "./group";
import IconButton from "@/designSystem/IconButton";
import type { Room, ChatUser } from "@/services/chat/types";
import { getCurrentUserId } from "@/utils/auth";
import {
	useCreateGroupRoom,
	useCreateDirectRoom,
	useOnlineUsers,
} from "@/hooks/chat";
import { getChatUsers } from "@/services/chat/chatService";
import { useQuery } from "@tanstack/react-query";
import Avatar from "@/designSystem/Avatar";
import {
	getRoomDisplayName,
	findOtherMember,
	formatTimestamp,
	buildMediaUrl,
} from "./utils";
import toast from "@/utilities/toast";
import { isEnglishText, cn } from "@/utilities/index";

interface InboxSidebarProps {
	rooms?: Room[];
	isLoading?: boolean;
	searchQuery: string;
	onSearchChange: (value: string) => void;
	onRoomSelect?: (roomId: number | null) => void;
	selectedRoomId?: number | null;
}

// Re-export utility functions for backward compatibility
export { getRoomDisplayName, formatTimestamp } from "./utils";

function InboxSidebar({
	rooms,
	isLoading = false,
	searchQuery,
	onSearchChange,
	onRoomSelect,
	selectedRoomId,
}: InboxSidebarProps) {
	const { t } = useTranslation("common");
	const currentUserId = getCurrentUserId();
	const [searchParams, setSearchParams] = useSearchParams();
	const tabParam = searchParams.get("tab");

	const activeTab: "chats" | "groups" =
		tabParam === "groups" ? "groups" : "chats";

	const handleSearchChange = (value: string) => {
		onSearchChange(value);
	};

	const hasSetDefaultTab = useRef(false);

	useEffect(() => {
		if (!tabParam && !hasSetDefaultTab.current) {
			hasSetDefaultTab.current = true;
			const newParams = new URLSearchParams(searchParams);
			newParams.set("tab", "chats");
			setSearchParams(newParams, { replace: true });
		}
	}, [tabParam, setSearchParams, searchParams]);

	const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);
	const [isCreateGroupDetailsModalOpen, setIsCreateGroupDetailsModalOpen] =
		useState(false);
	const [selectedMembers, setSelectedMembers] = useState<
		Array<{ id: string; name: string; jobTitle: string; avatar?: string }>
	>([]);

	const { isUserOnline } = useOnlineUsers();

	const getMessageType = useCallback((
		lastMessage: Room["last_message"]
	): "text" | "voice" | "file" | undefined => {
		if (!lastMessage) return undefined;

		if (lastMessage.has_attachment && lastMessage.attachment_mime_type) {
			const mimeType = lastMessage.attachment_mime_type.toLowerCase();
			if (mimeType.startsWith('audio/')) return 'voice';
			if (mimeType.startsWith('image/')) return 'file';
			return 'file';
		}

		if (lastMessage.message_text) return 'text';
		return undefined;
	}, []);

	const createGroupRoom = useCreateGroupRoom();
	const createDirectRoom = useCreateDirectRoom();

	const getSenderLabel = (
		room: Room,
		currentUserId: number | null,
		users: ChatUser[] = []
	) => {
		const lastMessage = room.last_message;
		if (!lastMessage) return null;
		if (currentUserId !== null && lastMessage.sender_id === currentUserId) {
			return "You";
		}
		if (lastMessage.sender_name) return lastMessage.sender_name;

		const member = room.members.find(
			(m) => m.employee_id === lastMessage.sender_id
		);
		if (member) {
			return `${member.first_name} ${member.last_name || ""}`.trim();
		}

		const senderUser = users.find(
			(user) => user.employee_id === lastMessage.sender_id
		);
		if (senderUser) {
			return (
				senderUser.full_name ||
				`${senderUser.first_name} ${senderUser.last_name}`.trim()
			);
		}

		if (room.room_type === "direct") {
			return getRoomDisplayName(room, currentUserId);
		}

		return null;
	};

	const getLastMessagePreview = (
		room: Room,
		currentUserId: number | null,
		users: ChatUser[] = []
	) => {
		const lastMessage = room.last_message;
		if (!lastMessage?.message_text) return "";
		const senderLabel = getSenderLabel(room, currentUserId, users);
		return senderLabel
			? `${senderLabel}: ${lastMessage.message_text}`
			: lastMessage.message_text;
	};

	const { data: usersData, isLoading: isLoadingUsers } = useQuery({
		queryKey: ["chat", "users", "all"],
		queryFn: () => getChatUsers(),
		enabled: activeTab === "chats" && !!rooms,
	});

	const convertRoomToChatListItem = useCallback((
		room: Room,
		currentUserId: number | null,
		users: ChatUser[] = []
	): ChatListItemType => {
		if (room.room_type === "direct") {
			const otherMember = findOtherMember(room, currentUserId);

			if (!otherMember) {
				const firstMember = room.members[0];
				const displayName = getRoomDisplayName(room, currentUserId);
				const firstMemberId = firstMember
					? Number(firstMember.employee_id)
					: null;
				const userDetails = firstMemberId ? users.find(u => u.employee_id === firstMemberId) : undefined;
				const avatarUrl =
					normalize(userDetails?.profile_picture_url) ||
					normalize(firstMember?.profile_picture_url) ||
					normalize(room.avatar_url);
				const jobTitle = userDetails?.job_title || "";

				const messageType = getMessageType(room.last_message);
				const isOwnMessage = room.last_message?.sender_id === currentUserId;
				const unreadCount =
					typeof room.unread_count === "number" ? room.unread_count : null;
				const shouldShowUnread =
					unreadCount !== null
						? unreadCount > 0
						: room.has_unread && !isOwnMessage;

				return {
					id: room.room_id.toString(),
					user: {
						id: firstMember?.employee_id.toString() || "",
						name: displayName,
						jobTitle: jobTitle,
						avatar: avatarUrl || undefined,
						isOnline: isUserOnline(firstMemberId),
					},
					lastMessage: getLastMessagePreview(room, currentUserId, users),
					timestamp: formatTimestamp(room.last_message_at),
					isPinned: room.is_pinned,
					hasUnread: shouldShowUnread,
					messageType,
				} as IndividualChat;
			}

			const displayName = getRoomDisplayName(room, currentUserId);
			const otherMemberId = Number(otherMember.employee_id);
			const userDetails = users.find(u => u.employee_id === otherMemberId);
				const avatarUrl =
					normalize(userDetails?.profile_picture_url) ||
					normalize(otherMember.profile_picture_url) ||
					normalize(room.avatar_url);
			const jobTitle = userDetails?.job_title || "";

			const messageType = getMessageType(room.last_message);
			const isOwnMessage = room.last_message?.sender_id === currentUserId;
			const unreadCount =
				typeof room.unread_count === "number" ? room.unread_count : null;
			const shouldShowUnread =
				unreadCount !== null
					? unreadCount > 0
					: room.has_unread && !isOwnMessage;

			return {
				id: room.room_id.toString(),
				user: {
					id: otherMember.employee_id.toString(),
					name: displayName,
					jobTitle: jobTitle,
					avatar: avatarUrl || undefined,
					isOnline: isUserOnline(otherMemberId),
				},
				lastMessage: getLastMessagePreview(room, currentUserId, users),
				timestamp: formatTimestamp(room.last_message_at),
				isPinned: room.is_pinned,
				hasUnread: shouldShowUnread,
				messageType,
			} as IndividualChat;
		} else {
			const displayName = getRoomDisplayName(room, currentUserId);
			const messageType = getMessageType(room.last_message);
			const isOwnMessage = room.last_message?.sender_id === currentUserId;
			const unreadCount =
				typeof room.unread_count === "number" ? room.unread_count : null;
			const shouldShowUnread =
				unreadCount !== null
					? unreadCount > 0
					: room.has_unread && !isOwnMessage;

			return {
				id: room.room_id.toString(),
				name: displayName,
				avatar: room.avatar_url || undefined,
				members: room.members.map((m) => {
					const memberId = Number(m.employee_id);
					const memberDetails = users.find((u) => u.employee_id === memberId);
					const avatar =
						normalize(m.profile_picture_url) ||
						normalize(memberDetails?.profile_picture_url) ||
						undefined;
					return {
						id: m.employee_id.toString(),
						name: `${m.first_name} ${m.last_name || ""}`.trim(),
						role: "",
						avatar,
					isOnline: isUserOnline(memberId),
				};
			}),
			memberCount: room.members.length,
			onlineCount: room.members.filter((m) =>
				isUserOnline(Number(m.employee_id))
			).length,
			lastMessage: getLastMessagePreview(room, currentUserId, users),
			timestamp: formatTimestamp(room.last_message_at),
			isPinned: room.is_pinned,
			hasUnread: shouldShowUnread,
			messageType,
			} as GroupChat;
		}
	}, [isUserOnline, getMessageType]);

	const filteredRooms = useMemo(() => {
		if (!rooms) return [];

		return rooms.filter((room) => {
			const hasMultipleMembers = room.members.length > 1;
			const hasOtherMember = room.members.some((m) => m.employee_id !== currentUserId);

			return room.room_type !== "direct" || (hasMultipleMembers && hasOtherMember);
		});
	}, [rooms, currentUserId]);

	const chatListItems = useMemo(() => {
		if (filteredRooms) {
			return filteredRooms.map((room) =>
				convertRoomToChatListItem(room, currentUserId, usersData?.data || [])
			);
		}
		return [];
	}, [filteredRooms, currentUserId, convertRoomToChatListItem, usersData]);

	const directChats = useMemo(() => {
		return chatListItems.filter((chat) => isIndividualChat(chat));
	}, [chatListItems]);

	const groupChats = useMemo(() => {
		return chatListItems.filter((chat) => isGroupChat(chat));
	}, [chatListItems]);
	const hasUnreadChats = useMemo(
		() => directChats.some((chat) => chat.hasUnread),
		[directChats]
	);
	const hasUnreadGroups = useMemo(
		() => groupChats.some((chat) => chat.hasUnread),
		[groupChats]
	);

	const handleCreateGroup = async (groupName: string, avatar?: { fileId: number; token: string }) => {
		if (selectedMembers.length === 0) return;

		try {
			
			// Include current user in member_ids (creator must be a member)
			const memberIds = selectedMembers.map((m) => parseInt(m.id, 10));
			if (currentUserId && !memberIds.includes(currentUserId)) {
				memberIds.push(currentUserId);
			}
			
			const newRoom = await createGroupRoom.mutateAsync({
				name: groupName,
				member_ids: memberIds,
				...(avatar && { avatar }), // Send avatar object with fileId and token
			});
			
			setIsCreateGroupDetailsModalOpen(false);
			setSelectedMembers([]);
			setSearchParams({ tab: "groups" }, { replace: false });
			onRoomSelect?.(newRoom.room_id);
		} catch (error: unknown) {
			console.error('❌ [InboxSidebar] Failed to create group:', error);
			// Show user-friendly error message
			const err = error as { response?: { data?: { message?: string } }; message?: string };
			const errorMessage = err?.response?.data?.message || err?.message || 'Failed to create group';
			toast.error(`Error creating group: ${errorMessage}`);
		}
	};

	const handleUserClick = async (user: ChatUser) => {
		try {
			if (rooms) {
				const existingRoom = rooms.find(
					(room) =>
						room.room_type === "direct" &&
						room.members.some((m) => m.employee_id === user.employee_id)
				);

				if (existingRoom) {
					setSearchParams({ tab: "chats" }, { replace: false });
					onRoomSelect?.(existingRoom.room_id);
					return;
				}
			}

			const newRoom = await createDirectRoom.mutateAsync({
				employee_id: user.employee_id,
			});
			setSearchParams({ tab: "chats" }, { replace: false });
			onRoomSelect?.(newRoom.room_id);
		} catch (error) {
			console.error("Failed to create direct room:", error);
		}
	};

	const currentFilteredList = activeTab === "chats" ? directChats : groupChats;

	// Auto-select room when navigating with search query (e.g., from "Send Message" button)
	useEffect(() => {
		if (searchQuery && currentFilteredList.length > 0 && !selectedRoomId) {
			const firstMatch = currentFilteredList[0];
			const roomId = parseInt(firstMatch.id, 10);
			if (!isNaN(roomId) && roomId > 0) {
				onRoomSelect?.(roomId);
			}
		}
	}, [searchQuery, currentFilteredList, selectedRoomId, onRoomSelect]);

	return (
		<div className='w-full md:max-w-[360px] h-full flex flex-col bg-background rounded-[16px] border border-border overflow-hidden md:flex-shrink-0'>
			<div className='px-4 pt-4 pb-3 border-b border-border'>
				<h2 className={cn('text-sm font-semibold text-text-strong mb-3', isEnglishText(t("inboxSidebar.title", "Inbox")) && 'font-english')}>
					{t("inboxSidebar.title", "Inbox")}
				</h2>
				<div className='flex items-center gap-2'>
					<SearchInput
						value={searchQuery}
						onChange={handleSearchChange}
						placeholder={t("inboxSidebar.searchPlaceholder", "Search chats...")}
					/>
					<IconButton
						Icon={PlusIcon}
						ariaLabel={t("inboxSidebar.createGroup", "Create group")}
						onClick={() => setIsCreateGroupModalOpen(true)}
						className='h-11 w-11 rounded-[10px]'
					/>
				</div>
			</div>

			<div className='px-4 pt-3 pb-2 border-b border-border'>
				<div className='inline-flex w-full max-w-[328px] h-[32px] items-stretch bg-bg-weak p-0.5 rounded-lg gap-[6px]'>
					<button
						onClick={() => {
							const newParams = new URLSearchParams(searchParams);
							newParams.set("tab", "chats");
							setSearchParams(newParams, { replace: false });
							if (directChats.length > 0) {
								onRoomSelect?.(parseInt(directChats[0].id, 10));
							}
						}}
						className={cn(
							"flex-1 text-xs font-medium rounded-md",
							activeTab === "chats"
								? "bg-background text-text-strong shadow-sm"
								: "text-text-soft hover:bg-background/50 bg-transparent border-0",
							isEnglishText(t("inboxSidebar.chats")) && "font-english"
						)}>
						<span className="inline-flex items-center gap-2">
							{t("inboxSidebar.chats")}
							{hasUnreadChats && (
								<span className="inline-flex h-2 w-2 rounded-full bg-primary" />
							)}
						</span>
					</button>
					<button
						onClick={() => {
							const newParams = new URLSearchParams(searchParams);
							newParams.set("tab", "groups");
							setSearchParams(newParams, { replace: false });
							if (groupChats.length > 0) {
								onRoomSelect?.(parseInt(groupChats[0].id, 10));
							}
						}}
						className={cn(
							"flex-1 text-xs font-medium rounded-md",
							activeTab === "groups"
								? "bg-background text-text-strong shadow-sm"
								: "text-text-soft hover:bg-background/50 bg-transparent border-0",
							isEnglishText(t("inboxSidebar.groups")) && "font-english"
						)}>
						<span className="inline-flex items-center gap-2">
							{t("inboxSidebar.groups")}
							{hasUnreadGroups && (
								<span className="inline-flex h-2 w-2 rounded-full bg-primary" />
							)}
						</span>
					</button>
				</div>
			</div>

			<div className='flex-1 overflow-y-auto scrollbar-hide'>
				{activeTab === "chats" ? (
					(isLoading || isLoadingUsers) ? (
						<LoadingState size="medium" label={t("loading.general")} />
					) : (
						<>
							{currentFilteredList.map((chat) => {
								const roomId = parseInt(chat.id, 10);
								const isActive = selectedRoomId !== null &&
									  selectedRoomId !== undefined &&
									  selectedRoomId === roomId;

								const handleChatClick = () => {
									if (!isNaN(roomId) && roomId > 0) {
										onRoomSelect?.(roomId);
									}
								};

								return (
									<div key={chat.id} className={isActive ? "bg-bg-weak" : ""}>
										{isIndividualChat(chat) ? (
											<IndividualChatListItem
												chat={{ ...chat, isActive }}
												onClick={handleChatClick}
											/>
										) : (
											<GroupChatListItem
												chat={{ ...chat, isActive }}
												onClick={handleChatClick}
											/>
										)}
									</div>
								);
							})}
							
							{usersData?.data && usersData.data.length > 0 && (
								<>
									{currentFilteredList.length > 0 && (
										<div className='px-4 py-2 border-t border-border'>
											<p className={cn('text-xs font-medium text-text-soft uppercase tracking-wide', isEnglishText(t("inboxSidebar.startNewChat")) && 'font-english')}>
												{t("inboxSidebar.startNewChat")}
											</p>
										</div>
									)}
									{usersData.data
										.filter((user) => {
											if (user.employee_id === currentUserId) return false;
											if (rooms) {
												const hasDirectRoom = rooms.some(
													(room) =>
														room.room_type === "direct" &&
														room.members.some(
															(m) => m.employee_id === user.employee_id
														)
												);
												if (hasDirectRoom) return false;
											}
											return !directChats.some((chat) => {
												if (isIndividualChat(chat)) {
													return chat.user.id === user.employee_id.toString();
												}
												return false;
											});
										})
										.map((user) => (
											<div
												key={user.employee_id}
												className='flex flex-col items-start p-4 gap-2 h-[94px] cursor-pointer bg-background border-b border-border hover:bg-bg-weak transition-colors'
												onClick={() => handleUserClick(user)}>
												<div className='flex flex-row items-start p-0 gap-3 w-full'>
													<Avatar
														src={normalize(user.profile_picture_url)}
														alt={
															user.full_name ||
															`${user.first_name} ${user.last_name}`
														}
														size='md'
														showOnlineIndicator={false}
													/>
													<div className='flex flex-col items-start p-0 gap-1 flex-1 min-w-0'>
														<div className='flex flex-col items-start p-0 gap-0.5 w-full'>
															<div className='flex flex-row justify-between items-center p-0 gap-2 w-full h-5'>
																<h3 className={cn('text-sm font-medium text-text-strong leading-5 tracking-[-0.006em] flex-1', isEnglishText(user.full_name || `${user.first_name} ${user.last_name}`) && 'font-english')}>
																	{user.full_name ||
																		`${user.first_name} ${user.last_name}`}
																</h3>
															</div>
															<p className={cn('text-xs font-normal text-text-soft leading-4 w-full h-4', isEnglishText(user.job_title) && 'font-english')}>
																{user.job_title || ""}
															</p>
														</div>
													</div>
												</div>
											</div>
										))}
								</>
							)}
							{currentFilteredList.length === 0 &&
								(!usersData?.data || usersData.data.length === 0) && (
									<div className='flex justify-center items-center h-full'>
										<p className={cn('text-text-weak', isEnglishText(searchQuery ? t("inboxSidebar.noChatsFound") : t("inboxSidebar.noChatsYet")) && 'font-english')}>
											{searchQuery ? t("inboxSidebar.noChatsFound") : t("inboxSidebar.noChatsYet")}
										</p>
									</div>
								)}
						</>
					)
				) : isLoading ? (
					<div className='flex justify-center items-center h-full'>
						<p className={cn('text-text-weak', isEnglishText(t("inboxSidebar.loadingGroups")) && 'font-english')}>{t("inboxSidebar.loadingGroups")}</p>
					</div>
				) : currentFilteredList.length === 0 ? (
					<div className='flex justify-center items-center h-full'>
						<p className={cn('text-text-weak', isEnglishText(searchQuery ? t("inboxSidebar.noGroupsFound") : t("inboxSidebar.noGroupsYet")) && 'font-english')}>
							{searchQuery ? t("inboxSidebar.noGroupsFound") : t("inboxSidebar.noGroupsYet")}
						</p>
					</div>
				) : (
					currentFilteredList.map((chat) => {
						const roomId = parseInt(chat.id, 10);
						const isActive = selectedRoomId !== null &&
							  selectedRoomId !== undefined &&
							  selectedRoomId === roomId;

						const handleChatClick = () => {
							onRoomSelect?.(roomId);
						};

						return (
							<div key={chat.id} className={isActive ? "bg-bg-weak" : ""}>
								{isIndividualChat(chat) ? (
									<IndividualChatListItem
										chat={{ ...chat, isActive }}
										onClick={handleChatClick}
									/>
								) : (
									<GroupChatListItem
										chat={{ ...chat, isActive }}
										onClick={handleChatClick}
									/>
								)}
							</div>
						);
					})
				)}
			</div>

			<CreateGroupChatModal
				isOpen={isCreateGroupModalOpen}
				onClose={() => {
					setIsCreateGroupModalOpen(false);
					setSelectedMembers([]);
				}}
				onNext={(members) => {
					setSelectedMembers(members);
					setIsCreateGroupModalOpen(false);
					setIsCreateGroupDetailsModalOpen(true);
				}}
			/>

			<CreateGroupDetailsModal
				isOpen={isCreateGroupDetailsModalOpen}
				onClose={() => {
					setIsCreateGroupDetailsModalOpen(false);
					setSelectedMembers([]);
				}}
				onBack={() => {
					setIsCreateGroupDetailsModalOpen(false);
					setIsCreateGroupModalOpen(true);
				}}
				onCreate={handleCreateGroup}
				selectedMembers={selectedMembers}
				isCreating={createGroupRoom.isPending}
			/>
		</div>
	);
}

export default InboxSidebar;
	const normalize = (url?: string | null) =>
		!url || url.startsWith("http") ? url || undefined : buildMediaUrl(url);
