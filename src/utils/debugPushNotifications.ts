/**
 * Debug utility for push notifications
 * Call this from browser console: debugPushNotifications()
 */
export async function debugPushNotifications() {
	const results: Record<string, unknown> = {};

	// Check basic support
	results.hasNotification = "Notification" in window;
	results.hasServiceWorker = "serviceWorker" in navigator;
	results.permission = results.hasNotification ? Notification.permission : "N/A";
	results.isSecure = window.isSecureContext;

	// Check service worker status
	if ("serviceWorker" in navigator) {
		try {
			const registration = await navigator.serviceWorker.getRegistration("/");
			results.swRegistered = !!registration;
			results.swScope = registration?.scope;
			results.swActive = !!registration?.active;
			results.swWaiting = !!registration?.waiting;
			results.swInstalling = !!registration?.installing;
			results.swActiveState = registration?.active?.state;
			results.swActiveScriptURL = registration?.active?.scriptURL;

			// Check if SW is controlling this page
			results.swController = !!navigator.serviceWorker.controller;
			results.swControllerURL = navigator.serviceWorker.controller?.scriptURL;
		} catch (e: unknown) {
			results.swError = e instanceof Error ? e.message : String(e);
		}

		// Check all registrations
		try {
			const allRegs = await navigator.serviceWorker.getRegistrations();
			results.allSwRegistrations = allRegs.map((reg) => ({
				scope: reg.scope,
				active: !!reg.active,
				scriptURL: reg.active?.scriptURL,
			}));
		} catch (e: unknown) {
			results.allSwError = e instanceof Error ? e.message : String(e);
		}
	}

	// Check push subscription
	if ("serviceWorker" in navigator) {
		try {
			const registration = await navigator.serviceWorker.getRegistration("/");
			if (registration) {
				const subscription = await registration.pushManager.getSubscription();
				results.hasPushSubscription = !!subscription;
				results.pushEndpoint = subscription?.endpoint;
			}
		} catch (e: unknown) {
			results.pushError = e instanceof Error ? e.message : String(e);
		}
	}

	// Check Firebase config
	try {
		results.firebaseConfig = {
			apiKey: import.meta.env.VITE_FIREBASE_API_KEY ? "✓" : "✗",
			authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ? "✓" : "✗",
			projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ? "✓" : "✗",
			messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ? "✓" : "✗",
			appId: import.meta.env.VITE_FIREBASE_APP_ID ? "✓" : "✗",
			vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY ? "✓" : "✗",
		};
	} catch (e: unknown) {
		results.firebaseConfigError = e instanceof Error ? e.message : String(e);
	}

	// Check local storage
	results.deviceId = localStorage.getItem("push_device_id");
	results.lastToken = localStorage.getItem("push_fcm_token");

	console.table(results);

	return results;
}

// Make it available globally for console access
if (typeof window !== "undefined") {
	(window as Window & { debugPushNotifications?: typeof debugPushNotifications }).debugPushNotifications =
		debugPushNotifications;
}
