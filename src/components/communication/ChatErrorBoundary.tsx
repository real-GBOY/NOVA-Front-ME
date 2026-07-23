/** @format */

import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
	children: ReactNode;
}

interface State {
	hasError: boolean;
	error: Error | null;
	errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary for Chat Components
 * Catches errors in chat UI and shows fallback instead of crashing the entire app
 */
class ChatErrorBoundary extends Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = {
			hasError: false,
			error: null,
			errorInfo: null,
		};
	}

	static getDerivedStateFromError(): Partial<State> {
		// Update state so the next render will show the fallback UI
		return { hasError: true };
	}

	componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
		// Log error to console for debugging
		console.error("❌ [ChatErrorBoundary] Caught error:", error);
		console.error("❌ [ChatErrorBoundary] Error info:", errorInfo);

		// Update state with error details
		this.setState({
			error,
			errorInfo,
		});

		// TODO: Send error to monitoring service (e.g., Sentry, LogRocket)
		// Example: Sentry.captureException(error, { contexts: { react: errorInfo } });
	}

	handleReload = (): void => {
		// Reset error state and reload
		this.setState({
			hasError: false,
			error: null,
			errorInfo: null,
		});
		window.location.reload();
	};

	handleReset = (): void => {
		// Reset error state without reloading
		this.setState({
			hasError: false,
			error: null,
			errorInfo: null,
		});
	};

	render(): ReactNode {
		if (this.state.hasError) {
			return (
				<div className="flex items-center justify-center h-full bg-bg-weak rounded-[18px] border border-border p-6">
					<div className="text-center max-w-md">
						<div className="mb-4">
							<svg
								className="mx-auto h-12 w-12 text-danger"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								aria-hidden="true">
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
								/>
							</svg>
						</div>
						<h3 className="text-lg font-semibold text-text-strong mb-2">
							Something went wrong
						</h3>
						<p className="text-sm text-text-sub mb-6">
							The chat encountered an unexpected error. Please try reloading the
							page.
						</p>

						{/* Show error details in development */}
						{process.env.NODE_ENV === "development" && this.state.error && (
							<details className="mb-4 text-left">
								<summary className="cursor-pointer text-sm font-medium text-text-sub hover:text-text-strong">
									Error Details (Dev Only)
								</summary>
								<div className="mt-2 p-3 bg-background rounded-lg border border-border overflow-auto max-h-40">
									<p className="text-xs font-mono text-danger mb-2">
										{this.state.error.toString()}
									</p>
									{this.state.errorInfo && (
										<pre className="text-xs font-mono text-text-sub whitespace-pre-wrap">
											{this.state.errorInfo.componentStack}
										</pre>
									)}
								</div>
							</details>
						)}

						<div className="flex gap-3 justify-center">
							<button
								onClick={this.handleReset}
								className="px-4 py-2 text-sm font-medium text-text-sub bg-background border border-border rounded-lg hover:bg-bg-weak transition-colors">
								Try Again
							</button>
							<button
								onClick={this.handleReload}
								className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors">
								Reload Page
							</button>
						</div>
					</div>
				</div>
			);
		}

		return this.props.children;
	}
}

export default ChatErrorBoundary;
