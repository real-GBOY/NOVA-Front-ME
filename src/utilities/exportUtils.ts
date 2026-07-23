/** @format */

import * as XLSX from "xlsx";
import Papa from "papaparse";

/**
 * Safely tries to parse a string as a JSON object, handling single quotes.
 * Returns the object or null if parsing fails or result is not an object.
 */
function safeParseJSON(str: string): Record<string, unknown> | null {
	try {
		// 1. Try standard parsing
		const parsed = JSON.parse(str);
		if (typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)) {
			return parsed as Record<string, unknown>;
		}
	} catch {
		// 2. Try replacing single quotes with double quotes (handling simple Python-dict style strings)
		try {
			const fixed = str.replace(/'/g, '"');
			const parsed = JSON.parse(fixed);
			if (typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)) {
				return parsed as Record<string, unknown>;
			}
		} catch {
			return null;
		}
	}
	return null;
}

/**
 * Export data to Excel (.xlsx) format
 * @param data - Array of objects to export
 * @param filename - Name of the file (without extension)
 * @param sheetName - Name of the worksheet (optional)
 */
export function exportToExcel<T extends Record<string, unknown>>(
	data: T[],
	filename: string,
	sheetName: string = "Sheet1"
): void {
	try {
		// Create a new workbook
		const workbook = XLSX.utils.book_new();

		// Pre-process data to ensure all nested objects are flattened
		// XLSX.utils.json_to_sheet will stringify objects, so we need to flatten them first
		const flattenedData = data.map((row) => {
			const flatRow: Record<string, unknown> = {};
			
			const processValue = (key: string, value: unknown): void => {
				if (value === null || value === undefined) {
					flatRow[key] = "";
				} else if (typeof value === "object" && !Array.isArray(value) && !(value instanceof Date)) {
					// Flatten nested object
					const obj = value as Record<string, unknown>;
					if (Object.keys(obj).length === 0) {
                        flatRow[key] = "{}";
                    } else {
                        Object.entries(obj).forEach(([nestedKey, nestedValue]) => {
                            processValue(`${key}_${nestedKey}`, nestedValue);
                        });
                    }
				} else if (Array.isArray(value)) {
					flatRow[key] = value.map(v => {
						if (typeof v === "object" && v !== null) {
							const o = v as Record<string, unknown>;
							return o.name || o.title || JSON.stringify(v);
						}
						return String(v);
					}).join(", ");
				} else if (typeof value === "string" && value.trim().startsWith("{") && value.trim().endsWith("}")) {
					// Try to parse stringified JSON object
					const parsed = safeParseJSON(value);

                    if (parsed && Object.keys(parsed).length > 0) {
                        Object.entries(parsed).forEach(([nestedKey, nestedValue]) => {
                            processValue(`${key}_${nestedKey}`, nestedValue);
                        });
                    } else {
                        // Fallback: keep original string
                        flatRow[key] = value;
                    }
				} else {
					flatRow[key] = value;
				}
			};
			
			Object.entries(row).forEach(([key, value]) => {
				processValue(key, value);
			});
			
			return flatRow;
		});

		// Convert data to worksheet
		const worksheet = XLSX.utils.json_to_sheet(flattenedData);

		// Auto-size columns
		const maxWidth = 50;
		const columnWidths = Object.keys(flattenedData[0] || {}).map((key) => {
			const maxLength = Math.max(
				key.length,
				...flattenedData.map((row) => String(row[key] || "").length)
			);
			return { wch: Math.min(maxLength + 2, maxWidth) };
		});
		worksheet["!cols"] = columnWidths;

		// Add worksheet to workbook
		XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

		// Generate Excel file and trigger download
		XLSX.writeFile(workbook, `${filename}.xlsx`);
	} catch (error) {
		console.error("Error exporting to Excel:", error);
		throw new Error("Failed to export to Excel");
	}
}

/**
 * Export data to CSV format
 * @param data - Array of objects to export
 * @param filename - Name of the file (without extension)
 */
