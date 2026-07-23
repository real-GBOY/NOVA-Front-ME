/** @format */

import { useListCategories, useGetCategoryById } from "./category.queries";

import {
   useCreateCategory,
   useUpdateCategory,
   useDeleteCategory,
} from "./category.mutations";

export const useCategory = () => {
   return {
      useListCategories,
      useGetCategoryById,
      useCreateCategory,
      useUpdateCategory,
      useDeleteCategory,
   };
};

// Export individual hooks for direct imports
export { useListCategories, useGetCategoryById } from "./category.queries";

export {
   useCreateCategory,
   useUpdateCategory,
   useDeleteCategory,
} from "./category.mutations";
