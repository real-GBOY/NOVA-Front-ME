/** @format */

import React, { useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import DocumentationTabs from "./DocumentationTabs";
import DocumentationSubTabs from "./DocumentationSubTabs";
import DocumentationContent, {
	type DocumentationContent as DocumentationContentType,
} from "./DocumentationContent";
import { useLanguage } from "@/hooks/useLanguage";

export type DocumentationSubTab = {
	id: string;
	label: string | { en?: string; ar?: string };
	content: DocumentationContentType;
};

export type DocumentationTab = {
	id: string;
	label: string | { en?: string; ar?: string };
	icon?: React.ComponentType<{ active?: boolean; size?: number }>;
	subTabs?: DocumentationSubTab[];
	content?: DocumentationContentType;
};

type DocumentationPageProps = {
	tabs: DocumentationTab[];
	title?: string;
	description?: string;
};

function DocumentationPage({
	tabs,
	title,
	description,
}: DocumentationPageProps) {
	const { language } = useLanguage();
	const [searchParams, setSearchParams] = useSearchParams();
	const tabParam = searchParams.get("tab");
	const subTabParam = searchParams.get("subTab");

	// Helper function to get localized label
	const getLabel = (
		label: string | { en?: string; ar?: string } | undefined
	): string => {
		if (!label) return "";
		if (typeof label === "string") return label;
		return label[language] || label.en || label.ar || "";
	};

	const activeTab = useMemo(() => {
		const tabExists = tabs.some((tab) => tab.id === tabParam);
		return tabExists ? tabParam : tabs[0]?.id || "";
	}, [tabParam, tabs]);

	const currentTab = useMemo(
		() => tabs.find((tab) => tab.id === activeTab),
		[tabs, activeTab]
	);

	const activeSubTab = useMemo(() => {
		if (!currentTab || !currentTab.subTabs || currentTab.subTabs.length === 0) return "";
		// If subTabParam exists and is valid, use it
		if (subTabParam) {
			const subTabExists = currentTab.subTabs.some(
				(subTab) => subTab.id === subTabParam
			);
			if (subTabExists) {
				return subTabParam;
			}
		}
		// Otherwise default to first subtab
		return currentTab.subTabs[0]?.id || "";
	}, [subTabParam, currentTab]);

	const currentSubTab = useMemo(
		() => currentTab?.subTabs?.find((subTab) => subTab.id === activeSubTab),
		[currentTab, activeSubTab]
	);

	useEffect(() => {
		if (!tabs.length) return;
		// Only set default if no valid tab in URL
		if (!tabParam || !tabs.some((tab) => tab.id === tabParam)) {
			const firstTab = tabs[0];
			setSearchParams(
				{
					tab: firstTab.id,
					subTab: firstTab.subTabs?.[0]?.id || "",
				},
				{ replace: true }
			);
		} else {
			// Tab exists in URL, ensure subtab is set if missing and tab has subtabs
			const tab = tabs.find((t) => t.id === tabParam);
			if (tab && tab.subTabs && tab.subTabs.length > 0 && !subTabParam) {
				setSearchParams(
					{
						tab: tabParam,
						subTab: tab.subTabs[0]?.id || "",
					},
					{ replace: true }
				);
			}
		}
	}, [tabParam, subTabParam, setSearchParams, tabs]);

	useEffect(() => {
		if (!currentTab || !currentTab.subTabs || currentTab.subTabs.length === 0) return;
		// Only set default subtab if no valid subtab is in URL
		if (
			!subTabParam ||
			!currentTab.subTabs.some((subTab) => subTab.id === subTabParam)
		) {
			// Don't replace if we're navigating to a specific subtab
			const shouldReplace = !subTabParam;
			setSearchParams(
				{
					tab: activeTab || "",
					subTab: currentTab.subTabs[0]?.id || "",
				},
				{ replace: shouldReplace }
			);
		}
	}, [subTabParam, currentTab, activeTab, setSearchParams]);

	const handleTabChange = (tabId: string) => {
		const tab = tabs.find((t) => t.id === tabId);
		setSearchParams(
			{
				tab: tabId,
				subTab: tab?.subTabs?.[0]?.id || "",
			},
			{ replace: false }
		);
	};

	const handleSubTabChange = (subTabId: string) => {
		setSearchParams(
			{
				tab: activeTab || "",
				subTab: subTabId,
			},
			{ replace: false }
		);
	};

	if (!tabs.length) {
		return (
			<div className='flex items-center justify-center h-full'>
				<p className='text-text-sub'>No documentation available</p>
			</div>
		);
	}

	return (
		<div className='flex size-full flex-col gap-6'>
			{/* Header */}
			{(title || description) && (
				<div className='flex flex-col gap-2'>
					{title && (
						<h1 className='text-2xl font-semibold text-text-strong'>
							{title}
						</h1>
					)}
					{description && (
						<p className='text-sm text-text-sub'>{description}</p>
					)}
				</div>
			)}

			{/* Main Tabs */}
			<DocumentationTabs
				tabs={tabs.map((tab) => ({
					id: tab.id,
					label: getLabel(tab.label),
					icon: tab.icon,
				}))}
				activeTab={activeTab || ""}
				onTabChange={handleTabChange}
			/>

			{/* Content Area */}
			{currentTab && (
				<div className='flex flex-col gap-6 flex-1 overflow-auto'>
					{/* Sub Tabs - Show only if tab has subtabs */}
					{currentTab.subTabs && currentTab.subTabs.length > 0 && (
						<DocumentationSubTabs
							subTabs={currentTab.subTabs.map((subTab) => ({
								id: subTab.id,
								label: getLabel(subTab.label),
							}))}
							activeSubTab={activeSubTab || currentTab.subTabs?.[0]?.id || ""}
							onSubTabChange={handleSubTabChange}
						/>
					)}

					{/* Content - Show from subtab if exists, otherwise from tab content */}
					{(currentSubTab || currentTab.content) && (
						<div className='flex-1 bg-background rounded-lg p-6'>
							<DocumentationContent 
								content={currentSubTab?.content || currentTab.content!} 
							/>
						</div>
					)}
				</div>
			)}
		</div>
	);
}

export default DocumentationPage;

