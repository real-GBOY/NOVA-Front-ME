export type PermissionPreset = {
   name: string;
   label: string;
   description: string;
   permissions: Array<{ permission_name: string; scope?: string }>;
};

const EMPLOYEE_BASE_PERMISSIONS: PermissionPreset["permissions"] = [
   { permission_name: "dashboard.view" },
   { permission_name: "read_employee_basic" },
   { permission_name: "read_employee_detailed" },
   { permission_name: "read_employee_documents" },
   { permission_name: "read_asset" },
   { permission_name: "read_assets" },
   { permission_name: "read_holidays" },
   { permission_name: "view_attendance_requests" },
   { permission_name: "view_vacation_requests" },
   { permission_name: "view_overtime_requests" },
   { permission_name: "view_support_tickets" },
   { permission_name: "create_support_ticket" },
];

const dedupePermissions = (
   permissions: PermissionPreset["permissions"]
): PermissionPreset["permissions"] => {
   const seen = new Set<string>();
   return permissions.filter((permission) => {
      if (seen.has(permission.permission_name)) {
         return false;
      }
      seen.add(permission.permission_name);
      return true;
   });
};

const TEAM_LEAD_EXTRA_PERMISSIONS: PermissionPreset["permissions"] = [
   { permission_name: "read_team" },
   { permission_name: "approve_attendance" },
   { permission_name: "approve_attendance_requests" },
   { permission_name: "approve_vacation" },
   { permission_name: "approve_vacation_requests" },
   { permission_name: "approve_overtime" },
   { permission_name: "approve_overtime_requests" },
];

const TEAM_LEAD_PERMISSIONS: PermissionPreset["permissions"] = [
   ...EMPLOYEE_BASE_PERMISSIONS,
   ...TEAM_LEAD_EXTRA_PERMISSIONS,
];

const HR_MANAGER_EXTRA_PERMISSIONS: PermissionPreset["permissions"] = [
   { permission_name: "add_employee" },
   { permission_name: "update_employee" },
   { permission_name: "deactivate_employee" },
   { permission_name: "manage_employee_documents" },
   { permission_name: "read_team" },
   { permission_name: "create_team" },
   { permission_name: "update_team" },
   { permission_name: "delete_team" },
   { permission_name: "read_job_title" },
   { permission_name: "create_job_title" },
   { permission_name: "update_job_title" },
   { permission_name: "delete_job_title" },
   { permission_name: "read_role" },
   { permission_name: "read_role_member" },
   { permission_name: "read_contract" },
   { permission_name: "read_employee_contract" },
   { permission_name: "create_contract" },
   { permission_name: "update_contract" },
   { permission_name: "terminate_contract" },
   { permission_name: "attach_contract_file" },
   { permission_name: "manage_contracts" },
   { permission_name: "manage_attendance" },
   { permission_name: "approve_attendance" },
   { permission_name: "approve_attendance_requests" },
   { permission_name: "approve_vacation" },
   { permission_name: "approve_vacation_requests" },
   { permission_name: "approve_overtime" },
   { permission_name: "approve_overtime_requests" },
   { permission_name: "manage_holidays" },
   { permission_name: "shift.view" },
   { permission_name: "shift.assign" },
   { permission_name: "shift.manage" },
];

const HR_MANAGER_PERMISSIONS: PermissionPreset["permissions"] = [
   ...EMPLOYEE_BASE_PERMISSIONS,
   ...HR_MANAGER_EXTRA_PERMISSIONS,
];

const OPERATIONS_MANAGER_EXTRA_PERMISSIONS: PermissionPreset["permissions"] = [
   { permission_name: "view_employees" },
   { permission_name: "create_asset" },
   { permission_name: "update_asset" },
   { permission_name: "delete_asset" },
   { permission_name: "assign_asset" },
   { permission_name: "return_asset" },
   { permission_name: "manage_assets" },
   { permission_name: "read_office_info" },
   { permission_name: "manage_office_info" },
   { permission_name: "manage_holidays" },
   { permission_name: "shift.view" },
   { permission_name: "shift.assign" },
   { permission_name: "shift.manage" },
];

