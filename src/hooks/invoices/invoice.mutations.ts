/** @format */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { reactQueryKeys } from "@/config/reactQueryKeys";
import { invoiceService } from "@/services/invoiceService";
import type {
	CreateInvoiceRequest,
	UpdateInvoiceRequest,
	ChangeInvoiceStatusRequest,
	VoidInvoiceRequest,
	CreateInvoiceItemRequest,
	UpdateInvoiceItemRequest,
	RecordPaymentRequest,
	BulkRecordPaymentRequest,
} from "@/services/invoiceService";

const invoiceKeys = reactQueryKeys.invoices;

/**
 * POST - Create a new invoice
 */
export const useCreateInvoice = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationKey: invoiceKeys.create(),
		mutationFn: (payload: CreateInvoiceRequest) =>
			invoiceService.create(payload),
		onSuccess: () => {
			// Invalidate and refetch invoices list and stats
			queryClient.invalidateQueries({
				queryKey: invoiceKeys.lists(),
			});
			queryClient.invalidateQueries({
				queryKey: invoiceKeys.stats(),
			});
		},
		onError: (error) => {
			console.error("Error creating invoice:", error);
		},
	});
};

/**
 * PUT - Update invoice
 */
export const useUpdateInvoice = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationKey: invoiceKeys.update(),
		mutationFn: ({
			id,
			payload,
		}: {
			id: string | number;
			payload: UpdateInvoiceRequest;
		}) => invoiceService.update(id, payload),
		onSuccess: (_data, variables) => {
			// Invalidate and refetch invoices list, stats, and specific invoice
			queryClient.invalidateQueries({
				queryKey: invoiceKeys.lists(),
			});
			queryClient.invalidateQueries({
				queryKey: invoiceKeys.stats(),
			});
			queryClient.invalidateQueries({
				queryKey: invoiceKeys.detail(variables.id),
			});
			queryClient.invalidateQueries({
				queryKey: invoiceKeys.history(variables.id),
			});
		},
		onError: (error) => {
			console.error("Error updating invoice:", error);
		},
	});
};

/**
 * DELETE - Delete invoice
 */
export const useDeleteInvoice = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationKey: invoiceKeys.delete(),
		mutationFn: (id: string | number) => invoiceService.delete(id),
		onSuccess: () => {
			// Invalidate and refetch invoices list and stats
			queryClient.invalidateQueries({
				queryKey: invoiceKeys.lists(),
			});
			queryClient.invalidateQueries({
				queryKey: invoiceKeys.stats(),
			});
		},
		onError: (error) => {
			console.error("Error deleting invoice:", error);
		},
	});
};

/**
 * PUT - Change invoice status
 */
export const useChangeInvoiceStatus = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationKey: invoiceKeys.changeStatus(),
		mutationFn: ({
			id,
			payload,
		}: {
			id: string | number;
			payload: ChangeInvoiceStatusRequest;
		}) => invoiceService.changeStatus(id, payload),
		onSuccess: (_data, variables) => {
			// Invalidate and refetch invoices list, stats, and specific invoice
			queryClient.invalidateQueries({
				queryKey: invoiceKeys.lists(),
			});
			queryClient.invalidateQueries({
				queryKey: invoiceKeys.stats(),
			});
			queryClient.invalidateQueries({
				queryKey: invoiceKeys.detail(variables.id),
			});
			queryClient.invalidateQueries({
				queryKey: invoiceKeys.history(variables.id),
			});
		},
		onError: (error) => {
			console.error("Error changing invoice status:", error);
		},
	});
};

/**
 * PUT - Void invoice
 */
export const useVoidInvoice = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationKey: invoiceKeys.void(),
		mutationFn: ({
			id,
			payload,
		}: {
			id: string | number;
			payload: VoidInvoiceRequest;
		}) => invoiceService.makeVoid(id, payload),
		onSuccess: (_data, variables) => {
			queryClient.invalidateQueries({
				queryKey: invoiceKeys.lists(),
			});
			queryClient.invalidateQueries({
				queryKey: invoiceKeys.stats(),
			});
			queryClient.invalidateQueries({
				queryKey: invoiceKeys.detail(variables.id),
			});
			queryClient.invalidateQueries({
				queryKey: invoiceKeys.history(variables.id),
			});
		},
		onError: (error) => {
			console.error("Error voiding invoice:", error);
		},
	});
};

/**
 * POST - Add item to invoice
 */
