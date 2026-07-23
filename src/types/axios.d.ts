/** @format */

import "axios";
import type { TimeTransformOptions } from "@/utilities/timeTransform";

declare module "axios" {
   export interface AxiosRequestConfig {
      skipAuth?: boolean;
      timeHandling?: {
         enabled?: boolean;
         dateOnlyMode?: TimeTransformOptions["dateOnlyMode"];
         exactKeys?: string[];
         suffixes?: string[];
      };
   }

   export interface InternalAxiosRequestConfig {
      skipAuth?: boolean;
      timeHandling?: {
         enabled?: boolean;
         dateOnlyMode?: TimeTransformOptions["dateOnlyMode"];
         exactKeys?: string[];
         suffixes?: string[];
      };
   }
}
