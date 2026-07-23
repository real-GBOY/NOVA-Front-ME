/** @format */

import { useCallback, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import BadgeTag from "@/designSystem/BadgeTag";
import Button from "@/designSystem/Button";
import LoadingState from "@/designSystem/LoadingState";
import ChatErrorBoundary from "@/components/communication/ChatErrorBoundary";
import ChatWindowNew from "@/components/communication/ChatWindowNew";
import MemberTag1 from "@/components/contracts/MemberTag1";
import { buildMediaUrl } from "@/components/communication/utils";
import { useTickets } from "@/hooks/support/useTickets";
import {
   useSocketConnection,
   useRoomSocketUpdates,
   useUnreadTotal,
} from "@/hooks/chat";
import { useTranslation } from "@/hooks/useTranslation";
import { usePermissions } from "@/contexts/PermissionContext";
import NoPermissionMessage from "@/components/common/NoPermissionMessage";
import { formatPermissionName } from "@/utilities/permissionFormatters";
import type { Ticket, TicketDetail } from "@/types/tickets";
import { useQueryClient } from "@tanstack/react-query";
import { reactQueryKeys } from "@/config/reactQueryKeys";
import { supportTicketStore } from "@/services/supportTicketStore";

function TicketChatPage() {
   const { t } = useTranslation("helpSupport");
   const { t: tCommon } = useTranslation("common");
   const navigate = useNavigate();
   const { ticketId } = useParams();
   const ticketIdNumber = Number(ticketId);
   const isValidId = Number.isFinite(ticketIdNumber) && ticketIdNumber > 0;
   const { can } = usePermissions();
   const canViewSupport = can("view_support_tickets");
   const canCommentTicket = can("initiate_room_support_ticket");
   const canResolveTicket = can("update_support_ticket");
   const canAccessChat = canViewSupport || canCommentTicket;
   const queryClient = useQueryClient();

   useSocketConnection();
   useRoomSocketUpdates();
   useUnreadTotal();
   const {
      useGetTicketById,
      useGetTicketChatRoom,
      useProvisionTicketChatRoom,
      useUpdateTicketStatus,
   } = useTickets();

   const {
      data: ticket,
      isLoading: isTicketLoading,
      error: ticketError,
   } = useGetTicketById(ticketIdNumber, {
      enabled: isValidId && canAccessChat,
   });

   const ticketChatRoom = ticket?.chat_room ?? null;
   const existingRoomId =
      ticket?.chat_room_id ?? ticketChatRoom?.room_id ?? null;
   const ticketHasChatRoom = Boolean(existingRoomId);

   // TODO: Update this permission check when proper chat viewing permissions are defined
   // Currently: admins with comment permission can start chats, others can only view existing ones
   // Use GET for viewing existing chat rooms (all users with access)
   const {
      data: existingChatRoomData,
      isLoading: isExistingChatRoomLoading,
      error: existingChatRoomError,
   } = useGetTicketChatRoom(ticketIdNumber, {
      enabled:
         isValidId && canAccessChat && ticketHasChatRoom && !canCommentTicket,
   });

   // Use POST for provisioning new chat rooms (only admins with comment permission)
   const {
      data: provisionedChatRoomData,
      isPending: isProvisioningChatRoom,
      mutateAsync: provisionChatRoom,
   } = useProvisionTicketChatRoom();

   // Combine chat room data from either source
   const chatRoomData = canCommentTicket
      ? provisionedChatRoomData
      : existingChatRoomData;
   const hasChatRoom = Boolean(
      existingRoomId ?? chatRoomData?.chat_room?.room_id
   );
   const isChatRoomLoading = canCommentTicket
      ? false
      : isExistingChatRoomLoading;
   const chatRoomError = canCommentTicket ? null : existingChatRoomError;

   const roomId = chatRoomData?.chat_room?.room_id ?? existingRoomId ?? null;

   useEffect(() => {
      if (!canCommentTicket || !isValidId) return;
      if (!chatRoomData?.chat_room?.room_id) return;
      supportTicketStore.addInitiatedTicketId(ticketIdNumber);
   }, [
      canCommentTicket,
      isValidId,
      chatRoomData?.chat_room?.room_id,
      ticketIdNumber,
   ]);
   const updateStatusMutation = useUpdateTicketStatus();
   const ticketKeys = reactQueryKeys.support.tickets;

   const handleInitiateChat = async () => {
      if (!isValidId || !canCommentTicket) return;
      try {
         await provisionChatRoom(ticketIdNumber);
      } catch (error) {
         console.error("Failed to initiate chat room:", error);
      }
   };

   const handleRoomRead = useCallback(
      (lastMessageId: number) => {
         if (!lastMessageId) return;
         queryClient.invalidateQueries({
            queryKey: ticketKeys.lists(),
            refetchType: "active",
         });
         queryClient.invalidateQueries({
            queryKey: ticketKeys.detail(ticketIdNumber),
            refetchType: "active",
         });
      },
      [queryClient, ticketIdNumber, ticketKeys]
   );

   const getStatusVariant = (
      status: Ticket["status"]
   ): "success" | "info" | "warning" => {
      const variantMap: Record<
         Ticket["status"],
         "success" | "info" | "warning"
      > = {
         Resolved: "success",
         In_Progress: "info",
         Open: "warning",
      };
      return variantMap[status] || "warning";
   };

   const getStatusKey = (status: Ticket["status"]) => {
      return status === "In_Progress"
         ? "inProgress"
         : String(status || "").toLowerCase();
   };

   const getLookupLabel = (
      prefix: "category" | "priority" | "type",
      value?: string
   ) => {
      if (!value) return "-";
      const fallback = value.replace(/_/g, " ");
      return t(`${prefix}.${value}`, fallback);
   };

   const resolveAttachmentUrl = (url?: string | null) => {
      if (!url) return null;
      return url.startsWith("http") ? url : buildMediaUrl(url);
   };

   const getAttachmentLabel = (
      attachment: TicketDetail["attachments"][number],
      index: number
   ) => {
      return (
         attachment?.file_name ||
         (attachment?.file_id ? `File ${attachment.file_id}` : null) ||
         `Attachment ${index + 1}`
      );
   };

   if (!isValidId) {
      return <p className="text-danger">{tCommon("common.error")}</p>;
   }

   if (!canAccessChat) {
      return (
         <NoPermissionMessage
            message={`You don't have permission to view this section. Missing: ${formatPermissionName(
               "view_support_tickets"
            )} / ${formatPermissionName("initiate_room_support_ticket")}`}
         />
      );
   }

   if (isTicketLoading || isChatRoomLoading) {
      return <LoadingState size="large" label={t("loading")} />;
   }

   if (ticketError || chatRoomError || !ticket) {
      return <p className="text-danger">{tCommon("common.error")}</p>;
   }

   return (
      <div className="flex flex-col xl:flex-row h-[calc(100dvh-180px)] md:h-[calc(100dvh-160px)] xl:h-full min-h-0 gap-3 overflow-hidden">
         <div className="xl:w-80 2xl:w-96 flex flex-1 xl:flex-none flex-col min-h-0 xl:h-full">
            <div className="bg-bg-weak border border-border rounded-2xl p-4 flex flex-col min-h-0 h-full">
               <div className="flex items-center justify-between gap-2 mb-4">
                  <p className="text-sm font-semibold text-text-strong">
                     {t("details.title")}
                  </p>
                  <Button
                     variant="secondary"
                     onClick={() => navigate("/dashboard/help-support")}
                     className="px-3 py-1.5 text-xs">
                     {t("chat.backToTickets")}
                  </Button>
               </div>

               <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-4">
                  <div className="flex flex-col gap-1">
                     <p className="text-xs text-text-sub">
                        {t("details.ticketId")}
                     </p>
                     <p className="text-sm font-medium text-text-strong">
                        {ticket.ticket_code}
                     </p>
                  </div>

                  <div className="flex flex-col gap-2">
                     <p className="text-xs text-text-sub">
                        {t("details.requestedBy")}
                     </p>
                     {ticket.requested_by ? (
                        <MemberTag1
                           name={ticket.requested_by.name}
                           jobTitle={ticket.requested_by.job_title}
                           avatar={ticket.requested_by.avatar_url}
                           variant="tag"
                           size="sm"
                           showJobTitle={false}
                        />
                     ) : (
                        <p className="text-sm text-text-sub">-</p>
                     )}
                  </div>

                  <div className="flex flex-col gap-2">
                     <p className="text-xs text-text-sub">{t("details.cc")}</p>
                     {ticket.cc_employees?.length ? (
                        <div className="flex flex-wrap gap-2">
                           {ticket.cc_employees.map((employee) => (
                              <MemberTag1
                                 key={employee.employee_id}
                                 name={employee.name}
                                 jobTitle={employee.job_title}
                                 avatar={employee.avatar_url}
                                 variant="tag"
                                 size="xs"
                                 showJobTitle={false}
                              />
                           ))}
                        </div>
                     ) : (
                        <p className="text-sm text-text-sub">-</p>
                     )}
                  </div>

                  <div className="flex flex-col gap-1">
                     <p className="text-xs text-text-sub">
                        {t("details.subject")}
                     </p>
                     <p className="text-sm font-medium text-text-strong">
                        {ticket.subject}
                     </p>
                  </div>

                  <div className="flex flex-col gap-1">
                     <p className="text-xs text-text-sub">
                        {t("details.description")}
                     </p>
                     <p className="text-sm text-text-strong whitespace-pre-wrap">
                        {ticket.description || "-"}
                     </p>
                  </div>

                  <div className="flex flex-col gap-2">
                     <p className="text-xs text-text-sub">
                        {t("details.attachments", "Attachments")}
                     </p>
                     {ticket.attachments?.length ? (
                        <div className="flex flex-col gap-2">
                           {ticket.attachments.map((attachment, index) => {
                              const url =
                                 resolveAttachmentUrl(attachment.file_url) ||
                                 "";
                              const label = getAttachmentLabel(
                                 attachment,
                                 index
                              );
                              return url ? (
                                 <a
                                    key={`${
                                       attachment.file_id ?? label
                                    }-${index}`}
                                    href={url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-sm text-primary underline underline-offset-2">
                                    {label}
                                 </a>
                              ) : (
                                 <p
                                    key={`${
                                       attachment.file_id ?? label
                                    }-${index}`}
                                    className="text-sm text-text-sub">
                                    {label}
                                 </p>
                              );
                           })}
                        </div>
                     ) : (
                        <p className="text-sm text-text-sub">-</p>
                     )}
                  </div>

                  <div className="flex flex-col gap-1">
                     <p className="text-xs text-text-sub">
                        {t("details.category")}
                     </p>
                     <p className="text-sm text-text-strong">
                        {getLookupLabel("category", ticket.category)}
                     </p>
                  </div>

                  <div className="flex flex-col gap-1">
                     <p className="text-xs text-text-sub">
                        {t("details.priority")}
                     </p>
                     <p className="text-sm text-text-strong">
                        {getLookupLabel("priority", ticket.priority)}
                     </p>
                  </div>

                  <div className="flex flex-col gap-1">
                     <p className="text-xs text-text-sub">
                        {t("details.type")}
                     </p>
                     <p className="text-sm text-text-strong">
                        {getLookupLabel("type", ticket.type)}
                     </p>
                  </div>

                  <div className="flex flex-col gap-2">
                     <p className="text-xs text-text-sub">
                        {t("details.status")}
                     </p>
                     <BadgeTag
                        label={t(`status.${getStatusKey(ticket.status)}`)}
                        variant={getStatusVariant(ticket.status)}
                        size="sm"
                     />
                  </div>
               </div>

               {canResolveTicket && ticket.status !== "Resolved" && (
                  <div className="pt-4 mt-4 border-t border-border">
                     <Button
                        onClick={() =>
                           updateStatusMutation.mutate({
                              id: ticket.ticket_id,
                              payload: {
                                 status: "Resolved",
                                 resolution_notes:
                                    "Marked as resolved from chat",
                              },
                           })
                        }
                        disabled={updateStatusMutation.isPending}
                        className="w-full px-3 py-2 text-sm">
                        {updateStatusMutation.isPending
                           ? t("details.updating")
                           : t("details.markAsResolved")}
                     </Button>
                  </div>
               )}
            </div>
         </div>

         {/* TODO: Update this permission check when proper chat viewing permissions are defined */}
         <div className="flex-1 min-h-0">
            {!hasChatRoom ? (
               <div className="flex flex-col items-center justify-center h-full bg-bg-weak border border-border rounded-2xl p-8 gap-4">
                  <p className="text-text-sub text-center">
                     {t(
                        "chat.noChatStarted",
                        "No chat has been started for this ticket yet."
                     )}
                  </p>
                  {canCommentTicket && (
                     <Button
                        onClick={handleInitiateChat}
                        isLoading={isProvisioningChatRoom}
                        disabled={isProvisioningChatRoom}
                        className="px-4 py-2 text-sm">
                        {t("actions.initiateChat")}
                     </Button>
                  )}
               </div>
            ) : (
               <ChatErrorBoundary>
                  <ChatWindowNew
                     roomId={roomId}
                     onBack={() => navigate("/dashboard/help-support")}
                     onRoomRead={handleRoomRead}
                     isReadOnly={
                        chatRoomData?.chat_room?.is_archived ??
                        ticketChatRoom?.is_archived ??
                        false
                     }
                     accessDeniedMessage={tCommon("common.error")}
                     accessDeniedSubMessage={t("chat.notMember")}
                  />
               </ChatErrorBoundary>
            )}
         </div>
      </div>
   );
}

export default TicketChatPage;
