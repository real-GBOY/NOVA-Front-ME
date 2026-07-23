/** @format */

import apiClient from "../config/axios";
import endPoints from "../config/endPoints";

// Types
export interface TeamJobTitle {
	id: number;
	title: string;
}

export interface Team {
	id: number;
	name: string;
	description?: string | null;
	member_count: number;
	job_titles: TeamJobTitle[];
	created_at?: string;
	updated_at?: string;
}

export interface CreateTeamRequest {
	name: string;
	description?: string | null;
	job_titles?: number[];
}

export interface UpdateTeamRequest {
	name?: string;
	description?: string | null;
	job_titles?: number[];
}

export interface TeamListResponse {
	data: Team[];
	total: number;
	page: number;
	limit: number;
	total_pages: number;
}

// Service functions
export const teamService = {
	// GET - List teams
	list: async (filters?: {
		page?: number;
		limit?: number;
		search?: string;
		job_title_ids?: number[] | string[];
	}): Promise<TeamListResponse> => {
		const response = await apiClient.get(endPoints.teams.getAll, {
			params: filters,
		});
		return response.data;
	},

	// GET - Get team by ID
	getById: async (id: string | number): Promise<Team> => {
		const response = await apiClient.get(endPoints.teams.getById(id));
		return response.data;
	},

	// POST - Create team
	create: async (payload: CreateTeamRequest): Promise<Team> => {
		const response = await apiClient.post(endPoints.teams.create, payload);
		return response.data;
	},

	// PUT - Update team
	update: async (
		id: string | number,
		payload: UpdateTeamRequest
	): Promise<Team> => {
		const response = await apiClient.put(endPoints.teams.update(id), payload);
		return response.data;
	},

	// DELETE - Delete team
	delete: async (id: string | number): Promise<void> => {
		await apiClient.delete(endPoints.teams.delete(id));
	},
};
