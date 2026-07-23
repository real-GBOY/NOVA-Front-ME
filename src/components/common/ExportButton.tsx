/** @format */

import { useState, useRef } from "react";
import { FileExport } from "@/Icons";
import Dropdown from "@/designSystem/Dropdown";
import { exportToExcel, exportToCSV, formatDataForExport, generateFilename, mergeTransformedWithRawData } from "@/utilities/exportUtils";
import toast from "@/utilities/toast";
import { useTranslation } from "@/hooks/useTranslation";

interface ExportButtonProps<T extends Record<string, any>> {
	data: T[];
	rawData?: any[]; // Optional raw API data to merge with transformed data
	idField?: string; // Field to match records when merging (default: 'id')
	filename: string;
	fieldMapping?: Record<string, string>;
	sheetName?: string;
	disabled?: boolean;
	className?: string;
}

export default function ExportButton<T extends Record<string, any>>({
	data,
	rawData,
	idField = 'id',
	filename,
	fieldMapping,
	sheetName = "Data",
	disabled = false,
	className = "",
}: ExportButtonProps<T>) {
	const { t } = useTranslation("common");
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	const buttonRef = useRef<HTMLButtonElement>(null);

	const handleExport = async (format: "excel" | "csv") => {
		try {
			if (!data || data.length === 0) {
				toast.error("No data to export");
				return;
			}

			// Merge transformed data with raw data if rawData is provided
			let dataToExport = data;
			if (rawData && rawData.length > 0) {
				dataToExport = mergeTransformedWithRawData(data, rawData, idField) as T[];
			}

			// Format data for export
			const formattedData = formatDataForExport(dataToExport, fieldMapping);
			const exportFilename = generateFilename(filename);

			// Export based on format
			if (format === "excel") {
				exportToExcel(formattedData, exportFilename, sheetName);
				toast.success(t("export.excelSuccess"));
			} else {
				exportToCSV(formattedData, exportFilename);
				toast.success(t("export.csvSuccess"));
			}

			setIsDropdownOpen(false);
		} catch (error) {
			console.error("Export error:", error);
			toast.error(t("export.error", { format: format.toUpperCase() }));
		}
	};

	const dropdownItems = [
		{
			id: "excel",
			label: t("export.excel"),
			icon: FileExport,
			onClick: () => handleExport("excel"),
		},
		{
			id: "csv",
			label: t("export.csv"),
			icon: FileExport,
			onClick: () => handleExport("csv"),
		},
	];

	return (
		<>
			<button
				ref={buttonRef}
				onClick={() => setIsDropdownOpen(!isDropdownOpen)}
				disabled={disabled || !data || data.length === 0}
				className={`flex items-center gap-2 px-2.5 py-2 text-sm font-medium text-text-sub border border-border rounded-lg bg-background hover:bg-bg-weak transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
			>
				<FileExport className="size-5 fill-text-sub" />
				<span>{t("export.button")}</span>
			</button>
			<Dropdown
				isOpen={isDropdownOpen}
				onClose={() => setIsDropdownOpen(false)}
				anchorRef={buttonRef}
				items={dropdownItems}
			/>
		</>
	);
}
