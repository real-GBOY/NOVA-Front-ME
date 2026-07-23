/** @format */

import { useState, useMemo } from "react";
import { CaseFormData } from "./types";
import { AddLine, Xmark } from "@/Icons";
import GenericForm, { FieldConfig } from "@/designSystem/GenericForm";
import Select, { SelectOption } from "@/designSystem/Select";
import SearchableSelect from "@/components/invoices/SearchableSelect";
import { useListEmployees } from "@/hooks/employees/employee.queries";
import { employeeService } from "@/services/employeeService";
import { useTranslation } from "@/hooks/useTranslation";
import * as yup from "yup";

type StepPeopleAndFilesProps = {
   formData: CaseFormData;
   updateFormData: (field: keyof CaseFormData, value: unknown) => void;
};

const filesSchema: yup.ObjectSchema<any> = yup.object().shape({
   files: yup.array().optional(),
});

function StepPeopleAndFiles({
   formData,
   updateFormData,
}: StepPeopleAndFilesProps) {
   const { t } = useTranslation("common");
   const [currentPersonId, setCurrentPersonId] = useState<string>("");
   const [currentRole, setCurrentRole] = useState<string>("");

   // Fetch employees for person dropdown
   const { data: employeesData } = useListEmployees(
      { page: 1, limit: 100 },
      { enabled: true }
   );

   // Transform employees to options for Select component
  const personOptions = useMemo<
      Array<{ id: string; label: string; avatarUrl?: string }>
   >(() => {
      if (!employeesData?.data) return [];
      return employeesData.data.map((employee) => ({
         id: employee.id.toString(),
         label: employee.name,
         avatarUrl: employee.avatar || undefined,
      }));
   }, [employeesData]);

   const fetchPersonOptions = async (search: string) => {
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
   };

   // Transform case roles to options for Select component
   const roleOptions: SelectOption[] = useMemo(
      () => [
         {
            value: "Lawyer",
            label: t("legalCases.peopleAndFiles.roleOptions.lawyer"),
         },
         { value: "HR", label: t("legalCases.peopleAndFiles.roleOptions.hr") },
         {
            value: "Manager",
            label: t("legalCases.peopleAndFiles.roleOptions.manager"),
         },
         {
            value: "Coordinator",
            label: t("legalCases.peopleAndFiles.roleOptions.coordinator"),
         },
         {
            value: "Assistant",
            label: t("legalCases.peopleAndFiles.roleOptions.assistant"),
         },
         {
            value: "Consultant",
            label: t("legalCases.peopleAndFiles.roleOptions.consultant"),
         },
      ],
      [t]
   );

   const people = formData.people || [];
   const files = formData.files || [];

   const handleAddPerson = () => {
      if (!currentPersonId || !currentRole) return;

      const selectedPerson = employeesData?.data.find(
         (e) => e.id.toString() === currentPersonId
      );

      if (!selectedPerson) return;

      const newPerson = {
         employee_id: parseInt(currentPersonId, 10),
         personName: selectedPerson.name,
         role: currentRole,
         avatarUrl: selectedPerson.avatar || undefined,
      };

      const updatedPeople = [...people, newPerson];
      updateFormData("people", updatedPeople);
      setCurrentPersonId("");
      setCurrentRole("");
   };

   const handleRemovePerson = (index: number) => {
      const updatedPeople = people.filter((_, i) => i !== index);
      updateFormData("people", updatedPeople);
   };

   const filesFields: FieldConfig[] = useMemo(
      () => [
         {
            name: "files",
            type: "uploadField" as const,
            label: t("legalCases.peopleAndFiles.attachDocuments"),
            accept: "image/jpeg,image/png,application/pdf,video/mp4",
            multiple: true,
            uploadPurpose: "general",
         },
      ],
      [t]
   );

   const handleFieldChange = (field: string, value: unknown) => {
      updateFormData(field as keyof CaseFormData, value);
   };

   return (
      <div className="w-full max-w-full">
         <div className="bg-background border rounded-xl sm:rounded-2xl border-border flex flex-col overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] w-full max-w-full sm:max-w-2xl md:max-w-full xl:max-w-[2400px] h-auto min-h-[500px] sm:min-h-[600px] md:min-h-[650px] xl:h-[720px] p-4 sm:p-5 md:p-6 gap-4 sm:gap-5 md:gap-6 xl:gap-8">
            {/* Header */}
            <div className="shrink-0">
               <h3 className="text-lg sm:text-xl font-semibold text-text-strong">
                  {t("legalCases.peopleAndFiles.title")}
               </h3>
               <p className="mt-1 text-xs sm:text-sm text-text-soft">
                  {t("legalCases.peopleAndFiles.description")}
               </p>
            </div>

            {/* Divider */}
            <div className="bg-bg-weak h-px w-full" />

            {/* Form Fields */}
            <div className="flex flex-col gap-4 flex-1">
               {/* People Section */}
               <div className="bg-bg-weak border border-border rounded-2xl p-3 flex flex-col gap-4">
                  <p className="text-base font-medium text-text-strong">
                     {t("legalCases.peopleAndFiles.people")}
                  </p>

                  {/* Person and Role Inputs */}
                  <div className="flex gap-4">
                     {/* Person Select */}
                     <div className="flex-1 flex flex-col gap-1">
                        <label className="text-sm font-medium text-text-strong">
                           {t("legalCases.peopleAndFiles.person")}{" "}
                           <span className="text-primary">*</span>
                        </label>
                        <SearchableSelect
                           value={currentPersonId}
                           onChange={setCurrentPersonId}
                           options={personOptions}
                           serverSideSearch={true}
                           fetchOptions={fetchPersonOptions}
                           placeholder={t(
                              "legalCases.peopleAndFiles.selectPerson"
                           )}
                           showTag
                        />
                     </div>

                     {/* Role Select */}
                     <div className="w-[200px] flex flex-col gap-1">
                        <label className="text-sm font-medium text-text-strong">
                           {t("legalCases.peopleAndFiles.role")}{" "}
                           <span className="text-primary">*</span>
                        </label>
                        <Select
                           options={roleOptions}
                           value={currentRole}
                           onChange={setCurrentRole}
                           placeholder={t(
                              "legalCases.peopleAndFiles.selectRole"
                           )}
                        />
                     </div>
                  </div>

                  {/* Add People Button */}
                  <button
                     type="button"
                     onClick={handleAddPerson}
                     disabled={!currentPersonId || !currentRole}
                     className="flex items-center justify-start gap-1 text-primary hover:text-primary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                     <AddLine size={20} className="fill-primary" />
                     <span className="text-sm font-medium">
                        {t("legalCases.peopleAndFiles.addPeople")}
                     </span>
                  </button>

                  {/* Added People List */}
                  {people.length > 0 && (
                     <div className="flex flex-col gap-2 mt-2">
                        {people.map((person, index) => (
                           <div
                              key={index}
                              className="flex items-center justify-between px-3 py-2 rounded-lg bg-background border border-border">
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                 <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-text-strong truncate">
                                       {person.personName}
                                    </p>
                                    <p className="text-xs text-text-sub">
                                       {person.role}
                                    </p>
                                 </div>
                              </div>
                              <button
                                 type="button"
                                 onClick={() => handleRemovePerson(index)}
                                 className="shrink-0 p-1 hover:bg-bg-weak rounded transition-colors">
                                 <Xmark size={16} className="fill-text-sub" />
                              </button>
                           </div>
                        ))}
                     </div>
                  )}
               </div>

               {/* Files Section */}
               <div className="flex flex-col gap-1">
                  <GenericForm
                     schema={filesSchema}
                     defaultValues={{ files }}
                     formData={{ files }}
                     fields={filesFields}
                     onSubmit={() => {}}
                     onFieldChange={handleFieldChange}
                     showSubmitButton={false}
                  />
               </div>
            </div>
         </div>
      </div>
   );
}

export default StepPeopleAndFiles;
