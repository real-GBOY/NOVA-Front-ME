/** @format */

import { initializeApp, getApps } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { firebaseConfig } from "./firebaseConfig";

// Initialize Firebase app (only if not already initialized)
let app = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);

// Initialize Analytics (only in browser environment)
let analytics: ReturnType<typeof getAnalytics> | null = null;

if (typeof window !== "undefined") {
	// Check if Analytics is supported before initializing
	isSupported()
		.then((supported) => {
			if (supported) {
				analytics = getAnalytics(app);
			}
		})
		.catch((error) => {
			console.warn("Firebase Analytics initialization failed:", error);
		});
}

export { app, analytics };
