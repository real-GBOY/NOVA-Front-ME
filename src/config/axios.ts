/** @format */

import axios, { AxiosResponse, InternalAxiosRequestConfig } from "axios";
import endPoints from "./endPoints";
import { formatPermissionName } from "@/utilities/permissionFormatters";
import { transformTimePayload } from "@/utilities/timeTransform";
import { serializeQuery } from "@/utils/serializeQuery";

// will use env file
const apiClient = axios.create({
   baseURL: endPoints.baseurl,
   paramsSerializer: {
      serialize: (params) => serializeQuery(params as Record<string, unknown>),
   },
});
// this is deleteable comment

// Token management with localStorage persistence
let currentToken: string | null = localStorage.getItem("accessToken");
let currentRefreshToken: string | null = localStorage.getItem("refreshToken");
let isUserLoggedIn: boolean = localStorage.getItem("isLoggedIn") === "true";
let refreshPromise: Promise<string | null> | null = null;
const refreshQueue: Array<(token: string | null) => void> = [];
let isSigningOut = false;

const signOutAndRedirectToLogin = async (reason?: string): Promise<void> => {
   if (isSigningOut) {
      console.warn("[Auth] Sign out already in progress, skipping...");
      return;
   }
   isSigningOut = true;

   console.error("[Auth] Signing out user. Reason:", reason || "unknown");
   console.error("[Auth] Current state:", {
      hasAccessToken: !!currentToken,
      hasRefreshToken: !!currentRefreshToken,
      isLoggedIn: isUserLoggedIn,
   });
   // Log stack trace to identify caller
   console.error("[Auth] Stack trace:", new Error().stack);

   try {
      setAuthToken(null);
      setRefreshToken(null);
      setLoginStatus(false);

      await import("@/services/push/webPush")
         .then(({ revokeWebPush }) => revokeWebPush())
         .catch(() => undefined);
   } finally {
      import("@/services/socket/socket")
         .then(({ disconnectSocket }) => disconnectSocket())
         .catch(() => undefined);

      if (typeof window !== "undefined") {
         window.location.href = "/login";
      }
      isSigningOut = false;
   }
};

// Function to set current token
export const setAuthToken = (token: string | null) => {
   currentToken = token;
   if (token) {
      localStorage.setItem("accessToken", token);
   } else {
      localStorage.removeItem("accessToken");
   }
};

// Function to set refresh token
export const setRefreshToken = (refreshToken: string | null) => {
   currentRefreshToken = refreshToken;
   if (refreshToken) {
      localStorage.setItem("refreshToken", refreshToken);
   } else {
      localStorage.removeItem("refreshToken");
   }
};

// Function to set login status
export const setLoginStatus = (loggedIn: boolean) => {
   isUserLoggedIn = loggedIn;
   localStorage.setItem("isLoggedIn", loggedIn.toString());
};

// Function to get current token
export const getAuthToken = (): string | null => {
   // Sync from localStorage if in-memory is null but localStorage has value
   if (!currentToken) {
      const stored = localStorage.getItem("accessToken");
      if (stored) {
         currentToken = stored;
      }
   }
   return currentToken;
};

// Function to get refresh token (for debugging)
export const getRefreshToken = (): string | null => {
   // Sync from localStorage if in-memory is null but localStorage has value
   if (!currentRefreshToken) {
      const stored = localStorage.getItem("refreshToken");
      if (stored) {
         currentRefreshToken = stored;
      }
   }
   return currentRefreshToken;
};

// Function to check if user is logged in
export const getLoginStatus = (): boolean => {
   // Sync from localStorage if there's a mismatch
   const storedStatus = localStorage.getItem("isLoggedIn") === "true";
   if (storedStatus !== isUserLoggedIn) {
      isUserLoggedIn = storedStatus;
   }
   return isUserLoggedIn;
};

