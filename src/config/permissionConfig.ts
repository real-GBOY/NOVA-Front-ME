/** @format */

/**
 * Centralized permission configuration for the application.
 * Defines required permissions, their dependencies, and behavior.
 */

// Permission names as constants
export const PERMISSION_NAMES = {
   READ_ROLE: "read_role",
   READ_EMPLOYEE_BASIC: "read_employee_basic",
   READ_EMPLOYEE_DETAILED: "read_employee_detailed",
   READ_TEAM: "read_team",
   READ_OFFICE_INFO: "read_office_info",
   READ_JOB_TITLE: "read_job_title",
   READ_LEGAL_CASE_TYPE: "read_legal_case_type",
} as const;

export type PermissionName = (typeof PERMISSION_NAMES)[keyof typeof PERMISSION_NAMES];

/**
 * Permission rule configuration
 */
export interface PermissionRule {
   /** The permission name */
   name: string;
   /** Is this permission always required (cannot be unchecked)? */
   alwaysRequired: boolean;
   /** Should this permission be checked by default when creating a new role? */
   defaultChecked: boolean;
   /** Permission that must be checked for this one to become required */
   requiredWhen?: string | string[];
   /** Permissions that should be automatically enabled/disabled when this one changes */
   children?: string[];
}

/**
 * Pattern-based permission relationships
 * 
 * These define relationships based on permission name patterns.
 * For example: create_vouchers -> view_vouchers, approve_vouchers
 * 
 * Format: { parentPrefix: childPrefixes[] }
 * When a "create_X" permission is checked, "view_X" and "approve_X" become children
 */
export const PERMISSION_PATTERNS: Record<string, string[]> = {
   // When create_* is checked, view_* and approve_* for the same entity become children
   create: ["view", "approve"],
   // When manage_* is checked, view_* (and read_*) for the same entity become children
   manage: ["view"],
   update: ["view"],
   delete: ["view"],
};

/**
 * Grouped permissions configuration
 * 
 * These are virtual "umbrella" permissions that control multiple underlying permissions.
 * The UI shows only the group, but toggling it affects all child permissions.
 * 
 * Example: "Financial Settings" shows 4 options (View, Create, Edit, Delete)
 * but each controls multiple underlying permissions.
 */
export interface PermissionGroup {
   /** The category name that this group replaces */
   category: string;
   /** Display name for the group */
   displayName: string;
   /** Virtual permissions that users see */
   virtualPermissions: {
      /** Virtual permission name (used internally) */
      name: string;
      /** Display label */
      label: string;
      /** The action prefix to match (view, create, update, delete) */
      actionPrefix: string;
   }[];
   /** Patterns to match for underlying permissions in this category */
   permissionPatterns: string[];
}

/**
 * Financial settings permissions are grouped into 4 virtual permissions
 * Each virtual permission controls all matching underlying permissions.
 */
export const PERMISSION_GROUPS: PermissionGroup[] = [
   {
      category: "Financial-settings",
      displayName: "Financial Settings",
      virtualPermissions: [
         { name: "view_financial_settings", label: "View Financial Settings", actionPrefix: "view" },
         { name: "create_financial_settings", label: "Create Financial Settings", actionPrefix: "create" },
         { name: "edit_financial_settings", label: "Edit Financial Settings", actionPrefix: "update" },
         { name: "delete_financial_settings", label: "Delete Financial Settings", actionPrefix: "delete" },
      ],
      // These patterns match the entity names in financial settings permissions
      permissionPatterns: ["bank", "expense_type", "petty_cash", "receipt_vouchers", "voucher_type"],
   },
   {
      category: "service-catalog",
      displayName: "Service Catalog",
      virtualPermissions: [
         { name: "view_service_catalog", label: "View Service Catalog", actionPrefix: "view" },
         { name: "create_service_catalog", label: "Create Service Catalog", actionPrefix: "create" },
         { name: "edit_service_catalog", label: "Edit Service Catalog", actionPrefix: "update" },
         { name: "delete_service_catalog", label: "Delete Service Catalog", actionPrefix: "delete" },
      ],
      permissionPatterns: ["service", "department", "category", "customer", "agent"],
   },
];

/**
 * Get a permission group by category name
 */
export const getPermissionGroup = (categoryName: string): PermissionGroup | undefined => {
   return PERMISSION_GROUPS.find((group) => 
      group.category.toLowerCase() === categoryName.toLowerCase()
   );
};

/**
 * Get the underlying permission names for a virtual permission
 * @param virtualPermName - The virtual permission name (e.g., "create_financial_settings")
 * @param group - The permission group
 * @returns Array of actual permission names to toggle
 */
