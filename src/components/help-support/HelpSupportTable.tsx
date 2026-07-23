/** @format */

import { useState, useRef, useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import type { PaginationState, Updater } from "@tanstack/react-table";
import BadgeTag, { BadgeTagVariant } from "@/designSystem/BadgeTag";
import Dropdown from "@/designSystem/Dropdown";
import { DataTable } from "@/designSystem/ui/data-table";
import { useTranslation } from "@/hooks/useTranslation";
import {
   MoreVertical,
   Hashtag,
   Tag,
   CheckCircle,
   ClipboardList,
   ClipboardText,
   Eye,
   ChatText,
} from "@/Icons";
import MemberTag1 from "@/components/contracts/MemberTag1";
import type { Ticket } from "./types";
import { getChatStatusKey } from "./utils";

interface HelpSupportTableProps {
   data: Ticket[];
   globalFilter?: string;
   isLoading?: boolean;
   onViewDetails?: (ticket: Ticket) => void;
   onMarkAsResolved?: (ticket: Ticket) => void;
   onChatClick?: (ticket: Ticket) => void;
   getChatActionLabel?: (ticket: Ticket) => string;
   pagination?: PaginationState;
   onPaginationChange?: (updater: Updater<PaginationState>) => void;
   pageCount?: number;
   manualPagination?: boolean;
} // Actions Cell Component
function ActionCell({
   ticket,
   onViewDetails,
   onMarkAsResolved,
   onChatClick,
   getChatActionLabel,
}: {
   ticket: Ticket;
   onViewDetails?: (ticket: Ticket) => void;
   onMarkAsResolved?: (ticket: Ticket) => void;
   onChatClick?: (ticket: Ticket) => void;
   getChatActionLabel?: (ticket: Ticket) => string;
}) {
   const { t } = useTranslation("helpSupport");
   const menuButtonRef = useRef<HTMLButtonElement>(null);
   const [isDropdownOpen, setIsDropdownOpen] = useState(false);

   const dropdownItems = [];

   if (onViewDetails) {
      dropdownItems.push({
         id: "view",
         label: t("actions.viewDetails"),
         icon: Eye,
         onClick: () => onViewDetails(ticket),
      });
   }

   if (onChatClick) {
      dropdownItems.push({
         id: "chat",
         label: getChatActionLabel?.(ticket) ?? t("actions.openChat"),
         icon: ChatText,
         onClick: () => onChatClick(ticket),
      });
   }

   if (onMarkAsResolved && ticket.status !== "Resolved") {
      dropdownItems.push({
         id: "resolve",
         label: t("actions.markAsResolved"),
         icon: CheckCircle,
         onClick: () => onMarkAsResolved(ticket),
      });
   }

   if (dropdownItems.length === 0) return null;
   return (
      <div className="relative">
         <button
            ref={menuButtonRef}
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            data-row-menu-trigger
            className={`flex items-center justify-center p-1.5 bg-background rounded-lg shrink-0 transition-colors hover:bg-bg-weak ${
               isDropdownOpen ? "bg-bg-weak" : ""
            }`}>
            <MoreVertical size={20} />
         </button>
         <Dropdown
            items={dropdownItems}
            isOpen={isDropdownOpen}
            onClose={() => setIsDropdownOpen(false)}
            anchorRef={menuButtonRef}
         />
      </div>
   );
}

function HelpSupportTable({
   data,
   globalFilter = "",
   isLoading = false,
   onViewDetails,
   onMarkAsResolved,
   onChatClick,
   getChatActionLabel,
   pagination,
   onPaginationChange,
   pageCount,
   manualPagination = false,
}: HelpSupportTableProps) {
   const { t } = useTranslation("helpSupport");
   const hasActions = Boolean(onViewDetails || onMarkAsResolved || onChatClick);

   const getStatusVariant = (status: Ticket["status"]): BadgeTagVariant => {
      const variantMap: Record<Ticket["status"], BadgeTagVariant> = {
         Resolved: "success",
         In_Progress: "info",
         Open: "warning",
      };
      return variantMap[status] || "default";
   };

   const columns: ColumnDef<Ticket>[] = useMemo(() => {
      const baseColumns: ColumnDef<Ticket>[] = [
         {
            accessorKey: "ticket_code",
            header: () => (
               <div className="flex items-center gap-2">
                  <Hashtag size={16} />
                  <span>{t("table.ticketId")}</span>
               </div>
            ),
            cell: ({ getValue, row }) => {
               const chatStatusKey = getChatStatusKey(row.original);
               const chatStatusVariant: Record<
                  typeof chatStatusKey,
                  BadgeTagVariant
               > = {
                  archived: "error",
                  taken: "success",
                  waiting: "warning",
               };

               return (
                  <div className="flex items-center gap-2 flex-wrap">
                     {onViewDetails ? (
                        <button
                           onClick={() => onViewDetails(row.original)}
                           className="text-sm font-medium text-text-strong hover:text-primary transition-colors text-left">
                           {getValue() as string}
                        </button>
                     ) : (
                        <span className="text-sm font-medium text-text-strong">
                           {getValue() as string}
                        </span>
                     )}
                     <BadgeTag
                        label={t(`table.chatStatus.${chatStatusKey}`)}
                        variant={chatStatusVariant[chatStatusKey]}
                        size="sm"
                     />
                     {chatStatusKey !== "archived" &&
                        row.original.unread_message_count > 0 && (
                        <>
                           {row.original.unread_message_count === 1 ? (
                              <span
                                 className="inline-flex h-2.5 w-2.5 rounded-full bg-primary border-2 border-background"
                                 title="1 unread message"
                              />
                           ) : (
                              <span
                                 className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-semibold text-primary bg-primary/10 border border-primary/20 rounded-full"
                                 title={`${row.original.unread_message_count} unread messages`}>
                                 {row.original.unread_message_count > 99
                                    ? "99+"
                                    : row.original.unread_message_count}
                              </span>
                           )}
                        </>
                     )}
                  </div>
               );
            },
            size: 217.6,
            enableSorting: true,
         },
         {
            accessorKey: "subject",
            header: () => (
               <div className="flex items-center gap-2">
                  <ClipboardList size={16} />
                  <span>{t("table.subject")}</span>
               </div>
            ),
            cell: ({ getValue }) => (
               <p className="text-sm text-text-sub">{getValue() as string}</p>
            ),
            size: 217.6,
         },
         {
            accessorKey: "category",
            header: () => (
               <div className="flex items-center gap-2">
                  <ClipboardList size={16} />
                  <span>{t("table.category")}</span>
               </div>
            ),
            cell: ({ getValue }) => (
               <p className="text-sm text-text-sub capitalize">
                  {getValue() as string}
               </p>
            ),
            size: 217.6,
         },
         {
            accessorKey: "requested_by",
            header: () => (
               <div className="flex items-center gap-2">
                  <ClipboardText size={16} />
                  <span>{t("table.requestedBy")}</span>
               </div>
            ),
            cell: ({ row }) => {
               const requestedBy = row.original.requested_by;

               // Handle null/undefined requestedBy
               if (!requestedBy) {
                  return (
                     <p className="text-sm text-text-sub">-</p>
                  );
               }

               return (
                  <MemberTag1
                     name={requestedBy.name}
                     jobTitle={requestedBy.job_title}
                     avatar={requestedBy.avatar_url}
                  />
               );
            },
            size: 217.6,
         },
         {
            accessorKey: "submitted_at",
            header: () => (
               <div className="flex items-center gap-2">
                  <ClipboardText size={16} />
                  <span>{t("table.submittedAt")}</span>
               </div>
            ),
            cell: ({ getValue }) => {
               const date = new Date(getValue() as string);
               return (
                  <p className="text-sm text-text-sub">
                     {date.toLocaleDateString()} {date.toLocaleTimeString()}
                  </p>
               );
            },
            size: 217.6,
         },
         {
            accessorKey: "status",
            header: () => (
               <div className="flex items-center gap-2">
                  <Tag size={16} />
                  <span>{t("table.status")}</span>
               </div>
            ),
            cell: ({ row }) => {
               const status = row.original.status;
               // Convert API status format to translation key format
               // "Open" -> "open", "In_Progress" -> "inProgress", "Resolved" -> "resolved"
               const statusKey =
                  status === "In_Progress"
                     ? "inProgress"
                     : String(status || "").toLowerCase();

               return (
                  <BadgeTag
                     label={t(`status.${statusKey}`)}
                     variant={getStatusVariant(status)}
                     size="sm"
                  />
               );
            },
            size: 217.6,
         },
      ];

      if (hasActions) {
         baseColumns.push({
            id: "actions",
            header: "",
            cell: ({ row }) => (
               <ActionCell
                  ticket={row.original}
                  onViewDetails={onViewDetails}
                  onMarkAsResolved={onMarkAsResolved}
                  onChatClick={onChatClick}
                  getChatActionLabel={getChatActionLabel}
               />
            ),
            size: 64,
         });
      }

      return baseColumns;
   }, [
      t,
      onViewDetails,
      onMarkAsResolved,
      onChatClick,
      getChatActionLabel,
      hasActions,
   ]);

   return (
      <DataTable
         columns={columns}
         data={data}
         globalFilter={globalFilter}
         isLoading={isLoading}
         enableRowSelection={false}
         showPagination={true}
         pageSize={pagination?.pageSize ?? 10}
         pageSizeOptions={[10, 20, 50]}
         pagination={pagination}
         onPaginationChange={onPaginationChange}
         pageCount={pageCount}
         manualPagination={manualPagination}
         translationNamespace="helpSupport"
      />
   );
}

export default HelpSupportTable;
