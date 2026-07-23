/** @format */

import { useQuery } from "@tanstack/react-query";
import { reactQueryKeys } from "../../config/reactQueryKeys";
import { assetService } from "../../services/assetService";
import { AxiosError } from "axios";

const assetKeys = reactQueryKeys.assets;

export const useListAssets = (
	filters?: {
		page?: number;
		limit?: number;
		search?: string;
	},
	options?: {
		enabled?: boolean;
	}
) =>
	useQuery({
		queryKey: assetKeys.list(filters),
		queryFn: async () => {
			try {
				const response = await assetService.list(filters);
				// Response structure: { data: Asset[], pagination: {...} }
				// Ensure we return the data array
				if (response && response.data) {
					return Array.isArray(response.data) ? response.data : [];
				}
				console.warn("Unexpected response structure:", response);
				return [];
			} catch (error) {
				console.error("Error fetching assets:", error);
				throw error;
			}
		},
		enabled: options?.enabled !== false,
		staleTime: 0, // Always consider data stale to allow immediate refetch after mutations
		refetchOnMount: true, // Refetch when component mounts
		refetchOnWindowFocus: false, // Don't refetch on window focus to avoid unnecessary requests
	});

export const useGetAssetById = (
	id: string | number,
	options?: {
		enabled?: boolean;
	}
) =>
	useQuery({
		queryKey: assetKeys.detail(id),
		queryFn: async () => {
			const response = await assetService.getById(id);
			return response.data;
		},
		enabled: options?.enabled !== false && !!id,
		retry: (failureCount, error: unknown) => {
			// Don't retry on 404 errors
			if (error instanceof AxiosError && error.response?.status === 404) {
				return false;
			}
			return failureCount < 2;
		},
		staleTime: 5 * 60 * 1000,
	});

export const useGetAssetAssignments = (
	id: string | number,
	filters?: {
		page?: number;
		limit?: number;
	},
	options?: {
		enabled?: boolean;
	}
) =>
	useQuery({
		queryKey: [...assetKeys.detail(id), "assignments", filters],
		queryFn: async () => {
			const response = await assetService.listAssignments(id, filters);
			return response.data;
		},
		enabled: options?.enabled !== false && !!id,
		staleTime: 5 * 60 * 1000,
	});

export const useAssetDictionary = (options?: { enabled?: boolean }) =>
	useQuery({
		queryKey: assetKeys.dictionary(),
		queryFn: () => assetService.getDictionary(),
		enabled: options?.enabled !== false,
		staleTime: 10 * 60 * 1000, // 10 minutes - assets don't change often
	});

export const useAvailableAssetDictionary = (options?: { enabled?: boolean }) =>
	useQuery({
		queryKey: [...assetKeys.all, "available-dictionary"],
		queryFn: () => assetService.getAvailableDictionary(),
		enabled: options?.enabled !== false,
		staleTime: 5 * 60 * 1000, // 5 minutes - available assets may change more frequently
	});
