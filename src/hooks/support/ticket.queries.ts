/** @format */

import { useQuery } from "@tanstack/react-query";
import { reactQueryKeys } from "@/config/reactQueryKeys";
import { ticketService } from "@/services/ticketService";
import type { TicketListFilters } from "@/types/tickets";

const ticketKeys = reactQueryKeys.support.tickets;

/**
 * GET - List tickets with filters
 */
export const useListTickets = (
   filters?: TicketListFilters,
   options?: {
      enabled?: boolean;
   }
) =>
   useQuery({
      queryKey: ticketKeys.list(filters),
      queryFn: async () => {
         const response = await ticketService.list(filters);
         return response;
      },
      enabled: options?.enabled !== false,
      staleTime: 5 * 60 * 1000, // 5 minutes
   });

/**
 * GET - Get ticket by ID
 */
export const useGetTicketById = (
   id: string | number,
   options?: {
      enabled?: boolean;
   }
) =>
   useQuery({
      queryKey: ticketKeys.detail(id),
      queryFn: async () => {
         const response = await ticketService.getById(id);
         return response;
      },
      enabled: options?.enabled !== false && !!id,
      retry: (failureCount, error: unknown) => {
         // Don't retry on 404 errors
         // eslint-disable-next-line @typescript-eslint/no-explicit-any
         if ((error as any)?.response?.status === 404) {
            return false;
         }
         return failureCount < 2;
      },
   });

/**
 * GET - Get ticket metadata (statuses, categories, priorities, etc.)
 * This should be cached for the entire session
 */
export const useGetTicketMeta = (options?: { enabled?: boolean }) =>
   useQuery({
      queryKey: ticketKeys.meta(),
      queryFn: async () => {
         const response = await ticketService.getMeta();
         return response;
      },
      enabled: options?.enabled !== false,
      staleTime: Infinity, // Cache indefinitely for session
      gcTime: Infinity, // Don't garbage collect
   });

/**
 * GET - Get existing ticket chat room (does not create one)
 * Use this for users without comment permission to open existing chats
 */
export const useGetTicketChatRoom = (
   id: string | number,
   options?: {
      enabled?: boolean;
   }
) =>
   useQuery({
      queryKey: ticketKeys.chatRoom(id),
      queryFn: async () => {
         const response = await ticketService.getChatRoom(id);
         return response;
      },
      enabled: options?.enabled !== false && !!id,
      staleTime: 5 * 60 * 1000, // Cache for 5 minutes
   });

/**
 * POST - Provision or fetch ticket chat room
 * Only admins with comment permission should use this to start a chat
 */
