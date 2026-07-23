/** @format */

import apiClient from "@/config/axios";
import endPoints from "@/config/endPoints";
import type { Shift } from "./shiftService";

// Types
export interface EmployeeRole {
	id: number;
	name: string;
	description: string;
	member_count: number;
}

export interface JobTitle {
	id: number;
	title: string;
}

export interface Team {
	id: number;
	name: string;
}

// Employee Details Response (from /employees/:id/details endpoint)
export interface EmployeeDetails {
	personal: {
		first_name: string;
		last_name: string;
		email: string;
		gender: "Male" | "Female" | null;
		phone_number: string | null;
		birth_date: string | null;
		age: number | null;
		country: string | null;
		address: string | null;
		marital_status: "Single" | "Married" | "Divorced" | "Widowed" | null;
		national_id?: string | null;
		profile_picture_id: string | null;
		profile_picture_url: string | null;
	};
	job: {
		job_title_id: number | null;
		job_title: string | null;
		role: EmployeeRole;
		team_ids: number[];
		team_names?: string[];
		teams?: Team[];
	};
	manager?: {
		id: number | null;
		name: string | null;
		member_id: string | number | null;
	} | null;
	hasContract?: boolean;
	contract: {
		salary: number | null;
		employment_type: string | null;
		start_date: string | null;
		end_date: string | null;
		probation_period: number | null;
		overtime_hourly_rate: number | null;
		contract_name: string | null;
		contract_type:
			| "full_time"
			| "part_time"
			| "contract"
			| "intern"
			| "temporary"
			| null;
		salary_cycle: "monthly" | "weekly" | "biweekly" | "yearly" | null;
		notice_period_days: number | null;
		absence_limit_days: number | null;
		custom_fields: Record<string, unknown> | null;
	} | null;
	hasResidencyPermit?: boolean;
	residency_permits: ResidencyPermit[];
	supplementary_residency_documents: SupplementaryResidencyDocument[];
}

// Employee Contract Response (from /employees/:id/contract endpoint)
export interface EmployeeContract {
	contract_id: number;
	employee_id: number;
	duration: {
		start_date: string;
		end_date: string;
		days_remaining: number;
		status: "Active" | "Expired" | "Upcoming" | "Terminated";
		progress_percentage: number;
	};
	clauses: {
		notice_period_days: number;
		sick_leave_days: string;
		casual_leave_days: string;
		annual_leave_days: string;
		absence_limit: {
			days_per_year: number;
			auto_termination: boolean;
		};
	};
	work_information: {
		job_title: string;
		team: string | null;
		manager: {
			id: number;
			name: string;
			avatar: string | null;
		} | null;
		role: string;
		permissions: string;
		member_id: string;
		start_date: string;
		end_date: string;
	};
	compensation: {
		salary: number;
		currency: string;
		contract_type: string;
		hours_per_week: number;
	};
	contact: {
		mobile: string;
		email: string;
	};
	attachments?: {
		file_id: number;
		file_name: string;
		status: string | null;
		url: string;
	}[];
}

export interface EmployeeDocument {
	id: number;
	document_type: string;
	name: string;
	file_id: number;
	file_url: string;
	file_size: string | null;
	issue_date: string | null;
	expiration_date: string | null;
	status: string | null;
	uploaded_at: string;
}

export interface UploadEmployeeDocumentRequest {
	file_id: number;
	file_token: string;
	document_type: string;
	name?: string;
	issue_date?: string | null;
	expiration_date?: string | null;
	notes?: string | null;
}

export interface EmployeeDocumentsResponse {
	data: EmployeeDocument[];
	pagination: {
		total: number;
		page: number;
		limit: number;
		total_pages: number;
	};
}

export interface ResidencyFile {
	id: number;
	name: string;
	url: string | null;
	size: number | null;
}

export interface ResidencyPermit {
	permit_id: number;
	permit_number: string;
	permit_type: string | null;
	issue_date: string | null;
	expiration_date: string | null;
	country: string | null;
	status: string;
	document_file_id: number | null;
	file: ResidencyFile | null;
}

export interface SupplementaryResidencyDocument {
	document_id: number;
	document_type: string;
	name: string;
	file: ResidencyFile | null;
	uploaded_at: string;
}

// Employee List Item (from /employees endpoint)
export interface Employee {
	id: number;
	name: string; // Full name
	email: string;
	avatar: string | null;
	job_title: string | null; // Just the title string, not an object
	contact: string | null; // Phone number
	joined_at: string; // Hire date
	permission_status: "Role" | "Override";
	status: "Active" | "Inactive" | "Invited";
	role: EmployeeRole;
	hasContract?: boolean;
	national_id?: string | null;
}

