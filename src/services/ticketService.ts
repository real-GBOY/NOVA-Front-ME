/** @format */

import apiClient from "@/config/axios";
import endPoints from "@/config/endPoints";
import type {
   TicketListResponse,
   TicketDetail,
   TicketChatRoomResponse,
   CreateTicketRequest,
   UpdateTicketStatusRequest,
   ArchiveTicketChatRoomRequest,
   ArchiveTicketChatRoomResponse,
   TicketMeta,
   TicketListFilters,
} from "@/types/tickets";

/**
 * Ticket Service
 * Handles all API calls related to support tickets
 */
export const ticketService = {
   /**
    * GET - List all tickets with optional filters
    * @param filters - Optional filters for pagination, search, status, etc.
   * @returns Promise<TicketListResponse>
   */
   list: async (filters?: TicketListFilters): Promise<TicketListResponse> => {
      const response = await apiClient.get<TicketListResponse>(
         endPoints.support.tickets.getAll,
         {
            params: filters,
         }
      );
      return response.data;
   },

   /**
    * GET - Get ticket by ID
    * @param id - Ticket ID
    * @returns Promise<TicketDetail>
    */
   getById: async (id: string | number): Promise<TicketDetail> => {
      const response = await apiClient.get<TicketDetail>(
         endPoints.support.tickets.getById(id)
      );
      return response.data;
   },

   /**
    * GET - Get ticket metadata (statuses, categories, priorities, etc.)
    * This should be cached in browser for the session
    * @returns Promise<TicketMeta>
    */
   getMeta: async (): Promise<TicketMeta> => {
      const response = await apiClient.get<TicketMeta>(
         endPoints.support.tickets.getMeta
      );
      return response.data;
   },

   /**
    * POST - Create a new ticket
    * @param payload - Ticket creation data
    * @returns Promise<TicketDetail>
    */
   create: async (payload: CreateTicketRequest): Promise<TicketDetail> => {
      const response = await apiClient.post<TicketDetail>(
         endPoints.support.tickets.create,
         payload
      );
      return response.data;
   },

   /**
    * PATCH - Update ticket status
    * @param id - Ticket ID
    * @param payload - Status update data
    * @returns Promise<TicketDetail>
    */
   updateStatus: async (
      id: string | number,
      payload: UpdateTicketStatusRequest
   ): Promise<TicketDetail> => {
      const response = await apiClient.patch<TicketDetail>(
         endPoints.support.tickets.updateStatus(id),
         payload
      );
      return response.data;
   },

   /**
    * GET - Get existing ticket chat room (does not create one)
    * Use this for users without comment permission to open existing chats
    * @param id - Ticket ID
    * @returns Promise<TicketChatRoomResponse>
    */
   getChatRoom: async (id: string | number): Promise<TicketChatRoomResponse> => {
      const response = await apiClient.get<TicketChatRoomResponse>(
         endPoints.support.tickets.chatRoom(id)
      );
      return response.data;
   },

   /**
    * POST - Provision or fetch ticket chat room
    * Only admins with comment permission should use this to start a chat
    * @param id - Ticket ID
    * @returns Promise<TicketChatRoomResponse>
    */
   provisionChatRoom: async (
      id: string | number
   ): Promise<TicketChatRoomResponse> => {
      const response = await apiClient.post<TicketChatRoomResponse>(
         endPoints.support.tickets.chatRoom(id)
      );
      return response.data;
   },

   /**
    * POST - Archive or unarchive ticket chat room
    * @param id - Ticket ID
    * @param payload - Archive toggle payload
    * @returns Promise<ArchiveTicketChatRoomResponse>
    */
   archiveChatRoom: async (
      id: string | number,
      payload: ArchiveTicketChatRoomRequest
   ): Promise<ArchiveTicketChatRoomResponse> => {
      const response = await apiClient.post<ArchiveTicketChatRoomResponse>(
         endPoints.support.tickets.archiveRoom(id),
         payload
      );
      return response.data;
   },
};