export const getUnderlyingPermissions = (
   virtualPermName: string,
   group: PermissionGroup,
   allPermissionNames: string[]
): string[] => {
   const virtualPerm = group.virtualPermissions.find(vp => vp.name === virtualPermName);
   if (!virtualPerm) return [];
   
   const actionPrefix = virtualPerm.actionPrefix;
   
   // Find all permissions that match: {actionPrefix}_{entityPattern}
   return allPermissionNames.filter(permName => {
      // Check if it starts with the action prefix
      if (!permName.startsWith(`${actionPrefix}_`)) return false;
      
      // Check if the entity part matches any of the patterns
      const entityPart = permName.slice(actionPrefix.length + 1);
      return group.permissionPatterns.some(pattern => 
         entityPart === pattern || entityPart.includes(pattern)
      );
   });
};

/**
 * Check if a permission belongs to a grouped category
 */
export const isPermissionInGroup = (permissionName: string, allGroups: PermissionGroup[]): boolean => {
   for (const group of allGroups) {
      for (const virtualPerm of group.virtualPermissions) {
         const actionPrefix = virtualPerm.actionPrefix;
         if (permissionName.startsWith(`${actionPrefix}_`)) {
            const entityPart = permissionName.slice(actionPrefix.length + 1);
            if (group.permissionPatterns.some(pattern => 
               entityPart === pattern || entityPart.includes(pattern)
            )) {
               return true;
            }
         }
      }
   }
   return false;
};

/**
 * Permission rules configuration
 * 
 * Rules:
 * - alwaysRequired: User cannot uncheck this permission
 * - defaultChecked: Permission is checked by default but user can uncheck
 * - requiredWhen: This permission becomes required when the specified permission is checked
 * - children: When this permission is toggled, these children follow
 */
export const PERMISSION_RULES: PermissionRule[] = [
   {
      name: PERMISSION_NAMES.READ_ROLE,
      alwaysRequired: true,
      defaultChecked: true,
   },
   {
      name: PERMISSION_NAMES.READ_EMPLOYEE_DETAILED,
      alwaysRequired: true,
      defaultChecked: true,
   },
   {
      name: PERMISSION_NAMES.READ_EMPLOYEE_BASIC,
      alwaysRequired: false,
      defaultChecked: true, // Checked by default but can be unchecked
      children: [PERMISSION_NAMES.READ_TEAM], // read_team follows read_employee_basic
   },
   {
      name: PERMISSION_NAMES.READ_TEAM,
      alwaysRequired: true,
      defaultChecked: true,
      requiredWhen: PERMISSION_NAMES.READ_EMPLOYEE_BASIC, // Required when read_employee_basic is checked
   },
   {
      name: PERMISSION_NAMES.READ_JOB_TITLE,
      alwaysRequired: true,
      defaultChecked: true,
   },
   {
      name: PERMISSION_NAMES.READ_OFFICE_INFO,
      alwaysRequired: true,
      defaultChecked: true,
   },
   {
      name: "read_legal_case",
      alwaysRequired: false,
      defaultChecked: false,
      children: [PERMISSION_NAMES.READ_LEGAL_CASE_TYPE],
   },
   {
      name: PERMISSION_NAMES.READ_LEGAL_CASE_TYPE,
      alwaysRequired: false,
      defaultChecked: false,
      requiredWhen: "read_legal_case",
   },


   {
      name: "manage_contracts",
      alwaysRequired: false,
      defaultChecked: false,
      children: [
         "create_contract",
         "read_contract",
         "read_employee_contract",
         "attach_contract_file",
         "update_contract",
         "terminate_contract",
      ],
   },
   {
      name: "create_contract",
      alwaysRequired: false,
      defaultChecked: false,
      requiredWhen: "manage_contracts",
      children: ["read_contract", "read_employee_contract", "attach_contract_file"],
   },
   {
      name: "read_contract",
      alwaysRequired: false,
      defaultChecked: false,
      requiredWhen: ["create_contract", "manage_contracts"],
   },
   {
      name: "read_employee_contract",
      alwaysRequired: false,
      defaultChecked: false,
      requiredWhen: ["create_contract", "manage_contracts"],
   },
   {
      name: "attach_contract_file",
      alwaysRequired: false,
      defaultChecked: false,
      requiredWhen: ["create_contract", "manage_contracts"],
   },
   {
      name: "update_contract",
      alwaysRequired: false,
      defaultChecked: false,
      requiredWhen: "manage_contracts",
   },
   {
      name: "terminate_contract",
      alwaysRequired: false,
      defaultChecked: false,
      requiredWhen: "manage_contracts",
   },
   {
      name: "payroll.view_basic",
      alwaysRequired: false,
      defaultChecked: false,
      requiredWhen: [
         "payroll.approve",
         "payroll.export",
         "payroll.finalize",
         "payroll.manage_items",
         "payroll.run_create",
         "payroll.voucher_create",
      ],
   },
   {
      name: "payroll.approve",
      alwaysRequired: false,
      defaultChecked: false,
      children: ["payroll.view_basic"],
   },
   {
      name: "payroll.export",
      alwaysRequired: false,
      defaultChecked: false,
      children: ["payroll.view_basic"],
   },
   {
      name: "payroll.finalize",
      alwaysRequired: false,
      defaultChecked: false,
      children: ["payroll.view_basic"],
   },
   {
      name: "payroll.manage_items",
      alwaysRequired: false,
      defaultChecked: false,
      children: ["payroll.view_basic"],
   },
   {
      name: "payroll.run_create",
      alwaysRequired: false,
      defaultChecked: false,
      children: ["payroll.view_basic"],
   },
   {
      name: "payroll.voucher_create",
      alwaysRequired: false,
      defaultChecked: false,
      children: ["payroll.view_basic"],
   },
   {
      name: "view_support_tickets",
      alwaysRequired: true,
      defaultChecked: true,
   },
   {
      name: "create_support_ticket",
      alwaysRequired: true,
      defaultChecked: true,
   },
   {
      name: "shift.view",
      alwaysRequired: false,
      defaultChecked: false,
      requiredWhen: ["shift.manage", "shift.assign"],
   },
   {
      name: "view_vouchers",
      alwaysRequired: false,
      defaultChecked: false,
      requiredWhen: ["create_vouchers", "update_vouchers", "delete_vouchers", "approve_vouchers"],
   },
   {
      name: "create_vouchers",
      alwaysRequired: false,
      defaultChecked: false,
      children: ["view_vouchers", "approve_vouchers"],
   },
   {
      name: "update_vouchers",
      alwaysRequired: false,
      defaultChecked: false,
      children: ["view_vouchers"],
   },
   {
      name: "delete_vouchers",
      alwaysRequired: false,
      defaultChecked: false,
      children: ["view_vouchers"],
   },
   {
      name: "approve_vouchers",
      alwaysRequired: false,
      defaultChecked: false,
      children: ["view_vouchers"],
   },
];

