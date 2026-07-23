/** @format */

// Re-export ExpenseType from service
export type { ExpenseType } from "@/services/expenseTypeService";

// Legacy status type for backward compatibility
export type ExpenseStatus = "active" | "inactive" | "Active" | "Inactive";
