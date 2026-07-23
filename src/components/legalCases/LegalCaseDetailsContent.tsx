/** @format */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "@/hooks/useTranslation";
import IconButton from "@/designSystem/IconButton";
import Button from "@/designSystem/Button";
import BadgeTag from "@/designSystem/BadgeTag";
import {
   ArrowLeftSmall,
   ClipboardList,
   Files,
   FileText,
   Loader2Line,
   AddLine,
   CloseLine,
} from "@/Icons";
import MemberTag1 from "@/components/contracts/MemberTag1";
import MemberTag2 from "@/components/requests/ui/MemberTag2";
import { getLegalCaseStatusLabel, getLegalCaseStatusVariant } from "./data";
import type { LegalCase } from "./data";
import CaseInformationContent from "./caseInformation/CaseInformationContent";
import DocumentsContent from "./documents/DocumentsContent";
import AddPeopleModal from "./AddPeopleModal";
import AddUpdateModal, {
   AddUpdateFormValues,
} from "./caseInformation/AddUpdateModal";
import EditCaseDetailsModal, {
   EditCaseDetailsFormValues,
} from "./modals/EditCaseDetailsModal";
import EditEventModal, { EditEventFormValues } from "./modals/EditEventModal";
import CloseCaseModal from "./modals/CloseCaseModal";
import AddDocumentModal from "./modals/AddDocumentModal";
import {
   useGetLegalCaseDocuments,
   useGetLegalCaseEmployees,
   useGetLegalCaseActivities,
   useGetLegalCaseEvents,
   useAddLegalCaseEmployee,
   useRemoveLegalCaseEmployee,
   useCreateLegalCaseEvent,
   useUpdateLegalCaseEvent,
   useUpdateLegalCase,
   useAttachLegalCaseDocument,
} from "@/hooks/legalCases/legalCase.queries";
import { format, isValid } from "date-fns";
import type { LegalCaseEvent } from "@/services/legalCasesService";
import { usePermissions } from "@/contexts/PermissionContext";

interface LegalCaseDetailsContentProps {
   legalCase: LegalCase & { client?: string; lawyer_name?: string };
   onBack: () => void;
}