/**
 * Get the rule for a specific permission by name
 */
export const getPermissionRule = (permissionName: string): PermissionRule | undefined => {
   return PERMISSION_RULES.find((rule) => rule.name === permissionName);
};

/**
 * Get all permissions that are always required
 */
export const getAlwaysRequiredPermissions = (): string[] => {
   return PERMISSION_RULES.filter((rule) => rule.alwaysRequired).map((rule) => rule.name);
};

/**
 * Get permissions that should be default checked
 */
export const getDefaultCheckedPermissions = (): string[] => {
   return PERMISSION_RULES.filter((rule) => rule.defaultChecked).map((rule) => rule.name);
};

/**
 * Extract the entity name from a permission (e.g., "create_vouchers" -> "vouchers")
 */
const extractEntityFromPermission = (permissionName: string): { prefix: string; entity: string } | null => {
   // Try pattern matching with underscore separator
   const underscoreMatch = permissionName.match(/^(create|view|approve|update|delete|read|manage)_(.+)$/);
   if (underscoreMatch) {
      return { prefix: underscoreMatch[1], entity: underscoreMatch[2] };
   }
   
   // Try pattern matching with dot separator (e.g., "payroll.view_basic")
   // These don't follow the same pattern, so skip them
   
   return null;
};

const normalizeEntity = (entity: string): string => {
   if (entity.endsWith("ies") && entity.length > 3) {
      return `${entity.slice(0, -3)}y`;
   }
   if (entity.endsWith("s") && !entity.endsWith("ss") && entity.length > 3) {
      return entity.slice(0, -1);
   }
   return entity;
};

const entitiesMatch = (left: string, right: string): boolean => {
   const l = normalizeEntity(left);
   const r = normalizeEntity(right);
   return l === r || l.includes(r) || r.includes(l);
};

const getChildPrefixVariants = (prefix: string): string[] => {
   if (prefix === "view") return ["view", "read"];
   return [prefix];
};

/**
 * Get the parent permission name for a child permission based on patterns
 * E.g., "view_vouchers" -> "create_vouchers"
 */
/**
 * Get the parent permission names for a child permission based on patterns
 * E.g., "view_vouchers" -> ["create_vouchers"]
 */
