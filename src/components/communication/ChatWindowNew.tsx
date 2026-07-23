/** @format */

import {
   useState,
   useEffect,
   useRef,
   useCallback,
   useMemo,
   type ReactNode,
} from "react";
import { useQuery } from "@tanstack/react-query";
import { IndividualChatHeader } from "./individual";
import { GroupChatHeader } from "./group";
import { MessageInput, ChatEmptyState } from "./shared";
import { MessageList } from "./MessageList";
import {
   useChatRoom,
   useChatRoomQuery,
   useMessages,
   useTypingIndicator,
   useOnlineUsers,
   useMarkAsRead,
} from "@/hooks/chat";
import { useFileUpload } from "@/hooks/useFileUpload";
import { getChatUsers } from "@/services/chat/chatService";
import { getCurrentUserId } from "@/utils/auth";
import { useGetEmployeeDetails } from "@/hooks/employees/employee.queries";
import type { Message, RoomMember, ChatUser } from "@/services/chat/types";
import type { ChatMessage } from "./types";
import { findOtherMember, resolveAvatar, buildMediaUrl } from "./utils";
import { convertMessage } from "./messageUtils";
import { ArrowDownSLine } from "@/Icons";

interface ChatWindowNewProps {
   roomId: number | null;
   onBack?: () => void;
   onRoomRead?: (lastMessageId: number) => void;
   isReadOnly?: boolean;
   accessDeniedMessage?: string;
   accessDeniedSubMessage?: string;
   accessDeniedAction?: ReactNode;
}

