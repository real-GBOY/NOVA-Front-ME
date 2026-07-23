/** @format */

import { useMemo, useState, MutableRefObject, useCallback, useRef } from "react";
import { UseFormReturn } from "react-hook-form";
import GenericForm from "@/designSystem/GenericForm";
import { GenericFormField } from "@/designSystem/GenericFormField";
import type { MemberFormData } from "@/utilities/schemas/memberSchema";
import type { FieldConfig } from "@/designSystem/GenericForm";
import DatePicker from "@/designSystem/DatePicker";
import ShiftSelector from "../../AddMemberWizard/ShiftSelector";
import Checkbox from "@/designSystem/Checkbox";
import { useTranslation } from "@/hooks/useTranslation";
import { createEditMemberSchema } from "@/utilities/schemas/editMemberSchema";
import { jobTitleService } from "@/services/jobTitleService";
import { teamService } from "@/services/teamService";
import { roleService } from "@/services/roleService";
import { employeeService } from "@/services/employeeService";

type EditStepWorkInfoProps = {
   formData: MemberFormData;
   updateFormData: (field: keyof MemberFormData, value: unknown) => void;
   availableJobTitles?: { id: string; title: string }[];
   availableTeams?: { id: string; name: string }[];
   availableRoles?: { id: string; title: string }[];
   availableManagers?: { id: string; name: string; avatar?: string }[];
   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   formRef: MutableRefObject<UseFormReturn<any> | null>;
   employeeId: string | number;
};

