/** @format */

import React, { useRef, useEffect, useState } from "react";

type DocumentationTab = {
	id: string;
	label: string;
	icon?: React.ComponentType<{ active?: boolean; size?: number }>;
};

type DocumentationTabsProps = {
	tabs: DocumentationTab[];
	activeTab: string;
	onTabChange: (tab: string) => void;
};

function DocumentationTabs({
	tabs,
	activeTab,
	onTabChange,
}: DocumentationTabsProps) {
	const [underlineStyle, setUnderlineStyle] = useState<{
		left: number;
		width: number;
	}>({ left: 0, width: 0 });
	const tabRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});
	const containerRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		const updateUnderline = () => {
			const activeTabElement = tabRefs.current[activeTab];
			const container = containerRef.current;
			if (activeTabElement && container) {
				const tabRect = activeTabElement.getBoundingClientRect();
				const containerRect = container.getBoundingClientRect();
				const activeTabIndex = tabs.findIndex((tab) => tab.id === activeTab);
				const isFirst = activeTabIndex === 0;
				const leftPadding = isFirst ? 0 : 12;
				const rightPadding = 12;
				setUnderlineStyle({
					left:
						tabRect.left -
						containerRect.left +
						container.scrollLeft +
						leftPadding,
					width: tabRect.width - leftPadding - rightPadding,
				});
			}
		};

		updateUnderline();
		window.addEventListener("resize", updateUnderline);
		const container = containerRef.current;
		container?.addEventListener("scroll", updateUnderline);
		return () => {
			window.removeEventListener("resize", updateUnderline);
			container?.removeEventListener("scroll", updateUnderline);
		};
	}, [activeTab, tabs]);

	return (
		<div className='relative border-b border-border overflow-x-auto scrollbar-hide'>
			<div
				ref={containerRef}
				className='relative flex w-max flex-nowrap'>
				{tabs.map((tab, index) => {
					const isActive = tab.id === activeTab;
					const isFirst = index === 0;
					return (
						<button
							key={tab.id}
							ref={(el) => (tabRefs.current[tab.id] = el)}
							type='button'
							onClick={() => onTabChange(tab.id)}
							className={`relative flex items-center gap-2 whitespace-nowrap ${
								isFirst ? "pl-0 pr-3" : "px-3"
							} pb-2 pt-2 text-sm transition-colors duration-200 ${
								isActive
									? "text-text-strong"
									: "text-text-sub hover:text-text-strong"
							}`}>
							{tab.icon && <tab.icon active={isActive} size={16} />}
							{tab.label}
						</button>
					);
				})}
				<span
					className='absolute -bottom-px h-0.5 bg-primary transition-all duration-300 ease-in-out'
					style={{
						left: `${underlineStyle.left}px`,
						width: `${underlineStyle.width}px`,
					}}
				/>
			</div>
		</div>
	);
}

export default DocumentationTabs;

