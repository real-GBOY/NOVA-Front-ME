/** @format */

import Button from "@/designSystem/Button";
import SortDropdown from "@/designSystem/SortDropdown";
import { Search2Line, Plus } from "@/Icons";
import { useLanguage } from "@/hooks/useLanguage";
import { useTranslation } from "@/hooks/useTranslation";
import { PermissionGate } from "@/utilities/secure/PermissionGate";

import LegalCasesFilterDropdown, {
	type LegalCaseFilters,
} from "./LegalCasesFilterDropdown";

interface LegalCasesToolbarProps {
	searchQuery: string;
	onSearchChange: (value: string) => void;
	onSortChange: (optionId: string) => void;
	onAddCaseClick: () => void;
	onFiltersApply?: (filters: LegalCaseFilters) => void;
}

function LegalCasesToolbar({
	searchQuery,
	onSearchChange,
	onSortChange,
	onAddCaseClick,
	onFiltersApply,
}: LegalCasesToolbarProps) {
	const { t } = useTranslation("settings");
	const { isRTL } = useLanguage();

	const sortOptions = [
		{ id: "dateCreated", label: t("legalCases.sortOptions.dateCreated") },
		{ id: "lastUpdated", label: t("legalCases.sortOptions.lastUpdated") },
		{ id: "caseNumber", label: t("legalCases.sortOptions.caseNumber") },
		{ id: "title", label: t("legalCases.sortOptions.title") },
	];

	return (
		<div
			className={`flex flex-col md:flex-row md:items-center gap-3 mb-6 xl:whitespace-nowrap ${
				isRTL ? "md:flex-row-reverse" : ""
			}`}
			dir={isRTL ? "rtl" : "ltr"}>
			{/* Search */}
			<div className='w-full md:w-[280px] md:shrink-0'>
				<div className='relative'>
					<div
						className={`absolute top-1/2 -translate-y-1/2 ${
							isRTL ? "right-3" : "left-3"
						}`}>
						<Search2Line size={20} />
					</div>
					<input
						type='text'
						placeholder={t("legalCases.searchPlaceholder")}
						value={searchQuery}
						onChange={(e) => onSearchChange(e.target.value)}
						className={`w-full text-xs md:text-sm xl:text-sm ${
							isRTL ? "pr-10 pl-3" : "pl-10 pr-3"
						} py-2 border border-border rounded-lg bg-background text-text-sub placeholder:text-text-soft focus:outline-none focus:ring-2 focus:ring-primary/20`}
						dir={isRTL ? "rtl" : "ltr"}
					/>
				</div>
			</div>

			{/* Filter, Sort, and Add Case */}
			<div
				className={`grid grid-cols-2 gap-2 w-full md:flex md:flex-1 md:flex-wrap md:items-center ${
					isRTL ? "md:justify-start" : "md:justify-end"
				}`}>
				<LegalCasesFilterDropdown
					onApply={onFiltersApply}
					triggerClassName="w-full justify-between"
				/>
				<SortDropdown
					label={t("legalCases.sortBy")}
					options={sortOptions}
					onSelect={onSortChange}
					className="w-full sm:w-auto"
				/>

				<PermissionGate permission="create_legal_case">
					<Button
						onClick={onAddCaseClick}
						className='col-span-2 w-full md:w-auto px-4 text-xs md:text-sm whitespace-nowrap justify-start'>
						<Plus size={20} className='text-white fill-white' />
						<span className='whitespace-nowrap'>{t("legalCases.addCase")}</span>
					</Button>
				</PermissionGate>
			</div>
		</div>
	);
}

export default LegalCasesToolbar;
