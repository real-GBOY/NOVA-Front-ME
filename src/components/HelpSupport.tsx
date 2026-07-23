/** @format */

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueries } from "@tanstack/react-query";
import type { PaginationState, Updater } from "@tanstack/react-table";
import { useDebounce } from "@/hooks/useDebounce";

import { useTranslation } from "@/hooks/useTranslation";
import { useTickets } from "@/hooks/support/useTickets";
import HelpSupportToolbar from "@/components/help-support/HelpSupportToolbar";
import HelpSupportTable from "@/components/help-support/HelpSupportTable";
import AddTicketModal from "@/components/help-support/AddTicketModal";
import TicketDetailsModal from "@/components/help-support/TicketDetailsModal";
import type { SortOption } from "@/designSystem/SortDropdown";
import type { Ticket } from "@/components/help-support/types";
import type { TicketFilters } from "@/components/help-support/HelpSupportFilterDropdown";
import { usePermissions } from "@/contexts/PermissionContext";
import NoPermissionMessage from "@/components/common/NoPermissionMessage";
import { formatPermissionName } from "@/utilities/permissionFormatters";
import { getCurrentUserId } from "@/utils/auth";
import { supportTicketStore } from "@/services/supportTicketStore";
import { reactQueryKeys } from "@/config/reactQueryKeys";
import { ticketService } from "@/services/ticketService";
import { getChatStatusKey } from "@/components/help-support/utils";