export function exportToCSV<T extends Record<string, unknown>>(
	data: T[],
	filename: string
): void {
	try {
		// Pre-process data to ensure all nested objects are flattened
		// PapaParse will stringify objects, so we need to flatten them first
		const flattenedData = data.map((row) => {
			const flatRow: Record<string, unknown> = {};
			
			const processValue = (key: string, value: unknown): void => {
				if (value === null || value === undefined) {
					flatRow[key] = "";
				} else if (typeof value === "object" && !Array.isArray(value) && !(value instanceof Date)) {
					// Flatten nested object
					const obj = value as Record<string, unknown>;
                    if (Object.keys(obj).length === 0) {
                        flatRow[key] = "{}";
                    } else {
                        Object.entries(obj).forEach(([nestedKey, nestedValue]) => {
                            processValue(`${key}_${nestedKey}`, nestedValue);
                        });
                    }
				} else if (Array.isArray(value)) {
                    flatRow[key] = value.map(v => {
						if (typeof v === "object" && v !== null) {
							const o = v as Record<string, unknown>;
							return o.name || o.title || JSON.stringify(v);
						}
						return String(v);
					}).join(", ");
				} else if (typeof value === "string" && value.trim().startsWith("{") && value.trim().endsWith("}")) {
					// Try to parse stringified JSON object
					const parsed = safeParseJSON(value);

                    if (parsed && Object.keys(parsed).length > 0) {
                        Object.entries(parsed).forEach(([nestedKey, nestedValue]) => {
                            processValue(`${key}_${nestedKey}`, nestedValue);
                        });
                    } else {
                        // Fallback: keep original string
                        flatRow[key] = value;
                    }
				} else {
					flatRow[key] = value;
				}
			};
			
			Object.entries(row).forEach(([key, value]) => {
				processValue(key, value);
			});
			
			return flatRow;
		});

		// Convert data to CSV using PapaParse
		const csv = Papa.unparse(flattenedData, {
			quotes: true, // Quote all fields
			header: true, // Include header row
		});

		// Create blob and download
		const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
		const link = document.createElement("a");
		const url = URL.createObjectURL(blob);

		link.setAttribute("href", url);
		link.setAttribute("download", `${filename}.csv`);
		link.style.visibility = "hidden";

		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);

		// Clean up
		URL.revokeObjectURL(url);
	} catch (error) {
		console.error("Error exporting to CSV:", error);
		throw new Error("Failed to export to CSV");
	}
}

/**
 * Check if a string is a JSON object or array
 * @param str - String to check
 * @returns Parsed object if valid JSON object/array, null otherwise
 */
function tryParseJsonObject(str: string): Record<string, unknown> | null {
	if (typeof str !== 'string') return null;
	const trimmed = str.trim();
	// Only parse if it looks like a JSON object (starts with { and ends with })
	if (!trimmed.startsWith('{') || !trimmed.endsWith('}')) {
		return null;
	}
    return safeParseJSON(trimmed);
}

/**
 * Flatten a nested object into key-value pairs with prefixed keys
 * @param obj - Object to flatten
 * @param prefix - Prefix to add to keys (e.g., "to_account")
 * @returns Flattened key-value pairs
 */
function flattenObject(
	obj: Record<string, unknown>,
	prefix: string
): Record<string, unknown> {
	const result: Record<string, unknown> = {};

	Object.entries(obj).forEach(([key, value]) => {
		const newKey = `${prefix}_${key}`;

		if (value === null || value === undefined) {
			result[newKey] = "";
		} else if (value instanceof Date) {
			result[newKey] = value.toLocaleDateString();
		} else if (typeof value === "object" && !Array.isArray(value)) {
			// Recursively flatten nested objects
			const nested = flattenObject(value as Record<string, unknown>, newKey);
			Object.assign(result, nested);
		} else if (Array.isArray(value)) {
			result[newKey] = value.join(", ");
		} else {
			result[newKey] = value;
		}
	});

	return result;
}

/**
 * Remove duplicate columns that have identical values to other columns
 * @param data - Array of formatted objects
 * @returns Data with duplicate columns removed
 */
function removeDuplicateColumns(
	data: Record<string, unknown>[]
): Record<string, unknown>[] {
	if (data.length === 0) return data;

	// Get all column keys
	const allKeys = Object.keys(data[0]);
	
	// Find columns that are duplicates (same value in all rows)
	const duplicatesToRemove = new Set<string>();
	
	for (let i = 0; i < allKeys.length; i++) {
		const key1 = allKeys[i];
		if (duplicatesToRemove.has(key1)) continue;
		
		for (let j = i + 1; j < allKeys.length; j++) {
			const key2 = allKeys[j];
			if (duplicatesToRemove.has(key2)) continue;
			
			// Check if all rows have the same value for both columns
			const areIdentical = data.every((row) => {
				const val1 = row[key1];
				const val2 = row[key2];
				return val1 === val2 || 
					(val1 === "" && val2 === "") || 
					(val1 === null && val2 === null) ||
					(val1 === undefined && val2 === undefined);
			});
			
			if (areIdentical) {
				// Keep the shorter key name, remove the longer one (usually the flattened one)
				if (key1.length <= key2.length) {
					duplicatesToRemove.add(key2);
				} else {
					duplicatesToRemove.add(key1);
				}
			}
		}
	}
	
	// Remove duplicate columns from all rows
	return data.map((row) => {
		const cleaned: Record<string, unknown> = {};
		Object.entries(row).forEach(([key, value]) => {
			if (!duplicatesToRemove.has(key)) {
				cleaned[key] = value;
			}
		});
		return cleaned;
	});
}

