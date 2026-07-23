/** @format */

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";

interface DrawerProps {
	isOpen: boolean;
	onClose: () => void;
	children: React.ReactNode;
	width?: string;
	className?: string;
	showBackdrop?: boolean;
	side?: "left" | "right";
}

export default function Drawer({
	isOpen,
	onClose,
	children,
	width = "r-drawer-w xl:max-w-[600px]",
	className = "",
	showBackdrop = true,
	side = "right",
}: DrawerProps) {
	const isLeft = side === "left";
	const alignmentClass = isLeft
		? "justify-start md:pl-3 xl:pl-4"
		: "justify-end md:pr-3 xl:pr-4";
	const edgeBorderClass = isLeft ? "border-r" : "border-l";
	// Handle body overflow
	useEffect(() => {
		if (isOpen) {
			document.body.style.overflow = "hidden";
		} else {
			document.body.style.overflow = "";
		}
		return () => {
			document.body.style.overflow = "";
		};
	}, [isOpen]);

	// Handle escape key
	useEffect(() => {
		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				onClose();
			}
		};
		if (isOpen) {
			document.addEventListener("keydown", handleEscape);
		}
		return () => {
			document.removeEventListener("keydown", handleEscape);
		};
	}, [isOpen, onClose]);

	return createPortal(
		<AnimatePresence>
			{isOpen && (
				<div
					className={`fixed inset-0 z-50 flex items-start ${alignmentClass} md:py-3 xl:py-4`}>
					{/* Backdrop */}
					{showBackdrop && (
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							transition={{ duration: 0.2 }}
							className='absolute inset-0 bg-overlay/50 backdrop-blur-sm'
							onClick={onClose}
						/>
					)}

					{/* Drawer Panel */}
					<motion.div
						initial={{ x: isLeft ? "-100%" : "100%", opacity: 0.5 }}
						animate={{ x: 0, opacity: 1 }}
						exit={{ x: isLeft ? "-100%" : "100%", opacity: 0.5 }}
						transition={{ type: "spring", damping: 25, stiffness: 200 }}
						className={`relative z-10 h-full w-full ${width} bg-background shadow-2xl rounded-none md:rounded-2xl xl:rounded-3xl overflow-hidden ${edgeBorderClass} md:border xl:border border-border flex flex-col ${className}`}
						onClick={(e) => e.stopPropagation()}>
						{children}
					</motion.div>
				</div>
			)}
		</AnimatePresence>,
		document.body
	);
}
