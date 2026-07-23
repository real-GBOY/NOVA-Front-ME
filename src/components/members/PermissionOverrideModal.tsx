/** @format */

import { useState, useMemo, useEffect, useCallback } from "react";
import Modal from "@/designSystem/Modal";
import Button from "@/designSystem/Button";
import Checkbox from "@/designSystem/Checkbox";
import Select from "@/designSystem/Select";
import Loader from "@/designSystem/Loader";
import ConfirmModal from "@/designSystem/ConfirmModal";
import SearchableSelect from "@/components/invoices/SearchableSelect";
import { useTranslation } from "@/hooks/useTranslation";
import { useDebounce } from "@/hooks/useDebounce";
import {
   usePermissionsDictionary,
   useListPermissions,
} from "@/hooks/permissions/permission.queries";
import { useGetEmployeePermissions } from "@/hooks/employees/employee.queries";
import {
   useUpdateEmployeePermissions,
   useResetEmployeePermissions,
} from "@/hooks/employees/employee.mutations";
import { useListTeams } from "@/hooks/teams/team.queries";
import { useListEmployees } from "@/hooks/employees/employee.queries";
import { employeeService } from "@/services/employeeService";
import { teamService } from "@/services/teamService";
import toast from "@/utilities/toast";
import type { Permission } from "@/services/permissionService";
import Search from "@/Icons/search";
import { useTickets } from "@/hooks/support/useTickets";
import {
   buildPermissionIdMap,
   isPermissionRequired,
   getChildPermissions,
   getPermissionNameById,
   getPermissionGroup,
   getUnderlyingPermissions,
   isPermissionInGroup,
   type PermissionIdMap,
   type PermissionGroup,
} from "@/config/permissionConfig";
import {
   PERMISSION_PRESETS,
   type PermissionPreset,
} from "@/config/permissionPresets";

// Format permission name from snake_case/dot.notation to Title Case
const formatPermissionName = (name: string): string => {
   return name
      .split(/[._]/) // Split on dots and underscores
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
};

const normalizePermissionName = (value: string) =>
   value.trim().toLowerCase();

// Format scope option labels for display
const formatScopeLabel = (scope: string): string | null => {
   // Handle exact matches first
   if (scope === "TEAM") return "My Team";
   if (scope === "MANAGED_BY") return "Managed By Me";
   if (scope === "ASSIGNED") return "Assigned To Me";

   // Handle patterns with <id>
   if (scope === "TEAM:<id>") return "Specific Team";
   if (scope === "MANAGED_BY:<id>") return "Specific Manager";
   if (scope === "ASSIGNED:<id>") return "Specific Employee";

   // Handle actual values with IDs (e.g., "TEAM:123")
   if (scope.startsWith("TEAM:")) return "Specific Team";
   if (scope.startsWith("MANAGED_BY:")) return "Specific Manager";
   if (scope.startsWith("ASSIGNED:")) return "Specific Employee";

   // Format other scopes nicely
   return scope
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
};

const fallbackTicketCategories = [
   "technical",
   "hr",
   "legal",
   "financial",
   "other",
];

const normalizeCategoryValue = (value: string) =>
   value.trim().toLowerCase().replace(/\s+/g, "_");

interface PermissionOverrideModalProps {
   isOpen: boolean;
   onClose: () => void;
   employeeId: string | number;
   employeeName: string;
}

interface PermissionState {
   checked: boolean;
   scope: string;
   originalScope?: string;
   wasCustom: boolean;
   teamId?: string; // For TEAM:<id> scopes
   managedById?: string; // For MANAGED_BY:<id> scopes
   assignedId?: string; // For ASSIGNED:<id> scopes
   categoryKey?: string; // For CATEGORY:<name> scopes
}

