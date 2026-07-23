/** @format */

import endPoints from "@/config/endPoints";

export const getStorageBaseUrl = (): string => endPoints.bucketUrl;

export const isAbsoluteUrl = (url?: string | null): boolean =>
   Boolean(url && /^https?:\/\//i.test(url));

export const normalizeStoragePath = (path?: string | null): string => {
   if (!path) return "";
   return path.replace(/^\/+/, "");
};

export const buildStorageUrl = (path?: string | null): string => {
   if (!path) return "";
   if (isAbsoluteUrl(path)) return path;
   const normalizedPath = normalizeStoragePath(path);
   if (!normalizedPath) return "";
   return `${getStorageBaseUrl()}/${normalizedPath}`;
};
