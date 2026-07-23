/** @format */

import { useEffect, useState, useCallback } from "react";
import { onRateLimitExceeded } from "@/services/chat/socketService";
import type { SocketRateLimitPayload } from "@/services/chat/types";

/**
 * Hook to handle rate limit errors
 * Automatically disables sending when rate limit is exceeded
 */
export const useRateLimit = () => {
	const [rateLimitError, setRateLimitError] =
		useState<SocketRateLimitPayload | null>(null);
	const [canSend, setCanSend] = useState(true);

	useEffect(() => {
		const cleanup = onRateLimitExceeded((data: SocketRateLimitPayload) => {
			setRateLimitError(data);
			setCanSend(false);

			// Re-enable sending after retry delay
			const retryDelay = (data.retryAfter || 1) * 1000;
			setTimeout(() => {
				setCanSend(true);
				setRateLimitError(null);
			}, retryDelay);
		});

		return cleanup;
	}, []);

	const clearError = useCallback(() => {
		setRateLimitError(null);
		setCanSend(true);
	}, []);

	return {
		rateLimitError,
		canSend,
		clearError,
	};
};