export interface EmployeeListResponse {
	data: Employee[];
	pagination: {
		total: number;
		page: number;
		limit: number;
	};
}

export interface CreateEmployeeRequest {
	name: string;
	email: string;
	job_title?: string;
	contact?: string;
	role_id: number;
}

export interface UpdateEmployeeRequest {
	first_name?: string;
	last_name?: string;
	email?: string;
	phone_number?: string;
	country?: string;
	date_of_birth?: string;
	gender?: "Male" | "Female";
	marital_status?: "Single" | "Married" | "Divorced" | "Widowed";
	national_id?: string;
	address?: string;
	job_title_id?: number;
	team_ids?: number[];
	role_id?: number;
	manager_id?: number | null;
	shift_id?: number | null;
	employment_type?:
		| "full_time"
		| "part_time"
		| "contract"
		| "intern"
		| "temporary";
	start_date?: string;
	hours_per_week?: number;
	probation_period?: number;
	profile_image?: {
		fileId: number;
		token: string;
		purpose: string;
	};
	attachments?: Array<{
		fileId: number;
		token: string;
		purpose: string;
	}>;
}

export interface UpdateEmployeeProfileRequest {
	profile_image?: {
		fileId: number;
		token: string;
		purpose: string;
	};
	address?: string;
	country?: string;
	date_of_birth?: string;
	gender?: "Male" | "Female";
	marital_status?: "Single" | "Married" | "Divorced" | "Widowed";
}

export interface RequestContactUpdateRequest {
	type: "email" | "phone";
	email?: string;
	phone?: string;
}

export interface VerifyContactUpdateRequest {
	type: "email" | "phone";
	value: string;
	otp: string;
	token: string;
}

export interface EmployeeDictionaryItem {
	id: string;
	label: string;
	subLabel?: string;
	avatar?: string | null;
	hasContract?: boolean;
}

export interface AddAttendanceRequest {
	date: string; // Format: "YYYY-MM-DD"
	clock_in: string; // ISO 8601 datetime
	clock_out: string; // ISO 8601 datetime
	attendance_type: string;
}

export interface AddOvertimeRequest {
	date: string; // Format: "YYYY-MM-DD" - overtime date
	start_time: string; // ISO 8601 datetime
	end_time: string; // ISO 8601 datetime
	reason: string;
}

export interface AddTimeOffRequest {
	vacation_type_id: number;
	start_date: string; // Format: "YYYY-MM-DD"
	end_date: string; // Format: "YYYY-MM-DD"
	reason: string;
}

export interface AddHourLeaveRequest {
	vacation_type_id: number;
	request_date: string; // Format: "YYYY-MM-DD"
	start_time: string; // Format: "HH:mm"
	end_time: string; // Format: "HH:mm"
	reason: string;
	auto_approve?: boolean;
}

export interface ExtendContractRequest {
	new_end_date: string; // Format: "YYYY-MM-DD"
}

// Attendance Timeline Types (GET /employees/:id/timeline)
export type DayTimelineSegmentType =
	| "Late"
	| "Working"
	| "Break"
	| "Unpaid"
	| "Overtime"
	| "Vacation"
	| "Absence"
	| "Idle";

export interface DayTimelineSegmentApi {
	id: number;
	segment_type: DayTimelineSegmentType;
	start_time: string;
	duration_minutes: number | null;
	metadata: Record<string, unknown> | null;
}

export interface DayTimelineApi {
	id: number;
	employee_id: number;
	date: string;
	shift_id: number | null;
	attendance_log_id: number | null;
	vacation_request_id: number | null;
	source: string;
	status: string;
	created_at: string;
	updated_at: string;
	segments: DayTimelineSegmentApi[];
	shift?: {
		id: number;
		name: string;
		timezone: string;
		office_location_id: number | null;
		archived_at: string | null;
	} | null;
}

export interface AttendanceTimelineResponse {
	data: DayTimelineApi[];
	pagination?: {
		total: number;
		page: number;
		limit: number;
	};
}


// Time Off Summary Types
export interface VacationType {
	id: number;
	name: string;
	default_days?: number | null;
	unit?: "day" | "hour" | "policy" | string;
	balance_managed?: boolean;
	requires_attachment?: boolean;
	default_paid_percent?: number | null;
	policy_code?: string | null;
}

export interface TimeOffBalance {
	vacation_type: VacationType;
	allocated: string;
	used: number;
	remaining: number;
	pending: number;
}

