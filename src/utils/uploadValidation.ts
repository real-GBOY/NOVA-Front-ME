/** @format */

export interface UploadCandidate {
   fileId?: number | string | null;
   token?: string | null;
   file_token?: string | null;
   purpose?: string | null;
   isUploading?: boolean | string | null;
   error?: unknown;
}

export interface ReadyUpload extends UploadCandidate {
   fileId: number | string;
   token: string;
}

const isUploadingValue = (value: UploadCandidate["isUploading"]): boolean => {
   if (typeof value === "string") {
      return value.toLowerCase() === "true";
   }
   return Boolean(value);
};

export const getUploadToken = (
   file?: UploadCandidate | null,
): string | undefined => {
   if (!file) return undefined;
   const candidate =
      typeof file.token === "string" && file.token.trim().length > 0
         ? file.token
         : typeof file.file_token === "string" && file.file_token.trim().length > 0
           ? file.file_token
           : undefined;
   return candidate?.trim();
};

export const isUploadReady = (
   file?: UploadCandidate | null,
): file is ReadyUpload => {
   if (!file) return false;
   const hasFileId = file.fileId !== undefined && file.fileId !== null;
   const hasToken = Boolean(getUploadToken(file));
   return hasFileId && hasToken && !isUploadingValue(file.isUploading) && !file.error;
};

export const filterReadyUploads = <T extends UploadCandidate>(
   files?: T[] | null,
): (T & ReadyUpload)[] => {
   if (!Array.isArray(files)) return [];
   return files
      .filter((file): file is T & ReadyUpload => isUploadReady(file))
      .map((file) => ({
         ...file,
         token: getUploadToken(file)!,
      }));
};

export const getFirstReadyUpload = <T extends UploadCandidate>(
   files?: T[] | null,
): (T & ReadyUpload) | undefined => filterReadyUploads(files)[0];

export const toUploadPayload = (file: ReadyUpload) => ({
   file_id: file.fileId,
   file_token: getUploadToken(file) || file.token,
});
