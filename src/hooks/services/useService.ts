/** @format */

import { useListServices, useGetServiceById } from "./service.queries";

import {
   useCreateService,
   useUpdateService,
   useDeleteService,
} from "./service.mutations";

export const useService = () => {
   return {
      useListServices,
      useGetServiceById,
      useCreateService,
      useUpdateService,
      useDeleteService,
   };
};

// Export individual hooks for direct imports
export { useListServices, useGetServiceById } from "./service.queries";

export {
   useCreateService,
   useUpdateService,
   useDeleteService,
} from "./service.mutations";
