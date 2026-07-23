/** @format */

import { useEffect, useRef, useState } from "react";
import { TabItem } from "./types";
import {
	UserSimpleAlt,
	WalletUser,
	ClockTwo,
	Files,
	LaptopMobile,
	IdCardClipText,
	SackDollar,
} from "@/Icons";

const tabIcons = {
	profile: UserSimpleAlt,
	contract: WalletUser,
	time: ClockTwo,
	documents: Files,
	assets: LaptopMobile,
	residency: IdCardClipText,
	payroll: SackDollar,
};

interface ProfileTabsProps {
	tabs: TabItem[];
	activeTabId: string;
	onTabChange: (tabId: string) => void;
}

function ProfileTabs({ tabs, activeTabId, onTabChange }: ProfileTabsProps) {
	const [underlineStyle, setUnderlineStyle] = useState<{
		left: number;
		width: number;
	}>({ left: 0, width: 0 });

	const tabRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

	useEffect(() => {
		const updateUnderline = () => {
			const activeTabElement = tabRefs.current[activeTabId];
			if (activeTabElement) {
				const { offsetLeft, offsetWidth } = activeTabElement;
				const activeTabIndex = tabs.findIndex((tab) => tab.id === activeTabId);
				const isFirst = activeTabIndex === 0;
				const leftPadding = isFirst ? 0 : 12; // 0 for first tab, 12px for others (px-3)
				const rightPadding = 12; // 12px for right padding (px-3)

				setUnderlineStyle({
					left: offsetLeft + leftPadding,
					width: offsetWidth - leftPadding - rightPadding,
				});
			}
		};

		updateUnderline();
		window.addEventListener("resize", updateUnderline);
		return () => window.removeEventListener("resize", updateUnderline);
	}, [activeTabId, tabs]);

	return (
		<nav className='relative flex flex-nowrap gap-2 overflow-x-auto border-b border-border bg-background sm:gap-3 xl:flex-wrap xl:gap-4'>
			{tabs.map((tab, index) => {
				const IconComponent = tabIcons[tab.id as keyof typeof tabIcons];
				const isActive = tab.id === activeTabId;
				const isFirst = index === 0;

				return (
					<button
						key={tab.id}
						ref={(el) => (tabRefs.current[tab.id] = el)}
						type='button'
						className={`relative flex items-center gap-1.5 whitespace-nowrap text-xs sm:text-sm ${
							isFirst
								? "pl-0 pr-2 sm:pr-3 xl:pl-0 xl:pr-3"
								: "px-2 sm:px-3 xl:px-3"
						} py-1.5 sm:py-2 xl:py-2 font-medium transition-colors duration-200 ${
							isActive
								? "text-text-strong"
								: "text-text-sub hover:text-text-strong"
						}`}
						onClick={() => onTabChange(tab.id)}>
						{IconComponent && (
							<IconComponent
								size={18}
								active={isActive}
								className={isActive ? "fill-primary" : "fill-icon-sub"}
							/>
						)}
						<div className='flex items-center gap-1'>
							<span>{tab.label}</span>
							{typeof tab.count === "number" ? (
								<span className='rounded-full bg-bg-weak px-1 py-0.5 text-xs font-medium text-faded'>
									{tab.count}
								</span>
							) : null}
						</div>
					</button>
				);
			})}
			<span
				className='pointer-events-none absolute bottom-0 h-[3px] bg-primary transition-all duration-300 ease-in-out z-20'
				style={{
					left: `${underlineStyle.left}px`,
					width: `${underlineStyle.width}px`,
				}}
			/>
		</nav>
	);
}

export default ProfileTabs;
