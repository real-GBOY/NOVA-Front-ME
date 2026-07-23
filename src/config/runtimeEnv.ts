/** @format */

type RuntimeEnvKey =
	| "VITE_API_BASE_URL"
	| "VITE_BUCKET_URL"
	| "VITE_FIREBASE_API_KEY"
	| "VITE_FIREBASE_AUTH_DOMAIN"
	| "VITE_FIREBASE_PROJECT_ID"
	| "VITE_FIREBASE_STORAGE_BUCKET"
	| "VITE_FIREBASE_MESSAGING_SENDER_ID"
	| "VITE_FIREBASE_APP_ID"
	| "VITE_FIREBASE_MEASUREMENT_ID"
	| "VITE_FIREBASE_VAPID_KEY"
	| "DEV";

declare global {
	interface Window {
		__ENV__?: Partial<Record<RuntimeEnvKey, string>>;
	}
}

export const getRuntimeEnv = (key: RuntimeEnvKey, fallback?: string) => {
	const runtimeValue = window.__ENV__?.[key];
	if (typeof runtimeValue === "string" && runtimeValue.length > 0) {
		return runtimeValue;
	}
	return fallback;
};
