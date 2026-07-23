/** @format */

import { useState, useRef, useEffect, useMemo } from "react";
import Modal from "@/designSystem/Modal";
import Button from "@/designSystem/Button";
import LoadingOverlay from "@/designSystem/LoadingOverlay";
import FormValidationSummary from "@/designSystem/FormValidationSummary";
import { buildValidationSummaryItems } from "@/designSystem/GenericForm";
import { applyPrintWindowMeta } from "@/utils/printWindow";
import ConfirmModal from "@/designSystem/ConfirmModal";
import { Xmark, Print, Plus } from "@/Icons";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import {
   invoiceSchema,
   type InvoiceFormData,
   type InvoiceService,
} from "@/utilities/schemas/invoiceSchema";
import { GenericFormField } from "@/designSystem/GenericFormField";
import ServiceSelector from "./ServiceSelector";
import ServiceCardEditable from "./ServiceCardEditable";
import ServiceCardConfirmed from "./ServiceCardConfirmed";
import type { Invoice } from "./data";
import { useListAgents } from "@/hooks/agents/useAgents";
import { agentService } from "@/services/agentService";
import {
   useListCustomers,
   useGetCustomerById,
   useCreateCustomer,
   useUpdateCustomer,
} from "@/hooks/customers/useCustomers";
import { customerService } from "@/services/customerService";
import { useTranslation } from "@/hooks/useTranslation";
import InvoicePaper from "@/components/common/paper/InvoicePaper";
import { usePermissions } from "@/contexts/PermissionContext";
import { useGetEmployeeDetails } from "@/hooks/employees/employee.queries";
import type { InvoiceStatus } from "@/services/invoiceService";
import PhoneInput from "@/designSystem/ui/PhoneInput";
import * as yup from "yup";
import toast from "@/utilities/toast";
import type { CreateCustomerRequest } from "@/services/customerService";
import { useListServices } from "@/hooks/services/useService";
import { calculateInvoiceTotals } from "@/utilities/invoiceCalculations";
import type { InvoiceItem } from "@/services/invoiceService";
import SearchableSelect from "./SearchableSelect";

type CreateInvoiceModalProps = {
   isOpen: boolean;
   onClose: () => void;
   invoice?: Invoice | null; // For editing
   onSaveDraft?: (
      data: InvoiceFormData,
      services: InvoiceService[]
   ) => Promise<Invoice | void>;
   onSendInvoice?: (
      data: InvoiceFormData,
      services: InvoiceService[]
   ) => Promise<Invoice | void>;
   onEditInvoice?: (invoice: Invoice) => void; // Opens edit modal after creation
   onCancelInvoice?: (invoiceId: number | string) => Promise<void>; // Cancels invoice after creation
   isLoading?: boolean;
   loadingMessage?: string;
};

