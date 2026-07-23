/** @format */

import { useEffect, useMemo, useState, type FC } from "react";
import * as yup from "yup";
import Modal from "@/designSystem/Modal";
import GenericForm, { FieldConfig } from "@/designSystem/GenericForm";
import Button from "@/designSystem/Button";
import ConfirmModal from "@/designSystem/ConfirmModal";
import { useTranslation } from "@/hooks/useTranslation";
import {
   useCreateService,
   useUpdateService,
} from "@/hooks/services/useService";
import { useListDepartments } from "@/hooks/departments/useDepartment";
import { useListCategories } from "@/hooks/categories/useCategory";
import toast from "@/utilities/toast";
import type { Service } from "@/services/serviceService";

export type AddServiceModalProps = {
   isOpen: boolean;
   onClose: () => void;
   onSuccess?: () => void;
   service?: Service | null;
};

type ServiceFormValues = {
   nameEn: string;
   nameAr: string;
   departmentId: string | number;
   categoryId: string | number;
   serviceCharge: number;
   govFees: number;
   vatPercentage: number;
   status: "active" | "inactive";
};

const AddServiceModal: FC<AddServiceModalProps> = ({
   isOpen,
   onClose,
   onSuccess,
   service,
}) => {
   const [buttonState, setButtonState] = useState<
      "idle" | "loading" | "success"
   >("idle");
   const [isDirty, setIsDirty] = useState(false);
   const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
   const [selectedDepartmentId, setSelectedDepartmentId] = useState<
      string | number | undefined
   >(service?.departmentId);
   const { t } = useTranslation("settings");
   const { t: tCommon } = useTranslation("common");
   const createMutation = useCreateService();
   const updateMutation = useUpdateService();
   const { data: departmentsData } = useListDepartments();
   const { data: categoriesData } = useListCategories();
   const isEditMode = Boolean(service);

   const filteredCategoryOptions = useMemo(() => {
      if (!selectedDepartmentId) return [];
      return (categoriesData?.data || [])
         .filter(
            (cat) =>
               cat.status === "active" &&
               String(cat.departmentId) === String(selectedDepartmentId)
         )
         .map((cat) => ({
            id: String(cat.id),
            label: cat.nameEn || "",
         }));
   }, [categoriesData, selectedDepartmentId]);

   const handleFormFieldChange = (
      field: keyof ServiceFormValues,
      value: unknown
   ) => {
      if (field === "departmentId") {
         setSelectedDepartmentId(value as string | number);
      }
   };

   useEffect(() => {
      if (service && isOpen) {
         setSelectedDepartmentId(service.departmentId);
      } else if (!isOpen) {
         setSelectedDepartmentId(undefined);
      }
   }, [isOpen, service]);

   const numberField = yup
      .number()
      .typeError(t("validation.required"))
      .min(0, t("validation.minValue", { min: 0 }))
      .required(t("validation.required"));

   const schema = yup.object().shape({
      nameEn: yup.string().required(t("validation.required")),
      nameAr: yup.string().required(t("validation.required")),
      departmentId: yup
         .mixed<string | number>()
         .required(t("validation.required")),
      categoryId: yup
         .mixed<string | number>()
         .required(t("validation.required")),
      serviceCharge: numberField,
      govFees: numberField,
      vatPercentage: numberField,
      status: yup
         .mixed<"active" | "inactive">()
         .required(t("validation.required"))
         .oneOf(["active", "inactive"]),
   });

   const fields: FieldConfig[] = [
      {
         name: "nameEn",
         label: t("serviceCatalog.modal.serviceNameEn"),
         placeholder: t("serviceCatalog.modal.serviceNameEnPlaceholder"),
         type: "text",
         required: true,
      },
      {
         name: "nameAr",
         label: t("serviceCatalog.modal.serviceNameAr"),
         placeholder: t("serviceCatalog.modal.serviceNameArPlaceholder"),
         type: "text",
         required: true,
      },
      {
         name: "departmentId",
         label: t("serviceCatalog.modal.department"),
         placeholder: t("serviceCatalog.modal.departmentPlaceholder"),
         type: "searchableSelect",
         required: true,
         options: (departmentsData?.data || [])
            .filter((dept) => dept.status === "active")
            .map((dept) => ({
               id: String(dept.id),
               label: dept.nameEn || "",
            })),
      },
      {
         name: "categoryId",
         label: t("serviceCatalog.modal.category"),
         placeholder: selectedDepartmentId
            ? t("serviceCatalog.modal.categoryPlaceholder")
            : t("serviceCatalog.modal.departmentPlaceholder"),
         type: "searchableSelect",
         required: true,
         options: filteredCategoryOptions,
         disabled: !selectedDepartmentId,
      },
      {
         name: "serviceCharge",
         label: t("serviceCatalog.modal.serviceCharge"),
         placeholder: t("serviceCatalog.modal.serviceChargePlaceholder"),
         type: "currency",
         required: true,
      },
      {
         name: "govFees",
         label: t("serviceCatalog.modal.govFees"),
         placeholder: t("serviceCatalog.modal.govFeesPlaceholder"),
         type: "currency",
         required: true,
      },
      {
         name: "vatPercentage",
         label: t("serviceCatalog.modal.vatPercentage"),
         placeholder: t("serviceCatalog.modal.vatPercentagePlaceholder"),
         type: "currency",
         required: true,
      },
      {
         name: "status",
         label: t("serviceCatalog.modal.status"),
         placeholder: t("serviceCatalog.modal.statusPlaceholder"),
         type: "select",
         required: true,
         options: [
            { id: "active", label: t("serviceCatalog.status.active") },
            { id: "inactive", label: t("serviceCatalog.status.inactive") },
         ],
      },
   ];

   const initialValues = useMemo(
      () =>
         service
            ? {
                 nameEn: service.nameEn,
                 nameAr: service.nameAr,
                 departmentId: String(service.departmentId),
                 categoryId: String(service.categoryId),
                 serviceCharge: service.serviceCharge,
                 govFees: service.govFees,
                 vatPercentage: service.vatPercentage ?? service.vat,
                 status: service.status,
              }
            : undefined,
      [service]
   );

   const handleSubmit = async (values: ServiceFormValues) => {
      setButtonState("loading");
      const payload = {
         ...values,
         departmentId:
            typeof values.departmentId === "string"
               ? Number(values.departmentId)
               : values.departmentId,
         categoryId:
            typeof values.categoryId === "string"
               ? Number(values.categoryId)
               : values.categoryId,
         serviceCharge: Number(values.serviceCharge),
         govFees: Number(values.govFees),
         vatPercentage: Number(values.vatPercentage),
      };

      const onCompleted = () => {
         setButtonState("success");
         toast.success(
            isEditMode
               ? t("serviceCatalog.modal.updateServiceSuccess")
               : t("serviceCatalog.modal.addServiceSuccess")
         );
         setButtonState("idle");
         if (onSuccess) onSuccess();
         onClose();
      };

      const onFailure = (error: unknown) => {
         setButtonState("idle");
         const errorMessage =
            error instanceof Error
               ? error.message
               : t("serviceCatalog.modal.addServiceError");
         toast.error(errorMessage);
      };

      if (isEditMode && service) {
         updateMutation.mutate(
            { id: service.id, payload },
            { onSuccess: onCompleted, onError: onFailure }
         );
      } else {
         createMutation.mutate(payload, {
            onSuccess: onCompleted,
            onError: onFailure,
         });
      }
   };

   const footer = (
      <div className="flex justify-end gap-3 w-full">
         <Button
            variant="secondary"
            onClick={() => {
               if (isDirty) {
                  setShowDiscardConfirm(true);
                  return;
               }
               onClose();
            }}
            disabled={buttonState === "loading"}>
            {t("serviceCatalog.modal.cancel")}
         </Button>
         <Button
            type="submit"
            form="add-service-form"
            disabled={buttonState === "loading" || buttonState === "success"}
            className={
               buttonState === "success" ? "bg-success text-white" : ""
            }>
            {buttonState === "loading" && (
               <span className="animate-spin mr-2 w-4 h-4 border-2 border-white border-t-transparent rounded-full inline-block align-middle" />
            )}
            {buttonState === "success" ? (
               <span className="inline-flex items-center">
                  <svg
                     className="w-5 h-5 mr-1 text-background"
                     fill="none"
                     stroke="currentColor"
                     strokeWidth="2"
                     viewBox="0 0 24 24">
                     <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                     />
                  </svg>
                  {t("serviceCatalog.modal.addServiceSuccessShort")}
               </span>
            ) : isEditMode ? (
               t("serviceCatalog.floatingBar.editService")
            ) : (
               t("serviceCatalog.modal.addServiceButton")
            )}
         </Button>
      </div>
   );

   return (
      <Modal
         isOpen={isOpen}
         onClose={() => {
            if (isDirty) {
               setShowDiscardConfirm(true);
               return;
            }
            onClose();
         }}
         title={
            isEditMode
               ? t("serviceCatalog.floatingBar.editService")
               : t("serviceCatalog.modal.addServiceTitle")
         }
         size="medium"
         footer={footer}>
         <GenericForm<ServiceFormValues>
            key={service ? `edit-service-${service.id}` : "create-service"}
            id="add-service-form"
            schema={schema}
            onSubmit={handleSubmit}
            onFieldChange={handleFormFieldChange}
            formData={initialValues}
            fields={fields}
            validationBehavior="touched"
            validationSummaryTitle={t("serviceCatalog.validationSummary.title")}
            validationSummaryDescription={t(
               "serviceCatalog.validationSummary.description"
            )}
            showSubmitButton={false}
            onDirtyChange={setIsDirty}
         />
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
};

export default AddServiceModal;
