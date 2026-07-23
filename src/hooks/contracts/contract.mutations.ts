/** @format */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { reactQueryKeys } from "../../config/reactQueryKeys";
import {
   contractService,
   type CreateContractRequest,
} from "../../services/contractService";

const contractKeys = reactQueryKeys.contracts;

// POST - Create contract
export const useCreateContract = () => {
   const queryClient = useQueryClient();
   return useMutation({
      mutationKey: contractKeys.create(),
      mutationFn: (payload: CreateContractRequest) =>
         contractService.create(payload),
      onSuccess: () => {
         // Invalidate and refetch contracts list
         queryClient.invalidateQueries({
            queryKey: contractKeys.lists(),
         });
      },
      onError: (error) => {
         console.error("Error creating contract:", error);
      },
   });
};

// PATCH - Update contract
export const useUpdateContract = () => {
   const queryClient = useQueryClient();
   return useMutation({
      mutationKey: contractKeys.update(),
      mutationFn: ({
         id,
         payload,
      }: {
         id: string | number;
         payload: Partial<CreateContractRequest>;
      }) => contractService.update(id, payload),
      onSuccess: (_, variables) => {
         // Invalidate contract detail and list
         queryClient.invalidateQueries({
            queryKey: contractKeys.detail(variables.id),
         });
         queryClient.invalidateQueries({
            queryKey: contractKeys.lists(),
         });
      },
   });
};

// DELETE - Delete contract
export const useDeleteContract = () => {
   const queryClient = useQueryClient();
   return useMutation({
      mutationKey: contractKeys.delete(),
      mutationFn: (id: string | number) => contractService.delete(id),
      onSuccess: () => {
         // Invalidate contracts list
         queryClient.invalidateQueries({
            queryKey: contractKeys.lists(),
         });
      },
   });
};

// PATCH - End contract
export const useEndContract = () => {
   const queryClient = useQueryClient();
   return useMutation({
      mutationKey: contractKeys.end(),
      mutationFn: ({
         id,
         payload,
      }: {
         id: string | number;
         payload: {
            reason: string;
            termination_date: string;
         };
      }) => contractService.end(id, payload),
      onSuccess: (_, variables) => {
         // Invalidate contract detail and list
         queryClient.invalidateQueries({
            queryKey: contractKeys.detail(variables.id),
         });
         queryClient.invalidateQueries({
            queryKey: contractKeys.lists(),
         });
      },
   });
};
