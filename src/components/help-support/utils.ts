/** @format */

import type { Ticket } from "./types";

export type ChatStatusKey = "taken" | "waiting" | "archived";

export const getChatStatusKey = (ticket: Ticket): ChatStatusKey => {
   const chatRoom = ticket.chat_room;
   const hasChatRoom = Boolean(ticket.chat_room_id ?? chatRoom?.room_id);
   const isArchived = Boolean(chatRoom?.is_archived || ticket.status === "Resolved");

   if (isArchived) return "archived";
   if (hasChatRoom) return "taken";
   return "waiting";
};
