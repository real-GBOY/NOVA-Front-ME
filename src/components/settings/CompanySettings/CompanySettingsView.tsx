/** @format */

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { BuildingPen, CalendarBars, Tag, ClockTwo } from "@/Icons";
import { useTranslation } from "@/hooks/useTranslation";
import CompanySettingsHeader from "@/components/settings/CompanySettings/components/CompanySettingsHeader";
import CaseTypesView from "@/components/settings/CompanySettings/components/CaseTypesView";
import CompanyInformationForm from "@/components/settings/CompanySettings/components/CompanyInformationForm";
import HolidaysView from "@/components/settings/CompanySettings/components/Holidays";
import { ShiftsView } from "@/components/settings/CompanySettings/components/Shifts";
import SaveChangesModal from "@/components/settings/CompanySettings/components/SaveChangesModal";
import DiscardChangesModal from "@/components/settings/CompanySettings/components/DiscardChangesModal";
import { usePermissions } from "@/contexts/PermissionContext";
import NoPermissionMessage from "@/components/common/NoPermissionMessage";
import { formatPermissionName } from "@/utilities/permissionFormatters";

type TabType = "company-information" | "holidays" | "case-types" | "shifts";
type CompanyFormWindow = Window & {
	__companyFormIsUploading?: boolean;
	__companyFormCancel?: () => void;
	__companyFormSave?: () => void;
};

