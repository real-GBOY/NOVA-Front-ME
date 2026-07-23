/** @format */

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslation } from "@/hooks/useTranslation";
import SearchInput from "@/designSystem/SearchInput";
import SortDropdown from "@/designSystem/SortDropdown";
import { Buildings, Folders, ClipboardList, Plus } from "@/Icons";
import DepartmentsTab from "./tabs/departments";
import CategoriesTab from "./tabs/categories";
import ServicesTab from "./tabs/services/ServicesTab";
import AddDepartmentModal from "./modals/AddDepartmentModal";
import AddCategoryModal from "./modals/AddCategoryModal";
import AddServiceModal from "./modals/AddServiceModal";
import DepartmentsFilterDropdown, {
   DepartmentsFilters,
} from "./tabs/departments/DepartmentsFilterDropdown";
import CategoriesFilterDropdown, {
   CategoriesFilters,
} from "./tabs/categories/CategoriesFilterDropdown";
import ServicesFilterDropdown, {
   ServicesFilters,
} from "./tabs/services/ServicesFilterDropdown";
import type { Department } from "@/services/departmentService";
import type { Category } from "@/services/categoryService";
import type { Service } from "@/services/serviceService";
import { usePermissions } from "@/contexts/PermissionContext";
import NoPermissionMessage from "@/components/common/NoPermissionMessage";
import { formatPermissionName } from "@/utilities/permissionFormatters";
import { useDebounce } from "@/hooks/useDebounce";

type TabType = "departments" | "categories" | "services";

