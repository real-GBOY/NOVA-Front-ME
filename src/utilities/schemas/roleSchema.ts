/** @format */

import * as yup from "yup";

import { TFunction } from "i18next";

export const getRoleSchema = (t: TFunction) => yup.object({
	name: yup
		.string()
		.required(t("wizard.validation.roleNameRequired"))
		.min(2, t("wizard.validation.roleNameMin"))
		.max(50, t("wizard.validation.roleNameMax")),
	description: yup
		.string()
		.default("")
		.max(200, t("wizard.validation.descriptionMax")),
	jobTitles: yup.array().of(yup.string().required()).default([]).optional(),
	permissions: yup
		.array()
		.of(
			yup
				.object({
					permission_id: yup
						.number()
						.required(t("wizard.validation.permissionIdRequired")),
					scope: yup.string().required(t("wizard.validation.permissionScopeRequired")),
				})
				.required()
		)
		.default([])
		.required(),
});

export const roleSchema = yup.object({
	name: yup
		.string()
		.required("Role name is required")
		.min(2, "Role name must be at least 2 characters")
		.max(50, "Role name must be less than 50 characters"),
	description: yup
		.string()
		.default("")
		.max(200, "Description must be less than 200 characters"),
	jobTitles: yup.array().of(yup.string().required()).default([]).optional(),
	permissions: yup
		.array()
		.of(
			yup
				.object({
					permission_id: yup
						.number()
						.required("Permission id is required"),
					scope: yup.string().required("Permission scope is required"),
				})
				.required()
		)
		.default([])
		.required(),
});

export type RoleFormData = yup.InferType<typeof roleSchema>;
