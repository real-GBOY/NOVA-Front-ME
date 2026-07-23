import Button from "@/designSystem/Button";
import SortDropdown from "@/designSystem/SortDropdown";
import VouchersFilterDropdown from "./VouchersFilterDropdown";
import type { VoucherFilters } from "./VouchersFilterDropdown";
import { Search2Line, MemoListPlusCircle } from "@/Icons";
import { useLanguage } from "@/hooks/useLanguage";
import { useTranslation } from "@/hooks/useTranslation";
import { PermissionGate } from "@/utilities/secure/PermissionGate";
import ExportButton from "@/components/common/ExportButton";

type VoucherTab = "payment" | "receipt";

interface VouchersToolbarProps {
	activeTab: VoucherTab;
	onTabChange: (tab: VoucherTab) => void;
	searchQuery: string;
	onSearchChange: (value: string) => void;
	onSortChange: (optionId: string) => void;
	onAddVoucherClick: () => void;
	onFiltersApply?: (filters: VoucherFilters) => void;
	filterProps?: {
		activeTab: VoucherTab;
		accountOptions: Array<{ id: string; label: string }>;
		customerOptions: Array<{ id: string; label: string }>;
		agentOptions: Array<{ id: string; label: string }>;
	};
	exportData?: any[];
	rawData?: any[];
	rawDataIdField?: string;
}

export type { VoucherTab };

function VouchersToolbar({
	activeTab,
	onTabChange,
	searchQuery,
	onSearchChange,
	onSortChange,
	onAddVoucherClick,
	onFiltersApply,
	filterProps,
	exportData = [],
	rawData = [],
	rawDataIdField,
}: VouchersToolbarProps) {
	const { t } = useTranslation("settings");
	const { isRTL } = useLanguage();

	const sortOptions = [
		{ id: "dateCreated", label: t("vouchers.sortOptions.dateCreated") },
		{ id: "lastUpdated", label: t("vouchers.sortOptions.lastUpdated") },
		{ id: "amountHigh", label: t("vouchers.sortOptions.amountHigh") },
		{ id: "amountLow", label: t("vouchers.sortOptions.amountLow") },
	];

	const getTabClassName = (isActive: boolean) =>
		`px-4! py-1! text-sm! font-medium! rounded-md! transition-colors! ${
			isActive
				? "bg-background! shadow-sm! text-text-strong! hover:bg-background!"
				: "text-text-soft! hover:bg-background/50! bg-transparent! border-0!"
		}`;

	return (
		<div
			className={`flex flex-col md:flex-row md:items-center gap-3 mb-6 xl:whitespace-nowrap ${
				isRTL ? "md:flex-row-reverse" : ""
			}`}
			dir={isRTL ? "rtl" : "ltr"}>
			{/* Tabs */}
			<div className='bg-bg-weak flex p-0.5 rounded-lg w-fit overflow-x-auto'>
				<Button
					onClick={() => onTabChange("payment")}
					className={getTabClassName(activeTab === "payment")}>
					{t("vouchers.tabs.payment")}
				</Button>
				<Button
					onClick={() => onTabChange("receipt")}
					className={getTabClassName(activeTab === "receipt")}>
					{t("vouchers.tabs.receipt")}
				</Button>
			</div>

			{/* Search + Actions */}
			<div
				className={`flex flex-col md:flex-row md:items-center gap-2 w-full md:flex-1 ${
					isRTL ? "md:justify-start" : "md:justify-end"
				}`}>
				<div className='w-full md:max-w-xs md:flex-1'>
					<div className='relative'>
						<div
							className={`absolute top-1/2 -translate-y-1/2 ${
								isRTL ? "right-3" : "left-3"
							}`}>
							<Search2Line size={20} />
						</div>
						<input
							type='text'
							placeholder={t("vouchers.searchPlaceholder")}
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
					className={`flex flex-wrap items-center gap-2 ${
						isRTL ? "flex-row-reverse" : ""
					}`}>
					<div className="grid grid-cols-2 gap-2 w-full sm:w-auto sm:flex sm:items-center">
						{filterProps && (
							<VouchersFilterDropdown
								onApply={onFiltersApply}
								activeTab={filterProps.activeTab}
								accountOptions={filterProps.accountOptions}
								customerOptions={filterProps.customerOptions}
								agentOptions={filterProps.agentOptions}
								triggerClassName="w-full justify-between"
							/>
						)}

						<SortDropdown
							label={t("vouchers.sortBy")}
							options={sortOptions}
							onSelect={onSortChange}
							className="w-full sm:w-auto"
						/>
					</div>

					<ExportButton
						data={exportData}
						rawData={rawData}
						idField={rawDataIdField || (activeTab === "payment" ? "voucher_id" : "receipt_id")}
						filename={activeTab === "payment" ? "payment_vouchers" : "receipt_vouchers"}
						sheetName={activeTab === "payment" ? "Payment Vouchers" : "Receipt Vouchers"}
						className="w-full sm:w-auto text-xs sm:text-sm whitespace-nowrap justify-start"
					/>

					<PermissionGate permission="create_vouchers">
						<Button onClick={onAddVoucherClick} className='w-full sm:w-auto px-4 text-xs sm:text-sm whitespace-nowrap justify-start'>
							<MemoListPlusCircle className='fill-current' />
							<span className='whitespace-nowrap'>
								{activeTab === "receipt"
									? t("vouchers.addReceipt")
									: t("vouchers.addPayment")}
							</span>
						</Button>
					</PermissionGate>
				</div>
			</div>
		</div>
	);
}

export default VouchersToolbar;
