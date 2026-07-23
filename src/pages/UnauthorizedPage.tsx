/** @format */

import { useNavigate } from "react-router-dom";
import { useTranslation } from "@/hooks/useTranslation";
import { Button } from "@/designSystem/ui/button";
import ShieldCrossIcon from "@/Icons/shield-cross";

/**
 * UnauthorizedPage (403)
 *
 * Beautiful error page shown when user tries to access a resource
 * they don't have permission to view.
 */
export function UnauthorizedPage() {
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
         <div className="relative flex max-w-lg flex-col items-center text-center">
            {/* Decorative background effects */}
            <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none select-none">
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[500px] rounded-full bg-gradient-to-tr from-danger/5 via-danger/10 to-transparent blur-3xl opacity-50" />
            </div>

            <div className="flex flex-col items-center rounded-2xl bg-bg-weak p-8 shadow-xl border border-border w-full">
               {/* Error code badge */}
               <div className="relative mb-6 flex items-center justify-center">
                  <div className="flex size-24 items-center justify-center rounded-full bg-danger/10 ring-8 ring-danger/5 animate-pulse-subtle">
                     <ShieldCrossIcon size={40} className="fill-danger" />
                  </div>
               </div>

               {/* Error code */}
               <span className="mb-8 text-5xl font-bold tracking-tight text-danger">
                  {t("errors.unauthorized.code")}
               </span>

               {/* Title */}
               <h1 className="mb-3 text-xl font-semibold text-text-strong">
                  {t("errors.unauthorized.message")}
               </h1>

               {/* Description */}
               <p className="mb-8 text-text-sub leading-relaxed max-w-xs mx-auto text-sm">
                  {t("errors.unauthorized.description")}
               </p>

               {/* Actions */}
               <div className="flex gap-3 w-full justify-center">
                  <Button
                     variant="outline"
                     onClick={handleGoBack}
                     className="min-w-[120px] text-text-strong">
                     {t("errors.unauthorized.goBack")}
                  </Button>
                  <Button
                     onClick={handleGoHome}
                     className="min-w-[120px] text-background/90!">
                     {t("errors.unauthorized.goHome")}
                  </Button>
               </div>
            </div>
         </div>
      </div>
   );
}

export default UnauthorizedPage;
