/** @format */

export const isPdfFile = ({
	fileName,
	mimeType,
	url,
}: {
	fileName?: string | null;
	mimeType?: string | null;
	url?: string | null;
}) => {
	if (mimeType && mimeType.toLowerCase().includes("pdf")) {
		return true;
	}

	const nameCandidate =
		fileName || (url ? url.split("?")[0].split("#")[0] : undefined);

	return nameCandidate
		? nameCandidate.trim().toLowerCase().endsWith(".pdf")
		: false;
};

export const isImageFile = ({
	fileName,
	url,
}: {
	fileName?: string | null;
	url?: string | null;
}) => {
	const nameCandidate = fileName || (url ? url.split("?")[0].split("#")[0] : "");
	const lowerName = nameCandidate.trim().toLowerCase();
	return [
		".jpg",
		".jpeg",
		".png",
		".gif",
		".webp",
		".bmp",
		".svg",
	].some((ext) => lowerName.endsWith(ext));
};

export const downloadFile = async ({
	url,
	fileName,
}: {
	url: string;
	fileName?: string | null;
}) => {
	if (!url) return;
	
	try {
		// Fetch the file as a blob to bypass CORS restrictions and ensure download
		const apiClient = (await import("@/config/axios")).default;
		const response = await apiClient.get(url, {
			responseType: "blob",
			skipAuth: true,
			timeHandling: { enabled: false },
		});
		const blob = response.data as Blob;
		
		// Create a temporary URL for the blob
		const blobUrl = window.URL.createObjectURL(blob);
		
		// Create a temporary anchor element to trigger download
		const link = document.createElement("a");
		link.href = blobUrl;
		link.download = fileName || "document";
		document.body.appendChild(link);
		link.click();
		
		// Clean up
		document.body.removeChild(link);
		window.URL.revokeObjectURL(blobUrl);
	} catch (error) {
		console.error("Download failed:", error);
		// Fallback to simple download (might open in new tab instead)
		const link = document.createElement("a");
		link.href = url;
		link.download = fileName || "document";
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	}
};
