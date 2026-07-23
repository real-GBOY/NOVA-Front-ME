/** @format */

/**
 * QUICK START GUIDE - Copy this to your new repository
 * 
 * This file demonstrates how to use the signed URL upload utility
 * in a new project/repository.
 */

import apiClient from "@/config/axios";
import {
  uploadFileWithSignedUrl,
  validateFile,
  readFileAsDataURL,
} from "./signedUrlUpload";

// ========== STEP 1: Configure Your API Client ==========

/**
 * Create an axios instance with your backend configuration
 * Replace these values with your actual backend URL and auth method
 */
// Use the shared API client for this project.
// When copying to a new repo, replace this import with your own client.

// ========== STEP 2: Configure Upload Settings ==========

/**
 * Your backend endpoint for requesting signed URLs
 * This should match your backend route
 */
const SIGNED_URL_ENDPOINT = '/api/v1/uploads/signed-url';

/**
 * Upload configuration used across your app
 */
const UPLOAD_CONFIG = {
  apiClient,
  signedUrlEndpoint: SIGNED_URL_ENDPOINT,
};

// ========== STEP 3: Define Upload Purposes ==========

/**
 * Valid upload purposes for your application
 * These should match what your backend accepts
 */
export const UPLOAD_PURPOSES = {
  EMPLOYEE_PROFILE: 'employee_profile',
  EMPLOYEE_DOCUMENT: 'employee_document',
  COMPANY_LOGO: 'company_logo',
  OFFICE_LOCATION: 'office_location',
  SUPPORT_TICKET: 'support_ticket',
  ANNOUNCEMENT: 'announcement',
  GENERAL: 'general',
} as const;

/**
 * File size limits for different purposes (in bytes)
 */
const SIZE_LIMITS = {
  [UPLOAD_PURPOSES.EMPLOYEE_PROFILE]: 3 * 1024 * 1024, // 3MB
  [UPLOAD_PURPOSES.COMPANY_LOGO]: 2 * 1024 * 1024, // 2MB
  [UPLOAD_PURPOSES.EMPLOYEE_DOCUMENT]: 10 * 1024 * 1024, // 10MB
  [UPLOAD_PURPOSES.GENERAL]: 5 * 1024 * 1024, // 5MB
};

/**
 * Allowed file types for different purposes
 */
const ALLOWED_TYPES = {
  images: ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'],
  documents: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  all: ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'],
};

// ========== STEP 4: Create Helper Functions ==========

/**
 * Main function to upload a file with validation
 * Use this throughout your application
 */
export async function uploadFile(
  file: File,
  purpose: string = UPLOAD_PURPOSES.GENERAL,
  options: {
    onProgress?: (progress: number) => void;
    allowedTypes?: string[];
  } = {}
) {
  // Validate file size
  const maxSize = SIZE_LIMITS[purpose as keyof typeof SIZE_LIMITS] || SIZE_LIMITS[UPLOAD_PURPOSES.GENERAL];
  const validation = validateFile(file, {
    maxSizeBytes: maxSize,
    allowedTypes: options.allowedTypes,
  });

  if (!validation.valid) {
    throw new Error(validation.error);
  }

  // Upload the file
  return uploadFileWithSignedUrl(
    file,
    UPLOAD_CONFIG,
    {
      purpose,
      maxSizeBytes: maxSize,
      onProgress: options.onProgress,
    }
  );
}

/**
 * Upload an image with preview
 * Returns both the data URL (for preview) and upload result
 */
export async function uploadImage(
  file: File,
  purpose: string = UPLOAD_PURPOSES.GENERAL,
  onProgress?: (progress: number) => void
) {
  // Validate it's an image
  const validation = validateFile(file, {
    allowedTypes: ALLOWED_TYPES.images,
  });

  if (!validation.valid) {
    throw new Error(validation.error);
  }

  // Get preview
  const previewUrl = await readFileAsDataURL(file);

  // Upload
  const result = await uploadFile(file, purpose, { 
    onProgress,
    allowedTypes: ALLOWED_TYPES.images 
  });

  return {
    previewUrl,
    ...result,
  };
}

// ========== STEP 5: Usage Examples ==========

/**
 * Example 1: Simple file upload
 */
export async function example1_SimpleUpload(file: File) {
  try {
    const result = await uploadFile(file, UPLOAD_PURPOSES.EMPLOYEE_PROFILE, {
      onProgress: () => { }
    });

    // Save fileId and token to your database/state
    // You'll need these to reference the file later
    return result;
  } catch (error) {
    console.error('Upload failed:', error);
    throw error;
  }
}

/**
 * Example 2: Upload with preview (for images)
 */
