/** @format */

import { useEffect, useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "@/hooks/useTranslation";
import { useGetEmployeeDetails } from "@/hooks/employees/employee.queries";
import { usePermissions } from "@/contexts/PermissionContext";
import { getCurrentUserId } from "@/utils/auth";
import { useTotalUnread } from "@/hooks/chat/useChatRooms";
import { useBreakTimer } from "@/hooks/break/useBreakTimer";
import {
   Sidebar,
   SidebarHeader,
   SidebarContent,
   SidebarFooter,
} from "@/designSystem/Sidebar";
import { SidebarGroupType } from "@/designSystem/Sidebar/types";
import { getMainSidebarGroups, SYNERGY_LOGO, AVATAR_SRC } from "./constants";

type MainSidebarProps = {
   className?: string;
   onNavigate?: () => void;
};

function MainSidebar({ className = "", onNavigate }: MainSidebarProps) {
   const navigate = useNavigate();
   const location = useLocation();
   const { t } = useTranslation("common");
   const [activeTab, setActiveTab] = useState<string>(t("nav.members"));

   // Get current user ID from token
   const currentUserId = getCurrentUserId();

   // Fetch current user details
   const { data: currentUserDetails } = useGetEmployeeDetails(
      currentUserId ?? 0,
      { enabled: !!currentUserId }
   );
   const logoSrc = SYNERGY_LOGO;

   // Derive user info from employee details
   const userName = currentUserDetails
      ? `${currentUserDetails.personal.first_name} ${currentUserDetails.personal.last_name}`
      : t("user.mohabMarwan");

   const userRole = currentUserDetails?.job?.role?.name || t("user.hrManager");

   const userAvatar =
      currentUserDetails?.personal?.profile_picture_url || AVATAR_SRC;

   // Get permission checking function
   const { canAny } = usePermissions();
   const { isOnBreak, formattedElapsed } = useBreakTimer();

   // Check for unread messages using total unread count API
   const { data: totalUnread } = useTotalUnread();
   const hasSegmentedTotals = Boolean(
      totalUnread &&
         (typeof totalUnread.total_unread_direct === "number" ||
            typeof totalUnread.total_unread_group === "number" ||
            typeof totalUnread.total_unread_ticket_support === "number")
   );
   const communicationUnread = hasSegmentedTotals
      ? (totalUnread?.total_unread_direct ?? 0) +
        (totalUnread?.total_unread_group ?? 0)
      : totalUnread?.total_unread ?? 0;
   const supportUnread = hasSegmentedTotals
      ? totalUnread?.total_unread_ticket_support ?? 0
      : 0;
   const hasUnreadMessages = communicationUnread > 0;
   const hasUnreadSupport = supportUnread > 0;

   // Get sidebar groups with translations and filter by permissions
   // Only show tabs where user has at least one required permission
   const mainSidebarGroups = useMemo(() => {
      const allGroups = getMainSidebarGroups(t);
      const dashboardTitle = t("nav.dashboard");
      const communicationTitle = t("nav.communication");
      const supportTitle = t("nav.helpSupport");

      // Filter tabs within each group based on permissions and add badges
      const filteredGroups: SidebarGroupType[] = allGroups
         .map((group) => ({
            ...group,
            tabs: group.tabs
               .filter((tab) => {
                  // If no permissions required, always show the tab
                  if (
                     !tab.requiredPermissions ||
                     tab.requiredPermissions.length === 0
                  ) {
                     return true;
                  }
                  // Show tab only if user has at least one of the required permissions
                  return canAny(tab.requiredPermissions);
               })
               .map((tab) => ({
                  ...tab,
                  // Add badge for communication tab when there are unread messages
                  showBadge:
                     (tab.title === dashboardTitle && isOnBreak) ||
                     (tab.title === communicationTitle && hasUnreadMessages) ||
                     (tab.title === supportTitle && hasUnreadSupport),
                  badgeLabel:
                     tab.title === dashboardTitle && isOnBreak
                        ? formattedElapsed
                        : undefined,
                  badgeColorClassName:
                     tab.title === dashboardTitle && isOnBreak
                        ? "bg-danger"
                        : undefined,
               })),
         }))
         // Remove empty groups (groups with no visible tabs)
         .filter((group) => group.tabs.length > 0);

      return filteredGroups;
   }, [
      t,
      canAny,
      formattedElapsed,
      hasUnreadMessages,
      hasUnreadSupport,
      isOnBreak,
   ]);

   // Map sidebar titles to routes
   const titleToRoute = useMemo(
      () => ({
         [t("nav.dashboard")]: "/dashboard",
         [t("nav.members")]: "/dashboard/members",
         [t("nav.contracts")]: "/dashboard/contracts",
         [t("nav.requests")]: "/dashboard/requests",
         [t("nav.reports")]: "/dashboard/reports",
         [t("nav.vouchers")]: "/dashboard/vouchers",
         [t("nav.legalCases")]: "/dashboard/legal-cases",
         [t("nav.loansAdvances")]: "/dashboard/loans-advances",
         [t("nav.payrolls")]: "/dashboard/payrolls",
         [t("nav.communication")]: "/dashboard/messages",
         [t("nav.helpSupport")]: "/dashboard/help-support",
         [t("nav.termsAndConditions")]: "/dashboard/terms-and-conditions",
      }),
      [t]
   );

   // Map routes to sidebar titles
   const routeToTitle = useMemo(
      () => ({
         "/dashboard": t("nav.dashboard"),
         "/dashboard/members": t("nav.members"),
         "/dashboard/contracts": t("nav.contracts"),
         "/dashboard/requests": t("nav.requests"),
         "/dashboard/reports": t("nav.reports"),
         "/dashboard/vouchers": t("nav.vouchers"),
         "/dashboard/legal-cases": t("nav.legalCases"),
         "/dashboard/loans-advances": t("nav.loansAdvances"),
         "/dashboard/payrolls": t("nav.payrolls"),
         "/dashboard/messages": t("nav.communication"),
         "/dashboard/help-support": t("nav.helpSupport"),
         "/dashboard/terms-and-conditions": t("nav.termsAndConditions"),
      }),
      [t]
   );

   // Sync activeTab with current route
   useEffect(() => {
      const path = location.pathname;
      // Check if we're on a members profile page
      if (path.startsWith("/dashboard/members/profile")) {
         setActiveTab(t("nav.members"));
         return;
      }
      // Check if we're on settings
      if (path.startsWith("/settings")) {
         // Keep current active tab for settings
         return;
      }
      // Map route to title
      const title =
         routeToTitle[path as keyof typeof routeToTitle] ||
         routeToTitle["/dashboard/members"] ||
         t("nav.members");
      setActiveTab(title);
   }, [location.pathname, routeToTitle, t]);

   const handleTabClick = (tab: string) => {
      setActiveTab(tab);
      const route = titleToRoute[tab];
      if (route) {
         navigate(route);
         onNavigate?.();
      }
   };

   return (
      <Sidebar
         className={`bg-bg-weak h-full flex flex-col ${className}`.trim()}>
         <SidebarHeader
            imageSrc={logoSrc}
            title="MGMT"
            imageAlt={t("app.hrms")}
            onClose={onNavigate}
         />
         <SidebarContent
            groups={mainSidebarGroups}
            activeTab={activeTab}
            onTabClick={handleTabClick}
         />
         <div className="mt-auto">
            <SidebarFooter
               avatarSrc={userAvatar}
               name={userName}
               role={userRole}
               onClick={() => {
                  navigate(`/dashboard/members/profile/${currentUserId || ""}`);
                  onNavigate?.();
               }}
            />
            <div className="px-4 py-2 border-t border-border">
               <p className="text-xs text-text-soft text-center">
                  © {new Date().getFullYear()} DigitMask
               </p>
            </div>
         </div>
      </Sidebar>
   );
}

export default MainSidebar;
