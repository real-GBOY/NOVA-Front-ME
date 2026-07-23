/** @format */

export type VoucherType = "payment" | "receipt";
export type VoucherStatus = "active" | "inactive";

export interface LinkedInvoice {
	invoiceNumber: string;
	pending: number;
	pay: number;
}

export interface Voucher {
	id: string;
	paymentCode: string;
	from: string;
	to: string;
	dateCreated: string;
	voucherDate?: string;
	amount: number;
	totalAmount?: number;
	currency?: string;
	status: VoucherStatus;
	statusLabel?: string; // Original backend status label (e.g., "Draft", "Pending_Approval", "Approved", "Active", "Cancelled")
	type: VoucherType;
	expenseType?: string;
	incomeType?: string;
	paymentMethod?: string;
	remarks?: string;
	referenceNumber?: string;
	bankName?: string;
	transactionDetails?: string;
	customerName?: string;
	commission?: number;
	tax?: number;
	linkedInvoices?: LinkedInvoice[];
}

export const vouchersData: Voucher[] = [
	{
		id: "1",
		paymentCode: "INV-00183715",
		from: "Global Mail Services",
		to: "Global Mail Services",
		dateCreated: "29 Nov, 2025 at 8:30 PM",
		amount: 389.99,
		status: "active",
		type: "payment",
		expenseType: "Type",
		customerName: "This is a customer",
		commission: 389.99,
		tax: 389.99,
		linkedInvoices: [
			{ invoiceNumber: "INV-00183715", pending: 45.67, pay: 23.5 },
			{ invoiceNumber: "INV-00183716", pending: 75.25, pay: 12.34 },
			{ invoiceNumber: "INV-00183717", pending: 89.99, pay: 150.0 },
		],
	},
	{
		id: "2",
		paymentCode: "Invoice-77889",
		from: "Desert Express Couriers",
		to: "Desert Express Couriers",
		dateCreated: "08:57 AM • 29 Nov",
		amount: 389.99,
		status: "active",
		type: "payment",
	},
	{
		id: "3",
		paymentCode: "Invoice-12345",
		from: "Oasis Postal Solutions",
		to: "Oasis Postal Solutions",
		dateCreated: "08:57 AM • 29 Nov",
		amount: 275.0,
		status: "active",
		type: "payment",
	},
	{
		id: "4",
		paymentCode: "Invoice-56789",
		from: "Skyline Delivery Network",
		to: "Skyline Delivery Network",
		dateCreated: "08:57 AM • 29 Nov",
		amount: 634.15,
		status: "inactive",
		type: "payment",
	},
	{
		id: "5",
		paymentCode: "Invoice-11223",
		from: "Pinnacle Postal Services",
		to: "Pinnacle Postal Services",
		dateCreated: "08:57 AM • 29 Nov",
		amount: 450.89,
		status: "active",
		type: "payment",
	},
	{
		id: "6",
		paymentCode: "Invoice-24680",
		from: "Sand Dune Dispatch",
		to: "Sand Dune Dispatch",
		dateCreated: "08:57 AM • 29 Nov",
		amount: 299.99,
		status: "active",
		type: "payment",
	},
	{
		id: "7",
		paymentCode: "Invoice-34443",
		from: "Falcon Freight Services",
		to: "Falcon Freight Services",
		dateCreated: "08:57 AM • 29 Nov",
		amount: 725.3,
		status: "inactive",
		type: "payment",
	},
	{
		id: "8",
		paymentCode: "Invoice-13579",
		from: "Horizon Mail Logistics",
		to: "Horizon Mail Logistics",
		dateCreated: "08:57 AM • 29 Nov",
		amount: 198.75,
		status: "active",
		type: "receipt",
	},
	{
		id: "9",
		paymentCode: "Invoice-98765",
		from: "Crescent Courier Company",
		to: "Crescent Courier Company",
		dateCreated: "08:57 AM • 29 Nov",
		amount: 850.0,
		status: "active",
		type: "receipt",
	},
	{
		id: "10",
		paymentCode: "Invoice-54321",
		from: "Sunrise Shipping Solutions",
		to: "Sunrise Shipping Solutions",
		dateCreated: "08:57 AM • 29 Nov",
		amount: 478.2,
		status: "active",
		type: "receipt",
	},
	{
		id: "11",
		paymentCode: "Invoice-55667",
		from: "Wave Rider Delivery",
		to: "Wave Rider Delivery",
		dateCreated: "08:57 AM • 29 Nov",
		amount: 560.45,
		status: "active",
		type: "receipt",
	},
	{
		id: "12",
		paymentCode: "Invoice-67890",
		from: "Dune Mail Express",
		to: "Dune Mail Express",
		dateCreated: "08:57 AM • 29 Nov",
		amount: 720.99,
		status: "inactive",
		type: "receipt",
	},
];
