/** @format */


import { useTranslation } from "@/hooks/useTranslation";

function Projects() {
   const { t } = useTranslation("common");

   return (
      <>
         <div className="text-text-sub">{t("comingSoon.projects")}</div>
      </>
   );
}

export default Projects;
