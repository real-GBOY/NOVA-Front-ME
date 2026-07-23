/** @format */

import { useState, useMemo } from "react";
import Modal from "@/designSystem/Modal";
import Button from "@/designSystem/Button";
import ConfirmModal from "@/designSystem/ConfirmModal";
import Select, { SelectOption } from "@/designSystem/Select";
import Loader from "@/designSystem/Loader";
import { useTranslation } from "@/hooks/useTranslation";
import { Search2Line, AddLine, CloseLine } from "@/Icons";
import { useListEmployees } from "@/hooks/employees/employee.queries";
import { useDebounce } from "use-debounce";

type Person = {
   id: string;
   name: string;
   role: string;
   jobTitle?: string;
   avatar?: string;
   avatarBg?: string;
   isCurrentUser?: boolean;
};

type AddPeopleModalProps = {
   isOpen: boolean;
   onClose: () => void;
   onAdd: (selectedPeople: Person[]) => void;
   existingPeople?: Person[];
};

const CASE_ROLE_OPTIONS = [
   { id: "Lawyer", label: "Lawyer" },
   { id: "HR", label: "HR" },
   { id: "Manager", label: "Manager" },
   { id: "Coordinator", label: "Coordinator" },
   { id: "Assistant", label: "Assistant" },
   { id: "Consultant", label: "Consultant" },
];

const ROLE_SELECT_OPTIONS: SelectOption[] = CASE_ROLE_OPTIONS.map((role) => ({
   value: role.id,
   label: role.label,
}));

