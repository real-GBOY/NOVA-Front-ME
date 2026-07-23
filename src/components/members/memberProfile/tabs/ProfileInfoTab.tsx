/** @format */

import { useState } from "react";
import DetailSectionsGrid from "../DetailSectionsGrid";
import { DetailSectionData } from "../types";
import { useTranslation } from "@/hooks/useTranslation";
import EditPersonalInfoForm from "./modals/EditPersonalInfoForm";
import EditWorkInfoForm from "./modals/EditWorkInfoForm";
import EditAddressForm from "./modals/EditAddressForm";
import EditContactForm from "./modals/EditContactForm";
import EditCompensationForm from "./modals/EditCompensationForm";
import type { EmployeeDetails } from "@/services/employeeService";

interface ProfileInfoTabProps {
   detailSections: DetailSectionData[];
   compensationSections: DetailSectionData[];
   canEdit?: boolean;
   employeeId?: string | number;
   employeeData?: EmployeeDetails | null;
   availableJobTitles?: Array<{ id: string; title: string }>;
   availableTeams?: Array<{ id: string; name: string }>;
   availableRoles?: Array<{ id: string; title: string }>;
   availableManagers?: Array<{ id: string; name: string; avatar?: string }>;
}

function ProfileInfoTab({
   detailSections,
   compensationSections,
   canEdit = false,
   employeeId,
   employeeData,
   availableJobTitles = [],
   availableTeams = [],
   availableRoles = [],
   availableManagers = [],
}: ProfileInfoTabProps) {
   const { t } = useTranslation("members");
   const [activeEditModal, setActiveEditModal] = useState<string | null>(null);

   const personalSection = detailSections.find(
      (section) => section.id === "personal"
   );
   const workSection = detailSections.find((section) => section.id === "work");
   const addressSection = detailSections.find(
      (section) => section.id === "address"
   );
   const contactSection = detailSections.find(
      (section) => section.id === "contact"
   );
   const compensationSection = compensationSections.find(
      (section) => section.id === "compensation"
   );

   if (!personalSection || !addressSection) {
      return null;
   }

   const handleEditSection = (sectionId: string) => {
      setActiveEditModal(sectionId);
   };

   const handleCloseModal = () => {
      setActiveEditModal(null);
   };

   const handleSuccess = () => {
      // Data will be refreshed automatically via React Query invalidation
      handleCloseModal();
   };

   return (
      <div className="w-full">
         <div className="r-grid-form r-gap w-full xl:grid-cols-2 xl:gap-6">
            <div className="flex flex-col r-gap xl:gap-6">
               <DetailSectionsGrid
                  sections={[personalSection]}
                  gridClassName="grid-cols-1"
                  onEdit={handleEditSection}
                  canEdit={canEdit}
               />
               {compensationSections.length > 0 && (
                  <DetailSectionsGrid
                     sections={compensationSections}
                     gridClassName="grid-cols-1"
                     onEdit={handleEditSection}
                     canEdit={canEdit}
                  />
               )}
            </div>

            <div className="flex flex-col r-gap xl:gap-6">
               {workSection && (
                  <DetailSectionsGrid
                     sections={[workSection]}
                     gridClassName="grid-cols-1"
                     onEdit={handleEditSection}
                     canEdit={canEdit}
                  />
               )}
               <DetailSectionsGrid
                  sections={[addressSection]}
                  gridClassName="grid-cols-1"
                  onEdit={handleEditSection}
                  canEdit={canEdit}
               />
               {contactSection && (
                  <DetailSectionsGrid
                     sections={[contactSection]}
                     gridClassName="grid-cols-1"
                     onEdit={handleEditSection}
                     canEdit={canEdit}
                  />
               )}
            </div>
         </div>

         {/* Edit Modals */}
         {employeeId && employeeData && (
            <>
               <EditPersonalInfoForm
                  isOpen={activeEditModal === "personal"}
                  onClose={handleCloseModal}
                  employeeId={employeeId}
                  employeeData={employeeData}
                  onSuccess={handleSuccess}
               />
               <EditWorkInfoForm
                  isOpen={activeEditModal === "work"}
                  onClose={handleCloseModal}
                  employeeId={employeeId}
                  employeeData={employeeData}
                  availableJobTitles={availableJobTitles}
                  availableTeams={availableTeams}
                  availableRoles={availableRoles}
                  availableManagers={availableManagers}
                  onSuccess={handleSuccess}
               />
               <EditAddressForm
                  isOpen={activeEditModal === "address"}
                  onClose={handleCloseModal}
                  employeeId={employeeId}
                  employeeData={employeeData}
                  onSuccess={handleSuccess}
               />
               <EditContactForm
                  isOpen={activeEditModal === "contact"}
                  onClose={handleCloseModal}
                  employeeId={employeeId}
                  employeeData={employeeData}
                  onSuccess={handleSuccess}
               />
               <EditCompensationForm
                  isOpen={activeEditModal === "compensation"}
                  onClose={handleCloseModal}
                  employeeId={employeeId}
                  employeeData={employeeData}
                  onSuccess={handleSuccess}
               />
            </>
         )}
      </div>
   );
}

export default ProfileInfoTab;
