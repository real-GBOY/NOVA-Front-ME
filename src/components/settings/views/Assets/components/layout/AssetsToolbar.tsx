/** @format */

import { useTranslation } from "@/hooks/useTranslation";
import SearchInput from "@/designSystem/SearchInput";
import AddButton from "@/designSystem/AddButton";
import SortDropdown from "@/designSystem/SortDropdown";
import AssetsFilterDropdown from "../AssetsFilterDropdown";
import type { AssetFilters } from "../AssetsFilterDropdown";
import { MAIN_COLORS } from "@/services/constants/COLORS";
import type { SortOption } from "@/designSystem/SortDropdown";
import { PermissionGate } from "@/utilities/secure/PermissionGate";

interface AssetsToolbarProps {
	searchQuery: string;
	onSearchChange: (value: string) => void;
	onSortChange: (sortId: string) => void;
	onAddAsset: () => void;
	onFiltersApply?: (filters: AssetFilters) => void;
}

function AssetsToolbar({
	searchQuery,
	onSearchChange,
	onSortChange,
	onAddAsset,
	onFiltersApply,
}: AssetsToolbarProps) {
	const { t } = useTranslation("settings");

	const sortOptions: SortOption[] = [
		{ id: "name_asc", label: t("assets.sort.nameAsc") },
		{ id: "name_desc", label: t("assets.sort.nameDesc") },
		{ id: "category_asc", label: t("assets.sort.category") },
		{ id: "status_asc", label: t("assets.sort.status") },
		{ id: "condition_asc", label: t("assets.sort.condition") },
		{ id: "serial_asc", label: t("assets.sort.serialNumber") },
	];

	return (
		<div className='flex flex-col md:flex-row md:items-center gap-3 w-full xl:whitespace-nowrap'>
			{/* Search Input */}
			<SearchInput
				value={searchQuery}
				onChange={onSearchChange}
				placeholder={t("assets.searchPlaceholder")}
				className='w-full md:w-[280px] md:shrink-0'
			/>

			{/* Buttons Group: Filter, Sort, Add */}
			<div className='flex flex-wrap items-center gap-2 w-full md:w-auto'>
				<div className="grid grid-cols-2 gap-2 w-full sm:w-auto sm:flex sm:items-center">
					<AssetsFilterDropdown
						onApply={onFiltersApply}
						triggerClassName="w-full justify-between"
					/>
					<SortDropdown
						label={t("assets.sortBy")}
						options={sortOptions}
						onSelect={onSortChange}
						className='w-full sm:w-auto min-w-[100px]'
					/>
				</div>

				<PermissionGate permission="create_asset">
					<AddButton
						onClick={onAddAsset}
						text={t("assets.addButton")}
						backgroundColor={MAIN_COLORS.light["bg-dark"]}
					/>
				</PermissionGate>
			</div>
		</div>
	);
}

export default AssetsToolbar;