function CompanySettingsView() {
	const { t } = useTranslation("settings");
	const { can } = usePermissions();
	const [searchParams, setSearchParams] = useSearchParams();
	const tabParam = searchParams.get("tab");

	// Map URL tab query param to TabType, default to "company-information"
	const activeTab: TabType =
		tabParam === "holidays"
			? "holidays"
			: tabParam === "case-types"
			? "case-types"
			: tabParam === "shifts"
			? "shifts"
			: "company-information";

	// Track unsaved changes
	const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
	const [isUploading, setIsUploading] = useState(false);

	// Modal states
	const [showSaveModal, setShowSaveModal] = useState(false);
	const [showDiscardModal, setShowDiscardModal] = useState(false);
	const [pendingTab, setPendingTab] = useState<TabType | null>(null);

	// Underline animation state
	const [underlineStyle, setUnderlineStyle] = useState<{
		left: number;
		width: number;
	}>({ left: 0, width: 0 });
	const tabRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

	// Set default tab query param if not specified
	useEffect(() => {
		if (!tabParam) {
			setSearchParams({ tab: "company-information" }, { replace: true });
		}
	}, [tabParam, setSearchParams]);

	const canViewCompanyInfo = can("read_office_info") || can("manage_office_info");
	const canEditCompanyInfo = can("manage_office_info");
	const canViewCaseTypes = can("read_legal_case_type") || can("create_legal_case_type");
	const canViewHolidays = can("read_holidays") || can("manage_holidays");
	const canViewShifts = can("shift.view") || can("shift.manage") || can("shift.assign");

	useEffect(() => {
		const allowedTabs: TabType[] = [];
		if (canViewCompanyInfo) allowedTabs.push("company-information");
		if (canViewCaseTypes) allowedTabs.push("case-types");
		if (canViewHolidays) allowedTabs.push("holidays");
		if (canViewShifts) allowedTabs.push("shifts");

		if (!allowedTabs.includes(activeTab)) {
			const fallback = allowedTabs[0];
			if (fallback) {
				setSearchParams({ tab: fallback }, { replace: true });
			}
		}
	}, [activeTab, canViewCompanyInfo, canViewCaseTypes, canViewHolidays, canViewShifts, setSearchParams]);

	// Update underline position when active tab changes
	useEffect(() => {
		const updateUnderline = () => {
			const activeTabElement = tabRefs.current[activeTab];
			if (activeTabElement) {
				const { offsetLeft, offsetWidth } = activeTabElement;
				setUnderlineStyle({
					left: offsetLeft,
					width: offsetWidth,
				});
			}
		};

		updateUnderline();
		window.addEventListener("resize", updateUnderline);
		return () => window.removeEventListener("resize", updateUnderline);
	}, [activeTab]);

	// Check upload status from window global
	useEffect(() => {
		const checkUploadStatus = () => {
			const uploading =
				(window as CompanyFormWindow).__companyFormIsUploading || false;
			setIsUploading(uploading);
		};

		// Check periodically
		const interval = setInterval(checkUploadStatus, 100);
		return () => clearInterval(interval);
	}, []);

	const handleTabSwitch = (tab: TabType) => {
		if (activeTab === "company-information" && hasUnsavedChanges) {
			// Show discard modal if there are unsaved changes
			setPendingTab(tab);
			setShowDiscardModal(true);
		} else {
			// Switch tab directly if no unsaved changes
			setSearchParams({ tab }, { replace: false });
		}
	};

	const handleConfirmDiscard = () => {
		// Discard changes and switch to pending tab
		if ((window as CompanyFormWindow).__companyFormCancel) {
			(window as CompanyFormWindow).__companyFormCancel();
		}
		setHasUnsavedChanges(false);
		setShowDiscardModal(false);
		if (pendingTab) {
			setSearchParams({ tab: pendingTab }, { replace: false });
			setPendingTab(null);
		}
	};

	const handleCancelDiscard = () => {
		setShowDiscardModal(false);
		setPendingTab(null);
	};

	const handleSave = () => {
		if (activeTab === "company-information") {
			// Check if logo is uploading
			const isUploading = (window as CompanyFormWindow).__companyFormIsUploading;
			if (isUploading) {
				// Don't allow save while uploading
				return;
			}
			setShowSaveModal(true);
		}
	};

	const handleConfirmSave = () => {
		// Trigger save in CompanyInformationForm via window global
		if ((window as CompanyFormWindow).__companyFormSave) {
			(window as CompanyFormWindow).__companyFormSave();
		}
		setShowSaveModal(false);
		setHasUnsavedChanges(false);
	};

	const handleCancel = () => {
		if (activeTab === "company-information") {
			if (hasUnsavedChanges) {
				setShowDiscardModal(true);
			} else {
				// No changes to discard
				if ((window as CompanyFormWindow).__companyFormCancel) {
					(window as CompanyFormWindow).__companyFormCancel();
				}
			}
		}
	};

	return (
		<div className='flex flex-col gap-6'>
			{/* Tabs */}
			<div className='relative flex items-center gap-6 border-b border-border'>
				{canViewCompanyInfo && (
					<button
						ref={(el) => (tabRefs.current["company-information"] = el)}
						type='button'
						onClick={() => handleTabSwitch("company-information")}
						className={`flex items-center gap-2 pb-3 px-1 transition-colors ${
							activeTab === "company-information"
								? "text-primary"
								: "text-text-sub"
						}`}>
						<BuildingPen active={activeTab === "company-information"} size={20} />
						<span className='text-sm font-medium'>
							{t("companySettings.tabs.companyInformation")}
						</span>
					</button>
				)}
				{canViewCaseTypes && (
					<button
						ref={(el) => (tabRefs.current["case-types"] = el)}
						type='button'
						onClick={() => handleTabSwitch("case-types")}
						className={`flex items-center gap-2 pb-3 px-1 transition-colors ${
							activeTab === "case-types"
								? "text-primary"
								: "text-text-sub"
						}`}>
						<Tag active={activeTab === "case-types"} size={20} />
						<span className='text-sm font-medium'>
							{t("companySettings.tabs.caseTypes")}
						</span>
					</button>
				)}
				{canViewHolidays && (
					<button
						ref={(el) => (tabRefs.current["holidays"] = el)}
						type='button'
						onClick={() => handleTabSwitch("holidays")}
						className={`flex items-center gap-2 pb-3 px-1 transition-colors ${
							activeTab === "holidays" ? "text-primary" : "text-text-sub"
						}`}>
						<CalendarBars active={activeTab === "holidays"} size={20} />
						<span className='text-sm font-medium'>
							{t("companySettings.tabs.holidays")}
						</span>
					</button>
				)}
				{canViewShifts && (
					<button
						ref={(el) => (tabRefs.current["shifts"] = el)}
						type='button'
						onClick={() => handleTabSwitch("shifts")}
						className={`flex items-center gap-2 pb-3 px-1 transition-colors ${
							activeTab === "shifts" ? "text-primary" : "text-text-sub"
						}`}>
						<ClockTwo active={activeTab === "shifts"} size={20} />
						<span className='text-sm font-medium'>
							{t("companySettings.tabs.shifts")}
						</span>
					</button>
				)}
				{/* Animated Underline */}
				<span
					className='absolute -bottom-px h-0.5 bg-primary transition-all duration-300 ease-in-out'
					style={{
						left: `${underlineStyle.left}px`,
						width: `${underlineStyle.width}px`,
					}}
				/>
			</div>

			{activeTab === "company-information" && canViewCompanyInfo && (
				<CompanySettingsHeader
					onSave={handleSave}
					onCancel={handleCancel}
					isUploading={isUploading}
					hasChanges={hasUnsavedChanges}
					canEdit={canEditCompanyInfo}
				/>
			)}

			{/* Tab Content */}
			<div className='rounded-2xl bg-elevated'>
				<AnimatePresence mode='wait'>
					{activeTab === "company-information" ? (
						<motion.div
							key='company-information'
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -20 }}
							transition={{ duration: 0.3, ease: "easeInOut" }}>
							{!canViewCompanyInfo ? (
								<div className="p-6">
									<NoPermissionMessage
										message={t("permissions.noReadAccess.title", "Access Restricted")}
										description={`${t("permissions.noReadAccess.message", "You don't have permission to view this section.")} (Missing: ${formatPermissionName("read_office_info")})`}
									/>
								</div>
							) : (
								<CompanyInformationForm onDataChange={setHasUnsavedChanges} />
							)}
						</motion.div>
					) : activeTab === "case-types" ? (
						<motion.div
							key='case-types'
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -20 }}
							transition={{ duration: 0.3, ease: "easeInOut" }}>
							{!canViewCaseTypes ? (
								<div className="p-6">
									<NoPermissionMessage
										message={t("permissions.noReadAccess.title", "Access Restricted")}
										description={`${t("permissions.noReadAccess.message", "You don't have permission to view this section.")} (Missing: ${formatPermissionName("read_legal_case_type")})`}
									/>
								</div>
							) : (
								<CaseTypesView />
							)}
						</motion.div>
					) : activeTab === "holidays" ? (
						<motion.div
							key='holidays'
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -20 }}
							transition={{ duration: 0.3, ease: "easeInOut" }}>
							{!canViewHolidays ? (
								<div className="p-6">
									<NoPermissionMessage
										message={t("permissions.noReadAccess.title", "Access Restricted")}
										description={`${t("permissions.noReadAccess.message", "You don't have permission to view this section.")} (Missing: ${formatPermissionName("read_holidays")})`}
									/>
								</div>
							) : (
								<HolidaysView />
							)}
						</motion.div>
					) : activeTab === "shifts" ? (
						<motion.div
							key='shifts'
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -20 }}
							transition={{ duration: 0.3, ease: "easeInOut" }}>
							{!canViewShifts ? (
								<div className="p-6">
									<NoPermissionMessage
										message={t("permissions.noReadAccess.title", "Access Restricted")}
										description={`${t("permissions.noReadAccess.message", "You don't have permission to view this section.")} (Missing: ${formatPermissionName("shift.view")})`}
									/>
								</div>
							) : (
								<ShiftsView />
							)}
						</motion.div>
					) : null}
				</AnimatePresence>
			</div>

			{/* Confirmation Modals */}
			<SaveChangesModal
				isOpen={showSaveModal}
				onClose={() => setShowSaveModal(false)}
				onConfirm={handleConfirmSave}
			/>
			<DiscardChangesModal
				isOpen={showDiscardModal}
				onClose={handleCancelDiscard}
				onConfirm={handleConfirmDiscard}
			/>
		</div>
	);
}

export default CompanySettingsView;
