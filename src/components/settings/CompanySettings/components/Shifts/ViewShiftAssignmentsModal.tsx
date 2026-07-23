/** @format */

import Modal from "@/designSystem/Modal";
import { useTranslation } from "@/hooks/useTranslation";
import { useShifts } from "@/hooks/shifts/useShifts";
import Loader from "@/designSystem/Loader";
import { useNavigate } from "react-router-dom";

type ViewShiftAssignmentsModalProps = {
   isOpen: boolean;
   onClose: () => void;
   shiftId: number;
   shiftName: string;
};

function ViewShiftAssignmentsModal({
   isOpen,
   onClose,
   shiftId,
   shiftName,
}: ViewShiftAssignmentsModalProps) {
   const { t } = useTranslation("settings");
   const navigate = useNavigate();
   const { useGetShiftEmployees } = useShifts();

   const { data, isLoading } = useGetShiftEmployees(shiftId, {
      enabled: isOpen && !!shiftId,
   });

   const employees = data?.data || [];

   const handleEmployeeClick = (employeeId: number) => {
      navigate(`/dashboard/members/profile/${employeeId}`);
      onClose();
   };

   return (
      <Modal
         isOpen={isOpen}
         onClose={onClose}
         title={t("companySettings.shifts.assignmentsModal.title", {
            shiftName,
         })}
         size="medium"
         width="w-[40rem]">
         <div className="flex flex-col gap-6">
            {isLoading ? (
               <div className="flex items-center justify-center py-12">
                  <Loader
                     label={t(
                        "companySettings.shifts.assignmentsModal.loading",
                     )}
                  />
               </div>
            ) : employees.length === 0 ? (
               <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <div className="text-6xl">👥</div>
                  <p className="text-base font-medium text-text-strong">
                     {t("companySettings.shifts.assignmentsModal.noEmployees")}
                  </p>
                  <p className="text-sm text-text-sub">
                     {t(
                        "companySettings.shifts.assignmentsModal.noEmployeesDesc",
                     )}
                  </p>
               </div>
            ) : (
               <div className="grid grid-cols-2 gap-3">
                  {employees.map((employee, index) => (
                     <button
                        key={`${employee.employee_id}-${index}`}
                        onClick={() =>
                           handleEmployeeClick(employee.employee_id)
                        }
                        className="flex items-center gap-3 p-3 bg-background border border-border rounded-xl hover:border-primary hover:bg-bg-weak transition-all duration-200 cursor-pointer group">
                        {/* Avatar */}
                        <div className="relative w-10 h-10 rounded-full bg-bg-weak overflow-hidden flex-shrink-0">
                           {employee.avatar ? (
                              <img
                                 src={employee.avatar}
                                 alt={`${employee.first_name} ${employee.last_name}`}
                                 className="w-full h-full object-cover"
                              />
                           ) : (
                              <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-semibold text-sm">
                                 {employee.first_name[0]}
                                 {employee.last_name[0]}
                              </div>
                           )}
                        </div>

                        {/* Employee Info */}
                        <div className="flex flex-col items-start flex-1 min-w-0">
                           <p className="text-sm font-semibold text-text-strong truncate w-full group-hover:text-primary transition-colors">
                              {employee.first_name} {employee.last_name}
                           </p>
                        </div>
                     </button>
                  ))}
               </div>
            )}
         </div>
      </Modal>
   );
}

export default ViewShiftAssignmentsModal;
