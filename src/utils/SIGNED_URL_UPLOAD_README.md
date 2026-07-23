# Signed URL Upload Utility

A standalone, reusable file upload utility that implements the two-step signed URL upload pattern for secure direct-to-cloud-storage uploads.

## Overview

This utility provides a secure way to upload files directly to cloud storage (S3, GCS, etc.) using pre-signed URLs, avoiding the need to proxy large files through your backend server.

### How It Works

1. **Request Signed URL**: Your frontend requests a signed upload URL from your backend
2. **Direct Upload**: The file is uploaded directly to cloud storage using the signed URL
3. **Return Metadata**: After successful upload, you receive file metadata (fileId, token, URL)

### Benefits

- ✅ **Secure**: Backend controls which files can be uploaded
- ✅ **Fast**: Direct upload to cloud storage, no backend proxy
- ✅ **Scalable**: Backend doesn't handle file transfer
- ✅ **Progress Tracking**: Built-in upload progress monitoring
- ✅ **Type Safe**: Full TypeScript support

## Installation

### Dependencies

```bash
npm install axios
# or
yarn add axios
# or
pnpm add axios
```

### Copy the Utility

Copy `signedUrlUpload.ts` to your project's utility folder.

## Usage

### 1. Function-Based Approach (Simple)

Use this for one-off uploads where you don't need state management.

```typescript
import axios from 'axios';
import { uploadFileWithSignedUrl } from './utils/signedUrlUpload';

// Configure your API client
const apiClient = axios.create({
  baseURL: 'https://api.example.com',
  headers: {
    'Authorization': `Bearer ${yourAuthToken}`
  }
});

// Upload a file
const handleFileUpload = async (file: File) => {
  try {
    const result = await uploadFileWithSignedUrl(
      file,
      {
        apiClient,
        signedUrlEndpoint: '/api/v1/uploads/signed-url'
      },
      {
        purpose: 'employee_profile',
        maxSizeBytes: 5 * 1024 * 1024, // 5MB limit
        onProgress: (progress) => {
          console.log(`Upload progress: ${progress}%`);
        }
      }
    );

    console.log('Upload successful!');
    console.log('File ID:', result.fileId);
    console.log('Token:', result.token);
    console.log('File URL:', result.fileUrl);
  } catch (error) {
    console.error('Upload failed:', error);
  }
};
```

### 2. Class-Based Approach (Advanced)

Use this when you need to track upload state or handle multiple uploads.

```typescript
import { SignedUrlUploader } from './utils/signedUrlUpload';

// Create an uploader instance
const uploader = new SignedUrlUploader({
  apiClient,
  signedUrlEndpoint: '/api/v1/uploads/signed-url'
});

// Set up event listeners
uploader.on('progress', (progress) => {
  console.log(`Upload progress: ${progress}%`);
  updateProgressBar(progress);
});

uploader.on('complete', (result) => {
  console.log('Upload complete:', result);
  showSuccessMessage();
});

uploader.on('error', (error) => {
  console.error('Upload failed:', error);
  showErrorMessage(error.message);
});

// Upload a file
await uploader.upload(file, {
  purpose: 'employee_profile'
});

// Check state at any time
if (uploader.isUploading) {
  console.log(`Current progress: ${uploader.progress}%`);
}
```

### 3. React Hook Example

Integrate with React using a custom hook:

```typescript
import { useState, useCallback } from 'react';
import { uploadFileWithSignedUrl, UploadResult } from './utils/signedUrlUpload';
import apiClient from './config/axios';

export const useFileUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = useCallback(async (
    file: File,
    purpose: string = 'general'
  ): Promise<UploadResult | null> => {
    setIsUploading(true);
    setProgress(0);
    setError(null);

    try {
      const result = await uploadFileWithSignedUrl(
        file,
        {
          apiClient,
          signedUrlEndpoint: '/api/v1/uploads/signed-url'
        },
        {
          purpose,
          onProgress: (p) => setProgress(p)
        }
      );

      setIsUploading(false);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      setError(errorMessage);
      setIsUploading(false);
      return null;
    }
  }, []);

  return {
    uploadFile,
    isUploading,
    progress,
    error
  };
};

// Usage in component
function UploadComponent() {
  const { uploadFile, isUploading, progress } = useFileUpload();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const result = await uploadFile(file, 'employee_profile');
    if (result) {
      console.log('Uploaded:', result.fileUrl);
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFileSelect} disabled={isUploading} />
      {isUploading && <div>Progress: {progress}%</div>}
    </div>
  );
}
```

## Helper Utilities

### Validate File

Validate file before uploading:

