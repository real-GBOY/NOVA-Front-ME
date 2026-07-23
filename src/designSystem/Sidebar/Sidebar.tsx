/** @format */

interface SidebarProps {
   children: React.ReactNode;
   className?: string;
}

function Sidebar({ children, className = "" }: SidebarProps) {
   return (
      <aside
         className={`bg-background border border-border rounded-xl flex flex-col overflow-hidden ${className}`}>
         {children}
      </aside>
   );
}

export default Sidebar;
