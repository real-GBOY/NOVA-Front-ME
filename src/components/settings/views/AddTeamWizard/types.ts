/** @format */

import { TeamFormData } from "@/utilities/schemas/teamSchema";

export type AddTeamWizardProps = {
	onSubmit: (data: TeamFormData) => void;
	onCancel: () => void;
	availableJobTitles?: { id: string; title: string }[];
	onFormDataChange?: (data: TeamFormData) => void;
	initialData?: TeamFormData;
};

export const STEPS = [
	{ id: 1, title: "Basic Info", key: "info" },
	{ id: 2, title: "Review", key: "review" },
] as const;

export const MAX_DESCRIPTION_LENGTH = 200;

export type { TeamFormData };