// Request interceptor - Add token to headers
apiClient.interceptors.request.use(
   async (config: InternalAxiosRequestConfig) => {
      // Add Authorization header if token exists and user is logged in
      if (currentToken && isUserLoggedIn && !config.skipAuth) {
         config.headers.set("Authorization", `Bearer ${currentToken}`);
      }

      const timeHandling = config.timeHandling;
      const timeEnabled = timeHandling?.enabled !== false;
      const dateOnlyMode = timeHandling?.dateOnlyMode ?? "keep";
      const exactKeys = timeHandling?.exactKeys;
      const suffixes = timeHandling?.suffixes;

      if (timeEnabled) {
         const params = config.params;
         if (params && !(params instanceof URLSearchParams)) {
            config.params = transformTimePayload(params, {
               direction: "toUtc",
               dateOnlyMode,
               exactKeys,
               suffixes,
            });
         }

         const data = config.data;
         const isBinaryPayload =
            typeof FormData !== "undefined" && data instanceof FormData;
         const isBlobPayload = typeof Blob !== "undefined" && data instanceof Blob;
         const isArrayBufferPayload =
            typeof ArrayBuffer !== "undefined" && data instanceof ArrayBuffer;

         if (
            data &&
            !isBinaryPayload &&
            !isBlobPayload &&
            !isArrayBufferPayload &&
            !(data instanceof URLSearchParams)
         ) {
            config.data = transformTimePayload(data, {
               direction: "toUtc",
               dateOnlyMode,
               exactKeys,
               suffixes,
            });
         }
      }
      return config;
   },
   (error) => {
      return Promise.reject(error);
   }
);