function ServiceCatalog() {
   const { t } = useTranslation("settings");
   const { can } = usePermissions();
   const [searchParams, setSearchParams] = useSearchParams();
   const tabParam = searchParams.get("tab");

   // Map URL tab query param to TabType, default to "departments"
   const activeTab: TabType =
      tabParam === "categories"
         ? "categories"
         : tabParam === "services"
           ? "services"
           : "departments";

   // Underline animation state
   const [underlineStyle, setUnderlineStyle] = useState<{
      left: number;
      width: number;
   }>({ left: 0, width: 0 });
   const tabRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});
   const tabsContainerRef = useRef<HTMLDivElement | null>(null);

   // Set default tab query param if not specified
   useEffect(() => {
      if (!tabParam) {
         setSearchParams({ tab: "departments" }, { replace: true });
      }
   }, [tabParam, setSearchParams]);

   const canViewDepartments = can("view_departments");
   const canCreateDepartment = can("create_department");
   const canUpdateDepartment = can("update_department");
   const canViewCategories = can("view_categories");
   const canCreateCategory = can("create_category");
   const canUpdateCategory = can("update_category");
   const canViewServices = can("view_services");
   const canCreateService = can("create_service");
   const canUpdateService = can("update_service");

   useEffect(() => {
      const allowedTabs: TabType[] = [];
      if (canViewDepartments) allowedTabs.push("departments");
      if (canViewCategories) allowedTabs.push("categories");
      if (canViewServices) allowedTabs.push("services");

      if (!allowedTabs.includes(activeTab)) {
         const fallback = allowedTabs[0];
         if (fallback) {
            setSearchParams({ tab: fallback }, { replace: true });
         }
      }
   }, [
      activeTab,
      canViewDepartments,
      canViewCategories,
      canViewServices,
      setSearchParams,
   ]);

   // Update underline position when active tab changes
   useEffect(() => {
      const updateUnderline = () => {
         const activeTabElement = tabRefs.current[activeTab];
         const container = tabsContainerRef.current;
         if (activeTabElement && container) {
            const tabRect = activeTabElement.getBoundingClientRect();
            const containerRect = container.getBoundingClientRect();
            setUnderlineStyle({
               left: tabRect.left - containerRect.left + container.scrollLeft,
               width: tabRect.width,
            });
         }
      };

      updateUnderline();
      window.addEventListener("resize", updateUnderline);
      const container = tabsContainerRef.current;
      container?.addEventListener("scroll", updateUnderline);
      return () => {
         window.removeEventListener("resize", updateUnderline);
         container?.removeEventListener("scroll", updateUnderline);
      };
   }, [activeTab]);
   const [searchQuery, setSearchQuery] = useState("");
   const debouncedSearchQuery = useDebounce(searchQuery, 400);
   const [isAddDepartmentModalOpen, setIsAddDepartmentModalOpen] =
      useState(false);
   const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
   const [isAddServiceModalOpen, setIsAddServiceModalOpen] = useState(false);
   const [departmentToEdit, setDepartmentToEdit] = useState<Department | null>(
      null,
   );
   const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);
   const [serviceToEdit, setServiceToEdit] = useState<Service | null>(null);

   // Filter states
   const [departmentsFilters, setDepartmentsFilters] =
      useState<DepartmentsFilters>({
         status: "",
      });
   const [categoriesFilters, setCategoriesFilters] =
      useState<CategoriesFilters>({
         status: "",
      });
   const [servicesFilters, setServicesFilters] = useState<ServicesFilters>({
      status: "",
   });
   const [sortBy, setSortBy] = useState<string>("nameAsc");

   const tabs = [
      {
         id: "departments" as TabType,
         icon: Buildings,
         label: t("serviceCatalog.tabs.departments"),
      },
      {
         id: "categories" as TabType,
         icon: Folders,
         label: t("serviceCatalog.tabs.categories"),
      },
      {
         id: "services" as TabType,
         icon: ClipboardList,
         label: t("serviceCatalog.tabs.services"),
      },
   ].filter((tab) => {
      if (tab.id === "departments") return canViewDepartments;
      if (tab.id === "categories") return canViewCategories;
      if (tab.id === "services") return canViewServices;
      return false;
   });

   return (
      <div className="flex size-full flex-col gap-6">
         {/* Horizontal Tabs */}
         <div
            ref={tabsContainerRef}
            className="relative border-b border-border pb-3.5 overflow-x-auto scrollbar-hide">
            <div className="relative flex w-max flex-nowrap gap-6">
               {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                     <button
                        key={tab.id}
                        ref={(el) => (tabRefs.current[tab.id] = el)}
                        onClick={() =>
                           setSearchParams({ tab: tab.id }, { replace: false })
                        }
                        className={`flex items-center gap-1.5 relative whitespace-nowrap ${
                           isActive ? "text-primary" : "text-text-sub"
                        }`}>
                        <Icon size={20} active={isActive} />
                        <span className="text-sm font-medium leading-5 tracking-[-0.084px]">
                           {tab.label}
                        </span>
                     </button>
                  );
               })}
            </div>
            {/* Animated Underline */}
            <span
               className="absolute bottom-0 h-0.5 bg-primary transition-all duration-300 ease-in-out"
               style={{
                  left: `${underlineStyle.left}px`,
                  width: `${underlineStyle.width}px`,
               }}
            />
         </div>

         {/* Title and Description */}
         <div className="flex flex-col gap-1">
            <h1 className="text-lg font-medium leading-6 tracking-[-0.27px] text-text-strong">
               {t(`serviceCatalog.tabs.${activeTab}`)}
            </h1>
            <p className="text-sm leading-5 tracking-[-0.084px] text-text-sub">
               {t("serviceCatalog.description")}
            </p>
         </div>

         {/* Action Bar */}
         <div className="flex flex-col gap-3 w-full sm:flex-row sm:items-center sm:justify-between">
            <SearchInput
               value={searchQuery}
               onChange={setSearchQuery}
               placeholder={t(`serviceCatalog.searchPlaceholder.${activeTab}`)}
               className="w-full sm:w-[280px]"
            />

            <div className="grid grid-cols-2 gap-2 w-full sm:flex sm:w-auto sm:flex-wrap sm:items-center sm:justify-end">
               {activeTab === "departments" && (
                  <DepartmentsFilterDropdown
                     onApply={setDepartmentsFilters}
                     triggerClassName="w-full"
                  />
               )}
               {activeTab === "categories" && (
                  <CategoriesFilterDropdown
                     onApply={setCategoriesFilters}
                     triggerClassName="w-full"
                  />
               )}
               {activeTab === "services" && (
                  <ServicesFilterDropdown
                     onApply={setServicesFilters}
                     triggerClassName="w-full"
                  />
               )}

               <SortDropdown
                  label={t("serviceCatalog.sortBy")}
                  options={[
                     {
                        id: "nameAsc",
                        label: t("serviceCatalog.sortOptions.nameAsc"),
                     },
                     {
                        id: "nameDesc",
                        label: t("serviceCatalog.sortOptions.nameDesc"),
                     },
                     {
                        id: "newest",
                        label: t("serviceCatalog.sortOptions.newest"),
                     },
                     {
                        id: "oldest",
                        label: t("serviceCatalog.sortOptions.oldest"),
                     },
                  ]}
                  onSelect={(id) => setSortBy(id)}
                  className="w-full sm:w-auto"
               />

               {((activeTab === "departments" && canCreateDepartment) ||
                  (activeTab === "categories" && canCreateCategory) ||
                  (activeTab === "services" && canCreateService)) && (
                  <button
                     className="bg-text-strong text-background flex items-center justify-start gap-1.5 px-3 py-2 rounded-lg hover:bg-bg-dark/90 transition-colors text-xs sm:text-sm font-medium leading-5 tracking-[-0.084px] col-span-2 sm:col-span-1 w-full sm:w-auto"
                     onClick={() => {
                        if (activeTab === "departments") {
                           setDepartmentToEdit(null);
                           setIsAddDepartmentModalOpen(true);
                        }
                        if (activeTab === "categories") {
                           setCategoryToEdit(null);
                           setIsAddCategoryModalOpen(true);
                        }
                        if (activeTab === "services") {
                           setServiceToEdit(null);
                           setIsAddServiceModalOpen(true);
                        }
                     }}>
                     <Plus size={20} className="fill-background" />
                     {t(`serviceCatalog.addButton.${activeTab}`)}
                  </button>
               )}
            </div>
         </div>

         {/* Content based on active tab */}
         <AnimatePresence mode="wait">
            {activeTab === "departments" ? (
               <motion.div
                  key="departments"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}>
                  {!canViewDepartments ? (
                     <div className="p-6">
                        <NoPermissionMessage
                           message={`You don't have permission to view departments. Missing: ${formatPermissionName("view_departments")}`}
                        />
                     </div>
                  ) : (
                     <DepartmentsTab
                        searchQuery={debouncedSearchQuery}
                        filters={departmentsFilters}
                        sortBy={sortBy}
                        onEdit={(dept) => {
                           if (canUpdateDepartment) {
                              setDepartmentToEdit(dept);
                              setIsAddDepartmentModalOpen(true);
                           }
                        }}
                     />
                  )}
               </motion.div>
            ) : activeTab === "categories" ? (
               <motion.div
                  key="categories"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}>
                  {!canViewCategories ? (
                     <div className="p-6">
                        <NoPermissionMessage
                           message={`You don't have permission to view categories. Missing: ${formatPermissionName("view_categories")}`}
                        />
                     </div>
                  ) : (
                     <CategoriesTab
                        searchQuery={debouncedSearchQuery}
                        filters={categoriesFilters}
                        sortBy={sortBy}
                        onEdit={(cat) => {
                           if (canUpdateCategory) {
                              setCategoryToEdit(cat);
                              setIsAddCategoryModalOpen(true);
                           }
                        }}
                     />
                  )}
               </motion.div>
            ) : activeTab === "services" ? (
               <motion.div
                  key="services"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}>
                  {!canViewServices ? (
                     <div className="p-6">
                        <NoPermissionMessage
                           message={`You don't have permission to view services. Missing: ${formatPermissionName("view_services")}`}
                        />
                     </div>
                  ) : (
                     <ServicesTab
                        searchQuery={debouncedSearchQuery}
                        filters={servicesFilters}
                        sortBy={sortBy}
                        onEdit={(svc) => {
                           if (canUpdateService) {
                              setServiceToEdit(svc);
                              setIsAddServiceModalOpen(true);
                           }
                        }}
                     />
                  )}
               </motion.div>
            ) : null}
         </AnimatePresence>

         <AddDepartmentModal
            isOpen={isAddDepartmentModalOpen}
            onClose={() => {
               setIsAddDepartmentModalOpen(false);
               setDepartmentToEdit(null);
            }}
            department={departmentToEdit}
         />
         <AddCategoryModal
            isOpen={isAddCategoryModalOpen}
            onClose={() => {
               setIsAddCategoryModalOpen(false);
               setCategoryToEdit(null);
            }}
            category={categoryToEdit}
         />
         <AddServiceModal
            isOpen={isAddServiceModalOpen}
            onClose={() => {
               setIsAddServiceModalOpen(false);
               setServiceToEdit(null);
            }}
            service={serviceToEdit}
         />
      </div>
   );
}

export default ServiceCatalog;