export interface TimeOffRequest {
	id: number;
	vacation_type: VacationType;
	start_date?: string;
	end_date?: string;
	days?: number;
	days_requested?: number;
	request_unit?: "day" | "hour" | "policy" | string;
	request_date?: string | null;
	start_time?: string | null;
	end_time?: string | null;
	requested_minutes?: number | null;
	calendar_days_requested?: number | null;
	status: string;
	reason: string;
	request_context?: Record<string, unknown> | null;
	approval_context?: Record<string, unknown> | null;
}

export interface TimeOffHourCounter {
	vacation_type_id: number;
	year: number;
	total_minutes: number;
	converted_days: number;
	remainder_minutes: number;
}

export interface NursingStatus {
	active: boolean;
	approved_at: string | null;
	nursing_end_date: string | null;
}

export interface TimeOffSummaryResponse {
	balances: TimeOffBalance[];
	requests: TimeOffRequest[];
	hour_counters?: TimeOffHourCounter[];
	nursing_status?: NursingStatus | null;
}

// Overtime Summary Types
export interface OvertimeRequest {
	id: number;
	date: string;
	hours: number;
	status: string;
	reason: string;
	compensation: number;
}

export interface OvertimeSummaryResponse {
	total_hours_this_month: number;
	total_hours_this_year: number;
	pending_requests: number;
	approved_compensation: number;
	overtime_rate: number;
	requests: OvertimeRequest[];
}

export interface EmployeeStats {
	total: number;
	active: number;
	inactive: number;
	overrides: number;
}

// Employee Assets Types
export interface EmployeeAsset {
	id: number;
	asset_id?: number;
	asset_name: string;
	category?: string;
	serial_number?: string;
	assigned_date: string;
	condition_at_handover?: string | null;
	current_condition?: "new" | "good" | "fair" | "poor" | "damaged" | null;
	image_url?: string | null;
}

export interface EmployeeAssetsResponse {
	data: EmployeeAsset[];
}

// Employee Current Shift Types (from /employees/:id/current-shift endpoint)
export interface EmployeeCurrentShiftAssignment {
	assignment_id: number;
	assignment_type: "Employee" | "Team" | "OfficeLocation";
	effective_from: string;
	effective_to: string | null;
}

export interface EmployeeCurrentShiftPayload {
	shift: Shift | null;
	source: string;
	assignment: EmployeeCurrentShiftAssignment | null;
	date: string;
}

export interface EmployeeCurrentShiftResponse {
	data: EmployeeCurrentShiftPayload;
}

// Employee Permissions Types
export interface EmployeePermission {
	id: number;
	name: string;
	description: string;
	scope: string;
}

export interface EmployeePermissionsResponse {
	role: string;
	effective_permissions: EmployeePermission[];
	custom_permissions: EmployeePermission[];
}

export interface UpdateEmployeePermissionsRequest {
	add_permission_ids?: number[];
	add_permissions?: Array<{ permission_id: number; scope?: string }>;
	remove_permission_ids?: number[];
}

export interface UniqueCheckResponse {
	email?: {
		value: string;
		is_unique: boolean;
	};
	national_id?: {
		value: string;
		is_unique: boolean;
	};
	member_id?: {
		value: string;
		is_unique: boolean;
	};
}

