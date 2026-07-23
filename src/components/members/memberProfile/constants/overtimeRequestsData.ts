/** @format */

import type { OvertimeRequest } from "../tabs/TimeManagmentTab/OvertimeTable";

export const overtimeRequestsData: OvertimeRequest[] = [
   {
      id: "1",
      requestedDate: "12 Feb, 2025",
      overtimeDate: "15 Feb, 2025",
      duration: "3 hours",
      overtime: "Evening shift extension",
      reason:
         "Project deadline approaching rapidly with critical features pending completion for the upcoming client presentation scheduled for next week. The development team needs additional time to finalize the user interface components and ensure all functionality is thoroughly tested before the demo.",
      status: "pending",
   },
   {
      id: "2",
      requestedDate: "10 Feb, 2025",
      overtimeDate: "12 Feb, 2025",
      duration: "2 hours",
      overtime: "Weekend work",
      reason:
         "Scheduled system maintenance and security updates that require downtime during off-peak hours. This includes database optimization, server patches, and implementing new security protocols to maintain compliance with industry standards and protect sensitive user data.",
      status: "approved",
   },
   {
      id: "3",
      requestedDate: "08 Feb, 2025",
      overtimeDate: "09 Feb, 2025",
      duration: "4 hours",
      overtime: "Late night shift",
      reason:
         "Emergency bug fixes required for the production environment after critical issues were discovered affecting the payment processing system. Immediate resolution is necessary to prevent revenue loss and maintain customer trust during peak transaction hours.",
      status: "completed",
   },
   {
      id: "4",
      requestedDate: "05 Feb, 2025",
      overtimeDate: "06 Feb, 2025",
      duration: "5 hours",
      overtime: "Saturday work",
      reason:
         "Preparation for special client meeting including the creation of detailed presentation materials, technical documentation, and proof-of-concept demonstrations. The client is a potential high-value partner requiring extensive customization proposals and timeline estimates.",
      status: "rejected",
   },
   {
      id: "5",
      requestedDate: "03 Feb, 2025",
      overtimeDate: "04 Feb, 2025",
      duration: "2.5 hours",
      overtime: "Extended hours",
      reason:
         "Comprehensive training session for new team members covering advanced development workflows, company coding standards, and internal tool usage. This onboarding is essential to ensure new hires can contribute effectively to ongoing projects.",
      status: "approved",
   },
   {
      id: "6",
      requestedDate: "01 Feb, 2025",
      overtimeDate: "02 Feb, 2025",
      duration: "3 hours",
      overtime: "After hours support",
      reason:
         "Dedicated client support session to resolve critical issues impacting their daily operations. The client reported system performance degradation and data synchronization problems requiring immediate investigation, troubleshooting, and implementation of temporary workarounds.",
      status: "completed",
   },
   {
      id: "7",
      requestedDate: "28 Jan, 2025",
      overtimeDate: "30 Jan, 2025",
      duration: "4 hours",
      overtime: "Weekend deployment",
      reason:
         "Major system upgrade deployment involving database migration, API updates, and frontend framework version upgrades. This requires careful coordination, extensive testing, and rollback preparation to minimize service disruption and ensure seamless transition for all users.",
      status: "completed",
   },
];
