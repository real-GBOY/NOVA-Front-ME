/** @format */

import { createContext, useContext, useState, useCallback } from "react";
import PdfPreviewModal from "@/components/pdf/PdfPreviewModal";

interface PdfPreviewContextValue {
	openPreview: (config: { url: string; fileName?: string | null }) => void;
	closePreview: () => void;
}

const PdfPreviewContext = createContext<PdfPreviewContextValue | undefined>(
	undefined
);

export const PdfPreviewProvider = ({
	children,
}: {
	children: React.ReactNode;
}) => {
	const [preview, setPreview] = useState<{
		url: string;
		fileName?: string | null;
	} | null>(null);

	const openPreview = useCallback(
		(config: { url: string; fileName?: string | null }) => {
			setPreview(config);
		},
		[]
	);

	const closePreview = useCallback(() => {
		setPreview(null);
	}, []);

	return (
		<PdfPreviewContext.Provider value={{ openPreview, closePreview }}>
			{children}
			<PdfPreviewModal
				isOpen={Boolean(preview)}
				fileUrl={preview?.url}
				fileName={preview?.fileName || undefined}
				onClose={closePreview}
			/>
		</PdfPreviewContext.Provider>
	);
};

export const usePdfPreview = () => {
	const context = useContext(PdfPreviewContext);
	if (!context) {
		throw new Error("usePdfPreview must be used within PdfPreviewProvider");
	}
	return context;
};
