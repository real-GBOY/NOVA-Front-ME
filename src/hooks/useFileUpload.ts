/** @format */

import { useEffect, useRef, useState } from "react";
import type { AxiosProgressEvent } from "axios";
import apiClient from "@/config/axios";
import endPoints from "@/config/endPoints";

// Types based on the instructions.md
interface UploadTokenRequest {
   contentType: string;
   purpose?: string;
   maxSizeBytes?: number;
   ttlMinutes?: number;
   originalFilename?: string;
}

interface UploadTokenResponse {
   fileId: number;
   token: string;
   uploadURL: string;
   key: string;
   bucketUrl: string;
   fileUrl: string;
   expiresAt: string;
   purpose: string;
   maxSizeBytes: number;
   singleUse: boolean;
}

interface UploadOptions {
   purpose?: string;
   maxSizeBytes?: number;
   ttlMinutes?: number;
   retries?: number;
   retryDelayMs?: number;
   onProgress?: (progress: number) => void;
}

interface UploadResult {
   fileId: number;
   token: string;
   key: string;
   fileUrl: string;
   purpose: string;
}

interface UploadState {
   isUploading: boolean;
   progress: number;
   error: string | null;
   status: "idle" | "requesting" | "uploading" | "success" | "error" | "cancelled";
}

const DEFAULT_RETRIES = 2;
const DEFAULT_RETRY_DELAY_MS = 500;

/**
 * Custom hook for uploading files directly to S3 using pre-signed URLs
 *
 * @example
 * ```tsx
 * const { uploadFile, isUploading, progress, error } = useFileUpload();
 *
 * const handleFileSelect = async (file: File) => {
 *   try {
 *     const result = await uploadFile(file, {
 *       purpose: "employee_profile",
 *       onProgress: (progress) => progress
 *     });
 *     console.info("File uploaded:", result.fileUrl);
 *   } catch (err) {
 *     console.error("Upload failed:", err);
 *   }
 * };
 * ```
 */
export const useFileUpload = () => {
   const currentAbortControllerRef = useRef<AbortController | null>(null);
   const [state, setState] = useState<UploadState>({
      isUploading: false,
      progress: 0,
      error: null,
      status: "idle",
   });

   const cancelUpload = () => {
      if (currentAbortControllerRef.current) {
         currentAbortControllerRef.current.abort();
         currentAbortControllerRef.current = null;
      }
   };

   useEffect(() => () => cancelUpload(), []);

   const isCanceledError = (error: unknown): boolean =>
      typeof error === "object" &&
      error !== null &&
      (error as { code?: string; name?: string }).code === "ERR_CANCELED";

   const isRetriableUploadError = (error: unknown): boolean => {
      if (typeof error !== "object" || !error) {
         return false;
      }
      const status = (error as { response?: { status?: number } }).response?.status;
      if (!status) return true;
      return status >= 500 || status === 429 || status === 408;
   };

   const wait = async (ms: number) =>
      new Promise<void>((resolve) => {
         setTimeout(resolve, ms);
      });

   /**
    * Upload a file to S3 using the two-step process:
    * 1. Request a signed URL from the backend
    * 2. PUT the file directly to S3
    */
   const uploadFile = async (
      file: File,
      options: UploadOptions = {}
   ): Promise<UploadResult> => {
      cancelUpload();
      const abortController = new AbortController();
      currentAbortControllerRef.current = abortController;
      setState({
         isUploading: true,
         progress: 0,
         error: null,
         status: "requesting",
      });

      try {
         // Step 1: Request upload token and pre-signed URL
         const requestBody: UploadTokenRequest = {
            contentType: file.type,
            purpose: options.purpose || "general",
            originalFilename: file.name,
            ...(options.maxSizeBytes && { maxSizeBytes: options.maxSizeBytes }),
            ...(options.ttlMinutes && { ttlMinutes: options.ttlMinutes }),
         };

         const tokenResponse = await apiClient.post<UploadTokenResponse>(
            endPoints.uploads.getSignedUrl,
            requestBody,
            {
               signal: abortController.signal,
            },
         );

         const { fileId, token, uploadURL, key, fileUrl, purpose } =
            tokenResponse.data;

         // Step 2: PUT the file to S3 using the pre-signed URL with retries
         setState((prev) => ({ ...prev, status: "uploading" }));
         const maxAttempts = Math.max(1, (options.retries ?? DEFAULT_RETRIES) + 1);
         const retryDelayMs = Math.max(0, options.retryDelayMs ?? DEFAULT_RETRY_DELAY_MS);
         let lastError: unknown;

         for (let attempt = 0; attempt < maxAttempts; attempt++) {
            try {
               await apiClient.put(uploadURL, file, {
                  headers: {
                     "Content-Type": file.type,
                     "If-None-Match": "*",
                  },
                  skipAuth: true,
                  timeHandling: { enabled: false },
                  signal: abortController.signal,
                  onUploadProgress: (progressEvent: AxiosProgressEvent) => {
                     if (progressEvent.total) {
                        const percentCompleted = Math.round(
                           (progressEvent.loaded * 100) / progressEvent.total,
                        );
                        setState((prev) => ({
                           ...prev,
                           progress: percentCompleted,
                           status: "uploading",
                        }));
                        options.onProgress?.(percentCompleted);
                     }
                  },
               });
               lastError = undefined;
               break;
            } catch (error) {
               if (isCanceledError(error)) {
                  throw error;
               }
               lastError = error;
               const shouldRetry =
                  attempt < maxAttempts - 1 && isRetriableUploadError(error);
               if (!shouldRetry) {
                  throw error;
               }
               await wait(retryDelayMs * Math.pow(2, attempt));
            }
         }

         if (lastError) {
            throw lastError;
         }

         // Upload successful
         setState({
            isUploading: false,
            progress: 100,
            error: null,
            status: "success",
         });

         return {
            fileId,
            token,
            key,
            fileUrl,
            purpose,
         };
      } catch (error) {
         if (isCanceledError(error)) {
            setState({
               isUploading: false,
               progress: 0,
               error: null,
               status: "cancelled",
            });
            throw error;
         }
         const errorMessage =
            error instanceof Error ? error.message : "Upload failed";
         setState({
            isUploading: false,
            progress: 0,
            error: errorMessage,
            status: "error",
         });
         throw error;
      } finally {
         if (currentAbortControllerRef.current === abortController) {
            currentAbortControllerRef.current = null;
         }
      }
   };

   /**
    * Reset the upload state
    */
   const reset = () => {
      cancelUpload();
      setState({ isUploading: false, progress: 0, error: null, status: "idle" });
   };

   return {
      uploadFile,
      cancelUpload,
      isUploading: state.isUploading,
      progress: state.progress,
      error: state.error,
      status: state.status,
      reset,
   };
};

export default useFileUpload;
