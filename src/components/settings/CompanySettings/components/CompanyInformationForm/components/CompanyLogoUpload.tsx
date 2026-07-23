/** @format */

import { useState, useRef, useEffect } from "react";
import { CompanyLogo } from "@/Icons";
import { useTranslation } from "@/hooks/useTranslation";
import Button from "@/designSystem/Button";
import { useFileUpload } from "@/hooks/useFileUpload";
import endPoints from "@/config/endPoints";

type CompanyLogoUploadProps = {
   onLogoChange?: (
      logoData: { fileId: number; token: string; url: string } | null
   ) => void;
   onUploadingChange?: (isUploading: boolean) => void;
   initialLogoUrl?: string;
   disabled?: boolean;
};

function CompanyLogoUpload({
   onLogoChange,
   onUploadingChange,
   initialLogoUrl,
   disabled = false,
}: CompanyLogoUploadProps) {
   const { t } = useTranslation("settings");
   const { uploadFile } = useFileUpload();
   const fileInputRef = useRef<HTMLInputElement>(null);

   // Helper to get full URL for logo
   const getFullLogoUrl = (url: string | null | undefined): string | null => {
      if (!url) return null;
      // If it's already a full URL or data URL, return as is
      if (url.startsWith("http") || url.startsWith("data:")) return url;
      // If it's a relative path, prepend base URL
      if (url.startsWith("/")) {
         // Remove /api/v1 from baseurl and use just the origin
         const baseUrl = endPoints.baseurl.replace("/api/v1", "");
         return `${baseUrl}${url}`;
      }
      return url;
   };

   const [companyLogo, setCompanyLogo] = useState<string | null>(
      getFullLogoUrl(initialLogoUrl)
   );
   const [isUploadingLogo, setIsUploadingLogo] = useState(false);

   // Update logo when initialLogoUrl changes
   useEffect(() => {
      setCompanyLogo(getFullLogoUrl(initialLogoUrl));
   }, [initialLogoUrl]);

   // Notify parent when upload state changes
   useEffect(() => {
      onUploadingChange?.(isUploadingLogo);
   }, [isUploadingLogo, onUploadingChange]);

   const handleLogoUpload = async (file: File) => {
      if (!file) return;

      const reader = new FileReader();
      reader.onloadend = () => {
         const logoUrl = reader.result as string;
         setCompanyLogo(logoUrl);
      };
      reader.readAsDataURL(file);

      try {
         setIsUploadingLogo(true);
         const uploadResult = await uploadFile(file, {
            purpose: "office_location",
         });

         // Pass the upload result to parent
         if (uploadResult && uploadResult.fileId && uploadResult.token) {
            onLogoChange?.({
               fileId: uploadResult.fileId,
               token: uploadResult.token,
               url: reader.result as string,
            });
         }
      } catch (error) {
         console.error("Company logo upload failed:", error);
         setCompanyLogo(getFullLogoUrl(initialLogoUrl));
         onLogoChange?.(null);
      } finally {
         setIsUploadingLogo(false);
      }
   };

   const handleUploadClick = () => {
      if (disabled) return;
      fileInputRef.current?.click();
   };

   return (
      <div className="flex items-start gap-5">
         <div className="relative flex-none order-0 flex-grow-0 w-16 h-16 rounded-full overflow-hidden bg-bg-weak">
            {companyLogo ? (
               <img
                  src={companyLogo}
                  alt="Company Logo"
                  className="absolute end-0 right-0 top-0 bottom-0 w-full h-full object-cover rounded-full"
               />
            ) : (
               <div className="absolute inset-0 flex items-center justify-center">
                  <CompanyLogo size={64} className="fill-icon-sub" />
               </div>
            )}
            {isUploadingLogo && (
               <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-full">
                  <span className="text-xs text-text-sub">Uploading...</span>
               </div>
            )}
         </div>
         <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
               <p className="text-base font-medium text-text-strong">
                  {t("companySettings.logo.title")}
               </p>
               <p className="text-sm text-text-sub">
                  {t("companySettings.logo.requirements")}
               </p>
            </div>
            <Button
               variant="secondary"
               onClick={handleUploadClick}
               disabled={isUploadingLogo || disabled}
               className="w-fit px-3 py-1.5 rounded-lg">
               {isUploadingLogo
                  ? "Uploading..."
                  : companyLogo
                  ? t("companySettings.logo.change", "Change")
                  : t("companySettings.logo.upload", "Upload")}
            </Button>
            <input
               ref={fileInputRef}
               type="file"
               accept="image/png,image/jpeg"
               className="hidden"
               disabled={isUploadingLogo || disabled}
               onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (!file) return;
                  handleLogoUpload(file);
                  event.target.value = "";
               }}
            />
         </div>
      </div>
   );
}

export default CompanyLogoUpload;
