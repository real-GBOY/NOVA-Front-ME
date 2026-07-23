/** @format */

import {
   useListTickets,
   useGetTicketById,
   useGetTicketMeta,
   useGetTicketChatRoom,
} from "./ticket.queries";

import {
   useCreateTicket,
   useUpdateTicketStatus,
   useProvisionTicketChatRoom,
} from "./ticket.mutations";

/**
 * Main hook for ticket operations
 * Provides all ticket-related queries and mutations
 */
export const useTickets = () => {
   return {
      // Queries
      useListTickets,
      useGetTicketById,
      useGetTicketMeta,
      useGetTicketChatRoom,

      // Mutations
      useCreateTicket,
      useUpdateTicketStatus,
      useProvisionTicketChatRoom,

      // Legacy names for backward compatibility
      useList: useListTickets,
      useGetById: useGetTicketById,
      useGetMeta: useGetTicketMeta,
      useGetChatRoom: useGetTicketChatRoom,
      useChatRoom: useProvisionTicketChatRoom,
      useCreate: useCreateTicket,
      useUpdateStatus: useUpdateTicketStatus,
   };
};

// Export individual hooks for direct imports
export {
   useListTickets,
   useGetTicketById,
   useGetTicketMeta,
   useGetTicketChatRoom,
} from "./ticket.queries";

export {
   useCreateTicket,
   useUpdateTicketStatus,
   useProvisionTicketChatRoom,
} from "./ticket.mutations";
