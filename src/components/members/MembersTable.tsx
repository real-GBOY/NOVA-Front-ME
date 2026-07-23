/** @format */

import { useMemo, useCallback } from "react";
import { ColumnDef } from "@tanstack/react-table";
import type { PaginationState, Updater } from "@tanstack/react-table";
import Checkbox from "@/designSystem/Checkbox";
import PermissionTag from "@/designSystem/PermissionTag";
import StatusTag from "@/designSystem/StatusTag";
import RoleTag from "@/designSystem/RoleTag";
import MembersFloatingActionBar from "./MembersFloatingActionBar";
import { DataTable } from "@/designSystem/ui/data-table";
import { useTranslation } from "@/hooks/useTranslation";
import type { Member } from "@/utilities/employeeTransformers";
import {
   Briefcase,
   Mobile,
   Calender,
   LockCircle,
   UserSimpleAlt,
   UserGearAlt,
} from "@/Icons";
import MemberActionsMenu from "./MemberActionsMenu";
import { getMemberStatusMeta } from "@/components/members/utils/memberStatus";

// Re-export Member type for backward compatibility
export type { Member };

interface MembersTableProps {
   data: Member[];
   globalFilter?: string;
   onViewProfile: (member: Member) => void;
   onOverridePermissions: (member: Member) => void;
   onResetPermissions: (member: Member) => void;
   onDeactivate: (member: Member) => void;
   onResendInvite?: (member: Member) => void;
   onBulkDelete: (members: Member[]) => void;
   onBulkReset: (members: Member[]) => void;
   onSendMessage: (members: Member[]) => void;
   onEditDetails: (member: Member) => void;
   pagination?: {
      pageIndex: number;
      pageSize: number;
   };
   onPaginationChange?: (updater: Updater<PaginationState>) => void;
   pageCount?: number;
}

// Actions Cell Component
function ActionCell({
   member,
   onOverridePermissions,
   onResetPermissions,
   onDeactivate,
   onViewProfile,
   onSendMessage,
   onResendInvite,
}: {
   member: Member;
   onOverridePermissions: (member: Member) => void;
   onResetPermissions: (member: Member) => void;
   onDeactivate: (member: Member) => void;
   onViewProfile: (member: Member) => void;
   onSendMessage: (member: Member) => void;
   onResendInvite?: (member: Member) => void;
}) {
   const canResendInvite = member.status === "Invited";
   const canDeactivate = member.status === "Active";

   return (
      <MemberActionsMenu
         onViewProfile={() => onViewProfile(member)}
         onSendMessage={() => onSendMessage(member)}
         onResendInvite={
            canResendInvite && onResendInvite
               ? () => onResendInvite(member)
               : undefined
         }
         onOverridePermissions={() => onOverridePermissions(member)}
         onResetPermissions={() => onResetPermissions(member)}
         onDeactivate={canDeactivate ? () => onDeactivate(member) : undefined}
      />
   );
}