const buildRoleOptions = (currentRole?: string) => {
   const options = [...ROLE_SELECT_OPTIONS];
   if (currentRole && !options.some((opt) => opt.value === currentRole)) {
      options.unshift({ value: currentRole, label: currentRole });
   }
   return options;
};
function AddPeopleModal({
   isOpen,
   onClose,
   onAdd,
   existingPeople = [],
}: AddPeopleModalProps) {
   const { t } = useTranslation("settings");
   const { t: tCommon } = useTranslation("common");
   const [searchQuery, setSearchQuery] = useState("");
   const [debouncedSearchQuery] = useDebounce(searchQuery, 300);
   const [selectedPeople, setSelectedPeople] = useState<Person[]>([]);
   const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
   const [error, setError] = useState<string | null>(null);

   const { data: employeesResponse, isLoading } = useListEmployees(
      {
         page: 1,
         limit: 10,
         search: debouncedSearchQuery || undefined,
      },
      {
         enabled: isOpen,
      }
   );

   const employees = employeesResponse?.data || [];

   // Map API employees to Person type
   const mappedEmployees: Person[] = employees.map((emp) => ({
      id: String(emp.id),
      name: emp.name,
      role: "",
      jobTitle: emp.job_title || t("legalCases.addPeopleModal.defaultRole"),
      avatar: emp.avatar || undefined,
      avatarBg: "bg-purple-200", // Default or random color
   }));

   // Filter out already existing people in the case
   const filteredEmployees = mappedEmployees.filter(
      (emp) => !existingPeople.find((p) => p.id === emp.id)
   );

   // Filter out currently selected people
   const displayEmployees = filteredEmployees.filter(
      (emp) => !selectedPeople.find((p) => p.id === emp.id)
   );

   const handleAddFromSearch = () => {
      if (!searchQuery.trim()) return;

      // If there is exactly one match in the current list, select it
      if (displayEmployees.length === 1) {
         setSelectedPeople([...selectedPeople, displayEmployees[0]]);
         setSearchQuery("");
         setError(null);
      }
   };

   const handleRoleChange = (personId: string, newRole: string) => {
      setSelectedPeople((prev) =>
         prev.map((person) =>
            person.id === personId ? { ...person, role: newRole } : person
         )
      );
   };

   const handleRemoveFromSelected = (personId: string) => {
      setSelectedPeople((prev) => prev.filter((p) => p.id !== personId));
      if (selectedPeople.length === 1) {
         setError(null);
      }
   };

   const handleMemberClick = (member: Person) => {
      setSelectedPeople((prev) => [...prev, member]);
      setError(null);
   };

   const handleAddClick = () => {
      if (selectedPeople.length === 0) {
         setError(t("legalCases.addPeopleModal.validation.required"));
         return;
      }
      onAdd(selectedPeople);
      setSelectedPeople([]);
      setSearchQuery("");
      setError(null);
      onClose();
   };

   const resetState = () => {
      setSelectedPeople([]);
      setSearchQuery("");
      setError(null);
   };

   const handleRequestClose = () => {
      if (isDirty) {
         setShowDiscardConfirm(true);
         return;
      }
      resetState();
      onClose();
   };

   const handleDiscardChanges = () => {
      setShowDiscardConfirm(false);
      resetState();
      onClose();
   };

   const isDirty = useMemo(
      () => Boolean(searchQuery.trim() || selectedPeople.length > 0),
      [searchQuery, selectedPeople.length]
   );

   return (
      <>
         <Modal
            isOpen={isOpen}
            onClose={handleRequestClose}
            title={t("legalCases.addPeopleModal.title")}
            size="medium"
            showHeaderDivider={false}
            footer={
               <div className="flex items-center justify-end gap-3 w-full">
                  <Button
                     variant="secondary"
                     onClick={handleRequestClose}
                     className="px-3 py-2 text-sm">
                     {t("legalCases.addPeopleModal.cancel")}
                  </Button>
                  <Button
                     onClick={handleAddClick}
                     className="px-3 py-2 text-sm">
                     {t("legalCases.addPeopleModal.add")}
                  </Button>
               </div>
            }>
            <div className="flex flex-col gap-4">
               {/* Search and Add Section */}
               <div className="flex flex-col gap-3">
                  <div className="flex gap-4 items-start">
                     {/* Search Input */}
                     <div className="flex-1 flex flex-col gap-1">
                        <div className="bg-background border border-border rounded-lg shadow-subtle flex gap-2 items-center px-3 py-2.5">
                           <Search2Line
                              size={20}
                              className="fill-text-soft shrink-0"
                           />
                           <input
                              type="text"
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              onKeyDown={(e) => {
                                 if (e.key === "Enter") {
                                    e.preventDefault();
                                    handleAddFromSearch();
                                 }
                              }}
                              placeholder={t(
                                 "legalCases.addPeopleModal.searchPlaceholder"
                              )}
                              className="flex-1 text-sm text-text-strong placeholder:text-text-soft outline-none bg-transparent"
                           />
                        </div>
                     </div>
                  </div>
                  {error && <p className="text-xs text-danger">{error}</p>}

                  {/* Selected People Tags */}
                  {selectedPeople.length > 0 && (
                     <div className="flex flex-col gap-2 mt-2">
                        {selectedPeople.map((person) => (
                           <div
                              key={person.id}
                              className="bg-background border border-border rounded-2xl p-3 flex gap-3 items-center">
                              <div
                                 className={`w-10 h-10 rounded-full overflow-hidden shrink-0 ${
                                    person.avatarBg || "bg-purple-200"
                                 }`}>
                                 {person.avatar ? (
                                    <img
                                       src={person.avatar}
                                       alt={person.name}
                                       className="w-full h-full object-cover"
                                    />
                                 ) : (
                                    <div className="w-full h-full bg-purple-200" />
                                 )}
                              </div>
                              <div className="flex-1 flex flex-col gap-1 min-w-0">
                                 <p className="text-sm font-medium text-text-strong truncate">
                                    {person.name}
                                 </p>
                                 <Select
                                    options={buildRoleOptions(person.role)}
                                    value={person.role}
                                    onChange={(value) =>
                                       handleRoleChange(person.id, value)
                                    }
                                    placeholder={t(
                                       "legalCases.addPeopleModal.rolePlaceholder"
                                    )}
                                 />
                              </div>
                              <button
                                 type="button"
                                 onClick={() =>
                                    handleRemoveFromSelected(person.id)
                                 }
                                 className="shrink-0 inline-flex items-center gap-1 text-xs text-text-soft hover:text-danger transition-colors cursor-pointer">
                                 <CloseLine
                                    size={16}
                                    className="fill-current"
                                 />
                                 <span>
                                    {t("legalCases.addPeopleModal.remove")}
                                 </span>
                              </button>
                           </div>
                        ))}
                     </div>
                  )}
               </div>

               {/* Members List */}
               <div className="flex flex-col gap-4">
                  <p className="text-sm text-text-soft">
                     {t("legalCases.addPeopleModal.suggested")}
                  </p>

                  {isLoading ? (
                     <Loader label={t("legalCases.addPeopleModal.loading")} />
                  ) : (
                     <div className="flex flex-col gap-4 max-h-[300px] overflow-y-auto">
                        {displayEmployees.length === 0 ? (
                           <p className="text-sm text-text-soft text-center py-2">
                              {searchQuery
                                 ? t("legalCases.addPeopleModal.noResults")
                                 : t("legalCases.addPeopleModal.emptyState")}
                           </p>
                        ) : (
                           displayEmployees.map((member) => (
                              <div
                                 key={member.id}
                                 onClick={() => handleMemberClick(member)}
                                 className="flex gap-3 items-center w-full cursor-pointer rounded-lg p-2 -mx-2 hover:bg-bg-weak transition-colors">
                                 {/* Avatar */}
                                 <div
                                    className={`w-10 h-10 rounded-full overflow-hidden shrink-0 ${
                                       member.avatarBg || "bg-neutral-200"
                                    }`}>
                                    {member.avatar ? (
                                       <img
                                          src={member.avatar}
                                          alt={member.name}
                                          className="w-full h-full object-cover"
                                       />
                                    ) : (
                                       <div className="w-full h-full bg-neutral-200" />
                                    )}
                                 </div>

                                 {/* Name and Role */}
                                 <div className="flex-1 flex flex-col gap-1 min-w-0">
                                    <div className="flex items-center gap-1">
                                       <p className="text-sm font-medium text-text-strong">
                                          {member.name}
                                       </p>
                                       {member.isCurrentUser && (
                                          <span className="text-xs text-text-soft">
                                             (
                                             {t(
                                                "legalCases.addPeopleModal.currentUser"
                                             )}
                                             )
                                          </span>
                                       )}
                                    </div>
                                    {member.jobTitle && (
                                       <p className="text-xs text-text-soft">
                                          {member.jobTitle}
                                       </p>
                                    )}
                                 </div>

                                 <AddLine size={20} className="fill-text-sub" />
                              </div>
                           ))
                        )}
                     </div>
                  )}
               </div>
            </div>
         </Modal>
         <ConfirmModal
            isOpen={showDiscardConfirm}
            onClose={() => setShowDiscardConfirm(false)}
            onConfirm={handleDiscardChanges}
            title={tCommon("unsavedChanges.title")}
            description={tCommon("unsavedChanges.description")}
            confirmText={tCommon("unsavedChanges.confirm")}
            cancelText={tCommon("unsavedChanges.cancel")}
         />
      </>
   );
}

export default AddPeopleModal;