export const getPatternParents = (permissionName: string): string[] => {
   const parsed = extractEntityFromPermission(permissionName);
   if (!parsed) return [];
   
   const { prefix, entity } = parsed;
   const normalizedPrefix = prefix === "read" ? "view" : prefix;
   
   const parents: string[] = [];
   
   // Check if this prefix is a child of another prefix
   for (const [parentPrefix, childPrefixes] of Object.entries(PERMISSION_PATTERNS)) {
      if (childPrefixes.includes(normalizedPrefix)) {
         parents.push(`${parentPrefix}_${entity}`);
      }
   }
   
   return parents;
};

/**
 * Get child permission names based on patterns
 * E.g., "create_vouchers" -> ["view_vouchers", "approve_vouchers"]
 */
export const getPatternChildren = (permissionName: string, allPermissionNames: string[]): string[] => {
   const parsed = extractEntityFromPermission(permissionName);
   if (!parsed) return [];
   
   const { prefix, entity } = parsed;
   const childPrefixes = PERMISSION_PATTERNS[prefix];
   
   if (!childPrefixes) return [];
   
   const matches: string[] = [];
   for (const childPrefix of childPrefixes) {
      for (const prefixVariant of getChildPrefixVariants(childPrefix)) {
         const candidatePrefix = `${prefixVariant}_`;
         for (const permName of allPermissionNames) {
            if (!permName.startsWith(candidatePrefix)) continue;
            const candidateEntity = permName.slice(candidatePrefix.length);
            if (entitiesMatch(candidateEntity, entity)) {
               matches.push(permName);
            }
         }
      }
   }
   return [...new Set(matches)];
};

/**
 * Check if a permission is required based on current state
 * @param permissionName - The permission to check
 * @param checkedPermissions - Set of currently checked permission names
 */
export const isPermissionRequired = (
   permissionName: string,
   checkedPermissions: Set<string>
): boolean => {
   // Check static rules first
   const rule = getPermissionRule(permissionName);
   
   // Always required permissions
   if (rule?.alwaysRequired) return true;
   
   // Conditionally required permissions (static rules)
   if (rule?.requiredWhen) {
      const requiredParents = Array.isArray(rule.requiredWhen)
         ? rule.requiredWhen
         : [rule.requiredWhen];
      
      if (requiredParents.some(parent => checkedPermissions.has(parent))) {
         return true;
      }
   }
   
   // Pattern-based required check with fuzzy entity matching
   const parsed = extractEntityFromPermission(permissionName);
   if (parsed) {
      const { prefix, entity } = parsed;
      const normalizedPrefix = prefix === "read" ? "view" : prefix;
      
      // Look for any checked permission that is a parent of this one
      for (const checkedPerm of checkedPermissions) {
         const parsedChecked = extractEntityFromPermission(checkedPerm);
         if (!parsedChecked) continue;
         
         const { prefix: checkedPrefix, entity: checkedEntity } = parsedChecked;

         if (
            checkedPerm === "update_employee" &&
            normalizedPrefix === "view" &&
            entity.startsWith("employee")
         ) {
            continue;
         }
         
         // Check if checkedPrefix is a parent of normalizedPrefix
         // e.g. checked="manage", current="view". PERMISSION_PATTERNS["manage"] includes "view".
         if (PERMISSION_PATTERNS[checkedPrefix]?.includes(normalizedPrefix)) {
             // Check if entities match
             if (entitiesMatch(checkedEntity, entity)) {
                return true;
             }
         }
      }
   }
   
   return false;
};

/**
 * Get child permissions that should follow when a permission is toggled
 * Combines static rules and pattern-based children
 */
export const getChildPermissions = (
   permissionName: string,
   allPermissionNames: string[] = []
): string[] => {
   // Get static children from rules
   const rule = getPermissionRule(permissionName);
   const staticChildren = rule?.children || [];
   
   // Get pattern-based children
   const patternChildren = getPatternChildren(permissionName, allPermissionNames);
   
   // Combine and deduplicate
   return [...new Set([...staticChildren, ...patternChildren])];
};

/**
 * Helper type for permission ID lookup
 */
export interface PermissionIdMap {
   [permissionName: string]: number;
}

/**
 * Build a permission ID map from permission categories
 */
export const buildPermissionIdMap = (
   categories: Array<{ permissions: Array<{ permission_name: string; permission_id: number }> }>
): PermissionIdMap => {
   const map: PermissionIdMap = {};
   
   for (const category of categories) {
      for (const perm of category.permissions || []) {
         map[perm.permission_name] = perm.permission_id;
      }
   }
   
   return map;
};

/**
 * Get permission name by ID from the map
 */
export const getPermissionNameById = (
   permissionId: number,
   idMap: PermissionIdMap
): string | undefined => {
   return Object.entries(idMap).find(([, id]) => id === permissionId)?.[0];
};
