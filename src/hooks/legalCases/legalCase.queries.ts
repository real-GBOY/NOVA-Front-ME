/** @format */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { reactQueryKeys } from "@/config/reactQueryKeys";
import {
	legalCasesService,
	CreateLegalCaseRequest,
	CreateLegalCaseTypeRequest,
	UpdateLegalCaseRequest,
	CreateLegalCaseEventRequest,
	UpdateLegalCaseEventRequest,
	CreateLegalCaseDocumentRequest,
} from "@/services/legalCasesService";

const legalCaseKeys = reactQueryKeys.legalCases;

// ==================== Queries ====================

export const useListLegalCases = (
	filters?: {
		page?: number;
		limit?: number;
		search?: string;
		sort_by?: string;
		sort_order?: "asc" | "desc";
		status?: string | string[];
		lawyer_id?: string | string[];
		from_date?: string;
		to_date?: string;
	},
	options?: {
		enabled?: boolean;
	}
) =>
	useQuery({
		queryKey: legalCaseKeys.list(filters),
		queryFn: async () => {
			const response = await legalCasesService.list(filters);
			return response;
		},
		enabled: options?.enabled !== false,
		refetchOnWindowFocus: false,
	});

export const useListLegalCaseTypes = (options?: { enabled?: boolean }) =>
	useQuery({
		queryKey: legalCaseKeys.types(),
		queryFn: async () => {
			return legalCasesService.listTypes();
		},
		enabled: options?.enabled !== false,
		refetchOnWindowFocus: false,
	});

export const useCreateLegalCaseType = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: CreateLegalCaseTypeRequest) =>
			legalCasesService.createType(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: legalCaseKeys.types() });
		},
	});
};

export const useGetLegalCaseById = (
	id: string | number | null | undefined,
	options?: {
		enabled?: boolean;
	}
) =>
	useQuery({
		queryKey: legalCaseKeys.detail(id as string),
		queryFn: async () => {
			if (!id) throw new Error("Legal case ID is required");
			const response = await legalCasesService.getById(id);
			return response;
		},
		enabled: options?.enabled !== false && !!id,
		refetchOnWindowFocus: false,
	});

export const useGetLegalCaseEmployees = (
	id: string | number | null | undefined,
	options?: { enabled?: boolean }
) =>
	useQuery({
		queryKey: legalCaseKeys.employees(id as string),
		queryFn: async () => {
			if (!id) throw new Error("Legal case ID is required");
			return legalCasesService.getEmployees(id);
		},
		enabled: options?.enabled !== false && !!id,
		refetchOnWindowFocus: false,
	});

export const useGetLegalCaseEvents = (
	id: string | number | null | undefined,
	options?: { enabled?: boolean }
) =>
	useQuery({
		queryKey: legalCaseKeys.events(id as string),
		queryFn: async () => {
			if (!id) throw new Error("Legal case ID is required");
			return legalCasesService.getEvents(id);
		},
		enabled: options?.enabled !== false && !!id,
		refetchOnWindowFocus: false,
	});

export const useGetLegalCaseDocuments = (
	id: string | number | null | undefined,
	options?: { enabled?: boolean }
) =>
	useQuery({
		queryKey: legalCaseKeys.documents(id as string),
		queryFn: async () => {
			if (!id) throw new Error("Legal case ID is required");
			return legalCasesService.getDocuments(id);
		},
		enabled: options?.enabled !== false && !!id,
		refetchOnWindowFocus: false,
	});

export const useGetLegalCaseActivities = (
	id: string | number | null | undefined,
	options?: { enabled?: boolean }
) =>
	useQuery({
		queryKey: legalCaseKeys.activities(id as string),
		queryFn: async () => {
			if (!id) throw new Error("Legal case ID is required");
			return legalCasesService.getActivities(id);
		},
		enabled: options?.enabled !== false && !!id,
		refetchOnWindowFocus: false,
	});

// ==================== Mutations ====================

export const useCreateLegalCase = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: CreateLegalCaseRequest) => legalCasesService.create(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: legalCaseKeys.lists() });
		},
	});
};

export const useUpdateLegalCase = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			id,
			data,
		}: {
			id: string | number;
			data: UpdateLegalCaseRequest;
		}) => legalCasesService.update(id, data),
		onSuccess: (data, variables) => {
			queryClient.invalidateQueries({
				queryKey: legalCaseKeys.detail(variables.id),
			});
			queryClient.invalidateQueries({ queryKey: legalCaseKeys.lists() });
		},
	});
};

export const useDeleteLegalCase = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: string | number) => legalCasesService.delete(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: legalCaseKeys.lists() });
		},
	});
};

export const useAddLegalCaseEmployee = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			caseId,
			data,
		}: {
			caseId: string | number;
			data: { employee_id: string | number; role: string };
		}) => legalCasesService.addEmployee(caseId, data),
		onSuccess: (data, variables) => {
			queryClient.invalidateQueries({
				queryKey: legalCaseKeys.employees(variables.caseId),
			});
			queryClient.invalidateQueries({
				queryKey: legalCaseKeys.detail(variables.caseId),
			}); // In case summary info changes
		},
	});
};

export const useRemoveLegalCaseEmployee = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			caseId,
			employeeId,
		}: {
			caseId: string | number;
			employeeId: string | number;
		}) => legalCasesService.removeEmployee(caseId, employeeId),
		onSuccess: (data, variables) => {
			queryClient.invalidateQueries({
				queryKey: legalCaseKeys.employees(variables.caseId),
			});
		},
	});
};

export const useCreateLegalCaseEvent = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			caseId,
			data,
		}: {
			caseId: string | number;
			data: CreateLegalCaseEventRequest;
		}) => legalCasesService.createEvent(caseId, data),
		onSuccess: (data, variables) => {
			queryClient.invalidateQueries({
				queryKey: legalCaseKeys.events(variables.caseId),
			});
		},
	});
};

export const useUpdateLegalCaseEvent = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			caseId,
			eventId,
			data,
		}: {
			caseId: string | number;
			eventId: string | number;
			data: UpdateLegalCaseEventRequest;
		}) => legalCasesService.updateEvent(caseId, eventId, data),
		onSuccess: (data, variables) => {
			queryClient.invalidateQueries({
				queryKey: legalCaseKeys.events(variables.caseId),
			});
		},
	});
};

export const useAttachLegalCaseDocument = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			caseId,
			data,
		}: {
			caseId: string | number;
			data: CreateLegalCaseDocumentRequest;
		}) => legalCasesService.attachDocument(caseId, data),
		onSuccess: (data, variables) => {
			queryClient.invalidateQueries({
				queryKey: legalCaseKeys.documents(variables.caseId),
			});
		},
	});
};

export const useRemoveLegalCaseDocument = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			caseId,
			documentId,
		}: {
			caseId: string | number;
			documentId: string | number;
		}) => legalCasesService.removeDocument(caseId, documentId),
		onSuccess: (data, variables) => {
			queryClient.invalidateQueries({
				queryKey: legalCaseKeys.documents(variables.caseId),
			});
		},
	});
};
