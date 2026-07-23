/** @format */

export type Member = {
	id: string;
	name: string;
	username: string;
	avatar?: string;
};

export type RoleFormData = {
	name: string;
	description: string;
	jobTitles?: string[];
	permissions: { permission_id: number; scope: string }[];
};

export type AddRoleWizardProps = {
	onSubmit: (data: RoleFormData) => void;
	onCancel: () => void;
	availableJobTitles?: { id: string; title: string }[];
	onFormDataChange?: (data: RoleFormData) => void;
	initialData?: RoleFormData;
};

export const STEPS = [
	{ id: 1, title: "Role Information", key: "info" },
	{ id: 2, title: "Permissions", key: "permissions" },
	{ id: 3, title: "Review & Confirm", key: "review" },
] as const;

export const MAX_DESCRIPTION_LENGTH = 200;
