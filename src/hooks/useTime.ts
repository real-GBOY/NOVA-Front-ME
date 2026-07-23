/** @format */

import { useMemo } from "react";
import {
   transformTimePayload,
   type TimeTransformOptions,
} from "@/utilities/timeTransform";

type UseTimeOptions = Omit<TimeTransformOptions, "direction">;

export const useTime = (options?: UseTimeOptions) => {
   const baseOptions = useMemo(
      () => ({
         dateOnlyMode: options?.dateOnlyMode ?? "keep",
         exactKeys: options?.exactKeys,
         suffixes: options?.suffixes,
      }),
      [options?.dateOnlyMode, options?.exactKeys, options?.suffixes]
   );

   return useMemo(
      () => ({
         toUtc<T>(payload: T) {
            return transformTimePayload(payload, {
               direction: "toUtc",
               ...baseOptions,
            });
         },
         toLocal<T>(payload: T) {
            return transformTimePayload(payload, {
               direction: "toLocal",
               ...baseOptions,
            });
         },
      }),
      [baseOptions]
   );
};

export default useTime;
