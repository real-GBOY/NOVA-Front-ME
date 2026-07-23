/** @format */

import { useEffect, useState, useRef } from "react";
import { useLocation, useSearchParams } from "react-router-dom";

import InboxSidebar from "@/components/communication/InboxSidebar";
import ChatWindowNew from "@/components/communication/ChatWindowNew";
import ChatErrorBoundary from "@/components/communication/ChatErrorBoundary";
import { useDebounce } from "@/hooks/useDebounce";
import {
   useChatRooms,
   useRoomSocketUpdates,
   useSocketConnection,
   useUnreadTotal,
} from "@/hooks/chat";
function Messages() {
   const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
   const hasAutoSelectedRef = useRef(false);
   const location = useLocation();
   const [searchParams, setSearchParams] = useSearchParams();
   const initialSearchQuery =
      (location.state as { searchQuery?: string } | null)?.searchQuery ||
      searchParams.get("search") ||
      "";
   const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
   const debouncedSearchQuery = useDebounce(searchQuery, 400);
   const [isDesktop, setIsDesktop] = useState(() => {
      if (typeof window === "undefined") {
         return false;
      }
      return window.matchMedia("(min-width: 768px)").matches;
   });

   // Initialize socket connection for real-time updates
   useSocketConnection();

   // Listen for room updates via socket (updates last_message, unread_count, etc.)
   useRoomSocketUpdates();
   useUnreadTotal();

   useEffect(() => {
      if (typeof window === "undefined") {
         return;
      }
      const mediaQuery = window.matchMedia("(min-width: 768px)");
      const handleChange = (event: MediaQueryListEvent) => {
         setIsDesktop(event.matches);
      };

      setIsDesktop(mediaQuery.matches);
      if (mediaQuery.addEventListener) {
         mediaQuery.addEventListener("change", handleChange);
      } else {
         mediaQuery.addListener(handleChange);
      }

      return () => {
         if (mediaQuery.removeEventListener) {
            mediaQuery.removeEventListener("change", handleChange);
         } else {
            mediaQuery.removeListener(handleChange);
         }
      };
   }, []);

   useEffect(() => {
      const newSearchQuery =
         (location.state as { searchQuery?: string } | null)?.searchQuery ||
         searchParams.get("search") ||
         "";
      setSearchQuery(newSearchQuery);
   }, [location.state, searchParams]);

   const handleSearchChange = (value: string) => {
      setSearchQuery(value);
      const nextParams = new URLSearchParams(searchParams);
      if (value) {
         nextParams.set("search", value);
      } else {
         nextParams.delete("search");
      }
      setSearchParams(nextParams, { replace: true });
   };

   // Fetch rooms from backend with search
   const { data: roomsData, isLoading: isLoadingRooms } = useChatRooms(
      debouncedSearchQuery || undefined,
   );

   const rooms = roomsData?.data || [];

   useEffect(() => {
      if (!hasAutoSelectedRef.current && rooms.length > 0) {
         const firstRoom = rooms[0];
         if (firstRoom) {
            hasAutoSelectedRef.current = true;
            setSelectedRoomId(firstRoom.room_id);
         }
      }
   }, [rooms]);

   const handleRoomSelect = (roomId: number | null) => {
      setSelectedRoomId(roomId);
   };

   const showSidebar = isDesktop || selectedRoomId === null;
   const showChat = isDesktop || selectedRoomId !== null;

   return (
      <div className="flex flex-col md:flex-row h-[calc(100dvh-180px)] md:h-[calc(100dvh-160px)] xl:h-full min-h-0 font-sans gap-3 md:gap-6 overflow-hidden">
         {showSidebar && (
            <InboxSidebar
               rooms={rooms}
               isLoading={isLoadingRooms}
               searchQuery={searchQuery}
               onSearchChange={handleSearchChange}
               selectedRoomId={selectedRoomId}
               onRoomSelect={handleRoomSelect}
            />
         )}
         {showChat && (
            <ChatErrorBoundary>
               <ChatWindowNew
                  key={selectedRoomId}
                  roomId={selectedRoomId}
                  onBack={
                     !isDesktop ? () => setSelectedRoomId(null) : undefined
                  }
               />
            </ChatErrorBoundary>
         )}
      </div>
   );
}

export default Messages;
