/** @format */

import { useState, useEffect, useCallback, useRef } from "react";
import {
	onUserTyping,
	onUserStopTyping,
	emitTyping,
	emitStopTyping,
} from "@/services/chat/socketService";
import type { TypingUser } from "@/services/chat/types";

/**
 * Hook for managing typing indicators with timeout handling
 *
 * Best Practice #8: Typing indicator needs timeout handling
 * A common bug is typing never stops - this hook handles that
 */
export const useTypingIndicator = (roomId: number | null) => {
	const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
	const timersRef = useRef<Map<number, NodeJS.Timeout>>(new Map());

	// Listen for typing events from other users
	useEffect(() => {
		if (!roomId) return;

		const cleanupTyping = onUserTyping((data) => {
			if (data.roomId !== roomId) return;

			// Clear existing timer for this user
			const existingTimer = timersRef.current.get(data.userId);
			if (existingTimer) {
				clearTimeout(existingTimer);
			}

			// Add user to typing list
			setTypingUsers((prev) => {
				const exists = prev.find((u) => u.userId === data.userId);
				if (exists) return prev;
				return [
					...prev,
					{ userId: data.userId, userName: data.userName, roomId: data.roomId },
				];
			});

			// Set timeout to remove typing indicator after 3 seconds
			const timer = setTimeout(() => {
				setTypingUsers((prev) => prev.filter((u) => u.userId !== data.userId));
				timersRef.current.delete(data.userId);
			}, 3000);

			timersRef.current.set(data.userId, timer);
		});

		const cleanupStopTyping = onUserStopTyping((data) => {
			if (data.roomId !== roomId) return;

			// Clear timer and remove user
			const timer = timersRef.current.get(data.userId);
			if (timer) {
				clearTimeout(timer);
				timersRef.current.delete(data.userId);
			}

			setTypingUsers((prev) => prev.filter((u) => u.userId !== data.userId));
		});

		const timers = timersRef.current;
		return () => {
			cleanupTyping();
			cleanupStopTyping();
			// Clear all timers on cleanup
			timers.forEach((timer) => clearTimeout(timer));
			timers.clear();
		};
	}, [roomId]);

	// Throttle typing indicator to respect rate limit (2 per 3 seconds)
	const lastTypingTimeRef = useRef<number>(0);
	const TYPING_THROTTLE_MS = 1600; // 1.6 seconds (backend limit: 2 per 3s = once every 1.5s)

	// Emit typing indicator (throttled)
	const handleTyping = useCallback(() => {
		if (!roomId) return;

		const now = Date.now();
		const timeSinceLastTyping = now - lastTypingTimeRef.current;

		// Only emit if enough time has passed since last typing event
		if (timeSinceLastTyping >= TYPING_THROTTLE_MS) {
			emitTyping(roomId);
			lastTypingTimeRef.current = now;
		}
	}, [roomId]);

	// Emit stop typing
	const handleStopTyping = useCallback(() => {
		if (!roomId) return;
		emitStopTyping(roomId);
	}, [roomId]);

	// Cleanup on unmount
	useEffect(() => {
		const timers = timersRef.current;
		return () => {
			timers.forEach((timer) => clearTimeout(timer));
			timers.clear();
		};
	}, []);

	return {
		typingUsers,
		handleTyping,
		handleStopTyping,
	};
};
