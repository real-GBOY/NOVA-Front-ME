/** @format */

import type { TFunction } from "i18next";
import type { StatusTagProps } from "@/designSystem/StatusTag";
import type { Member } from "@/utilities/employeeTransformers";

type MemberStatus = Member["status"] | string;

export const getMemberStatusMeta = (
	status: MemberStatus,
	t: TFunction
): { label: string; variant: StatusTagProps["variant"] } => {
	switch (status) {
		case "Active":
			return { label: t("filters.active"), variant: "active" };
		case "Inactive":
			return { label: t("filters.inactive"), variant: "inactive" };
		case "Invited":
			return { label: t("filters.invited"), variant: "warning" };
		default:
			return { label: status, variant: "inactive" };
	}
};