```typescript
import { validateFile } from './utils/signedUrlUpload';

const validation = validateFile(file, {
  maxSizeBytes: 10 * 1024 * 1024, // 10MB
  allowedTypes: ['image/png', 'image/jpeg', 'application/pdf']
});

if (!validation.valid) {
  alert(validation.error);
  return;
}
```

### Read File as Data URL

Show preview before upload:

```typescript
import { readFileAsDataURL } from './utils/signedUrlUpload';

const dataURL = await readFileAsDataURL(file);
imageElement.src = dataURL;
```

### Format File Size

Display human-readable file sizes:

```typescript
import { formatFileSize } from './utils/signedUrlUpload';

console.log(formatFileSize(1024)); // "1 KB"
console.log(formatFileSize(1536000)); // "1.46 MB"
```

## Backend Integration

Your backend needs to implement the signed URL endpoint. Here's what the request/response should look like:

### Request

```typescript
POST /api/v1/uploads/signed-url
Content-Type: application/json

{
  "contentType": "image/png",
  "purpose": "employee_profile",
  "originalFilename": "photo.png",
  "maxSizeBytes": 5242880,
  "ttlMinutes": 60
}
```

### Response

```typescript
{
  "fileId": 123,
  "token": "abc123xyz",
  "uploadURL": "https://s3.amazonaws.com/bucket/path?signature=...",
  "key": "uploads/2024/01/abc123.png",
  "bucketUrl": "https://s3.amazonaws.com/bucket",
  "fileUrl": "https://cdn.example.com/uploads/2024/01/abc123.png",
  "expiresAt": "2024-01-15T12:00:00Z",
  "purpose": "employee_profile",
  "maxSizeBytes": 5242880,
  "singleUse": true
}
```

### Example Backend Implementation (Node.js)

```typescript
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

app.post('/api/v1/uploads/signed-url', async (req, res) => {
  const { contentType, purpose, originalFilename, maxSizeBytes, ttlMinutes } = req.body;

  // Generate unique file key
  const fileId = generateUniqueId();
  const token = generateSecureToken();
  const key = `uploads/${new Date().getFullYear()}/${Date.now()}-${originalFilename}`;

  // Create S3 presigned URL
  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: key,
    ContentType: contentType,
  });

  const uploadURL = await getSignedUrl(s3Client, command, {
    expiresIn: (ttlMinutes || 60) * 60
  });

  res.json({
    fileId,
    token,
    uploadURL,
    key,
    bucketUrl: `https://s3.amazonaws.com/${process.env.S3_BUCKET}`,
    fileUrl: `https://cdn.example.com/${key}`,
    expiresAt: new Date(Date.now() + ((ttlMinutes || 60) * 60 * 1000)).toISOString(),
    purpose,
    maxSizeBytes: maxSizeBytes || 10485760,
    singleUse: true
  });
});
```

## TypeScript Types

All types are exported and fully documented:

```typescript
import type {
  UploadTokenRequest,
  UploadTokenResponse,
  UploadOptions,
  UploadResult,
  SignedUrlUploadConfig
} from './utils/signedUrlUpload';
```

## Common Upload Purposes

Define these based on your application needs:

- `employee_profile` - Employee profile pictures
- `employee_document` - Employee documents (contracts, IDs, etc.)
- `company_logo` - Company/office logos
- `support_ticket` - Support ticket attachments
- `announcement` - Announcement images
- `general` - General purpose files

## Error Handling

The utility throws errors that you should catch:

```typescript
try {
  const result = await uploadFileWithSignedUrl(file, config, options);
} catch (error) {
  if (error.response?.status === 401) {
    // Unauthorized - redirect to login
  } else if (error.response?.status === 413) {
    // File too large
  } else if (error.code === 'ERR_NETWORK') {
    // Network error
  } else {
    // Generic error
    console.error('Upload failed:', error);
  }
}
```

## Security Considerations

1. **Always validate on the backend**: Don't trust client-side validation alone
2. **Use short TTL**: Set `ttlMinutes` to the minimum needed (e.g., 60 minutes)
3. **Implement purpose-based restrictions**: Enforce different size limits per purpose
4. **Scan uploaded files**: Run virus/malware scans on uploaded files
5. **Use authentication**: Ensure only authenticated users can request signed URLs

## Examples

See the `examples/` folder for complete working examples:

- **React Form Upload** - Complete form with file upload
- **Drag & Drop Upload** - Drag and drop file upload component
- **Multiple File Upload** - Upload multiple files with progress tracking
- **Image Preview** - Show image preview before upload

## License

MIT

## Support

For issues or questions, please open an issue on GitHub or contact the development team.