export const useAddInvoiceItem = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationKey: invoiceKeys.update(),
		mutationFn: ({
			invoiceId,
			payload,
		}: {
			invoiceId: string | number;
			payload: CreateInvoiceItemRequest;
		}) => invoiceService.addItem(invoiceId, payload),
		onSuccess: (_data, variables) => {
			// Invalidate and refetch specific invoice, list, and stats
			queryClient.invalidateQueries({
				queryKey: invoiceKeys.detail(variables.invoiceId),
			});
			queryClient.invalidateQueries({
				queryKey: invoiceKeys.lists(),
			});
			queryClient.invalidateQueries({
				queryKey: invoiceKeys.stats(),
			});
			queryClient.invalidateQueries({
				queryKey: invoiceKeys.history(variables.invoiceId),
			});
		},
		onError: (error) => {
			console.error("Error adding invoice item:", error);
		},
	});
};

/**
 * PUT - Update invoice item
 */
export const useUpdateInvoiceItem = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationKey: invoiceKeys.update(),
		mutationFn: ({
			invoiceId,
			itemId,
			payload,
		}: {
			invoiceId: string | number;
			itemId: string | number;
			payload: UpdateInvoiceItemRequest;
		}) => invoiceService.updateItem(invoiceId, itemId, payload),
		onSuccess: (_data, variables) => {
			// Invalidate and refetch specific invoice, list, and stats
			queryClient.invalidateQueries({
				queryKey: invoiceKeys.detail(variables.invoiceId),
			});
			queryClient.invalidateQueries({
				queryKey: invoiceKeys.lists(),
			});
			queryClient.invalidateQueries({
				queryKey: invoiceKeys.stats(),
			});
			queryClient.invalidateQueries({
				queryKey: invoiceKeys.history(variables.invoiceId),
			});
		},
		onError: (error) => {
			console.error("Error updating invoice item:", error);
		},
	});
};

/**
 * DELETE - Delete invoice item
 */
export const useDeleteInvoiceItem = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationKey: invoiceKeys.update(),
		mutationFn: ({
			invoiceId,
			itemId,
		}: {
			invoiceId: string | number;
			itemId: string | number;
		}) => invoiceService.deleteItem(invoiceId, itemId),
		onSuccess: (_data, variables) => {
			// Invalidate and refetch specific invoice, list, and stats
			queryClient.invalidateQueries({
				queryKey: invoiceKeys.detail(variables.invoiceId),
			});
			queryClient.invalidateQueries({
				queryKey: invoiceKeys.lists(),
			});
			queryClient.invalidateQueries({
				queryKey: invoiceKeys.stats(),
			});
			queryClient.invalidateQueries({
				queryKey: invoiceKeys.history(variables.invoiceId),
			});
		},
		onError: (error) => {
			console.error("Error deleting invoice item:", error);
		},
	});
};

/**
 * POST - Record payment against invoice
 */
export const useRecordPayment = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationKey: invoiceKeys.recordPayment(),
		mutationFn: ({
			invoiceId,
			payload,
		}: {
			invoiceId: string | number;
			payload: RecordPaymentRequest;
		}) => invoiceService.recordPayment(invoiceId, payload),
		onSuccess: (_data, variables) => {
			// Invalidate and refetch invoices list, stats, and specific invoice
			queryClient.invalidateQueries({
				queryKey: invoiceKeys.lists(),
			});
			queryClient.invalidateQueries({
				queryKey: invoiceKeys.stats(),
			});
			queryClient.invalidateQueries({
				queryKey: invoiceKeys.detail(variables.invoiceId),
			});
			queryClient.invalidateQueries({
				queryKey: invoiceKeys.history(variables.invoiceId),
			});
		},
		onError: (error) => {
			console.error("Error recording payment:", error);
		},
	});
};

/**
 * POST - Bulk record payments
 */
export const useBulkRecordPayments = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationKey: invoiceKeys.bulkPayments(),
		mutationFn: (payload: BulkRecordPaymentRequest) =>
			invoiceService.bulkRecordPayments(payload),
		onSuccess: (_data, variables) => {
			queryClient.invalidateQueries({
				queryKey: invoiceKeys.lists(),
			});
			queryClient.invalidateQueries({
				queryKey: invoiceKeys.stats(),
			});
			variables.invoice_ids.forEach((invoiceId) => {
				queryClient.invalidateQueries({
					queryKey: invoiceKeys.detail(invoiceId),
				});
				queryClient.invalidateQueries({
					queryKey: invoiceKeys.history(invoiceId),
				});
			});
		},
		onError: (error) => {
			console.error("Error recording bulk payments:", error);
		},
	});
};
