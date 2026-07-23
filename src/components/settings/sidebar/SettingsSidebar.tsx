/** @format */

import { useMemo, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { SidebarHeader, SidebarContent } from "@/designSystem/Sidebar";
import { ArrowLeftSLine } from "@/Icons";
import { useTranslation } from "@/hooks/useTranslation";
import { getSettingsSidebarGroups } from "./constants";
import { getTabToRouteMap, getRouteToTabMap } from "./routeMapping";
import { usePermissions } from "@/contexts/PermissionContext";

type SettingsSidebarProps = {
	className?: string;
	onNavigate?: () => void;
};

function SettingsSidebar({ className = "", onNavigate }: SettingsSidebarProps) {
	const navigate = useNavigate();
	const location = useLocation();
	const { t } = useTranslation("settings");
	const [activeTab, setActiveTab] = useState<string>("");
	const { can } = usePermissions();

	// Get sidebar groups with translations, filtered by permissions
	const settingsSidebarGroups = useMemo(
		() => getSettingsSidebarGroups(t, can),
		[t, can]
	);

	// Get route mappings
	const routeToTabMap = useMemo(() => getRouteToTabMap(t), [t]);
	const tabToRouteMap = useMemo(() => getTabToRouteMap(t), [t]);

	// Sync activeTab with current route
	useEffect(() => {
		const path = location.pathname;
		// Extract the route path after /settings/
		const match = path.match(/^\/settings\/(.+)$/);
		const routePath = match ? match[1] : null;

		if (routePath) {
			const tabTitle = routeToTabMap[routePath];
			if (tabTitle) {
				setActiveTab(tabTitle);
			}
		} else if (path === "/settings") {
			// Default to first tab if no route specified
			const defaultTab = settingsSidebarGroups[0]?.tabs[0]?.title || "";
			if (defaultTab) {
				setActiveTab(defaultTab);
				const defaultRoute = tabToRouteMap[defaultTab];
				if (defaultRoute) {
					navigate(`/settings/${defaultRoute}`, { replace: true });
				}
			}
		}
	}, [
		location.pathname,
		routeToTabMap,
		tabToRouteMap,
		settingsSidebarGroups,
		navigate,
	]);

	const handleBackClick = () => {
		const targetRoute = can("dashboard.view")
			? "/dashboard"
			: "/dashboard/messages";
		navigate(targetRoute);
		onNavigate?.();
	};

	const handleTabClick = (tab: string) => {
		setActiveTab(tab);
		const route = tabToRouteMap[tab];
		if (route) {
			navigate(`/settings/${route}`);
			onNavigate?.();
		}
	};

	return (
		<div className={`p-2 h-full ${className}`.trim()}>
			<div className='h-full rounded-2xl bg-bg-weak border border-border flex flex-col'>
				<SidebarHeader
					icon={ArrowLeftSLine}
					title={t("sidebar.title")}
					subtitle={t("sidebar.subtitle")}
					onIconClick={handleBackClick}
					onClose={onNavigate}
				/>
				<SidebarContent
					groups={settingsSidebarGroups}
					activeTab={activeTab}
					onTabClick={handleTabClick}
				/>
			</div>
		</div>
	);
}
export default SettingsSidebar;
