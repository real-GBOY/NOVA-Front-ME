/** @format */

import { SummaryCardData } from "../types";
import {
   AlarmDollar,
   AlarmXmarkCircle,
   Inbox,
   WalletClock,
} from "@/Icons";
import ContractStatusValue from "../ContractStatusValue";
import type {
   AttendanceTimelineResponse,
   TimeOffSummaryResponse,
   OvertimeSummaryResponse,
   EmployeeContract,
} from "@/services/employeeService";
import type { ContractResponse } from "@/services/contractService";
type ContractStatus = "Active" | "Expired" | "Upcoming" | "Terminated";

type TranslationFunction = (
   key: string,
   options?: Record<string, unknown>
) => string;

export const getSummaryCards = (
   t: TranslationFunction,
   onExtendDuration?: () => void
): SummaryCardData[] => [
   {
      id: "overtime",
      title: t("profile.summary.overtime"),
      value: "26.5 Hours",
      icon: <AlarmDollar className="fill-success-dark" />,
   },
   {
      id: "late",
      title: t("profile.summary.lateArrivals"),
      value: "7 Times",
      icon: <AlarmXmarkCircle className="fill-warning" />,
   },
   {
      id: "requests",
      title: t("profile.summary.pendingRequests"),
      value: "3 Requests",
      icon: <Inbox className="fill-warning" />,
   },
   {
      id: "contract",
      title: t("profile.summary.contractStatus"),
      value: (
         <ContractStatusValue
            status="Active"
            onExtendDuration={onExtendDuration}
         />
      ),
      icon: <WalletClock className="fill-highlighted" />,
   },
];

// Dynamic summary cards based on API data
export const getDynamicSummaryCards = (
   t: TranslationFunction,
   data: {
      attendanceTimeline?: AttendanceTimelineResponse;
      timeOffSummary?: TimeOffSummaryResponse;
      overtimeSummary?: OvertimeSummaryResponse;
      contract?: EmployeeContract | ContractResponse;
      contractsList?: ContractResponse[];
   },
   options?: {
      onExtendDuration?: () => void;
      canExtendContract?: boolean;
   }
): SummaryCardData[] => {
   const { attendanceTimeline, timeOffSummary, overtimeSummary, contract, contractsList } =
      data;
   const { onExtendDuration, canExtendContract } = options || {};

   // Calculate late arrivals from attendance timeline segments
   const lateArrivals =
      attendanceTimeline?.data.filter((day) => {
         return day.segments?.some((segment) => segment.segment_type === "Late");
      }).length || 0;

   // Get pending requests count
   const pendingTimeOffRequests =
      timeOffSummary?.requests.filter(
         (req) => req.status.toLowerCase() === "pending"
      ).length || 0;

   const pendingOvertimeRequests = overtimeSummary?.pending_requests || 0;
   const totalPendingRequests =
      pendingTimeOffRequests + pendingOvertimeRequests;
   const totalHourLeaveMinutes =
      timeOffSummary?.hour_counters?.reduce(
         (sum, counter) => sum + counter.total_minutes,
         0
      ) || 0;
   const nursingActive = Boolean(timeOffSummary?.nursing_status?.active);

   // Find matching contract in the list for termination check (same approach as ContractsTable)
   // Handle both EmployeeContract and ContractResponse types
   const getContractStatus = (
      contract: EmployeeContract | ContractResponse
   ): ContractStatus => {
      // Check if this is a ContractResponse (has 'id' and 'status' at top level)
      const isContractResponse = 'id' in contract && 'status' in contract && !('contract_id' in contract);
      
      if (isContractResponse) {
         const contractResponse = contract as ContractResponse;
         // Check for termination
         if (
            contractResponse.status?.toLowerCase() === "terminated" ||
            contractResponse.status?.toLowerCase() === "ended" ||
            contractResponse.custom_fields?.termination
         ) {
            return "Terminated";
         }
         // Map ContractResponse status to EmployeeContract status format
         const status = contractResponse.status?.toLowerCase();
         if (status === "active") return "Active";
         if (status === "expired") return "Expired";
         if (status === "terminated" || status === "ended") return "Terminated";
         return "Active";
      }

      // Handle EmployeeContract type
      const employeeContract = contract as EmployeeContract;
      // Find the matching contract in the list
      const matchingContract = contractsList?.find(
         (c) => c.id === employeeContract.contract_id
      );

      // Check for termination - same logic as ContractsContent.tsx
      if (
         employeeContract.duration?.status === "Terminated" ||
         matchingContract?.status?.toLowerCase() === "terminated" ||
         matchingContract?.status?.toLowerCase() === "ended" ||
         matchingContract?.custom_fields?.termination
      ) {
         return "Terminated";
      }

      return (employeeContract.duration?.status as ContractStatus) || "Active";
   };

   const contractStatus = contract ? getContractStatus(contract) : "Active";
   const canTriggerExtend =
      Boolean(canExtendContract && onExtendDuration && contractStatus !== "Terminated");

   // Calculate days remaining for ContractResponse type
   const getDaysRemaining = (contract: EmployeeContract | ContractResponse): number | undefined => {
      // Check if this is a ContractResponse
      const isContractResponse = 'id' in contract && 'status' in contract && !('contract_id' in contract);
      
      if (isContractResponse) {
         const contractResponse = contract as ContractResponse;
         if (contractResponse.core?.start_date && contractResponse.core?.end_date) {
            const endDate = new Date(contractResponse.core.end_date);
            const now = new Date();
            const diffTime = endDate.getTime() - now.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays > 0 ? diffDays : 0;
         }
         return undefined;
      }

      // Handle EmployeeContract type
      const employeeContract = contract as EmployeeContract;
      return employeeContract.duration?.days_remaining;
   };

   const contractSummaryValue = contract ? (
      <ContractStatusValue
         status={contractStatus}
         daysRemaining={getDaysRemaining(contract)}
         onExtendDuration={canTriggerExtend ? onExtendDuration : undefined}
      />
   ) : (
      <p className="text-xs text-text-sub">
         {t("profile.contract.noContractFound")}
      </p>
   );

   return [
      {
      id: "overtime",
      title: t("profile.summary.overtime"),
      value: t("profile.summary.overtimeValue", {
         hours: overtimeSummary?.total_hours_this_month || 0,
      }),
      icon: <AlarmDollar className="fill-success-dark" />,
      },
      {
      id: "late",
      title: t("profile.summary.lateArrivals"),
      value: t("profile.summary.lateArrivalsValue", { count: lateArrivals }),
      icon: <AlarmXmarkCircle className="fill-warning" />,
      },
      {
         id: "requests",
         title: t("profile.summary.pendingRequests"),
      value: t("profile.summary.pendingRequestsValue", {
         count: totalPendingRequests,
      }),
      icon: <Inbox className="fill-warning" />,
      },
      {
      id: "hourLeaves",
      title: "Hour Leave Counter",
      value: `${totalHourLeaveMinutes} min`,
      icon: <AlarmDollar className="fill-success-dark" />,
      },
      {
      id: "nursing",
      title: "Nursing Status",
      value: nursingActive
         ? `Active${
              timeOffSummary?.nursing_status?.nursing_end_date
                 ? ` • ${timeOffSummary.nursing_status.nursing_end_date}`
                 : ""
           }`
         : "Inactive",
      icon: <WalletClock className="fill-highlighted" />,
      },
      {
      id: "contract",
      title: t("profile.summary.contractStatus"),
      value: contractSummaryValue,
      icon: <WalletClock className="fill-highlighted" />,
      },
   ];
};