/**
 * Format data for export by flattening nested objects and formatting dates
 * Nested objects are spread into separate columns (e.g., to_account.account_id -> to_account_account_id)
 * Duplicate columns with identical values are removed
 * @param data - Array of objects to format
 * @param fieldMapping - Optional mapping of field names for export headers
 */
export function formatDataForExport<T extends Record<string, unknown>>(
	data: T[],
	fieldMapping?: Record<string, string>
): Record<string, unknown>[] {
	const formattedData = data.map((item) => {
		const formatted: Record<string, unknown> = {};

		Object.entries(item).forEach(([key, value]) => {
			// Skip avatar-related fields
			if (
				key === 'avatar' || 
				key === 'avatarBg' || 
				key === 'memberAvatar' || 
				key === 'memberAvatarBg'
			) {
				return;
			}

			// Use mapped field name if provided, otherwise use original key
			const exportKey = fieldMapping?.[key] || key;

			// Handle different value types
			if (value === null || value === undefined) {
				formatted[exportKey] = "";
			} else if (value instanceof Date) {
				formatted[exportKey] = value.toLocaleDateString();
			} else if (typeof value === "object" && !Array.isArray(value)) {
				// Flatten nested objects into separate columns
				// e.g., to_account: {account_id: 5, account_name: "test"} 
				// becomes to_account_account_id: 5, to_account_account_name: "test"
				const flattened = flattenObject(value as Record<string, unknown>, exportKey);
				Object.assign(formatted, flattened);
			} else if (Array.isArray(value)) {
				// Handle arrays - check if it's an array of objects
				if (value.length > 0 && typeof value[0] === "object" && value[0] !== null) {
					// Array of objects - stringify each and join
					formatted[exportKey] = value.map(v => {
						if (typeof v === "object" && v !== null) {
							const obj = v as Record<string, unknown>;
							return obj.name || obj.title || JSON.stringify(v);
						}
						return String(v);
					}).join(", ");
				} else {
					// Simple array - join values
					formatted[exportKey] = value.join(", ");
				}
			} else {
				// Check if this is a stringified JSON object
				const parsedJson = typeof value === 'string' ? tryParseJsonObject(value) : null;
				if (parsedJson) {
					// This is a stringified JSON object, flatten it
					const flattened = flattenObject(parsedJson, exportKey);
					Object.assign(formatted, flattened);
				} else {
					formatted[exportKey] = value;
				}
			}
		});

		return formatted;
	});

	// Remove duplicate columns that have identical values
	return removeDuplicateColumns(formattedData);
}

/**
 * Merge transformed data with raw API data
 * Uses transformed data (with friendly names) but adds any fields that were removed during transformation
 * @param transformedData - Array of transformed objects (with friendly field names)
 * @param rawData - Array of raw API objects (with all original fields)
 * @param idField - Field name to match records (e.g., 'id', 'invoice_id', 'payroll_id')
 * @returns Merged data with both transformed and raw fields
 */
export function mergeTransformedWithRawData<T extends Record<string, unknown>, R extends Record<string, unknown>>(
	transformedData: T[],
	rawData: R[],
	idField: string = 'id'
): Record<string, unknown>[] {
	return transformedData.map((transformedItem) => {
		// Find matching raw item by ID
		const rawItem = rawData.find((raw) => {
			// Try to match by the specified ID field
			const transformedId = transformedItem[idField];
			const rawId = raw[idField];
			
			// Also try common ID field variations
			const altTransformedId = transformedItem.id || transformedItem.invoice_id || transformedItem.payroll_id || transformedItem.voucher_id || transformedItem.receipt_id;
			const altRawId = raw.id || raw.invoice_id || raw.payroll_id || raw.voucher_id || raw.receipt_id;
			
			return transformedId === rawId || altTransformedId === altRawId;
		});

		if (!rawItem) {
			// If no matching raw item found, just return transformed data
			return transformedItem;
		}

		// Start with transformed data (has friendly names)
		const merged: Record<string, unknown> = { ...transformedItem };

		// Add any fields from raw data that don't exist in transformed data
		Object.keys(rawItem).forEach((key) => {
			if (!(key in merged)) {
				// This field was removed during transformation, add it back
				merged[key] = rawItem[key];
			}
		});

		return merged;
	});
}

/**
 * Generate filename with timestamp
 * @param baseName - Base name for the file
 * @returns Filename with timestamp
 */
export function generateFilename(baseName: string): string {
	const timestamp = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
	return `${baseName}_${timestamp}`;
}
