/** @format */

import React, { useRef, useEffect, useState } from "react";

type DocumentationSubTab = {
	id: string;
	label: string;
};

type DocumentationSubTabsProps = {
	subTabs: DocumentationSubTab[];
	activeSubTab: string;
	onSubTabChange: (subTab: string) => void;
};

function DocumentationSubTabs({
	subTabs,
	activeSubTab,
	onSubTabChange,
}: DocumentationSubTabsProps) {
	const [underlineStyle, setUnderlineStyle] = useState<{
		left: number;
		width: number;
	}>({ left: 0, width: 0 });
	const subTabRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});
	const containerRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		const updateUnderline = () => {
			const activeSubTabElement = subTabRefs.current[activeSubTab];
			const container = containerRef.current;
			if (activeSubTabElement && container) {
				const subTabRect = activeSubTabElement.getBoundingClientRect();
				const containerRect = container.getBoundingClientRect();
				const activeSubTabIndex = subTabs.findIndex(
					(subTab) => subTab.id === activeSubTab
				);
				const isFirst = activeSubTabIndex === 0;
				const leftPadding = isFirst ? 0 : 8;
				const rightPadding = 8;
				setUnderlineStyle({
					left:
						subTabRect.left -
						containerRect.left +
						container.scrollLeft +
						leftPadding,
					width: subTabRect.width - leftPadding - rightPadding,
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
	}, [activeSubTab, subTabs]);

	return (
		<div className='relative border-b border-border/50 overflow-x-auto scrollbar-hide'>
			<div
				ref={containerRef}
				className='relative flex w-max flex-nowrap'>
				{subTabs.map((subTab, index) => {
					const isActive = subTab.id === activeSubTab;
					const isFirst = index === 0;
					return (
						<button
							key={subTab.id}
							ref={(el) => (subTabRefs.current[subTab.id] = el)}
							type='button'
							onClick={() => onSubTabChange(subTab.id)}
							className={`relative flex items-center gap-1.5 whitespace-nowrap ${
								isFirst ? "pl-0 pr-2" : "px-2"
							} pb-2 pt-2 text-xs transition-colors duration-200 ${
								isActive
									? "text-primary font-medium"
									: "text-text-sub hover:text-text-strong"
							}`}>
							{subTab.label}
						</button>
					);
				})}
				<span
					className='absolute -bottom-px h-[2px] bg-primary transition-all duration-300 ease-in-out'
					style={{
						left: `${underlineStyle.left}px`,
						width: `${underlineStyle.width}px`,
					}}
				/>
			</div>
		</div>
	);
}

export default DocumentationSubTabs;


