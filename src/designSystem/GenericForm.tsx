/** @format */

import { FieldErrors, useForm, UseFormReturn } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import type { ObjectSchema } from "yup";
import { ReactNode, useEffect, useMemo } from "react";
import type { MutableRefObject } from "react";
import { GenericFormField } from "./GenericFormField";
import FormValidationSummary, {
   type ValidationSummaryItem,
} from "./FormValidationSummary";
import { useTranslation } from "@/hooks/useTranslation";

export type ValidationBehavior = "always" | "touched" | "submit";

export type FieldConfig = {
   name: string;
   type?:
      | "text"
      | "date"
      | "number"
      | "textarea"
      | "select"
      | "searchableSelect"
   | "dropdown"
   | "multiselect"
   | "checkbox"
   | "uploadField"
   | "currency"
   | "custom";
   label?: string;
   placeholder?: string;
   helperText?: string;
   required?: boolean;
   maxLength?: number;
   rows?: number;
   options?: { id: string; label: string }[];
   currencySuffix?: string;
   currencyIconSrc?: string;
   disabled?: boolean;
   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   render?: (form: UseFormReturn<any>) => ReactNode;
   // Upload field specific props
   accept?: string;
   multiple?: boolean;
   uploadPurpose?: string; // Purpose for file uploads (e.g., "employee_document", "contract", "employee_profile")
   // Server-side search for searchableSelect
   serverSideSearch?: boolean;
   fetchOptions?: (search: string) => Promise<Array<{ id: string; label: string }>>;
};

export const formatFieldLabel = (fieldName: string) => {
   const withSpaces = fieldName
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/[[\]._-]+/g, " ")
      .trim();
   return withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1);
};

const flattenErrors = (errors: FieldErrors): Record<string, string> => {
   const result: Record<string, string> = {};

   const walk = (value: unknown, path: string) => {
      if (!value || typeof value !== "object") return;

      const valueRecord = value as Record<string, unknown>;
      if (valueRecord.message) {
         result[path] = String(valueRecord.message);
      } else if (valueRecord.types && typeof valueRecord.types === "object") {
         const firstMessage = Object.values(
            valueRecord.types as Record<string, unknown>
         ).find(Boolean);
         if (firstMessage) {
            result[path] = String(firstMessage);
         }
      }

      Object.entries(valueRecord).forEach(([key, child]) => {
         if (["message", "type", "types", "ref"].includes(key)) return;
         if (!child || typeof child !== "object") return;
         walk(child, `${path}.${key}`);
      });
   };

   Object.entries(errors).forEach(([key, value]) => {
      if (!value || typeof value !== "object") return;
      walk(value, key);
   });

   return result;
};

export const buildValidationSummaryItems = (
   errors: FieldErrors,
   externalErrors: Record<string, string>,
   labelLookup: Record<string, string>
) => {
   const flatErrors = flattenErrors(errors);
   const mergedErrors = {
      ...flatErrors,
      ...Object.fromEntries(
         Object.entries(externalErrors).filter(([, value]) => value)
      ),
   };

   const globalMessages = [
      mergedErrors._global,
      mergedErrors.root,
   ].filter(Boolean) as string[];

   const items: ValidationSummaryItem[] = Object.entries(mergedErrors)
      .filter(([field, message]) => {
         if (!message) return false;
         return field !== "_global" && field !== "root";
      })
      .map(([field, message]) => {
         const rootField = field.split(".")[0] || field;
         const label =
            labelLookup[field] ||
            labelLookup[rootField] ||
            formatFieldLabel(field);
         return {
            field,
            label,
            message: String(message),
         };
      });

   return {
      items,
      globalMessage: globalMessages.join(" ").trim() || undefined,
   };
};

type GenericFormProps<T extends Record<string, unknown>> = {
   schema: ObjectSchema<T>;
   defaultValues?: Partial<T>;
   onSubmit: (data: T) => void | Promise<void>;
   onFieldChange?: (field: keyof T, value: unknown, allData: T) => void;
   submitButtonText?: string;
   className?: string;
   renderFields?: (form: UseFormReturn<T>) => ReactNode;
   children?: ReactNode;
   showSubmitButton?: boolean;
   mode?: "onChange" | "onBlur" | "onSubmit";
   validationBehavior?: ValidationBehavior;
   showValidationSummary?: boolean;
   validationSummaryTitle?: string;
   validationSummaryDescription?: string;
   scrollToError?: boolean;
   fields?: FieldConfig[];
   formData?: Partial<T>;
   externalErrors?: Record<string, string>;
   id?: string;
   formRef?: MutableRefObject<UseFormReturn<T> | null>;
   onDirtyChange?: (isDirty: boolean, form: UseFormReturn<T>) => void;
};

