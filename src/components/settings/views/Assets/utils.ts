/** @format */

import { Briefcase, Mobile, LaptopMobile } from "@/Icons";

// Get asset icon based on category
export function getAssetIcon(category?: string) {
	switch (category?.toLowerCase()) {
		case "laptop":
		case "laptops":
			return LaptopMobile;
		case "mobile":
		case "mobile phone":
		case "mobiles":
			return Mobile;
		default:
			return Briefcase;
	}
}

// Get category variant for badge
export function getCategoryVariant(
	category?: string
): "success" | "warning" | "error" | "info" {
	switch (category?.toLowerCase()) {
		case "laptop":
		case "laptops":
			return "info";
		case "mobile":
		case "mobile phone":
		case "mobiles":
			return "success";
		default:
			return "warning";
	}
}

// Get status variant for badge
export function getStatusVariant(
	status?: string
): "success" | "warning" | "error" | "info" {
	switch (status?.toLowerCase()) {
		case "assigned":
		case "in-use":
			return "info";
		case "available":
			return "success";
		case "maintenance":
			return "warning";
		case "retired":
			return "error";
		default:
			return "info";
	}
}

// Get condition variant
export function getConditionVariant(
	condition?: string
): "success" | "warning" | "error" | "info" {
	switch (condition?.toLowerCase()) {
		case "new":
		case "good":
			return "success";
		case "fair":
			return "warning";
		case "poor":
		case "damaged":
			return "error";
		default:
			return "info";
	}
}
