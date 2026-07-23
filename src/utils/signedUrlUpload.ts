/** @format */

import type { AxiosProgressEvent } from "axios";
import apiClient from "@/config/axios";

// ========== TYPE DEFINITIONS ==========

/**
 * Request payload for obtaining a signed upload URL from the backend
 */
export interface UploadTokenRequest {
  contentType: string;
  purpose?: string;
  maxSizeBytes?: number;
  ttlMinutes?: number;
  originalFilename?: string;
}

/**
 * Response from the backend containing the signed URL and metadata
 */
export interface UploadTokenResponse {
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

/**
 * Options for configuring the file upload
 */
export interface UploadOptions {
  purpose?: string;
  maxSizeBytes?: number;
  ttlMinutes?: number;
  onProgress?: (progress: number) => void;
}

/**
 * Result returned after successful upload
 */
export interface UploadResult {
  fileId: number;
  token: string;
  key: string;
  fileUrl: string;
  purpose: string;
}

// ========== CONFIGURATION ==========

/**
 * Configuration for the signed URL upload service
 * You should customize this based on your backend endpoint
 */
export interface SignedUrlUploadConfig {
  /**
   * Your API client instance (e.g., axios instance with interceptors)
   * Should have a `post` method that accepts (url, data) and returns a Promise
   */
  apiClient: {
    post: <T = any>(url: string, data?: any) => Promise<{ data: T }>;
  };
  /**
   * The backend endpoint URL for requesting signed URLs
   * Example: "/api/v1/uploads/signed-url"
   */
  signedUrlEndpoint: string;
}

// ========== STANDALONE UPLOAD FUNCTION ==========

/**
 * Upload a file using the signed URL two-step process:
 * 1. Request a signed URL from your backend
 * 2. PUT the file directly to S3 (or your cloud storage)
 *
 * @param file - The file to upload
 * @param config - Configuration containing API client and endpoint
 * @param options - Upload options (purpose, size limits, progress callback)
 * @returns Promise with upload result containing fileId, token, and fileUrl
 *
 * @example
 * ```typescript
 * import axios from 'axios';
 * import { uploadFileWithSignedUrl } from './signedUrlUpload';
 *
 * const apiClient = axios.create({
 *   baseURL: 'https://api.example.com',
 *   headers: { 'Authorization': 'Bearer token' }
 * });
 *
 * const file = document.querySelector('input[type="file"]').files[0];
 *
 * try {
 *   const result = await uploadFileWithSignedUrl(
 *     file,
 *     {
 *       apiClient,
 *       signedUrlEndpoint: '/api/v1/uploads/signed-url'
 *     },
 *     {
 *       purpose: 'employee_profile',
 *       onProgress: (progress) => progress
 *     }
 *   );
 *   console.info('Uploaded to:', result.fileUrl);
 * } catch (error) {
 *   console.error('Upload failed:', error);
 * }
 * ```
 */
export async function uploadFileWithSignedUrl(
  file: File,
  config: SignedUrlUploadConfig,
  options: UploadOptions = {}
): Promise<UploadResult> {
  // Step 1: Request upload token and pre-signed URL from backend
  const requestBody: UploadTokenRequest = {
    contentType: file.type,
    purpose: options.purpose || "general",
    originalFilename: file.name,
    ...(options.maxSizeBytes && { maxSizeBytes: options.maxSizeBytes }),
    ...(options.ttlMinutes && { ttlMinutes: options.ttlMinutes }),
  };

  const tokenResponse = await config.apiClient.post<UploadTokenResponse>(
    config.signedUrlEndpoint,
    requestBody
  );

  const { fileId, token, uploadURL, key, fileUrl, purpose } =
    tokenResponse.data;

  // Step 2: PUT the file directly to S3 using the pre-signed URL
  await apiClient.put(uploadURL, file, {
    headers: {
      "Content-Type": file.type,
      // Prevent overwriting existing files
      "If-None-Match": "*",
    },
    skipAuth: true,
    timeHandling: { enabled: false },
    onUploadProgress: (progressEvent: AxiosProgressEvent) => {
      if (progressEvent.total && options.onProgress) {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        options.onProgress(percentCompleted);
      }
    },
  });

  // Return the upload result with metadata
  return {
    fileId,
    token,
    key,
    fileUrl,
    purpose,
  };
}

// ========== CLASS-BASED ALTERNATIVE ==========

/**
 * Class-based file uploader with state management
 * Use this if you need to track upload state across multiple operations
 *
 * @example
 * ```typescript
 * const uploader = new SignedUrlUploader({
 *   apiClient,
 *   signedUrlEndpoint: '/api/v1/uploads/signed-url'
 * });
 *
 * uploader.on('progress', (progress) => {
 *   console.info(`Upload progress: ${progress}%`);
 * });
 *
 * uploader.on('complete', (result) => {
 *   console.info('Upload complete:', result.fileUrl);
 * });
 *
 * uploader.on('error', (error) => {
 *   console.error('Upload error:', error);
 * });
 *
 * await uploader.upload(file, { purpose: 'employee_profile' });
 * ```
 */
export class SignedUrlUploader {
  private config: SignedUrlUploadConfig;
  private listeners: Map<string, Set<(...args: unknown[]) => void>> = new Map();
  public isUploading: boolean = false;
  public progress: number = 0;
  public error: Error | null = null;

  constructor(config: SignedUrlUploadConfig) {
    this.config = config;
  }

  /**
   * Register an event listener
   */
  on(event: "progress" | "complete" | "error", callback: (...args: unknown[]) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  /**
   * Remove an event listener
   */
  off(event: "progress" | "complete" | "error", callback: (...args: unknown[]) => void): void {
    this.listeners.get(event)?.delete(callback);
  }

  /**
   * Emit an event to all registered listeners
   */
  private emit(event: string, ...args: unknown[]): void {
    this.listeners.get(event)?.forEach((callback) => callback(...args));
  }

  /**
   * Upload a file
   */
  async upload(
    file: File,
    options: UploadOptions = {}
  ): Promise<UploadResult> {
    this.isUploading = true;
    this.progress = 0;
    this.error = null;

    try {
      const result = await uploadFileWithSignedUrl(
        file,
        this.config,
        {
          ...options,
          onProgress: (progress) => {
            this.progress = progress;
            this.emit("progress", progress);
            options.onProgress?.(progress);
          },
        }
      );

      this.isUploading = false;
      this.progress = 100;
      this.emit("complete", result);
      return result;
    } catch (error) {
      this.isUploading = false;
      this.progress = 0;
      this.error = error as Error;
      this.emit("error", error);
      throw error;
    }
  }

  /**
   * Reset the uploader state
   */
  reset(): void {
    this.isUploading = false;
    this.progress = 0;
    this.error = null;
  }
}

// ========== HELPER UTILITIES ==========

/**
 * Validate file before upload
 */
export function validateFile(
  file: File,
  options: {
    maxSizeBytes?: number;
    allowedTypes?: string[];
  } = {}
): { valid: boolean; error?: string } {
  if (options.maxSizeBytes && file.size > options.maxSizeBytes) {
    return {
      valid: false,
      error: `File size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds maximum allowed size (${(options.maxSizeBytes / 1024 / 1024).toFixed(2)}MB)`,
    };
  }

  if (options.allowedTypes && !options.allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type ${file.type} is not allowed. Allowed types: ${options.allowedTypes.join(", ")}`,
    };
  }

  return { valid: true };
}

/**
 * Read file as Data URL (base64)
 * Useful for showing preview before upload
 */
export function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Format file size in human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}
