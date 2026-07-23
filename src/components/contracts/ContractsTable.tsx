/** @format */

import { useMemo, useRef, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import type { PaginationState, Updater } from "@tanstack/react-table";
import { Contract } from "./data";
import { DataTable } from "@/designSystem/ui/data-table";
import Dropdown from "@/designSystem/Dropdown";
import BadgeTag from "@/designSystem/BadgeTag";
import DirhamLabel from "@/designSystem/DirhamLabel";
import {
   MoreVertical,
   Ban,
   UserSimpleAlt,
   Hashtag,
   ClipboardText,
   Tag,
   Calendar,
   SackDollar,
   Eye,
} from "@/Icons";
import MemberTag1 from "./MemberTag1";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useContracts } from "@/hooks/contracts/useContracts";
import toast from "@/utilities/toast";
import TerminateContractModal from "./TerminateContractModal";
import { usePermissions } from "@/contexts/PermissionContext";

interface ContractsTableProps {
   data: Contract[];
   pageCount?: number;
   pagination: PaginationState;
   onPaginationChange: (updater: Updater<PaginationState>) => void;
}

// Actions Cell Component
function ActionCell({
   employeeId,
   canPreview,
   canTerminate,
}: {
   employeeId: string;
   canPreview: boolean;
   canTerminate: boolean;
}) {
   const { t } = useTranslation("common");
   const menuButtonRef = useRef<HTMLButtonElement>(null);
   const [isDropdownOpen, setIsDropdownOpen] = useState(false);
   const [isTerminateModalOpen, setIsTerminateModalOpen] = useState(false);
   const navigate = useNavigate();
   const { useTerminate } = useContracts();
   const terminateMutation = useTerminate();

   const handleTerminate = async (reason: string, terminationDate: Date) => {
      try {
         // Format date to ISO string (YYYY-MM-DD)
         const formattedDate = terminationDate.toISOString().split("T")[0];

         // Call the end contract API with reason and end_date
         await terminateMutation.mutateAsync({
            id: employeeId,
            payload: {
               reason,
               termination_date: formattedDate,
            },
         });

         toast.success(t("contracts.wizard.messages.terminateSuccess"));
         setIsTerminateModalOpen(false);
      } catch {
         toast.error(t("contracts.wizard.messages.terminateError"));
      }
   };

   const dropdownItems = useMemo(() => {
      type DropdownItem = {
         id: string;
         label: string;
         icon: typeof Eye;
         variant?: "danger";
         onClick: () => void;
      };

      const items: DropdownItem[] = [];

      if (canPreview) {
         items.push({
            id: "preview",
            label: t("actions.preview"),
            icon: Eye,
            onClick: () => {
               navigate(
                  `/dashboard/members/profile/${employeeId}?activeTabId=contract`
               );
            },
         });
      }

      // Only show terminate if user has permission
      if (canTerminate) {
         items.push({
            id: "terminate",
            label: t("actions.terminate"),
            icon: Ban,
            variant: "danger",
            onClick: () => {
               setIsDropdownOpen(false);
               setIsTerminateModalOpen(true);
            },
         });
      }

      return items;
   }, [t, navigate, employeeId, canPreview, canTerminate]);

   if (dropdownItems.length === 0) return null;

   return (
      <>
         <div className="relative">
            <button
               ref={menuButtonRef}
               onClick={() => setIsDropdownOpen(!isDropdownOpen)}
               data-row-menu-trigger
               className={`flex items-center justify-center p-1.5 bg-background rounded-lg transition-colors hover:bg-bg-weak ${
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

         <TerminateContractModal
            isOpen={isTerminateModalOpen}
            onClose={() => setIsTerminateModalOpen(false)}
            onConfirm={handleTerminate}
            isLoading={terminateMutation.isPending}
         />
      </>
   );
}

export default function ContractsTable({
   data,
   pageCount,
   pagination,
   onPaginationChange,
}: ContractsTableProps) {
   const { t } = useTranslation("common");
   const navigate = useNavigate();
   const { can } = usePermissions();
   const canPreviewContract =
      can("read_employee_contract") || can("manage_contracts");
   const canTerminateContract =
      can("terminate_contract") || can("manage_contracts");

   // Utility function to calculate contract status and progress
   const calculateContractStatus = (
      startDate: string,
      endDate: string,
      currentStatus?: Contract["status"]
   ) => {
      // Parse dates (format: "DD MMM, YYYY")
      const parseDate = (dateStr: string): Date => {
         const [day, month, year] = dateStr.split(" ");
         const monthMap: Record<string, number> = {
            Jan: 0,
            Feb: 1,
            Mar: 2,
            Apr: 3,
            May: 4,
            Jun: 5,
            Jul: 6,
            Aug: 7,
            Sep: 8,
            Oct: 9,
            Nov: 10,
            Dec: 11,
         };
         return new Date(
            parseInt(year),
            monthMap[month.replace(",", "")],
            parseInt(day)
         );
      };

      const start = parseDate(startDate);
      const end = parseDate(endDate);
      const today = new Date();

      // Calculate progress percentage
      const totalDuration = end.getTime() - start.getTime();
      const elapsed = today.getTime() - start.getTime();
      const progress = Math.min(
         100,
         Math.max(0, (elapsed / totalDuration) * 100)
      );

      // Determine status based on progress
      let status: "Active" | "Near Expired" | "Expired" | "Terminated" =
         "Active";
      let progressColor = "bg-success";

      if (currentStatus === "Terminated") {
         status = "Terminated";
         progressColor = "bg-danger";
      } else if (progress >= 100) {
         status = "Expired";
         progressColor = "bg-danger";
      } else if (progress >= 80) {
         status = "Near Expired";
         progressColor = "bg-warning";
      }

      return { progress, status, progressColor };
   };

   const columns: ColumnDef<Contract>[] = useMemo(
      () => [
         {
            accessorKey: "id",
            header: () => (
               <div className="flex items-center gap-2">
                  <Hashtag size={16} />
                  <span className="text-sm">{t("contracts.id")}</span>
               </div>
            ),
            cell: ({ row }) => (
               <span className="text-sm text-text-strong font-medium">
                  {row.original.id}
               </span>
            ),
            size: 100,
         },
         {
            accessorKey: "contractName",
            header: () => (
               <div className="flex items-center gap-2">
                  <ClipboardText size={16} />
                  <span className="text-sm">{t("contracts.contractName")}</span>
               </div>
            ),
            cell: ({ row }) => (
               <span className="text-sm text-text-strong">
                  {row.original.contractName}
               </span>
            ),
            size: 254,
         },
         {
            accessorKey: "assignedTo",
            header: () => (
               <div className="flex items-center gap-2">
                  <UserSimpleAlt size={16} />
                  <span className="text-sm">{t("contracts.assignedTo")}</span>
               </div>
            ),
            cell: ({ row }) => {
               const handleCardClick = (e: React.MouseEvent) => {
                  e.stopPropagation();
                  if (!canPreviewContract) return;
                  navigate(
                     `/dashboard/members/profile/${row.original.assignedTo.id}?activeTabId=contract`
                  );
               };

               return (
                  <MemberTag1
                     name={row.original.assignedTo.name}
                     jobTitle={row.original.assignedTo.jobTitle}
                     avatar={row.original.assignedTo.avatar}
                     avatarBg={row.original.assignedTo.avatarBg}
                     onClick={canPreviewContract ? handleCardClick : undefined}
                  />
               );
            },
            size: 265,
            enableSorting: true,
            filterFn: (row, _columnId, filterValue) => {
               const name = row.original.assignedTo.name;
               const jobTitle = row.original.assignedTo.jobTitle;
               const searchValue = filterValue.toLowerCase();
               return (
                  name.toLowerCase().includes(searchValue) ||
                  jobTitle.toLowerCase().includes(searchValue)
               );
            },
         },
         {
            accessorKey: "status",
            header: () => (
               <div className="flex items-center gap-2">
                  <Tag size={16} />
                  <span className="text-sm">{t("contracts.statusLabel")}</span>
               </div>
            ),
            cell: ({ row }) => {
               const { startDate, endDate } = row.original.contractDuration;
               const { status } = calculateContractStatus(
                  startDate,
                  endDate,
                  row.original.status
               );
               const variantMap: Record<
                  string,
                  "success" | "warning" | "error"
               > = {
                  Active: "success",
                  "Near Expired": "warning",
                  Expired: "error",
                  Terminated: "error",
               };
               return (
                  <BadgeTag
                     label={status}
                     variant={variantMap[status] || "info"}
                     size="sm"
                  />
               );
            },
            size: 120,
         },
         {
            accessorKey: "contractDuration",
            header: () => (
               <div className="flex items-center gap-2">
                  <Calendar size={16} />
                  <span className="text-sm">
                     {t("contracts.contractDuration")}
                  </span>
               </div>
            ),
            cell: ({ row }) => {
               const { years, months, startDate, endDate } =
                  row.original.contractDuration;

               const { progress, progressColor } = calculateContractStatus(
                  startDate,
                  endDate,
                  row.original.status
               );

               // Format duration display
               let durationText = "";
               if (years === 0) {
                  // Less than 1 year - show only months
                  durationText = `${months || 0} ${
                     months === 1 ? "Month" : "Months"
                  }`;
               } else if (months && months > 0) {
                  // Show both years and months
                  durationText = `${years} ${
                     years === 1 ? "Year" : "Years"
                  }, ${months} ${months === 1 ? "Month" : "Months"}`;
               } else {
                  // Show only years
                  durationText = `${years} ${years === 1 ? "Year" : "Years"}`;
               }

               return (
                  <div className="flex flex-col gap-2">
                     <div className="flex justify-between items-center text-xs leading-4">
                        <span className="font-medium text-text-strong">
                           {durationText}
                        </span>
                        <span className="text-text-soft">
                           {startDate} - {endDate}
                        </span>
                     </div>
                     <div className="h-1 w-full bg-bg-weak rounded-full overflow-hidden">
                        <div
                           className={`h-full ${progressColor} rounded-full transition-all`}
                           style={{ width: `${progress}%` }}
                        />
                     </div>
                  </div>
               );
            },
            size: 277,
         },
         {
            accessorKey: "contractAmount",
            header: () => (
               <div className="flex items-center gap-2">
                  <SackDollar size={16} />
                  <span className="text-sm">
                     {t("contracts.contractAmount")}
                  </span>
               </div>
            ),
            cell: ({ row }) => (
               <div className="text-sm text-text-strong font-medium">
                  <DirhamLabel
                     value={row.original.contractAmount.toLocaleString()}
                  />
               </div>
            ),
            size: 157,
         },
         {
            id: "actions",
            header: () => <div />,
            cell: ({ row }) => (
               <ActionCell
                  employeeId={row.original.assignedTo.id}
                  canPreview={canPreviewContract}
                  canTerminate={canTerminateContract}
               />
            ),
            size: 64,
         },
      ],
      [t, navigate, canPreviewContract, canTerminateContract]
   );

   return (
      <DataTable
         columns={columns}
         data={data}
         enableRowSelection={false}
         showPagination={true}
         pageSize={pagination.pageSize}
         pageCount={pageCount}
         pagination={pagination}
         onPaginationChange={onPaginationChange}
         manualPagination={true}
      />
   );
}
