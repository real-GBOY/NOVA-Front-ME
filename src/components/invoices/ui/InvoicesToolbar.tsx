
/** @format */

import Button from "@/designSystem/Button";
import SortDropdown from "@/designSystem/SortDropdown";
import { Search2Line, Plus } from "@/Icons";
import { useLanguage } from "@/hooks/useLanguage";
import { useTranslation } from "@/hooks/useTranslation";
import { PermissionGate } from "@/utilities/secure/PermissionGate";
import InvoicesExportButton from "./InvoicesExportButton";

import InvoicesFilterDropdown, {
	type InvoicesFilters,
} from "../InvoicesFilterDropdown";

type InvoiceTab =
	| "all"
	| "draft"
	| "pending"
	| "partially_paid"
	| "fully_paid"
	| "cancelled"
	| "void";

interface InvoicesToolbarProps {
	activeTab: InvoiceTab;
	onTabChange: (tab: InvoiceTab) => void;
	searchQuery: string;
	onSearchChange: (value: string) => void;
	onSortChange: (optionId: string) => void;
	onAddInvoiceClick: () => void;
	onFiltersApply: (filters: InvoicesFilters) => void;
}

export type { InvoiceTab };

function InvoicesToolbar({
	activeTab,
	onTabChange,
	searchQuery,
	onSearchChange,
	onSortChange,
	onAddInvoiceClick,
	onFiltersApply,
}: InvoicesToolbarProps) {
	const { t } = useTranslation("settings");
	const { isRTL } = useLanguage();

	const sortOptions = [
		{ id: "dateCreated", label: t("invoices.sortOptions.dateCreated") },
		{ id: "lastUpdated", label: t("invoices.sortOptions.lastUpdated") },
		{ id: "amountHigh", label: t("invoices.sortOptions.amountHigh") },
		{ id: "amountLow", label: t("invoices.sortOptions.amountLow") },
	];

	const getTabClassName = (isActive: boolean) =>
		`!px-4 !py-1 !text-sm !font-medium !rounded-md !transition-colors !whitespace-nowrap ${
			isActive
				? "!bg-background !shadow-sm !text-text-strong hover:!bg-background"
				: "!text-text-soft hover:!bg-background/50 !bg-transparent !border-0"
		}`;

	return (
		<div
			className={`flex flex-col gap-3 mb-6 sm:flex-row sm:items-center sm:justify-between xl:whitespace-nowrap ${
				isRTL ? "sm:flex-row-reverse" : ""
			}`}
			dir={isRTL ? "rtl" : "ltr"}>
			{/* Tabs */}
			<div className='bg-bg-weak flex p-0.5 rounded-lg w-full sm:w-auto overflow-x-auto sm:overflow-visible'>
				<Button
					onClick={() => onTabChange("all")}
					className={getTabClassName(activeTab === "all")}>
					{t("invoices.tabs.all")}
				</Button>
				<Button
					onClick={() => onTabChange("draft")}
					className={getTabClassName(activeTab === "draft")}>
					{t("invoices.tabs.draft")}
				</Button>
				<Button
					onClick={() => onTabChange("pending")}
					className={getTabClassName(activeTab === "pending")}>
					{t("invoices.tabs.pending")}
				</Button>
				<Button
					onClick={() => onTabChange("partially_paid")}
					className={getTabClassName(activeTab === "partially_paid")}>
					{t("invoices.tabs.partially_paid")}
				</Button>
				<Button
					onClick={() => onTabChange("fully_paid")}
					className={getTabClassName(activeTab === "fully_paid")}>
					{t("invoices.tabs.fully_paid")}
				</Button>
				<Button
					onClick={() => onTabChange("cancelled")}
					className={getTabClassName(activeTab === "cancelled")}>
					{t("invoices.tabs.cancelled")}
				</Button>
				<Button
					onClick={() => onTabChange("void")}
					className={getTabClassName(activeTab === "void")}>
					{t("invoices.tabs.void")}
				</Button>
			</div>

			{/* Search, Filter, and Sort */}
			<div
				className={`flex flex-col gap-2 w-full sm:flex-row sm:flex-wrap sm:items-center ${
					isRTL ? "sm:justify-start" : "sm:justify-end"
				}`}>
				<div className='w-full sm:max-w-xs'>
					<div className='relative'>
						<div
							className={`absolute top-1/2 -translate-y-1/2 ${
								isRTL ? "right-3" : "left-3"
							}`}>
							<Search2Line size={20} />
						</div>
						<input
							type='text'
							placeholder={t("invoices.searchPlaceholder")}
							value={searchQuery}
							onChange={(e) => onSearchChange(e.target.value)}
							className={`w-full text-xs md:text-sm xl:text-sm ${
								isRTL ? "pr-10 pl-3" : "pl-10 pr-3"
							} py-2 border border-border rounded-lg bg-background text-text-sub placeholder:text-text-soft focus:outline-none focus:ring-2 focus:ring-primary/20`}
							dir={isRTL ? "rtl" : "ltr"}
						/>
					</div>
				</div>

				<div
					className={`grid grid-cols-2 gap-2 w-full sm:flex sm:w-auto sm:flex-wrap sm:items-center ${
						isRTL ? "sm:flex-row-reverse" : ""
					}`}>
					<InvoicesFilterDropdown
						onApply={onFiltersApply}
						triggerClassName="w-full justify-between"
					/>
					<SortDropdown
						label={t("invoices.sortBy")}
						options={sortOptions}
						onSelect={onSortChange}
						className="w-full sm:w-auto"
					/>

					<InvoicesExportButton className="w-full sm:w-auto text-xs sm:text-sm whitespace-nowrap justify-start" />

					<PermissionGate permission="create_invoice">
						<Button
							onClick={onAddInvoiceClick}
							className='w-full sm:w-auto px-4 text-xs sm:text-sm whitespace-nowrap justify-start'>
							<Plus size={20} className='text-white fill-white' />
							<span className='whitespace-nowrap'>
								{t("invoices.addInvoice")}
							</span>
						</Button>
					</PermissionGate>
				</div>
			</div>
		</div>
	);
}

export default InvoicesToolbar;
