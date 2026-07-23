/** @format */

export type CasePerson = {
	personId: string;
	personName: string;
	role: string;
};

export type UploadedFile = {
	fileName: string;
	fileSize: number;
	fileType: string;
	fileUrl?: string;
	fileId?: number;
	token?: string;
	key?: string;
	purpose?: string;
	progress: number;
	isUploading: boolean;
	error?: string;
};

export type CaseFormData = {
	// Step 1: Case Basics
	title: string;
	case_type_id?: number;
	case_number?: string;
	client_name?: string;
	lawyer_id?: number;
	status?: "Open" | "In Progress" | "Closed" | "On Hold" | "Cancelled";
	start_date?: string; // ISO date string
	end_date?: string; // ISO date string

	// Step 2: People & Files
	people?: { employee_id: number; role?: string; personName?: string; avatarUrl?: string }[];
	// We'll keep 'files' in the form state for UI handling, but map to core.attachments on submit if needed
	files?: UploadedFile[];
	
	// Step 3: Case Summary
	summary: string;
	
	// Optional core object for strict DTO compliance if needed directly in state,
	// but usually we construct this on submit.
	core?: {
		attachments?: { fileId: number; fileName?: string; token?: string }[];
	};
};

export type AddCaseWizardProps = {
	onSubmit: (data: CaseFormData) => void;
	onCancel: (options?: { skipConfirm?: boolean }) => void;
	onFormDataChange?: (data: CaseFormData) => void;
	initialData?: CaseFormData;
};

export const STEPS = [
	{ id: 1, title: "Case Basics", key: "basics" },
	{ id: 2, title: "People & Files", key: "people" },
	{ id: 3, title: "Case Summary", key: "summary" },
] as const;