function HelpSupport() {
   const MAX_TICKET_LIMIT = 50;
   const { t } = useTranslation("helpSupport");
   const [searchQuery, setSearchQuery] = useState("");
   const debouncedSearchQuery = useDebounce(searchQuery, 400);
   const [filters, setFilters] = useState<TicketFilters>({});
   const [isAddTicketModalOpen, setIsAddTicketModalOpen] = useState(false);
   const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
   const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
   const initialActiveTab = supportTicketStore.getActiveTab();
   const [activeTab, setActiveTab] = useState<"incoming" | "own" | "initiated">(
      initialActiveTab ?? "incoming",
   );
   const [hasStoredTab, setHasStoredTab] = useState(
      () => initialActiveTab !== null,
   );
   const [initiatedTicketIds, setInitiatedTicketIds] = useState<number[]>(() =>
      supportTicketStore.getInitiatedTicketIds(),
   );
   const [sortBy, setSortBy] = useState<"submitted_at" | "status" | "priority">(
      "submitted_at",
   );
   const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
   const [pagination, setPagination] = useState<PaginationState>({
      pageIndex: 0,
      pageSize: 10,
   });

   const navigate = useNavigate(); // Initialize useNavigate
   const currentUserId = getCurrentUserId();

   // Permission checks
   const { can } = usePermissions();
   const canViewSupport = can("view_support_tickets");
   const canCreateTicket = can("create_support_ticket");
   const canResolveTicket = can("update_support_ticket");
   const canCommentTicket = can("initiate_room_support_ticket");
   const canChatTicket = canViewSupport || canCommentTicket;
   const canViewInitiatedTab = canCommentTicket;
   const apiFilters = useMemo(() => {
      const { chatStatus, dateFrom, dateTo, ...rest } = filters;
      return rest;
   }, [filters]);

   useEffect(() => {
      if (!canViewInitiatedTab) {
         if (activeTab === "initiated") {
            setActiveTab("incoming");
            supportTicketStore.setActiveTab("incoming");
            setHasStoredTab(true);
         }
         return;
      }

      if (hasStoredTab) return;

      supportTicketStore.setActiveTab("initiated");
      setHasStoredTab(true);
      if (activeTab !== "initiated") {
         setActiveTab("initiated");
      }
   }, [activeTab, canViewInitiatedTab, hasStoredTab]);

   useEffect(() => {
      if (activeTab !== "initiated") return;
      if (!canViewInitiatedTab) return;
      setInitiatedTicketIds(supportTicketStore.getInitiatedTicketIds());
   }, [activeTab, canViewInitiatedTab]);

   // Get tickets data from API
   const { useListTickets, useUpdateTicketStatus } = useTickets();
   const {
      data: incomingTicketsResponse,
      isLoading: isIncomingLoading,
      error: incomingError,
   } = useListTickets(
      {
         page: pagination.pageIndex + 1,
         limit: Math.min(pagination.pageSize, MAX_TICKET_LIMIT),
         search: debouncedSearchQuery || undefined,
         sort_by: sortBy,
         sort_order: sortOrder,
         ...apiFilters,
      },
      {
         enabled: canViewSupport,
      },
   );

   const {
      data: ownTicketsResponse,
      isLoading: isOwnLoading,
      error: ownError,
   } = useListTickets(
      {
         page: pagination.pageIndex + 1,
         limit: Math.min(pagination.pageSize, MAX_TICKET_LIMIT),
         search: debouncedSearchQuery || undefined,
         sort_by: sortBy,
         sort_order: sortOrder,
         ...apiFilters,
         requested_by_employee_id: currentUserId || undefined,
      },
      {
         enabled: canViewSupport && !!currentUserId,
      },
   );

   useEffect(() => {
      setPagination((prev) => ({ ...prev, pageIndex: 0 }));
   }, [
      activeTab,
      debouncedSearchQuery,
      filters.status,
      filters.priority,
      filters.category,
      filters.type,
      filters.submitted_from,
      filters.submitted_to,
      filters.chatStatus,
      sortBy,
      sortOrder,
   ]);

   const handlePaginationChange = (updater: Updater<PaginationState>) => {
      setPagination((prev) => {
         const next = typeof updater === "function" ? updater(prev) : updater;
         const normalizedPageSize = Math.min(next.pageSize, MAX_TICKET_LIMIT);

         if (normalizedPageSize !== prev.pageSize) {
            return { pageIndex: 0, pageSize: normalizedPageSize };
         }
         return { ...next, pageSize: normalizedPageSize };
      });
   };

   const initiatedTicketQueries = useQueries({
      queries: initiatedTicketIds.map((ticketId) => ({
         queryKey: reactQueryKeys.support.tickets.detail(ticketId),
         queryFn: () => ticketService.getById(ticketId),
         enabled:
            canViewSupport &&
            canViewInitiatedTab &&
            activeTab === "initiated" &&
            initiatedTicketIds.length > 0,
         refetchOnWindowFocus: false,
      })),
   });

   const initiatedTickets = useMemo(() => {
      if (initiatedTicketIds.length === 0) return [];

      return initiatedTicketIds
         .map((ticketId, index) => initiatedTicketQueries[index]?.data || null)
         .filter((ticket): ticket is Ticket => Boolean(ticket));
   }, [initiatedTicketIds, initiatedTicketQueries]);

   const filteredInitiatedTickets = useMemo(() => {
      if (initiatedTickets.length === 0) return [];

      const statusFilter = Array.isArray(filters.status)
         ? filters.status
         : filters.status
           ? [filters.status]
           : [];
      const priorityFilter = Array.isArray(filters.priority)
         ? filters.priority
         : filters.priority
           ? [filters.priority]
           : [];
      const categoryFilter = Array.isArray(filters.category)
         ? filters.category
         : filters.category
           ? [filters.category]
           : [];
      const typeFilter = Array.isArray(filters.type)
         ? filters.type
         : filters.type
           ? [filters.type]
           : [];

      const submittedFrom = filters.submitted_from
         ? new Date(filters.submitted_from)
         : null;
      const submittedTo = filters.submitted_to
         ? new Date(filters.submitted_to)
         : null;

      if (submittedFrom) {
         submittedFrom.setHours(0, 0, 0, 0);
      }
      if (submittedTo) {
         submittedTo.setHours(23, 59, 59, 999);
      }

      return initiatedTickets.filter((ticket) => {
         if (statusFilter.length > 0 && !statusFilter.includes(ticket.status)) {
            return false;
         }

         if (
            priorityFilter.length > 0 &&
            !priorityFilter.includes(ticket.priority)
         ) {
            return false;
         }

         const categoryValue = ticket.category?.toLowerCase();
         if (
            categoryFilter.length > 0 &&
            (!categoryValue || !categoryFilter.includes(categoryValue))
         ) {
            return false;
         }

         const typeValue = ticket.type?.toLowerCase();
         if (
            typeFilter.length > 0 &&
            (!typeValue || !typeFilter.includes(typeValue))
         ) {
            return false;
         }

         const submittedAt = new Date(ticket.submitted_at);
         if (submittedFrom && submittedAt < submittedFrom) {
            return false;
         }
         if (submittedTo && submittedAt > submittedTo) {
            return false;
         }

         return true;
      });
   }, [filters, initiatedTickets, debouncedSearchQuery]);

   const sortedInitiatedTickets = useMemo(() => {
      if (filteredInitiatedTickets.length === 0) return [];

      const sortMultiplier = sortOrder === "asc" ? 1 : -1;
      return [...filteredInitiatedTickets].sort((a, b) => {
         if (sortBy === "submitted_at") {
            return (
               (new Date(a.submitted_at).getTime() -
                  new Date(b.submitted_at).getTime()) *
               sortMultiplier
            );
         }
         if (sortBy === "status") {
            return a.status.localeCompare(b.status) * sortMultiplier;
         }
         if (sortBy === "priority") {
            return a.priority.localeCompare(b.priority) * sortMultiplier;
         }
         return 0;
      });
   }, [filteredInitiatedTickets, sortBy, sortOrder]);

   const tickets =
      activeTab === "own"
         ? ownTicketsResponse?.data || []
         : activeTab === "initiated"
           ? sortedInitiatedTickets
           : incomingTicketsResponse?.data || [];
   const chatStatusFilters = filters.chatStatus ?? [];
   const filteredTicketsByChatStatus = useMemo(() => {
      if (chatStatusFilters.length === 0) return tickets;
      return tickets.filter((ticket) =>
         chatStatusFilters.includes(getChatStatusKey(ticket)),
      );
   }, [chatStatusFilters, tickets]);
   const activePagination = useMemo(() => {
      if (activeTab === "own") return ownTicketsResponse?.pagination;
      if (activeTab === "incoming") return incomingTicketsResponse?.pagination;
      return undefined;
   }, [activeTab, ownTicketsResponse?.pagination, incomingTicketsResponse?.pagination]);
   const isServerPaginatedTab = activeTab === "incoming" || activeTab === "own";
   const pageCount = isServerPaginatedTab
      ? Math.max(1, activePagination?.total_pages || 1)
      : Math.max(
           1,
           Math.ceil(filteredTicketsByChatStatus.length / (pagination.pageSize || 1)),
        );
   const incomingUnreadCount =
      incomingTicketsResponse?.data?.reduce(
         (total, ticket) => total + (ticket.unread_message_count || 0),
         0,
      ) || 0;
   const ownUnreadCount =
      ownTicketsResponse?.data?.reduce(
         (total, ticket) => total + (ticket.unread_message_count || 0),
         0,
      ) || 0;
   const initiatedUnreadCount = sortedInitiatedTickets.reduce(
      (total, ticket) => total + (ticket.unread_message_count || 0),
      0,
   );
   const updateStatusMutation = useUpdateTicketStatus(); // Get ticket metadata for sort options
   const { useGetTicketMeta } = useTickets();
   const { data: ticketMeta } = useGetTicketMeta();

   const sortOptions: SortOption<string>[] =
      ticketMeta?.sort_options.map((option) => ({
         id: option.value,
         label: option.label,
      })) || [];

   const handleAddTicketClick = () => {
      if (!canCreateTicket) {
         console.error("User doesn't have permission to create tickets");
         return;
      }
      setIsAddTicketModalOpen(true);
   };

   const handleSortChange = (sortId: string) => {
      // Parse the sort value from metadata format (e.g., "submitted_at:desc")
      const [field, order] = sortId.split(":");
      setSortBy(field as "submitted_at" | "status" | "priority");
      setSortOrder((order as "asc" | "desc") || "desc");
   };

   const handleAddTicketSuccess = () => {};

   const handleViewTicketDetails = (ticket: Ticket) => {
      setSelectedTicket(ticket);
      setIsDetailsModalOpen(true);
   };

   const handleMarkAsResolved = async (ticket: Ticket) => {
      if (!canResolveTicket) {
         console.error("User doesn't have permission to resolve tickets");
         return;
      }
      try {
         await updateStatusMutation.mutateAsync({
            id: ticket.ticket_id,
            payload: {
               status: "Resolved",
               resolution_notes: "Marked as resolved from table",
            },
         });
      } catch (error) {
         console.error("Failed to mark ticket as resolved:", error);
      }
   };

   const getChatActionLabel = (ticket: Ticket) => {
      const roomId = ticket.chat_room_id ?? ticket.chat_room?.room_id;
      if (canCommentTicket && !roomId) {
         return t("actions.initiateChat");
      }
      return t("actions.showChat");
   };

   const handleChatClick = (ticket: Ticket) => {
      if (!canChatTicket) {
         console.error("User doesn't have permission to comment on tickets");
         return;
      }
      navigate(`/dashboard/help-support/ticket/${ticket.ticket_id}`);
   };

   const handleTabChange = (tab: "incoming" | "own" | "initiated") => {
      if (tab === "initiated" && !canViewInitiatedTab) return;
      setActiveTab(tab);
      supportTicketStore.setActiveTab(tab);
      setHasStoredTab(true);
   };

   // Show loading state
   const isInitiatedLoading = initiatedTicketQueries.some(
      (query) => query.isLoading,
   );
   const initiatedHasData = initiatedTicketQueries.some((query) => query.data);
   const initiatedError =
      initiatedTicketIds.length > 0 &&
      !initiatedHasData &&
      initiatedTicketQueries.some((query) => query.error);

   const isActiveLoading =
      activeTab === "own"
         ? isOwnLoading
         : activeTab === "initiated"
           ? isInitiatedLoading
           : isIncomingLoading;
   const activeError =
      activeTab === "own"
         ? ownError
         : activeTab === "initiated"
           ? initiatedError
           : incomingError;

   // Show permission denied state
   if (!canViewSupport) {
      return (
         <NoPermissionMessage
            message={`You don't have permission to view this section. Missing: ${formatPermissionName(
               "view_support_tickets",
            )}`}
         />
      );
   }

   // Show error state
   if (activeError) {
      return <p className="text-danger">{t("error")}</p>;
   }

   return (
      <>
         <HelpSupportToolbar
            activeTab={activeTab}
            onTabChange={handleTabChange}
            showInitiatedTab={canViewInitiatedTab}
            showIncomingUnreadBadge={false}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            sortOptions={sortOptions}
            onSortChange={handleSortChange}
            onAddTicketClick={
               activeTab === "own" && canCreateTicket
                  ? handleAddTicketClick
                  : undefined
            }
            ticketMeta={ticketMeta}
            onFiltersApply={setFilters}
            incomingUnreadCount={incomingUnreadCount}
            ownUnreadCount={ownUnreadCount}
            initiatedUnreadCount={initiatedUnreadCount}
         />

         <HelpSupportTable
            data={filteredTicketsByChatStatus}
            isLoading={isActiveLoading}
            onViewDetails={handleViewTicketDetails}
            onMarkAsResolved={
               canResolveTicket ? handleMarkAsResolved : undefined
            }
            onChatClick={canChatTicket ? handleChatClick : undefined}
            getChatActionLabel={getChatActionLabel}
            pagination={pagination}
            onPaginationChange={handlePaginationChange}
            pageCount={pageCount}
            manualPagination={isServerPaginatedTab}
         />

         {canCreateTicket && (
            <AddTicketModal
               isOpen={isAddTicketModalOpen}
               onClose={() => setIsAddTicketModalOpen(false)}
               onSuccess={handleAddTicketSuccess}
            />
         )}

         <TicketDetailsModal
            ticket={selectedTicket}
            isOpen={isDetailsModalOpen}
            onClose={() => setIsDetailsModalOpen(false)}
            canResolve={canResolveTicket}
         />
      </>
   );
}

export default HelpSupport;