export async function example2_ImageUploadWithPreview(file: File) {
  try {
    const result = await uploadImage(
      file,
      UPLOAD_PURPOSES.COMPANY_LOGO,
      () => {
        // Update your UI progress bar here
      }
    );

    return result;
  } catch (error) {
    console.error('Upload failed:', error);
    throw error;
  }
}

/**
 * Example 3: Form submission with file upload
 */
export async function example3_FormWithFileUpload(formData: {
  name: string;
  email: string;
  profilePicture: File | null;
}) {
  // Upload the file first
  let uploadResult = null;
  if (formData.profilePicture) {
    uploadResult = await uploadFile(
      formData.profilePicture,
      UPLOAD_PURPOSES.EMPLOYEE_PROFILE
    );
  }

  // Submit the form with file reference
  const response = await apiClient.post('/api/v1/employees', {
    name: formData.name,
    email: formData.email,
    // Send fileId and token to your backend
    profilePicture: uploadResult ? {
      fileId: uploadResult.fileId,
      token: uploadResult.token,
    } : null,
  });

  return response.data;
}

/**
 * Example 4: Handle file input change
 */
export function example4_FileInputHandler() {
  const handleFileChange = async (event: Event) => {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    try {

      await uploadFile(file, UPLOAD_PURPOSES.GENERAL, {
        onProgress: () => {
          // Update progress bar in UI
        }
      });

      // Clear the input
      input.value = '';
    } catch (error) {
      // Show error state
      console.error('Upload failed:', error);
      alert('Upload failed. Please try again.');
    }
  };

  return handleFileChange;
}

// ========== STEP 6: React Hook Example ==========

/**
 * Example 5: React Hook for file upload
 * Copy this to your React project
 */
/*
import { useState, useCallback } from 'react';

export function useFileUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const upload = useCallback(async (file: File, purpose: string = 'general') => {
    setIsUploading(true);
    setProgress(0);
    setError(null);

    try {
      const result = await uploadFile(file, purpose, {
        onProgress: (p) => setProgress(p)
      });

      setIsUploading(false);
      return result;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Upload failed';
      setError(errorMsg);
      setIsUploading(false);
      throw err;
    }
  }, []);

  const reset = useCallback(() => {
    setIsUploading(false);
    setProgress(0);
    setError(null);
  }, []);

  return {
    upload,
    isUploading,
    progress,
    error,
    reset
  };
}

// Usage in component:
function MyComponent() {
  const { upload, isUploading, progress } = useFileUpload();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const result = await upload(file, 'employee_profile');
    } catch (error) {
      console.error('Upload failed');
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFileSelect} disabled={isUploading} />
      {isUploading && <div>Progress: {progress}%</div>}
    </div>
  );
}
*/

// ========== STEP 7: Display Uploaded Files ==========

/**
 * Helper to construct full URLs for uploaded files
 * Use this when displaying previously uploaded files
 */
export function getFileUrl(fileUrl: string, baseUrl?: string): string {
  // If it's already a full URL, return as is
  if (fileUrl.startsWith('http')) return fileUrl;

  // If it's a relative path, prepend your CDN/storage URL
  const base = baseUrl || 'https://your-cdn.example.com';
  return fileUrl.startsWith('/') ? `${base}${fileUrl}` : `${base}/${fileUrl}`;
}

/**
 * Example: Display uploaded image
 */
export function example6_DisplayUploadedImage(fileUrl: string) {
  const fullUrl = getFileUrl(fileUrl);
  return `<img src="${fullUrl}" alt="Uploaded file" />`;
}

// ========== NOTES ==========

/**
 * IMPORTANT NOTES FOR NEW REPOSITORY:
 * 
 * 1. Install axios: npm install axios
 * 
 * 2. Copy these files to your new repo:
 *    - signedUrlUpload.ts (the main utility)
 *    - This file (as quickstart.ts or integration example)
 * 
 * 3. Update the configuration:
 *    - UPLOAD_CONFIG with your backend URL
 *    - UPLOAD_PURPOSES with your app's purposes
 *    - SIZE_LIMITS based on your requirements
 * 
 * 4. Backend requirements:
 *    - Implement POST /api/v1/uploads/signed-url endpoint
 *    - Return signed URL and metadata (see README for details)
 *    - Validate file types and sizes on backend too
 * 
 * 5. Security:
 *    - Always validate files on backend
 *    - Use short TTL for signed URLs (60 minutes)
 *    - Implement proper authentication
 *    - Scan uploaded files for malware
 * 
 * 6. When saving to database:
 *    - Store both fileId and token
 *    - You'll need both to reference the file later
 *    - Example: { fileId: 123, token: "abc123" }
 */

export default {
  uploadFile,
  uploadImage,
  UPLOAD_PURPOSES,
  getFileUrl,
};