function PermissionOverrideModal({
   isOpen,
   onClose,
   employeeId,
   employeeName,
}: PermissionOverrideModalProps) {
   const { t } = useTranslation("members");
   const { t: tCommon } = useTranslation("common");
   const { t: tHelpSupport } = useTranslation("helpSupport");
   const [searchQuery, setSearchQuery] = useState("");
   const [permissionStates, setPermissionStates] = useState<
      Record<number, PermissionState>
   >({});
   const [hasChanges, setHasChanges] = useState(false);
   const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
   const [selectedPreset, setSelectedPreset] = useState<string | null>(null);

   // Fetch permissions dictionary (categories with permissions)
   const { data: dictionaryData, isLoading: isDictionaryLoading } =
      usePermissionsDictionary({ enabled: isOpen });
   const trimmedSearchQuery = searchQuery.trim();
   const debouncedSearchQuery = useDebounce(trimmedSearchQuery, 400);
   const { data: permissionsSearchData } = useListPermissions(
      {
         page: 1,
         limit: 100,
         search: debouncedSearchQuery || undefined,
      },
      {
         enabled: isOpen && Boolean(debouncedSearchQuery),
      }
   );

   // Fetch employee's current permissions
   const {
      data: employeePermissions,
      isLoading: isEmployeePermissionsLoading,
   } = useGetEmployeePermissions(employeeId, { enabled: isOpen });

   // Mutations
   const updatePermissionsMutation = useUpdateEmployeePermissions();
   const resetPermissionsMutation = useResetEmployeePermissions();

   // Fetch teams and employees for scope selectors
   const { data: teamsData } = useListTeams(undefined, { enabled: isOpen });
   const { data: employeesData } = useListEmployees(
      { page: 1, limit: 100 },
      {
         enabled: isOpen,
      }
   );
   const { useGetTicketMeta } = useTickets();
   const { data: ticketMeta } = useGetTicketMeta({ enabled: isOpen });

   const categoryOptions = useMemo(() => {
      const allowed = new Set(fallbackTicketCategories);
      const metaLabelMap = new Map<string, string>();

      (ticketMeta?.categories || []).forEach((category) => {
         if (typeof category === "string") {
            const normalized = normalizeCategoryValue(category);
            if (!allowed.has(normalized)) return;
            metaLabelMap.set(
               normalized,
               tHelpSupport(`category.${normalized}`, {
                  defaultValue: category,
               })
            );
            return;
         }

         const normalized = normalizeCategoryValue(category.key);
         if (!allowed.has(normalized)) return;
         metaLabelMap.set(
            normalized,
            category.label ||
               tHelpSupport(`category.${normalized}`, {
                  defaultValue: category.key,
               })
         );
      });

      return fallbackTicketCategories.map((category) => ({
         value: category,
         label:
            metaLabelMap.get(category) ||
            tHelpSupport(`category.${category}`, {
               defaultValue: category,
            }),
      }));
   }, [ticketMeta?.categories, tHelpSupport]);

   // Initialize permission states when data loads
   useEffect(() => {
      if (!dictionaryData?.data || !employeePermissions) return;

      const initialStates: Record<number, PermissionState> = {};

      // Get effective and custom permissions
      const effectivePerms = employeePermissions.effective_permissions || [];
      const customPerms = employeePermissions.custom_permissions || [];

      // Build a map of custom permissions
      const customPermMap = new Map(customPerms.map((p) => [p.id, p.scope]));

      // Get all permissions from dictionary
      dictionaryData.data.forEach((category) => {
         category.permissions.forEach((permission) => {
            const effectivePerm = effectivePerms.find(
               (ep) => ep.id === permission.permission_id
            );
            const isCustom = customPermMap.has(permission.permission_id);
            const customScope = customPermMap.get(permission.permission_id);
            const finalScope =
               customScope ||
               effectivePerm?.scope ||
               permission.scope_default ||
               "DEFAULT";

            // Parse scope to extract IDs
            let teamId: string | undefined;
            let managedById: string | undefined;
            let assignedId: string | undefined;
            let categoryKey: string | undefined;

            if (finalScope.startsWith("TEAM:")) {
               teamId = finalScope.split(":")[1];
            } else if (finalScope.startsWith("MANAGED_BY:")) {
               managedById = finalScope.split(":")[1];
            } else if (finalScope.startsWith("ASSIGNED:")) {
               assignedId = finalScope.split(":")[1];
            } else if (finalScope.startsWith("CATEGORY:")) {
               categoryKey = normalizeCategoryValue(
                  finalScope.split(":")[1] || ""
               );
            }

            initialStates[permission.permission_id] = {
               checked: !!effectivePerm,
               scope: finalScope,
               originalScope: finalScope,
               wasCustom: isCustom,
               teamId,
               managedById,
               assignedId,
               categoryKey,
            };
         });
      });

      setPermissionStates(initialStates);
      setHasChanges(false);
   }, [dictionaryData, employeePermissions]);

   // Build permission ID map from dictionary
   const permissionIdMap: PermissionIdMap = useMemo(() => {
      if (!dictionaryData?.data) return {};
      return buildPermissionIdMap(dictionaryData.data);
   }, [dictionaryData]);

   const permissionByName = useMemo(() => {
      if (!dictionaryData?.data) return new Map<string, Permission>();
      return new Map(
         dictionaryData.data.flatMap((category) =>
            category.permissions.map((permission) => [
               normalizePermissionName(permission.permission_name),
               permission,
            ])
         )
      );
   }, [dictionaryData]);

   const buildPresetEntries = useCallback(
      (preset: PermissionPreset) => {
         if (!dictionaryData?.data) return [];
         const entries = new Map<number, { id: number; scope: string }>();

         if (preset.name === "system_admin") {
            dictionaryData.data.forEach((category) => {
               category.permissions.forEach((permission) => {
                  const id = Number(permission.permission_id);
                  if (Number.isNaN(id)) return;
                  if (!entries.has(id)) {
                     entries.set(id, {
                        id,
                        scope: permission.scope_default || "DEFAULT",
                     });
                  }
               });
            });
            return Array.from(entries.values());
         }

         preset.permissions.forEach((presetPerm) => {
            const permission = permissionByName.get(
               normalizePermissionName(presetPerm.permission_name)
            );
            if (!permission) return;
            const id = Number(permission.permission_id);
            if (Number.isNaN(id)) return;
            entries.set(id, {
               id,
               scope: presetPerm.scope || permission.scope_default || "DEFAULT",
            });
         });

         return Array.from(entries.values());
      },
      [dictionaryData, permissionByName]
   );

   // Get all permission names from the map (for pattern-based child detection)
   const allPermissionNames = useMemo(() => {
      return Object.keys(permissionIdMap);
   }, [permissionIdMap]);

   // Get set of currently checked permission names
   const checkedPermissionNames = useMemo(() => {
      const names = new Set<string>();
      for (const [permIdStr, state] of Object.entries(permissionStates)) {
         if (state?.checked) {
            const permId = parseInt(permIdStr, 10);
            const name = getPermissionNameById(permId, permissionIdMap);
            if (name) names.add(name);
         }
      }
      return names;
   }, [permissionStates, permissionIdMap]);

   // Check if a permission is required (locked - cannot be unchecked)
   const isRequiredPermission = (permissionId: number): boolean => {
      const permName = getPermissionNameById(permissionId, permissionIdMap);
      if (!permName) return false;
      return isPermissionRequired(permName, checkedPermissionNames);
   };

   // Filter permissions by search
   const permissionsSearchSet = useMemo(() => {
      if (!permissionsSearchData?.permissions) return null;
      return new Set(
         permissionsSearchData.permissions.map((perm) =>
            perm.permission_name.toLowerCase()
         )
      );
   }, [permissionsSearchData]);

   const filteredCategories = useMemo(() => {
      if (!dictionaryData?.data) return [];
      if (!debouncedSearchQuery) return dictionaryData.data;
      if (!permissionsSearchSet) return [];

      return dictionaryData.data
         .map((category) => ({
            ...category,
            permissions: category.permissions.filter((p) =>
               permissionsSearchSet.has(p.permission_name.toLowerCase())
            ),
         }))
         .filter((category) => category.permissions.length > 0);
   }, [dictionaryData, debouncedSearchQuery, permissionsSearchSet]);

   const fetchTeamOptions = useCallback(
      async (search: string) => {
         const response = await teamService.list({
            page: 1,
            limit: 20,
            search: search || undefined,
         });
         return (response.data || []).map((team) => ({
            id: String(team.id),
            label: team.name,
         }));
      },
      []
   );

   const fetchEmployeeOptions = useCallback(
      async (search: string) => {
         const response = await employeeService.getDictionary({
            page: 1,
            limit: 20,
            search: search || undefined,
         });
         return response.map((emp) => ({
            id: String(emp.id),
            label: emp.label,
            avatarUrl: emp.avatar || undefined,
         }));
      },
      []
   );

   const handlePermissionToggle = (permission: Permission) => {
      // Prevent unchecking required permissions
      if (isRequiredPermission(permission.permission_id)) {
         return;
      }

      const permName = getPermissionNameById(
         permission.permission_id,
         permissionIdMap
      );
      const isCurrentlyChecked =
         permissionStates[permission.permission_id]?.checked;

      setPermissionStates((prev) => {
         let newState = {
            ...prev,
            [permission.permission_id]: {
               ...prev[permission.permission_id],
               checked: !isCurrentlyChecked,
               scope: isCurrentlyChecked
                  ? prev[permission.permission_id]?.scope
                  : permission.scope_default || "DEFAULT",
               wasCustom: isCurrentlyChecked
                  ? prev[permission.permission_id]?.wasCustom
                  : true,
            },
         };

         // Handle child permissions (both static rules and pattern-based)
         if (permName) {
            const children = getChildPermissions(permName, allPermissionNames);
            for (const childName of children) {
               const childId = permissionIdMap[childName];
               if (!childId) continue;

               if (!isCurrentlyChecked) {
                  // Turning ON parent - also turn on children if not already
                  if (!newState[childId]?.checked) {
                     // Find child's default scope
                     let childDefaultScope = "DEFAULT";
                     if (dictionaryData?.data) {
                        for (const category of dictionaryData.data) {
                           const childPerm = category.permissions.find(
                              (p) =>
                                 Number(p.permission_id) === Number(childId)
                           );
                           if (childPerm) {
                              childDefaultScope =
                                 childPerm.scope_default || "DEFAULT";
                              break;
                           }
                        }
                     }
                     newState = {
                        ...newState,
                        [childId]: {
                           ...newState[childId],
                           checked: true,
                           scope: childDefaultScope,
                           wasCustom: true,
                        },
                     };
                  }
               } else {
                  // Turning OFF parent - also turn off children
                  if (!isRequiredPermission(childId)) {
                     newState = {
                        ...newState,
                        [childId]: {
                           ...newState[childId],
                           checked: false,
                        },
                     };
                  }
               }
            }
         }

         return newState;
      });
      setHasChanges(true);
      setSelectedPreset(null);
   };

   const handleScopeChange = (permissionId: number, scope: string) => {
      setPermissionStates((prev) => {
         // For required permissions that aren't yet in the state, add them
         const existingState = prev[permissionId];
         const nextCategoryKey = scope.startsWith("CATEGORY:")
            ? scope === "CATEGORY:<name>"
               ? existingState?.categoryKey
               : normalizeCategoryValue(scope.split(":")[1] || "")
            : undefined;

         return {
            ...prev,
            [permissionId]: {
               ...existingState,
               // Ensure it's checked when changing scope (important for required permissions)
               checked: existingState?.checked ?? true,
               scope,
               wasCustom: true,
               // Reset specific IDs when scope type changes
               teamId: scope.startsWith("TEAM:")
                  ? existingState?.teamId
                  : undefined,
               managedById: scope.startsWith("MANAGED_BY:")
                  ? existingState?.managedById
                  : undefined,
               assignedId: scope.startsWith("ASSIGNED:")
                  ? existingState?.assignedId
                  : undefined,
               categoryKey: nextCategoryKey,
            },
         };
      });
      setHasChanges(true);
      setSelectedPreset(null);
   };

   const handleTeamChange = (permissionId: number, teamId: string) => {
      setPermissionStates((prev) => ({
         ...prev,
         [permissionId]: {
            ...prev[permissionId],
            teamId,
            scope: teamId ? `TEAM:${teamId}` : "TEAM",
            wasCustom: true,
         },
      }));
      setHasChanges(true);
   };

   const handleManagerChange = (permissionId: number, managerId: string) => {
      setPermissionStates((prev) => ({
         ...prev,
         [permissionId]: {
            ...prev[permissionId],
            managedById: managerId,
            scope: managerId ? `MANAGED_BY:${managerId}` : "MANAGED_BY",
            wasCustom: true,
         },
      }));
      setHasChanges(true);
   };

   const handleAssignedChange = (permissionId: number, employeeId: string) => {
      setPermissionStates((prev) => ({
         ...prev,
         [permissionId]: {
            ...prev[permissionId],
            assignedId: employeeId,
            scope: employeeId ? `ASSIGNED:${employeeId}` : "ASSIGNED",
            wasCustom: true,
         },
      }));
      setHasChanges(true);
   };

   const handleCategoryChange = (permissionId: number, categoryKey: string) => {
      setPermissionStates((prev) => ({
         ...prev,
         [permissionId]: {
            ...prev[permissionId],
            categoryKey,
            scope: categoryKey ? `CATEGORY:${categoryKey}` : "CATEGORY:<name>",
            wasCustom: true,
         },
      }));
      setHasChanges(true);
   };

   /**
    * Handle toggling a virtual (grouped) permission
    * This toggles all underlying permissions that match the group pattern
    */
   const handleVirtualPermissionToggle = (
      virtualPermName: string,
      group: PermissionGroup
   ) => {
      // Get all underlying permission names for this virtual permission
      const underlyingPermNames = getUnderlyingPermissions(
         virtualPermName,
         group,
         allPermissionNames
      );

      // Get the permission IDs
      const underlyingPermIds = underlyingPermNames
         .map((name) => permissionIdMap[name])
         .filter((id): id is number => id !== undefined);

      if (underlyingPermIds.length === 0) return;

      // Check if all underlying permissions are currently selected
      const allSelected = underlyingPermIds.every(
         (id) => permissionStates[id]?.checked
      );

      setPermissionStates((prev) => {
         const newState = { ...prev };

         if (allSelected) {
            // Uncheck all underlying permissions
            for (const id of underlyingPermIds) {
               // Skip if required
               if (isRequiredPermission(id)) continue;

               if (newState[id]) {
                  newState[id] = {
                     ...newState[id],
                     checked: false,
                  };
               }

               // Also uncheck children if they are not required
               const permName = getPermissionNameById(id, permissionIdMap);
               if (permName) {
                  const children = getChildPermissions(
                     permName,
                     allPermissionNames
                  );
                  for (const childName of children) {
                     const childId = permissionIdMap[childName];
                     if (
                        childId &&
                        newState[childId] &&
                        !isRequiredPermission(childId)
                     ) {
                        newState[childId] = {
                           ...newState[childId],
                           checked: false,
                        };
                     }
                  }
               }
            }
         } else {
            // Helper to check a permission and its children
            const checkPermission = (permId: number) => {
               let defaultScope = "DEFAULT";
               if (dictionaryData?.data) {
                  for (const category of dictionaryData.data) {
                     const perm = category.permissions.find(
                     (p) => Number(p.permission_id) === Number(permId)
                     );
                     if (perm) {
                        defaultScope = perm.scope_default || "DEFAULT";
                        break;
                     }
                  }
               }

               newState[permId] = {
                  ...newState[permId],
                  checked: true,
                  scope: newState[permId]?.scope || defaultScope,
                  wasCustom: true,
               };
            };

            // Check all underlying permissions and their children
            for (const id of underlyingPermIds) {
               checkPermission(id);

               // Also check children
               const permName = getPermissionNameById(id, permissionIdMap);
               if (permName) {
                  const children = getChildPermissions(
                     permName,
                     allPermissionNames
                  );
                  for (const childName of children) {
                     const childId = permissionIdMap[childName];
                     if (childId) {
                        if (!newState[childId]?.checked) {
                           checkPermission(childId);
                        }
                     }
                  }
               }
            }
         }
         return newState;
      });
      setHasChanges(true);
      setSelectedPreset(null);
   };

   /**
    * Check if a virtual permission is checked (all underlying permissions are selected)
    */
   const isVirtualPermissionChecked = (
      virtualPermName: string,
      group: PermissionGroup
   ): boolean => {
      const underlyingPermNames = getUnderlyingPermissions(
         virtualPermName,
         group,
         allPermissionNames
      );
      const underlyingPermIds = underlyingPermNames
         .map((name) => permissionIdMap[name])
         .filter((id): id is number => id !== undefined);

      if (underlyingPermIds.length === 0) return false;

      return underlyingPermIds.every((id) => permissionStates[id]?.checked);
   };

   const applyPreset = (preset: PermissionPreset) => {
      if (!dictionaryData?.data) return;

      // Toggle preset - if already selected, deselect and reset to initial state
      if (selectedPreset === preset.name) {
         setSelectedPreset(null);
         // Re-initialize permission states from current employee permissions
         if (employeePermissions && dictionaryData?.data) {
            const initialStates: Record<number, PermissionState> = {};
            const effectivePerms =
               employeePermissions.effective_permissions || [];
            const customPerms = employeePermissions.custom_permissions || [];
            const customPermMap = new Map(
               customPerms.map((p) => [p.id, p.scope])
            );

            dictionaryData.data.forEach((category) => {
               category.permissions.forEach((permission) => {
                  const effectivePerm = effectivePerms.find(
                     (ep) => ep.id === permission.permission_id
                  );
                  const isCustom = customPermMap.has(permission.permission_id);
                  const customScope = customPermMap.get(
                     permission.permission_id
                  );
                  const finalScope =
                     customScope ||
                     effectivePerm?.scope ||
                     permission.scope_default ||
                     "DEFAULT";

                  let teamId: string | undefined;
                  let managedById: string | undefined;
                  let assignedId: string | undefined;

                  if (finalScope.startsWith("TEAM:")) {
                     teamId = finalScope.split(":")[1];
                  } else if (finalScope.startsWith("MANAGED_BY:")) {
                     managedById = finalScope.split(":")[1];
                  } else if (finalScope.startsWith("ASSIGNED:")) {
                     assignedId = finalScope.split(":")[1];
                  }

                  initialStates[permission.permission_id] = {
                     checked: !!effectivePerm,
                     scope: finalScope,
                     originalScope: finalScope,
                     wasCustom: isCustom,
                     teamId,
                     managedById,
                     assignedId,
                  };
               });
            });

            setPermissionStates(initialStates);
         }
         setHasChanges(false);
         toast.success(`Cleared "${preset.label}" preset`);
         return;
      }

      const newStates = { ...permissionStates };
      const entries = buildPresetEntries(preset);

      // Find each permission by name and apply it
      entries.forEach((entry) => {
         newStates[entry.id] = {
            ...newStates[entry.id],
            checked: true,
            scope: entry.scope,
            wasCustom: true,
         };
      });

      setSelectedPreset(preset.name);
      setPermissionStates(newStates);
      setHasChanges(true);
      toast.success(`Applied "${preset.label}" preset`);
   };

   useEffect(() => {
      if (!selectedPreset || !dictionaryData?.data) return;
      const preset = PERMISSION_PRESETS.find(
         (item) => item.name === selectedPreset
      );
      if (!preset) return;
      const entries = buildPresetEntries(preset);
      if (entries.length === 0) return;

      const allChecked = entries.every(
         (entry) => permissionStates[entry.id]?.checked
      );
      if (allChecked) return;

      const updatedStates = { ...permissionStates };
      entries.forEach((entry) => {
         updatedStates[entry.id] = {
            ...updatedStates[entry.id],
            checked: true,
            scope: entry.scope,
            wasCustom: true,
         };
      });
      setPermissionStates(updatedStates);
      setHasChanges(true);
   }, [selectedPreset, dictionaryData, permissionStates, buildPresetEntries]);

   const handleSave = async () => {
      if (!dictionaryData?.data) return;

      const allSelectedPermissions: Array<{ permission_id: number; scope?: string }> =
         [];
      const removePermissionIds: number[] = [];

      const customPerms = employeePermissions?.custom_permissions || [];
      const customPermMap = new Map(customPerms.map((p) => [p.id, p.scope]));
      const effectivePerms = employeePermissions?.effective_permissions || [];
      const effectivePermMap = new Map(effectivePerms.map((p) => [p.id, p.scope]));

      // Collect ALL currently selected permissions
      dictionaryData.data.forEach((category) => {
         category.permissions.forEach((permission) => {
            const state = permissionStates[permission.permission_id];
            if (!state) return;

            const permId = permission.permission_id;
            const wasCustom = customPermMap.has(permId);
            const wasEffective = effectivePermMap.has(permId);

            // If permission is currently unchecked, mark for removal if it was custom
            if (!state.checked) {
               if (wasCustom) {
                  removePermissionIds.push(permId);
               }
               return;
            }

            // If permission is checked, include it in the payload
            // Include all checked permissions, whether they were custom or not
            if (state.wasCustom || wasCustom) {
               // Permission is marked as custom override, include it
               allSelectedPermissions.push({
                  permission_id: permId,
                  scope: state.scope,
               });
            } else if (wasEffective) {
               // Permission was effective (from role), but now we're explicitly setting it
               // Include it to ensure it's maintained
               allSelectedPermissions.push({
                  permission_id: permId,
                  scope: state.scope,
               });
            } else {
               // New permission being added
               allSelectedPermissions.push({
                  permission_id: permId,
                  scope: state.scope,
               });
            }
         });
      });

      // Skip if no changes
      if (allSelectedPermissions.length === 0 && removePermissionIds.length === 0) {
         onClose();
         return;
      }

      // Service layer automatically includes read_role permission when adding permissions
      try {
         await updatePermissionsMutation.mutateAsync({
            id: employeeId,
            payload: {
               add_permissions:
                  allSelectedPermissions.length > 0 ? allSelectedPermissions : undefined,
               remove_permission_ids:
                  removePermissionIds.length > 0
                     ? removePermissionIds
                     : undefined,
            },
         });
         toast.success(t("permissions.updateSuccess"));
         onClose();
      } catch {
         toast.error(t("permissions.updateError"));
      }
   };

   const handleReset = async () => {
      try {
         await resetPermissionsMutation.mutateAsync(employeeId);
         toast.success(t("permissions.resetSuccess"));
         onClose();
      } catch {
         toast.error(t("permissions.resetError"));
      }
   };

   const isLoading = isDictionaryLoading || isEmployeePermissionsLoading;
   const isSaving = updatePermissionsMutation.isPending;
   const isResetting = resetPermissionsMutation.isPending;

   return (
      <>
         <Modal
            isOpen={isOpen}
            onClose={() => {
               if (hasChanges) {
                  setShowDiscardConfirm(true);
                  return;
               }
               onClose();
            }}
            title={t("permissions.overrideTitle")}
            size="medium"
            width="w-[50%]"
            footer={
               <div className="flex items-center justify-between">
                  <Button
                     variant="secondary"
                     onClick={handleReset}
                     disabled={isResetting || isSaving}
                     className="text-warning border-warning hover:bg-warning/10">
                     {isResetting
                        ? t("permissions.resetting")
                        : t("permissions.resetToDefault")}
                  </Button>
                  <div className="flex items-center gap-3">
                     <Button
                        variant="secondary"
                        onClick={() => {
                           if (hasChanges) {
                              setShowDiscardConfirm(true);
                              return;
                           }
                           onClose();
                        }}
                        disabled={isSaving}>
                        {t("actions.cancel")}
                     </Button>
                     <Button
                        onClick={handleSave}
                        disabled={!hasChanges || isSaving}>
                        {isSaving
                           ? t("loading.general")
                           : t("permissions.saveChanges")}
                     </Button>
                  </div>
               </div>
            }>
            <div className="flex flex-col gap-5 min-h-[450px]">
               {/* Header description */}
               <p className="text-sm text-text-sub leading-relaxed">
                  {t("permissions.overrideDescription", { name: employeeName })}
               </p>

               {/* Permission Presets */}
               <div className="space-y-2">
                  <label className="block text-sm font-medium text-text-strong">
                     Quick Presets
                  </label>
                  <div className="flex flex-wrap gap-2">
                     {PERMISSION_PRESETS.map((preset) => {
                        const isSelected = selectedPreset === preset.name;
                        return (
                           <Button
                              key={preset.name}
                              variant="secondary"
                              onClick={() => applyPreset(preset)}
                              className={`text-xs py-2 px-3 transition-all ${
                                 isSelected
                                    ? "bg-primary text-background border-primary hover:bg-primary-dark"
                                    : "border-primary/30 text-primary hover:bg-primary/10"
                              }`}
                              title={preset.description}>
                              {preset.label}
                           </Button>
                        );
                     })}
                  </div>
               </div>

               {/* Search */}
               <div className="relative">
                  <div className="absolute start-3 top-1/2 transform -translate-y-1/2">
                     <Search size={16} className="fill-text-soft" />
                  </div>
                  <input
                     type="text"
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                     placeholder={t("permissions.searchPermissions")}
                     className="w-full ps-10 pe-4 py-2.5 text-sm rounded-xl border border-border bg-bg-weak text-text-strong placeholder:text-text-soft focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary focus:bg-background transition-all"
                  />
               </div>

               {/* Permissions list */}
               <div className="flex-1 max-h-[380px] overflow-y-auto pe-1">
                  {isLoading ? (
                     <div className="py-12 flex items-center justify-center">
                        <Loader label={t("permissions.loadingPermissions")} />
                     </div>
                  ) : filteredCategories.length === 0 ? (
                     <div className="py-12 text-center">
                        <p className="text-sm text-text-soft">
                           {t("permissions.noPermissionsFound")}
                        </p>
                     </div>
                  ) : (
                     <div className="space-y-5">
                        {filteredCategories.map((category) => {
                           const group = getPermissionGroup(category.category);
                           return (
                              <div
                                 key={category.category}
                                 className="bg-bg-weak/50 rounded-xl p-4 border border-border/50">
                                 {/* Category header */}
                                 <h5 className="text-xs font-semibold text-text-sub uppercase tracking-wider mb-3">
                                    {group
                                       ? group.displayName
                                       : formatPermissionName(
                                            category.category
                                         )}
                                 </h5>

                                 {/* Permissions in category */}
                                 <div className="space-y-2.5">
                                    {group
                                       ? // Render virtual permissions for grouped categories
                                         group.virtualPermissions.map(
                                            (virtualPerm) => {
                                               const isChecked =
                                                  isVirtualPermissionChecked(
                                                     virtualPerm.name,
                                                     group
                                                  );
                                               return (
                                                  <div
                                                     key={virtualPerm.name}
                                                     className="space-y-2">
                                                     <div className="flex items-center justify-between gap-3 py-1.5 px-2 rounded-lg hover:bg-background/80 transition-colors">
                                                        <div className="flex items-center gap-2">
                                                           <Checkbox
                                                              id={`virtual-perm-${virtualPerm.name}`}
                                                              checked={
                                                                 isChecked
                                                              }
                                                              onChange={() =>
                                                                 handleVirtualPermissionToggle(
                                                                    virtualPerm.name,
                                                                    group
                                                                 )
                                                              }
                                                              label={
                                                                 virtualPerm.label
                                                              }
                                                           />
                                                        </div>
                                                     </div>
                                                  </div>
                                               );
                                            }
                                         )
                                       : category.permissions.map(
                                            (permission) => {
                                               const state =
                                                  permissionStates[
                                                     permission.permission_id
                                                  ];

                                               // Get scope options - keep all options including TEAM, MANAGED_BY, ASSIGNED
                                               const rawScopeOptions =
                                                  permission.scope_options ||
                                                  [];
                                               const scopeOptions =
                                                  rawScopeOptions
                                                     .map((opt: string) => {
                                                        const label =
                                                           formatScopeLabel(
                                                              opt
                                                           );
                                                        return label
                                                           ? {
                                                                value: opt,
                                                                label,
                                                             }
                                                           : null;
                                                     })
                                                     .filter(
                                                        (
                                                           opt
                                                        ): opt is {
                                                           value: string;
                                                           label: string;
                                                        } => opt !== null
                                                     );

                                               // Determine if we need additional selectors
                                               const needsTeamSelect =
                                                  state?.checked &&
                                                  (state.scope?.startsWith(
                                                     "TEAM:"
                                                  ) ||
                                                     state.scope ===
                                                        "TEAM:<id>");
                                               const needsManagerSelect =
                                                  state?.checked &&
                                                  (state.scope?.startsWith(
                                                     "MANAGED_BY:"
                                                  ) ||
                                                     state.scope ===
                                                        "MANAGED_BY:<id>");
                                               const needsAssignedSelect =
                                                  state?.checked &&
                                                  (state.scope?.startsWith(
                                                     "ASSIGNED:"
                                                  ) ||
                                                     state.scope ===
                                                        "ASSIGNED:<id>");
                                               const needsCategorySelect =
                                                  state?.checked &&
                                                  (state.scope?.startsWith(
                                                     "CATEGORY:"
                                                  ) ||
                                                     state.scope ===
                                                        "CATEGORY:<name>");
                                               const rawCategoryValue =
                                                  state?.categoryKey ||
                                                  (state?.scope?.startsWith(
                                                     "CATEGORY:"
                                                  ) &&
                                                  state.scope !==
                                                     "CATEGORY:<name>"
                                                     ? normalizeCategoryValue(
                                                          state.scope.split(
                                                             ":"
                                                          )[1] || ""
                                                       )
                                                     : "");
                                               const categoryValue =
                                                  fallbackTicketCategories.includes(
                                                     rawCategoryValue
                                                  )
                                                     ? rawCategoryValue
                                                     : "";

                                               const isRequired =
                                                  isRequiredPermission(
                                                     permission.permission_id
                                                  );

                                               return (
                                                  <div
                                                     key={
                                                        permission.permission_id
                                                     }
                                                     className="space-y-2">
                                                     <div
                                                        className={`flex items-center justify-between gap-3 py-1.5 px-2 rounded-lg hover:bg-background/80 transition-colors ${
                                                           isRequired
                                                              ? "bg-primary/5 border border-primary/20"
                                                              : ""
                                                        }`}>
                                                        <div className="flex items-center gap-2">
                                                           <Checkbox
                                                              id={`permission-${permission.permission_id}`}
                                                              checked={
                                                                 isRequired ||
                                                                 state?.checked ||
                                                                 false
                                                              }
                                                              onChange={() =>
                                                                 handlePermissionToggle(
                                                                    permission
                                                                 )
                                                              }
                                                              label={formatPermissionName(
                                                                 permission.permission_name
                                                              )}
                                                              disabled={
                                                                 isRequired
                                                              }
                                                           />
                                                           {isRequired && (
                                                              <span className="text-xs text-primary font-medium bg-primary/10 px-2 py-0.5 rounded-full">
                                                                 Required
                                                              </span>
                                                           )}
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                           {(isRequired ||
                                                              state?.checked) &&
                                                              scopeOptions.length >
                                                                 0 &&
                                                              (() => {
                                                                 // Get current scope - use state if available, otherwise use default
                                                                 const currentScope =
                                                                    state?.scope ||
                                                                    permission.scope_default ||
                                                                    "DEFAULT";
                                                                 return (
                                                                    <Select
                                                                       options={
                                                                          scopeOptions
                                                                       }
                                                                       value={
                                                                          // Show "TEAM:<id>" option when scope has a team ID
                                                                          currentScope.includes(
                                                                             "TEAM:"
                                                                          ) &&
                                                                          currentScope !==
                                                                             "TEAM"
                                                                             ? "TEAM:<id>"
                                                                             : // Show "MANAGED_BY:<id>" option when scope has a manager ID
                                                                             currentScope.includes(
                                                                                  "MANAGED_BY:"
                                                                               ) &&
                                                                               currentScope !==
                                                                                  "MANAGED_BY"
                                                                             ? "MANAGED_BY:<id>"
                                                                             : // Show "ASSIGNED:<id>" option when scope has an employee ID
                                                                             currentScope.includes(
                                                                                  "ASSIGNED:"
                                                                               ) &&
                                                                               currentScope !==
                                                                                  "ASSIGNED"
                                                                             ? "ASSIGNED:<id>"
                                                                             : // Show "CATEGORY:<name>" option when scope has a category
                                                                             currentScope.startsWith(
                                                                                  "CATEGORY:"
                                                                               ) &&
                                                                               currentScope !==
                                                                                  "CATEGORY"
                                                                             ? "CATEGORY:<name>"
                                                                             : // Otherwise show the exact scope value
                                                                               currentScope
                                                                       }
                                                                       onChange={(
                                                                          value
                                                                       ) =>
                                                                          handleScopeChange(
                                                                             permission.permission_id,
                                                                             value
                                                                          )
                                                                       }
                                                                       className="text-xs [&_button]:py-2.5 [&_button]:px-3 [&_button]:text-xs [&_button]:rounded-xl [&_button]:h-[42px]"
                                                                    />
                                                                 );
                                                              })()}

                                                           {/* Category Selector - inline */}
                                                           {needsCategorySelect &&
                                                              categoryOptions.length >
                                                                 0 && (
                                                                 <Select
                                                                    options={
                                                                       categoryOptions
                                                                    }
                                                                    value={
                                                                       categoryValue
                                                                    }
                                                                    onChange={(
                                                                       value
                                                                    ) =>
                                                                       handleCategoryChange(
                                                                          permission.permission_id,
                                                                          value
                                                                       )
                                                                    }
                                                                    placeholder="Select category..."
                                                                    className="text-xs [&_button]:py-2.5 [&_button]:px-3 [&_button]:text-xs [&_button]:rounded-xl [&_button]:h-[42px]"
                                                                 />
                                                              )}

                                                           {/* Team Selector - inline */}
                                                           {needsTeamSelect &&
                                                              teamsData?.data && (
                                                                 <SearchableSelect
                                                                    placeholder="Select team..."
                                                                    value={
                                                                       state.teamId ||
                                                                       ""
                                                                    }
                                                                    onChange={(
                                                                       value
                                                                    ) =>
                                                                       handleTeamChange(
                                                                          permission.permission_id,
                                                                          value
                                                                       )
                                                                    }
                                                                    options={teamsData.data.map(
                                                                       (
                                                                          team
                                                                       ) => ({
                                                                          id: String(
                                                                             team.id
                                                                          ),
                                                                          label: team.name,
                                                                       })
                                                                    )}
                                                                    serverSideSearch={true}
                                                                    fetchOptions={fetchTeamOptions}
                                                                 />
                                                              )}

                                                           {/* Manager Selector - inline */}
                                                           {needsManagerSelect &&
                                                              employeesData?.data && (
                                                                 <SearchableSelect
                                                                    placeholder="Select manager..."
                                                                    value={
                                                                       state.managedById ||
                                                                       ""
                                                                    }
                                                                    onChange={(
                                                                       value
                                                                    ) =>
                                                                       handleManagerChange(
                                                                          permission.permission_id,
                                                                          value
                                                                       )
                                                                    }
                                                                    options={employeesData.data.map(
                                                                       (
                                                                          emp
                                                                       ) => ({
                                                                          id: String(
                                                                             emp.id
                                                                          ),
                                                                          label: emp.name,
                                                                          avatarUrl:
                                                                             emp.avatar ||
                                                                             undefined,
                                                                       })
                                                                    )}
                                                                    serverSideSearch={true}
                                                                    fetchOptions={fetchEmployeeOptions}
                                                                 />
                                                              )}

                                                           {/* Assigned Employee Selector - inline */}
                                                           {needsAssignedSelect &&
                                                              employeesData?.data && (
                                                                 <SearchableSelect
                                                                    placeholder="Select employee..."
                                                                    value={
                                                                       state.assignedId ||
                                                                       ""
                                                                    }
                                                                    onChange={(
                                                                       value
                                                                    ) =>
                                                                       handleAssignedChange(
                                                                          permission.permission_id,
                                                                          value
                                                                       )
                                                                    }
                                                                    options={employeesData.data.map(
                                                                       (
                                                                          emp
                                                                       ) => ({
                                                                          id: String(
                                                                             emp.id
                                                                          ),
                                                                          label: emp.name,
                                                                          avatarUrl:
                                                                             emp.avatar ||
                                                                             undefined,
                                                                       })
                                                                    )}
                                                                    serverSideSearch={true}
                                                                    fetchOptions={fetchEmployeeOptions}
                                                                 />
                                                              )}
                                                        </div>
                                                     </div>
                                                  </div>
                                               );
                                            }
                                         )}
                                 </div>
                              </div>
                           );
                        })}
                     </div>
                  )}
               </div>
            </div>
         </Modal>
         <ConfirmModal
            isOpen={showDiscardConfirm}
            onClose={() => setShowDiscardConfirm(false)}
            onConfirm={() => {
               setShowDiscardConfirm(false);
               onClose();
            }}
            title={tCommon("unsavedChanges.title")}
            description={tCommon("unsavedChanges.description")}
            confirmText={tCommon("unsavedChanges.confirm")}
            cancelText={tCommon("unsavedChanges.cancel")}
         />
      </>
   );
}

export default PermissionOverrideModal;
