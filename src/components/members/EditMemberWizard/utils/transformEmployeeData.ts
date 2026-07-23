/** @format */

import type { EmployeeDetails } from "@/services/employeeService";
import type { MemberFormData } from "@/utilities/schemas/memberSchema";

export function transformEmployeeDetailsToFormData(
	employeeData: EmployeeDetails,
	basicEmployeeData?: { national_id?: string | null } | null
): Partial<MemberFormData> {
	const personal = employeeData.personal;
	const job = employeeData.job;
	const contract = employeeData.contract;
	const residencyPermits = employeeData.residency_permits || [];
	const latestPermit = residencyPermits.length > 0 ? residencyPermits[0] : null;

	// Format date of birth
	let dateOfBirth = "";
	if (personal.birth_date) {
		try {
			const date = new Date(personal.birth_date);
			if (!isNaN(date.getTime())) {
				dateOfBirth = date.toISOString().split("T")[0];
			}
		} catch (error) {
			console.error("Error parsing birth date:", error);
		}
	}

	// Format start date
	let startDate = "";
	if (contract?.start_date) {
		try {
			const date = new Date(contract.start_date);
			if (!isNaN(date.getTime())) {
				startDate = date.toISOString().split("T")[0];
			}
		} catch (error) {
			console.error("Error parsing start date:", error);
		}
	}

	// Format residency dates
	let residencyIssueDate = "";
	let residencyExpiryDate = "";
	if (latestPermit) {
		if (latestPermit.issue_date) {
			try {
				const date = new Date(latestPermit.issue_date);
				if (!isNaN(date.getTime())) {
					residencyIssueDate = date.toISOString().split("T")[0];
				}
			} catch (error) {
				console.error("Error parsing residency issue date:", error);
			}
		}
		if (latestPermit.expiration_date) {
			try {
				const date = new Date(latestPermit.expiration_date);
				if (!isNaN(date.getTime())) {
					residencyExpiryDate = date.toISOString().split("T")[0];
				}
			} catch (error) {
				console.error("Error parsing residency expiry date:", error);
			}
		}
	}

	// Transform team IDs
	const team_ids = job.team_ids?.map((id) => String(id)) || [];

	// Transform profile image if exists
	let profileImage = null;
	if (personal.profile_picture_id && personal.profile_picture_url) {
		profileImage = {
			fileId: Number(personal.profile_picture_id),
			token: "", // Token might not be available, will need to handle this
			purpose: "employee_profile",
			fileUrl: personal.profile_picture_url,
		};
	}

	return {
		firstName: personal.first_name || "",
		lastName: personal.last_name || "",
		email: personal.email || "",
		phoneNumber: personal.phone_number || "",
		country: personal.country || "",
		dateOfBirth,
		gender: personal.gender || "",
		maritalStatus: personal.marital_status || "",
		nationalId: personal.national_id || basicEmployeeData?.national_id || "",
		address: personal.address || "",
		jobTitle: job.job_title_id ? String(job.job_title_id) : "",
		team_ids,
		role: job.role?.id ? String(job.role.id) : "",
		manager: employeeData.manager?.id ? String(employeeData.manager.id) : "",
		shiftId: null, // Not available in EmployeeDetails
		employmentType: contract?.employment_type || contract?.contract_type || "",
		startDate,
		hoursPerWeek: "", // Not available in EmployeeDetails
		probationPeriod: contract?.probation_period
			? `${contract.probation_period} Days`
			: "",
		salary: contract?.salary ? String(contract.salary) : "",
		contractType: contract?.contract_type || "",
		documents: [], // Documents would need to be fetched separately
		// Residency
		residencyStatus: latestPermit?.status || "",
		residencyCountry: latestPermit?.country || "United Arab Emirates",
		residencyType: latestPermit?.permit_type || "",
		residencyNumber: latestPermit?.permit_number || "",
		residencyIssueDate,
		residencyExpiryDate,
		residencyDocument: latestPermit?.document_file_id
			? [
					{
						fileId: latestPermit.document_file_id,
						token: "", // Token would need to be fetched separately
						purpose: "employee_document",
						fileUrl: "", // URL would need to be fetched separately
					},
			  ]
			: [],
		profileImage,
	};
}
