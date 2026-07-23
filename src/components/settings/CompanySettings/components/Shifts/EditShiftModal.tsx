/** @format */

import { useMemo, useState, useEffect } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import Modal from "@/designSystem/Modal";
import GenericForm, { FieldConfig } from "@/designSystem/GenericForm";
import Button from "@/designSystem/Button";
import ConfirmModal from "@/designSystem/ConfirmModal";
import * as yup from "yup";
import { useShifts } from "@/hooks/shifts/useShifts";
import type { UpdateShiftRequest } from "@/services/shiftService";
import toast from "@/utilities/toast";
import WeekdaySegmentsEditor from "./WeekdaySegmentsEditor";
import type { ViewShift } from "./types";
import { useOfficeLocation } from "@/hooks/officeLocations/useOfficeLocation";
import { shiftTimeToMinutes } from "@/utilities/shiftTime";

// Helper function to normalize time from HH:mm:ss to HH:mm
const normalizeTime = (time: string): string => {
   if (!time) return time;
   // If time is already in HH:mm format, return as is
   if (time.length === 5) return time;
   // If time is in HH:mm:ss format, extract HH:mm
   if (time.length >= 5) return time.substring(0, 5);
   return time;
};

const normalizeEndTime = (time: string): string => {
   const normalized = normalizeTime(time);
   return normalized === "00:00" ? "24:00" : normalized;
};

type EditShiftModalProps = {
   isOpen: boolean;
   onClose: () => void;
   shift: ViewShift;
   onSuccess?: () => void;
};

type ShiftFormValues = {
   name: string;
   description?: string;
};

function EditShiftModal({
   isOpen,
   onClose,
   shift,
   onSuccess,
}: EditShiftModalProps) {
   const { t } = useTranslation("settings");
   const { t: tCommon } = useTranslation("common");
   const { useUpdateShift } = useShifts();
   const { useGetOfficeLocationById } = useOfficeLocation();
   const updateMutation = useUpdateShift();
   const { data: officeLocation } = useGetOfficeLocationById(1);
   const [isDirty, setIsDirty] = useState(false);
   const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
   const [segments, setSegments] = useState<
      Array<{
         weekday: number;
         start_time: string;
         end_time: string;
         break_minutes: number | null;
      }>
   >([]);

   // Initialize segments from shift prop
   useEffect(() => {
      if (shift && isOpen) {
         const normalizedSegments = (shift.segments || []).map((seg) => ({
            ...seg,
            start_time: normalizeTime(seg.start_time),
            end_time: normalizeEndTime(seg.end_time),
         }));
         setSegments(normalizedSegments);
         setIsDirty(false);
      }
   }, [shift, isOpen]);

   const schema = yup.object().shape({
      name: yup.string().required(t("validation.required")),
      description: yup.string(),
   });

   const fields: FieldConfig[] = [
      {
         name: "name",
         type: "text",
         label: t("companySettings.shifts.modal.name"),
         placeholder: t("companySettings.shifts.modal.namePlaceholder"),
         required: true,
         maxLength: 255,
      },
      {
         name: "description",
         type: "textarea",
         label: t("companySettings.shifts.modal.description"),
         placeholder: t("companySettings.shifts.modal.descriptionPlaceholder"),
         required: false,
      },
   ];

   const defaultValues = useMemo(
      () => ({
         name: shift?.name || "",
         description: shift?.description || "",
      }),
      [shift],
   );

   const handleSubmit = async (data: ShiftFormValues) => {
      if (segments.length === 0) {
         toast.error(t("companySettings.shifts.validation.atLeastOneDay"));
         return;
      }

      const hasInvalidRange = segments.some((seg) => {
         const startMinutes = shiftTimeToMinutes(seg.start_time);
         const endMinutes = shiftTimeToMinutes(seg.end_time, {
            allow24Hour: true,
         });
         if (startMinutes == null || endMinutes == null) return true;
         return startMinutes > endMinutes;
      });
      if (hasInvalidRange) {
         toast.error(t("companySettings.shifts.validation.invalidTimeRange"));
         return;
      }

      try {
         const payload: UpdateShiftRequest = {
            name: data.name,
            description: data.description || undefined,
            segments: segments.map((seg) => ({
               weekday: seg.weekday,
               start_time: normalizeTime(seg.start_time),
               end_time: normalizeTime(seg.end_time),
               break_minutes: seg.break_minutes,
            })),
         };

         await updateMutation.mutateAsync({
            id: parseInt(shift.id, 10),
            data: payload,
         });
         if (onSuccess) onSuccess();
         setIsDirty(false);
         onClose();
      } catch (error) {
         console.error("Error updating shift:", error);
      }
   };

   const handleSegmentsChange = (
      newSegments: Array<{
         weekday: number;
         start_time: string;
         end_time: string;
         break_minutes: number | null;
      }>,
   ) => {
      setSegments(newSegments);
      setIsDirty(true);
   };

   const isLoading = updateMutation.isPending;

   const footer = (
      <div className="flex justify-end gap-3 w-full">
         <Button
            variant="secondary"
            onClick={() => {
               if (isDirty) {
                  setShowDiscardConfirm(true);
                  return;
               }
               onClose();
            }}
            disabled={isLoading}>
            {t("companySettings.shifts.modal.cancel")}
         </Button>
         <Button type="submit" form="edit-shift-form" disabled={isLoading}>
            {isLoading && (
               <span className="animate-spin mr-2 w-4 h-4 border-2 border-white border-t-transparent rounded-full inline-block align-middle" />
            )}
            {t("companySettings.shifts.modal.saveButton")}
         </Button>
      </div>
   );

   return (
      <Modal
         isOpen={isOpen}
         onClose={() => {
            if (isDirty) {
               setShowDiscardConfirm(true);
               return;
            }
            onClose();
         }}
         title={t("companySettings.shifts.modal.editTitle")}
         size="medium"
         footer={footer}>
         <div className="flex flex-col gap-6">
            <GenericForm<ShiftFormValues>
               id="edit-shift-form"
               schema={schema}
               onSubmit={handleSubmit}
               fields={fields}
               showSubmitButton={false}
               defaultValues={defaultValues}
               onDirtyChange={setIsDirty}
            />

            {/* Timezone Display */}
            <div className="flex flex-col gap-1.5">
               <label className="text-sm font-medium text-text-strong">
                  {t("companySettings.shifts.modal.timezone")}
               </label>
               <div className="px-3 py-2.5 rounded-xl bg-bg-weak border border-border text-sm text-text-sub">
                  {shift?.timezone || "Asia/Dubai"}
               </div>
            </div>

            {/* Weekday Segments Editor */}
            <WeekdaySegmentsEditor
               segments={segments}
               workingDays={officeLocation?.defaultWorkingDays}
               onChange={handleSegmentsChange}
            />
         </div>

         <ConfirmModal
            isOpen={showDiscardConfirm}
            onClose={() => setShowDiscardConfirm(false)}
            onConfirm={() => {
               setShowDiscardConfirm(false);
               const normalizedSegments = (shift?.segments || []).map(
                  (seg) => ({
                     ...seg,
                     start_time: normalizeTime(seg.start_time),
                     end_time: normalizeEndTime(seg.end_time),
                  }),
               );
               setSegments(normalizedSegments);
               setIsDirty(false);
               onClose();
            }}
            title={tCommon("unsavedChanges.title")}
            description={tCommon("unsavedChanges.description")}
            confirmText={tCommon("unsavedChanges.confirm")}
            cancelText={tCommon("unsavedChanges.cancel")}
            variant="primary"
            icon="exclamation"
         />
      </Modal>
   );
}

export default EditShiftModal;
