/** @format */

import apiClient from "@/config/axios";
import endPoints from "@/config/endPoints";

// Frontend types (camelCase)
export interface Agent {
	agent_id: string | number;
	agent_code: string;
	name: string;
	number: string;
	contact_number: string;
	email: string;
	address?: string;
	notes?: string;
	status: "Active" | "Inactive";
	company_id?: string | number | null;
	invoices_created?: number;
	total_commission?: number;
	total_commission_paid?: number;
	commission_pending?: number;
	created_at: string;
	updated_at: string;
	// Legacy fields for backward compatibility
	id?: string | number;
	type?: "Individual" | "Company";
	trnId?: string;
	contactNumber?: string;
}

export interface AgentListResponse {
	success: boolean;
	data: Agent[];
	pagination: {
		page: number;
		limit: number;
		total: number;
		total_pages: number;
	};
}

export interface CreateAgentRequest {
	name: string;
	number: string;
	contact_number: string;
	email: string;
	address?: string;
	notes?: string;
	status: "Active" | "Inactive";
}

export interface UpdateAgentRequest {
	name?: string;
	contact_number?: string;
	email?: string;
	address?: string;
	notes?: string;
	status?: "Active" | "Inactive";
	company_id?: string | number | null;
}

// Transform backend response to frontend format
const transformAgent = (agent: any): Agent => {
	return {
		...agent,
		// Add legacy fields for backward compatibility
		id: agent.agent_id,
		contactNumber: agent.contact_number,
		// Default type to Company if company_id exists, otherwise Individual
		type: agent.company_id ? "Company" : "Individual",
		// TRN not in backend response, so leave undefined
		trnId: undefined,
	};
};

const normalizeStatusValue = (value: string) => {
	const normalized = value.trim().toLowerCase();
	if (normalized === "active") return "Active";
	if (normalized === "inactive") return "Inactive";
	return value;
};

// Service functions
export const agentService = {
	// GET - List agents
	list: async (filters?: {
		page?: number;
		limit?: number;
		search?: string;
		status?: string | string[];
		sort_by?: string;
		sort_order?: "asc" | "desc";
	}): Promise<AgentListResponse> => {
		const normalizedFilters = { ...(filters || {}) } as typeof filters;
		if (normalizedFilters?.status) {
			normalizedFilters.status = Array.isArray(normalizedFilters.status)
				? normalizedFilters.status.map(normalizeStatusValue)
				: normalizeStatusValue(normalizedFilters.status);
		}

		const response = await apiClient.get(endPoints.agents.getAll, {
			params: normalizedFilters,
		});

		// Backend returns { success: true, data: [...], pagination: {...} }
		const backendData = response.data;
		const pagination = backendData.pagination || { page: 1, limit: 10, total: 0 };

		return {
			success: backendData.success,
			data: (backendData.data || []).map(transformAgent),
			pagination: {
				...pagination,
				page: Number(pagination.page),
				limit: Number(pagination.limit),
				total_pages: Math.ceil((pagination.total || 0) / (pagination.limit || 10))
			},
		};
	},

	// GET - Get agent by ID
	getById: async (id: string | number): Promise<Agent> => {
		const response = await apiClient.get(endPoints.agents.getById(id));
		// Backend returns { success: true, data: {...} } or just the agent object
		const agent = response.data?.data || response.data;
		return transformAgent(agent);
	},

	// POST - Create agent
	create: async (payload: CreateAgentRequest): Promise<Agent> => {
		const response = await apiClient.post(endPoints.agents.create, payload);
		// Backend returns { success: true, data: {...} } or just the agent object
		const agent = response.data?.data || response.data;
		return transformAgent(agent);
	},

	// PUT - Update agent
	update: async (
		id: string | number,
		payload: UpdateAgentRequest
	): Promise<Agent> => {
		const response = await apiClient.put(endPoints.agents.update(id), payload);
		// Backend returns { success: true, data: {...} } or just the agent object
		const agent = response.data?.data || response.data;
		return transformAgent(agent);
	},

	// DELETE - Delete agent
	delete: async (id: string | number): Promise<void> => {
		await apiClient.delete(endPoints.agents.delete(id));
	},
};
