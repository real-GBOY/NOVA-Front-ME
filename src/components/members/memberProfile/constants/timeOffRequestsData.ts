/** @format */

import type { TimeOffRequest } from "../tabs/TimeManagmentTab/TimeOffRequestsTable";

export const timeOffRequestsData: TimeOffRequest[] = [
   {
      id: "1",
      startDate: "12 Feb, 2025",
      endDate: "18 Feb, 2025",
      timeOffType: "Sick Leave",
      reason: "Flu & doctor recommendation",
      attachment: {
         filename: "sick-leave-feb25.pdf",
         url: "#",
      },
      status: "pending",
   },
   {
      id: "2",
      startDate: "3 Jun, 2025",
      endDate: "5 Jun, 2025",
      timeOffType: "Emergency Leave",
      reason: "Family emergency",
      attachment: {
         filename: "emergency-leave-jun25.pdf",
         url: "#",
      },
      status: "pending",
   },
   {
      id: "3",
      startDate: "21 Aug, 2024",
      endDate: "29 Aug, 2024",
      timeOffType: "Annual Leave",
      reason: "Vacation",
      attachment: {
         filename: "annual-leave-aug24.pdf",
         url: "#",
      },
      status: "rejected",
   },
   {
      id: "4",
      startDate: "10 Oct, 2025",
      endDate: "12 Oct, 2025",
      timeOffType: "Annual Leave",
      reason: "Travel plan",
      attachment: {
         filename: "annual-leave-oct10.pdf",
         url: "#",
      },
      status: "completed",
   },
   {
      id: "5",
      startDate: "15 Apr, 2026",
      endDate: "22 Apr, 2026",
      timeOffType: "Sick Leave",
      reason: "Flu & doctor recommendation",
      attachment: {
         filename: "sick-leave-jul25.pdf",
         url: "#",
      },
      status: "completed",
   },
   {
      id: "6",
      startDate: "30 Apr, 2026",
      endDate: "16 Jul, 2026",
      timeOffType: "Unpaid Leave",
      reason: "Personal matters",
      attachment: {
         filename: "unpaid-leave-may25.pdf",
         url: "#",
      },
      status: "rejected",
   },
   {
      id: "7",
      startDate: "19 Sep, 2029",
      endDate: "2 Mar, 2023",
      timeOffType: "Sick Leave",
      reason: "High fever",
      attachment: {
         filename: "sick-leave-jul25.pdf",
         url: "#",
      },
      status: "approved",
   },
   {
      id: "8",
      startDate: "5 Feb, 2022",
      endDate: "10 Sep, 2029",
      timeOffType: "Sick Leave",
      reason: "High fever",
      attachment: {
         filename: "sick-leave-jul25.pdf",
         url: "#",
      },
      status: "approved",
   },
   {
      id: "9",
      startDate: "27 Dec, 2025",
      endDate: "18 Jan, 2024",
      timeOffType: "Sick Leave",
      reason: "High fever",
      attachment: {
         filename: "sick-leave-jul25.pdf",
         url: "#",
      },
      status: "approved",
   },
   {
      id: "10",
      startDate: "14 Oct, 2023",
      endDate: "7 Apr, 2025",
      timeOffType: "Sick Leave",
      reason: "High fever",
      attachment: {
         filename: "sick-leave-jul25.pdf",
         url: "#",
      },
      status: "approved",
   },
];