function MembersTable({
   data,
   globalFilter = "",
   onViewProfile,
   onOverridePermissions,
   onResetPermissions,
   onDeactivate,
   onBulkDelete,
   onBulkReset,
   onSendMessage,
   onEditDetails,
   pagination,
   onPaginationChange,
   onResendInvite,
   pageCount,
}: MembersTableProps) {
   const { t } = useTranslation("members");

   const renderFloatingBar = useCallback(
      (selectedCount: number, selectedRows: Member[]) => (
         <MembersFloatingActionBar
            selectedCount={selectedCount}
            selectedRows={selectedRows}
            onDelete={onBulkDelete}
            onResetPermissions={onBulkReset}
            onSendMessage={onSendMessage}
            onEditDetails={onEditDetails}
         />
      ),
      [onBulkDelete, onBulkReset, onSendMessage, onEditDetails]
   );

   const columns: ColumnDef<Member>[] = useMemo(
      () => [
         {
            id: "select",
            header: ({ table }) => (
               <Checkbox
                  checked={table.getIsAllPageRowsSelected()}
                  onChange={(e) =>
                     table.toggleAllPageRowsSelected(e.target.checked)
                  }
                  className="m-0 mb-0.5 me-0.5"
               />
            ),
            cell: ({ row }) => (
               <Checkbox
                  checked={row.getIsSelected()}
                  onChange={(e) => row.toggleSelected(e.target.checked)}
                  className="m-0 me-0.5"
               />
            ),
            size: 40,
            enableSorting: false,
         },
         {
            accessorKey: "name",
            header: () => (
               <div className="flex items-center gap-2">
                  <UserSimpleAlt size={16} />
                  <span>{t("table.memberName")}</span>
               </div>
            ),
            cell: ({ row }) => (
               <button
                  onClick={(e) => {
                     e.stopPropagation();
                     onViewProfile(row.original);
                  }}
                  className="flex items-center gap-3 w-full text-start  rounded-lg p-1 -m-1 transition-colors cursor-pointer group">
                  <div
                     className={`w-10 h-10 rounded-full flex items-center justify-center ${row.original.avatarBg}`}>
                     <img
                        src={row.original.avatar || "/icons/defAvatar.png"}
                        alt={row.original.name}
                        className="w-full h-full rounded-full object-cover"
                     />
                  </div>
                  <div className="flex flex-col gap-0.5 min-w-0">
                     <p className="text-sm font-medium text-text-strong truncate group-hover:text-primary group-hover:underline transition-colors">
                        {row.original.name}
                     </p>
                     <p className="text-xs text-primary truncate">
                        {row.original.email}
                     </p>
                  </div>
               </button>
            ),
            size: 265,
            enableSorting: true,
            filterFn: (row, columnId, filterValue) => {
               const name = row.getValue(columnId) as string;
               const email = row.original.email;
               const searchValue = filterValue.toLowerCase();
               return (
                  name.toLowerCase().includes(searchValue) ||
                  email.toLowerCase().includes(searchValue)
               );
            },
         },
         {
            accessorKey: "jobTitle",
            header: () => (
               <div className="flex items-center gap-2">
                  <Briefcase size={16} />
                  <span>{t("table.jobTitle")}</span>
               </div>
            ),
            cell: ({ getValue }) => (
               <p className="text-sm text-text-sub">{getValue() as string}</p>
            ),
            size: 156,
         },
         {
            accessorKey: "contact",
            header: () => (
               <div className="flex items-center gap-2">
                  <Mobile size={16} />
                  <span>{t("table.contact")}</span>
               </div>
            ),
            cell: ({ getValue }) => (
               <p className="text-sm text-primary underline cursor-pointer hover:text-primary/80 transition-colors">
                  {getValue() as string}
               </p>
            ),
            size: 148,
         },
         {
            accessorKey: "joinedAt",
            header: () => (
               <div className="flex items-center gap-2">
                  <Calender size={16} />
                  <span>{t("table.joinedAt")}</span>
               </div>
            ),
            cell: ({ getValue }) => (
               <p className="text-sm text-text-sub">{getValue() as string}</p>
            ),
            size: 117.5,
         },
         {
            accessorKey: "permissionStatus",
            header: () => (
               <div className="flex items-center gap-2">
                  <LockCircle size={16} />
                  <span>{t("table.permissions")}</span>
               </div>
            ),
            cell: ({ row }) => (
               <PermissionTag
                  label={
                     row.original.isPermissionOverride
                        ? t("permissions.override")
                        : t("permissions.default")
                  }
                  isOverride={row.original.isPermissionOverride}
               />
            ),
            size: 140,
         },
         {
            accessorKey: "status",
            header: () => (
               <div className="flex items-center gap-2">
                  <UserSimpleAlt size={16} />
                  <span>{t("table.status")}</span>
               </div>
            ),
            cell: ({ row }) => {
               const { label, variant } = getMemberStatusMeta(
                  row.original.status,
                  t
               );
               return <StatusTag label={label} variant={variant} />;
            },
            size: 117.5,
         },
         {
            accessorKey: "role",
            header: () => (
               <div className="flex items-center gap-2">
                  <UserGearAlt size={16} />
                  <span>{t("table.role")}</span>
               </div>
            ),
            cell: ({ row }) => (
               <RoleTag
                  label={row.original.role}
                  showWarning={row.original.roleIcon === "warning"}
               />
            ),
            size: 144,
         },
         {
            id: "actions",
            header: "",
            cell: ({ row }) => (
               <ActionCell
                  member={row.original}
                  onOverridePermissions={onOverridePermissions}
                  onResetPermissions={onResetPermissions}
                  onDeactivate={onDeactivate}
                  onViewProfile={onViewProfile}
                  onSendMessage={(member) => onSendMessage([member])}
                  onResendInvite={onResendInvite}
               />
            ),
            size: 64,
         },
      ],
      [
         t,
         onViewProfile,
         onOverridePermissions,
         onResetPermissions,
         onDeactivate,
         onSendMessage,
         onResendInvite,
      ]
   );

   return (
      <DataTable
         columns={columns}
         data={data}
         globalFilter={globalFilter}
         enableRowSelection={true}
         showPagination={true}
         pageSize={pagination?.pageSize ?? 10}
         pagination={pagination}
         onPaginationChange={onPaginationChange}
         pageCount={pageCount}
         manualPagination={Boolean(onPaginationChange)}
         translationNamespace="members"
         renderFloatingBar={renderFloatingBar}
      />
   );
}

export default MembersTable;
