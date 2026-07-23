/** @format */

import { useQuery } from "@tanstack/react-query";
import { getChatUsers } from "@/services/chat/chatService";
import type { ChatUser } from "@/services/chat/types";

/**
 * Hook to fetch a specific chat user by employee_id
 * Uses the getChatUsers API and filters by employee_id
 */
export const useChatUser = (employeeId: number | null) => {
	return useQuery<ChatUser | null>({
		queryKey: ["chat", "user", employeeId],
		queryFn: async () => {
			if (!employeeId) return null;

			// Fetch all users and find the one matching employeeId
			// Note: This could be optimized with a specific endpoint if available
			const response = await getChatUsers();
			// Ensure strict numeric comparison to handle any type mismatches
			const user = response.data.find(
				(u) => Number(u.employee_id) === Number(employeeId)
			);
			return user || null;
		},
		enabled: !!employeeId,
		staleTime: 5 * 60 * 1000, // Cache for 5 minutes
		gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
	});
};
