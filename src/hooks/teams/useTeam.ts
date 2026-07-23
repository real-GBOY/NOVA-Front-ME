/** @format */

import { useListTeams, useGetTeamById } from "./team.queries";

import { useCreateTeam, useUpdateTeam, useDeleteTeam } from "./team.mutations";

export const useTeam = () => {
	return {
		useListTeams,
		useGetTeamById,
		useCreateTeam,
		useUpdateTeam,
		useDeleteTeam,
	};
};

// Export individual hooks for direct imports
export { useListTeams, useGetTeamById } from "./team.queries";

export { useCreateTeam, useUpdateTeam, useDeleteTeam } from "./team.mutations";
