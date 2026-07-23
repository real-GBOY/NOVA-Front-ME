/** @format */

import { useRef, useState, useMemo } from "react";
import * as yup from "yup";
import Modal from "@/designSystem/Modal";
import Button from "@/designSystem/Button";
import GenericForm from "@/designSystem/GenericForm";
import ConfirmModal from "@/designSystem/ConfirmModal";
import LoadingState from "@/designSystem/LoadingState";
import SearchableMultiSelect from "@/designSystem/SearchableMultiSelect";
import { useTranslation } from "@/hooks/useTranslation";
import { useTickets } from "@/hooks/support/useTickets";
import { useEmployeeDictionary } from "@/hooks/employees/useEmployee";
import { getCurrentUserId } from "@/utils/auth";
import { UseFormReturn } from "react-hook-form";
import type { FieldConfig } from "@/designSystem/GenericForm";
import type {
   CreateTicketRequest,
   TicketCategory,
   TicketType,
   TicketPriority,
   TicketAttachment,
} from "@/types/tickets";
import { filterReadyUploads } from "@/utils/uploadValidation";

export type AddTicketFormData = {
   subject: string;
   category: string;
   priority: string;
   description: string;
   type: string;
   attachments: UploadedFileMetadata[];
   cc_employee_ids?: string[];
};

// Type for uploaded file metadata from GenericFormField
type UploadedFileMetadata = {
   fileName: string;
   fileSize: number;
   fileType: string;
   fileUrl?: string;
   fileId?: number;
   token?: string;
   key?: string;
   purpose?: string;
   progress: number;
   isUploading: boolean;
   error?: string;
};

type AddTicketModalProps = {
   isOpen: boolean;
   onClose: () => void;
   onSuccess?: () => void;
};

// 1️⃣ Category Options
const getTicketCategories = (t: (key: string) => string) => [
   { id: "technical", label: t("category.technical") },
   { id: "hr", label: t("category.hr") },
   { id: "legal", label: t("category.legal") },
   { id: "financial", label: t("category.financial") },
   { id: "other", label: t("category.other") },
];

// 2️⃣ Priority Options
const getTicketPriorities = (t: (key: string) => string) => [
   { id: "low", label: t("priority.low") },
   { id: "medium", label: t("priority.medium") },
   { id: "high", label: t("priority.high") },
   { id: "urgent_critical", label: t("priority.urgent_critical") },
];

// 3️⃣ Type Options (Mapped by Category)
const getTicketTypesByCategory = (t: (key: string) => string): Record<
   string,
   { id: string; label: string }[]
> => ({
   technical_support: [
      { id: "bug_error", label: t("type.bug_error") },
      { id: "system_not_working", label: t("type.system_not_working") },
      { id: "installation_issue", label: t("type.installation_issue") },
      { id: "performance_issue", label: t("type.performance_issue") },
      { id: "other", label: t("type.other") },
   ],
   account_login: [
      { id: "request", label: t("type.request") },
      { id: "question", label: t("type.question") },
      { id: "other", label: t("type.other") },
   ],
   suggestions_feedback: [
      { id: "feature_request", label: t("type.feature_request") },
      { id: "request", label: t("type.request") },
      { id: "other", label: t("type.other") },
   ],
   complaints: [
      { id: "complaint", label: t("type.complaint") },
      { id: "other", label: t("type.other") },
   ],
   general_inquiry: [
      { id: "question", label: t("type.question") },
      { id: "request", label: t("type.request") },
      { id: "other", label: t("type.other") },
   ],
});

const getDefaultTicketTypes = (t: (key: string) => string) => [
   { id: "support", label: t("type.support") },
   { id: "complaint", label: t("type.complaint") },
   { id: "suggestion", label: t("type.suggestion") },
];

const normalizeCategoryValue = (value: string) =>
   value.trim().toLowerCase().replace(/\s+/g, "_");

