/** @format */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { reactQueryKeys } from "../../config/reactQueryKeys";
import {
   departmentService,
   type CreateDepartmentRequest,
   type UpdateDepartmentRequest,
} from "../../services/departmentService";

const departmentKeys = reactQueryKeys.departments;

export const useCreateDepartment = () => {
   const queryClient = useQueryClient();
   return useMutation({
      mutationFn: (payload: CreateDepartmentRequest) =>
         departmentService.create(payload),
      onSuccess: () => {
         // Invalidate all departments queries to ensure fresh data
         queryClient.invalidateQueries({ queryKey: departmentKeys.all });
         // Also invalidate categories and services since they depend on departments
         queryClient.invalidateQueries({ queryKey: ["categories"] });
         queryClient.invalidateQueries({ queryKey: ["services"] });
      },
   });
};

export const useUpdateDepartment = () => {
   const queryClient = useQueryClient();
   return useMutation({
      mutationFn: ({
         id,
         payload,
      }: {
         id: string | number;
         payload: UpdateDepartmentRequest;
      }) => departmentService.update(id, payload),
      onSuccess: (_, { id }) => {
         // Invalidate all departments queries
         queryClient.invalidateQueries({ queryKey: departmentKeys.all });
         // Invalidate the specific department detail
         queryClient.invalidateQueries({ queryKey: departmentKeys.detail(id) });
         // Also invalidate categories and services since they depend on departments
         queryClient.invalidateQueries({ queryKey: ["categories"] });
         queryClient.invalidateQueries({ queryKey: ["services"] });
      },
   });
};

export const useDeleteDepartment = () => {
   const queryClient = useQueryClient();
   return useMutation({
      mutationFn: (id: string | number) => departmentService.delete(id),
      onSuccess: () => {
         // Invalidate all departments queries
         queryClient.invalidateQueries({ queryKey: departmentKeys.all });
         // Also invalidate categories and services since they depend on departments
         queryClient.invalidateQueries({ queryKey: ["categories"] });
         queryClient.invalidateQueries({ queryKey: ["services"] });
      },
   });
};
