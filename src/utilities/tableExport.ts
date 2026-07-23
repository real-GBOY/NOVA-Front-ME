/** @format */

import type { Column, Row, Table } from "@tanstack/react-table";
import jsPDF from "jspdf";
import autoTable, { type CellInput, type UserOptions } from "jspdf-autotable";
import { utils as XLSXUtils, writeFile as writeXLSXFile } from "xlsx";

type ExportableColumnMeta = {
	exportLabel?: string;
	skipExport?: boolean;
};

export type TableExportScope = "all" | "currentPage" | "selected";

export interface BaseTableExportOptions<TData> {
	scope?: TableExportScope;
	fileName?: string;
	includeHiddenColumns?: boolean;
	columnFilter?: (column: Column<TData, unknown>) => boolean;
	formatCell?: (
		value: unknown,
		column: Column<TData, unknown>,
		row: Row<TData>
	) => CellInput;
	headerFormatter?: (column: Column<TData, unknown>) => string;
}

export interface ExcelExportOptions<TData> extends BaseTableExportOptions<TData> {
	sheetName?: string;
}

export interface PdfExportOptions<TData> extends BaseTableExportOptions<TData> {
	title?: string;
	orientation?: "portrait" | "landscape";
	autoTableOptions?: Omit<UserOptions, "head" | "body">;
}

function getColumnsToExport<TData>(
	table: Table<TData>,
	includeHiddenColumns: boolean,
	columnFilter?: (column: Column<TData, unknown>) => boolean
) {
	const columns = includeHiddenColumns
		? table.getAllLeafColumns()
		: table.getVisibleLeafColumns();

	return columns.filter((column) => {
		const meta = column.columnDef.meta as ExportableColumnMeta | undefined;
		if (meta?.skipExport) return false;
		return columnFilter ? columnFilter(column) : true;
	});
}

function getRowsForScope<TData>(table: Table<TData>, scope: TableExportScope) {
	if (scope === "selected") {
		return table.getSelectedRowModel().rows;
	}

	if (scope === "currentPage") {
		return table.getRowModel().rows;
	}

	// Everything after filtering/sorting but before pagination
	return table.getPrePaginationRowModel().rows;
}

function defaultHeaderFormatter<TData>(
	column: Column<TData, unknown>
): string {
	const meta = column.columnDef.meta as ExportableColumnMeta | undefined;
	if (meta?.exportLabel) return meta.exportLabel;

	if (typeof column.columnDef.header === "string") {
		return column.columnDef.header;
	}

	return column.id;
}

function defaultFormatCell(value: unknown): CellInput {
	if (value === null || value === undefined) return "";
	if (value instanceof Date) return value.toLocaleString();
	if (typeof value === "boolean") return value ? "Yes" : "No";
	if (Array.isArray(value)) return value.join(", ");
	if (typeof value === "object") return JSON.stringify(value);
	return value as CellInput;
}

function buildTableData<TData>(
	table: Table<TData>,
	options: BaseTableExportOptions<TData> = {}
) {
	const {
		scope = "all",
		includeHiddenColumns = false,
		columnFilter,
		headerFormatter = defaultHeaderFormatter,
		formatCell = defaultFormatCell,
	} = options;

	const columns = getColumnsToExport(table, includeHiddenColumns, columnFilter);
	const rows = getRowsForScope(table, scope);

	const headers = columns.map((column) => headerFormatter(column));
	const body = rows.map((row) =>
		columns.map((column) => formatCell(row.getValue(column.id), column, row))
	);

	return { headers, body };
}

export function exportTableToExcel<TData>(
	table: Table<TData>,
	options: ExcelExportOptions<TData> = {}
) {
	// Build a simple 2D array with headers + rows for SheetJS
	const { headers, body } = buildTableData(table, options);
	const worksheet = XLSXUtils.aoa_to_sheet([headers, ...body]);
	const workbook = XLSXUtils.book_new();
	const sheetName = options.sheetName || "Data";
	XLSXUtils.book_append_sheet(workbook, worksheet, sheetName);

	const fileName = options.fileName?.endsWith(".xlsx")
		? options.fileName
		: `${options.fileName || "table-export"}.xlsx`;

	writeXLSXFile(workbook, fileName);
}

export function exportTableToPdf<TData>(
	table: Table<TData>,
	options: PdfExportOptions<TData> = {}
) {
	// Convert TanStack Table rows into a format jspdf-autotable understands
	const { headers, body } = buildTableData(table, options);

	const doc = new jsPDF({
		orientation: options.orientation || "landscape",
	});

	let startY = 14;

	if (options.title) {
		doc.setFontSize(14);
		doc.text(options.title, 14, startY);
		startY += 6;
	}

	const userOptions = options.autoTableOptions || {};

	autoTable(doc, {
		head: [headers],
		body,
		startY,
		styles: { fontSize: 10, cellPadding: 3 },
		headStyles: { fillColor: [45, 70, 255], textColor: 255 },
		...userOptions,
	});

	const fileName = options.fileName?.endsWith(".pdf")
		? options.fileName
		: `${options.fileName || "table-export"}.pdf`;

	doc.save(fileName);
}