function ChatWindowNew({
   roomId,
   onBack,
   onRoomRead,
   isReadOnly: isReadOnlyOverride,
   accessDeniedMessage,
   accessDeniedSubMessage,
   accessDeniedAction,
}: ChatWindowNewProps) {
   const currentUserId = getCurrentUserId();
   const currentUserIdNum = currentUserId ? Number(currentUserId) : null;
   const messagesEndRef = useRef<HTMLDivElement>(null);
   const messagesContainerRef = useRef<HTMLDivElement>(null);

   const [messageValue, setMessageValue] = useState<string>("");
   const [replyingTo, setReplyingTo] = useState<Message | null>(null);
   const [hasScrolledToUnread, setHasScrolledToUnread] = useState(false);
   const [showScrollButton, setShowScrollButton] = useState(false);
   const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

   // Load last close time when entering room
   // REMOVED

   // Save current time when leaving room (unmount)
   // REMOVED

   const {
      data: room,
      isLoading: isLoadingRoom,
      error: roomError,
   } = useChatRoomQuery(roomId);

   const { data: currentUserDetails } = useGetEmployeeDetails(
      currentUserId ?? 0,
      { enabled: !!currentUserId }
   );

   useChatRoom(roomId);

   const {
      messages,
      isLoading: isLoadingMessages,
      hasMore,
      loadMore,
      sendMessage,
      markAsRead,
   } = useMessages(roomId || 0, currentUserIdNum || 0, {
      onRoomRead,
   });

   // Import useFileUpload here? No, it's a hook.
   // I need to import it at top level.
   const { uploadFile } = useFileUpload();

   const { typingUsers, handleTyping, handleStopTyping } =
      useTypingIndicator(roomId);

   const { isUserOnline } = useOnlineUsers();

   // Automatically mark messages as read
   useMarkAsRead(messages, roomId, currentUserIdNum, markAsRead);

   // Extract room type checks to avoid repetition
   const isDirect = room?.room_type === "direct";
   const isGroup = room?.room_type === "group";
   const isReadOnly = isReadOnlyOverride ?? room?.is_archived ?? false;

   const otherMember = useMemo(() => {
      if (!room || !isDirect) return null;
      return findOtherMember(room, currentUserIdNum);
   }, [room, isDirect, currentUserIdNum]);

   // Fetch all users for avatar fallback (needed for both direct and group chats)
   const { data: allUsersData } = useQuery({
      queryKey: ["chat", "users", "all"],
      queryFn: () => getChatUsers(),
      staleTime: 2 * 60 * 1000,
      refetchOnMount: true,
   });

   const normalizeMedia = useCallback(
      (url?: string | null) =>
         !url || url.startsWith("http") ? url || "" : buildMediaUrl(url),
      []
   );

   // Build avatar map for performance optimization - memoize by room ID and user data version
   // Note: resolveAvatar has fallbacks, so this map is just for speed
   const senderProfilesMap = useMemo(() => {
      const map = new Map<number, string>();

      // Add all room members' profile pictures
      if (room?.members) {
         room.members.forEach((member: RoomMember) => {
            const memberId = Number(member.employee_id);
            const avatarCandidate =
               member.profile_picture_url || (member as any).avatar;
            if (avatarCandidate) {
               map.set(memberId, normalizeMedia(avatarCandidate));
            }
         });
      }

      // Add current user's profile picture (fallback for own messages)
      if (
         currentUserIdNum &&
         currentUserDetails?.personal?.profile_picture_url
      ) {
         map.set(
            currentUserIdNum,
            normalizeMedia(currentUserDetails.personal.profile_picture_url)
         );
      }

      // Add all users from the users list (fallback for missing avatars)
      if (allUsersData?.data) {
         allUsersData.data.forEach((user: ChatUser) => {
            const userId = Number(user.employee_id);
            if (user.profile_picture_url && !map.has(userId)) {
               map.set(userId, normalizeMedia(user.profile_picture_url));
            }
         });
      }

      return map;
   }, [
      room?.members,
      allUsersData?.data,
      normalizeMedia,
      currentUserDetails?.personal?.profile_picture_url,
      currentUserIdNum,
   ]);

   // Scroll to bottom helper
   const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
      messagesEndRef.current?.scrollIntoView({ behavior, block: "end" });
   }, []);

   // Check if user is near bottom of scroll
   const isNearBottom = useCallback(() => {
      const container = messagesContainerRef.current;
      if (!container) return true;

      const threshold = 150; // pixels from bottom
      const { scrollTop, scrollHeight, clientHeight } = container;
      return scrollHeight - scrollTop - clientHeight < threshold;
   }, []);

   // Handle scroll event to show/hide scroll button
   const handleScroll = useCallback(() => {
      const container = messagesContainerRef.current;
      if (!container) return;

      const atBottom = isNearBottom();
      setShowScrollButton(!atBottom);
   }, [isNearBottom]);

   // Scroll logic: scroll to bottom on initial load and when sending messages
   useEffect(() => {
      if (!roomId || messages.length === 0) return;

      // On initial load, scroll to bottom immediately
      if (!hasScrolledToUnread) {
         scrollToBottom("auto");
         setHasScrolledToUnread(true);
         return;
      }

      // Auto-scroll to bottom only if user is already near bottom
      // This prevents interrupting users reading old messages
      if (isNearBottom()) {
         scrollToBottom("smooth");
      }
   }, [messages, roomId, hasScrolledToUnread, isNearBottom, scrollToBottom]);

   // Reset scroll flag when room changes
   useEffect(() => {
      setHasScrolledToUnread(false);
      setShowScrollButton(false);
   }, [roomId]);

   const handleTypingChange = (value: string) => {
      setMessageValue(value);
      handleTyping();

      if (typingTimeoutRef.current) {
         clearTimeout(typingTimeoutRef.current);
      }
   };

   useEffect(() => {
      const timeoutRef = typingTimeoutRef.current;
      return () => {
         if (timeoutRef) {
            clearTimeout(timeoutRef);
         }
      };
   }, []);

   const handleReply = useCallback(
      (message: ChatMessage) => {
         const originalMessage = messages.find(
            (msg) => msg.message_id.toString() === message.id
         );
         if (originalMessage) {
            setReplyingTo(originalMessage);
         }
      },
      [messages]
   );

   const buildOptimisticReply = useCallback(() => {
      if (!replyingTo) return undefined;

      const replyType: ChatMessage["type"] = replyingTo.attachment_file_id
         ? replyingTo.attachment?.mime_type?.startsWith("audio")
            ? "voice"
            : "file"
         : "text";

      return {
         message_id: replyingTo.message_id,
         message_text:
            replyingTo.message_text ||
            replyingTo.attachment?.original_filename ||
            null,
         type: replyType,
         fileName: replyingTo.attachment?.original_filename || undefined,
         fileSize: replyingTo.attachment?.file_size_kb || undefined,
         fileUrl:
            replyingTo.attachment?.file_url ||
            replyingTo.attachment?.storage_path ||
            undefined,
         sender: replyingTo.sender
            ? {
                 employee_id: replyingTo.sender.employee_id,
                 first_name: replyingTo.sender.first_name,
                 last_name: replyingTo.sender.last_name,
                 email: replyingTo.sender.email,
              }
            : undefined,
      };
   }, [replyingTo]);

   const handleSend = useCallback(() => {
      if (!messageValue.trim() || !roomId) return;

      // Immediate UI update
      const textToSend = messageValue.trim();
      setMessageValue("");
      setReplyingTo(null);
      handleStopTyping();

      // Scroll to bottom immediately when sending
      setTimeout(() => {
         scrollToBottom("smooth");
      }, 0);

      const optimisticReply = buildOptimisticReply();

      sendMessage(
         {
            message_text: textToSend,
            reply_to_message_id: replyingTo?.message_id,
            _optimistic_reply: optimisticReply,
         },
         {
            onError: () => {
               console.error("Message send failed");
            },
         }
      );
   }, [
      messageValue,
      roomId,
      sendMessage,
      replyingTo,
      buildOptimisticReply,
      handleStopTyping,
      scrollToBottom,
   ]);

   // Handle file attachment
   const handleAttachFile = useCallback(
      (
         fileId: number,
         token: string,
         fileName: string,
         fileUrl: string,
         fileSizeBytes: number
      ) => {
         if (!roomId) return;

         // Immediate UI update
         setReplyingTo(null);
         setTimeout(() => {
            scrollToBottom("smooth");
         }, 0);

         // Convert bytes to KB for backend
         const fileSizeKB = Math.round(fileSizeBytes / 1024);

         const optimisticReply = buildOptimisticReply();

         const payload = {
            message_text: undefined, // Explicitly undefined for file-only messages
            attachment_file_id: fileId,
            attachment_token: token, // Include token for backend consumption
            reply_to_message_id: replyingTo?.message_id,
            // Metadata for optimistic UI update
            _optimistic_attachment_metadata: {
               fileName,
               fileSize: fileSizeKB,
               fileUrl,
            },
            _optimistic_reply: optimisticReply,
         };

         sendMessage(payload, {
            onError: (error) => {
               console.error(`[File Attachment] Failed to send file:`, error);
            },
         });
      },
      [roomId, sendMessage, replyingTo, buildOptimisticReply, scrollToBottom]
   );

   const handleVoiceMessage = useCallback(
      async (audioBlob: Blob) => {
         if (!roomId) return;

         // Determine extension based on blob type
         const mimeType = audioBlob.type;
         let extension = "webm";
         if (mimeType.includes("mp4")) extension = "mp4";
         else if (mimeType.includes("ogg")) extension = "ogg";
         else if (mimeType.includes("wav")) extension = "wav";

         // Create a File object from Blob
         const file = new File([audioBlob], `voice_message.${extension}`, {
            type: mimeType,
         });

         try {
            const result = await uploadFile(file, {
               purpose: "chat_attachment",
            });

            const optimisticReply = buildOptimisticReply();

            // Immediate UI update
            setReplyingTo(null);
            setTimeout(() => {
               scrollToBottom("smooth");
            }, 0);

            // Send message with token for backend consumption
            sendMessage(
               {
                  message_text: undefined,
                  attachment_file_id: result.fileId,
                  attachment_token: result.token, // Include token
                  reply_to_message_id: replyingTo?.message_id,
                  _optimistic_attachment_metadata: {
                     fileName: file.name,
                     fileSize: Math.round(file.size / 1024),
                     fileUrl: result.fileUrl,
                     mimeType: file.type,
                  },
                  _optimistic_reply: optimisticReply,
               },
               {
                  onError: (error) => {
                     console.error(`[Voice Message] Failed to send:`, error);
                  },
               }
            );
         } catch (error) {
            console.error("Failed to upload voice message:", error);
         }
      },
      [
         roomId,
         uploadFile,
         sendMessage,
         replyingTo,
         buildOptimisticReply,
         scrollToBottom,
      ]
   );

   const currentUser = useMemo(() => {
      if (!room || !isDirect || !otherMember) return null;

      const memberId = Number(otherMember.employee_id);
      if (currentUserIdNum !== null && memberId === currentUserIdNum) {
         return null;
      }

      const displayName =
         room.room_name?.trim() ||
         `${otherMember.first_name} ${otherMember.last_name || ""}`.trim();

      const resolvedAvatar = resolveAvatar(
         memberId,
         room,
         allUsersData,
         null,
         senderProfilesMap
      );
      const avatarUrl =
         normalizeMedia(
            resolvedAvatar ||
               otherMember.profile_picture_url ||
               (otherMember as any).avatar
         ) || undefined;

      // Find job title from allUsersData
      const userFromList = allUsersData?.data?.find(
         (u: ChatUser) => Number(u.employee_id) === memberId
      );
      const jobTitle = userFromList?.job_title || "";

      return {
         id: otherMember.employee_id.toString(),
         name: displayName,
         jobTitle,
         avatar: avatarUrl,
         isOnline: isUserOnline(memberId),
      };
   }, [
      room,
      isDirect,
      otherMember,
      currentUserIdNum,
      isUserOnline,
      senderProfilesMap,
      allUsersData,
      normalizeMedia,
   ]);

   const currentGroup = useMemo(() => {
      if (!room || !isGroup) return undefined;

      return {
         id: room.room_id.toString(),
         name: room.room_name || "Unnamed Group",
         avatar: room.avatar_url || undefined,
         members: room.members.map((m: RoomMember) => {
            const memberId = Number(m.employee_id);
            return {
               id: m.employee_id.toString(),
               name: `${m.first_name} ${m.last_name || ""}`.trim(),
               role: "",
               avatar: resolveAvatar(
                  memberId,
                  room,
                  allUsersData,
                  null,
                  senderProfilesMap
               ) || undefined,
               isOnline: isUserOnline(memberId),
            };
         }),
         memberCount: room.members.length,
         onlineCount: room.members.filter((m: RoomMember) =>
            isUserOnline(Number(m.employee_id))
         ).length,
         lastMessage: room.last_message?.message_text || "",
         timestamp: room.last_message_at || room.created_at,
         isPinned: room.is_pinned,
         hasUnread: room.has_unread,
      };
   }, [
      room,
      isGroup,
      isUserOnline,
      allUsersData,
      senderProfilesMap,
   ]);

   // Wrap imported convertMessage to pass dependencies
   const convertMessageWithDeps = useCallback(
      (msg: Message): ChatMessage => {
         return convertMessage(
            msg,
            room,
            currentUserIdNum,
            senderProfilesMap,
            allUsersData
         );
      },
      [room, currentUserIdNum, senderProfilesMap, allUsersData]
   );

   // Memoize message conversion to avoid re-computing on every render
   const uiMessages = useMemo(
      () => messages.map(convertMessageWithDeps),
      [messages, convertMessageWithDeps]
   );

   // Helper function to format date separators (Today, Yesterday, or date)
   // Memoized to prevent re-creation on every render
   const formatDateSeparator = useCallback((timestamp: string) => {
      const msgDate = new Date(timestamp);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      // Reset time to midnight for accurate day comparison
      const msgDay = new Date(
         msgDate.getFullYear(),
         msgDate.getMonth(),
         msgDate.getDate()
      );
      const todayDay = new Date(
         today.getFullYear(),
         today.getMonth(),
         today.getDate()
      );
      const yesterdayDay = new Date(
         yesterday.getFullYear(),
         yesterday.getMonth(),
         yesterday.getDate()
      );

      if (msgDay.getTime() === todayDay.getTime()) {
         return "Today";
      } else if (msgDay.getTime() === yesterdayDay.getTime()) {
         return "Yesterday";
      } else {
         return msgDate.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year:
               msgDate.getFullYear() !== today.getFullYear()
                  ? "numeric"
                  : undefined,
         });
      }
   }, []);

   // Process messages to add separators (Date)
   const processedItems = useMemo(() => {
      const result: Array<{
         type: "message" | "date";
         data?: ChatMessage;
         date?: string;
      }> = [];
      let lastDate = "";

      // Use originalTimestamp from converted message (no need for messages array)
      uiMessages.forEach((msg) => {
         const fullTimestamp = msg.originalTimestamp || msg.timestamp;

         // Date Separator
         const displayDate = formatDateSeparator(fullTimestamp);

         if (displayDate !== lastDate) {
            result.push({ type: "date", date: displayDate });
            lastDate = displayDate;
         }

         result.push({ type: "message", data: msg });
      });

      return result;
   }, [uiMessages, formatDateSeparator]); // Removed 'messages' dependency

   // Memoize replyingTo message conversion
   const replyingToMessage = useMemo(
      () => (replyingTo ? convertMessageWithDeps(replyingTo) : undefined),
      [replyingTo, convertMessageWithDeps]
   );

   if (!roomId) {
      return (
         <ChatEmptyState
            message="Select a chat to start messaging"
            subMessage="Choose a chat from the left to view messages."
         />
      );
   }

   if (isLoadingRoom) {
      return <ChatEmptyState message="Loading room..." />;
   }

   if (roomError) {
      const errorStatus =
         typeof roomError === "object" && roomError && "response" in roomError
            ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (roomError as any).response?.status
            : null;
      if (errorStatus === 403) {
         return (
            <ChatEmptyState
               message={accessDeniedMessage || "Access denied"}
               subMessage={
                  accessDeniedSubMessage ||
                  "You are not a member of this room yet."
               }
               action={accessDeniedAction}
            />
         );
      }
      return (
         <ChatEmptyState
            message="Error loading room. Please try again."
            subMessage={
               roomError instanceof Error ? roomError.message : undefined
            }
         />
      );
   }

   if (!room) {
      return <ChatEmptyState message="Room not found" />;
   }

   return (
      <div className="h-full flex-1 flex flex-col bg-bg-weak rounded-[14px] md:rounded-[18px] border border-border p-2 md:p-3 min-w-0 overflow-hidden">
         {isGroup && currentGroup ? (
            <GroupChatHeader group={currentGroup} onBack={onBack} />
         ) : isDirect && currentUser ? (
            <IndividualChatHeader
               user={currentUser}
               roomAvatarUrl={room?.avatar_url || null}
               onBack={onBack}
            />
         ) : null}

         <div className="mt-2 md:mt-3 flex-1 flex flex-col rounded-[14px] md:rounded-[18px] overflow-hidden relative min-h-0">
            <div
               ref={messagesContainerRef}
               onScroll={handleScroll}
               className="flex-1 overflow-y-auto bg-bg-weak p-3 md:p-6 pb-0 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
               {hasMore && (
                  <div className="flex justify-center mb-4">
                     <button
                        onClick={loadMore}
                        className="px-4 py-2 text-sm bg-background rounded-lg hover:bg-bg-weak">
                        Load older messages
                     </button>
                  </div>
               )}

               {isLoadingMessages && messages.length === 0 ? (
                  <div className="flex justify-center items-center h-full">
                     <p className="text-text-weak">Loading messages...</p>
                  </div>
               ) : uiMessages.length === 0 ? (
                  <div className="flex justify-center items-center h-full">
                     <p className="text-text-weak">
                        No messages yet. Start the conversation!
                     </p>
                  </div>
               ) : (
                  <>
                     <MessageList
                        items={processedItems}
                        currentUserId={currentUserIdNum || 0}
                        onReply={handleReply}
                        messagesEndRef={messagesEndRef}
                        isUserOnline={isUserOnline}
                     />
                     {typingUsers.length > 0 && (
                        <div className="text-sm text-text-weak italic">
                           {typingUsers.map((u) => u.userName).join(", ")}{" "}
                           {typingUsers.length === 1 ? "is" : "are"} typing...
                        </div>
                     )}
                  </>
               )}
            </div>

            {/* Scroll to bottom button */}
            {showScrollButton && (
               <button
                  onClick={() => scrollToBottom("smooth")}
                  className="absolute bottom-20 right-6 z-10 bg-primary text-background p-3 rounded-full shadow-lg hover:bg-primary/90 transition-all duration-200 animate-fadeIn"
                  aria-label="Scroll to bottom">
                  <ArrowDownSLine size={20} className="fill-background" />
               </button>
            )}

            {!isReadOnly && (
               <MessageInput
                  value={messageValue}
                  onChange={handleTypingChange}
                  onSend={handleSend}
                  onAttachFile={handleAttachFile}
                  onVoiceMessage={handleVoiceMessage}
                  replyingTo={replyingToMessage}
                  onCancelReply={() => setReplyingTo(null)}
                  isReadOnly={isReadOnly}
               />
            )}
         </div>
      </div>
   );
}

export default ChatWindowNew;
