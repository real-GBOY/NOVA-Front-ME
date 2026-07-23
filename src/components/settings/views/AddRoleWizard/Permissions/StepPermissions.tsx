/** @format */

import { useState, useMemo, useCallback, useEffect } from "react";
import Search from "@/Icons/search";
import GenericForm from "@/designSystem/GenericForm";
import { GenericFormField } from "@/designSystem/GenericFormField";
import Checkbox from "@/designSystem/Checkbox";
import Select from "@/designSystem/Select";
import Loader from "@/designSystem/Loader";
import Button from "@/designSystem/Button";
import SearchableSelect from "@/components/invoices/SearchableSelect";
import { roleSchema } from "@/utilities/schemas/roleSchema";
import { RoleFormData } from "../types";
import type { PermissionCategory } from "@/services/permissionService";
import type { UseFormReturn } from "react-hook-form";
import type { MutableRefObject } from "react";
import { useListTeams } from "@/hooks/teams/team.queries";
import { useListEmployees } from "@/hooks/employees/employee.queries";
import { useListPermissions } from "@/hooks/permissions/permission.queries";
import { employeeService } from "@/services/employeeService";
import { teamService } from "@/services/teamService";
import toast from "@/utilities/toast";
import { useTranslation } from "@/hooks/useTranslation";
import { useDebounce } from "@/hooks/useDebounce";
import { useTickets } from "@/hooks/support/useTickets";
import {
   buildPermissionIdMap,
   isPermissionRequired,
   getChildPermissions,
   getPermissionNameById,
   type PermissionIdMap,
   getPermissionGroup,
   getUnderlyingPermissions,
} from "@/config/permissionConfig";
import {
   PERMISSION_PRESETS,
   type PermissionPreset,
} from "@/config/permissionPresets";

