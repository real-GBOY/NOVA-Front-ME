/** @format */

import * as yup from "yup";

export const voucherSchema = yup.object({
	// Shared
	date: yup.date().nullable().required("Date is required"), // voucher_date or receipt_date
	amount: yup
		.number()
		.required("Amount is required")
		.min(0.01, "Amount must be greater than 0"),
	currency: yup.string().default("AED"),
	paymentMethod: yup.string().optional(),
	transactionDetails: yup.string().nullable().optional(),
	remarks: yup
		.string()
		.nullable()
		.optional()
		.max(200, "Remarks must be less than 200 characters"),
	status: yup
		.string()
		.oneOf(
			["Pending_Approval", "Approved"],
			"Status must be Pending Approval or Approved"
		)
		.default("Pending_Approval"),

	// Payment Voucher Specific
	fromType: yup
		.string()
		.optional()
		.when("$voucherType", {
			is: "payment",
			then: (schema) => schema.required("From Type is required"),
			otherwise: (schema) =>
				schema.when("$voucherType", {
					is: "receipt",
					then: (inner) => inner.required("Received From is required"),
				}),
		}), // "Cash" or "Bank" for payment; "Customer", "Agent", "Employee", "Other" for receipt
	fromAccountId: yup
		.string()
		.optional()
		.nullable()
		.when(["$voucherType", "fromType"], ([voucherType, fromType], schema) => {
			if (voucherType === "payment" && fromType) {
				const message =
					fromType === "Cash"
						? "Pretty Cash Name is required"
						: "From Account is required";
				return schema.required(message);
			}
			return schema;
		}), // Required when fromType is "Cash" or "Bank"
	toType: yup
		.string()
		.optional()
		.when("$voucherType", {
			is: "payment",
			then: (schema) => schema.required("To Type is required"),
			otherwise: (schema) =>
				schema.when("$voucherType", {
					is: "receipt",
					then: (inner) => inner.required("To Type is required"),
				}),
		}), // "Customer", "Agent", "Bank", "Other" for payment; "Cash", "Bank" for receipt
	toCustomerId: yup
		.string()
		.optional()
		.nullable()
		.when(["$voucherType", "toType"], {
			is: (voucherType: string, toType: string) =>
				voucherType === "payment" && toType === "Customer",
			then: (schema) =>
				schema.required("Customer is required when To Type is Customer"),
		}),
	toAgentId: yup
		.string()
		.optional()
		.nullable()
		.when(["$voucherType", "toType"], {
			is: (voucherType: string, toType: string) =>
				voucherType === "payment" && toType === "Agent",
			then: (schema) =>
				schema.required("Agent is required when To Type is Agent"),
		}),
	toEmployeeId: yup
		.string()
		.optional()
		.nullable()
		.when(["$voucherType", "toType"], {
			is: (voucherType: string, toType: string) =>
				voucherType === "payment" && toType === "Employee",
			then: (schema) =>
				schema.required("Employee is required when To Type is Employee"),
		}),
	toEntityName: yup
		.string()
		.optional()
		.nullable()
		.when(["$voucherType", "toType"], {
			is: (voucherType: string, toType: string) =>
				voucherType === "payment" && toType === "Other",
			then: (schema) =>
				schema.required("Entity Name is required when To Type is Other"),
		}),
	expenseTypeId: yup
		.string()
		.optional()
		.nullable()
		.when("$voucherType", {
			is: "payment",
			then: (schema) => schema.required("Expense Type is required"),
		}),
	commission: yup.number().nullable().optional().min(0),
	taxType: yup
		.string()
		.optional()
		.nullable()
		.when("$voucherType", {
			is: "payment",
			then: (schema) => schema.required("Tax Type is required"),
		}), // "Percentage"
	taxRate: yup.number().nullable().optional().min(0),
	bankName: yup.string().optional().nullable(),

	// Receipt Voucher Specific
	fromCustomerId: yup
		.string()
		.optional()
		.nullable()
		.when(["$voucherType", "fromType"], {
			is: (voucherType: string, fromType: string) =>
				voucherType === "receipt" && fromType === "Customer",
			then: (schema) =>
				schema.required("Customer is required when Received From is Customer"),
		}),
	fromAgentId: yup
		.string()
		.optional()
		.nullable()
		.when(["$voucherType", "fromType"], {
			is: (voucherType: string, fromType: string) =>
				voucherType === "receipt" && fromType === "Agent",
			then: (schema) =>
				schema.required("Agent is required when Received From is Agent"),
		}),
	fromEntityName: yup
		.string()
		.optional()
		.nullable()
		.when(["$voucherType", "fromType"], {
			is: (voucherType: string, fromType: string) =>
				voucherType === "receipt" && fromType === "Other",
			then: (schema) =>
				schema.required("Entity Name is required when Received From is Other"),
		}),
	fromEmployeeId: yup.string().optional().nullable(),
	toAccountId: yup
		.string()
		.optional()
		.nullable()
		.when("$voucherType", {
			is: "receipt",
			then: (schema) => schema.required("Deposit To Account is required"),
			otherwise: (schema) =>
				schema.when("toType", {
					is: "Bank",
					then: (inner) =>
						inner.required("Bank Account is required when To Type is Bank"),
					otherwise: (inner) => inner.optional().nullable(),
				}),
		}),
	incomeTypeId: yup
		.string()
		.optional()
		.nullable()
		.when("$voucherType", {
			is: "receipt",
			then: (schema) => schema.required("Income Type is required"),
		}),
	referenceNumber: yup.string().optional().nullable(),
	bankCommission: yup.number().nullable().optional().min(0),
	taxAmount: yup.number().nullable().optional().min(0),

	// Legacy / Compatibility (can be removed if fully refactored, but keeping for safety if used elsewhere)
	customerName: yup.string().nullable().optional(),
	prettyCashName: yup.string().nullable().optional(),
	bank: yup.string().nullable().optional(),
	notes: yup.string().nullable().optional(),
	tax: yup.number().nullable().optional(),
});

export type VoucherFormData = yup.InferType<typeof voucherSchema>;
