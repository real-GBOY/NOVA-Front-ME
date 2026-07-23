/** @format */

export type IconProps = {
   active?: boolean;
   size?: number;
};

export type SidebarTab = {
   icon: React.ComponentType<IconProps>;
   title: string;
   disabled?: boolean;
   statusIcon?: React.ComponentType<IconProps>;
   statusTooltip?: string;
   /**
    * Optional array of permission names required to view this tab.
    * If provided, user must have at least ONE of these permissions to see the tab.
    * If not provided, the tab is always visible.
    */
   requiredPermissions?: string[];
   /**
    * Show a red dot badge indicator (e.g., for unread messages)
    */
   showBadge?: boolean;
   /**
    * Optional small badge text shown next to the dot.
    */
   badgeLabel?: string;
   /**
    * Optional color class for the badge dot.
    */
   badgeColorClassName?: string;
};

export type SidebarGroupType = {
   title?: string;
   tabs: SidebarTab[];
};
