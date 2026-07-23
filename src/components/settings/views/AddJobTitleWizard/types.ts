/** @format */

import { JobTitleFormData } from "@/utilities/schemas/jobTitleSchema";

export type AddJobTitleWizardProps = {
	onSubmit: (data: JobTitleFormData) => void;
	onCancel: () => void;
	availableRoles?: { id: string; title: string }[];
	onFormDataChange?: (data: JobTitleFormData) => void;
	initialData?: JobTitleFormData;
};

export const STEPS = [
	{ id: 1, title: "Basic Info", key: "info" },
	{ id: 2, title: "Review", key: "review" },
] as const;

export const MAX_DESCRIPTION_LENGTH = 200;

export type { JobTitleFormData };