function AddTicketModal({ isOpen, onClose, onSuccess }: AddTicketModalProps) {
   const { t } = useTranslation("helpSupport");
   const { t: tCommon } = useTranslation("common");
   const formContainerRef = useRef<HTMLDivElement>(null);
   const methodsRef = useRef<UseFormReturn<AddTicketFormData> | null>(null);
   const [isDirty, setIsDirty] = useState(false);
   const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
   const currentUserId = getCurrentUserId();
   
   // Set default priority to "medium"
   const [formValues, setFormValues] = useState<Partial<AddTicketFormData>>({
      subject: "",
      category: "",
      priority: "medium", 
      type: "",
      description: "",
      attachments: [],
      cc_employee_ids: [],
   });

   // Get ticket create mutation
   const { useCreateTicket, useGetTicketMeta } = useTickets();
   const createTicketMutation = useCreateTicket();
   const { data: ticketMeta } = useGetTicketMeta({ enabled: isOpen });

   const schema = yup.object().shape({
      subject: yup
         .string()
         .required(t("modal.validation.subjectRequired"))
         .min(3, t("modal.validation.subjectMin")),
      category: yup.string().required(t("modal.validation.categoryRequired")),
      priority: yup.string().required(t("modal.validation.priorityRequired")),
      type: yup.string().required(t("modal.validation.typeRequired")),
      description: yup
         .string()
         .required(t("modal.validation.descriptionRequired"))
         .min(5, t("modal.validation.descriptionMin")),
      attachments: yup.array().default([]),
      cc_employee_ids: yup.array().of(yup.string()).default([]),
   });

   const ticketCategories = useMemo(() => getTicketCategories(t), [t]);
   const ticketPriorities = useMemo(() => getTicketPriorities(t), [t]);
   const ticketTypesByCategory = useMemo(() => getTicketTypesByCategory(t), [t]);
   const defaultTicketTypes = useMemo(() => getDefaultTicketTypes(t), [t]);

   const metaCategoryOptions = useMemo(
      () =>
         ticketMeta?.categories.map((category) => {
            if (typeof category === "string") {
               const normalized = normalizeCategoryValue(category);
               return {
                  id: normalized,
                  label: t(`category.${normalized}`, {
                     defaultValue: category,
                  }),
               };
            }

            const normalized = normalizeCategoryValue(category.key);
            return {
               id: normalized,
               label:
                  category.label ||
                  t(`category.${normalized}`, {
                     defaultValue: category.key,
                  }),
            };
         }) || [],
      [ticketMeta?.categories, t]
   );

   const metaPriorityOptions = useMemo(
      () =>
         ticketMeta?.priorities.map((priority) => ({
            id: priority,
            label: t(`priority.${priority}`, { defaultValue: priority }),
         })) || [],
      [ticketMeta?.priorities, t]
   );

   const metaTypeOptions = useMemo(
      () =>
         ticketMeta?.types.map((type) => ({
            id: type,
            label: t(`type.${type}`, { defaultValue: type }),
         })) || [],
      [ticketMeta?.types, t]
   );
   const { data: employeesData = [], isLoading: isLoadingEmployees } =
      useEmployeeDictionary();

   const employeeOptions = useMemo(
      () =>
         employeesData
            .filter((employee) => Number(employee.id) !== currentUserId)
            .map((employee) => ({
               id: employee.id,
               label: employee.label,
               subLabel: employee.subLabel,
               avatar: employee.avatar,
            })),
      [employeesData, currentUserId]
   );

   const selectedCcEmployees = useMemo(() => {
      const selectedIds = formValues.cc_employee_ids || [];
      return employeeOptions.filter((employee) =>
         selectedIds.includes(employee.id)
      );
   }, [employeeOptions, formValues.cc_employee_ids]);

   // Dynamic types based on selected category
   const fallbackTypeOptions = useMemo(() => {
      const selectedCategory = formValues.category;
      if (selectedCategory && ticketTypesByCategory[selectedCategory]) {
         return ticketTypesByCategory[selectedCategory];
      }
      return defaultTicketTypes;
   }, [formValues.category, ticketTypesByCategory, defaultTicketTypes]);

   const categoryOptions =
      metaCategoryOptions.length > 0 ? metaCategoryOptions : ticketCategories;
   const priorityOptions =
      metaPriorityOptions.length > 0 ? metaPriorityOptions : ticketPriorities;
   const typeOptions =
      metaTypeOptions.length > 0 ? metaTypeOptions : fallbackTypeOptions;
   const isTypeDisabled = metaTypeOptions.length === 0 && !formValues.category;

   const fields: FieldConfig[] = [
      {
         name: "subject",
         type: "text",
         label: t("modal.subject"),
         placeholder: t("modal.subjectPlaceholder"),
         required: true,
      },
      {
         name: "category",
         type: "select",
         label: t("modal.category"),
         placeholder: t("modal.categoryPlaceholder"),
         required: true,
         options: categoryOptions,
      },
      {
         name: "type",
         type: "select",
         label: t("modal.type"),
         placeholder: t("modal.typePlaceholder"),
         required: true,
         options: typeOptions,
         disabled: isTypeDisabled,
      },
      {
         name: "priority",
         type: "select",
         label: t("modal.priority"),
         placeholder: t("modal.priorityPlaceholder"),
         required: true,
         options: priorityOptions,
      },
      {
         name: "description",
         type: "textarea",
         label: t("modal.description"),
         placeholder: t("modal.descriptionPlaceholder"),
         required: true,
         maxLength: 200,
         rows: 4,
      },
      {
         name: "cc_employee_ids",
         type: "custom",
         render: (form) => (
            <div className="space-y-2">
               <label className="block text-xs sm:text-sm font-medium text-text-sub">
                  {t("modal.cc")}
               </label>
               {isLoadingEmployees ? (
                  <LoadingState size="small" label={t("modal.loadingPeople")} />
               ) : (
                  <SearchableMultiSelect
                     placeholder={t("modal.ccPlaceholder")}
                     selectedItems={selectedCcEmployees}
                     availableItems={employeeOptions}
                     onChange={(items) => {
                        const ids = items.map((item) => String(item.id));
                        form.setValue("cc_employee_ids", ids, {
                           shouldValidate: true,
                           shouldDirty: true,
                        });
                        setFormValues((prev) => ({
                           ...prev,
                           cc_employee_ids: ids,
                        }));
                     }}
                     optional={true}
                  />
               )}
               {form.formState.errors.cc_employee_ids && (
                  <p className="text-xs text-danger">
                     {form.formState.errors.cc_employee_ids.message as string}
                  </p>
               )}
            </div>
         ),
      },
      {
         name: "attachments",
         type: "uploadField",
         label: t("modal.attachDocuments"),
         accept: "image/jpeg,image/png,application/pdf,video/mp4",
         multiple: true,
         uploadPurpose: "support_ticket",
      },
   ];

   const handleFormSubmit = async (data: AddTicketFormData) => {
      try {
         // Map uploaded files to TicketAttachment format
         const attachments: TicketAttachment[] = filterReadyUploads(
            data.attachments || [],
         )
            .filter((file) => file.purpose !== undefined)
            .map((file) => ({
               fileId: Number(file.fileId),
               token: file.token,
               purpose: file.purpose!,
            }));

         const ticketData: CreateTicketRequest = {
            subject: data.subject,
            description: data.description || "",
            category: data.category as TicketCategory,
            type: data.type as TicketType,
            priority: data.priority as TicketPriority,
            ...(attachments.length > 0 && { attachments }),
         };
         const ccEmployeeIds = (data.cc_employee_ids || [])
            .map((id) => Number(id))
            .filter((id) => Number.isFinite(id));
         if (ccEmployeeIds.length > 0) {
            ticketData.cc_employee_ids = ccEmployeeIds;
         }

         await createTicketMutation.mutateAsync(ticketData);
         onSuccess?.();
         onClose();
      } catch (error) {
         console.error("Failed to create ticket:", error);
         // Error handling is done in the mutation
      }
   };

   const handleClose = () => {
      if (isDirty) {
         setShowDiscardConfirm(true);
         return;
      }
      onClose();
   };

   const handleSubmitClick = () => {
      // Trigger form submission by finding and submitting the form element
      const formElement = formContainerRef.current?.querySelector("form");
      if (formElement) {
         formElement.dispatchEvent(
            new Event("submit", { cancelable: true, bubbles: true })
         );
      }
   };

   const handleFieldChange = (
      field: keyof AddTicketFormData,
      value: unknown,
      allData: AddTicketFormData
   ) => {
      // Update local state for UI dependency logic
      setFormValues(allData);

      // UX Improvement: Reset type if category changes
      if (field === "category") {
         methodsRef.current?.setValue("type", "", { shouldValidate: true, shouldDirty: true });
         setFormValues(prev => ({ ...prev, type: "" }));
      }
   };

   // Check if all required fields are filled
   const isFormValid =
      !!formValues.subject &&
      !!formValues.category &&
      !!formValues.priority &&
      !!formValues.type &&
      !!formValues.description &&
      formValues.subject.trim().length >= 3 &&
      formValues.category.trim() !== "" &&
      formValues.priority.trim() !== "" &&
      formValues.type.trim() !== "" &&
      formValues.description.trim().length >= 5;

   return (
      <Modal
         isOpen={isOpen}
         onClose={handleClose}
         title={t("modal.title")}
         size="medium"
         showHeaderDivider={false}
         contentClassName="overflow-y-auto"
         footer={
            <div className="flex items-center justify-end gap-3 w-full">
               <Button
                  variant="secondary"
                  onClick={handleClose}
                  className="px-3 py-2 text-sm">
                  {t("modal.cancel")}
               </Button>
               <Button
                  onClick={handleSubmitClick}
                  disabled={!isFormValid || createTicketMutation.isPending}
                  className="px-3 py-2 text-sm">
                  {createTicketMutation.isPending
                     ? t("modal.submitting")
                     : t("modal.submit")}
               </Button>
            </div>
         }>
         <div ref={formContainerRef}>
            <GenericForm
               formRef={methodsRef}
               schema={schema}
               onSubmit={handleFormSubmit}
               onFieldChange={handleFieldChange}
               fields={fields}
               showSubmitButton={false}
               mode="onChange"
               className="space-y-3"
               onDirtyChange={setIsDirty}
               defaultValues={{
                  subject: "",
                  category: "",
                  priority: "medium", // Default priority
                  type: "",
                  description: "",
                  attachments: [],
                  cc_employee_ids: [],
               }}
            />
         </div>
         <ConfirmModal
            isOpen={showDiscardConfirm}
            onClose={() => setShowDiscardConfirm(false)}
            onConfirm={onClose}
            title={tCommon("unsavedChanges.title")}
            description={tCommon("unsavedChanges.description")}
            confirmText={tCommon("unsavedChanges.confirm")}
            cancelText={tCommon("unsavedChanges.cancel")}
            variant="primary"
            icon="exclamation"
         />
      </Modal>
   );
}

export default AddTicketModal;
