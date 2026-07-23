/** @format */
import { getRuntimeEnv } from "@/config/runtimeEnv";

const endPoints = {
   baseurl: getRuntimeEnv(
      "VITE_API_BASE_URL",
      import.meta.env.VITE_API_BASE_URL || "https://api.bakcrm.com/api/v1",
   ),
   bucketUrl: getRuntimeEnv(
      "VITE_BUCKET_URL",
      import.meta.env.VITE_BUCKET_URL ||
         "https://bak-uploads-001.s3.me-central-1.amazonaws.com",
   ),
   auth: {
      login: "/auth/login",
      logout: "/auth/logout",
      refresh: "/auth/refresh",
      completeSignup: "/auth/complete-signup",
      changePassword: "/auth/change-password",
      passwordReset: {
         request: "/auth/password-reset/request",
         confirm: "/auth/password-reset/confirm",
      },
   },

   roles: {
      getAll: "/roles",
      getById: (id: string | number) => `/roles/${id}`,
      create: "/roles",
      update: (id: string | number) => `/roles/${id}`,
      delete: (id: string | number) => `/roles/${id}`,
      updatePermissions: (id: string | number) => `/roles/${id}/permissions`,
      duplicate: (id: string | number) => `/roles/${id}/duplicate`,
      getMembers: (id: string | number) => `/roles/${id}/members`,
   },

   permissions: {
      getAll: "/permissions",
      getDictionary: "/permissions/dictionary",
   },

   jobTitles: {
      getAll: "/job-titles",
      getById: (id: string | number) => `/job-titles/${id}`,
      create: "/job-titles",
      update: (id: string | number) => `/job-titles/${id}`,
      delete: (id: string | number) => `/job-titles/${id}`,
   },

   teams: {
      getAll: "/teams",
      getById: (id: string | number) => `/teams/${id}`,
      create: "/teams",
      update: (id: string | number) => `/teams/${id}`,
      delete: (id: string | number) => `/teams/${id}`,
   },

   uploads: {
      getSignedUrl: "/uploads/signed-url",
   },

   onboarding: {
      start: "/employees/onboarding/start",
      list: "/employees/onboarding",
      work: (onboardingId: string) =>
         `/employees/onboarding/${onboardingId}/work`,
      residency: (onboardingId: string) =>
         `/employees/onboarding/${onboardingId}/residency`,
      contract: (onboardingId: string) =>
         `/employees/onboarding/${onboardingId}/contract`,
      complete: (onboardingId: string) =>
         `/employees/onboarding/${onboardingId}/complete`,
      finalize: (onboardingId: string) =>
         `/employees/onboarding/${onboardingId}/finalize`,
      resendInvite: (onboardingId: string) =>
         `/employees/onboarding/${onboardingId}/invite/resend`,
   },

   contracts: {
      create: "/contracts",
      getAll: "/contracts",
      getById: (id: string | number) => `/contracts/${id}`,
      update: (id: string | number) => `/contracts/${id}`,
      delete: (id: string | number) => `/contracts/${id}`,
      end: (id: string | number) => `/employees/${id}/contract/terminate`,
   },

   assets: {
      getAll: "/assets",
      getById: (id: string | number) => `/assets/${id}`,
      create: "/assets",
      update: (id: string | number) => `/assets/${id}`,
      delete: (id: string | number) => `/assets/${id}`,
      listAssignments: (id: string | number) => `/assets/${id}/assignments`,
      assign: (id: string | number) => `/assets/${id}/assignments`,
      return: (id: string | number) => `/assets/${id}/return`,
      transfer: (id: string | number) => `/assets/${id}/transfer`,
   },

   employees: {
      getAll: "/employees",
      getByIdBasic: (id: string | number) => `/employees/${id}`,
      getByIdDetails: (id: string | number) => `/employees/${id}/details`,
      getCurrentShift: (id: string | number) =>
         `/employees/${id}/current-shift`,
      getContract: (id: string | number) => `/employees/${id}/contract`,
      getDocuments: (id: string | number) => `/employees/${id}/documents`,
      getAssets: (id: string | number) => `/employees/${id}/assets`,
      extendContract: (id: string | number) =>
         `/employees/${id}/contract/extend`,
      addAttendance: (id: string | number) => `/employees/${id}/attendance`,
      addOvertime: (id: string | number) => `/employees/${id}/overtime`,
      addTimeOff: (id: string | number) => `/employees/${id}/time-off`,
      addHourLeaves: (id: string | number) => `/employees/${id}/hour-leaves`,
      getAttendanceTimeline: (id: string | number) =>
         `/employees/${id}/timeline`,
      getTimeOffSummary: (id: string | number) =>
         `/employees/${id}/time-off/summary`,
      getOvertimeSummary: (id: string | number) =>
         `/employees/${id}/overtime/summary`,
      updateResidency: (permitId: string | number) => `/residency/${permitId}`,
      resetPermissions: (id: string | number) =>
         `/employees/${id}/reset-permissions`,
      getPermissions: (id: string | number) => `/employees/${id}/permissions`,
      updatePermissions: (id: string | number) =>
         `/employees/${id}/permissions`,
      stats: "/employees/stats",
   },

   requests: {
      attendance: {
         getAll: "/requests/attendance",
         stats: "/requests/attendance/stats",
         getById: (id: string | number) => `/requests/attendance/${id}`,
         approve: (id: string | number) => `/requests/attendance/${id}/approve`,
         reject: (id: string | number) => `/requests/attendance/${id}/reject`,
         adminCheckIn: "/requests/attendance/admin-check-in",
         adminCheckOut: "/requests/attendance/admin-check-out",
         breakStart: "/requests/attendance/break-start",
         breakEnd: "/requests/attendance/break-end",
      },
      timeOff: {
         getAll: "/requests/vacations",
         stats: "/requests/vacations/stats",
         getById: (id: string | number) => `/requests/vacations/${id}`,
         approve: (id: string | number) => `/requests/vacations/${id}/approve`,
         reject: (id: string | number) => `/requests/vacations/${id}/reject`,
      },
      overtime: {
         getAll: "/requests/overtime",
         stats: "/requests/overtime/stats",
         getById: (id: number) => `/requests/overtime/${id}`,
         approve: (id: number) => `/requests/overtime/${id}/approve`,
         reject: (id: number) => `/requests/overtime/${id}/reject`,
      },
   },

   vacationTypes: {
      getAll: "/vacation-types",
   },

   support: {
      tickets: {
         getAll: "/support/tickets",
         getById: (id: string | number) => `/support/tickets/${id}`,
         getMeta: "/support/tickets/meta",
         create: "/support/tickets",
         updateStatus: (id: string | number) => `/support/tickets/${id}/status`,
         chatRoom: (id: string | number) => `/support/tickets/${id}/chat-room`,
         archiveRoom: (id: string | number) =>
            `/support/tickets/${id}/archive-room`,
      },
   },

   chat: {
      getUsers: "/chat/users",
      getRooms: "/chat/rooms",
      getRoom: (id: string | number) => `/chat/rooms/${id}`,
      createGroupRoom: "/chat/rooms/group",
      createDirectRoom: "/chat/rooms/direct",
      updateRoom: (id: string | number) => `/chat/rooms/${id}`,
      pinRoom: (id: string | number) => `/chat/rooms/${id}/pin`,
      unpinRoom: (id: string | number) => `/chat/rooms/${id}/pin`,
      getMessages: (id: string | number) => `/chat/rooms/${id}/messages`,
      sendMessage: (id: string | number) => `/chat/rooms/${id}/messages`,
      addMember: (id: string | number) => `/chat/rooms/${id}/members`,
      removeMember: (roomId: string | number, employeeId: string | number) =>
         `/chat/rooms/${roomId}/members/${employeeId}`,
      markRead: (id: string | number) => `/chat/rooms/${id}/read`,
      getUnreadCount: (id: string | number) => `/chat/rooms/${id}/unread`,
      getTotalUnread: "/chat/unread-total",
   },

   invoices: {
      stats: "/invoices/stats",
      getAll: "/invoices",
      getById: (id: string | number) => `/invoices/${id}`,
      create: "/invoices",
      update: (id: string | number) => `/invoices/${id}`,
      delete: (id: string | number) => `/invoices/${id}`,
      changeStatus: (id: string | number) => `/invoices/${id}/status`,
      makeVoid: (id: string | number) => `/invoices/${id}/make_void`,
      addItem: (id: string | number) => `/invoices/${id}/items`,
      updateItem: (id: string | number, itemId: string | number) =>
         `/invoices/${id}/items/${itemId}`,
      deleteItem: (id: string | number, itemId: string | number) =>
         `/invoices/${id}/items/${itemId}`,
      recordPayment: (id: string | number) => `/invoices/${id}/payments`,
      bulkPayments: "/invoices/bulk/payments",
      getHistory: (id: string | number) => `/invoices/${id}/history`,
      lookupCustomers: "/invoices/lookup/customers",
      lookupAgents: "/invoices/lookup/agents",
      lookupServices: "/invoices/lookup/services",
      lookupEmployees: "/invoices/lookup/employees",
   },

   dashboard: {
      overview: "/dashboard/overview",
   },

   legalCases: {
      getAll: "/legal-cases",
      getById: (id: string | number) => `/legal-cases/${id}`,
      create: "/legal-cases",
      update: (id: string | number) => `/legal-cases/${id}`,
      delete: (id: string | number) => `/legal-cases/${id}`,
      getTypes: "/legal-cases/types",
      createType: "/legal-cases/types",
      getEmployees: (id: string | number) => `/legal-cases/${id}/employees`,
      assignEmployee: (id: string | number) => `/legal-cases/${id}/employees`,
      removeEmployee: (caseId: string | number, employeeId: string | number) =>
         `/legal-cases/${caseId}/employees/${employeeId}`,
      getEvents: (id: string | number) => `/legal-cases/${id}/events`,
      createEvent: (id: string | number) => `/legal-cases/${id}/events`,
      updateEvent: (caseId: string | number, eventId: string | number) =>
         `/legal-cases/${caseId}/events/${eventId}`,
      getDocuments: (id: string | number) => `/legal-cases/${id}/documents`,
      attachDocument: (id: string | number) => `/legal-cases/${id}/documents`,
      removeDocument: (caseId: string | number, documentId: string | number) =>
         `/legal-cases/${caseId}/documents/${documentId}`,
      getActivities: (id: string | number) => `/legal-cases/${id}/activities`,
   },

   departments: {
      getAll: "/service-catalog/departments",
      getById: (id: string | number) => `/service-catalog/departments/${id}`,
      create: "/service-catalog/departments",
      update: (id: string | number) => `/service-catalog/departments/${id}`,
      delete: (id: string | number) => `/service-catalog/departments/${id}`,
   },

   categories: {
      getAll: "/service-catalog/categories",
      getById: (id: string | number) => `/service-catalog/categories/${id}`,
      create: "/service-catalog/categories",
      update: (id: string | number) => `/service-catalog/categories/${id}`,
      delete: (id: string | number) => `/service-catalog/categories/${id}`,
   },

   payrolls: {
      getAll: "/payrolls",
      create: "/payrolls",
      getById: (id: string | number) => `/payrolls/${id}`,
      getItems: (id: string | number) => `/payrolls/${id}/items`,
      createItem: (id: string | number) => `/payrolls/${id}/items`,
      updateItem: (id: string | number, itemId: string | number) =>
         `/payrolls/${id}/items/${itemId}`,
      deleteItem: (id: string | number, itemId: string | number) =>
         `/payrolls/${id}/items/${itemId}`,
      getForEmployee: (employeeId: string | number) =>
         `/employees/${employeeId}/payrolls`,
      export: (id: string | number) => `/payrolls/${id}/export`,
      createVoucher: (id: string | number) => `/payrolls/${id}/vouchers`,
      approve: (id: string | number) => `/payrolls/${id}/approve`,
   },

   services: {
      getAll: "/service-catalog/services",
      getById: (id: string | number) => `/service-catalog/services/${id}`,
      create: "/service-catalog/services",
      update: (id: string | number) => `/service-catalog/services/${id}`,
      delete: (id: string | number) => `/service-catalog/services/${id}`,
   },

   customers: {
      getAll: "/service-catalog/customers",
      getById: (id: string | number) => `/service-catalog/customers/${id}`,
      create: "/service-catalog/customers",
      update: (id: string | number) => `/service-catalog/customers/${id}`,
      delete: (id: string | number) => `/service-catalog/customers/${id}`,
   },

   agents: {
      getAll: "/service-catalog/agents",
      getById: (id: string | number) => `/service-catalog/agents/${id}`,
      create: "/service-catalog/agents",
      update: (id: string | number) => `/service-catalog/agents/${id}`,
      delete: (id: string | number) => `/service-catalog/agents/${id}`,
   },

   expenseTypes: {
      getAll: "/financial-settings/expense-types",
      getById: (id: string | number) =>
         `/financial-settings/expense-types/${id}`,
      create: "/financial-settings/expense-types",
      update: (id: string | number) =>
         `/financial-settings/expense-types/${id}`,
      delete: (id: string | number) =>
         `/financial-settings/expense-types/${id}`,
   },

   incomeTypes: {
      getAll: "/financial-settings/income-types",
      getById: (id: string | number) =>
         `/financial-settings/income-types/${id}`,
      create: "/financial-settings/income-types",
      update: (id: string | number) => `/financial-settings/income-types/${id}`,
      delete: (id: string | number) => `/financial-settings/income-types/${id}`,
   },

   voucherTypes: {
      getAll: "/financial-settings/voucher-types",
      getById: (id: string | number) =>
         `/financial-settings/voucher-types/${id}`,
      create: "/financial-settings/voucher-types",
      update: (id: string | number) =>
         `/financial-settings/voucher-types/${id}`,
      delete: (id: string | number) =>
         `/financial-settings/voucher-types/${id}`,
   },

   prettyCashNames: {
      getAll: "/financial-settings/petty-cash",
      getById: (id: string | number) => `/financial-settings/petty-cash/${id}`,
      create: "/financial-settings/petty-cash",
      update: (id: string | number) => `/financial-settings/petty-cash/${id}`,
      delete: (id: string | number) => `/financial-settings/petty-cash/${id}`,
   },

   banks: {
      getAll: "/financial-settings/banks",
      getById: (id: string | number) => `/financial-settings/banks/${id}`,
      create: "/financial-settings/banks",
      update: (id: string | number) => `/financial-settings/banks/${id}`,
      delete: (id: string | number) => `/financial-settings/banks/${id}`,
   },

   financialAccounts: {
      getHistory: (id: string | number) => `/financial-accounts/${id}/history`,
   },

   vouchers: {
      getAll: "/vouchers",
      getById: (id: string | number) => `/vouchers/${id}`,
      create: "/vouchers",
      update: (id: string | number) => `/vouchers/${id}`,
      delete: (id: string | number) => `/vouchers/${id}`,
      payments: {
         list: "/vouchers/payments",
         getById: (voucherId: number) => `/vouchers/payments/${voucherId}`,
         create: "/vouchers/payments",
         update: (voucherId: number) => `/vouchers/payments/${voucherId}`,
         delete: (voucherId: number) => `/vouchers/payments/${voucherId}`,
         approve: (voucherId: number) =>
            `/vouchers/payments/${voucherId}/approve`,
         linkInvoice: (voucherId: number) =>
            `/vouchers/payments/${voucherId}/invoices`,
         unlinkInvoice: (voucherId: number, invoiceId: number) =>
            `/vouchers/payments/${voucherId}/invoices/${invoiceId}`,
         navigation: (voucherId: number) =>
            `/vouchers/payments/${voucherId}/navigation`,
         stats: "/vouchers/payments/stats",
      },
      receipts: {
         list: "/vouchers/receipts",
         getById: (receiptId: number) => `/vouchers/receipts/${receiptId}`,
         create: "/vouchers/receipts",
         update: (receiptId: number) => `/vouchers/receipts/${receiptId}`,
         approve: (receiptId: number) =>
            `/vouchers/receipts/${receiptId}/approve`,
         cancel: (receiptId: number) =>
            `/vouchers/receipts/${receiptId}/cancel`,
         linkInvoice: (receiptId: number) =>
            `/vouchers/receipts/${receiptId}/invoices`,
         unlinkInvoice: (receiptId: number, invoiceId: number) =>
            `/vouchers/receipts/${receiptId}/invoices/${invoiceId}`,
         navigation: (receiptId: number) =>
            `/vouchers/receipts/${receiptId}/navigation`,
         stats: "/vouchers/receipts/stats",
      },
   },

   shifts: {
      getAll: "/shifts",
      getById: (id: string | number) => `/shifts/${id}`,
      create: "/shifts",
      update: (id: string | number) => `/shifts/${id}`,
      archive: (id: string | number) => `/shifts/${id}/archive`,
      schedule: "/shifts/schedule",
      assignEmployees: (id: string | number) => `/shifts/${id}/assignments`,
      getEmployees: (id: string | number) => `/shifts/${id}/employees`,
      getCurrent: "/shifts/current",
      getByEmployeeId: (employeeId: string | number) =>
         `/shifts/employee/${employeeId}`,
   },

   holidays: {
      getAll: "/holidays",
      getById: (id: string | number) => `/holidays/${id}`,
      create: "/holidays",
      update: (id: string | number) => `/holidays/${id}`,
      delete: (id: string | number) => `/holidays/${id}`,
   },

   officeLocations: {
      getAll: "/office-locations",
      getById: (id: string | number) => `/office-locations/${id}`,
      create: "/office-locations",
      update: (id: string | number) => `/office-locations/${id}`,
      delete: (id: string | number) => `/office-locations/${id}`,
   },

   reports: {
      list: "/reports/bi",
      export: (key: string) => `/reports/bi/${key}`,
   },
};

export default endPoints;
export { endPoints };
