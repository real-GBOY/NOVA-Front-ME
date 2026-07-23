/** @format */

import { useListContracts, useGetContractById } from "./contract.queries";

import {
   useCreateContract,
   useUpdateContract,
   useDeleteContract,
   useEndContract,
} from "./contract.mutations";

export const useContracts = () => {
   return {
      // New names (matching roles pattern)
      useListContracts,
      useGetContractById,
      useCreateContract,
      useUpdateContract,
      useDeleteContract,
      useEndContract,
      // Legacy names for backward compatibility
      useList: useListContracts,
      useGetById: useGetContractById,
      useCreate: useCreateContract,
      useUpdate: useUpdateContract,
      useDelete: useDeleteContract,
      useEnd: useEndContract,
      useTerminate: useEndContract, // Alias for backward compatibility
   };
};

// Export individual hooks for direct imports
export { useListContracts, useGetContractById } from "./contract.queries";

export {
   useCreateContract,
   useUpdateContract,
   useDeleteContract,
   useEndContract,
} from "./contract.mutations";