const OPERATIONS_MANAGER_PERMISSIONS: PermissionPreset["permissions"] = [
   ...EMPLOYEE_BASE_PERMISSIONS,
   ...OPERATIONS_MANAGER_EXTRA_PERMISSIONS,
];

const FINANCE_MANAGER_EXTRA_PERMISSIONS: PermissionPreset["permissions"] = [
   { permission_name: "view_vouchers" },
   { permission_name: "create_vouchers" },
   { permission_name: "update_vouchers" },
   { permission_name: "delete_vouchers" },
   { permission_name: "approve_vouchers" },
   { permission_name: "view_invoices" },
   { permission_name: "create_invoice" },
   { permission_name: "update_invoice" },
   { permission_name: "delete_invoice" },
   { permission_name: "manage_invoice_payments" },
   { permission_name: "read_customer" },
   { permission_name: "view_customers" },
   { permission_name: "create_customer" },
   { permission_name: "update_customer" },
   { permission_name: "delete_customer" },
   { permission_name: "view_agents" },
   { permission_name: "create_agent" },
   { permission_name: "update_agent" },
   { permission_name: "delete_agent" },
   { permission_name: "view_employees" },
   { permission_name: "view_banks" },
   { permission_name: "create_bank" },
   { permission_name: "view_petty_cash" },
   { permission_name: "create_petty_cash" },
   { permission_name: "view_expense_types" },
   { permission_name: "create_expense_type" },
   { permission_name: "create_voucher_type" },
];

const FINANCE_MANAGER_PERMISSIONS: PermissionPreset["permissions"] = [
   ...EMPLOYEE_BASE_PERMISSIONS,
   ...FINANCE_MANAGER_EXTRA_PERMISSIONS,
];

const PAYROLL_SPECIALIST_EXTRA_PERMISSIONS: PermissionPreset["permissions"] = [
   { permission_name: "read_employee_contract" },
   { permission_name: "view_employees" },
   { permission_name: "payroll.view_basic" },
   { permission_name: "payroll.run_create" },
   { permission_name: "payroll.manage_items" },
   { permission_name: "payroll.export" },
   { permission_name: "payroll.approve" },
   { permission_name: "payroll.create" },
   { permission_name: "voucher.create" },
   { permission_name: "view_vouchers" },
];

const PAYROLL_SPECIALIST_PERMISSIONS: PermissionPreset["permissions"] = [
   ...EMPLOYEE_BASE_PERMISSIONS,
   ...PAYROLL_SPECIALIST_EXTRA_PERMISSIONS,
];

const SUPPORT_AGENT_EXTRA_PERMISSIONS: PermissionPreset["permissions"] = [
   { permission_name: "update_support_ticket" },
   { permission_name: "initiate_room_support_ticket" },
];

const SUPPORT_AGENT_PERMISSIONS: PermissionPreset["permissions"] = [
   ...EMPLOYEE_BASE_PERMISSIONS,
   ...SUPPORT_AGENT_EXTRA_PERMISSIONS,
];

const LEGAL_COUNSEL_EXTRA_PERMISSIONS: PermissionPreset["permissions"] = [
   { permission_name: "read_legal_case" },
   { permission_name: "create_legal_case" },
   { permission_name: "update_legal_case" },
   { permission_name: "delete_legal_case" },
   { permission_name: "read_legal_case_type" },
   { permission_name: "read_contract" },
   { permission_name: "read_employee_contract" },
];

const LEGAL_COUNSEL_PERMISSIONS: PermissionPreset["permissions"] = [
   ...EMPLOYEE_BASE_PERMISSIONS,
   ...LEGAL_COUNSEL_EXTRA_PERMISSIONS,
];

