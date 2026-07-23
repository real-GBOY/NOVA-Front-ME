/** @format */

import * as yup from "yup";

import { TFunction } from "i18next";

export const getJobTitleSchema = (t: TFunction) => yup.object({
	name: yup
		.string()
		.required(t("wizard.validation.jobTitleNameRequired"))
		.min(2, t("wizard.validation.jobTitleNameMin"))
		.max(50, t("wizard.validation.jobTitleNameMax")),
	description: yup
		.string()
		.default("")
		.max(200, t("wizard.validation.descriptionMax")),
	roles: yup.array().of(yup.string().required()).default([]),
});

export const jobTitleSchema = yup.object({
	name: yup
		.string()
		.required("Job title name is required")
		.min(2, "Job title name must be at least 2 characters")
		.max(50, "Job title name must be less than 50 characters"),
	description: yup
		.string()
		.default("")
		.max(200, "Description must be less than 200 characters"),
	roles: yup.array().of(yup.string().required()).default([]),
});

export type JobTitleFormData = yup.InferType<typeof jobTitleSchema>;
