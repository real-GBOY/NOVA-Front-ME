/** @format */

import {
   useListEmployees,
   useGetEmployeeById,
   useGetEmployeeDetails,
   useGetEmployeeContract,
   useGetEmployeeDocuments,
   useEmployeeDictionary,
} from "./employee.queries";

import {
   useAddAttendance,
   useAddHourLeave,
   useAddOvertime,
   useAddTimeOff,
   useDeleteEmployeeDocument,
   useExtendContract,
   useUploadEmployeeDocument,
} from "./employee.mutations";

export const useEmployee = () => {
   return {
      useListEmployees,
      useGetEmployeeById,
      useGetEmployeeDetails,
      useGetEmployeeContract,
      useGetEmployeeDocuments,
      useEmployeeDictionary,
      useAddAttendance,
      useAddOvertime,
      useAddTimeOff,
      useAddHourLeave,
      useExtendContract,
      useUploadEmployeeDocument,
      useDeleteEmployeeDocument,
      // Legacy names for backward compatibility
      useList: useListEmployees,
      useGetById: useGetEmployeeById,
      useGetByIdDetails: useGetEmployeeDetails,
   };
};

// Legacy export for backwards compatibility
export const useEmployees = () => {
   return {
      useList: useListEmployees,
      useGetById: useGetEmployeeById,
      useGetByIdDetails: useGetEmployeeDetails,
      useGetEmployeeContract,
      useGetEmployeeDocuments,
      useAddAttendance,
      useAddOvertime,
      useAddTimeOff,
      useAddHourLeave,
      useExtendContract,
      useUploadEmployeeDocument,
      useDeleteEmployeeDocument,
   };
};

// Export individual hooks for direct imports
export {
   useListEmployees,
   useGetEmployeeById,
   useGetEmployeeDetails,
   useGetEmployeeContract,
   useGetEmployeeDocuments,
   useEmployeeDictionary,
   useGetEmployeeStats,
} from "./employee.queries";

export {
   useAddAttendance,
   useAddHourLeave,
   useAddOvertime,
   useAddTimeOff,
   useDeleteEmployeeDocument,
   useExtendContract,
   useUploadEmployeeDocument,
} from "./employee.mutations";
