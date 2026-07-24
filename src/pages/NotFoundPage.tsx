/** @format */

import { useNavigate } from "react-router-dom";
import { useTranslation } from "@/hooks/useTranslation";

/**
 * NotFoundPage (404)
 *
 * Retro pixel-art / arcade style error page shown when a route doesn't exist.
 */
export function NotFoundPage() {
   const navigate = useNavigate();
   const { t } = useTranslation("common");

   const handleGoHome = () => {
      navigate("/dashboard");
   };

   const handleTryAgain = () => {
      window.location.reload();
   };

   return (
      <div
         dir="ltr"
         className="pixel-grid-bg relative flex min-h-screen w-full items-center justify-center overflow-hidden p-10 font-vt323">
         <div className="relative z-[2] flex max-w-[720px] flex-col items-center gap-7 text-center">
            {/* Floating pixel blocks */}
            <div className="animate-pixel-floaty flex items-end gap-2.5">
               <div className="h-[70px] w-[22px] bg-white shadow-[0_0_0_6px_#000000]" />
               <div className="h-[70px] w-[22px] bg-white shadow-[0_0_0_6px_#000000]" />
               <div className="h-[70px] w-[22px] bg-white shadow-[0_0_0_6px_#000000]" />
               <div className="h-[70px] w-[22px] bg-white shadow-[0_0_0_6px_#000000]" />
            </div>

            {/* Error code */}
            <h1 className="m-0 font-press-start text-7xl leading-none tracking-[4px] text-white [text-shadow:4px_4px_0_rgba(255,255,255,0.2),8px_8px_0_rgba(255,255,255,0.1)]">
               {t("errors.notFound.code")}
            </h1>

            {/* Title */}
            <p className="m-0 font-press-start text-lg leading-[1.8] tracking-[1px] text-white uppercase">
               {t("errors.notFound.title")}
            </p>

            {/* Description */}
            <p className="m-0 text-2xl leading-[1.6] text-[#a3a3a3]">
               {t("errors.notFound.descriptionLine1")}
               <br />
               {t("errors.notFound.descriptionLine2")}
            </p>

            {/* Actions */}
            <div className="mt-2 flex flex-wrap items-center justify-center gap-4">
               <button
                  type="button"
                  onClick={handleGoHome}
                  className="cursor-pointer border-[3px] border-white bg-white px-7 py-[18px] font-press-start text-base text-black uppercase shadow-[6px_6px_0_#666666]">
                  &#9664; {t("errors.notFound.home")}
               </button>
               <button
                  type="button"
                  onClick={handleTryAgain}
                  className="cursor-pointer border-[3px] border-white bg-transparent px-7 py-[18px] font-press-start text-base text-white uppercase shadow-[6px_6px_0_#666666]">
                  {t("errors.notFound.tryAgain")}
               </button>
            </div>

            {/* Blinking prompt */}
            <p className="animate-pixel-blink m-0 mt-5 font-press-start text-sm text-[#666666] uppercase">
               {t("errors.notFound.pressStart")}
            </p>
         </div>
      </div>
   );
}

export default NotFoundPage;
