/** @format */

import * as yup from "yup";

import { TFunction } from "i18next";

export const getTeamSchema = (t: TFunction) => yup.object({
	name: yup
		.string()
		.required(t("wizard.validation.teamNameRequired"))
		.min(2, t("wizard.validation.teamNameMin"))
		.max(50, t("wizard.validation.teamNameMax")),
	description: yup
		.string()
		.default("")
		.max(200, t("wizard.validation.descriptionMax")),
	jobTitles: yup.array().of(yup.string()).default([]),
});

export const teamSchema = yup.object({
	name: yup
		.string()
		.required("Team name is required")
		.min(2, "Team name must be at least 2 characters")
		.max(50, "Team name must be less than 50 characters"),
	description: yup
		.string()
		.default("")
		.max(200, "Description must be less than 200 characters"),
	jobTitles: yup.array().of(yup.string()).default([]),
});

export type TeamFormData = yup.InferType<typeof teamSchema>;
