/** @format */

import { useState, useRef, useEffect, useMemo } from "react";
import { UseFormReturn } from "react-hook-form";
import { useTranslation } from "@/hooks/useTranslation";
import ArrowDownSLine from "@/Icons/arrow-down-s-line";
import { FieldConfig, ValidationBehavior } from "./GenericForm";
import { useFileUpload } from "@/hooks/useFileUpload";
import DatePicker from "./DatePicker";
import { format as formatDate } from "date-fns";
import { useLanguage } from "@/hooks/useLanguage";
import { useDebounce } from "@/hooks/useDebounce";
import Loader from "./Loader";

type ValidationMessageProps = {
   id: string;
   message: string;
};

function ValidationErrorMessage({ id, message }: ValidationMessageProps) {
   return (
      <p id={id} className="text-xs text-danger flex items-start gap-1.5">
         <svg
            aria-hidden="true"
            viewBox="0 0 20 20"
            className="mt-0.5 h-3.5 w-3.5"
            fill="currentColor">
            <path
               fillRule="evenodd"
               d="M10 2.5A7.5 7.5 0 1 0 10 17.5 7.5 7.5 0 0 0 10 2.5Zm0 4a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 6.5Zm0 8a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z"
               clipRule="evenodd"
            />
         </svg>
         <span>{message}</span>
      </p>
   );
}

function ValidationHint({ id, message }: ValidationMessageProps) {
   return (
      <p id={id} className="text-xs text-text-sub">
         {message}
      </p>
   );
}

type GenericFormFieldProps = {
   fieldConfig: FieldConfig;
   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   form: UseFormReturn<any>;

   onFieldChange?: (field: string, value: unknown) => void;
   externalError?: string;
   validationBehavior?: ValidationBehavior;
};

