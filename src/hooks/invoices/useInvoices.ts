/** @format */

// Queries
export {
	useInvoiceStats,
	useListInvoices,
	useGetInvoiceById,
	useGetInvoiceHistory,
	useLookupCustomers,
	useLookupAgents,
	useLookupServices,
	useLookupEmployees,
} from "./invoice.queries";

// Mutations
export {
	useCreateInvoice,
	useUpdateInvoice,
	useDeleteInvoice,
	useChangeInvoiceStatus,
	useVoidInvoice,
	useAddInvoiceItem,
	useUpdateInvoiceItem,
	useDeleteInvoiceItem,
	useRecordPayment,
	useBulkRecordPayments,
} from "./invoice.mutations";

// Import for barrel export
import {
	useInvoiceStats as _useInvoiceStats,
	useListInvoices as _useListInvoices,
	useGetInvoiceById as _useGetInvoiceById,
	useGetInvoiceHistory as _useGetInvoiceHistory,
	useLookupCustomers as _useLookupCustomers,
	useLookupAgents as _useLookupAgents,
	useLookupServices as _useLookupServices,
	useLookupEmployees as _useLookupEmployees,
} from "./invoice.queries";

import {
	useCreateInvoice as _useCreateInvoice,
	useUpdateInvoice as _useUpdateInvoice,
	useDeleteInvoice as _useDeleteInvoice,
	useChangeInvoiceStatus as _useChangeInvoiceStatus,
	useVoidInvoice as _useVoidInvoice,
	useAddInvoiceItem as _useAddInvoiceItem,
	useUpdateInvoiceItem as _useUpdateInvoiceItem,
	useDeleteInvoiceItem as _useDeleteInvoiceItem,
	useRecordPayment as _useRecordPayment,
	useBulkRecordPayments as _useBulkRecordPayments,
} from "./invoice.mutations";

// Barrel export for convenience
export const useInvoices = () => {
	return {
		// Queries
		useInvoiceStats: _useInvoiceStats,
		useListInvoices: _useListInvoices,
		useGetInvoiceById: _useGetInvoiceById,
		useGetInvoiceHistory: _useGetInvoiceHistory,
		useLookupCustomers: _useLookupCustomers,
		useLookupAgents: _useLookupAgents,
		useLookupServices: _useLookupServices,
		useLookupEmployees: _useLookupEmployees,
		// Mutations
		useCreateInvoice: _useCreateInvoice,
		useUpdateInvoice: _useUpdateInvoice,
		useDeleteInvoice: _useDeleteInvoice,
		useChangeInvoiceStatus: _useChangeInvoiceStatus,
		useVoidInvoice: _useVoidInvoice,
		useAddInvoiceItem: _useAddInvoiceItem,
		useUpdateInvoiceItem: _useUpdateInvoiceItem,
		useDeleteInvoiceItem: _useDeleteInvoiceItem,
		useRecordPayment: _useRecordPayment,
		useBulkRecordPayments: _useBulkRecordPayments,
	};
};
