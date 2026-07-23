/** @format */

export const reactQueryKeys = {
	contracts: {
		all: ["contracts"] as const,
		lists: () => [...reactQueryKeys.contracts.all, "list"] as const,
		list: (filters?: { page?: number; limit?: number; search?: string }) =>
			[...reactQueryKeys.contracts.lists(), { filters }] as const,
		details: () => [...reactQueryKeys.contracts.all, "detail"] as const,
		detail: (id: string | number) =>
			[...reactQueryKeys.contracts.details(), id] as const,
		create: () => [...reactQueryKeys.contracts.all, "create"] as const,
		update: () => [...reactQueryKeys.contracts.all, "update"] as const,
		delete: () => [...reactQueryKeys.contracts.all, "delete"] as const,
		end: () => [...reactQueryKeys.contracts.all, "end"] as const,
	},
	users: {},
	roles: {
		all: ["roles"] as const,
		lists: () => [...reactQueryKeys.roles.all, "list"] as const,
		list: (filters?: { page?: number; limit?: number; search?: string }) =>
			[...reactQueryKeys.roles.lists(), { filters }] as const,
		details: () => [...reactQueryKeys.roles.all, "detail"] as const,
		detail: (id: string | number) =>
			[...reactQueryKeys.roles.details(), id] as const,
		create: () => [...reactQueryKeys.roles.all, "create"] as const,
		update: () => [...reactQueryKeys.roles.all, "update"] as const,
		delete: () => [...reactQueryKeys.roles.all, "delete"] as const,
		members: (id: string | number) =>
			[...reactQueryKeys.roles.all, "members", id] as const,
	},
	permissions: {
		all: ["permissions"] as const,
		lists: () => [...reactQueryKeys.permissions.all, "list"] as const,
		list: (filters?: { page?: number; limit?: number; search?: string }) =>
			[...reactQueryKeys.permissions.lists(), { filters }] as const,
		dictionary: () =>
			[...reactQueryKeys.permissions.all, "dictionary"] as const,
	},
	jobTitles: {
		all: ["jobTitles"] as const,
		lists: () => [...reactQueryKeys.jobTitles.all, "list"] as const,
		list: (filters?: { page?: number; limit?: number; search?: string }) =>
			[...reactQueryKeys.jobTitles.lists(), { filters }] as const,
		details: () => [...reactQueryKeys.jobTitles.all, "detail"] as const,
		detail: (id: string | number) =>
			[...reactQueryKeys.jobTitles.details(), id] as const,
		create: () => [...reactQueryKeys.jobTitles.all, "create"] as const,
		update: () => [...reactQueryKeys.jobTitles.all, "update"] as const,
		delete: () => [...reactQueryKeys.jobTitles.all, "delete"] as const,
	},
	teams: {
		all: ["teams"] as const,
		lists: () => [...reactQueryKeys.teams.all, "list"] as const,
		list: (filters?: { page?: number; limit?: number; search?: string }) =>
			[...reactQueryKeys.teams.lists(), { filters }] as const,
		details: () => [...reactQueryKeys.teams.all, "detail"] as const,
		detail: (id: string | number) =>
			[...reactQueryKeys.teams.details(), id] as const,
		create: () => [...reactQueryKeys.teams.all, "create"] as const,
		update: () => [...reactQueryKeys.teams.all, "update"] as const,
		delete: () => [...reactQueryKeys.teams.all, "delete"] as const,
	},
	onboarding: {
		all: ["onboarding"] as const,
		lists: () => [...reactQueryKeys.onboarding.all, "list"] as const,
		list: (filters?: { page?: number; limit?: number; status?: string; employee_id?: number }) =>
			[...reactQueryKeys.onboarding.lists(), { filters }] as const,
		start: () => [...reactQueryKeys.onboarding.all, "start"] as const,
		work: (onboardingId: string) =>
			[...reactQueryKeys.onboarding.all, "work", onboardingId] as const,
		contract: (onboardingId: string) =>
			[...reactQueryKeys.onboarding.all, "contract", onboardingId] as const,
	},
	assets: {
		all: ["assets"] as const,
		lists: () => [...reactQueryKeys.assets.all, "list"] as const,
		list: (filters?: { page?: number; limit?: number; search?: string }) =>
			[...reactQueryKeys.assets.lists(), { filters }] as const,
		details: () => [...reactQueryKeys.assets.all, "detail"] as const,
		detail: (id: string | number) =>
			[...reactQueryKeys.assets.details(), id] as const,
		dictionary: () => [...reactQueryKeys.assets.all, "dictionary"] as const,
	},
	employees: {
		all: ["employees"] as const,
		lists: () => [...reactQueryKeys.employees.all, "list"] as const,
		list: (filters?: { page?: number; limit?: number; search?: string }) =>
			[...reactQueryKeys.employees.lists(), { filters }] as const,
		details: () => [...reactQueryKeys.employees.all, "detail"] as const,
		detail: (id: string | number) =>
			[...reactQueryKeys.employees.details(), id] as const,
		contract: (id: string | number) =>
			[...reactQueryKeys.employees.all, "contract", id] as const,
		documents: (id: string | number) =>
			[...reactQueryKeys.employees.all, "documents", id] as const,
		assets: (id: string | number) =>
			[...reactQueryKeys.employees.all, "assets", id] as const,
		attendanceTimeline: (id: string | number) =>
			[...reactQueryKeys.employees.all, "attendanceTimeline", id] as const,
		timeOffSummary: (id: string | number) =>
			[...reactQueryKeys.employees.all, "timeOffSummary", id] as const,
		overtimeSummary: (id: string | number) =>
			[...reactQueryKeys.employees.all, "overtimeSummary", id] as const,
		currentShift: (
			id: string | number,
			params?: {
				date?: string;
			}
		) =>
			[...reactQueryKeys.employees.all, "currentShift", id, { params }] as const,
		create: () => [...reactQueryKeys.employees.all, "create"] as const,
		update: () => [...reactQueryKeys.employees.all, "update"] as const,
		delete: () => [...reactQueryKeys.employees.all, "delete"] as const,
	},
	requests: {
		all: ["requests"] as const,
      attendance: {
         all: () => [...reactQueryKeys.requests.all, "attendance"] as const,
         lists: () => [...reactQueryKeys.requests.attendance.all(), "list"] as const,
         list: (filters?: any) => [...reactQueryKeys.requests.attendance.lists(), { filters }] as const,
         details: () => [...reactQueryKeys.requests.attendance.all(), "detail"] as const,
         detail: (id: string | number) => [...reactQueryKeys.requests.attendance.details(), id] as const,
         stats: () => [...reactQueryKeys.requests.attendance.all(), "stats"] as const,
         approve: () => [...reactQueryKeys.requests.attendance.all(), "approve"] as const,
         reject: () => [...reactQueryKeys.requests.attendance.all(), "reject"] as const,
      },
		timeOff: {
			all: () => [...reactQueryKeys.requests.all, "timeOff"] as const,
			lists: () => [...reactQueryKeys.requests.timeOff.all(), "list"] as const,
			list: (filters?: any) => [...reactQueryKeys.requests.timeOff.lists(), { filters }] as const,
			details: () => [...reactQueryKeys.requests.timeOff.all(), "detail"] as const,
			detail: (id: string | number) => [...reactQueryKeys.requests.timeOff.details(), id] as const,
			stats: () => [...reactQueryKeys.requests.timeOff.all(), "stats"] as const,
			approve: () => [...reactQueryKeys.requests.timeOff.all(), "approve"] as const,
			reject: () => [...reactQueryKeys.requests.timeOff.all(), "reject"] as const,
		},
		overtime: {
			all: () => [...reactQueryKeys.requests.all, "overtime"] as const,
			lists: () => [...reactQueryKeys.requests.overtime.all(), "list"] as const,
			list: (filters?: { page?: number; limit?: number; search?: string }) =>
				[...reactQueryKeys.requests.overtime.lists(), { filters }] as const,
			stats: () =>
				[...reactQueryKeys.requests.overtime.all(), "stats"] as const,
			details: () =>
				[...reactQueryKeys.requests.overtime.all(), "detail"] as const,
			detail: (id: number) =>
				[...reactQueryKeys.requests.overtime.details(), id] as const,
			approve: () =>
				[...reactQueryKeys.requests.overtime.all(), "approve"] as const,
			reject: () =>
				[...reactQueryKeys.requests.overtime.all(), "reject"] as const,
		},
	},
	support: {
		all: ["support"] as const,
		tickets: {
			all: () => [...reactQueryKeys.support.all, "tickets"] as const,
			lists: () => [...reactQueryKeys.support.tickets.all(), "list"] as const,
			list: (filters?: {
				page?: number;
				limit?: number;
				search?: string;
				status?: string | string[];
				category?: string | string[];
				priority?: string | string[];
				type?: string | string[];
				sort_by?: string;
				sort_order?: string;
				submitted_from?: string;
				submitted_to?: string;
				assigned_to_role?: string;
				assigned_to_employee_id?: number;
			}) => [...reactQueryKeys.support.tickets.lists(), { filters }] as const,
			details: () =>
				[...reactQueryKeys.support.tickets.all(), "detail"] as const,
			detail: (id: string | number) =>
				[...reactQueryKeys.support.tickets.details(), id] as const,
			meta: () => [...reactQueryKeys.support.tickets.all(), "meta"] as const,
			create: () =>
				[...reactQueryKeys.support.tickets.all(), "create"] as const,
			updateStatus: () =>
				[...reactQueryKeys.support.tickets.all(), "updateStatus"] as const,
			chatRoom: (ticketId: string | number) =>
				[...reactQueryKeys.support.tickets.all(), "chatRoom", ticketId] as const,
		},
	},
	invoices: {
		all: ["invoices"] as const,
		stats: () => [...reactQueryKeys.invoices.all, "stats"] as const,
		lists: () => [...reactQueryKeys.invoices.all, "list"] as const,
		list: (filters?: {
			page?: number;
			limit?: number;
			search?: string;
			status?: string;
			customer_id?: string | number;
			agent_id?: string | number;
			date_from?: string;
			date_to?: string;
			sort_by?: string;
			sort_order?: string;
		}) => [...reactQueryKeys.invoices.lists(), { filters }] as const,
		details: () => [...reactQueryKeys.invoices.all, "detail"] as const,
		detail: (id: string | number) =>
			[...reactQueryKeys.invoices.details(), id] as const,
		history: (id: string | number) =>
			[...reactQueryKeys.invoices.all, "history", id] as const,
		create: () => [...reactQueryKeys.invoices.all, "create"] as const,
		update: () => [...reactQueryKeys.invoices.all, "update"] as const,
		delete: () => [...reactQueryKeys.invoices.all, "delete"] as const,
		changeStatus: () =>
			[...reactQueryKeys.invoices.all, "changeStatus"] as const,
		void: () => [...reactQueryKeys.invoices.all, "void"] as const,
		recordPayment: () =>
			[...reactQueryKeys.invoices.all, "recordPayment"] as const,
		bulkPayments: () =>
			[...reactQueryKeys.invoices.all, "bulkPayments"] as const,
		lookup: {
			customers: () =>
				[...reactQueryKeys.invoices.all, "lookup", "customers"] as const,
			agents: () =>
				[...reactQueryKeys.invoices.all, "lookup", "agents"] as const,
			services: () =>
				[...reactQueryKeys.invoices.all, "lookup", "services"] as const,
			employees: () =>
				[...reactQueryKeys.invoices.all, "lookup", "employees"] as const,
		},
	},
	dashboard: {
		all: ["dashboard"] as const,
		overview: (filters?: {
			from_date?: string;
			to_date?: string;
			include?: string | string[];
		}) => [...reactQueryKeys.dashboard.all, "overview", { filters }] as const,
	},
	departments: {
		all: ["departments"] as const,
		lists: () => [...reactQueryKeys.departments.all, "list"] as const,
		list: (filters?: { page?: number; limit?: number; search?: string }) =>
			[...reactQueryKeys.departments.lists(), { filters }] as const,
		details: () => [...reactQueryKeys.departments.all, "detail"] as const,
		detail: (id: string | number) =>
			[...reactQueryKeys.departments.details(), id] as const,
		create: () => [...reactQueryKeys.departments.all, "create"] as const,
		update: () => [...reactQueryKeys.departments.all, "update"] as const,
		delete: () => [...reactQueryKeys.departments.all, "delete"] as const,
	},
	vacationTypes: {
		all: ["vacationTypes"] as const,
		lists: () => [...reactQueryKeys.vacationTypes.all, "list"] as const,
		list: () => [...reactQueryKeys.vacationTypes.lists()] as const,
	},
	customers: {
		all: ["customers"] as const,
		lists: () => [...reactQueryKeys.customers.all, "list"] as const,
		list: (filters?: { page?: number; limit?: number; search?: string }) =>
			[...reactQueryKeys.customers.lists(), { filters }] as const,
		details: () => [...reactQueryKeys.customers.all, "detail"] as const,
		detail: (id: string | number) =>
			[...reactQueryKeys.customers.details(), id] as const,
		create: () => [...reactQueryKeys.customers.all, "create"] as const,
		update: () => [...reactQueryKeys.customers.all, "update"] as const,
		delete: () => [...reactQueryKeys.customers.all, "delete"] as const,
	},
	agents: {
		all: ["agents"] as const,
		lists: () => [...reactQueryKeys.agents.all, "list"] as const,
		list: (filters?: { page?: number; limit?: number; search?: string }) =>
			[...reactQueryKeys.agents.lists(), { filters }] as const,
		details: () => [...reactQueryKeys.agents.all, "detail"] as const,
		detail: (id: string | number) =>
			[...reactQueryKeys.agents.details(), id] as const,
		create: () => [...reactQueryKeys.agents.all, "create"] as const,
		update: () => [...reactQueryKeys.agents.all, "update"] as const,
		delete: () => [...reactQueryKeys.agents.all, "delete"] as const,
	},
	categories: {
		all: ["categories"] as const,
		lists: () => [...reactQueryKeys.categories.all, "list"] as const,
		list: (filters?: { page?: number; limit?: number; search?: string }) =>
			[...reactQueryKeys.categories.lists(), { filters }] as const,
		details: () => [...reactQueryKeys.categories.all, "detail"] as const,
		detail: (id: string | number) =>
			[...reactQueryKeys.categories.details(), id] as const,
		create: () => [...reactQueryKeys.categories.all, "create"] as const,
		update: () => [...reactQueryKeys.categories.all, "update"] as const,
		delete: () => [...reactQueryKeys.categories.all, "delete"] as const,
	},
	services: {
		all: ["services"] as const,
		lists: () => [...reactQueryKeys.services.all, "list"] as const,
		list: (filters?: { page?: number; limit?: number; search?: string }) =>
			[...reactQueryKeys.services.lists(), { filters }] as const,
		details: () => [...reactQueryKeys.services.all, "detail"] as const,
		detail: (id: string | number) =>
			[...reactQueryKeys.services.details(), id] as const,
		create: () => [...reactQueryKeys.services.all, "create"] as const,
		update: () => [...reactQueryKeys.services.all, "update"] as const,
		delete: () => [...reactQueryKeys.services.all, "delete"] as const,
	},
	expenseTypes: {
		all: ["expenseTypes"] as const,
		lists: () => [...reactQueryKeys.expenseTypes.all, "list"] as const,
		list: (filters?: { page?: number; limit?: number; search?: string }) =>
			[...reactQueryKeys.expenseTypes.lists(), { filters }] as const,
		details: () => [...reactQueryKeys.expenseTypes.all, "detail"] as const,
		detail: (id: string | number) =>
			[...reactQueryKeys.expenseTypes.details(), id] as const,
		create: () => [...reactQueryKeys.expenseTypes.all, "create"] as const,
		update: () => [...reactQueryKeys.expenseTypes.all, "update"] as const,
		delete: () => [...reactQueryKeys.expenseTypes.all, "delete"] as const,
	},
	incomeTypes: {
		all: ["incomeTypes"] as const,
		lists: () => [...reactQueryKeys.incomeTypes.all, "list"] as const,
		list: (filters?: { page?: number; limit?: number; search?: string }) =>
			[...reactQueryKeys.incomeTypes.lists(), { filters }] as const,
		details: () => [...reactQueryKeys.incomeTypes.all, "detail"] as const,
		detail: (id: string | number) =>
			[...reactQueryKeys.incomeTypes.details(), id] as const,
		create: () => [...reactQueryKeys.incomeTypes.all, "create"] as const,
		update: () => [...reactQueryKeys.incomeTypes.all, "update"] as const,
		delete: () => [...reactQueryKeys.incomeTypes.all, "delete"] as const,
	},
	voucherTypes: {
		all: ["voucherTypes"] as const,
		lists: () => [...reactQueryKeys.voucherTypes.all, "list"] as const,
		list: (filters?: { page?: number; limit?: number; search?: string }) =>
			[...reactQueryKeys.voucherTypes.lists(), { filters }] as const,
		details: () => [...reactQueryKeys.voucherTypes.all, "detail"] as const,
		detail: (id: string | number) =>
			[...reactQueryKeys.voucherTypes.details(), id] as const,
		create: () => [...reactQueryKeys.voucherTypes.all, "create"] as const,
		update: () => [...reactQueryKeys.voucherTypes.all, "update"] as const,
		delete: () => [...reactQueryKeys.voucherTypes.all, "delete"] as const,
	},
	prettyCashNames: {
		all: ["prettyCashNames"] as const,
		lists: () => [...reactQueryKeys.prettyCashNames.all, "list"] as const,
		list: (filters?: { page?: number; limit?: number; search?: string }) =>
			[...reactQueryKeys.prettyCashNames.lists(), { filters }] as const,
		details: () => [...reactQueryKeys.prettyCashNames.all, "detail"] as const,
		detail: (id: string | number) =>
			[...reactQueryKeys.prettyCashNames.details(), id] as const,
		create: () => [...reactQueryKeys.prettyCashNames.all, "create"] as const,
		update: () => [...reactQueryKeys.prettyCashNames.all, "update"] as const,
		delete: () => [...reactQueryKeys.prettyCashNames.all, "delete"] as const,
	},
	banks: {
		all: ["banks"] as const,
		lists: () => [...reactQueryKeys.banks.all, "list"] as const,
		list: (filters?: { page?: number; limit?: number; search?: string }) =>
			[...reactQueryKeys.banks.lists(), { filters }] as const,
		details: () => [...reactQueryKeys.banks.all, "detail"] as const,
		detail: (id: string | number) =>
			[...reactQueryKeys.banks.details(), id] as const,
		create: () => [...reactQueryKeys.banks.all, "create"] as const,
		update: () => [...reactQueryKeys.banks.all, "update"] as const,
		delete: () => [...reactQueryKeys.banks.all, "delete"] as const,
	},
	financialAccountHistory: {
		all: ["financialAccountHistory"] as const,
		history: (
			id: string | number,
			filters?: {
				page?: number;
				limit?: number;
				from_date?: string;
				to_date?: string;
				source_type?: string;
				transaction_type?: string;
			}
		) => [...reactQueryKeys.financialAccountHistory.all, id, { filters }] as const,
	},
	vouchers: {
		payments: {
			all: () => ["vouchers", "payments"] as const,
			lists: () => [...reactQueryKeys.vouchers.payments.all(), "list"] as const,
			list: (filters?: {
				page?: number;
				limit?: number;
				search?: string;
				status?: string | string[];
				expense_type_id?: number;
				from_account_id?: number;
				to_account_id?: number;
				date_from?: string;
				date_to?: string;
				amount_from?: number;
				amount_to?: number;
				sort_by?: string;
				sort_order?: string;
			}) => [...reactQueryKeys.vouchers.payments.lists(), { filters }] as const,
			details: () =>
				[...reactQueryKeys.vouchers.payments.all(), "detail"] as const,
			detail: (id: number) =>
				[...reactQueryKeys.vouchers.payments.details(), id] as const,
			create: () =>
				[...reactQueryKeys.vouchers.payments.all(), "create"] as const,
			update: () =>
				[...reactQueryKeys.vouchers.payments.all(), "update"] as const,
			delete: () =>
				[...reactQueryKeys.vouchers.payments.all(), "delete"] as const,
			approve: () =>
				[...reactQueryKeys.vouchers.payments.all(), "approve"] as const,
			stats: () =>
				[...reactQueryKeys.vouchers.payments.all(), "stats"] as const,
			navigation: (id: number) =>
				[...reactQueryKeys.vouchers.payments.all(), "navigation", id] as const,
		},
		receipts: {
			all: () => ["vouchers", "receipts"] as const,
			lists: () => [...reactQueryKeys.vouchers.receipts.all(), "list"] as const,
			list: (filters?: {
				page?: number;
				limit?: number;
				search?: string;
				status?: string | string[];
				income_type_id?: number;
				to_account_id?: number;
				date_from?: string;
				date_to?: string;
				amount_from?: number;
				amount_to?: number;
				sort_by?: string;
				sort_order?: string;
			}) => [...reactQueryKeys.vouchers.receipts.lists(), { filters }] as const,
			details: () =>
				[...reactQueryKeys.vouchers.receipts.all(), "detail"] as const,
			detail: (id: number) =>
				[...reactQueryKeys.vouchers.receipts.details(), id] as const,
			create: () =>
				[...reactQueryKeys.vouchers.receipts.all(), "create"] as const,
			cancel: () =>
				[...reactQueryKeys.vouchers.receipts.all(), "cancel"] as const,
		},
	},
	legalCases: {
		all: ["legalCases"] as const,
		lists: () => [...reactQueryKeys.legalCases.all, "list"] as const,
		list: (filters?: Record<string, unknown>) =>
			[...reactQueryKeys.legalCases.lists(), { filters }] as const,
		details: () => [...reactQueryKeys.legalCases.all, "detail"] as const,
		detail: (id: string | number) =>
			[...reactQueryKeys.legalCases.details(), id] as const,
		create: () => [...reactQueryKeys.legalCases.all, "create"] as const,
		update: () => [...reactQueryKeys.legalCases.all, "update"] as const,
		delete: () => [...reactQueryKeys.legalCases.all, "delete"] as const,
		types: () => [...reactQueryKeys.legalCases.all, "types"] as const,
		employees: (id: string | number) =>
			[...reactQueryKeys.legalCases.all, "employees", id] as const,
		events: (id: string | number) =>
			[...reactQueryKeys.legalCases.all, "events", id] as const,
		documents: (id: string | number) =>
			[...reactQueryKeys.legalCases.all, "documents", id] as const,
		activities: (id: string | number) =>
			[...reactQueryKeys.legalCases.all, "activities", id] as const,
	},
	reports: {
		all: ["reports"] as const,
		list: (filters?: {
			search?: string;
			category?: string;
			sort_by?: string;
			sort_order?: "asc" | "desc";
		}) =>
			[...reactQueryKeys.reports.all, "list", { filters }] as const,
	},
	auth: {
		all: ["auth"] as const,
		login: () => [...reactQueryKeys.auth.all, "login"] as const,
		register: () => [...reactQueryKeys.auth.all, "register"] as const,
		logout: () => [...reactQueryKeys.auth.all, "logout"] as const,
		refresh: () => [...reactQueryKeys.auth.all, "refresh"] as const,
	},
} as const;