// Service functions
export const employeeService = {
	// GET - List employees
	list: async (filters?: {
		page?: number;
		limit?: number;
		search?: string;
		status?: string | string[];
		role_id?: number | number[];
		team_id?: number;
		teamId?: number;
		job_title_id?: number | number[];
		permission_status?: "Role" | "Override";
		joined_at_from?: string;
		joined_at_to?: string;
		sort_by?: string;
		sort_order?: "asc" | "desc";
	}): Promise<EmployeeListResponse> => {
		const response = await apiClient.get(endPoints.employees.getAll, {
			params: filters,
		});
		return response.data;
	},

	// GET - Get employee by ID
	getById: async (id: string | number): Promise<Employee> => {
		const response = await apiClient.get(endPoints.employees.getByIdBasic(id));
		return response.data;
	},

	// DELETE - Deactivate employee
	delete: async (id: string | number): Promise<void> => {
		await apiClient.delete(endPoints.employees.getByIdBasic(id));
	},

	// GET - Get employee details by ID
	getByIdDetails: async (id: string | number): Promise<EmployeeDetails> => {
		const response = await apiClient.get(
			endPoints.employees.getByIdDetails(id)
		);
		return response.data;
	},

	// GET - Get employee contract by ID
	getContract: async (id: string | number): Promise<EmployeeContract> => {
		const response = await apiClient.get(endPoints.employees.getContract(id));
		return response.data;
	},

	// GET - Get employee documents by ID
	getDocuments: async (
		id: string | number,
		params?: Record<string, unknown>
	): Promise<EmployeeDocumentsResponse> => {
		const response = await apiClient.get(endPoints.employees.getDocuments(id), {
			params,
		});
		return response.data;
	},

	// POST - Upload employee document
	addDocument: async (
		id: string | number,
		payload: UploadEmployeeDocumentRequest
	): Promise<EmployeeDocument> => {
		const response = await apiClient.post(
			endPoints.employees.getDocuments(id),
			payload
		);
		return response.data;
	},

	// PATCH - Rename employee document
	renameDocument: async (
		employeeId: string | number,
		documentId: string | number,
		name: string
	): Promise<EmployeeDocument> => {
		const response = await apiClient.patch(
			`${endPoints.employees.getDocuments(employeeId)}/${documentId}`,
			{ name }
		);
		return response.data;
	},

	// DELETE - Remove employee document
	deleteDocument: async (
		employeeId: string | number,
		documentId: string | number
	): Promise<void> => {
		await apiClient.delete(
			`${endPoints.employees.getDocuments(employeeId)}/${documentId}`
		);
	},

	// POST - Extend employee contract
	extendContract: async (
		id: string | number,
		payload: ExtendContractRequest
	): Promise<void> => {
		await apiClient.post(endPoints.employees.extendContract(id), payload);
	},

	// GET - Get employees as dictionary (for dropdowns)
	getDictionary: async (filters?: {
		page?: number;
		limit?: number;
		search?: string;
		status?: string;
		role_id?: number;
		team_id?: number;
		teamId?: number;
	}): Promise<EmployeeDictionaryItem[]> => {
		const response = await apiClient.get(endPoints.employees.getAll, {
			params: filters,
		});
		const employees: Employee[] = response.data?.data || response.data || [];

		// Transform to dictionary format
		return employees.map((employee) => ({
			id: String(employee.id),
			label: employee.name,
			subLabel: employee.email,
			avatar: employee.avatar,
			hasContract: employee.hasContract,
		}));
	},

	// POST - Add attendance log
	addAttendance: async (
		id: string | number,
		payload: AddAttendanceRequest
	): Promise<void> => {
		await apiClient.post(endPoints.employees.addAttendance(id), payload);
	},

	// POST - Add overtime
	addOvertime: async (
		id: string | number,
		payload: AddOvertimeRequest
	): Promise<void> => {
		await apiClient.post(endPoints.employees.addOvertime(id), payload);
	},

	// POST - Add time-off
	addTimeOff: async (
		id: string | number,
		payload: AddTimeOffRequest
	): Promise<void> => {
		await apiClient.post(endPoints.employees.addTimeOff(id), payload);
	},

	// POST - Add hour leave (admin on behalf)
	addHourLeave: async (
		id: string | number,
		payload: AddHourLeaveRequest
	): Promise<void> => {
		await apiClient.post(endPoints.employees.addHourLeaves(id), payload);
	},

	// GET - Get attendance timeline
	getAttendanceTimeline: async (
		id: string | number,
		params?: Record<string, unknown>
	): Promise<AttendanceTimelineResponse> => {
		const response = await apiClient.get(
			endPoints.employees.getAttendanceTimeline(id),
			{ params }
		);
		return response.data;
	},
 

	// GET - Get time off summary
	getTimeOffSummary: async (
		id: string | number,
		params?: Record<string, unknown>
	): Promise<TimeOffSummaryResponse> => {
		const response = await apiClient.get(
			endPoints.employees.getTimeOffSummary(id),
			{ params }
		);
		return response.data;
	},

	// GET - Get overtime summary
	getOvertimeSummary: async (
		id: string | number,
		params?: Record<string, unknown>
	): Promise<OvertimeSummaryResponse> => {
		const response = await apiClient.get(
			endPoints.employees.getOvertimeSummary(id),
			{ params }
		);
		return response.data;
	},

	// PATCH - Reset permissions
	resetPermissions: async (id: string | number): Promise<void> => {
		await apiClient.patch(endPoints.employees.resetPermissions(id));
	},

	// GET - Get employee stats
	getStats: async (): Promise<EmployeeStats> => {
		const response = await apiClient.get(endPoints.employees.stats);
		return response.data;
	},

	// GET - Get employee assets
	getAssets: async (
		id: string | number,
		params?: Record<string, unknown>
	): Promise<EmployeeAssetsResponse> => {
		const response = await apiClient.get(endPoints.employees.getAssets(id), {
			params,
		});
		return response.data;
	},

	// GET - Get employee's current shift (with assignment metadata)
	getCurrentShift: async (
		id: string | number,
		params?: {
			date?: string;
		}
	): Promise<EmployeeCurrentShiftResponse> => {
		const response = await apiClient.get(
			endPoints.employees.getCurrentShift(id),
			{ params }
		);
		return response.data;
	},

	// GET - Get employee permissions
	getPermissions: async (
		id: string | number
	): Promise<EmployeePermissionsResponse> => {
		const response = await apiClient.get(
			endPoints.employees.getPermissions(id)
		);
		return response.data;
	},

	// PUT - Update employee permissions (automatically includes required permissions)
	updatePermissions: async (
		id: string | number,
		payload: UpdateEmployeePermissionsRequest
	): Promise<EmployeePermissionsResponse> => {
		const finalPayload = { ...payload };

		// Ensure required permissions are included when adding permissions
		if (
			finalPayload.add_permissions &&
			finalPayload.add_permissions.length > 0
		) {
			// Import dynamically to avoid circular dependency
			const {
				ensureReadRolePermission,
				READ_ROLE_PERMISSION_NAME,
				READ_EMPLOYEE_DETAILED_PERMISSION_NAME,
			} = await import("./roleService");

			// Fetch required permission IDs
			const dictResponse = await apiClient.get(
				endPoints.permissions.getDictionary
			);
			const data = dictResponse.data?.data || [];

			const requiredIds: Record<string, number> = {};
			const requiredPermNames = [
				READ_ROLE_PERMISSION_NAME,
				READ_EMPLOYEE_DETAILED_PERMISSION_NAME,
			];

			for (const category of data) {
				for (const perm of category.permissions || []) {
					if (requiredPermNames.includes(perm.permission_name)) {
						requiredIds[perm.permission_name] = perm.permission_id;
					}
				}
			}

			// Ensure each required permission is included
			let permissions = finalPayload.add_permissions;
			for (const permName of requiredPermNames) {
				const permId = requiredIds[permName];
				if (permId) {
					permissions = ensureReadRolePermission(permissions, permId);
				}
			}
			finalPayload.add_permissions = permissions;
		}

		const response = await apiClient.put(
			endPoints.employees.updatePermissions(id),
			finalPayload
		);
		return response.data;
	},

	// PUT - Update employee profile
	updateProfile: async (
		id: string | number,
		payload: UpdateEmployeeProfileRequest
	): Promise<void> => {
		await apiClient.put(
			`${endPoints.employees.getByIdBasic(id)}/profile`,
			payload
		);
	},

	// PUT - Update employee (full update)
	update: async (
		id: string | number,
		payload: UpdateEmployeeRequest
	): Promise<void> => {
		await apiClient.put(endPoints.employees.getByIdBasic(id), payload);
	},

	// PUT - Update residency permit
	updateResidency: async (
		permitId: string | number,
		payload: {
			permit_number: string;
			permit_type: string | null;
			issue_date: string;
			expiration_date: string;
			country: string | null;
			status: string;
			document_file_id?: number | null;
			residency_documents?: Array<{
				fileId: number;
				token: string;
				purpose?: string;
				fileName?: string;
				fileSize?: number;
				fileType?: string;
				fileUrl?: string;
				key?: string;
			}>;
			residency_document_ids?: number[];
		}
	): Promise<void> => {
		await apiClient.put(endPoints.employees.updateResidency(permitId), payload);
	},

	// POST - Request contact update (OTP)
	requestContactUpdate: async (
		id: string | number,
		payload: RequestContactUpdateRequest
	): Promise<{ token: string }> => {
		const response = await apiClient.post(
			`${endPoints.employees.getByIdBasic(id)}/contact/request-update`,
			payload
		);
		return response.data;
	},

	// POST - Verify contact update (OTP)
	verifyContactUpdate: async (
		id: string | number,
		payload: VerifyContactUpdateRequest
	): Promise<void> => {
		await apiClient.post(
			`${endPoints.employees.getByIdBasic(id)}/contact/verify-update`,
			payload
		);
	},

	// GET - Check if email/national_id is unique
	checkUnique: async (params: {
		email?: string;
		national_id?: string;
		exclude_employee_id?: string | number;
	}): Promise<UniqueCheckResponse> => {
		const response = await apiClient.get(
			`${endPoints.employees.getAll}/unique`,
			{
				params,
			}
		);
		return response.data;
	},
};