const SYSTEM_ADMIN_EXTRA_PERMISSIONS: PermissionPreset["permissions"] = [
   { permission_name: "add_employee" },
   { permission_name: "update_employee" },
   { permission_name: "deactivate_employee" },
   { permission_name: "grant_permission" },
   { permission_name: "manage_employee_documents" },
   { permission_name: "read_employee_permissions" },
   { permission_name: "resume_adding_employee" },
   { permission_name: "read_permission" },
   { permission_name: "read_team" },
   { permission_name: "create_team" },
   { permission_name: "update_team" },
   { permission_name: "delete_team" },
   { permission_name: "read_role" },
   { permission_name: "read_role_member" },
   { permission_name: "create_role" },
   { permission_name: "update_role" },
   { permission_name: "delete_role" },
   { permission_name: "read_job_title" },
   { permission_name: "create_job_title" },
   { permission_name: "update_job_title" },
   { permission_name: "delete_job_title" },
   { permission_name: "read_contract" },
   { permission_name: "read_employee_contract" },
   { permission_name: "create_contract" },
   { permission_name: "update_contract" },
   { permission_name: "terminate_contract" },
   { permission_name: "attach_contract_file" },
   { permission_name: "manage_contracts" },
   { permission_name: "manage_attendance" },
   { permission_name: "approve_attendance" },
   { permission_name: "approve_attendance_requests" },
   { permission_name: "approve_vacation" },
   { permission_name: "approve_vacation_requests" },
   { permission_name: "approve_overtime" },
   { permission_name: "approve_overtime_requests" },
   { permission_name: "manage_overtime_requests" },
   { permission_name: "manage_vacation_requests" },
   { permission_name: "create_asset" },
   { permission_name: "update_asset" },
   { permission_name: "delete_asset" },
   { permission_name: "create_asset_category" },
   { permission_name: "update_asset_category" },
   { permission_name: "delete_asset_category" },
   { permission_name: "assign_asset" },
   { permission_name: "return_asset" },
   { permission_name: "manage_assets" },
   { permission_name: "read_office_info" },
   { permission_name: "manage_office_info" },
   { permission_name: "manage_holidays" },
   { permission_name: "shift.view" },
   { permission_name: "shift.assign" },
   { permission_name: "shift.manage" },
   { permission_name: "read_legal_case" },
   { permission_name: "create_legal_case" },
   { permission_name: "update_legal_case" },
   { permission_name: "delete_legal_case" },
   { permission_name: "read_legal_case_type" },
   { permission_name: "create_legal_case_type" },
   { permission_name: "update_support_ticket" },
   { permission_name: "initiate_room_support_ticket" },
   { permission_name: "view_vouchers" },
   { permission_name: "create_vouchers" },
   { permission_name: "update_vouchers" },
   { permission_name: "delete_vouchers" },
   { permission_name: "approve_vouchers" },
   { permission_name: "view_invoices" },
   { permission_name: "create_invoice" },
   { permission_name: "update_invoice" },
   { permission_name: "delete_invoice" },
   { permission_name: "manage_invoice_payments" },
   { permission_name: "read_customer" },
   { permission_name: "view_customers" },
   { permission_name: "create_customer" },
   { permission_name: "update_customer" },
   { permission_name: "delete_customer" },
   { permission_name: "view_agents" },
   { permission_name: "create_agent" },
   { permission_name: "update_agent" },
   { permission_name: "delete_agent" },
   { permission_name: "view_employees" },
   { permission_name: "view_banks" },
   { permission_name: "create_bank" },
   { permission_name: "update_bank" },
   { permission_name: "delete_bank" },
   { permission_name: "view_petty_cash" },
   { permission_name: "create_petty_cash" },
   { permission_name: "update_petty_cash" },
   { permission_name: "delete_petty_cash" },
   { permission_name: "view_expense_types" },
   { permission_name: "create_expense_type" },
   { permission_name: "update_expense_type" },
   { permission_name: "delete_expense_type" },
   { permission_name: "create_voucher_type" },
   { permission_name: "view_receipt_vouchers" },
   { permission_name: "create_receipt_vouchers" },
   { permission_name: "update_receipt_vouchers" },
   { permission_name: "delete_receipt_vouchers" },
   { permission_name: "view_departments" },
   { permission_name: "create_department" },
   { permission_name: "update_department" },
   { permission_name: "delete_department" },
   { permission_name: "view_categories" },
   { permission_name: "create_category" },
   { permission_name: "update_category" },
   { permission_name: "delete_category" },
   { permission_name: "view_services" },
   { permission_name: "create_service" },
   { permission_name: "update_service" },
   { permission_name: "delete_service" },
   { permission_name: "payroll.view_basic" },
   { permission_name: "payroll.run_create" },
   { permission_name: "payroll.manage_items" },
   { permission_name: "payroll.export" },
   { permission_name: "payroll.approve" },
   { permission_name: "payroll.finalize" },
   { permission_name: "payroll.create" },
   { permission_name: "voucher.create" },
   { permission_name: "payroll.voucher_create" },
   { permission_name: "audit_logs.view" },
   { permission_name: "reports.view" },
];

