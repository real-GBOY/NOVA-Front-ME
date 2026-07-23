/** @format */

import { useListDepartments, useGetDepartmentById } from "./department.queries";

import {
   useCreateDepartment,
   useUpdateDepartment,
   useDeleteDepartment,
} from "./department.mutations";

export const useDepartment = () => {
   return {
      useListDepartments,
      useGetDepartmentById,
      useCreateDepartment,
      useUpdateDepartment,
      useDeleteDepartment,
   };
};

// Export individual hooks for direct imports
export { useListDepartments, useGetDepartmentById } from "./department.queries";

export {
   useCreateDepartment,
   useUpdateDepartment,
   useDeleteDepartment,
} from "./department.mutations";
