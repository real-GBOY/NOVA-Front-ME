/** @format */

import { useRef, useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { UploadCloud2Line } from "@/Icons";
import Button from "./Button";

type FileUploadProps = {
   label?: string;
   onChange: (files: File[]) => void;
   selectedFiles?: File[];
   accept?: string;
   maxSize?: number; // in MB
   multiple?: boolean;
   required?: boolean;
};

function FileUpload({
   label,
   onChange,
   selectedFiles = [],
   accept = ".jpeg,.jpg,.png,.pdf,.mp4",
   maxSize = 50,
   multiple = true,
   required = false,
}: FileUploadProps) {
   const { t } = useTranslation("common");
   const fileInputRef = useRef<HTMLInputElement>(null);
   const [dragActive, setDragActive] = useState(false);

   const handleDrag = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.type === "dragenter" || e.type === "dragover") {
         setDragActive(true);
      } else if (e.type === "dragleave") {
         setDragActive(false);
      }
   };

   const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
         const files = Array.from(e.dataTransfer.files);
         handleFiles(files);
      }
   };

   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      e.preventDefault();
      if (e.target.files && e.target.files.length > 0) {
         const files = Array.from(e.target.files);
         handleFiles(files);
      }
   };

   const handleFiles = (files: File[]) => {
      // Filter files by size
      const validFiles = files.filter((file) => {
         const fileSizeMB = file.size / (1024 * 1024);
         return fileSizeMB <= maxSize;
      });

      if (multiple) {
         onChange([...selectedFiles, ...validFiles]);
      } else {
         onChange(validFiles.slice(0, 1));
      }
   };

   const handleBrowseClick = () => {
      fileInputRef.current?.click();
   };

   const handleRemoveFile = (index: number) => {
      const newFiles = selectedFiles.filter((_, i) => i !== index);
      onChange(newFiles);
   };

   return (
      <div className="flex flex-col gap-1">
         {label && (
            <label className="text-sm font-medium text-text-strong">
               {label}
               {required && <span className="text-primary"> *</span>}
            </label>
         )}

         <div
            className={`relative flex flex-col items-center justify-center gap-5 px-8 py-8 rounded-2xl border-2 border-dashed transition-colors ${
               dragActive
                  ? "border-primary bg-primary/5"
                  : "border-border bg-background"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}>
            <UploadCloud2Line size={24} />

            <div className="flex flex-col gap-1.5 items-center text-center">
               <p className="text-sm font-medium text-text-strong tracking-tight">
                  {t("uploadField.dragDropText")}
               </p>
               <p className="text-xs text-text-sub">
                  {t("uploadField.defaultFormats")} {t("uploadField.formatsUpTo")} {maxSize} {t("uploadField.mb")}.
               </p>
            </div>

            <Button
               variant="secondary"
               onClick={handleBrowseClick}
               className="px-2 py-1.5 text-sm rounded-lg border border-border bg-background hover:bg-bg-weak">
               {t("uploadField.browseButton")}
            </Button>

            <input
               ref={fileInputRef}
               type="file"
               onChange={handleChange}
               accept={accept}
               multiple={multiple}
               className="hidden"
            />
         </div>

         {/* Selected Files List */}
         {selectedFiles.length > 0 && (
            <div className="flex flex-col gap-2 mt-2">
               {selectedFiles.map((file, index) => (
                  <div
                     key={index}
                     className="flex items-center justify-between px-3 py-2 rounded-lg bg-bg-weak border border-border">
                     <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div className="text-xs text-text-sub shrink-0">
                           {getFileIcon(file.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                           <p className="text-sm font-medium text-text-strong truncate">
                              {file.name}
                           </p>
                           <p className="text-xs text-text-sub">
                              {formatFileSize(file.size, t)}
                           </p>
                        </div>
                     </div>
                     <button
                        onClick={() => handleRemoveFile(index)}
                        className="shrink-0 p-1 hover:bg-border rounded transition-colors">
                        <svg
                           xmlns="http://www.w3.org/2000/svg"
                           width="16"
                           height="16"
                           viewBox="0 0 24 24"
                           fill="none"
                           stroke="currentColor"
                           strokeWidth="2"
                           strokeLinecap="round"
                           strokeLinejoin="round"
                           className="text-text-sub">
                           <line x1="18" y1="6" x2="6" y2="18" />
                           <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                     </button>
                  </div>
               ))}
            </div>
         )}
      </div>
   );
}

function getFileIcon(fileType: string): string {
   if (fileType.startsWith("image/")) return "🖼️";
   if (fileType === "application/pdf") return "📄";
   if (fileType.startsWith("video/")) return "🎥";
   return "📎";
}

function formatFileSize(bytes: number, t: (key: string) => string): string {
   if (bytes === 0) return `0 ${t("uploadField.sizeUnits.bytes")}`;
   const k = 1024;
   const sizes = [
      t("uploadField.sizeUnits.bytes"),
      t("uploadField.sizeUnits.kb"),
      t("uploadField.sizeUnits.mb"),
      t("uploadField.sizeUnits.gb"),
   ];
   const i = Math.floor(Math.log(bytes) / Math.log(k));
   return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

export default FileUpload;