export default function LegalCaseDetailsContent({
   legalCase,
   onBack,
}: LegalCaseDetailsContentProps) {
   const { t } = useTranslation("settings");
   const navigate = useNavigate();
   const [activeTab, setActiveTab] = useState<"information" | "documents">(
      "information"
   );
   const [isAddPeopleModalOpen, setIsAddPeopleModalOpen] = useState(false);
   const [isAddUpdateModalOpen, setIsAddUpdateModalOpen] = useState(false);
   const [isEditCaseModalOpen, setIsEditCaseModalOpen] = useState(false);
   const [isCloseCaseModalOpen, setIsCloseCaseModalOpen] = useState(false);
   const [isAddDocumentModalOpen, setIsAddDocumentModalOpen] = useState(false);
   const [editingEvent, setEditingEvent] = useState<LegalCaseEvent | null>(
      null
   );
   const { can } = usePermissions();
   const canUpdateCase = can("update_legal_case");

   const { data: documentsResponse } = useGetLegalCaseDocuments(legalCase.id);
   const { data: employeesResponse } = useGetLegalCaseEmployees(legalCase.id);
   const { data: activitiesResponse } = useGetLegalCaseActivities(legalCase.id);
   const { data: eventsResponse } = useGetLegalCaseEvents(legalCase.id);

   const addEmployeeMutation = useAddLegalCaseEmployee();
   const removeEmployeeMutation = useRemoveLegalCaseEmployee();
   const updateCaseMutation = useUpdateLegalCase();
   const createEventMutation = useCreateLegalCaseEvent();
   const updateEventMutation = useUpdateLegalCaseEvent();
   const attachDocumentMutation = useAttachLegalCaseDocument();

   const documents = documentsResponse?.data || [];

   const employees = employeesResponse?.data || [];
   const activities = activitiesResponse?.data || [];
   const events = eventsResponse?.data || [];

   const handleAddPeople = (selectedPeople: any[]) => {
      if (!canUpdateCase) return;
      selectedPeople.forEach((person) => {
         addEmployeeMutation.mutate({
            caseId: legalCase.id,
            data: {
               employee_id: person.id,
               role: person.role || "Viewer",
            },
         });
      });
      setIsAddPeopleModalOpen(false);
   };

   const handleRemovePerson = (employeeId: string | number) => {
      if (!canUpdateCase) return;
      removeEmployeeMutation.mutate({
         caseId: legalCase.id,
         employeeId,
      });
   };

   const handleUpdateSummary = (newSummary: string) => {
      if (!canUpdateCase) return;
      updateCaseMutation.mutate({
         id: legalCase.id,
         data: { summary: newSummary },
      });
   };

   const handleAddEvent = (data: AddUpdateFormValues) => {
      if (!canUpdateCase) return;
      createEventMutation.mutate({
         caseId: legalCase.id,
         data: {
            event_title: data.title,
            event_date: data.date,
            description: data.description,
         },
      });
      setIsAddUpdateModalOpen(false);
   };

   const handleEditEvent = (data: EditEventFormValues) => {
      if (!canUpdateCase) return;
      if (!editingEvent) return;
      updateEventMutation.mutate({
         caseId: legalCase.id,
         eventId: editingEvent.id,
         data: {
            event_title: data.event_title,
            event_date: data.event_date,
            description: data.description,
         },
      });
      setEditingEvent(null);
   };

   const handleEditCaseDetails = (data: EditCaseDetailsFormValues) => {
      if (!canUpdateCase) return;
      const toApiStatus = (status?: string) => {
         if (!status) return undefined;
         const normalized = status.toLowerCase().replace(/_/g, " ");
         if (normalized === "open") return "Open";
         if (normalized === "in progress") return "In Progress";
         if (normalized === "closed") return "Closed";
         if (normalized === "on hold") return "On Hold";
         if (normalized === "cancelled") return "Cancelled";
         return status;
      };

      updateCaseMutation.mutate({
         id: legalCase.id,
         data: {
            ...data,
            status: toApiStatus(data.status),
         },
      });
      setIsEditCaseModalOpen(false);
   };

   const handleCloseCase = () => {
      if (!canUpdateCase) return;
      updateCaseMutation.mutate({
         id: legalCase.id,
         data: {
            status: "Closed",
            end_date: new Date().toISOString().split("T")[0],
         },
      });
      setIsCloseCaseModalOpen(false);
   };

   const handleAddDocument = (data: {
      file_id: number;
      file_name?: string;
      event_id?: number;
      token?: string;
   }) => {
      if (!canUpdateCase) return;
      attachDocumentMutation.mutate({
         caseId: legalCase.id,
         data,
      });
      setIsAddDocumentModalOpen(false);
   };

   return (
      <div className="relative">
         {/* Case Header Section */}
         <div className="bg-bg-weak border border-border rounded-2xl p-4 md:p-5 mb-6">
            <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8 mb-6">
               <div className="flex items-center gap-4 flex-1">
                  <IconButton
                     Icon={ArrowLeftSmall}
                     ariaLabel={t("legalCases.details.back")}
                     variant="ghost"
                     onClick={onBack}
                     className="border border-border bg-background"
                  />
                  <div className="flex flex-wrap items-center gap-2">
                     <h1 className="text-lg md:text-xl font-medium text-text-strong">
                        {legalCase.title}
                     </h1>
                     <BadgeTag
                        label={t(
                           `legalCases.status.${getLegalCaseStatusLabel(
                              legalCase.status
                           )}`
                        )}
                        variant={getLegalCaseStatusVariant(legalCase.status)}
                        size="sm"
                     />
                  </div>
               </div>
               <div className="flex items-center gap-3 md:justify-end">
                  {/* <IconButton
							Icon={MoreVertical}
							ariaLabel='More options'
							variant='ghost'
							className='border border-border bg-background'
						/> */}
                  {canUpdateCase && legalCase.status !== "closed" && (
                     <Button
                        variant="primary"
                        onClick={() => setIsCloseCaseModalOpen(true)}>
                        <span>{t("legalCases.details.closeCase")}</span>
                     </Button>
                  )}
               </div>
            </div>

            {/* Case Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
               <div className="flex flex-col gap-1">
                  <p className="text-sm text-text-soft">
                     {t("legalCases.details.caseType")}
                  </p>
                  <p className="text-base font-medium text-text-strong">
                     {legalCase.type}
                  </p>
               </div>
               <div className="flex flex-col gap-1">
                  <p className="text-sm text-text-soft">
                     {t("legalCases.details.caseNumber")}
                  </p>
                  <p className="text-base font-medium text-text-strong">
                     {legalCase.case_number}
                  </p>
               </div>
               <div className="flex flex-col gap-1">
                  <p className="text-sm text-text-soft">
                     {t("legalCases.details.lawyerName")}
                  </p>
                  <MemberTag2
                     name={
                        legalCase.Lawyer
                           ? `${legalCase.Lawyer.first_name} ${legalCase.Lawyer.last_name}`
                           : legalCase.assigned_to_name || "-"
                     }
                     avatar={legalCase.Lawyer?.avatar || "/icons/defAvatar.png"}
                     jobTitle={legalCase.Lawyer?.job_title}
                     onClick={() => {
                        if (legalCase.Lawyer?.employee_id) {
                           navigate(
                              `/dashboard/members/profile/${legalCase.Lawyer.employee_id}`
                           );
                        }
                     }}
                     className={
                        legalCase.Lawyer?.employee_id ? "cursor-pointer" : ""
                     }
                  />
               </div>
               <div className="flex flex-col gap-1">
                  <p className="text-sm text-text-soft">
                     {t("legalCases.details.client")}
                  </p>
                  <p className="text-base font-medium text-text-strong">
                     {legalCase.client || "-"}
                  </p>
               </div>
            </div>
         </div>

         {/* Tabs */}
         <div className="flex flex-wrap items-center gap-4 md:gap-6 border-b border-border mb-6">
            <button
               onClick={() => setActiveTab("information")}
               className={`flex items-center gap-1.5 pb-3.5 px-1 relative cursor-pointer ${
                  activeTab === "information"
                     ? "text-text-strong border-b-2 border-primary"
                     : "text-text-sub"
               }`}>
               <ClipboardList
                  size={20}
                  className={
                     activeTab === "information"
                        ? "fill-primary"
                        : "fill-text-sub"
                  }
               />
               <span className="text-sm font-medium">
                  {t("legalCases.details.caseInformation")}
               </span>
            </button>
            <button
               onClick={() => setActiveTab("documents")}
               className={`flex items-center gap-1.5 pb-3.5 px-1 relative cursor-pointer ${
                  activeTab === "documents"
                     ? "text-text-strong border-b-2 border-primary"
                     : "text-text-sub"
               }`}>
               <Files
                  size={20}
                  className={
                     activeTab === "documents"
                        ? "fill-primary"
                        : "fill-text-sub"
                  }
               />
               <span className="text-sm font-medium">
                  {t("legalCases.details.documents")}
               </span>
               <span className="bg-bg-weak text-text-sub text-xs font-medium px-1.5 py-0.5 rounded-full ml-1">
                  {documents.length}
               </span>
            </button>
         </div>

         {/* Main Content */}
         <div className="flex flex-col xl:flex-row gap-6">
            {/* Left Column */}
            <div className="flex-[3] flex flex-col gap-6">
               {activeTab === "information" && (
                  <CaseInformationContent
                     summary={legalCase.description}
                     events={events}
                     onUpdateSummary={
                        canUpdateCase ? handleUpdateSummary : undefined
                     }
                     onAddEvent={
                        canUpdateCase
                           ? () => setIsAddUpdateModalOpen(true)
                           : undefined
                     }
                     onEditEvent={
                        canUpdateCase
                           ? (event) => setEditingEvent(event)
                           : undefined
                     }
                     canUpdateCase={canUpdateCase}
                  />
               )}
               {activeTab === "documents" && (
                  <DocumentsContent
                     documents={documents}
                     onAddDocument={
                        canUpdateCase
                           ? () => setIsAddDocumentModalOpen(true)
                           : undefined
                     }
                  />
               )}
            </div>

            {/* Right Sidebar */}
            {activeTab === "information" && (
               <div className="flex-[2] flex flex-col gap-6 w-full">
                  {/* Activity Log */}
                  <div className="bg-background border border-border rounded-2xl p-4 shadow-sm flex flex-col gap-5">
                     <h2 className="text-lg font-medium text-text-strong">
                        {t("legalCases.details.activityLog")}
                     </h2>
                     <div className="flex flex-col relative">
                        {/* Connecting line - spans from first to last circle */}
                        <div
                           className="absolute left-5 top-10 w-0.5 border-l border-dashed border-stroke-sub"
                           style={{ height: "calc(100% - 40px)" }}
                        />

                        {activities.length === 0 && (
                           <p className="text-sm text-text-soft py-4 text-center">
                              {t("legalCases.details.noActivity")}
                           </p>
                        )}

                        {activities.map((activity, index) => {
                           const performedAt = activity.performed_at
                              ? new Date(activity.performed_at)
                              : null;
                           const showDate =
                              performedAt && isValid(performedAt)
                                 ? format(performedAt, "dd MMMM, yyyy")
                                 : null;
                           const showTime =
                              performedAt && isValid(performedAt)
                                 ? format(performedAt, "hh:mm a")
                                 : null;

                           return (
                              <div
                                 key={activity.id || index}
                                 className="flex gap-4 relative">
                                 <div className="flex flex-col items-center">
                                    <div className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center shadow-sm p-2 relative z-10">
                                       {activity.action === "created" ? (
                                          <Loader2Line
                                             size={24}
                                             className="fill-text-sub"
                                          />
                                       ) : (
                                          <FileText
                                             size={24}
                                             className="fill-primary"
                                          />
                                       )}
                                    </div>
                                 </div>
                                 <div className="flex-1 flex flex-col gap-3 pb-5">
                                    <div className="flex flex-col gap-1">
                                       <h3 className="text-base font-medium text-text-strong leading-6">
                                          {activity.action}
                                       </h3>
                                       <p className="text-sm text-text-sub leading-5">
                                          {activity.description}
                                       </p>
                                    </div>
                                    {(showDate || showTime) && (
                                       <div className="flex items-center gap-2 text-xs text-text-sub leading-4">
                                          {showDate && <span>{showDate}</span>}
                                          {showDate && showTime && (
                                             <span>•</span>
                                          )}
                                          {showTime && <span>{showTime}</span>}
                                       </div>
                                    )}
                                 </div>
                              </div>
                           );
                        })}
                     </div>
                  </div>

                  {/* People Involved */}
                  <div className="bg-background border border-border rounded-2xl p-4 shadow-sm flex flex-col gap-5">
                     <div className="flex items-center justify-between gap-2">
                        <h2 className="text-lg font-medium text-text-strong">
                           {t("legalCases.details.peopleInvolved")}
                        </h2>
                        {canUpdateCase && (
                           <button
                              onClick={() => setIsAddPeopleModalOpen(true)}
                              className="flex items-center gap-1 text-primary text-sm font-medium cursor-pointer">
                              <AddLine size={20} className="fill-primary" />
                              <span>{t("legalCases.details.addPeople")}</span>
                           </button>
                        )}
                     </div>
                     <div className="flex flex-col gap-6">
                        {employees.length === 0 && (
                           <p className="text-sm text-text-soft py-4 text-center">
                              {t("legalCases.details.noPeopleAssigned")}
                           </p>
                        )}
                        {employees.map((employee, index) => {
                           const fullName = employee.Employee
                              ? `${employee.Employee.first_name} ${employee.Employee.last_name}`
                              : employee.name ||
                                t("legalCases.details.unknown");
                           const employeeId = employee.employee_id;
                           const avatarUrl =
                              employee.Employee?.avatar ||
                              employee.avatar ||
                              "/icons/defAvatar.png";

                           const jobTitle =
                              employee.Employee?.job_title || employee.role;

                           return (
                              <div
                                 key={employee.id || index}
                                 className="flex items-center justify-between gap-2">
                                 <MemberTag1
                                    name={fullName}
                                    jobTitle={jobTitle}
                                    avatar={avatarUrl}
                                    className="flex-1"
                                    onClick={() => {
                                       window.location.href = `/dashboard/members/profile/${employeeId}`;
                                    }}
                                 />
                                 {canUpdateCase && (
                                    <button
                                       type="button"
                                       onClick={() =>
                                          handleRemovePerson(employeeId)
                                       }
                                       className="shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-lg border border-border text-text-sub hover:text-danger hover:border-danger transition-colors">
                                       <CloseLine
                                          size={16}
                                          className="fill-current"
                                       />
                                    </button>
                                 )}
                              </div>
                           );
                        })}
                     </div>
                  </div>
               </div>
            )}
         </div>

         {/* Add People Modal */}
         {canUpdateCase && (
            <AddPeopleModal
               isOpen={isAddPeopleModalOpen}
               onClose={() => setIsAddPeopleModalOpen(false)}
               onAdd={handleAddPeople}
               existingPeople={employees.map((e) => ({
                  id: String(e.employee_id),
                  name: e.name,
                  role: e.role,
               }))}
            />
         )}

         {/* Add Update Modal */}
         {canUpdateCase && (
            <AddUpdateModal
               isOpen={isAddUpdateModalOpen}
               onClose={() => setIsAddUpdateModalOpen(false)}
               onAdd={handleAddEvent}
            />
         )}

         {/* Edit Case Details Modal */}
         {canUpdateCase && (
            <EditCaseDetailsModal
               isOpen={isEditCaseModalOpen}
               onClose={() => setIsEditCaseModalOpen(false)}
               legalCase={legalCase}
               onUpdate={handleEditCaseDetails}
            />
         )}

         {/* Edit Event Modal */}
         {canUpdateCase && editingEvent && (
            <EditEventModal
               isOpen={!!editingEvent}
               onClose={() => setEditingEvent(null)}
               event={editingEvent}
               onUpdate={handleEditEvent}
            />
         )}

         {/* Close Case Modal */}
         {canUpdateCase && (
            <CloseCaseModal
               isOpen={isCloseCaseModalOpen}
               onClose={() => setIsCloseCaseModalOpen(false)}
               onConfirm={handleCloseCase}
               caseTitle={legalCase.title}
            />
         )}

         {/* Add Document Modal */}
         {canUpdateCase && (
            <AddDocumentModal
               isOpen={isAddDocumentModalOpen}
               onClose={() => setIsAddDocumentModalOpen(false)}
               onAdd={handleAddDocument}
               events={events}
            />
         )}
      </div>
   );
}