const formatPermissionName = (name: string): string => {
   return name
      .split(/[._-]/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
};

const normalizePermissionName = (value: string) => value.trim().toLowerCase();

type PermissionItem = PermissionCategory["permissions"][number];

const getScopeWithAll = (
   baseScope: string,
   scopeOptions?: string[],
   forceAll: boolean = false,
): string => {
   if (scopeOptions?.includes("ALL") && (forceAll || baseScope === "DEFAULT")) {
      return "ALL";
   }

   return baseScope;
};

const getDefaultScope = (
   permission: PermissionItem,
   forceAll: boolean = false,
): string => {
   const baseScope = permission.scope_default || permission.scope || "DEFAULT";
   return getScopeWithAll(baseScope, permission.scope_options, forceAll);
};

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

type StepPermissionsProps = {
   formData: RoleFormData;
   updateFormData: (field: keyof RoleFormData, value: unknown) => void;
   permissionCategories?: PermissionCategory[];
   isLoading?: boolean;
   formRef?: MutableRefObject<UseFormReturn<RoleFormData> | null>;
};

function StepPermissions({
   formData,
   updateFormData,
   permissionCategories = [],
   isLoading = false,
   formRef,
}: StepPermissionsProps) {
   const [searchQuery, setSearchQuery] = useState("");
   const debouncedSearchQuery = useDebounce(searchQuery, 400);
   const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
   const { t } = useTranslation("settings");
   const { t: tHelpSupport } = useTranslation("helpSupport");
   const trimmedSearchQuery = debouncedSearchQuery.trim();
   const { data: permissionsSearchData } = useListPermissions(
      {
         search: trimmedSearchQuery || undefined,
      },
      {
         enabled: Boolean(trimmedSearchQuery),
      },
   );

   // Fetch teams and employees for scope selectors
   const { data: teamsData } = useListTeams();
   const { data: employeesData } = useListEmployees({ page: 1, limit: 100 });
   const { useGetTicketMeta } = useTickets();
   const { data: ticketMeta } = useGetTicketMeta();

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
               }),
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
               }),
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

   const currentPermissions = useMemo(
      () => formData.permissions || [],
      [formData.permissions],
   );

   // Build permission ID map from categories
   const permissionIdMap: PermissionIdMap = useMemo(() => {
      return buildPermissionIdMap(permissionCategories);
   }, [permissionCategories]);

   const permissionByName = useMemo(() => {
      return new Map(
         permissionCategories.flatMap((category) =>
            category.permissions.map((permission) => [
               normalizePermissionName(permission.permission_name),
               permission,
            ]),
         ),
      );
   }, [permissionCategories]);

   // Get all permission names from the map (for pattern-based child detection)
   const allPermissionNames = useMemo(() => {
      return Object.keys(permissionIdMap);
   }, [permissionIdMap]);

   // Get set of currently checked permission names
   const checkedPermissionNames = useMemo(() => {
      const names = new Set<string>();
      for (const perm of currentPermissions) {
         const name = getPermissionNameById(
            perm.permission_id,
            permissionIdMap,
         );
         if (name) names.add(name);
      }
      return names;
   }, [currentPermissions, permissionIdMap]);

   // Check if a permission is required (locked - cannot be unchecked)
   const isRequiredPermission = useCallback(
      (permissionId: number): boolean => {
         const permName = getPermissionNameById(permissionId, permissionIdMap);
         if (!permName) return false;
         return isPermissionRequired(permName, checkedPermissionNames);
      },
      [permissionIdMap, checkedPermissionNames],
   );

   const handlePermissionToggle = useCallback(
      (permissionId: number, defaultScope?: string) => {
         // Prevent unchecking required permissions
         if (isRequiredPermission(permissionId)) {
            return;
         }

         const permName = getPermissionNameById(permissionId, permissionIdMap);
         const isSelected = currentPermissions.some(
            (permission) =>
               Number(permission.permission_id) === Number(permissionId),
         );

         let updated = isSelected
            ? currentPermissions.filter(
                 (permission) =>
                    Number(permission.permission_id) !== Number(permissionId),
              )
            : [
                 ...currentPermissions,
                 {
                    permission_id: permissionId,
                    scope: defaultScope || "DEFAULT",
                 },
              ];

         // Handle child permissions (both static rules and pattern-based)
         if (permName) {
            const children = getChildPermissions(permName, allPermissionNames);
            for (const childName of children) {
               const childId = permissionIdMap[childName];
               if (!childId) continue;

               if (!isSelected) {
                  // Turning ON parent - also turn on children if not already
                  const hasChild = updated.some(
                     (p) => Number(p.permission_id) === Number(childId),
                  );
                  if (!hasChild) {
                     // Find child's default scope
                     let childDefaultScope = "DEFAULT";
                     for (const category of permissionCategories) {
                        const childPerm = category.permissions.find(
                           (p) => Number(p.permission_id) === Number(childId),
                        );
                        if (childPerm) {
                           childDefaultScope = getDefaultScope(childPerm);
                           break;
                        }
                     }
                     updated = [
                        ...updated,
                        { permission_id: childId, scope: childDefaultScope },
                     ];
                  }
               } else {
                  // Turning OFF parent - also turn off children
                  updated = updated.filter(
                     (p) => Number(p.permission_id) !== Number(childId),
                  );
               }
            }
         }

         setSelectedPreset(null);
         updateFormData("permissions", updated);
      },
      [
         currentPermissions,
         updateFormData,
         isRequiredPermission,
         permissionIdMap,
         permissionCategories,
         allPermissionNames,
      ],
   );

   const handleScopeChange = useCallback(
      (permissionId: number, scope: string) => {
         // Check if permission is already in the list
         const existingPerm = currentPermissions.find(
            (p) => Number(p.permission_id) === Number(permissionId),
         );

         let updated;
         if (existingPerm) {
            // Update existing permission's scope
            updated = currentPermissions.map((permission) =>
               Number(permission.permission_id) === Number(permissionId)
                  ? { ...permission, scope }
                  : permission,
            );
         } else {
            // Add the permission with the new scope (for required permissions not yet in list)
            updated = [
               ...currentPermissions,
               { permission_id: permissionId, scope },
            ];
         }

         setSelectedPreset(null);
         updateFormData("permissions", updated);
      },
      [currentPermissions, updateFormData],
   );

   const handleTeamChange = useCallback(
      (permissionId: number, teamId: string) => {
         const updated = currentPermissions.map((permission) =>
            Number(permission.permission_id) === Number(permissionId)
               ? { ...permission, scope: teamId ? `TEAM:${teamId}` : "TEAM" }
               : permission,
         );
         updateFormData("permissions", updated);
      },
      [currentPermissions, updateFormData],
   );

   const handleManagerChange = useCallback(
      (permissionId: number, managerId: string) => {
         const updated = currentPermissions.map((permission) =>
            Number(permission.permission_id) === Number(permissionId)
               ? {
                    ...permission,
                    scope: managerId ? `MANAGED_BY:${managerId}` : "MANAGED_BY",
                 }
               : permission,
         );
         updateFormData("permissions", updated);
      },
      [currentPermissions, updateFormData],
   );

   const handleAssignedChange = useCallback(
      (permissionId: number, employeeId: string) => {
         const updated = currentPermissions.map((permission) =>
            Number(permission.permission_id) === Number(permissionId)
               ? {
                    ...permission,
                    scope: employeeId ? `ASSIGNED:${employeeId}` : "ASSIGNED",
                 }
               : permission,
         );
         updateFormData("permissions", updated);
      },
      [currentPermissions, updateFormData],
   );

   const handleCategoryChange = useCallback(
      (permissionId: number, categoryKey: string) => {
         const scope = categoryKey
            ? `CATEGORY:${categoryKey}`
            : "CATEGORY:<name>";
         const existingPerm = currentPermissions.find(
            (permission) =>
               Number(permission.permission_id) === Number(permissionId),
         );
         const updated = existingPerm
            ? currentPermissions.map((permission) =>
                 Number(permission.permission_id) === Number(permissionId)
                    ? { ...permission, scope }
                    : permission,
              )
            : [...currentPermissions, { permission_id: permissionId, scope }];
         updateFormData("permissions", updated);
      },
      [currentPermissions, updateFormData],
   );

   /**
    * Handle toggling a virtual (grouped) permission
    * This toggles all underlying permissions that match the group pattern
    */
   const handleVirtualPermissionToggle = useCallback(
      (
         virtualPermName: string,
         group: ReturnType<typeof getPermissionGroup>,
      ) => {
         if (!group) return;

         // Get all underlying permission names for this virtual permission
         const underlyingPermNames = getUnderlyingPermissions(
            virtualPermName,
            group,
            allPermissionNames,
         );

         // Get the permission IDs
         const underlyingPermIds = underlyingPermNames
            .map((name) => permissionIdMap[name])
            .filter((id): id is number => id !== undefined);

         if (underlyingPermIds.length === 0) return;

         // Check if all underlying permissions are currently selected
         const allSelected = underlyingPermIds.every((id) =>
            currentPermissions.some(
               (p) => Number(p.permission_id) === Number(id),
            ),
         );

         let updated: typeof currentPermissions;

         if (allSelected) {
            // Create a set of IDs to remove (starts with underlying permissions)
            const idsToRemove = new Set(underlyingPermIds);

            // Add children of these permissions to removal set
            for (const id of underlyingPermIds) {
               const permName = getPermissionNameById(id, permissionIdMap);
               if (permName) {
                  const children = getChildPermissions(
                     permName,
                     allPermissionNames,
                  );
                  children.forEach((childName) => {
                     const childId = permissionIdMap[childName];
                     if (childId) idsToRemove.add(childId);
                  });
               }
            }

            // Remove all permissions in the removal set
            updated = currentPermissions.filter(
               (p) => !idsToRemove.has(p.permission_id),
            );
         } else {
            // Add all underlying permissions and their children
            updated = [...currentPermissions];
            const idsAdded = new Set(
               currentPermissions.map((p) => p.permission_id),
            );

            const addPermission = (permId: number) => {
               if (idsAdded.has(permId)) return;

               // Find the default scope
               let defaultScope = "DEFAULT";
               for (const category of permissionCategories) {
                  const perm = category.permissions.find(
                     (p) => Number(p.permission_id) === Number(permId),
                  );
                  if (perm) {
                     defaultScope = getDefaultScope(perm);
                     break;
                  }
               }

               updated.push({ permission_id: permId, scope: defaultScope });
               idsAdded.add(permId);
            };

            // Process each underlying permission
            for (const permId of underlyingPermIds) {
               addPermission(permId);

               // Handle children
               const permName = getPermissionNameById(permId, permissionIdMap);
               if (permName) {
                  const children = getChildPermissions(
                     permName,
                     allPermissionNames,
                  );
                  children.forEach((childName) => {
                     const childId = permissionIdMap[childName];
                     if (childId) addPermission(childId);
                  });
               }
            }
         }

         setSelectedPreset(null);
         updateFormData("permissions", updated);
      },
      [
         currentPermissions,
         updateFormData,
         permissionIdMap,
         allPermissionNames,
         permissionCategories,
      ],
   );

   /**
    * Check if a virtual permission is checked (all underlying permissions are selected)
    */
   const isVirtualPermissionChecked = useCallback(
      (
         virtualPermName: string,
         group: ReturnType<typeof getPermissionGroup>,
      ): boolean => {
         if (!group) return false;

         const underlyingPermNames = getUnderlyingPermissions(
            virtualPermName,
            group,
            allPermissionNames,
         );
         const underlyingPermIds = underlyingPermNames
            .map((name) => permissionIdMap[name])
            .filter((id): id is number => id !== undefined);

         if (underlyingPermIds.length === 0) return false;

         return underlyingPermIds.every((id) =>
            currentPermissions.some(
               (p) => Number(p.permission_id) === Number(id),
            ),
         );
      },
      [currentPermissions, permissionIdMap, allPermissionNames],
   );

   const isVirtualPermissionRequired = useCallback(
      (
         virtualPerm: { name: string; actionPrefix: string },
         group: ReturnType<typeof getPermissionGroup>,
      ): boolean => {
         if (!group) return false;
         if (virtualPerm.actionPrefix !== "view") return false;

         const createVirtual = group.virtualPermissions.find(
            (vp) => vp.actionPrefix === "create",
         );
         if (!createVirtual) return false;

         const createPermNames = getUnderlyingPermissions(
            createVirtual.name,
            group,
            allPermissionNames,
         );
         const createPermIds = createPermNames
            .map((name) => permissionIdMap[name])
            .filter((id): id is number => id !== undefined);

         return createPermIds.some((id) =>
            currentPermissions.some(
               (p) => Number(p.permission_id) === Number(id),
            ),
         );
      },
      [currentPermissions, permissionIdMap, allPermissionNames],
   );

   const buildPresetPermissions = useCallback(
      (preset: PermissionPreset) => {
         const permissionsMap = new Map<
            number,
            { permission_id: number; scope: string }
         >();

         const addPermission = (
            permission: PermissionCategory["permissions"][number],
         ) => {
            const id = Number(permission.permission_id);
            if (Number.isNaN(id) || permissionsMap.has(id)) return;
            permissionsMap.set(id, {
               permission_id: id,
               scope: getDefaultScope(permission, true),
            });
         };

         if (preset.name === "system_admin") {
            permissionCategories.forEach((category) => {
               category.permissions.forEach(addPermission);
            });
            return Array.from(permissionsMap.values());
         }

         preset.permissions.forEach((presetPerm) => {
            const permission = permissionByName.get(
               normalizePermissionName(presetPerm.permission_name),
            );
            if (!permission) return;
            const id = Number(permission.permission_id);
            if (Number.isNaN(id)) return;
            const baseScope =
               presetPerm.scope ||
               permission.scope_default ||
               permission.scope ||
               "DEFAULT";
            permissionsMap.set(id, {
               permission_id: id,
               scope: getScopeWithAll(
                  baseScope,
                  permission.scope_options,
                  false,
               ),
            });
         });

         return Array.from(permissionsMap.values());
      },
      [permissionCategories, permissionByName],
   );

   const applyPreset = useCallback(
      (preset: PermissionPreset) => {
         // Toggle preset - if already selected, deselect and clear permissions
         if (selectedPreset === preset.name) {
            setSelectedPreset(null);
            updateFormData("permissions", []);
            toast.success(`Cleared "${preset.label}" preset`);
            return;
         }

         const newPermissions = buildPresetPermissions(preset);

         setSelectedPreset(preset.name);
         if (permissionCategories.length > 0) {
            updateFormData("permissions", newPermissions);
         }
         toast.success(`Applied "${preset.label}" preset`);
      },
      [
         buildPresetPermissions,
         permissionCategories.length,
         selectedPreset,
         updateFormData,
      ],
   );

   useEffect(() => {
      if (!selectedPreset || permissionCategories.length === 0) return;
      const preset = PERMISSION_PRESETS.find(
         (item) => item.name === selectedPreset,
      );
      if (!preset) return;
      const newPermissions = buildPresetPermissions(preset);
      if (newPermissions.length === 0) return;

      const currentIds = new Set(
         currentPermissions.map((permission) =>
            Number(permission.permission_id),
         ),
      );
      const newIds = new Set(
         newPermissions.map((permission) => permission.permission_id),
      );
      const isSame =
         currentIds.size === newIds.size &&
         Array.from(newIds).every((id) => currentIds.has(id));

      if (!isSame) {
         updateFormData("permissions", newPermissions);
      }
   }, [
      selectedPreset,
      permissionCategories.length,
      currentPermissions,
      buildPresetPermissions,
      updateFormData,
   ]);

   const permissionsSearchSet = useMemo(() => {
      if (!permissionsSearchData?.permissions) return null;
      return new Set(
         permissionsSearchData.permissions.map((perm) =>
            perm.permission_name.toLowerCase(),
         ),
      );
   }, [permissionsSearchData]);

   const filteredCategories = useMemo(() => {
      if (!trimmedSearchQuery) return permissionCategories;
      if (!permissionsSearchSet) return [];
      return permissionCategories
         .map((category) => ({
            ...category,
            permissions: category.permissions.filter((permission) =>
               permissionsSearchSet.has(
                  permission.permission_name.toLowerCase(),
               ),
            ),
         }))
         .filter((category) => category.permissions.length > 0);
   }, [permissionCategories, trimmedSearchQuery, permissionsSearchSet]);

   const fetchTeamOptions = useCallback(async (search: string) => {
      const response = await teamService.list({
         page: 1,
         limit: 20,
         search: search || undefined,
      });
      return (response.data || []).map((team) => ({
         id: String(team.id),
         label: team.name,
      }));
   }, []);

   const fetchEmployeeOptions = useCallback(async (search: string) => {
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
   }, []);

   const fields = useMemo(
      () => [
         {
            name: "permissions",
            type: "custom" as const,
            label: t("wizard.permissions.title"),
            render: () => (
               <>
                  <div className="mb-4">
                     <h4 className="text-base sm:text-lg font-semibold text-text-strong">
                        {t("wizard.permissions.categoriesTitle")}
                     </h4>
                  </div>

                  {/* Permission Presets */}
                  <div className="mb-4 space-y-2">
                     <label className="block text-sm font-medium text-text-strong">
                        {t("wizard.permissions.quickPresets")}
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
                  <div className="relative mb-4">
                     <div className="absolute start-3 top-1/2 transform -translate-y-1/2">
                        <Search size={16} className="fill-text-soft" />
                     </div>
                     <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={t("wizard.permissions.searchPlaceholder")}
                        className="w-full ps-10 pe-4 py-2.5 text-sm rounded-xl border border-border bg-bg-weak text-text-strong placeholder:text-text-soft focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary focus:bg-background transition-all"
                     />
                  </div>

                  {/* Permissions List */}
                  <div className="bg-bg-weak rounded-xl sm:rounded-2xl p-3">
                     <div className="space-y-6 flex flex-col">
                        {isLoading ? (
                           <div className="py-10 flex items-center justify-center">
                              <Loader label={t("wizard.permissions.loading")} />
                           </div>
                        ) : filteredCategories.length === 0 ? (
                           <div className="py-8 text-center">
                              <p className="text-sm text-text-soft">
                                 {t("wizard.permissions.noPermissions")}
                              </p>
                           </div>
                        ) : (
                           filteredCategories.map((category) => {
                              // Check if this category has a grouped permission config
                              const group = getPermissionGroup(
                                 category.category,
                              );

                              return (
                                 <div
                                    key={category.category}
                                    className="space-y-3">
                                    <div className="flex items-center">
                                       <h5 className="text-sm sm:text-base font-semibold text-text-strong">
                                          {group
                                             ? group.displayName
                                             : formatPermissionName(
                                                  category.category,
                                               )}
                                       </h5>
                                    </div>

                                    <div className="space-y-2.5 flex-col">
                                       {group
                                          ? // Render virtual permissions for grouped categories (e.g., Financial Settings)
                                            group.virtualPermissions.map(
                                               (virtualPerm) => {
                                                  const isRequired =
                                                     isVirtualPermissionRequired(
                                                        virtualPerm,
                                                        group,
                                                     );
                                                  const isChecked =
                                                     isRequired ||
                                                     isVirtualPermissionChecked(
                                                        virtualPerm.name,
                                                        group,
                                                     );
                                                  return (
                                                     <div
                                                        key={virtualPerm.name}
                                                        className="space-y-2">
                                                        <div
                                                           className={`flex items-center justify-between gap-3 py-1.5 px-2 rounded-lg hover:bg-background/80 transition-colors ${
                                                              isRequired
                                                                 ? "bg-primary/5 border border-primary/20"
                                                                 : ""
                                                           }`}>
                                                           <div className="flex items-center gap-2">
                                                              <Checkbox
                                                                 id={`virtual-perm-${virtualPerm.name}`}
                                                                 checked={
                                                                    isChecked
                                                                 }
                                                                 onChange={() => {
                                                                    if (
                                                                       !isRequired
                                                                    ) {
                                                                       handleVirtualPermissionToggle(
                                                                          virtualPerm.name,
                                                                          group,
                                                                       );
                                                                    }
                                                                 }}
                                                                 label={
                                                                    virtualPerm.label
                                                                 }
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
                                                        </div>
                                                     </div>
                                                  );
                                               },
                                            )
                                          : category.permissions.map(
                                               (permission) => {
                                                  const selectedPermission =
                                                     currentPermissions.find(
                                                        (selected) =>
                                                           Number(
                                                              selected.permission_id,
                                                           ) ===
                                                           Number(
                                                              permission.permission_id,
                                                           ),
                                                     );

                                                  // Get scope options - keep all options including TEAM, MANAGED_BY, ASSIGNED
                                                  const rawScopeOptions =
                                                     permission.scope_options ||
                                                     [];
                                                  const scopeOptions =
                                                     rawScopeOptions
                                                        .map((opt: string) => {
                                                           const label =
                                                              formatScopeLabel(
                                                                 opt,
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
                                                              opt,
                                                           ): opt is {
                                                              value: string;
                                                              label: string;
                                                           } => opt !== null,
                                                        );
                                                  const hasOnlyDefaultOption =
                                                     rawScopeOptions.length ===
                                                        1 &&
                                                     rawScopeOptions[0] ===
                                                        "DEFAULT";

                                                  // Determine if we need additional selectors
                                                  const needsTeamSelect =
                                                     selectedPermission &&
                                                     (selectedPermission.scope.startsWith(
                                                        "TEAM:",
                                                     ) ||
                                                        selectedPermission.scope ===
                                                           "TEAM:<id>");
                                                  const needsManagerSelect =
                                                     selectedPermission &&
                                                     (selectedPermission.scope.startsWith(
                                                        "MANAGED_BY:",
                                                     ) ||
                                                        selectedPermission.scope ===
                                                           "MANAGED_BY:<id>");
                                                  const needsAssignedSelect =
                                                     selectedPermission &&
                                                     (selectedPermission.scope.startsWith(
                                                        "ASSIGNED:",
                                                     ) ||
                                                        selectedPermission.scope ===
                                                           "ASSIGNED:<id>");
                                                  const needsCategorySelect =
                                                     selectedPermission &&
                                                     (selectedPermission.scope.startsWith(
                                                        "CATEGORY:",
                                                     ) ||
                                                        selectedPermission.scope ===
                                                           "CATEGORY:<name>");

                                                  const teamId =
                                                     selectedPermission?.scope?.startsWith(
                                                        "TEAM:",
                                                     ) &&
                                                     selectedPermission.scope !==
                                                        "TEAM:<id>"
                                                        ? selectedPermission.scope.split(
                                                             ":",
                                                          )[1]
                                                        : "";
                                                  const managerId =
                                                     selectedPermission?.scope?.startsWith(
                                                        "MANAGED_BY:",
                                                     ) &&
                                                     selectedPermission.scope !==
                                                        "MANAGED_BY:<id>"
                                                        ? selectedPermission.scope.split(
                                                             ":",
                                                          )[1]
                                                        : "";
                                                  const assignedId =
                                                     selectedPermission?.scope?.startsWith(
                                                        "ASSIGNED:",
                                                     ) &&
                                                     selectedPermission.scope !==
                                                        "ASSIGNED:<id>"
                                                        ? selectedPermission.scope.split(
                                                             ":",
                                                          )[1]
                                                        : "";
                                                  const rawCategoryValue =
                                                     selectedPermission?.scope?.startsWith(
                                                        "CATEGORY:",
                                                     ) &&
                                                     selectedPermission.scope !==
                                                        "CATEGORY:<name>"
                                                        ? normalizeCategoryValue(
                                                             selectedPermission.scope.split(
                                                                ":",
                                                             )[1] || "",
                                                          )
                                                        : "";
                                                  const categoryValue =
                                                     fallbackTicketCategories.includes(
                                                        rawCategoryValue,
                                                     )
                                                        ? rawCategoryValue
                                                        : "";

                                                  const isRequired =
                                                     isRequiredPermission(
                                                        permission.permission_id,
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
                                                                    !!selectedPermission
                                                                 }
                                                                 onChange={() =>
                                                                    handlePermissionToggle(
                                                                       permission.permission_id,
                                                                       getDefaultScope(
                                                                          permission,
                                                                       ),
                                                                    )
                                                                 }
                                                                 label={formatPermissionName(
                                                                    permission.permission_name,
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
                                                                 selectedPermission) &&
                                                                 scopeOptions.length >
                                                                    0 &&
                                                                 !hasOnlyDefaultOption &&
                                                                 (() => {
                                                                    // Get current scope - use selectedPermission if available, otherwise use default
                                                                    const currentScope =
                                                                       selectedPermission?.scope ||
                                                                       getDefaultScope(
                                                                          permission,
                                                                       );
                                                                    return (
                                                                       <Select
                                                                          options={
                                                                             scopeOptions
                                                                          }
                                                                          value={
                                                                             // Show "TEAM:<id>" option when scope has a specific team ID
                                                                             currentScope.startsWith(
                                                                                "TEAM:",
                                                                             ) &&
                                                                             currentScope !==
                                                                                "TEAM"
                                                                                ? "TEAM:<id>"
                                                                                : // Show "MANAGED_BY:<id>" option when scope has a specific manager ID
                                                                                  currentScope.startsWith(
                                                                                       "MANAGED_BY:",
                                                                                    ) &&
                                                                                    currentScope !==
                                                                                       "MANAGED_BY"
                                                                                  ? "MANAGED_BY:<id>"
                                                                                  : // Show "ASSIGNED:<id>" option when scope has a specific employee ID
                                                                                    currentScope.startsWith(
                                                                                         "ASSIGNED:",
                                                                                      ) &&
                                                                                      currentScope !==
                                                                                         "ASSIGNED"
                                                                                    ? "ASSIGNED:<id>"
                                                                                    : // Show "CATEGORY:<name>" option when scope has a category
                                                                                      currentScope.startsWith(
                                                                                           "CATEGORY:",
                                                                                        ) &&
                                                                                        currentScope !==
                                                                                           "CATEGORY"
                                                                                      ? "CATEGORY:<name>"
                                                                                      : // Otherwise show the exact scope value (including TEAM, MANAGED_BY, ASSIGNED, DEFAULT, ALL)
                                                                                        currentScope
                                                                          }
                                                                          onChange={(
                                                                             value,
                                                                          ) =>
                                                                             handleScopeChange(
                                                                                permission.permission_id,
                                                                                value,
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
                                                                          value,
                                                                       ) =>
                                                                          handleCategoryChange(
                                                                             permission.permission_id,
                                                                             value,
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
                                                                          teamId
                                                                       }
                                                                       onChange={(
                                                                          value,
                                                                       ) =>
                                                                          handleTeamChange(
                                                                             permission.permission_id,
                                                                             value,
                                                                          )
                                                                       }
                                                                       options={teamsData.data.map(
                                                                          (
                                                                             team,
                                                                          ) => ({
                                                                             id: String(
                                                                                team.id,
                                                                             ),
                                                                             label: team.name,
                                                                          }),
                                                                       )}
                                                                       serverSideSearch={
                                                                          true
                                                                       }
                                                                       fetchOptions={
                                                                          fetchTeamOptions
                                                                       }
                                                                    />
                                                                 )}

                                                              {/* Manager Selector - inline */}
                                                              {needsManagerSelect &&
                                                                 employeesData?.data && (
                                                                    <SearchableSelect
                                                                       placeholder="Select manager..."
                                                                       value={
                                                                          managerId
                                                                       }
                                                                       onChange={(
                                                                          value,
                                                                       ) =>
                                                                          handleManagerChange(
                                                                             permission.permission_id,
                                                                             value,
                                                                          )
                                                                       }
                                                                       options={employeesData.data.map(
                                                                          (
                                                                             emp,
                                                                          ) => ({
                                                                             id: String(
                                                                                emp.id,
                                                                             ),
                                                                             label: emp.name,
                                                                             avatarUrl:
                                                                                emp.avatar ||
                                                                                undefined,
                                                                          }),
                                                                       )}
                                                                       serverSideSearch={
                                                                          true
                                                                       }
                                                                       fetchOptions={
                                                                          fetchEmployeeOptions
                                                                       }
                                                                    />
                                                                 )}

                                                              {/* Assigned Employee Selector - inline */}
                                                              {needsAssignedSelect &&
                                                                 employeesData?.data && (
                                                                    <SearchableSelect
                                                                       placeholder="Select employee..."
                                                                       value={
                                                                          assignedId
                                                                       }
                                                                       onChange={(
                                                                          value,
                                                                       ) =>
                                                                          handleAssignedChange(
                                                                             permission.permission_id,
                                                                             value,
                                                                          )
                                                                       }
                                                                       options={employeesData.data.map(
                                                                          (
                                                                             emp,
                                                                          ) => ({
                                                                             id: String(
                                                                                emp.id,
                                                                             ),
                                                                             label: emp.name,
                                                                             avatarUrl:
                                                                                emp.avatar ||
                                                                                undefined,
                                                                          }),
                                                                       )}
                                                                       serverSideSearch={
                                                                          true
                                                                       }
                                                                       fetchOptions={
                                                                          fetchEmployeeOptions
                                                                       }
                                                                    />
                                                                 )}
                                                           </div>
                                                        </div>
                                                     </div>
                                                  );
                                               },
                                            )}
                                    </div>
                                 </div>
                              );
                           })
                        )}
                     </div>
                  </div>
               </>
            ),
         },
      ],
      [
         t,
         filteredCategories,
         currentPermissions,
         searchQuery,
         selectedPreset,
         isLoading,
         teamsData,
         employeesData,
         categoryOptions,
         applyPreset,
         handleCategoryChange,
         handleAssignedChange,
         handleManagerChange,
         handlePermissionToggle,
         handleScopeChange,
         handleVirtualPermissionToggle,
         handleTeamChange,
         isRequiredPermission,
         isVirtualPermissionChecked,
         isVirtualPermissionRequired,
      ],
   ); // Add missing deps

   return (
      <>
         <div className="w-full max-w-full">
            <div className="bg-background border rounded-xl sm:rounded-2xl border-border flex flex-col overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] w-full max-w-full sm:max-w-2xl md:max-w-full xl:max-w-[2400px] h-auto min-h-[500px] sm:min-h-[600px] md:min-h-[650px] xl:h-[720px] p-4 sm:p-5 md:p-6 gap-4 sm:gap-5 md:gap-6 xl:gap-8">
               {/* Header */}
               <div className="shrink-0">
                  <h3 className="text-lg sm:text-xl font-semibold text-text-strong">
                     {t("wizard.permissions.title")}
                  </h3>
                  <p className="mt-1 text-xs sm:text-sm text-text-soft">
                     {t("wizard.permissions.subtitle")}
                  </p>
               </div>

               {/* Categories & Permissions Section */}
               <GenericForm<RoleFormData>
                  schema={roleSchema}
                  defaultValues={formData}
                  onSubmit={() => {}}
                  onFieldChange={updateFormData}
                  showSubmitButton={false}
                  mode="onChange"
                  className="space-y-4 flex-1"
                  fields={fields}
                  renderFields={(form) => {
                     if (formRef) {
                        formRef.current = form;
                     }

                     return fields.map((fieldConfig) => (
                        <GenericFormField
                           key={fieldConfig.name}
                           fieldConfig={fieldConfig}
                           form={form}
                           onFieldChange={(field, value) =>
                              updateFormData(field as keyof RoleFormData, value)
                           }
                        />
                     ));
                  }}
               />
            </div>
         </div>
      </>
   );
}

export default StepPermissions;