function GenericForm<T extends Record<string, unknown>>({
   schema,
   defaultValues = {},
   onSubmit,
   onFieldChange,
   submitButtonText = "Submit",
   className = "",
   renderFields,
   children,
   showSubmitButton = true,
   mode = "onChange",
   validationBehavior = "touched",
   showValidationSummary = true,
   validationSummaryTitle,
   validationSummaryDescription,
   scrollToError = true,
   fields = [],
   formData,
   externalErrors = {},
   id,
   formRef,
   onDirtyChange,
}: GenericFormProps<T>) {
   const { t } = useTranslation("common");
   const form = useForm<T>({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      resolver: yupResolver(schema) as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      defaultValues: defaultValues as any,
      mode,
   });

   const {
      handleSubmit,
      formState,
      reset,
      setFocus,
   } = form;
   const { errors, isSubmitting, submitCount } = formState;

   useEffect(() => {
      if (formRef) {
         formRef.current = form;
      }
   }, [form, formRef]);

   // Sync form values when formData prop changes
   useEffect(() => {
      if (formData) {
         // eslint-disable-next-line @typescript-eslint/no-explicit-any
         reset(formData as any);
      }
   }, [formData, reset]);

   useEffect(() => {
      if (onDirtyChange) {
         onDirtyChange(formState.isDirty, form);
      }
   }, [formState.isDirty, form, onDirtyChange]);

   // Handle field change callback
   const handleFieldChange = (field: keyof T, value: unknown) => {
      if (onFieldChange) {
         const allData = form.getValues();
         onFieldChange(field, value, allData as T);
      }
   };

   // Extract field names from schema
   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   const fieldNames = Object.keys((schema as any).fields || {});

   const labelLookup = useMemo(() => {
      const lookup: Record<string, string> = {};
      fields.forEach((field) => {
         if (field.label) {
            lookup[field.name] = field.label;
         }
      });
      return lookup;
   }, [fields]);

   const { items: validationItems, globalMessage } = useMemo(
      () => buildValidationSummaryItems(errors, externalErrors, labelLookup),
      [errors, externalErrors, labelLookup]
   );

   const orderedValidationItems = useMemo(() => {
      if (!fields.length) return validationItems;
      const fieldOrder = new Map(
         fields.map((field, index) => [field.name, index])
      );
      return [...validationItems].sort((a, b) => {
         const aRoot = a.field.split(".")[0] || a.field;
         const bRoot = b.field.split(".")[0] || b.field;
         const aIndex =
            fieldOrder.get(a.field) ?? fieldOrder.get(aRoot) ?? Number.MAX_SAFE_INTEGER;
         const bIndex =
            fieldOrder.get(b.field) ?? fieldOrder.get(bRoot) ?? Number.MAX_SAFE_INTEGER;
         return aIndex - bIndex;
      });
   }, [fields, validationItems]);

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

   const onSubmitHandler = async (data: T) => {
      try {
         await onSubmit(data as T);
      } catch (error) {
         console.error("Form submission error:", error);
      }
   };

   const onInvalid = (formErrors: FieldErrors<T>) => {
      if (!scrollToError) return;
      const { items } = buildValidationSummaryItems(
         formErrors,
         externalErrors,
         labelLookup
      );
      if (items[0]) {
         handleFocusField(items[0].field);
      }
   };

   const summaryTitle = validationSummaryTitle ?? t("validationSummary.title");
   const summaryDescriptionBase =
      validationSummaryDescription ?? t("validationSummary.description");
   const summaryDescription = useMemo(() => {
      const pieces = [summaryDescriptionBase, globalMessage].filter(Boolean);
      return pieces.length ? pieces.join(" ") : undefined;
   }, [globalMessage, summaryDescriptionBase]);

   const shouldShowSummary =
      showValidationSummary && submitCount > 0 && orderedValidationItems.length > 0;

   return (
      <form
         id={id}
         onSubmit={handleSubmit(onSubmitHandler, onInvalid)}
         className={`space-y-4 ${className}`}>
         {shouldShowSummary && (
            <FormValidationSummary
               items={orderedValidationItems}
               title={summaryTitle}
               description={summaryDescription}
               onSelectField={handleFocusField}
            />
         )}
         {renderFields ? (
            renderFields(form)
         ) : children ? (
            children
         ) : fields.length > 0 ? (
            // Render configured fields
            fields.map((fieldConfig) => (
               <GenericFormField
                  key={fieldConfig.name}
                  fieldConfig={fieldConfig}
                  form={form}
                  onFieldChange={(field, value) =>
                     handleFieldChange(field as keyof T, value)
                  }
                  externalError={externalErrors[fieldConfig.name]}
                  validationBehavior={validationBehavior}
               />
            ))
         ) : (
            // Fallback: auto-render from schema
            <>
               {fieldNames.map((fieldName) => (
                  <GenericFormField
                     key={fieldName}
                     fieldConfig={{
                        name: fieldName,
                        label: formatFieldLabel(fieldName),
                     }}
                     form={form}
                     onFieldChange={(field, value) =>
                        handleFieldChange(field as keyof T, value)
                     }
                     externalError={externalErrors[fieldName]}
                     validationBehavior={validationBehavior}
                  />
               ))}
            </>
         )}

         {showSubmitButton && (
            <button
               type="submit"
               disabled={isSubmitting}
               className="w-full px-6 py-3 bg-primary text-text-main rounded-lg font-medium hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
               {isSubmitting ? t("processing") || "Processing..." : submitButtonText}
            </button>
         )}
      </form>
   );
}

export default GenericForm;
