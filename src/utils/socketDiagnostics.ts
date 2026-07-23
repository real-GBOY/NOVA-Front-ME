/** @format */

import { getSocket } from "@/services/socket/socket";

/**
 * Socket Diagnostics Utility
 * Run this in the browser console to check socket status
 */
export const checkSocketStatus = () => {
	const socket = getSocket();
	
	if (!socket) {
		console.error("❌ Socket instance is null");
		return {
			status: "NOT_INITIALIZED",
			error: "Socket instance not created"
		};
	}

	const diagnostics = {
		socketId: socket.id,
		connected: socket.connected,
		disconnected: socket.disconnected,
		active: socket.active,
		url: (socket as { io?: { uri?: string } }).io?.uri,
		transport: socket.io.engine?.transport?.name,
		listeners: {
			connect: socket.listeners("connect").length,
			disconnect: socket.listeners("disconnect").length,
			receive_message: socket.listeners("receive_message").length,
			user_typing: socket.listeners("user_typing").length,
		},
		auth: (socket as { auth?: unknown }).auth,
	};
	
	return diagnostics;
};

/**
 * Test socket connection
 */
export const testSocketConnection = () => {
	const socket = getSocket();
	
	if (!socket) {
		console.error("❌ No socket instance");
		return;
	}
	
	// Test emit
	socket.emit("heartbeat", {});

	// Check connection status
	if (!socket.connected) {
		socket.connect();
	}
};

// Make available globally for console access
if (typeof window !== "undefined") {
	(window as Window & {
		checkSocketStatus?: typeof checkSocketStatus;
		testSocketConnection?: typeof testSocketConnection;
	}).checkSocketStatus = checkSocketStatus;
	(window as Window & {
		checkSocketStatus?: typeof checkSocketStatus;
		testSocketConnection?: typeof testSocketConnection;
	}).testSocketConnection = testSocketConnection;
}
