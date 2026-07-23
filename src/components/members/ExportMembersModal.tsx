/** @format */

import { useState } from "react";
import * as XLSX from "xlsx";
import Papa from "papaparse";
import Checkbox from "@/designSystem/Checkbox";
import Radio from "@/designSystem/Radio";
import Button from "@/designSystem/Button";
import { CloseLine } from "@/Icons";
import { useTranslation } from "@/hooks/useTranslation";
import type { Member } from "./MembersTable";

type ExportScope = "selected" | "all";
type FileFormat = "csv" | "xlsx";

interface ExportMembersModalProps {
   isOpen: boolean;
   onClose: () => void;
   members: Member[];
   selectedMembers?: Member[];
}

interface SelectedDataFields {
   email: boolean;
   contactNumber: boolean;
   joinedDate: boolean;
   role: boolean;
   permissionsStatus: boolean;
   employmentStatus: boolean;
}

function ExportMembersModal({ isOpen, onClose, members, selectedMembers = [] }: ExportMembersModalProps) {
   const [scope, setScope] = useState<ExportScope>("all");
   const [fileFormat, setFileFormat] = useState<FileFormat>("xlsx");
   const [selectedFields, setSelectedFields] = useState<SelectedDataFields>({
      email: true,
      contactNumber: true,
      joinedDate: true,
      role: true,
      permissionsStatus: true,
      employmentStatus: true,
   });
   const { t } = useTranslation(["members", "common"]);

   const handleFieldChange = (field: keyof SelectedDataFields) => {
      setSelectedFields((prev) => ({
         ...prev,
         [field]: !prev[field],
      }));
   };

   const handleExport = () => {
      // Determine which members to export based on scope
      const membersToExport = scope === "selected" && selectedMembers.length > 0 
         ? selectedMembers 
         : members;

      if (membersToExport.length === 0) {
         console.warn("No members to export");
         onClose();
         return;
      }

      // Map members to export data with selected fields
      const rows = membersToExport.map((member) => {
         const row: Record<string, any> = {
            Name: member.name,
            "Job Title": member.jobTitle,
         };

         if (selectedFields.email) row.Email = member.email;
         if (selectedFields.contactNumber) row["Contact Number"] = member.contact;
         if (selectedFields.joinedDate) row["Joined Date"] = member.joinedAt;
         if (selectedFields.role) row.Role = member.role;
         if (selectedFields.permissionsStatus) {
            row["Permissions Status"] = member.isPermissionOverride ? "Overridden" : "Default";
         }
         if (selectedFields.employmentStatus) row["Employment Status"] = member.status;

         return row;
      });

      const timestamp = new Date().toISOString().split("T")[0];
      const filename = `members_${timestamp}`;

      if (fileFormat === "csv") {
         const csv = Papa.unparse(rows, {
            quotes: true,
            header: true,
         });
         const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
         const url = URL.createObjectURL(blob);
         const link = document.createElement("a");
         link.href = url;
         link.setAttribute("download", `${filename}.csv`);
         document.body.appendChild(link);
         link.click();
         document.body.removeChild(link);
         URL.revokeObjectURL(url);
      } else {
         const worksheet = XLSX.utils.json_to_sheet(rows);
         
         // Auto-size columns
         const maxWidth = 50;
         const columnWidths = Object.keys(rows[0] || {}).map((key) => {
            const maxLength = Math.max(
               key.length,
               ...rows.map((row) => String(row[key] || "").length)
            );
            return { wch: Math.min(maxLength + 2, maxWidth) };
         });
         worksheet["!cols"] = columnWidths;

         const workbook = XLSX.utils.book_new();
         XLSX.utils.book_append_sheet(workbook, worksheet, "Members");
         XLSX.writeFile(workbook, `${filename}.xlsx`);
      }

      onClose();
   };

   if (!isOpen) return null;

   return (
      <div
         className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4"
         onClick={onClose}>
         {/* Backdrop */}
         <div className="absolute inset-0 bg-overlay" />

         {/* Modal Content */}
         <div
            className="relative z-10 w-full max-w-md max-h-[90vh] rounded-2xl bg-background border border-border shadow-lg overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
               <h2 className="text-sm font-medium text-text-strong">
                  {t("members:export.title")}
               </h2>
               <button
                  onClick={onClose}
                  className="p-0.5 rounded-md hover:bg-bg-weak transition-colors">
                  <CloseLine size={20} />
               </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-4">
               <div className="flex flex-col gap-4">
                  {/* Export Scope Section */}
                  <div className="flex flex-col gap-4">
                     <h3 className="text-sm font-medium text-text-strong">
                        {t("members:export.scope.title")}
                     </h3>
                     <div className="flex flex-col gap-3">
                        {/* Selected Members Option */}
                        <div className="flex gap-2">
                           <Radio
                              id="scope-selected"
                              name="scope"
                              value="selected"
                              checked={scope === "selected"}
                              onChange={() => setScope("selected")}
                              disabled={selectedMembers.length === 0}
                           />
                           <label
                              htmlFor="scope-selected"
                              className={`flex-1 ${selectedMembers.length === 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                              <div className="text-sm font-regular text-text-strong mb-1">
                                 {t("members:export.scope.selected")} {selectedMembers.length > 0 && `(${selectedMembers.length})`}
                              </div>
                              <div className="text-xs text-text-soft">
                                 {t("members:export.scope.selectedDesc")}
                              </div>
                           </label>
                        </div>

                        {/* All Members Option */}
                        <div className="flex gap-2">
                           <Radio
                              id="scope-all"
                              name="scope"
                              value="all"
                              checked={scope === "all"}
                              onChange={() => setScope("all")}
                           />
                           <label
                              htmlFor="scope-all"
                              className="flex-1 cursor-pointer">
                              <div className="text-sm font-regular text-text-strong mb-1">
                                 {t("members:export.scope.all")} ({members.length})
                              </div>
                              <div className="text-xs text-text-soft">
                                 {t("members:export.scope.allDesc")}
                              </div>
                           </label>
                        </div>
                     </div>
                  </div>

                  {/* Data Included Section */}
                  <div className="flex flex-col gap-4">
                     <div>
                        <h3 className="text-sm font-medium text-text-strong">
                           {t("members:export.dataIncluded.title")}
                        </h3>
                        <p className="text-xs text-text-soft mt-1">
                           {t("members:export.dataIncluded.subtitle")}
                        </p>
                     </div>

                     <div className="flex flex-wrap gap-3">
                        {/* Email */}
                        <Checkbox
                           id="field-email"
                           checked={selectedFields.email}
                           onChange={() => handleFieldChange("email")}
                           label={t("members:fields.email")}
                           labelClassName="text-sm font-regular"
                        />

                        {/* Contact Number */}
                        <Checkbox
                           id="field-contact"
                           checked={selectedFields.contactNumber}
                           onChange={() => handleFieldChange("contactNumber")}
                           label={t("members:fields.contactNumber")}
                           labelClassName="text-sm font-regular"
                        />

                        {/* Joined Date */}
                        <Checkbox
                           id="field-joined"
                           checked={selectedFields.joinedDate}
                           onChange={() => handleFieldChange("joinedDate")}
                           label={t("members:fields.joinedDate")}
                           labelClassName="text-sm font-regular"
                        />

                        {/* Role */}
                        <Checkbox
                           id="field-role"
                           checked={selectedFields.role}
                           onChange={() => handleFieldChange("role")}
                           label={t("members:fields.role")}
                           labelClassName="text-sm font-regular"
                        />

                        {/* Permissions Status */}
                        <Checkbox
                           id="field-permissions"
                           checked={selectedFields.permissionsStatus}
                           onChange={() =>
                              handleFieldChange("permissionsStatus")
                           }
                           label={t("members:fields.permissionsStatus")}
                           labelClassName="text-sm font-regular"
                        />

                        {/* Employment Status */}
                        <Checkbox
                           id="field-employment"
                           checked={selectedFields.employmentStatus}
                           onChange={() =>
                              handleFieldChange("employmentStatus")
                           }
                           label={t("members:fields.employmentStatus")}
                           labelClassName="text-sm font-regular"
                        />
                     </div>
                  </div>

                  {/* File Format Section */}
                  <div className="flex flex-col gap-4">
                     <h3 className="text-sm font-medium text-text-strong">
                        {t("members:export.fileFormat.title")}
                     </h3>
                     <div className="flex flex-col gap-3">
                  {/* CSV Option */}
                  <div className="flex gap-2">
                     <Radio
                        id="format-csv"
                        name="format"
                        value="csv"
                        checked={fileFormat === "csv"}
                        onChange={() => setFileFormat("csv")}
                     />
                     <label
                        htmlFor="format-csv"
                        className="flex-1 cursor-pointer">
                        <div className="text-sm font-regular text-text-strong mb-1">
                           CSV
                        </div>
                     </label>
                  </div>

                  {/* XLSX Option */}
                  <div className="flex gap-2">
                     <Radio
                        id="format-xlsx"
                        name="format"
                        value="xlsx"
                        checked={fileFormat === "xlsx"}
                        onChange={() => setFileFormat("xlsx")}
                     />
                     <label
                        htmlFor="format-xlsx"
                        className="flex-1 cursor-pointer">
                        <div className="text-sm font-medium text-text-strong mb-1">
                           XLSX
                        </div>
                     </label>
                  </div>
                     </div>
                  </div>
               </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-border px-5 py-4 flex items-center justify-end gap-3">
               <Button variant="secondary" onClick={onClose}>
                  {t("common:actions.cancel")}
               </Button>
               <Button variant="primary" onClick={handleExport}>
                  {t("common:actions.export")}
               </Button>
            </div>
         </div>
      </div>
   );
}

export default ExportMembersModal;
