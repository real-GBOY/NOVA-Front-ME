export type ActivityType = 'late' | 'working' | 'break' | 'overtime' | 'absence' | 'earlyLeave' | 'dayOff' | 'requestedDayOff';

export interface TimeSlot {
   type: ActivityType;
   durationMinutes?: number; // Deprecated in favor of start/end time calculation
   label?: string; // Optional custom label override
   startTime?: string; // "HH:mm" 24-hour format
   endTime?: string;   // "HH:mm" 24-hour format
}

export interface DaySchedule {
   date: string;
   status?: string;
   isDayOff?: boolean;
   clockIn?: string;
   clockOut?: string;
   duration?: string;
   timeSlots: TimeSlot[];
}
