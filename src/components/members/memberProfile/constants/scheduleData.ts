import { DaySchedule } from "../tabs/TimeManagmentTab/types";

export const scheduleData: DaySchedule[] = [
   {
      date: "Today - 26 Nov",
      status: "Approved Overtime Request",
      clockIn: "08:00",
      clockOut: "19:30",
      duration: "11.5 Hours",
      timeSlots: [
         { type: "late", startTime: "08:00", endTime: "08:30" },
         { type: "working", startTime: "08:30", endTime: "11:30" },
         { type: "break", startTime: "11:30", endTime: "12:30" },
         { type: "working", startTime: "12:30", endTime: "17:00" },
         { type: "overtime", startTime: "17:00", endTime: "18:00" },
      ],
   },
   {
      date: "Yesterday - 25 Nov",
      timeSlots: [
         { type: "absence", startTime: "08:00", endTime: "24:00", label: "Absence" },
      ],
   },
   {
      date: "Monday - 24 Nov",
      clockIn: "08:00",
      clockOut: "15:00",
      duration: "7 Hours",
      timeSlots: [
         { type: "working", startTime: "08:00", endTime: "12:00" },
         { type: "break", startTime: "12:00", endTime: "13:00" },
         { type: "working", startTime: "13:00", endTime: "15:00" },
         { type: "earlyLeave", startTime: "15:00", endTime: "17:00", label: "Early Leave" },
      ],
   },
   {
      date: "Sunday - 23 Nov",
      timeSlots: [
         { type: "dayOff", startTime: "08:00", endTime: "24:00", label: "Day off" },
      ],
   },
   {
      date: "Saturday - 22 Nov",
      timeSlots: [
         { type: "dayOff", startTime: "08:00", endTime: "24:00", label: "Day off" },
      ],
   },
   {
      date: "Friday - 21 Nov",
      status: "Approved Day Off",
      timeSlots: [
         { type: "requestedDayOff", startTime: "08:00", endTime: "24:00", label: "Requested day off" },
      ],
   },
];
