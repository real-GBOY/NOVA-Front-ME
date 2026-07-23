/** @format */

import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { RequestsContent } from "@/components/requests";
import { useDashboardOverview } from "@/hooks/dashboard/dashboard.queries";
import { getDateRangeForPeriod } from "@/utilities/dateRange";
import { useGetEmployeeDetails } from "@/hooks/employees/employee.queries";
import { getCurrentUserId } from "@/utils/auth";
import { usePermissions } from "@/contexts/PermissionContext";
import NoPermissionMessage from "@/components/common/NoPermissionMessage";
import LoginWarningModal from "@/components/auth/LoginWarningModal";

import { VoucherChart } from "./charts/vouchers/VoucherChart";

import InvoiceChart from "./charts/invoices/InvoiceChart";
import { generateMockInvoiceData } from "./charts/invoices/invoiceChartUtils";

import { AttendanceChart } from "./charts/attendance";

import { RequestsChart } from "./charts/requests";
import { BreakControlCard } from "./charts/break";

import { MembersChart } from "./charts/members";
import { UpcomingChart, UpcomingList } from "./charts/upcoming"; // Import new components

import { DashboardHeader, type DashboardDateRange } from "./charts/header";

function Dashboard() {
   const navigate = useNavigate();
   const { can, getScope } = usePermissions();
   const [dateRange, setDateRange] = useState<DashboardDateRange>(
      getDateRangeForPeriod("thisWeek")
   );
   const currentUserId = getCurrentUserId();
   const { data: currentUserDetails } = useGetEmployeeDetails(
      currentUserId ?? 0,
      { enabled: !!currentUserId }
   );
   const canViewDashboard = can("dashboard.view");
   
   const employeeDetailedScope = getScope("read_employee_detailed");
   const canViewMembers =
      can("read_employee_detailed") &&
      (employeeDetailedScope === "ALL" || employeeDetailedScope === null);
   const canViewAttendance =
      can("view_attendance_requests") ||
      can("manage_attendance") ||
      can("approve_attendance");
   const canViewRequests =
      can("view_attendance_requests") ||
      can("view_vacation_requests") ||
      can("view_overtime_requests") ||
      can("approve_attendance") ||
      can("approve_vacation") ||
      can("approve_overtime");
   const canViewInvoices = can("view_invoices");
   const canViewVouchers = can("view_vouchers");
   const canViewLegalCases =
      can("read_legal_case") && can("read_legal_case_type");
   const canViewLegalCaseTypes = can("read_legal_case_type");

   const overviewSections = useMemo(() => {
      const sections: Array<
         "members" | "attendance" | "requests" | "invoices" | "vouchers"
      > = [];
      if (canViewMembers) sections.push("members");
      if (canViewAttendance) sections.push("attendance");
      if (canViewRequests) sections.push("requests");
      if (canViewInvoices) sections.push("invoices");
      if (canViewVouchers) sections.push("vouchers");
      return sections;
   }, [
      canViewMembers,
      canViewAttendance,
      canViewRequests,
      canViewInvoices,
      canViewVouchers,
   ]);

   const { data: overview } = useDashboardOverview(
      {
         include: overviewSections,
         from_date: dateRange.from_date,
         to_date: dateRange.to_date,
      },
      { enabled: canViewDashboard && overviewSections.length > 0 }
   );
   const todayDateString = useMemo(() => {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, "0");
      const day = String(today.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
   }, []);

   const { data: todayRequestsOverview } = useDashboardOverview(
      {
         include: ["requests"],
         from_date: todayDateString,
         to_date: todayDateString,
      },
      { enabled: canViewDashboard && canViewRequests }
   );

   // Derive header values directly - cheap string/property operations
   const personal = currentUserDetails?.personal;
   const headerUserName = personal
      ? `${personal.first_name || ""} ${personal.last_name || ""}`.trim()
      : "";
   const headerUserAvatar =
      personal?.profile_picture_url || personal?.profile_picture?.url || null;
   const headerRequestsCount = canViewRequests
      ? todayRequestsOverview?.data?.requests?.totals?.pending ?? 0
      : 0;

   const invoiceChartData = useMemo(() => {
      const invoiceSummary = overview?.data?.invoices;
      if (!invoiceSummary) {
         return generateMockInvoiceData();
      }
      const totalInvoices = invoiceSummary.total_invoices || 0;
      const statusShare = invoiceSummary.status_share || {};
      const byStatus = invoiceSummary.by_status || {};
      const hasStatusShare = Object.keys(statusShare).length > 0;

      const fullyPaidCount = byStatus.Fully_Paid || 0;
      const pendingCount =
         (byStatus.Pending || 0) + (byStatus.Partially_Paid || 0);
      const draftCount = byStatus.Draft || 0;

      const fullyPaidShare = hasStatusShare
         ? statusShare.Fully_Paid || 0
         : totalInvoices > 0
         ? fullyPaidCount / totalInvoices
         : 0;
      const pendingShare = hasStatusShare
         ? (statusShare.Pending || 0) + (statusShare.Partially_Paid || 0)
         : totalInvoices > 0
         ? pendingCount / totalInvoices
         : 0;
      const draftShare = hasStatusShare
         ? statusShare.Draft || 0
         : totalInvoices > 0
         ? draftCount / totalInvoices
         : 0;

      return {
         totalValue: Math.round(invoiceSummary.total_amount || 0),
         currency: "AED",
         growthValue: 0,
         fullyPaidPercentage: Math.round(fullyPaidShare * 100),
         pendingPercentage: Math.round(pendingShare * 100),
         draftPercentage: Math.round(draftShare * 100),
      };
   }, [overview]);

   if (!canViewDashboard) {
      return (
         <div className="p-6">
            <NoPermissionMessage
               message="Access Restricted"
               description="You don't have permission to access the dashboard."
            />
         </div>
      );
   }

   const hasOverviewContent =
      canViewMembers ||
      canViewAttendance ||
      canViewRequests ||
      canViewInvoices ||
      canViewVouchers ||
      canViewLegalCases;

   if (!hasOverviewContent) {
      return (
         <div className="p-6">
            <NoPermissionMessage
               message="Access Restricted"
               description="You don't have permission to view dashboard sections."
            />
         </div>
      );
   }

   return (
      <>
         <LoginWarningModal />
         <DashboardHeader
            onDateRangeChange={setDateRange}
            userName={headerUserName}
            userAvatar={headerUserAvatar || undefined}
            newRequestsCount={headerRequestsCount}
         />

         <div className="flex flex-col gap-6">
            {(canViewMembers || canViewAttendance || canViewRequests) && (
               <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
                  {canViewMembers && (
                     <MembersChart data={overview?.data?.members} />
                  )}
                  {canViewAttendance && (
                     <AttendanceChart
                        data={overview?.data?.attendance}
                        range={dateRange}
                     />
                  )}
                  {canViewRequests && (
                     <RequestsChart data={todayRequestsOverview?.data?.requests} />
                  )}
                  {canViewAttendance && <BreakControlCard />}
               </div>
            )}

            {(canViewLegalCases || canViewLegalCaseTypes) && (
               <div className="grid grid-cols-1 gap-6 lg:grid-cols-[5fr_5fr]">
                  {canViewLegalCases && (
                     <div className="min-w-0">
                        <UpcomingList />
                     </div>
                  )}
                  {canViewLegalCases && canViewLegalCaseTypes && (
                     <div className="min-w-0">
                        <UpcomingChart />
                     </div>
                  )}
               </div>
            )}

            {(canViewInvoices || canViewVouchers) && (
               <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
                  {canViewInvoices && (
                     <div className="lg:col-span-1">
                        <InvoiceChart
                           data={invoiceChartData}
                           onCheckDrafts={() =>
                              navigate("/dashboard/loans-advances?tab=draft")
                           }
                        />
                     </div>
                  )}
                  {canViewVouchers && (
                     <div className="lg:col-span-3">
                        <VoucherChart
                           data={overview?.data?.vouchers}
                           range={dateRange}
                        />
                     </div>
                  )}
               </div>
            )}
         </div>
         {canViewRequests && (
            <div className="mt-6 w-full">
               <RequestsContent layout="dashboard" />
            </div>
         )}
      </>
   );
}

export default Dashboard;