const SYSTEM_ADMIN_PERMISSIONS: PermissionPreset["permissions"] = dedupePermissions([
   ...EMPLOYEE_BASE_PERMISSIONS,
   ...TEAM_LEAD_EXTRA_PERMISSIONS,
   ...HR_MANAGER_EXTRA_PERMISSIONS,
   ...OPERATIONS_MANAGER_EXTRA_PERMISSIONS,
   ...FINANCE_MANAGER_EXTRA_PERMISSIONS,
   ...PAYROLL_SPECIALIST_EXTRA_PERMISSIONS,
   ...SUPPORT_AGENT_EXTRA_PERMISSIONS,
   ...LEGAL_COUNSEL_EXTRA_PERMISSIONS,
   ...SYSTEM_ADMIN_EXTRA_PERMISSIONS,
]);

export const PERMISSION_PRESETS: PermissionPreset[] = [
   {
      name: "employee",
      label: "Employee",
      description: "Self-service access and support tickets",
      permissions: EMPLOYEE_BASE_PERMISSIONS,
   },
   {
      name: "team_lead",
      label: "Team Lead",
      description: "Team visibility and attendance/time-off approvals",
      permissions: TEAM_LEAD_PERMISSIONS,
   },
   {
      name: "hr_manager",
      label: "HR Manager",
      description: "People ops, contracts, shifts, and time management",
      permissions: HR_MANAGER_PERMISSIONS,
   },
   {
      name: "operations_manager",
      label: "Operations Manager",
      description: "Assets, office info, holidays, and shifts",
      permissions: OPERATIONS_MANAGER_PERMISSIONS,
   },
   {
      name: "finance_manager",
      label: "Finance Manager",
      description: "Vouchers, invoices, and finance settings",
      permissions: FINANCE_MANAGER_PERMISSIONS,
   },
   {
      name: "payroll_specialist",
      label: "Payroll Specialist",
      description: "Payroll runs, approvals, and exports",
      permissions: PAYROLL_SPECIALIST_PERMISSIONS,
   },
   {
      name: "support_agent",
      label: "Support Agent",
      description: "Support tickets and customer updates",
      permissions: SUPPORT_AGENT_PERMISSIONS,
   },
   {
      name: "legal_counsel",
      label: "Legal Counsel",
      description: "Legal cases and contract visibility",
      permissions: LEGAL_COUNSEL_PERMISSIONS,
   },
   {
      name: "system_admin",
      label: "System Admin",
      description: "Broad access across all modules",
      permissions: SYSTEM_ADMIN_PERMISSIONS,
   },
];