function CreateInvoiceModal({
   isOpen,
   onClose,
   invoice,
   onSaveDraft,
   onSendInvoice,
   onEditInvoice,
   onCancelInvoice,
   isLoading = false,
   loadingMessage = "Saving invoice...",
}: CreateInvoiceModalProps) {
   const [services, setServices] = useState<InvoiceService[]>([]);
   const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
   const [showPrintConfirmation, setShowPrintConfirmation] = useState(false);
   const [initialServices, setInitialServices] = useState<InvoiceService[]>([]);
   const [showNotesField, setShowNotesField] = useState(
      !!invoice?.notes || !!invoice?.internal_notes
   );
   const invoicePreviewRef = useRef<HTMLDivElement>(null);
   const isEditMode = !!invoice;

   // Save-then-print workflow state
   const [invoiceSaved, setInvoiceSaved] = useState(false);
   const [fetchedInvoiceNumber, setFetchedInvoiceNumber] = useState<
      string | null
   >(null);
   const [fetchedInvoiceStatus, setFetchedInvoiceStatus] =
      useState<InvoiceStatus | null>(null);

   // Post-creation state
   const [isCreated, setIsCreated] = useState(false);
   const [createdInvoice, setCreatedInvoice] = useState<Invoice | null>(null);
   const [showCancelConfirm, setShowCancelConfirm] = useState(false);
   const [isCancelling, setIsCancelling] = useState(false);

   const { t } = useTranslation("common");
   const currentStatus = fetchedInvoiceStatus || invoice?.status || null;
   const normalizedStatus = String(currentStatus || "")
      .trim()
      .toLowerCase();
   const isEditableStatus = isEditMode
      ? true
      : !isCreated &&
        (!normalizedStatus ||
           normalizedStatus === "draft" ||
           normalizedStatus === "pending");
   const isPendingEdit = isEditMode && normalizedStatus === "pending";

   // Inline customer creation state
   const [isCreatingCustomer, setIsCreatingCustomer] = useState(false);
   const [newCustomerData, setNewCustomerData] = useState({
      name: "",
      type: "Individual" as "Individual" | "Company",
      trnId: "",
      contactNumber: "",
      email: "",
      status: "active" as "active" | "inactive",
   });
   const [customerFormErrors, setCustomerFormErrors] = useState<
      Record<string, string>
   >({});

   // Customer creation mutation
   const createCustomer = useCreateCustomer();

   // Customer form validation schema
   const customerSchema = yup.object().shape({
      name: yup.string().required("Customer name is required"),
      type: yup
         .string()
         .oneOf(["Individual", "Company"])
         .required("Type is required"),
      trnId: yup.string().optional(),
      contactNumber: yup.string().required("Contact number is required"),
      email: yup
         .string()
         .email("Invalid email address")
         .required("Email is required"),
      status: yup
         .string()
         .oneOf(["active", "inactive"])
         .required("Status is required"),
   });

   const form = useForm<InvoiceFormData>({
      resolver: yupResolver(invoiceSchema) as never,
      defaultValues: {
         token: isEditMode ? invoice?.token || "" : "",
         invoiceNumber: isEditMode ? invoice?.invoice_number || "" : "",
         agent: "",
         customerName: "",
         customerContact: "",
         customerEmail: "",
         customerTrn: "",
         notes: "",
      },
      mode: "onChange",
   });

   // Get current user info for "Prepared by"
   const { userId, can } = usePermissions();
   const { data: currentUserData } = useGetEmployeeDetails(userId || 0, {
      enabled: !!userId && isOpen,
   });

   const canUpdateCustomer = can("update_customer");
   const updateCustomer = useUpdateCustomer();
   const [isEditingCustomer, setIsEditingCustomer] = useState(false);
   const currentUserName = useMemo(() => {
      if (!currentUserData?.personal) return "";
      const { first_name, last_name } = currentUserData.personal;
      return [first_name, last_name].filter(Boolean).join(" ");
   }, [currentUserData]);
   const { formState, setFocus } = form;
   const { errors, submitCount } = formState;
   const servicesDirty = useMemo(
      () => JSON.stringify(services) !== JSON.stringify(initialServices),
      [services, initialServices]
   );
   const hasUnsavedChanges = formState.isDirty || servicesDirty;
   const { items: validationItems, globalMessage } = useMemo(
      () => buildValidationSummaryItems(errors, {}, {}),
      [errors]
   );
   const summaryDescription = [
      t("validationSummary.description"),
      globalMessage,
   ]
      .filter(Boolean)
      .join(" ");
   const shouldShowSummary = submitCount > 0 && validationItems.length > 0;

   const handleFocusField = (fieldName: string) => {
      if (!fieldName) return;
      setFocus(fieldName as never);

      if (typeof document === "undefined") return;
      const safeFieldName =
         typeof CSS !== "undefined" && "escape" in CSS
            ? CSS.escape(fieldName)
            : fieldName;
      const target =
         document.getElementById(fieldName) ||
         document.querySelector(`[data-field="${safeFieldName}"]`) ||
         document.querySelector(`[name="${safeFieldName}"]`);
      if (target && "scrollIntoView" in target) {
         target.scrollIntoView({ behavior: "smooth", block: "center" });
      }
   };

   const getFieldFeedback = (field: keyof InvoiceFormData) => {
      const fieldState = form.getFieldState(field, formState);
      const message = fieldState.error?.message;
      const shouldShow =
         fieldState.isTouched || fieldState.isDirty || submitCount > 0;
      return {
         shouldShow: Boolean(message) && shouldShow,
         message: message ? String(message) : "",
      };
   };
   const customerNameFeedback = getFieldFeedback("customerName");

   // Refs for customer hydration tracking
   const prevCustomerNameRef = useRef<string | null>(null);
   const lastHydratedCustomerIdRef = useRef<string | null>(null);
   const hasInitializedRef = useRef(false);

   // Load invoice data when editing
   useEffect(() => {
      console.log("[InitialLoad] Effect running", {
         hasInitialized: hasInitializedRef.current,
         invoice: invoice ? "exists" : "null",
         isOpen,
      });

      // Skip if already initialized - only run once per modal open
      if (hasInitializedRef.current) {
         console.log("[InitialLoad] Skipping - already initialized");
         return;
      }

      // Reset initialized flag when modal closes
      if (!isOpen) {
         hasInitializedRef.current = false;
         return;
      }

      // In edit flow, wait for detailed invoice payload before hydrating form/services.
      if (invoice && isEditMode && isLoading) {
         console.log("[InitialLoad] Waiting for full edit invoice details...");
         return;
      }

      if (invoice && isOpen) {
         console.log(
            "[InitialLoad] Edit mode - resetting form with invoice data"
         );
         // If we previously created an invoice in this modal instance,
         // clear post-creation state so edit mode isn't incorrectly locked.
         setIsCreated(false);
         setCreatedInvoice(null);

         // Reset form and services
         const invoiceNumber =
            invoice.invoice_code?.replace("INV-", "") ||
            invoice.invoice_number ||
            "";
         const agentId =
            invoice.agent?.agent_id?.toString() ||
            invoice.agent_id?.toString() ||
            "";
         const customerId =
            invoice.customer?.customer_id?.toString() ||
            invoice.customer_id?.toString() ||
            "";
         const token = invoice.token || "";
         const notes = invoice.notes || invoice.internal_notes || "";
         const customerContact =
            invoice.customer?.customer_contact ||
            invoice.customer?.contact_number ||
            (invoice as any)?.customer_contact ||
            (invoice as any)?.contact_number ||
            "";
         const customerEmail =
            invoice.customer?.customer_email ||
            invoice.customer?.email ||
            (invoice as any)?.customer_email ||
            (invoice as any)?.email ||
            "";
         const customerTrn =
            invoice.customer?.customer_trn ||
            invoice.customer?.trn ||
            (invoice as any)?.customer_trn ||
            (invoice as any)?.trn ||
            "";
         const status = invoice.status;

         // Ensure we're not in customer creation mode when editing
         setIsCreatingCustomer(false);
         setIsEditingCustomer(false);
         // Reset customer hydration refs so new customer data will be loaded
         prevCustomerNameRef.current = null;
         lastHydratedCustomerIdRef.current = null;

         form.reset({
            token: token,
            invoiceNumber: invoiceNumber,
            agent: agentId,
            customerName: customerId,
            customerContact: customerContact,
            customerEmail: customerEmail,
            customerTrn: customerTrn,
            notes: notes,
         });

         // Show notes field if there are notes
         if (notes && notes.trim()) {
            setShowNotesField(true);
         }

         // Existing invoices can be printed immediately
         setInvoiceSaved(true);
         setFetchedInvoiceNumber(invoiceNumber);
         setFetchedInvoiceStatus(status);

         // Load services from invoice items
         if (invoice.items && invoice.items.length > 0) {
            const loadedServices: InvoiceService[] = invoice.items.map(
               (item, index) => {
                  const normalizedServiceCharge = Number(item.service_charge);
                  const normalizedUnitPrice = Number(item.unit_price);
                  const resolvedUnitPrice =
                     Number.isFinite(normalizedServiceCharge) &&
                     normalizedServiceCharge !== 0
                        ? normalizedServiceCharge
                        : Number.isFinite(normalizedUnitPrice)
                        ? normalizedUnitPrice
                        : 0;

                  return {
                     id: item.id?.toString() || `item-${index}`,
                     service: item.service_name || "",
                     serviceId: item.service_id,
                     serviceCode: (item as any).service_code,
                     serviceNameEn: (item as any).service_name_en,
                     serviceNameAr: (item as any).service_name_ar,
                     descriptionEn: (item as any).description_en,
                     descriptionAr: (item as any).description_ar,
                     unitPrice: resolvedUnitPrice.toString(),
                     serviceCharge: resolvedUnitPrice,
                     govFees: item.government_fee || 0,
                     fine: item.fine_amount?.toString() || "0",
                     discount:
                        item.discount_value?.toString() ||
                        item.discount?.toString() ||
                        "0",
                     discountType: item.discount_type,
                     tax: item.tax_rate?.toString() || "0",
                     confirmed: true, // Existing items are confirmed
                  };
               }
            );
            setServices(loadedServices);
            setInitialServices(loadedServices);
            setIsAddingNewService(false);
         } else {
            setServices([]);
            setInitialServices([]);
            setIsAddingNewService(true);
         }
         hasInitializedRef.current = true;
      } else if (!invoice && isOpen) {
         // In edit flow, wait for invoice details to load before initializing to empty state.
         if (isLoading) {
            console.log("[InitialLoad] Waiting for invoice details...");
            return;
         }

         console.log("[InitialLoad] Create mode - resetting form to empty");
         // Reset form for new invoice
         form.reset({
            token: "",
            invoiceNumber: "",
            agent: "",
            customerName: "",
            customerContact: "",
            customerEmail: "",
            customerTrn: "",
            notes: "",
         });
         setServices([]);
         setInitialServices([]);
         setIsAddingNewService(true);
         setInvoiceSaved(false);
         setFetchedInvoiceNumber(null);
         setFetchedInvoiceStatus(null);
         // Reset post-creation state
         setIsCreated(false);
         setCreatedInvoice(null);
         setShowCancelConfirm(false);
         setIsCancelling(false);
         setIsCreatingCustomer(false);
         setNewCustomerData({
            name: "",
            type: "Individual",
            trnId: "",
            contactNumber: "",
            email: "",
            status: "active",
         });
         setCustomerFormErrors({});
         // Reset customer hydration refs
         prevCustomerNameRef.current = null;
         lastHydratedCustomerIdRef.current = null;
         hasInitializedRef.current = true;
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [invoice, isOpen, isLoading]);

   const { watch, handleSubmit } = form;
   const formValues = watch();

   // Handle customer selection - show form when "Add Individual Customer" is selected
   const customerNameValue = form.watch("customerName");

   useEffect(() => {
      setIsEditingCustomer(false);

      // Reset hydration ref when customer changes so new data will be loaded
      if (
         customerNameValue &&
         customerNameValue !== "ADD_INDIVIDUAL_CUSTOMER" &&
         prevCustomerNameRef.current !== customerNameValue
      ) {
         lastHydratedCustomerIdRef.current = null;
         prevCustomerNameRef.current = customerNameValue;
      }

      if (customerNameValue === "ADD_INDIVIDUAL_CUSTOMER") {
         setIsCreatingCustomer(true);
         form.setValue("customerName", "");
         setNewCustomerData({
            name: "",
            type: "Individual",
            trnId: "",
            contactNumber: "",
            email: "",
            status: "active",
         });
         setCustomerFormErrors({});
         prevCustomerNameRef.current = null;
      } else if (
         customerNameValue &&
         customerNameValue !== "ADD_INDIVIDUAL_CUSTOMER" &&
         !isCreatingCustomer
      ) {
         setIsCreatingCustomer(false);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [customerNameValue, isCreatingCustomer]);

   const isExistingCustomerSelected =
      !!customerNameValue && customerNameValue !== "ADD_INDIVIDUAL_CUSTOMER";

   // Get customer ID directly from invoice for immediate fetch in edit mode
   const invoiceCustomerId =
      invoice?.customer?.customer_id || invoice?.customer_id;

   // Fetch customer data - use invoice's customer ID directly in edit mode for immediate fetch
   const customerIdToFetch =
      isEditMode && invoiceCustomerId
         ? invoiceCustomerId
         : customerNameValue || 0;

   const { data: selectedCustomer } = useGetCustomerById(customerIdToFetch, {
      enabled:
         isOpen &&
         (isExistingCustomerSelected || (isEditMode && !!invoiceCustomerId)) &&
         !isCreatingCustomer,
   });

   // Populate customer fields when selectedCustomer data arrives
   useEffect(() => {
      console.log("[CustomerHydration] Effect running", {
         isOpen,
         selectedCustomer: selectedCustomer ? "exists" : "null",
         isCreatingCustomer,
         lastHydratedId: lastHydratedCustomerIdRef.current,
      });

      if (!isOpen) {
         console.log("[CustomerHydration] Skipping - modal not open");
         return;
      }
      if (!selectedCustomer) {
         console.log("[CustomerHydration] Skipping - no selectedCustomer");
         return;
      }
      if (isCreatingCustomer) {
         console.log("[CustomerHydration] Skipping - creating customer");
         return;
      }

      const selectedId = String(
         selectedCustomer.customer_id || selectedCustomer.id || ""
      );

      console.log("[CustomerHydration] Customer data:", {
         selectedId,
         contact_number: selectedCustomer.contact_number,
         contactNumber: selectedCustomer.contactNumber,
         email: selectedCustomer.email,
         trn: selectedCustomer.trn,
         fullData: selectedCustomer,
      });

      // Skip if we already hydrated this exact customer
      if (lastHydratedCustomerIdRef.current === selectedId) {
         console.log(
            "[CustomerHydration] Skipping - already hydrated this customer"
         );
         return;
      }

      const contactFromCustomer =
         selectedCustomer.contact_number ||
         selectedCustomer.contactNumber ||
         "";
      const emailFromCustomer = selectedCustomer.email || "";
      const trnFromCustomer =
         selectedCustomer.trn || selectedCustomer.trnId || "";
      const notesFromCustomer = selectedCustomer.notes || "";

      console.log("[CustomerHydration] Setting values:", {
         contact: contactFromCustomer,
         email: emailFromCustomer,
         trn: trnFromCustomer,
      });

      // Always populate the fields when customer data arrives
      form.setValue("customerContact", contactFromCustomer, {
         shouldDirty: false,
         shouldTouch: false,
         shouldValidate: false,
      });
      form.setValue("customerEmail", emailFromCustomer, {
         shouldDirty: false,
         shouldTouch: false,
         shouldValidate: false,
      });
      form.setValue("customerTrn", trnFromCustomer, {
         shouldDirty: false,
         shouldTouch: false,
         shouldValidate: false,
      });

      // Only set notes if there are notes and field is empty
      const currentNotes = form.getValues("notes") || "";
      if (notesFromCustomer && !currentNotes.trim()) {
         form.setValue("notes", notesFromCustomer, {
            shouldDirty: false,
            shouldTouch: false,
            shouldValidate: false,
         });
         setShowNotesField(true);
      }

      lastHydratedCustomerIdRef.current = selectedId;
      console.log(
         "[CustomerHydration] Hydration complete, ref set to:",
         selectedId
      );
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [selectedCustomer, isOpen, isCreatingCustomer]);

   // Handle creating new customer
   const handleCreateCustomer = async () => {
      // Validate form
      try {
         await customerSchema.validate(newCustomerData, { abortEarly: false });
         setCustomerFormErrors({});
      } catch (error) {
         const errors: Record<string, string> = {};
         if (error && typeof error === "object" && "inner" in error) {
            const yupError = error as {
               inner?: Array<{ path?: string; message?: string }>;
            };
            yupError.inner?.forEach((err) => {
               if (err.path && err.message) {
                  errors[err.path] = err.message;
               }
            });
         }
         setCustomerFormErrors(errors);
         return;
      }

      // Create customer
      try {
         const payload: CreateCustomerRequest = {
            customer_name: newCustomerData.name,
            customer_type: newCustomerData.type,
            contact_number: newCustomerData.contactNumber,
            email: newCustomerData.email,
            trn: newCustomerData.trnId || undefined,
            status: newCustomerData.status === "active" ? "Active" : "Inactive",
         };

         const createdCustomer = await createCustomer.mutateAsync(payload);

         // Select the newly created customer
         form.setValue(
            "customerName",
            String(createdCustomer.customer_id || createdCustomer.id)
         );
         setIsCreatingCustomer(false);
         setNewCustomerData({
            name: "",
            type: "Individual",
            trnId: "",
            contactNumber: "",
            email: "",
            status: "active",
         });
         setCustomerFormErrors({});

         toast.success("Customer created successfully");
      } catch (error) {
         console.error("Error creating customer:", error);
         toast.error("Failed to create customer");
      }
   };

   const handleToggleOrSaveCustomer = async () => {
      if (!isExistingCustomerSelected) return;
      if (!canUpdateCustomer) return;
      if (!isEditableStatus) return;
      if (updateCustomer.isPending) return;

      if (!isEditingCustomer) {
         // When entering edit mode, populate fields from selectedCustomer if available
         if (selectedCustomer) {
            const contactFromCustomer =
               selectedCustomer.contact_number ||
               selectedCustomer.contactNumber ||
               "";
            const emailFromCustomer = selectedCustomer.email || "";
            const trnFromCustomer =
               selectedCustomer.trn || selectedCustomer.trnId || "";

            form.setValue("customerContact", contactFromCustomer, {
               shouldDirty: false,
               shouldTouch: false,
               shouldValidate: false,
            });
            form.setValue("customerEmail", emailFromCustomer, {
               shouldDirty: false,
               shouldTouch: false,
               shouldValidate: false,
            });
            form.setValue("customerTrn", trnFromCustomer, {
               shouldDirty: false,
               shouldTouch: false,
               shouldValidate: false,
            });
         }
         setIsEditingCustomer(true);
         return;
      }

      const customerId = String(customerNameValue);
      const payload = {
         contact_number: form.getValues("customerContact")?.trim() || undefined,
         email: form.getValues("customerEmail")?.trim() || undefined,
         trn: form.getValues("customerTrn")?.trim() || undefined,
      };

      try {
         await updateCustomer.mutateAsync({
            id: customerId,
            payload,
         });
         toast.success(t("invoices.customerEdit.success"));
         setIsEditingCustomer(false);
      } catch (error) {
         console.error("Error updating customer:", error);
         toast.error(t("invoices.customerEdit.error"));
      }
   };

   // Handle canceling customer creation
   const handleCancelCustomerCreation = () => {
      setIsCreatingCustomer(false);
      setNewCustomerData({
         name: "",
         type: "Individual",
         trnId: "",
         contactNumber: "",
         email: "",
         status: "active",
      });
      setCustomerFormErrors({});
      form.setValue("customerName", "");
   };

   // Fetch agents from backend
   const { data: agentsData } = useListAgents(
      {
         page: 1,
         limit: 100, // Get a reasonable number of agents
      },
      { enabled: isOpen }
   );

   // Fetch customers from backend
   const { data: customersData } = useListCustomers(
      {
         page: 1,
         limit: 100, // Get a reasonable number of customers
      },
      { enabled: isOpen }
   );

   // Transform agents to options format (only active agents)
   const agentOptions = useMemo(() => {
      return (agentsData?.data || [])
         .filter((agent) => agent.status === "Active")
         .map((agent) => ({
            id: String(agent.agent_id || agent.id),
            label: agent.name || "",
         }));
   }, [agentsData]);

   // Transform customers to options format (only active customers)
   const customerOptions = useMemo(() => {
      const customers = (customersData?.data || [])
         .filter((customer) => customer.status === "Active")
         .map((customer) => ({
            id: String(customer.customer_id || customer.id),
            label: customer.customer_name || customer.name || "",
         }));

      // If editing an invoice, ensure the invoice's customer is in the options
      // even if they're not active
      if (invoice && invoice.customer) {
         const invoiceCustomerId = String(
            invoice.customer.customer_id || invoice.customer_id || ""
         );
         const invoiceCustomerName =
            invoice.customer.customer_name ||
            invoice.customer.name ||
            "Unknown Customer";

         // Check if the invoice's customer is already in the list
         const customerExists = customers.some(
            (c) => c.id === invoiceCustomerId
         );

         // If not, add them to the list
         if (!customerExists && invoiceCustomerId) {
            customers.unshift({
               id: invoiceCustomerId,
               label: invoiceCustomerName,
            });
         }
      }

      // Always show the "Add Individual Customer" option at the top
      return [
         {
            id: "ADD_INDIVIDUAL_CUSTOMER",
            label: t("actions.addIndividualCustomer"),
         },
         ...customers,
      ];
   }, [customersData, t, invoice]);

   const fetchCustomerOptions = async (
      search: string
   ): Promise<Array<{ id: string; label: string }>> => {
      const query = search.trim();

      const response = await customerService.list({
         page: 1,
         limit: 20,
         search: query || undefined,
      });

      const fetched = (response?.data || [])
         .filter((customer) => customer.status === "Active")
         .map((customer) => ({
            id: String(customer.customer_id || customer.id),
            label: customer.customer_name || customer.name || "",
         }));

      return [
         {
            id: "ADD_INDIVIDUAL_CUSTOMER",
            label: t("actions.addIndividualCustomer"),
         },
         ...fetched,
      ];
   };

   const fetchAgentOptions = async (
      search: string
   ): Promise<Array<{ id: string; label: string }>> => {
      const query = search.trim();
      const response = await agentService.list({
         page: 1,
         limit: 20,
         search: query || undefined,
      });

      return (response?.data || [])
         .filter((agent) => agent.status === "Active")
         .map((agent) => ({
            id: String(agent.agent_id || agent.id),
            label: agent.name || "",
         }));
   };

   // Service selection state (local state for the "Services" form section)
   const [selectedDepartment, setSelectedDepartment] = useState("");
   const [selectedCategory, setSelectedCategory] = useState("");
   const [selectedService, setSelectedService] = useState("");
   const [isAddingNewService, setIsAddingNewService] = useState(true);

   // Fetch services to get service details
   const { data: servicesData } = useListServices(
      {
         page: 1,
         limit: 100, // Maximum allowed by API
      },
      { enabled: isOpen }
   );

   const handleAddService = (svc?: string) => {
      const serviceValue = svc || selectedService;

      if (!serviceValue) return;

      // Parse service_id and service_name from the value (format: "id|name")
      const [serviceId, serviceName] = serviceValue.includes("|")
         ? serviceValue.split("|")
         : [undefined, serviceValue];

      // Find the service details from the services list
      const serviceDetails = servicesData?.data?.find(
         (svc) => String(svc.id) === String(serviceId)
      );

      // Extract service details
      const serviceCharge = serviceDetails?.serviceCharge || 0;
      const govFees = serviceDetails?.govFees || 0;
      const vatPercentage =
         serviceDetails?.vatPercentage || serviceDetails?.vat || 0;

      // unit_price should be service_charge (not total_amount)
      const unitPrice = serviceCharge;

      const newService: InvoiceService = {
         id: Date.now().toString(),
         service: serviceName,
         serviceId: serviceId ? parseInt(serviceId) : undefined,
         serviceCode: serviceDetails?.code,
         serviceNameEn: serviceDetails?.nameEn,
         serviceNameAr: serviceDetails?.nameAr,
         descriptionEn: undefined, // Not available in current service data
         descriptionAr: undefined, // Not available in current service data
         unitPrice: unitPrice.toString(),
         serviceCharge: serviceCharge,
         govFees: govFees,
         fine: "0", // Always set to 0
         discount: "0",
         tax: vatPercentage.toString(),
         confirmed: false,
      };
      setServices([...services, newService]);
      // Reset selections and hide the selector
      setSelectedDepartment("");
      setSelectedCategory("");
      setSelectedService("");
      setIsAddingNewService(false);
   };

   const handleStartAddingService = () => {
      setIsAddingNewService(true);
   };

   const handleUpdateService = (
      id: string,
      field: keyof InvoiceService,
      value: string | boolean
   ) => {
      if (!isEditableStatus) return;
      setServices(
         services.map((service) => {
            if (service.id === id) {
               // Convert string to number for govFees field
               if (field === "govFees" && typeof value === "string") {
                  const numValue = value === "" ? undefined : parseFloat(value);
                  return {
                     ...service,
                     [field]: isNaN(numValue as number) ? undefined : numValue,
                  };
               }
               return { ...service, [field]: value };
            }
            return service;
         })
      );
   };

   const handleDeleteService = (id: string) => {
      if (!isEditableStatus) return;
      setServices((prevServices) => {
         const nextServices = prevServices.filter(
            (service) => service.id !== id
         );
         if (nextServices.length === 0) {
            setIsAddingNewService(true);
         }
         return nextServices;
      });
   };

   const handleConfirmService = (id: string) => {
      if (!isEditableStatus) return;
      setServices(
         services.map((service) =>
            service.id === id ? { ...service, confirmed: true } : service
         )
      );
   };

   const calculateServiceTotal = (service: InvoiceService): number => {
      const unitPrice = parseFloat(service.unitPrice) || 0;
      const govFees = service.govFees ?? 0;
      const fineAmount = parseFloat(service.fine) || 0;
      const discount = parseFloat(service.discount) || 0;
      const taxRate = parseFloat(service.tax) || 0;

      // Calculate subtotal: unit_price + government_fee + fine_amount
      const subtotal = unitPrice + govFees + fineAmount;

      // Calculate discount amount
      const discountAmount =
         discount > 0
            ? service.discountType === "Percentage"
               ? (subtotal * discount) / 100
               : discount
            : 0;

      // Calculate tax amount on unit price only (not on total)
      const taxAmount = (unitPrice * taxRate) / 100;

      // Calculate total: subtotal - discount + tax
      return subtotal - discountAmount + taxAmount;
   };

   // Convert services to invoice items format for calculation
   const servicesAsInvoiceItems = useMemo((): InvoiceItem[] => {
      return services.map((service) => {
         const unitPrice = parseFloat(service.unitPrice) || 0;
         const govFees = service.govFees ?? 0;
         const fineAmount = parseFloat(service.fine) || 0;
         const discount = parseFloat(service.discount) || 0;
         const taxRate = parseFloat(service.tax) || 0;

         // Calculate subtotal: unit_price + government_fee + fine_amount
         const subtotal = unitPrice + govFees + fineAmount;

         // Calculate discount amount
         const discountAmount =
            discount > 0
               ? service.discountType === "Percentage"
                  ? (subtotal * discount) / 100
                  : discount
               : 0;

         // Calculate tax amount on unit price only (not on total)
         const taxAmount = (unitPrice * taxRate) / 100;

         // Calculate total: subtotal - discount + tax
         const total = subtotal - discountAmount + taxAmount;

         return {
            id: service.id,
            service_id: service.serviceId,
            service_name: service.service,
            quantity: 1,
            unit_price: unitPrice,
            government_fee: govFees,
            service_charge: 0,
            discount_type:
               service.discountType ||
               (discount > 0 ? "Percentage" : undefined),
            discount_value: discount > 0 ? discount : undefined,
            tax_rate: taxRate > 0 ? taxRate : undefined,
            fine_amount: fineAmount > 0 ? fineAmount : undefined,
            // Calculated fields for display only (not sent to API)
            discount_amount: discountAmount,
            tax_amount: taxAmount,
            subtotal: subtotal,
            total: total,
         };
      });
   }, [services]);

   // Calculate invoice totals using the utility function
   const invoiceTotals = useMemo(() => {
      return calculateInvoiceTotals(servicesAsInvoiceItems, 0);
   }, [servicesAsInvoiceItems]);

   const handlePrint = () => {
      if (!invoicePreviewRef.current) return;

      const printWindow = window.open("", "_blank");
      if (!printWindow) return;

      const invoiceContent = invoicePreviewRef.current.innerHTML;
      const stylesheets = Array.from(document.styleSheets)
         .map((styleSheet) => {
            try {
               return Array.from(styleSheet.cssRules)
                  .map((rule) => rule.cssText)
                  .join("\n");
            } catch {
               const link = styleSheet.href;
               return link ? `@import url("${link}");` : "";
            }
         })
         .join("\n");

      printWindow.document.write(`
         <!DOCTYPE html>
         <html>
            <head>
               <title>Invoice - ${formValues.invoiceNumber || "Preview"}</title>
               <style>
                  ${stylesheets}
                  @media print {
                     body { margin: 0; padding: 20px; }
                     @page { margin: 0.5in; }
                  }
               </style>
            </head>
            <body>${invoiceContent}</body>
         </html>
      `);

      printWindow.document.close();
      applyPrintWindowMeta(
         printWindow,
         "فاتورة معتمدة",
         "print",
         "فاتورة-معتمدة"
      );
      printWindow.focus();
      setTimeout(() => {
         printWindow.print();
         printWindow.close();
      }, 250);
   };

   const onSubmit = async (data: InvoiceFormData) => {
      // Validate that at least one service is added
      if (services.length === 0) {
         toast.error("Please add at least one service to the invoice.");
         return;
      }

      if (onSendInvoice) {
         const result = await onSendInvoice(data, services);
         if (result && typeof result === "object" && "invoice_code" in result) {
            // Invoice saved successfully, update state
            setInvoiceSaved(true);
            setFetchedInvoiceNumber(
               result.invoice_code || result.invoice_number || ""
            );
            setFetchedInvoiceStatus(result.status);
            // Update form with fetched invoice number
            form.setValue(
               "invoiceNumber",
               result.invoice_code || result.invoice_number || ""
            );
            // For new invoices, set created state and keep modal open
            if (!isEditMode) {
               setIsCreated(true);
               setCreatedInvoice(result as Invoice);
            } else {
               // For edit mode, close the modal
               closeAfterSave();
            }
         }
      }
   };

   const handleFormError = (formErrors: typeof errors) => {
      const { items } = buildValidationSummaryItems(formErrors, {}, {});
      if (items[0]) {
         handleFocusField(items[0].field);
      }
   };
   const handleRequestClose = () => {
      if (invoiceSaved && !isEditMode) {
         // Show print confirmation if invoice was saved
         setShowPrintConfirmation(true);
         return;
      }
      if (hasUnsavedChanges) {
         setShowDiscardConfirm(true);
         return;
      }
      onClose();
   };

   const handleConfirmClose = () => {
      setShowPrintConfirmation(false);
      setInvoiceSaved(false);
      setFetchedInvoiceNumber(null);
      setFetchedInvoiceStatus(null);
      onClose();
   };
   const closeAfterSave = () => {
      setInvoiceSaved(false);
      setFetchedInvoiceNumber(null);
      setFetchedInvoiceStatus(null);
      onClose();
   };

   const handleSaveAsDraft = async () => {
      // Validate that at least one service is added
      if (services.length === 0) {
         toast.error("Please add at least one service to the invoice.");
         return;
      }

      // Validate form before saving draft
      const isValid = await form.trigger();
      if (!isValid) {
         const { items } = buildValidationSummaryItems(
            form.formState.errors,
            {},
            {}
         );
         if (items[0]) {
            handleFocusField(items[0].field);
         }
         return;
      }

      const data = form.getValues();
      if (onSaveDraft) {
         const result = await onSaveDraft(data, services);
         if (result && typeof result === "object" && "invoice_code" in result) {
            // Invoice saved successfully, update state
            setInvoiceSaved(true);
            setFetchedInvoiceNumber(
               result.invoice_code || result.invoice_number || ""
            );
            setFetchedInvoiceStatus(result.status);
            // Update form with fetched invoice number
            form.setValue(
               "invoiceNumber",
               result.invoice_code || result.invoice_number || ""
            );
            // For new invoices, set created state and keep modal open
            if (!isEditMode) {
               setIsCreated(true);
               setCreatedInvoice(result as Invoice);
            } else {
               // For edit mode, close the modal
               closeAfterSave();
            }
         }
      }
   };

   return (
      <>
         <Modal
            isOpen={isOpen}
            onClose={handleRequestClose}
            showCloseButton={false}
            size="large"
            contentClassName="p-0">
            <div className="flex flex-col bg-background rounded-2xl relative">
               {isLoading && (
                  <LoadingOverlay
                     isLoading={isLoading}
                     message={loadingMessage}
                  />
               )}
               {/* Header */}
               <div className="flex items-center justify-between px-6 pb-4 border-b border-border">
                  <div className="flex items-center gap-4">
                     <button
                        onClick={handleRequestClose}
                        className="flex items-center justify-center w-10 h-10 rounded-lg border border-border bg-background shadow-sm hover:bg-bg-weak transition-colors">
                        <Xmark className="w-5 h-5 fill-text-sub" />
                     </button>
                     <div className="w-px h-6 bg-border" />
                     <h1 className="text-xl font-medium text-text-strong">
                        {isEditMode ? "Edit Invoice" : "Create Invoice"}
                     </h1>
                  </div>
                  <div className="flex items-center gap-3">
                     {!invoiceSaved || isEditMode ? (
                        isEditMode ? (
                           <Button
                              onClick={handleSubmit(onSubmit, handleFormError)}
                              disabled={isLoading || !isEditableStatus}>
                              Update
                           </Button>
                        ) : (
                           <>
                              <Button
                                 variant="secondary"
                                 onClick={handleSaveAsDraft}
                                 disabled={isLoading || !isEditableStatus}
                                 className="bg-background border border-border shadow-sm text-text-sub">
                                 Save as Draft
                              </Button>
                              <Button
                                 onClick={handleSubmit(
                                    onSubmit,
                                    handleFormError
                                 )}
                                 disabled={isLoading || !isEditableStatus}>
                                 Save Invoice
                              </Button>
                           </>
                        )
                     ) : (
                        <>
                           {/* Post-creation buttons: Edit, Cancel, Close */}
                           {onEditInvoice && createdInvoice && (
                              <Button
                                 variant="secondary"
                                 onClick={() => {
                                    onClose();
                                    onEditInvoice(createdInvoice);
                                 }}
                                 className="bg-background border border-border shadow-sm text-text-sub">
                                 Edit
                              </Button>
                           )}
                           {onCancelInvoice && createdInvoice && (
                              <Button
                                 variant="secondary"
                                 onClick={() => setShowCancelConfirm(true)}
                                 disabled={isCancelling}
                                 className="bg-background border border-border shadow-sm text-danger">
                                 Cancel Invoice
                              </Button>
                           )}
                           <Button
                              variant="secondary"
                              onClick={handleRequestClose}
                              className="bg-background border border-border shadow-sm text-text-sub">
                              Close
                           </Button>
                        </>
                     )}
                  </div>
               </div>
            </div>

            {/* Content */}
            <div className="flex flex-1">
               {/* Left Panel: Form */}
               <div className="w-2/5 flex flex-col p-6 gap-6">
                  {shouldShowSummary && (
                     <FormValidationSummary
                        items={validationItems}
                        title={t("validationSummary.title")}
                        description={summaryDescription}
                        onSelectField={handleFocusField}
                     />
                  )}
                  {/* Invoice Details Section */}
                  <div className="flex flex-col gap-5">
                     <h2 className="text-2xl font-medium text-text-strong">
                        Invoice Details
                     </h2>
                     <div className="flex flex-col gap-4">
                        <div className="flex gap-4">
                           <div className="flex-1">
                              <GenericFormField
                                 form={form}
                                 fieldConfig={{
                                    name: "token",
                                    label: "Token",
                                    type: "text",
                                    placeholder: "TOK-XXXXX",
                                    disabled: !isEditableStatus,
                                 }}
                              />
                           </div>
                           <div className="flex-1">
                              <div className="flex flex-col gap-2">
                                 <label className="text-sm font-medium text-text-sub">
                                    Invoice Number
                                 </label>
                                 <input
                                    type="text"
                                    value={form.watch("invoiceNumber") || ""}
                                    placeholder="Auto-generated"
                                    disabled={true}
                                    readOnly
                                    className="px-3 py-2 text-sm text-text-strong bg-transparent focus:outline-none"
                                 />
                              </div>
                           </div>
                        </div>

                        <GenericFormField
                           form={form}
                           fieldConfig={{
                              name: "agent",
                              label: "Agent",
                              type: "searchableSelect",
                              placeholder: "Find Agent (Optional)",
                              required: false,
                              options: agentOptions,
                              serverSideSearch: true,
                              fetchOptions: fetchAgentOptions,
                              disabled: !isEditableStatus,
                           }}
                        />

                        <div className="flex flex-col gap-2">
                           <Controller
                              name="customerName"
                              control={form.control}
                              render={({ field }) => (
                                 <SearchableSelect
                                    label="Customer Name"
                                    placeholder="Find Customer"
                                    value={field.value || ""}
                                    onChange={field.onChange}
                                    options={customerOptions}
                                    required
                                    disabled={!isEditableStatus}
                                    serverSideSearch={true}
                                    fetchOptions={fetchCustomerOptions}
                                    debounceMs={0}
                                 />
                              )}
                           />
                           {customerNameFeedback.shouldShow && (
                              <p className="text-xs text-danger">
                                 {customerNameFeedback.message}
                              </p>
                           )}
                        </div>

                        {isExistingCustomerSelected &&
                           !isCreatingCustomer &&
                           canUpdateCustomer && (
                              <div className="flex justify-end">
                                 <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={handleToggleOrSaveCustomer}
                                    title={t("invoices.customerEdit.tooltip")}
                                    disabled={
                                       !isEditableStatus ||
                                       updateCustomer.isPending
                                    }>
                                    {updateCustomer.isPending
                                       ? t("invoices.customerEdit.saving")
                                       : isEditingCustomer
                                       ? t("invoices.customerEdit.save")
                                       : t("invoices.customerEdit.edit")}
                                 </Button>
                              </div>
                           )}

                        {/* Inline Customer Creation Form */}
                        {isCreatingCustomer && (
                           <div className="flex flex-col gap-4 p-4 bg-bg-weak rounded-xl border border-border">
                              <div className="flex items-center justify-between">
                                 <h3 className="text-sm font-medium text-text-strong">
                                    New Individual Customer
                                 </h3>
                                 <button
                                    type="button"
                                    onClick={handleCancelCustomerCreation}
                                    className="text-text-sub hover:text-text-strong text-sm font-medium"
                                    disabled={
                                       createCustomer.isPending ||
                                       !isEditableStatus
                                    }>
                                    Cancel
                                 </button>
                              </div>

                              <div className="flex flex-col gap-4">
                                 {/* Customer Name */}
                                 <div className="flex-1">
                                    <label
                                       className={`block text-sm font-medium mb-2 ${
                                          customerFormErrors.name
                                             ? "text-danger"
                                             : "text-text-sub"
                                       }`}>
                                       Customer Name{" "}
                                       <span className="text-danger">*</span>
                                    </label>
                                    <input
                                       type="text"
                                       value={newCustomerData.name}
                                       onChange={(e) => {
                                          setNewCustomerData((prev) => ({
                                             ...prev,
                                             name: e.target.value,
                                          }));
                                          if (customerFormErrors.name) {
                                             setCustomerFormErrors((prev) => ({
                                                ...prev,
                                                name: "",
                                             }));
                                          }
                                       }}
                                       placeholder="Enter customer name"
                                       className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                                          customerFormErrors.name
                                             ? "border-danger"
                                             : "border-border"
                                       }`}
                                       disabled={
                                          createCustomer.isPending ||
                                          !isEditableStatus
                                       }
                                    />
                                    {customerFormErrors.name && (
                                       <p className="text-xs text-danger mt-1">
                                          {customerFormErrors.name}
                                       </p>
                                    )}
                                 </div>

                                 {/* TRN ID */}
                                 <div className="flex-1">
                                    <label
                                       className={`block text-sm font-medium mb-2 ${
                                          customerFormErrors.trnId
                                             ? "text-danger"
                                             : "text-text-sub"
                                       }`}>
                                       TRN ID
                                    </label>
                                    <input
                                       type="text"
                                       value={newCustomerData.trnId}
                                       onChange={(e) => {
                                          setNewCustomerData((prev) => ({
                                             ...prev,
                                             trnId: e.target.value,
                                          }));
                                          if (customerFormErrors.trnId) {
                                             setCustomerFormErrors((prev) => ({
                                                ...prev,
                                                trnId: "",
                                             }));
                                          }
                                       }}
                                       placeholder="Enter TRN ID"
                                       className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                                          customerFormErrors.trnId
                                             ? "border-danger"
                                             : "border-border"
                                       }`}
                                       disabled={
                                          createCustomer.isPending ||
                                          !isEditableStatus
                                       }
                                    />
                                    {customerFormErrors.trnId && (
                                       <p className="text-xs text-danger mt-1">
                                          {customerFormErrors.trnId}
                                       </p>
                                    )}
                                 </div>

                                 {/* Contact Number */}
                                 <div className="flex-1">
                                    <label
                                       className={`block text-sm font-medium mb-2 ${
                                          customerFormErrors.contactNumber
                                             ? "text-danger"
                                             : "text-text-sub"
                                       }`}>
                                       Contact Number{" "}
                                       <span className="text-danger">*</span>
                                    </label>
                                    <PhoneInput
                                       value={newCustomerData.contactNumber}
                                       onChange={(value) => {
                                          setNewCustomerData((prev) => ({
                                             ...prev,
                                             contactNumber: value || "",
                                          }));
                                          if (
                                             customerFormErrors.contactNumber
                                          ) {
                                             setCustomerFormErrors((prev) => ({
                                                ...prev,
                                                contactNumber: "",
                                             }));
                                          }
                                       }}
                                       placeholder="Enter contact number"
                                       disabled={
                                          createCustomer.isPending ||
                                          !isEditableStatus
                                       }
                                    />
                                    {customerFormErrors.contactNumber && (
                                       <p className="text-xs text-danger mt-1">
                                          {customerFormErrors.contactNumber}
                                       </p>
                                    )}
                                 </div>

                                 {/* Email */}
                                 <div className="flex-1">
                                    <label
                                       className={`block text-sm font-medium mb-2 ${
                                          customerFormErrors.email
                                             ? "text-danger"
                                             : "text-text-sub"
                                       }`}>
                                       Email Address{" "}
                                       <span className="text-danger">*</span>
                                    </label>
                                    <input
                                       type="email"
                                       value={newCustomerData.email}
                                       onChange={(e) => {
                                          setNewCustomerData((prev) => ({
                                             ...prev,
                                             email: e.target.value,
                                          }));
                                          if (customerFormErrors.email) {
                                             setCustomerFormErrors((prev) => ({
                                                ...prev,
                                                email: "",
                                             }));
                                          }
                                       }}
                                       placeholder="Enter email address"
                                       className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                                          customerFormErrors.email
                                             ? "border-danger"
                                             : "border-border"
                                       }`}
                                       disabled={
                                          createCustomer.isPending ||
                                          !isEditableStatus
                                       }
                                    />
                                    {customerFormErrors.email && (
                                       <p className="text-xs text-danger mt-1">
                                          {customerFormErrors.email}
                                       </p>
                                    )}
                                 </div>

                                 {/* Submit Button */}
                                 <div className="flex justify-end gap-2 pt-2">
                                    <Button
                                       type="button"
                                       variant="secondary"
                                       onClick={handleCancelCustomerCreation}
                                       disabled={
                                          createCustomer.isPending ||
                                          !isEditableStatus
                                       }
                                       className="bg-background border border-border shadow-sm text-text-sub">
                                       Cancel
                                    </Button>
                                    <Button
                                       type="button"
                                       onClick={handleCreateCustomer}
                                       disabled={
                                          createCustomer.isPending ||
                                          !isEditableStatus
                                       }>
                                       {createCustomer.isPending ? (
                                          <>
                                             <span className="animate-spin mr-2 w-4 h-4 border-2 border-white border-t-transparent rounded-full inline-block align-middle" />
                                             Creating...
                                          </>
                                       ) : (
                                          "Create Customer"
                                       )}
                                    </Button>
                                 </div>
                              </div>
                           </div>
                        )}

                        {isExistingCustomerSelected && !isCreatingCustomer && (
                           <>
                              <GenericFormField
                                 form={form}
                                 fieldConfig={{
                                    name: "customerContact",
                                    label: "Contact Number",
                                    type: "text",
                                    placeholder: "+971 XX XXX XXXX",
                                    disabled:
                                       !isEditableStatus ||
                                       (canUpdateCustomer &&
                                          !isEditingCustomer),
                                 }}
                              />

                              <GenericFormField
                                 form={form}
                                 fieldConfig={{
                                    name: "customerEmail",
                                    label: t("invoices.fields.customerEmail"),
                                    type: "text",
                                    placeholder: t(
                                       "invoices.fields.customerEmailPlaceholder"
                                    ),
                                    disabled:
                                       !isEditableStatus ||
                                       (canUpdateCustomer &&
                                          !isEditingCustomer),
                                 }}
                              />

                              <GenericFormField
                                 form={form}
                                 fieldConfig={{
                                    name: "customerTrn",
                                    label: t("invoices.fields.customerTrn"),
                                    type: "text",
                                    placeholder: t(
                                       "invoices.fields.customerTrnPlaceholder"
                                    ),
                                    disabled:
                                       !isEditableStatus ||
                                       (canUpdateCustomer &&
                                          !isEditingCustomer),
                                 }}
                              />

                              <button
                                 type="button"
                                 onClick={() =>
                                    setShowNotesField((prev) => !prev)
                                 }
                                 className="flex items-center gap-1 text-primary w-fit"
                                 disabled={!isEditableStatus}>
                                 <div className="flex items-center justify-center w-5 h-5">
                                    <Plus className="w-3 h-3 fill-primary" />
                                 </div>
                                 <span className="text-sm font-medium">
                                    {showNotesField
                                       ? "Remove Notes"
                                       : "Add Notes"}
                                 </span>
                              </button>
                              {showNotesField && (
                                 <GenericFormField
                                    form={form}
                                    fieldConfig={{
                                       name: "notes",
                                       label: "Notes",
                                       type: "textarea",
                                       placeholder:
                                          "Add any internal notes here...",
                                       disabled: !isEditableStatus,
                                    }}
                                 />
                              )}
                           </>
                        )}
                     </div>
                  </div>

                  <div className="h-px bg-border w-full" />

                  {/* Services Section */}
                  <div className="flex flex-col gap-5">
                     <h2 className="text-2xl font-medium text-text-strong">
                        Services
                     </h2>
                     <div className="flex flex-col gap-4">
                        {/* Service Selection - Only show when adding new service and not locked */}
                        {isAddingNewService && isEditableStatus && (
                           <ServiceSelector
                              selectedDepartment={selectedDepartment}
                              selectedCategory={selectedCategory}
                              selectedService={selectedService}
                              onDepartmentChange={setSelectedDepartment}
                              onCategoryChange={setSelectedCategory}
                              onServiceChange={(value) => {
                                 setSelectedService(value);
                                 // Auto-add service when service is selected
                                 if (value) {
                                    // Pass value directly to avoid state timing issues
                                    setTimeout(() => {
                                       handleAddService(value);
                                    }, 0);
                                 }
                              }}
                           />
                        )}

                        {/* Service Cards */}
                        {services.length > 0 && (
                           <div className="flex flex-col gap-4">
                              {services.map((service) =>
                                 service.confirmed ? (
                                    <ServiceCardConfirmed
                                       key={service.id}
                                       service={service}
                                       calculateServiceTotal={
                                          calculateServiceTotal
                                       }
                                       disabled={!isEditableStatus}
                                       onDelete={handleDeleteService}
                                       onEdit={(id) => {
                                          if (!isEditableStatus) return;
                                          // Find the service and set it back to editable
                                          setServices((prev) =>
                                             prev.map((s) =>
                                                s.id === id
                                                   ? { ...s, confirmed: false }
                                                   : s
                                             )
                                          );
                                       }}
                                    />
                                 ) : (
                                    <ServiceCardEditable
                                       key={service.id}
                                       service={service}
                                       onUpdate={handleUpdateService}
                                       onDelete={handleDeleteService}
                                       onConfirm={handleConfirmService}
                                       disabled={!isEditableStatus}
                                    />
                                 )
                              )}

                              {/* Add New Service Button - Show when not currently adding and not locked */}
                              {!isAddingNewService && isEditableStatus && (
                                 <button
                                    onClick={handleStartAddingService}
                                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-dashed border-primary bg-primary/5 text-primary hover:bg-primary/10 transition-colors w-full">
                                    <Plus className="w-4 h-4 fill-current" />
                                    <span className="text-sm font-medium">
                                       Add New Service
                                    </span>
                                 </button>
                              )}
                           </div>
                        )}
                     </div>
                  </div>
               </div>

               {/* Right Panel: Preview */}
               <div className="flex-1 bg-bg-weak flex flex-col p-6 m-4 rounded-2xl">
                  <div className="w-full max-w-[691px] mx-auto flex flex-col gap-5">
                     <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-medium text-text-strong">
                           Preview
                        </h2>
                        <div className="relative group">
                           <button
                              onClick={handlePrint}
                              disabled={!invoiceSaved}
                              className={`flex items-center gap-1.5 px-3 py-1.5 bg-background border border-border rounded-xl shadow-sm transition-colors ${
                                 invoiceSaved
                                    ? "text-text-sub hover:text-text-strong cursor-pointer"
                                    : "text-text-disabled cursor-not-allowed opacity-50"
                              }`}>
                              <Print className="w-4 h-4 fill-current" />
                              <span className="text-sm font-medium">Print</span>
                           </button>
                           {!invoiceSaved && (
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-text-strong text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                 You should save invoice first
                                 <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-text-strong" />
                              </div>
                           )}
                        </div>
                     </div>

                     {/* Invoice Paper */}
                     <div className="flex justify-center pb-4 rounded-2xl">
                        <InvoicePaper
                           ref={invoicePreviewRef}
                           invoiceData={{
                              invoiceNumber:
                                 fetchedInvoiceNumber ||
                                 formValues.invoiceNumber ||
                                 "",
                              token: formValues.token || "",
                              agentName: formValues.agent
                                 ? agentOptions.find(
                                      (opt) => opt.id === formValues.agent
                                   )?.label || "-"
                                 : "-",
                              date: new Date(),
                              preparedBy: currentUserName || "-",
                              trn: formValues.customerTrn || "",
                              customerName: isCreatingCustomer
                                 ? newCustomerData.name || "-"
                                 : formValues.customerName
                                 ? customerOptions.find(
                                      (opt) =>
                                         opt.id === formValues.customerName
                                   )?.label || "-"
                                 : "-",
                              amount: invoiceTotals.total_amount,
                              subtotal: invoiceTotals.subtotal,
                              totalDiscount: invoiceTotals.total_discount,
                              totalTax: invoiceTotals.total_tax,
                              currency: "AED",
                              items: services.map((svc) => {
                                 const unitPrice =
                                    parseFloat(svc.unitPrice) || 0;
                                 const govFees = svc.govFees ?? 0;
                                 const fineAmount = parseFloat(svc.fine) || 0;
                                 const discount = parseFloat(svc.discount) || 0;
                                 const taxRate = parseFloat(svc.tax) || 0;

                                 // Calculate subtotal: unit_price + government_fee + fine_amount
                                 const subtotal =
                                    unitPrice + govFees + fineAmount;

                                 // Calculate discount amount
                                 const discountAmount =
                                    discount > 0
                                       ? svc.discountType === "Percentage"
                                          ? (subtotal * discount) / 100
                                          : discount
                                       : 0;

                                 // Calculate tax amount on unit price only (not on total)
                                 const taxAmount = (unitPrice * taxRate) / 100;

                                 // Calculate total: subtotal - discount + tax
                                 const total =
                                    subtotal - discountAmount + taxAmount;

                                 return {
                                    id: svc.id,
                                    service_name: svc.service,
                                    government_fee: govFees,
                                    discount_value: discount,
                                    discount_type: (svc.discountType ||
                                       "Fixed") as "Percentage" | "Fixed",
                                    service_charge: unitPrice, // Display service charge from service (UI only)
                                    fine_amount: fineAmount,
                                    tax_rate: taxRate,
                                    total: total,
                                 };
                              }),
                              notes: formValues.notes,
                              status: fetchedInvoiceStatus || undefined,
                           }}
                        />
                     </div>
                  </div>
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
            title={t("unsavedChanges.title")}
            description={t("unsavedChanges.description")}
            confirmText={t("unsavedChanges.confirm")}
            cancelText={t("unsavedChanges.cancel")}
         />
         <ConfirmModal
            isOpen={showPrintConfirmation}
            onClose={() => setShowPrintConfirmation(false)}
            onConfirm={handleConfirmClose}
            title={t("printConfirmation.title")}
            description={t("printConfirmation.description")}
            confirmText={t("printConfirmation.confirm")}
            cancelText={t("printConfirmation.cancel")}
            variant="primary"
            icon="info"
         />
         <ConfirmModal
            isOpen={showCancelConfirm}
            onClose={() => {
               if (!isCancelling) {
                  setShowCancelConfirm(false);
               }
            }}
            onConfirm={async () => {
               if (!onCancelInvoice || !createdInvoice) return;
               const invoiceId = createdInvoice.invoice_id || createdInvoice.id;
               if (!invoiceId) return;
               setIsCancelling(true);
               try {
                  await onCancelInvoice(invoiceId);
                  setShowCancelConfirm(false);
                  onClose();
               } catch (error) {
                  console.error("Error cancelling invoice:", error);
               } finally {
                  setIsCancelling(false);
               }
            }}
            title="Cancel Invoice"
            description="Are you sure you want to cancel this invoice? This action cannot be undone."
            confirmText="Cancel Invoice"
            cancelText="Keep Invoice"
            variant="error"
            icon="exclamation"
            isLoading={isCancelling}
         />
      </>
   );
}

export default CreateInvoiceModal;
