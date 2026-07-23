/** @format */

import { useState, useEffect } from "react";
import { getSocket } from "@/services/socket/socket";
import {
	onConnect,
	onDisconnect,
	onConnectError,
} from "@/services/chat/socketService";

/**
 * Hook to track chat socket connection status
 * Socket is managed by SocketProvider at app level
 * Returns connection status and error information
 *
 * @returns {Object} Connection state with `isConnected` and `connectionError`
 */
export const useSocketConnection = () => {
	const [isConnected, setIsConnected] = useState(false);
	const [connectionError, setConnectionError] = useState<string | null>(null);

	useEffect(() => {
		// Initialize socket connection when component mounts
		getSocket();

		// Check if socket exists and get initial state
		const checkSocket = () => {
			const socket = getSocket();
			if (socket) {
				setIsConnected(socket.connected);
			} else {
				setIsConnected(false);
			}
		};

		// Initial check
		checkSocket();

		// Set up connection event handlers
		const cleanupConnect = onConnect(() => {
			setIsConnected(true);
			setConnectionError(null);
		});

		const cleanupDisconnect = onDisconnect((reason) => {
			setIsConnected(false);
			if (reason === "io server disconnect") {
				setConnectionError("Disconnected by server");
			} else if (reason === "io client disconnect") {
				setConnectionError("Disconnected by client");
			} else if (reason === "ping timeout") {
				setConnectionError("Connection timeout");
			} else {
				setConnectionError("Connection lost");
			}
		});

		const cleanupError = onConnectError((error) => {
			setIsConnected(false);
			setConnectionError(error.message);
		});

		return () => {
			cleanupConnect();
			cleanupDisconnect();
			cleanupError();
			// DON'T disconnect socket on unmount - socket should persist across the app
			// Socket is managed by SocketProvider at the app level
			// Only cleanup the event listeners above
		};
	}, []);

	return {
		isConnected,
		connectionError,
	};
};
