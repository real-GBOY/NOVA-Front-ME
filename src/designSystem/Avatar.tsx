/** @format */

import { ReactNode } from "react";

interface AvatarProps {
	src?: string;
	alt?: string;
	size?: "sm" | "md" | "lg" | "xl";
	children?: ReactNode;
	className?: string;
	showOnlineIndicator?: boolean;
	isOnline?: boolean;
}

function Avatar({
	src,
	alt = "",
	size = "md",
	children,
	className = "",
	showOnlineIndicator = false,
	isOnline = false,
}: AvatarProps) {
	const sizeClasses = {
		sm: "w-6 h-6",
		md: "w-8 h-8",
		lg: "w-10 h-10",
		xl: "w-12 h-12",
	};

	const indicatorSizeClasses = {
		sm: "w-2 h-2",
		md: "w-2.5 h-2.5",
		lg: "w-3 h-3",
		xl: "w-3.5 h-3.5",
	};

	const DEFAULT_AVATAR = "/icons/defAvatar.png";

	return (
		<div className={`relative ${sizeClasses[size]} flex-shrink-0 ${className}`}>
			{src ? (
				<img
					src={src}
					alt={alt}
					className={`${sizeClasses[size]} rounded-full object-cover`}
					onError={(e) => {
						// Fallback to default avatar if image fails to load
						const target = e.target as HTMLImageElement;
						if (target.src !== DEFAULT_AVATAR) {
							target.src = DEFAULT_AVATAR;
						}
					}}
				/>
			) : children ? (
				<div
					className={`${sizeClasses[size]} rounded-full bg-bg-weak flex items-center justify-center`}>
					{children}
				</div>
			) : (
				<img
					src={DEFAULT_AVATAR}
					alt={alt || "Default avatar"}
					className={`${sizeClasses[size]} rounded-full object-cover`}
				/>
			)}
			{showOnlineIndicator && (
				<div
					className={`absolute bottom-0 right-0 ${
						indicatorSizeClasses[size]
					} rounded-full border-2 border-background ${
						isOnline ? "bg-success" : "bg-text-soft"
					}`}
				/>
			)}
		</div>
	);
}

export default Avatar;
