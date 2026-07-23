/** @format */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { reactQueryKeys } from "@/config/reactQueryKeys";
import { ticketService } from "@/services/ticketService";
import type {
   CreateTicketRequest,
   UpdateTicketStatusRequest,
   TicketChatRoomResponse,
} from "@/types/tickets";

const ticketKeys = reactQueryKeys.support.tickets;

/**
 * POST - Create a new ticket
 */
export const useCreateTicket = () => {
   const queryClient = useQueryClient();
   return useMutation({
      mutationKey: ticketKeys.create(),
      mutationFn: (payload: CreateTicketRequest) =>
         ticketService.create(payload),
      onSuccess: () => {
         // Invalidate and refetch tickets list
         queryClient.invalidateQueries({
            queryKey: ticketKeys.lists(),
         });
      },
      onError: (error) => {
         console.error("Error creating ticket:", error);
      },
   });
};

/**
 * PATCH - Update ticket status
 */
export const useUpdateTicketStatus = () => {
   const queryClient = useQueryClient();
   return useMutation({
      mutationKey: ticketKeys.updateStatus(),
      mutationFn: ({
         id,
         payload,
      }: {
         id: string | number;
         payload: UpdateTicketStatusRequest;
      }) => ticketService.updateStatus(id, payload),
      onSuccess: async (_, variables) => {
         const shouldArchive = variables.payload.status === "Resolved";
         try {
            await ticketService.archiveChatRoom(variables.id, {
               archive: shouldArchive,
            });
         } catch (error) {
            console.error("Error archiving ticket chat room:", error);
         }

         // Invalidate ticket detail and list
         queryClient.invalidateQueries({
            queryKey: ticketKeys.detail(variables.id),
         });
         queryClient.invalidateQueries({
            queryKey: ticketKeys.lists(),
         });
         queryClient.invalidateQueries({
            queryKey: ticketKeys.chatRoom(variables.id),
         });
      },
      onError: (error) => {
         console.error("Error updating ticket status:", error);
      },
   });
};

/**
 * POST - Provision or fetch ticket chat room
 */
export const useProvisionTicketChatRoom = () => {
   const queryClient = useQueryClient();
   return useMutation<TicketChatRoomResponse, Error, string | number>({
      mutationKey: ticketKeys.chatRoom("provision"),
      mutationFn: (id: string | number) => ticketService.provisionChatRoom(id),
      onSuccess: (data, ticketId) => {
         queryClient.setQueryData(ticketKeys.chatRoom(ticketId), data);
         queryClient.invalidateQueries({
            queryKey: ticketKeys.detail(ticketId),
         });
      },
      onError: (error) => {
         console.error("Error provisioning ticket chat room:", error);
      },
   });
};