// Response interceptor - Handle errors
apiClient.interceptors.response.use(
   (response: AxiosResponse) => {
      const timeHandling = response.config?.timeHandling;
      const timeEnabled = timeHandling?.enabled !== false;
      const dateOnlyMode = timeHandling?.dateOnlyMode ?? "keep";
      const exactKeys = timeHandling?.exactKeys;
      const suffixes = timeHandling?.suffixes;

      if (timeEnabled) {
         const responseType = response.config?.responseType;
         const isBinaryResponse =
            responseType === "blob" ||
            responseType === "arraybuffer" ||
            response.data instanceof Blob ||
            response.data instanceof ArrayBuffer;

         if (!isBinaryResponse) {
            response.data = transformTimePayload(response.data, {
               direction: "toLocal",
               dateOnlyMode,
               exactKeys,
               suffixes,
            });
         }
      }
      return response;
   },
   async (error) => {
      const originalRequest = error.config;

      const statusCode = error.response?.status;
      const responseMessage = String(
         error.response?.data?.message ?? ""
      ).toLowerCase();

      // Handle explicit token invalidation messages
      if (statusCode === 401) {
         const isOutdatedAccessToken =
            responseMessage.includes("access token is outdated") ||
            responseMessage.includes("refresh your token") ||
            responseMessage.includes("token expired") ||
            responseMessage.includes("invalid token");

         // If backend explicitly says token is outdated AND we have no refresh token, sign out
         if (isOutdatedAccessToken && !getRefreshToken()) {
            await signOutAndRedirectToLogin("401 with outdated token message and no refresh token");
            return Promise.reject(error);
         }
      }

      if (statusCode === 401 && !originalRequest._retry) {
         originalRequest._retry = true;

         // Skip refresh for auth endpoints
         const authEndpoints = [
            "/auth/login",
            "/auth/register",
            "/auth/refresh",
         ];
         const isAuthEndpoint = authEndpoints.some((endpoint) =>
            originalRequest.url?.includes(endpoint)
         );

         if (isAuthEndpoint) {
            return Promise.reject(error);
         }

         // Sync refresh token from localStorage in case it was updated elsewhere
         const refreshToken = getRefreshToken();

         // Try to refresh the token if refresh token exists
         if (refreshToken) {
            try {
               if (!refreshPromise) {
                  console.log("[Auth] Starting token refresh...");
                  refreshPromise = axios
                     .post(
                        `${endPoints.baseurl}${endPoints.auth.refresh}`,
                        {
                           refreshToken: refreshToken,
                           refresh_token: refreshToken,
                        },
                        {
                           headers: {
                              "Content-Type": "application/json",
                           },
                        }
                     )
                     .then((refreshResponse) => {
                        console.log("[Auth] Refresh response received:", refreshResponse?.data);
                        const data = refreshResponse?.data?.data ?? refreshResponse?.data ?? {};
                        // Handle both accessToken and access_token response formats
                        const newAccess =
                           data.accessToken || data.access_token || null;
                        // Some backends return refresh_token instead of refreshToken; also keep current if none returned
                        const newRefresh =
                           data.refreshToken ||
                           data.refresh_token ||
                           refreshToken;

                        // If we didn't get a new access token, the refresh failed
                        if (!newAccess) {
                           console.error(
                              "[Auth] Refresh response missing access token:",
                              data
                           );
                           throw new Error("Refresh response missing access token");
                        }

                        console.log("[Auth] Token refresh successful, updating tokens...");
                        setAuthToken(newAccess);
                        setRefreshToken(newRefresh || null);

                        // Reconnect socket with new token
                        import("@/services/socket/socket").then(
                           ({ reconnectSocket }) => {
                              reconnectSocket();
                           }
                        );

                        // Resolve all queued requests with the new token
                        const queue = [...refreshQueue];
                        console.log(`[Auth] Resolving ${queue.length} queued requests with new token`);
                        refreshQueue.length = 0;
                        queue.forEach((resolve) => resolve(newAccess));

                        return newAccess;
                     })
                     .catch((refreshError) => {
                        const errorMessage = refreshError?.response?.data?.message || refreshError?.message || "unknown";
                        console.error("[Auth] Token refresh failed:", refreshError);
                        console.error("[Auth] Refresh error details:", {
                           status: refreshError?.response?.status,
                           message: errorMessage,
                           data: refreshError?.response?.data,
                        });
                        // Resolve all queued requests with null so they can handle failure
                        const queue = [...refreshQueue];
                        refreshQueue.length = 0;
                        queue.forEach((resolve) => resolve(null));
                        signOutAndRedirectToLogin(`Refresh token request failed: ${errorMessage}`);
                        throw refreshError;
                     })
                     .finally(() => {
                        refreshPromise = null;
                     });
               }

               const newAccessToken = await new Promise<string | null>(
                  (resolve, reject) => {
                     refreshQueue.push(resolve);
                     if (refreshPromise) {
                        refreshPromise.catch(reject);
                     }
                  }
               );

               if (newAccessToken) {
                  originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                  return apiClient(originalRequest);
               } else {
                  // Token refresh returned null, reject with original error
                  return Promise.reject(error);
               }
            } catch (refreshError) {
               // Refresh failed - signOutAndRedirectToLogin already called in catch above
               return Promise.reject(refreshError);
            }
         } else {
            // No refresh token available - user needs to login again
            console.error("[Auth] 401 received but no refresh token available");
            console.error("[Auth] localStorage refreshToken:", localStorage.getItem("refreshToken"));
            console.error("[Auth] in-memory refreshToken:", currentRefreshToken);
            await signOutAndRedirectToLogin("401 received but no refresh token in memory");
            return Promise.reject(error);
         }
      }

      // Handle 403 Forbidden - show permission denied toast
      if (statusCode === 403) {
         // Extract permission name from error response if available
         // Backend returns { required: string[] }
         const errorData = error.response?.data;
         let permissionNames: string[] = [];

         if (errorData?.required) {
            permissionNames = Array.isArray(errorData.required)
               ? errorData.required
               : [errorData.required];
         } else if (errorData?.required_permission) {
            permissionNames = [errorData.required_permission];
         } else if (errorData?.permission) {
            permissionNames = [errorData.permission];
         }

         const formattedPermissions = permissionNames
            .map(formatPermissionName)
            .join(", ");

         const message = formattedPermissions
            ? `You don't have permission to do this (${formattedPermissions})`
            : "You don't have permission to perform this action";

         // Dynamically import toast to avoid circular dependencies
         const method = originalRequest.method?.toLowerCase();
         if (method !== "get") {
            import("@/utilities/toast").then(({ default: toast }) => {
               toast.error(message);
            });
         }
      }
      // Handle all other API errors with a toast notification
      else if (statusCode && statusCode >= 400) {
         const errorData = error.response?.data;
         const method = originalRequest?.method?.toLowerCase();
         const requestUrl = originalRequest.url || "";

         // Skip showing toast for GET requests (they usually have their own error handling)
         // and skip 401 errors (handled by auth flow above)
         // Skip push registration errors - we handle them silently
         const isPushRegister = requestUrl.includes("/push/register");
         
         if (method !== "get" && statusCode !== 401 && !isPushRegister) {
            // Extract error message from various possible response formats
            const errorMessage =
               errorData?.message ||
               errorData?.error ||
               errorData?.detail ||
               (typeof errorData === "string" ? errorData : null) ||
               `Request failed with status ${statusCode}`;

            import("@/utilities/toast").then(({ default: toast }) => {
               toast.error(errorMessage);
            });
         }
      }

      return Promise.reject(error);
   }
);

export { apiClient };
export default apiClient;