export function GenericFormField({
   fieldConfig,
   form,
   onFieldChange,
   externalError,
   validationBehavior = "touched",
}: GenericFormFieldProps) {
   const { isRTL } = useLanguage();
   const { t } = useTranslation("common");
   const { formState, watch, setValue, register } = form;

   const fieldName = fieldConfig.name;
   const fieldState = form.getFieldState(fieldName, formState);
   const displayError = externalError || fieldState.error?.message;
   const showValidation =
      validationBehavior === "always" ||
      (validationBehavior === "touched" &&
         (fieldState.isTouched ||
            fieldState.isDirty ||
            formState.submitCount > 0)) ||
      (validationBehavior === "submit" && formState.submitCount > 0);
   const shouldShowError = Boolean(displayError) && showValidation;
   const errorMessage = displayError ? String(displayError) : "";
   const helperText = fieldConfig.helperText;
   const errorId = `${fieldName}-error`;
   const hintId = `${fieldName}-hint`;
   const describedBy = shouldShowError
      ? errorId
      : helperText
      ? hintId
      : undefined;
   const labelClassName = `block text-xs sm:text-sm font-medium ${
      shouldShowError ? "text-danger" : "text-text-sub"
   }`;
   const inputStatusClassName = shouldShowError
      ? "border-danger/60 bg-danger/5 focus:ring-danger/30 focus:border-danger/60"
      : "border-border focus:ring-primary focus:border-transparent";
   const selectStatusClassName = shouldShowError
      ? "border-danger/60 bg-danger/5 focus-within:ring-danger/30 focus-within:border-danger/60"
      : "border-border focus-within:ring-primary focus-within:border-transparent";
   const renderFeedback = () => {
      if (shouldShowError && errorMessage) {
         return <ValidationErrorMessage id={errorId} message={errorMessage} />;
      }
      if (helperText) {
         return <ValidationHint id={hintId} message={helperText} />;
      }
      return null;
   };

   // Custom render function
   if (fieldConfig.type === "custom" && fieldConfig.render) {
      return fieldConfig.render(form);
   }

   // Searchable Select logic
   if (fieldConfig.type === "searchableSelect") {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const [isOpen, setIsOpen] = useState(false);
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const [searchQuery, setSearchQuery] = useState("");
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const [serverOptions, setServerOptions] = useState<
         Array<{ id: string; label: string }>
      >([]);
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const [isLoadingOptions, setIsLoadingOptions] = useState(false);
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const containerRef = useRef<HTMLDivElement>(null);
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const dropdownRef = useRef<HTMLDivElement>(null);

      // Debounce search query for server-side
      const debouncedSearch = useDebounce(searchQuery, 300);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const currentValue = (watch as any)(fieldName);
      const normalizedCurrentValue = Array.isArray(currentValue)
         ? currentValue[0]
         : currentValue;
      const mergedOptions = useMemo(() => {
         if (!fieldConfig.serverSideSearch) {
            return fieldConfig.options || [];
         }
         const baseOptions = fieldConfig.options || [];
         const serverOnly = serverOptions.filter(
            (opt) => !baseOptions.some((baseOpt) => baseOpt.id === opt.id)
         );
         return [...baseOptions, ...serverOnly];
      }, [fieldConfig.serverSideSearch, fieldConfig.options, serverOptions]);

      const selectedOption = useMemo(() => {
         return mergedOptions.find((opt) => opt.id === normalizedCurrentValue);
      }, [normalizedCurrentValue, mergedOptions]);

      // Fetch server-side options when search changes
      // eslint-disable-next-line react-hooks/rules-of-hooks
      useEffect(() => {
         if (
            fieldConfig.serverSideSearch &&
            fieldConfig.fetchOptions &&
            isOpen
         ) {
            setIsLoadingOptions(true);
            fieldConfig
               .fetchOptions(debouncedSearch)
               .then((options) => {
                  setServerOptions(options);
                  setIsLoadingOptions(false);
               })
               .catch(() => {
                  setServerOptions([]);
                  setIsLoadingOptions(false);
               });
         } else if (fieldConfig.serverSideSearch && isOpen && !debouncedSearch) {
            // Load initial options when dropdown opens
            if (fieldConfig.fetchOptions) {
               setIsLoadingOptions(true);
               fieldConfig
                  .fetchOptions("")
                  .then((options) => {
                     setServerOptions(options);
                     setIsLoadingOptions(false);
                  })
                  .catch(() => {
                     setServerOptions([]);
                     setIsLoadingOptions(false);
                  });
            }
         }
      }, [debouncedSearch, isOpen, fieldConfig.serverSideSearch, fieldConfig.fetchOptions]);

      // Sync search query with selected value on mount/change
      // eslint-disable-next-line react-hooks/rules-of-hooks
      useEffect(() => {
         if (selectedOption && !isOpen) {
            setSearchQuery(selectedOption.label);
         }
      }, [selectedOption, isOpen]);

      // eslint-disable-next-line react-hooks/rules-of-hooks
      useEffect(() => {
         const handleClickOutside = (event: MouseEvent) => {
            if (
               containerRef.current &&
               !containerRef.current.contains(event.target as Node) &&
               dropdownRef.current &&
               !dropdownRef.current.contains(event.target as Node)
            ) {
               setIsOpen(false);
               // Reset search query to selected label if closed without selection
               if (selectedOption) {
                  setSearchQuery(selectedOption.label);
               } else {
                  setSearchQuery("");
               }
            }
         };

         if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
         }

         return () => {
            document.removeEventListener("mousedown", handleClickOutside);
         };
      }, [isOpen, selectedOption]);

      const filteredOptions = fieldConfig.serverSideSearch
         ? serverOptions
         : fieldConfig.options?.filter((opt) =>
              opt.label &&
              typeof opt.label === "string" &&
              opt.label.toLowerCase().includes(searchQuery.toLowerCase())
           ) || [];

      const isDisabled = fieldConfig.disabled;

      return (
         <div className="space-y-2" data-field={fieldName}>
            {fieldConfig.label && (
               <label htmlFor={fieldConfig.name} className={labelClassName}>
                  {fieldConfig.label}
                  {fieldConfig.required && (
                     <span className="text-danger ms-0.5">*</span>
                  )}
               </label>
            )}
            <input type="hidden" {...register(fieldName)} />
            <div
               className={`relative ${
                  isDisabled ? "opacity-60 pointer-events-none" : ""
               }`}
               ref={containerRef}>
               <div
                  className={`flex items-center w-full px-3 py-2.25 text-sm rounded-xl border bg-background text-text-sub focus-within:ring-2 ${selectStatusClassName}`}
                  dir={isRTL ? "rtl" : "ltr"}>
                  <input
                     type="text"
                     id={fieldName}
                     aria-invalid={shouldShowError}
                     aria-describedby={describedBy}
                     value={searchQuery}
                     onChange={(e) => {
                        setSearchQuery(e.target.value);
                        if (fieldConfig.serverSideSearch) {
                           // Clear stale results while waiting for the debounced server response.
                           setServerOptions([]);
                        }
                        setIsOpen(true);
                     }}
                     onFocus={() => !isDisabled && setIsOpen(true)}
                     placeholder={fieldConfig.placeholder || "Select..."}
                     className="w-full bg-transparent outline-none text-text-strong placeholder:text-text-soft"
                     disabled={isDisabled}
                     dir={isRTL ? "rtl" : "ltr"}
                  />
                  <ArrowDownSLine
                     size={20}
                     className="shrink-0"
                     isRTL={isRTL}
                  />
               </div>
               {isOpen && !isDisabled && (
                  <div
                     ref={dropdownRef}
                     className={`absolute top-full mt-1 w-full bg-background border border-border rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto ${
                        isRTL ? "end-0" : "start-0"
                     }`}
                     dir={isRTL ? "rtl" : "ltr"}>
                     <div className="flex flex-col">
                        {isLoadingOptions ? (
                           <div className="flex items-center justify-center py-4">
                              <Loader size="sm" />
                           </div>
                        ) : filteredOptions && filteredOptions.length > 0 ? (
                           filteredOptions.map((option) => (
                              <button
                                 key={option.id}
                                 type="button"
                                 onClick={() => {
                                    setValue(fieldName, option.id, {
                                       shouldValidate: true,
                                       shouldDirty: true,
                                       shouldTouch: true,
                                    });
                                    if (onFieldChange) {
                                       onFieldChange(fieldName, option.id);
                                    }
                                    setSearchQuery(option.label);
                                    setIsOpen(false);
                                 }}
                                 className={`px-3 py-2 text-sm transition-colors ${
                                    isRTL ? "text-right" : "text-left"
                                 } ${
                                    normalizedCurrentValue === option.id
                                       ? "bg-primary/10 text-primary"
                                       : "text-text-strong hover:bg-bg-weak"
                                 }`}>
                                 {option.label}
                              </button>
                           ))
                        ) : (
                           <div
                              className={`px-3 py-2 text-sm text-text-sub ${
                                 isRTL ? "text-right" : "text-left"
                              }`}>
                              {t("common.noData")}
                           </div>
                        )}
                     </div>
                  </div>
               )}
            </div>
            {renderFeedback()}
         </div>
      );
   }

   // Upload Field logic
   if (fieldConfig.type === "uploadField") {
      // Define uploaded file metadata type
      type UploadedFile = {
         // File metadata for display
         fileName: string;
         fileSize: number;
         fileType: string;
         // Upload result from API
         fileUrl?: string;
         fileId?: number;
         token?: string;
         key?: string;
         purpose?: string;
         // Upload state
         progress: number;
         isUploading: boolean;
         error?: string;
      };

      // eslint-disable-next-line react-hooks/rules-of-hooks
      const [documents, setDocuments] = useState<UploadedFile[]>([]);
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const { uploadFile } = useFileUpload();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rawValue = (watch as any)(fieldName);
      const currentValue = (
         Array.isArray(rawValue) ? rawValue : rawValue ? [rawValue] : []
      ) as UploadedFile[];

      // Initialize documents from form value on mount
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const [isInitialized, setIsInitialized] = useState(false);

      // eslint-disable-next-line react-hooks/rules-of-hooks
      useEffect(() => {
         if (currentValue.length > 0 && !isInitialized) {
            setDocuments(currentValue);
            setIsInitialized(true);
         } else if (currentValue.length === 0 && !isInitialized) {
            setIsInitialized(true);
         }
      }, [currentValue, isInitialized]);

      const syncDocumentsToForm = (nextDocuments: UploadedFile[]) => {
         const serializableDocuments = nextDocuments.map((doc) => ({
            fileName: doc.fileName,
            fileSize: doc.fileSize,
            fileType: doc.fileType,
            fileUrl: doc.fileUrl,
            fileId: doc.fileId,
            token: doc.token,
            key: doc.key,
            purpose: doc.purpose,
            progress: doc.progress,
            isUploading: doc.isUploading,
            error: doc.error,
         }));

         const valueToSet =
            fieldConfig.multiple === false
               ? serializableDocuments.length > 0
                  ? serializableDocuments[0]
                  : null
               : serializableDocuments;

         setValue(fieldName, valueToSet, {
            shouldValidate: true,
            shouldDirty: true,
         });
         if (onFieldChange) {
            onFieldChange(fieldName, valueToSet);
         }
      };

      const setDocumentsAndSync = (
         updater: UploadedFile[] | ((prev: UploadedFile[]) => UploadedFile[])
      ) => {
         setDocuments((prev) => {
            const nextDocuments =
               typeof updater === "function" ? updater(prev) : updater;
            syncDocumentsToForm(nextDocuments);
            return nextDocuments;
         });
      };

      const handleDocumentUpload = async (
         event: React.ChangeEvent<HTMLInputElement>
      ) => {
         const files = event.target.files;
         if (!files) return;

         const fileArray = Array.from(files);

         // Initialize files with uploading state (no File object stored)
         const initialDocs: UploadedFile[] = fileArray.map((file) => ({
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
            progress: 0,
            isUploading: true,
         }));

         // If multiple is false, replace existing docs. Otherwise append.
         const updatedDocs =
            fieldConfig.multiple === false
               ? [...initialDocs]
               : [...documents, ...initialDocs];

         setDocumentsAndSync(updatedDocs);

         // Upload each file
         for (let i = 0; i < fileArray.length; i++) {
            const file = fileArray[i];
            // Calculate index: if replacing (multiple=false), index is i. If appending, it's length + i.
            const docIndex =
               fieldConfig.multiple === false ? i : documents.length + i;

            try {
               const result = await uploadFile(file, {
                  purpose: fieldConfig.uploadPurpose || "general",
                  onProgress: (progress) => {
                     setDocumentsAndSync((prev) => {
                        const updated = [...prev];
                        if (updated[docIndex]) {
                           updated[docIndex] = {
                              ...updated[docIndex],
                              progress,
                           };
                        }
                        return updated;
                     });
                  },
               });

               // Upload successful - update with all data from upload result
               setDocumentsAndSync((prev) => {
                  const updated = [...prev];
                  if (updated[docIndex]) {
                     updated[docIndex] = {
                        ...updated[docIndex],
                        fileUrl: result.fileUrl,
                        fileId: result.fileId,
                        token: result.token,
                        key: result.key,
                        purpose: result.purpose,
                        progress: 100,
                        isUploading: false,
                     };
                  }
                  return updated;
               });
            } catch (error) {
               // Upload failed - update with error
               setDocumentsAndSync((prev) => {
                  const updated = [...prev];
                  if (updated[docIndex]) {
                     updated[docIndex] = {
                        ...updated[docIndex],
                        isUploading: false,
                        error:
                           error instanceof Error
                              ? error.message
                              : "Upload failed",
                     };
                  }
                  return updated;
               });
            }
         }

         event.target.value = "";
      };

      const removeDocument = (index: number) => {
         const newDocs = documents.filter((_, i) => i !== index);
         setDocumentsAndSync(newDocs);
      };

      return (
         <div className="space-y-2" data-field={fieldName}>
            {fieldConfig.label && (
               <label className={labelClassName}>
                  {fieldConfig.label}
                  {fieldConfig.required && (
                     <span className="text-danger ms-0.5">*</span>
                  )}
               </label>
            )}
            <input type="hidden" {...register(fieldName)} />
            <div className="flex flex-col gap-4">
               {documents.map((doc, index) => (
                  <div
                     key={index}
                     className="bg-background border border-border rounded-2xl p-4">
                     <div className="flex gap-3 items-start mb-4">
                        <svg
                           width="40"
                           height="40"
                           viewBox="0 0 40 40"
                           fill="none"
                           className="shrink-0">
                           <rect
                              width="40"
                              height="40"
                              rx="8"
                              className={
                                 doc.error
                                    ? "fill-danger/10"
                                    : doc.isUploading
                                    ? "fill-bg-weak"
                                    : "fill-success/10"
                              }
                           />
                           <path
                              d="M20 12V28M20 28L16 24M20 28L24 24"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className={
                                 doc.error
                                    ? "stroke-danger"
                                    : doc.isUploading
                                    ? "stroke-text-sub"
                                    : "stroke-success"
                              }
                           />
                        </svg>
                        <div className="flex-1 flex flex-col gap-1">
                           <p className="text-sm font-medium text-text-strong">
                              {doc.fileName}
                           </p>
                           <div className="flex items-center gap-1 text-xs text-text-sub">
                              {doc.error ? (
                                 <span className="text-danger">
                                    {doc.error}
                                 </span>
                              ) : doc.isUploading ? (
                                 <>
                                    <span>
                                       {Math.round(
                                          (doc.fileSize * doc.progress) /
                                             100 /
                                             1024
                                       )}{" "}
                                       {t("uploadField.sizeUnits.kb")} of{" "}
                                       {Math.round(doc.fileSize / 1024)}{" "}
                                       {t("uploadField.sizeUnits.kb")}
                                    </span>
                                    <span>∙</span>
                                    <span className="text-text-strong">
                                       {t("uploadField.uploading")}{" "}
                                       {doc.progress}%
                                    </span>
                                 </>
                              ) : (
                                 <>
                                    <span className="text-success">
                                       {t("uploadField.uploadComplete")}
                                    </span>
                                    {doc.fileUrl && (
                                       <>
                                          <span>∙</span>
                                          <a
                                             href={doc.fileUrl}
                                             target="_blank"
                                             rel="noopener noreferrer"
                                             className="text-primary hover:underline">
                                             {t("uploadField.viewFile")}
                                          </a>
                                       </>
                                    )}
                                 </>
                              )}
                           </div>
                        </div>
                        <button
                           type="button"
                           onClick={() => removeDocument(index)}
                           className="p-0.5 rounded hover:bg-bg-weak transition-colors">
                           <svg
                              width="20"
                              height="20"
                              viewBox="0 0 20 20"
                              fill="none">
                              <path
                                 d="M15 5L5 15M5 5L15 15"
                                 stroke="currentColor"
                                 strokeWidth="2"
                                 strokeLinecap="round"
                                 strokeLinejoin="round"
                                 className="stroke-text-sub"
                              />
                           </svg>
                        </button>
                     </div>
                     {!doc.error && (
                        <div className="bg-bg-soft h-1.5 rounded-full overflow-hidden">
                           <div
                              className={`h-full rounded-full transition-all duration-300 ${
                                 doc.isUploading ? "bg-primary" : "bg-success"
                              }`}
                              style={{ width: `${doc.progress}%` }}
                           />
                        </div>
                     )}
                  </div>
               ))}
               <label
                  htmlFor={fieldName}
                  className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center gap-5 cursor-pointer transition-colors ${
                     shouldShowError
                        ? "border-danger/50 bg-danger/5 hover:bg-danger/10"
                        : "border-border bg-background hover:bg-bg-weak/50"
                  }`}>
                  <div className="w-6 h-6 flex items-center justify-center text-text-strong">
                     <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg">
                        <path
                           d="M3 15V18C3 19.1046 3.89543 20 5 20H19C20.1046 20 21 19.1046 21 18V15M17 8L12 3M12 3L7 8M12 3V15"
                           stroke="currentColor"
                           strokeWidth="2"
                           strokeLinecap="round"
                           strokeLinejoin="round"
                        />
                     </svg>
                  </div>
                  <div className="flex flex-col gap-1.5 text-center">
                     <p className="text-sm font-medium text-text-strong">
                        {t("uploadField.dragDropText")}
                     </p>
                     <p className="text-xs text-text-sub">
                        {fieldConfig.accept
                           ? `${fieldConfig.accept} ${t(
                                "uploadField.formatsUpTo"
                             )} 50 ${t("uploadField.mb")}.`
                           : `${t("uploadField.defaultFormats")} ${t(
                                "uploadField.formatsUpTo"
                             )} 50 ${t("uploadField.mb")}.`}
                     </p>
                  </div>
                  <span className="bg-background border border-border rounded-lg px-3 py-1.5 text-sm font-medium text-text-sub">
                     {t("uploadField.browseButton")}
                  </span>
                  <input
                     id={fieldName}
                     type="file"
                     multiple={fieldConfig.multiple !== false}
                     accept={
                        fieldConfig.accept ||
                        "image/jpeg,image/png,application/pdf,video/mp4"
                     }
                     onChange={handleDocumentUpload}
                     aria-invalid={shouldShowError}
                     aria-describedby={describedBy}
                     className="hidden"
                  />
               </label>
            </div>
            {renderFeedback()}
         </div>
      );
   }

   // Dropdown logic (used for "dropdown" and "select" types now)
   if (fieldConfig.type === "dropdown" || fieldConfig.type === "select") {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const [isOpen, setIsOpen] = useState(false);
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const buttonRef = useRef<HTMLButtonElement>(null);
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const dropdownRef = useRef<HTMLDivElement>(null);

      // eslint-disable-next-line react-hooks/rules-of-hooks
      useEffect(() => {
         const handleClickOutside = (event: MouseEvent) => {
            if (
               buttonRef.current &&
               !buttonRef.current.contains(event.target as Node) &&
               dropdownRef.current &&
               !dropdownRef.current.contains(event.target as Node)
            ) {
               setIsOpen(false);
            }
         };

         if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
         }

         return () => {
            document.removeEventListener("mousedown", handleClickOutside);
         };
      }, [isOpen]);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const currentValue = (watch as any)(fieldName);
      const selectedOption = fieldConfig.options?.find(
         (opt) => opt.id === currentValue
      );

      const isDisabled = fieldConfig.disabled;

      return (
         <div className="space-y-2" data-field={fieldName}>
            {fieldConfig.label && (
               <label htmlFor={fieldConfig.name} className={labelClassName}>
                  {fieldConfig.label}
                  {fieldConfig.required && (
                     <span className="text-danger ms-0.5">*</span>
                  )}
               </label>
            )}
            <input type="hidden" {...register(fieldName)} />
            <div className="relative">
               <button
                  ref={buttonRef}
                  id={fieldName}
                  type="button"
                  aria-invalid={shouldShowError}
                  aria-describedby={describedBy}
                  onClick={() => !isDisabled && setIsOpen(!isOpen)}
                  className={`w-full px-3 py-2.25 text-sm rounded-xl border bg-background text-text-sub focus:outline-none focus:ring-2 flex items-center justify-between ${inputStatusClassName} ${
                     isDisabled ? "opacity-60 cursor-not-allowed" : ""
                  }`}
                  disabled={isDisabled}
                  dir={isRTL ? "rtl" : "ltr"}>
                  <span
                     className={
                        selectedOption ? "text-text-strong" : "text-text-sub"
                     }>
                     {selectedOption?.label ||
                        fieldConfig.placeholder ||
                        "Select..."}
                  </span>
                  <ArrowDownSLine size={20} isRTL={isRTL} />
               </button>
               {isOpen && !isDisabled && (
                  <div
                     ref={dropdownRef}
                     className={`absolute top-full mt-1 w-full bg-background border border-border rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto ${
                        isRTL ? "end-0" : "start-0"
                     }`}
                     dir={isRTL ? "rtl" : "ltr"}>
                     <div className="flex flex-col">
                        {fieldConfig.options?.map((option) => (
                           <button
                              key={option.id}
                              type="button"
                              onClick={() => {
                                 setValue(fieldName, option.id, {
                                    shouldValidate: true,
                                    shouldDirty: true,
                                    shouldTouch: true,
                                 });
                                 if (onFieldChange) {
                                    onFieldChange(fieldName, option.id);
                                 }
                                 setIsOpen(false);
                              }}
                              className={`px-3 py-2 text-sm transition-colors ${
                                 isRTL ? "text-right" : "text-left"
                              } ${
                                 currentValue === option.id
                                    ? "bg-primary/10 text-primary"
                                    : "text-text-strong hover:bg-bg-weak"
                              }`}>
                              {option.label}
                           </button>
                        ))}
                     </div>
                  </div>
               )}
            </div>
            {renderFeedback()}
         </div>
      );
   }

   if (fieldConfig.type === "date") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rawValue = (watch as any)(fieldName);
      const parsedDate = rawValue ? new Date(rawValue) : undefined;
      const dateValue =
         parsedDate && !Number.isNaN(parsedDate.getTime())
            ? parsedDate
            : undefined;

      return (
         <div className="space-y-2" data-field={fieldName}>
            {fieldConfig.label && (
               <label htmlFor={fieldConfig.name} className={labelClassName}>
                  {fieldConfig.label}
                  {fieldConfig.required && (
                     <span className="text-danger ms-0.5">*</span>
                  )}
               </label>
            )}
            <input type="hidden" {...register(fieldName)} />
            <DatePicker
               id={fieldName}
               ariaInvalid={shouldShowError}
               ariaDescribedBy={describedBy}
               status={shouldShowError ? "error" : "default"}
               value={dateValue}
               onChange={(date) => {
                  const value = date ? formatDate(date, "yyyy-MM-dd") : "";
                  setValue(fieldName, value, {
                     shouldValidate: true,
                     shouldDirty: true,
                     shouldTouch: true,
                  });
                  if (onFieldChange) {
                     onFieldChange(fieldName, value);
                  }
               }}
               placeholder={fieldConfig.placeholder}
               className="w-full"
            />
            {renderFeedback()}
         </div>
      );
   }

   if (fieldConfig.type === "currency") {
      const currencyIcon = fieldConfig.currencyIconSrc || "/icons/dirham.png";
      const currencySuffix = fieldConfig.currencySuffix || "AED";

      return (
         <div className="space-y-2" data-field={fieldName}>
            {fieldConfig.label && (
               <label htmlFor={fieldConfig.name} className={labelClassName}>
                  {fieldConfig.label}
                  {fieldConfig.required && (
                     <span className="text-danger ms-0.5">*</span>
                  )}
               </label>
            )}
            <div
               className={`relative ${
                  fieldConfig.disabled ? "opacity-60" : ""
               }`}>
               <span className="absolute inset-y-0 start-3 flex items-center">
                  <img
                     src={currencyIcon}
                     alt={currencySuffix}
                     className="w-5 h-5 object-contain"
                  />
               </span>
               <input
                  type="number"
                  id={fieldConfig.name}
                  aria-invalid={shouldShowError}
                  aria-describedby={describedBy}
                  {...register(fieldName)}
                  onChange={(e) => {
                     const value = e.target.value;
                     setValue(fieldName, value, {
                        shouldValidate: true,
                        shouldDirty: true,
                        shouldTouch: true,
                     });
                     if (onFieldChange) {
                        onFieldChange(fieldName, value);
                     }
                  }}
                  placeholder={fieldConfig.placeholder}
                  className={`w-full ps-11 pe-16 py-2.25 text-sm rounded-xl border bg-background text-text-sub placeholder:text-text-soft focus:outline-none focus:ring-2 transition-all ${inputStatusClassName}`}
                  disabled={fieldConfig.disabled}
               />
               <span className="absolute inset-y-0 end-3 flex items-center text-sm font-medium text-text-strong">
                  {currencySuffix}
               </span>
            </div>
            {renderFeedback()}
         </div>
      );
   }

   return (
      <div key={fieldConfig.name} className="space-y-2" data-field={fieldName}>
         {fieldConfig.label && (
            <label htmlFor={fieldConfig.name} className={labelClassName}>
               {fieldConfig.label}
               {fieldConfig.required && (
                  <span className="text-danger ms-0.5">*</span>
               )}
            </label>
         )}

         {fieldConfig.type === "textarea" ? (
            <div className="relative">
               <textarea
                  id={fieldConfig.name}
                  aria-invalid={shouldShowError}
                  aria-describedby={describedBy}
                  {...register(fieldName)}
                  onChange={(e) => {
                     const value = e.target.value;
                     if (
                        !fieldConfig.maxLength ||
                        value.length <= fieldConfig.maxLength
                     ) {
                        setValue(fieldName, value, {
                           shouldValidate: true,
                           shouldDirty: true,
                           shouldTouch: true,
                        });
                        if (onFieldChange) {
                           onFieldChange(fieldName, value);
                        }
                     }
                  }}
                  placeholder={fieldConfig.placeholder}
                  rows={fieldConfig.rows || 4}
                  className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm rounded-lg border bg-background text-text-sub placeholder:text-text-soft focus:outline-none focus:ring-2 transition-all resize-none ${inputStatusClassName}`}
                  disabled={fieldConfig.disabled}
               />
               {fieldConfig.maxLength && (
                  <div className="absolute bottom-2 sm:bottom-3 end-2 sm:end-3 text-xs text-text-soft">
                     {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                     {(watch as any)(fieldName)?.toString()?.length || 0}/
                     {fieldConfig.maxLength}
                  </div>
               )}
            </div>
         ) : (
            <input
               type={fieldConfig.type || "text"}
               id={fieldConfig.name}
               aria-invalid={shouldShowError}
               aria-describedby={describedBy}
               {...register(fieldName)}
               onChange={(e) => {
                  const value = e.target.value;

                  setValue(fieldName, value, {
                     shouldValidate: true,
                     shouldDirty: true,
                     shouldTouch: true,
                  });
                  if (onFieldChange) {
                     onFieldChange(fieldName, value);
                  }
               }}
               placeholder={fieldConfig.placeholder}
               className={`w-full px-3 sm:px-4 py-2.25 text-sm rounded-xl border bg-background text-text-sub placeholder:text-text-soft focus:outline-none focus:ring-2 transition-all ${inputStatusClassName}`}
               disabled={fieldConfig.disabled}
            />
         )}

         {renderFeedback()}
      </div>
   );
}
