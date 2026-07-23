/** @format */

import { DataTable } from "@/designSystem/ui/data-table";
import { useAssetsTableColumns } from "./components/table/tableColumns";
import type { Asset } from "@/services/assetService";

interface AssetsTableProps {
	data: Asset[];
	globalFilter?: string;
	pageCount?: number;
	pagination?: {
		pageIndex: number;
		pageSize: number;
	};
	onPaginationChange?: (updater: any) => void;
}

function AssetsTable({ 
	data, 
	globalFilter = "",
	pageCount,
	pagination,
	onPaginationChange
}: AssetsTableProps) {
	const columns = useAssetsTableColumns();

	return (
		<DataTable
			columns={columns}
			data={data}
			globalFilter={globalFilter}
			enableRowSelection={false}
			showPagination={true}
			pageCount={pageCount}
			manualPagination={true}
			pagination={pagination}
			onPaginationChange={onPaginationChange}
			translationNamespace='settings'
		/>
	);
}

export default AssetsTable;
