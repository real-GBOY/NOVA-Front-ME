import { memo, useCallback, useState, useEffect, useRef } from "react";
import { MessageBubble } from "./shared";
import { ChatMessage } from "./types";

type MessageListItem =
   | { type: "date"; date: string }
   | { type: "message"; data: ChatMessage };

interface MessageListProps {
   readonly items: readonly MessageListItem[];
   currentUserId: number;
   onReply: (message: ChatMessage) => void;
   messagesEndRef: React.RefObject<HTMLDivElement>;
   isUserOnline: (userId: number) => boolean;
}

export const MessageList = memo(
   ({
      items,
      currentUserId,
      onReply,
      messagesEndRef,
      isUserOnline,
   }: MessageListProps) => {
      const [highlightedMessageId, setHighlightedMessageId] = useState<
         string | null
      >(null);
      const messageRefs = useRef<Map<string, HTMLDivElement>>(new Map());

      const handleReply = useCallback(
         (msg: ChatMessage) => () => onReply(msg),
         [onReply]
      );

      const handleGoToMessage = useCallback((messageId: string) => {
         const messageElement = messageRefs.current.get(messageId);
         if (messageElement) {
            // Scroll to the message with smooth behavior
            messageElement.scrollIntoView({
               behavior: "smooth",
               block: "center",
            });

            // Highlight the message temporarily
            setHighlightedMessageId(messageId);

            // Remove highlight after 2 seconds
            setTimeout(() => {
               setHighlightedMessageId(null);
            }, 2000);
         } else {
            // Message not found - it might not be loaded yet
            console.log("[MessageList] Message not found in view:", messageId);
         }
      }, []);

      // Clear message refs when items change
      useEffect(() => {
         const currentIds = new Set(
            items
               .filter(
                  (item): item is { type: "message"; data: ChatMessage } =>
                     item.type === "message"
               )
               .map((item) => item.data.id)
         );

         // Remove refs for messages that no longer exist
         for (const id of messageRefs.current.keys()) {
            if (!currentIds.has(id)) {
               messageRefs.current.delete(id);
            }
         }
      }, [items]);

      return (
         <div
            role="list"
            className="flex flex-col gap-3 md:gap-4 overflow-y-auto">
            {items.map((item) => {
               if (item.type === "date") {
                  return (
                     <div key={item.date} className="flex justify-center mb-6">
                        <div className="bg-background border border-border px-4 py-1 rounded-full shadow-sm">
                           <span className="text-sm font-medium text-text-strong">
                              {item.date}
                           </span>
                        </div>
                     </div>
                  );
               }

               if (item.type === "message") {
                  const { data: msg } = item;
                  const isOwn = Number(msg.senderId) === currentUserId;
                  const isOnline = !isOwn && isUserOnline(Number(msg.senderId));
                  const isHighlighted = highlightedMessageId === msg.id;

                  return (
                     <div
                        key={msg.id}
                        className={`mb-4 transition-all duration-300 ${
                           isHighlighted
                              ? "bg-primary/10 rounded-2xl p-4 -m-2"
                              : ""
                        }`}
                        ref={(el) => {
                           if (el) {
                              messageRefs.current.set(msg.id, el);
                           } else {
                              messageRefs.current.delete(msg.id);
                           }
                        }}>
                        <MessageBubble
                           message={{ ...msg, senderIsOnline: isOnline }}
                           isOwn={isOwn}
                           onReply={handleReply(msg)}
                           onGoToMessage={handleGoToMessage}
                        />
                     </div>
                  );
               }
               return null;
            })}
            <div ref={messagesEndRef} />
         </div>
      );
   }
);

MessageList.displayName = "MessageList";
