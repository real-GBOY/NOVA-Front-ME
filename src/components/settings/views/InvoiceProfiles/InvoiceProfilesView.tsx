/** @format */

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslation } from "@/hooks/useTranslation";
import SearchInput from "@/designSystem/SearchInput";
import SortDropdown from "@/designSystem/SortDropdown";
import { Buildings, UsersGroup, Plus } from "@/Icons";
import CustomersTab from "./tabs/CustomersTab";
import AgentsTab from "./tabs/AgentsTab";
import AddCustomerModal from "./modals/AddCustomerModal";
import AddAgentModal from "./modals/AddAgentModal";
import { useCreateCustomer } from "@/hooks/customers/useCustomers";
import { useCreateAgent } from "@/hooks/agents/useAgents";
import StatusFilterDropdown, {
   StatusFilters,
} from "../../shared/StatusFilterDropdown";
import type { CreateCustomerRequest } from "@/services/customerService";
import type { CreateAgentRequest } from "@/services/agentService";
import { usePermissions } from "@/contexts/PermissionContext";
import NoPermissionMessage from "@/components/common/NoPermissionMessage";
import { formatPermissionName } from "@/utilities/permissionFormatters";
import { useDebounce } from "@/hooks/useDebounce";

type TabType = "customers" | "agents";

