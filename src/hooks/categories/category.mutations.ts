/** @format */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { reactQueryKeys } from "../../config/reactQueryKeys";
import {
   categoryService,
   type CreateCategoryRequest,
   type UpdateCategoryRequest,
} from "../../services/categoryService";

const categoryKeys = reactQueryKeys.categories;

export const useCreateCategory = () => {
   const queryClient = useQueryClient();
   return useMutation({
      mutationFn: (payload: CreateCategoryRequest) =>
         categoryService.create(payload),
      onSuccess: () => {
         // Invalidate all categories queries to ensure fresh data
         queryClient.invalidateQueries({ queryKey: categoryKeys.all });
         // Also invalidate services since they depend on categories
         queryClient.invalidateQueries({ queryKey: ["services"] });
      },
   });
};

export const useUpdateCategory = () => {
   const queryClient = useQueryClient();
   return useMutation({
      mutationFn: ({
         id,
         payload,
      }: {
         id: string | number;
         payload: UpdateCategoryRequest;
      }) => categoryService.update(id, payload),
      onSuccess: (_, { id }) => {
         // Invalidate all categories queries
         queryClient.invalidateQueries({ queryKey: categoryKeys.all });
         // Invalidate the specific category detail
         queryClient.invalidateQueries({ queryKey: categoryKeys.detail(id) });
         // Also invalidate services since they depend on categories
         queryClient.invalidateQueries({ queryKey: ["services"] });
      },
   });
};

export const useDeleteCategory = () => {
   const queryClient = useQueryClient();
   return useMutation({
      mutationFn: (id: string | number) => categoryService.delete(id),
      onSuccess: () => {
         // Invalidate all categories queries
         queryClient.invalidateQueries({ queryKey: categoryKeys.all });
         // Also invalidate services since they depend on categories
         queryClient.invalidateQueries({ queryKey: ["services"] });
      },
   });
};
