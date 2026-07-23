/** @format */

import { useNavigate } from "react-router-dom";
import { useTranslation } from "@/hooks/useTranslation";
import {
   Breadcrumb,
   BreadcrumbItem,
   BreadcrumbLink,
   BreadcrumbList,
   BreadcrumbPage,
   BreadcrumbSeparator,
} from "@/designSystem/ui/breadcrumb";

interface MemberBreadcrumbProps {
   membersLink?: string;
   memberName?: string;
}

function MemberBreadcrumb({
   membersLink = "/dashboard/members",
   memberName,
}: MemberBreadcrumbProps) {
   const navigate = useNavigate();
   const { t } = useTranslation("members");

   return (
      <Breadcrumb>
         <BreadcrumbList>
            <BreadcrumbItem>
               <BreadcrumbLink
                  onClick={() => navigate(membersLink)}
                  className="text-text-soft cursor-pointer text-sm sm:text-base xl:text-lg">
                  {t("profile.breadcrumb.members")}
               </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
               <span className="text-text-soft text-sm sm:text-base xl:text-lg">
                  {t("profile.breadcrumb.memberProfile")}
               </span>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
               <BreadcrumbPage>
                  <span className="text-sm font-medium sm:text-base xl:text-lg">
                     {memberName || ""}
                  </span>
               </BreadcrumbPage>
            </BreadcrumbItem>
         </BreadcrumbList>
      </Breadcrumb>
   );
}

export default MemberBreadcrumb;