function InvoiceProfilesView() {
   const { t } = useTranslation("settings");
   const { can } = usePermissions();
   const [searchParams, setSearchParams] = useSearchParams();
   const tabParam = searchParams.get("tab");

   // Map URL tab query param to TabType, default to "customers"
   const activeTab: TabType = tabParam === "agents" ? "agents" : "customers";

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
         setSearchParams({ tab: "customers" }, { replace: true });
      }
   }, [tabParam, setSearchParams]);

   const canViewCustomers = can("view_customers");
   const canCreateCustomer = can("create_customer");
   const canViewAgents = can("view_agents");
   const canCreateAgent = can("create_agent");

   useEffect(() => {
      const allowedTabs: TabType[] = [];
      if (canViewCustomers) allowedTabs.push("customers");
      if (canViewAgents) allowedTabs.push("agents");

      if (!allowedTabs.includes(activeTab)) {
         const fallback = allowedTabs[0];
         if (fallback) {
            setSearchParams({ tab: fallback }, { replace: true });
         }
      }
   }, [activeTab, canViewCustomers, canViewAgents, setSearchParams]);

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
   const [isAddCustomerModalOpen, setIsAddCustomerModalOpen] = useState(false);
   const [isAddAgentModalOpen, setIsAddAgentModalOpen] = useState(false);
   const [customersFilters, setCustomersFilters] = useState<StatusFilters>({
      status: [],
   });
   const [agentsFilters, setAgentsFilters] = useState<StatusFilters>({
      status: [],
   });
   const [sortBy, setSortBy] = useState<string>("name_asc");

   // Create customer mutation
   const createCustomer = useCreateCustomer();

   // Create agent mutation
   const createAgent = useCreateAgent();

   const tabs = [
      {
         id: "customers" as TabType,
         icon: Buildings,
         label: t("invoiceProfiles.tabs.customers"),
      },
      {
         id: "agents" as TabType,
         icon: UsersGroup,
         label: t("invoiceProfiles.tabs.agents"),
      },
   ].filter((tab) => {
      if (tab.id === "customers") return canViewCustomers;
      if (tab.id === "agents") return canViewAgents;
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
               {t(`invoiceProfiles.tabs.${activeTab}`)}
            </h1>
            <p className="text-sm leading-5 tracking-[-0.084px] text-text-sub">
               {t("invoiceProfiles.description")}
            </p>
         </div>

         {/* Action Bar */}
         <div className="flex flex-col gap-3 w-full sm:flex-row sm:items-center sm:justify-between">
            <SearchInput
               value={searchQuery}
               onChange={setSearchQuery}
               placeholder={t(`invoiceProfiles.searchPlaceholder.${activeTab}`)}
               className="w-full sm:w-[280px]"
            />

            <div className="grid grid-cols-2 gap-2 w-full sm:flex sm:w-auto sm:flex-wrap sm:items-center sm:justify-end">
               <StatusFilterDropdown
                  onApply={
                     activeTab === "customers"
                        ? setCustomersFilters
                        : setAgentsFilters
                  }
                  translationNamespace="settings"
                  translationPrefix={`invoiceProfiles.${activeTab}`}
                  triggerClassName="w-full"
               />

               <SortDropdown
                  label={t("invoiceProfiles.sortBy")}
                  options={[
                     {
                        id: "name_asc",
                        label: t("invoiceProfiles.sortOptions.nameAsc"),
                     },
                     {
                        id: "name_desc",
                        label: t("invoiceProfiles.sortOptions.nameDesc"),
                     },
                     {
                        id: "newest",
                        label: t("invoiceProfiles.sortOptions.newest"),
                     },
                     {
                        id: "oldest",
                        label: t("invoiceProfiles.sortOptions.oldest"),
                     },
                  ]}
                  onSelect={(id) => setSortBy(id)}
                  className="w-full sm:w-auto"
               />

               {((activeTab === "customers" && canCreateCustomer) ||
                  (activeTab === "agents" && canCreateAgent)) && (
                  <button
                     className="bg-text-strong text-background flex items-center justify-start gap-1.5 px-3 py-2 rounded-lg hover:bg-bg-dark/90 transition-colors text-xs sm:text-sm font-medium leading-5 tracking-[-0.084px] col-span-2 sm:col-span-1 w-full sm:w-auto"
                     onClick={() => {
                        if (activeTab === "customers") {
                           setIsAddCustomerModalOpen(true);
                        } else {
                           setIsAddAgentModalOpen(true);
                        }
                     }}>
                     <Plus size={20} className="fill-background" />
                     {t(`invoiceProfiles.addButton.${activeTab}`)}
                  </button>
               )}
            </div>
         </div>

         {/* Content based on active tab */}
         <AnimatePresence mode="wait">
            {activeTab === "customers" ? (
               <motion.div
                  key="customers"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}>
                  {!canViewCustomers ? (
                     <div className="p-6">
                        <NoPermissionMessage
                           message={`You don't have permission to view customers. Missing: ${formatPermissionName("view_customers")}`}
                        />
                     </div>
                  ) : (
                     <CustomersTab
                        searchQuery={debouncedSearchQuery}
                        filters={customersFilters}
                        sortBy={sortBy}
                     />
                  )}
               </motion.div>
            ) : activeTab === "agents" ? (
               <motion.div
                  key="agents"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}>
                  {!canViewAgents ? (
                     <div className="p-6">
                        <NoPermissionMessage
                           message={`You don't have permission to view agents. Missing: ${formatPermissionName("view_agents")}`}
                        />
                     </div>
                  ) : (
                     <AgentsTab
                        searchQuery={debouncedSearchQuery}
                        filters={agentsFilters}
                        sortBy={sortBy}
                     />
                  )}
               </motion.div>
            ) : null}
         </AnimatePresence>

         {/* Modals */}
         <AddCustomerModal
            isOpen={isAddCustomerModalOpen}
            onClose={() => setIsAddCustomerModalOpen(false)}
            isLoading={createCustomer.isPending}
            onSuccess={async (customerData) => {
               try {
                  // Transform form data to API format
                  // Handle status: form uses lowercase "active"|"inactive", API expects "Active"|"Inactive"
                  const statusValue = String(
                     customerData.status || "",
                  ).toLowerCase();
                  const payload: CreateCustomerRequest = {
                     customer_name: customerData.name || "",
                     customer_type: customerData.type || "Individual",
                     contact_number: customerData.contactNumber || "",
                     email: customerData.email || "",
                     trn: customerData.trnId || "",
                     status: statusValue === "active" ? "Active" : "Inactive",
                     // Optional fields not in form - can be added later
                     // address: undefined,
                     // notes: undefined,
                     // mobile_no: undefined,
                  };

                  await createCustomer.mutateAsync(payload);
                  setIsAddCustomerModalOpen(false);
               } catch (error) {
                  console.error("Error creating customer:", error);
               }
            }}
         />
         <AddAgentModal
            isOpen={isAddAgentModalOpen}
            onClose={() => setIsAddAgentModalOpen(false)}
            isLoading={createAgent.isPending}
            onSuccess={async (agentData) => {
               try {
                  // Transform form data to API format
                  // Handle status: form uses lowercase "active"|"inactive", API expects "Active"|"Inactive"
                  const statusValue = String(
                     agentData.status || "",
                  ).toLowerCase();

                  const payload: CreateAgentRequest = {
                     name: agentData.name || "",
                     number: (agentData as any).number || "",
                     contact_number: agentData.contactNumber || "",
                     email: agentData.email || "",
                     address: (agentData as any).address || undefined,
                     notes: (agentData as any).notes || undefined,
                     status: statusValue === "active" ? "Active" : "Inactive",
                  };

                  await createAgent.mutateAsync(payload);
                  setIsAddAgentModalOpen(false);
               } catch (error) {
                  console.error("Error creating agent:", error);
               }
            }}
         />
      </div>
   );
}

export default InvoiceProfilesView;
