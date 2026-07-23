/** @format */

import { useNavigate } from "react-router-dom";
import { useTranslation } from "@/hooks/useTranslation";
import { Button } from "@/designSystem/ui/button";
import FileSearchIcon from "@/Icons/file-search";

/**
 * NotFoundPage (404)
 *
 * Beautiful error page shown when a route doesn't exist.
 */
export function NotFoundPage() {
   const navigate = useNavigate();
   const { t } = useTranslation("common");

   const handleGoBack = () => {
      if (window.history.length > 1) {
         navigate(-1);
      } else {
         navigate("/dashboard");
      }
   };

   const handleGoHome = () => {
      navigate("/dashboard");
   };

   return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background p-6">
         <div className="flex max-w-md flex-col items-center text-center">
            {/* Decorative background gradient */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
               <div className="absolute top-1/4 left-1/2 -translate-x-1/2 size-[600px] rounded-full bg-gradient-to-br from-warning/5 via-warning/10 to-transparent blur-3xl" />
            </div>

            {/* Error code badge */}
            <div className="relative mb-8 flex items-center justify-center">
               <div className="flex size-28 items-center justify-center rounded-full bg-warning/10 ring-8 ring-warning/5">
                  <FileSearchIcon size={48} className="fill-warning" />
               </div>
            </div>

            {/* Error code */}
            <span className="mb-10 text-7xl font-bold tracking-tight text-warning/80">
               {t("errors.notFound.code")}
            </span>

            {/* Title */}
            <h1 className="mb-3 text-2xl font-semibold text-text-strong">
               {t("errors.notFound.message")}
            </h1>

            {/* Description */}
            <p className="mb-8 text-text-sub leading-relaxed">
               {t("errors.notFound.description")}
            </p>

            {/* Actions */}
            <div className="flex gap-3">
               <Button
                  variant="outline"
                  onClick={handleGoBack}
                  className="min-w-[120px]">
                  {t("errors.notFound.goBack")}
               </Button>
               <Button onClick={handleGoHome} className="min-w-[140px]">
                  {t("errors.notFound.goHome")}
               </Button>
            </div>
         </div>
      </div>
   );
}

export default NotFoundPage;
