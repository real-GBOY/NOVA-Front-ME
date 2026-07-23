/** @format */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { reactQueryKeys } from "../../config/reactQueryKeys";
import {
   serviceService,
   type CreateServiceRequest,
   type UpdateServiceRequest,
} from "../../services/serviceService";

const serviceKeys = reactQueryKeys.services;

export const useCreateService = () => {
   const queryClient = useQueryClient();
   return useMutation({
      mutationFn: (payload: CreateServiceRequest) =>
         serviceService.create(payload),
      onSuccess: () => {
         // Invalidate all services queries to ensure fresh data
         queryClient.invalidateQueries({ queryKey: serviceKeys.all });
      },
   });
};

export const useUpdateService = () => {
   const queryClient = useQueryClient();
   return useMutation({
      mutationFn: ({
         id,
         payload,
      }: {
         id: string | number;
         payload: UpdateServiceRequest;
      }) => serviceService.update(id, payload),
      onSuccess: (_, { id }) => {
         // Invalidate all services queries
         queryClient.invalidateQueries({ queryKey: serviceKeys.all });
         // Invalidate the specific service detail
         queryClient.invalidateQueries({ queryKey: serviceKeys.detail(id) });
      },
   });
};

export const useDeleteService = () => {
   const queryClient = useQueryClient();
   return useMutation({
      mutationFn: (id: string | number) => serviceService.delete(id),
      onSuccess: () => {
         // Invalidate all services queries
         queryClient.invalidateQueries({ queryKey: serviceKeys.all });
      },
   });
};
