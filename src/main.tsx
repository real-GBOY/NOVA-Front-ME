/** @format */

import { StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App.tsx";
import "./index.css";
import "./config/i18n"; // Initialize i18n
import { UIProvider } from "./services/contexts/UiProvider.tsx";
import I18nLoadingFallback from "./components/I18nLoadingFallback.tsx";
import "./utils/debugPushNotifications"; // Load debug utility
import "./utils/socketDiagnostics"; // Load socket diagnostics utility
import "./config/firebaseInit"; // Initialize Firebase and Analytics

// Create a QueryClient instance
const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			retry: 1,
			refetchOnWindowFocus: false,
			staleTime: 5 * 60 * 1000, // 5 minutes
		},
		mutations: {
			retry: false,
		},
	},
});

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<QueryClientProvider client={queryClient}>
			<Suspense fallback={<I18nLoadingFallback />}>
				<BrowserRouter>
					<UIProvider>
						<App />
					</UIProvider>
				</BrowserRouter>
			</Suspense>
		</QueryClientProvider>
	</StrictMode>
);
