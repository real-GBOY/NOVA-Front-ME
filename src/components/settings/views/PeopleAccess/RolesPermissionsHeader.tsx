/** @format */

import { useState, useEffect } from "react";
import { Search2Line, DiagramCells, GridSquare } from "@/Icons";
import AddButton from "@/designSystem/AddButton";
import { useTranslation } from "@/hooks/useTranslation";
import { PermissionGate } from "@/utilities/secure/PermissionGate";
import { useDebounce } from "@/hooks/useDebounce";

type ViewType = "table" | "grid";

type RolesPermissionsHeaderProps = {
   onAddRole?: () => void;
   onSearch?: (query: string) => void;
   onViewTypeChange?: (viewType: ViewType) => void;
   viewType?: ViewType;
   searchPlaceholder?: string;
   title?: string;
   description?: string;
   addButtonText?: string;
   filterComponent?: React.ReactNode;
   /** Permission required to show the Add button */
   addButtonPermission?: string;
};

function RolesPermissionsHeader({
   onAddRole,
   onSearch,
   onViewTypeChange,
   viewType = "table",
   searchPlaceholder,
   title,
   description,
   addButtonText,
   filterComponent,
   addButtonPermission,
}: RolesPermissionsHeaderProps) {
   const { t } = useTranslation("settings");
   const [searchQuery, setSearchQuery] = useState("");
   const debouncedSearchQuery = useDebounce(searchQuery, 400);

   const defaultSearchPlaceholder =
      searchPlaceholder ?? t("rolesPermissions.searchPlaceholder");
   const defaultTitle = title ?? t("rolesPermissions.title");
   const defaultDescription = description ?? t("rolesPermissions.description");
   const defaultAddButtonText = addButtonText ?? t("rolesPermissions.addRole");

   useEffect(() => {
      onSearch?.(debouncedSearchQuery);
   }, [debouncedSearchQuery, onSearch]);

   const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const query = e.target.value;
      setSearchQuery(query);
   };

   const handleViewTypeChange = (type: ViewType) => {
      onViewTypeChange?.(type);
   };

   const addButton = (
      <AddButton onClick={onAddRole} text={defaultAddButtonText} />
   );

   return (
      <div className="flex flex-col gap-3 w-full md:flex-row md:items-start md:justify-between">
         {/* Left Side - Title and Description */}
         <div className="space-y-1 min-w-0">
            <h2 className="text-lg font-medium text-text-strong">
               {defaultTitle}
            </h2>
            <p className="text-sm font-normal text-text-soft">
               {defaultDescription}
            </p>
         </div>

         {/* Right Side - Search, Filter, View Toggles, and Add Button */}
         <div className="flex flex-wrap items-center gap-2 w-full md:w-auto md:justify-end">
            {/* Search Input */}
            <div className="flex items-center gap-2 px-2.5 py-2 border border-border rounded-lg shadow-subtle w-full sm:w-[202px]">
               <div className="">
                  <Search2Line size={20} />
               </div>
               <input
                  type="text"
                  placeholder={defaultSearchPlaceholder}
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className=" bg-transparent text-sm font-normal text-text-strong placeholder-text-soft outline-none"
               />
            </div>

            {/* Filter Component (if provided) */}
            {filterComponent}

            {/* Divider */}
            <div className="w-px h-6 bg-border hidden sm:block" />

            {/* View Type Buttons */}
            <div className="flex items-center gap-2">
               {/* Table View Button */}
               <button
                  onClick={() => handleViewTypeChange("table")}
                  className={`p-2 rounded-lg border transition-colors ${
                     viewType === "table"
                        ? "bg-primary/10 border-primary/20"
                        : "bg-background border-border hover:bg-bg-weak"
                  }`}
                  aria-label={t("peopleAccess.tableView")}>
                  <DiagramCells size={20} active={viewType === "table"} />
               </button>

               {/* Grid View Button */}
               <button
                  onClick={() => handleViewTypeChange("grid")}
                  className={`p-2 rounded-lg border transition-colors ${
                     viewType === "grid"
                        ? "bg-primary/10 border-primary/20"
                        : "bg-background border-border hover:bg-bg-weak"
                  }`}
                  aria-label={t("peopleAccess.gridView")}>
                  <GridSquare size={20} active={viewType === "grid"} />
               </button>
            </div>

            {/* Divider */}
            <div className="w-px h-6 bg-border hidden sm:block" />

            {/* Add Button - conditionally wrapped with PermissionGate */}
            {addButtonPermission ? (
               <PermissionGate permission={addButtonPermission}>
                  {addButton}
               </PermissionGate>
            ) : (
               addButton
            )}
         </div>
      </div>
   );
}

export default RolesPermissionsHeader;
