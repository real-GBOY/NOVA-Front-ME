/** @format */

import { io, Socket } from "socket.io-client";
import { getAuthToken, getLoginStatus } from "@/config/axios";
import endPoints from "@/config/endPoints";

// Extract base URL and convert to socket URL
// e.g., "http://localhost:3000/api/v1" -> "http://localhost:3000"
const getSocketUrl = (): string => {
	const baseUrl = endPoints.baseurl;
	// Remove /api/v1 suffix if present
	return baseUrl.replace(/\/api\/v1$/, "");
};

let socketInstance: Socket | null = null;
let isInitializing = false;

/**
 * Get or create the singleton socket instance
 * This prevents multiple socket connections (Best Practice #1)
 *
 * FIXED: Returns existing instance even if disconnected to prevent multiple instances
 * FIXED: Prevents concurrent initialization attempts
 */
export const getSocket = (): Socket | null => {
	// Only create socket if user is logged in
	if (!getLoginStatus()) {
		// Clean up socket if user is not logged in
		if (socketInstance) {
			disconnectSocket();
		}
		return null;
	}

	// Return existing instance if it exists (even if disconnected - it will reconnect)
	// This prevents creating multiple socket instances
	if (socketInstance) {
		return socketInstance;
	}

	// Prevent concurrent initialization
	if (isInitializing) {
		return null;
	}

	// Create new socket instance
	const token = getAuthToken();
	if (!token) {
		console.warn("No auth token available for socket connection");
		return null;
	}

	const socketUrl = getSocketUrl();
	isInitializing = true;

	try {
		socketInstance = io(socketUrl, {
			auth: {
				token: token,
			},
			transports: ["websocket", "polling"],
			autoConnect: true,
			reconnection: true,
			reconnectionDelay: 1000,
			reconnectionDelayMax: 5000,
			reconnectionAttempts: 5,
			timeout: 20000,
		});

		// Set initializing to false immediately as io() is synchronous in returning the instance
		isInitializing = false;

		// Add connection event listeners (only once)
		socketInstance.on("connect", () => {
		});

		socketInstance.on("disconnect", () => {
			// Don't set socketInstance to null on disconnect - allow reconnection
		});

		// Error handling (Best Practice #5)
		socketInstance.on("connect_error", (error) => {
			console.error("❌ [Socket] Connection error:", error.message);
		});

		return socketInstance;
	} catch (error) {
		console.error("Failed to create socket instance:", error);
		isInitializing = false;
		socketInstance = null;
		return null;
	}
};

/**
 * Disconnect and cleanup the socket instance
 */
export const disconnectSocket = (): void => {
	if (socketInstance) {
		socketInstance.disconnect();
		socketInstance = null;
	}
};

/**
 * Reconnect socket (useful after token refresh)
 */
export const reconnectSocket = (): void => {
	disconnectSocket();
	getSocket();
};

export default getSocket;
