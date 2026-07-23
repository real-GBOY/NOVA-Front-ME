/** @format */


import { useTranslation } from "@/hooks/useTranslation";

function Calendar() {
   const { t } = useTranslation("common");

   return (
      <>
         <div className="text-text-sub">{t("comingSoon.calendar")}</div>
      </>
   );
}

export default Calendar;