function EditStepWorkInfo({
   formData,
   updateFormData,
   availableJobTitles = [],
   availableTeams = [],
   availableRoles = [],
   availableManagers = [],
   formRef,
   employeeId,
}: EditStepWorkInfoProps) {
   const { t } = useTranslation("common");
   const jobTitleSearchCacheRef = useRef<Map<string, Array<{ id: string; label: string }>>>(
      new Map(),
   );
   const teamSearchCacheRef = useRef<Map<string, Array<{ id: string; label: string }>>>(
      new Map(),
   );
   const roleSearchCacheRef = useRef<Map<string, Array<{ id: string; label: string }>>>(
      new Map(),
   );

   const fetchJobTitleOptions = useCallback(
      async (search: string): Promise<Array<{ id: string; label: string }>> => {
         const normalizedSearch = search.trim().toLowerCase();
         const cached = jobTitleSearchCacheRef.current.get(normalizedSearch);
         if (cached) return cached;

         const response = await jobTitleService.list({
            page: 1,
            limit: 20,
            search: normalizedSearch || undefined,
         });

         const mapped = (response.data || []).map((jobTitle) => ({
            id: String(jobTitle.id),
            label: jobTitle.title,
         }));
         jobTitleSearchCacheRef.current.set(normalizedSearch, mapped);
         return mapped;
      },
      []
   );

   const fetchTeamOptions = useCallback(
      async (search: string): Promise<Array<{ id: string; label: string }>> => {
         const normalizedSearch = search.trim().toLowerCase();
         const cached = teamSearchCacheRef.current.get(normalizedSearch);
         if (cached) return cached;

         const response = await teamService.list({
            page: 1,
            limit: 20,
            search: normalizedSearch || undefined,
         });

         const mapped = (response.data || []).map((team) => ({
            id: String(team.id),
            label: team.name,
         }));
         teamSearchCacheRef.current.set(normalizedSearch, mapped);
         return mapped;
      },
      []
   );

   const fetchRoleOptions = useCallback(
      async (search: string): Promise<Array<{ id: string; label: string }>> => {
         const normalizedSearch = search.trim().toLowerCase();
         const cached = roleSearchCacheRef.current.get(normalizedSearch);
         if (cached) return cached;

         const response = await roleService.list({
            page: 1,
            limit: 20,
            search: normalizedSearch || undefined,
         });

         const mapped = (response.data || []).map((role) => ({
            id: String(role.id),
            label: role.name,
         }));
         roleSearchCacheRef.current.set(normalizedSearch, mapped);
         return mapped;
      },
      []
   );

   const fetchManagerOptions = useCallback(
      async (search: string): Promise<Array<{ id: string; label: string }>> => {
         const response = await employeeService.getDictionary({
            page: 1,
            limit: 20,
            search: search.trim() || undefined,
            status: "Active",
         });

         return response.map((employee) => ({
            id: employee.id,
            label: employee.label,
         }));
      },
      []
   );

   // Create edit-specific schema
   const schema = useMemo(
      () => createEditMemberSchema(employeeId).stepWorkInfoSchema,
      [employeeId]
   );

   // Checkbox state for showing/hiding Manager and Work Shift fields
   const [isManager, setIsManager] = useState<boolean>(Boolean(formData.manager));
   const [hasWorkShift, setHasWorkShift] = useState<boolean>(Boolean(formData.shiftId));

   const EMPLOYMENT_TYPE_OPTIONS = useMemo(
      () => [
         {
            id: "full_time",
            label: t("members.workInfo.employmentTypeOptions.fullTime"),
         },
         {
            id: "part_time",
            label: t("members.workInfo.employmentTypeOptions.partTime"),
         },
         {
            id: "contract",
            label: t("members.workInfo.employmentTypeOptions.contract"),
         },
         {
            id: "intern",
            label: t("members.workInfo.employmentTypeOptions.intern"),
         },
         {
            id: "temporary",
            label: t("members.workInfo.employmentTypeOptions.temporary"),
         },
      ],
      [t]
   );

   const teamOptions = useMemo(
      () => availableTeams.map((t) => ({ id: t.id, label: t.name })),
      [availableTeams]
   );

   const fields: FieldConfig[] = [
      // Job Title & Team Row
      {
         name: "jobDetailsRow",
         type: "custom",
         render: (form) => (
            <div className="flex gap-4 w-full">
               <div className="flex-1">
                  <GenericFormField
                     fieldConfig={{
                        name: "jobTitle",
                        type: "searchableSelect",
                        label: t("members.workInfo.jobTitle"),
                        required: true,
                        options: availableJobTitles.map((jt) => ({
                           id: jt.id,
                           label: jt.title,
                        })),
                        serverSideSearch: true,
                        fetchOptions: fetchJobTitleOptions,
                        placeholder: t("members.workInfo.jobTitlePlaceholder"),
                     }}
                     form={form}
                     onFieldChange={(field, value) =>
                        updateFormData(field as keyof MemberFormData, value)
                     }
                  />
               </div>
               <div className="flex-1">
                  <div className="space-y-2">
                     <label className="block text-xs sm:text-sm font-medium text-text-sub">
                        {t("members.workInfo.team")}
                        <span className="text-primary"> *</span>
                     </label>
                     <GenericFormField
                        fieldConfig={{
                           name: "team_ids",
                           type: "searchableSelect",
                           required: true,
                           options: teamOptions,
                           serverSideSearch: true,
                           fetchOptions: fetchTeamOptions,
                           placeholder: t("members.workInfo.teamPlaceholder"),
                        }}
                        form={form}
                        onFieldChange={(_, value) => {
                           const selectedId = value ? String(value) : "";
                           const ids = selectedId ? [selectedId] : [];
                           updateFormData("team_ids", ids);
                           form.setValue("team_ids", ids, {
                              shouldValidate: true,
                              shouldDirty: true,
                           });
                        }}
                     />
                     {form.formState.errors.team_ids && (
                        <p className="text-xs text-danger">
                           {form.formState.errors.team_ids.message as string}
                        </p>
                     )}
                  </div>
               </div>
            </div>
         ),
      },
      // Role
      {
         name: "role",
         type: "searchableSelect",
         label: t("members.workInfo.role"),
         required: true,
         options: availableRoles.map((r) => ({ id: r.id, label: r.title })),
         serverSideSearch: true,
         fetchOptions: fetchRoleOptions,
         placeholder: t("members.workInfo.rolePlaceholder"),
      },
      // Manager with checkbox toggle
      {
         name: "managerSection",
         type: "custom",
         render: (form) => (
            <div className="flex flex-col gap-3">
               <Checkbox
                  label={t("members.workInfo.isManager")}
                  checked={isManager}
                  onChange={(e) => {
                     const checked = e.target.checked;
                     setIsManager(checked);
                     if (!checked) {
                        form.setValue("manager", "", {
                           shouldValidate: true,
                           shouldDirty: true,
                        });
                        updateFormData("manager", "");
                     }
                  }}
               />
               {isManager && (
                  <GenericFormField
                     fieldConfig={{
                        name: "manager",
                        type: "searchableSelect",
                        label: t("members.workInfo.manager"),
                        required: false,
                        options: availableManagers.map((m) => ({
                           id: m.id,
                           label: m.name,
                        })),
                        serverSideSearch: true,
                        fetchOptions: fetchManagerOptions,
                        placeholder: t("members.workInfo.managerPlaceholder"),
                     }}
                     form={form}
                     onFieldChange={(field, value) =>
                        updateFormData(field as keyof MemberFormData, value)
                     }
                  />
               )}
            </div>
         ),
      },
      // Work Shift with checkbox toggle
      {
         name: "shiftSection",
         type: "custom",
         render: (form) => (
            <div className="flex flex-col gap-3">
               <Checkbox
                  label={t("members.workInfo.hasWorkShift")}
                  checked={hasWorkShift}
                  onChange={(e) => {
                     const checked = e.target.checked;
                     setHasWorkShift(checked);
                     if (!checked) {
                        form.setValue("shiftId", null, {
                           shouldValidate: true,
                           shouldDirty: true,
                        });
                        updateFormData("shiftId", null);
                     }
                  }}
               />
               {hasWorkShift && (
                  <ShiftSelector
                     value={formData.shiftId}
                     onChange={(shiftId) => {
                        form.setValue("shiftId", shiftId, {
                           shouldValidate: true,
                           shouldDirty: true,
                        });
                        updateFormData("shiftId", shiftId);
                     }}
                     error={form.formState.errors.shiftId?.message as string}
                  />
               )}
            </div>
         ),
      },
      // Employment Type
      {
         name: "employmentType",
         type: "select",
         label: t("members.workInfo.employmentType"),
         placeholder: t("members.workInfo.employmentTypePlaceholder"),
         options: EMPLOYMENT_TYPE_OPTIONS,
         required: true,
      },
      // Start Date
      {
         name: "startDate",
         type: "custom",
         label: t("members.workInfo.startDate"),
         required: true,
         render: (form) => (
            <div className="flex flex-col gap-1">
               <label className="block text-sm font-medium text-text-strong">
                  {t("members.workInfo.startDate")}
                  <span className="text-primary">*</span>
               </label>
               <DatePicker
                  value={
                     formData.startDate
                        ? new Date(formData.startDate)
                        : undefined
                  }
                  onChange={(value: Date) => {
                     const dateStr = value.toISOString().split("T")[0];
                     form.setValue("startDate", dateStr, {
                        shouldValidate: true,
                        shouldDirty: true,
                     });
                     updateFormData("startDate", dateStr);
                  }}
                  placeholder={t("members.workInfo.startDatePlaceholder")}
               />
               {form.formState.errors.startDate && (
                  <p className="text-sm text-danger mt-1">
                     {form.formState.errors.startDate.message as string}
                  </p>
               )}
            </div>
         ),
      },
      // Work Schedule / Hours per week
      {
         name: "hoursPerWeek",
         type: "number",
         label: t("members.workInfo.workSchedule"),
         placeholder: t("members.workInfo.workSchedulePlaceholder"),
         required: true,
      },
      // Probation Period
      {
         name: "probationPeriod",
         type: "number",
         label: t("members.workInfo.probationPeriod"),
         placeholder: t("members.workInfo.probationPeriodPlaceholder"),
      },
   ];

   return (
      <div className="w-full max-w-full">
         <div className="bg-background border rounded-2xl border-border flex flex-col w-full p-6 gap-8">
            <div className="flex flex-col gap-6">
               <div className="flex flex-col gap-2">
                  <h3 className="text-lg font-semibold text-text-strong">
                     {t("members.workInfo.title")}
                  </h3>
                  <p className="text-sm text-text-sub">
                     {t("members.workInfo.subtitle") ||
                        "Update work information for this employee"}
                  </p>
               </div>

               <div className="bg-bg-weak h-px w-full" />

               <GenericForm
                  schema={schema}
                  defaultValues={formData}
                  formData={formData}
                  onSubmit={() => {}}
                  onFieldChange={updateFormData}
                  showSubmitButton={false}
                  mode="onChange"
                  fields={fields}
                  renderFields={(form) => {
                     formRef.current = form;

                     return (
                        <>
                           {fields.map((fieldConfig) => (
                              <GenericFormField
                                 key={fieldConfig.name}
                                 fieldConfig={fieldConfig}
                                 form={form}
                                 onFieldChange={(field, value) =>
                                    updateFormData(
                                       field as keyof MemberFormData,
                                       value
                                    )
                                 }
                              />
                           ))}
                        </>
                     );
                  }}
               />
            </div>
         </div>
      </div>
   );
}

export default EditStepWorkInfo;
