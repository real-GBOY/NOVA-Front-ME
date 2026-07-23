<!-- @format -->

# Chat Implementation - Best Practices Guide

This implementation follows all 14 React + Socket.io best practices for building a robust chat system.

## ✅ Implemented Best Practices

### 1. ✅ Single Socket Instance

- **File**: `src/services/socket/socket.ts`
- **Implementation**: Singleton pattern prevents multiple connections
- **Usage**: Import `getSocket()` from anywhere - it returns the same instance

### 2. ✅ Event Listener Cleanup

- **Implementation**: All socket event listeners return cleanup functions
- **Example**: `onReceiveMessage()` returns `() => socket.off("receive_message", handler)`
- **Usage**: Always call cleanup in `useEffect` return

### 3. ✅ Use Socket.io for Sending

- **Socket.io**: Saves messages to database automatically (`socketService.ts`)
- **REST API**: Only for loading message history (`chatService.ts`)
- **Flow**: Optimistic update → Socket emit → Backend saves to DB → Replace with real ID

### 4. ✅ Optimistic Updates with Socket.io

- **Implementation**: `useMessages` hook adds optimistic message immediately, replaces with real ID when backend responds
- **Flow**: Add optimistic message → Socket emit → Backend saves to DB → Replace with real ID

### 5. ✅ Proper Error Handling

- **Socket**: Error handlers in `socket.ts` and `SocketProvider.tsx`
- **API**: Error handling in React Query mutations
- **Logging**: All errors are logged to console

### 6. ✅ Room Management

- **Hook**: `useChatRoom(roomId)` automatically joins/leaves rooms
- **Implementation**: Joins on mount, leaves on unmount
- **File**: `src/hooks/chat/useChatRoom.ts`

### 7. ✅ Sort Messages by Timestamp

- **Implementation**: All messages sorted by `timestamp` (chronological order)
- **Location**: `useMessages` hook sorts after every update
- **Format**: ISO-8601 UTC strings

### 8. ✅ Typing Indicator Timeout

- **Hook**: `useTypingIndicator` with automatic timeout handling
- **Timeout**: 3 seconds after last typing event
- **File**: `src/hooks/chat/useTypingIndicator.ts`

### 9. ✅ Callback State Updates

- **Implementation**: All `setMessages` use callback form: `setMessages((prev) => [...prev, msg])`
- **Prevents**: Race conditions from multiple rapid updates
- **Location**: `useMessages` hook

### 10. ✅ Consistent Message Schema

- **Types**: `src/services/chat/types.ts` matches API exactly
- **Validation**: TypeScript ensures consistency
- **Fields**: All fields match REST API and Socket events

### 11. ✅ Unique Message IDs

- **Implementation**: Every message has `message_id` (integer) from backend
- **Idempotency**: `client_message_id` prevents duplicate sends
- **Generation**: `generateClientMessageId()` creates unique IDs

### 12. ✅ Read Status from Backend

- **Implementation**: `markMessagesAsRead()` calls API endpoint
- **Hook**: `useMessages` marks messages as read when viewing
- **Backend**: Decides read status, frontend only displays

### 13. ✅ Auto-scroll to Bottom

- **Implementation**: `useEffect` with `messagesEndRef.current?.scrollIntoView()`
- **Behavior**: Smooth scroll on new messages
- **Location**: `ChatWindowNew` component

### 14. ✅ Socket at Highest Level

- **Provider**: `SocketProvider` wraps entire app in `App.tsx`
- **Benefit**: Single connection, no reconnection on component mount
- **File**: `src/services/socket/SocketProvider.tsx`

## 📁 File Structure

```
src/
├── services/
│   ├── socket/
│   │   ├── socket.ts              # Singleton socket instance
│   │   └── SocketProvider.tsx     # App-level socket provider
│   └── chat/
│       ├── types.ts               # TypeScript types (matches API)
│       ├── chatService.ts         # REST API calls
│       └── socketService.ts       # Socket.io events
├── hooks/
│   └── chat/
│       ├── useChatRoom.ts         # Room join/leave management
│       ├── useMessages.ts         # Messages with Socket.io (optimistic updates)
│       ├── useTypingIndicator.ts  # Typing indicators with timeout
│       └── useChatRooms.ts        # React Query hooks for rooms
├── components/
│   └── communication/
│       └── ChatWindowNew.tsx      # Updated chat window component
└── utils/
    └── auth.ts                    # Get current user ID from JWT
```

## 🚀 Usage Example

```tsx
import { useChatRoom, useMessages, useTypingIndicator } from "@/hooks/chat";
import { useChatRoomQuery } from "@/hooks/chat";

function ChatComponent({ roomId }: { roomId: number }) {
	// Fetch room details
	const { data: room } = useChatRoomQuery(roomId);

	// Manage room subscription (auto join/leave)
	useChatRoom(roomId);

	// Manage messages (Socket.io with optimistic updates)
	const { messages, sendMessage, isLoading } = useMessages(
		roomId,
		currentUserId
	);

	// Typing indicators
	const { typingUsers, handleTyping, handleStopTyping } =
		useTypingIndicator(roomId);

	// ... rest of component
}
```

## 🔧 Configuration

### Socket URL

The socket URL is automatically derived from the API base URL:

- API: `http://localhost:3000/api/v1`
- Socket: `http://localhost:3000`

### Authentication

Socket authentication uses JWT token from `localStorage`:

- Token is passed in `auth.token` during connection
- Socket reconnects automatically when token is refreshed

## 📝 Notes

- All timestamps are ISO-8601 UTC strings
- Message IDs are integers from backend
- Read status is calculated by backend, not frontend
- Typing indicators auto-clear after 3 seconds
- Messages are sorted chronologically (oldest first)
- Auto-scroll happens on new messages

## 🐛 Troubleshooting

### Socket not connecting

- Check if user is logged in (`getLoginStatus()`)
- Verify token exists in localStorage
- Check browser console for connection errors

### Messages not appearing

- Verify room subscription with `useChatRoom(roomId)`
- Check API response in Network tab
- Verify socket events in browser console

### Duplicate messages

- Ensure `client_message_id` is unique
- Check that optimistic message is replaced with real ID from socket response
- Verify message deduplication logic in `useMessages`
