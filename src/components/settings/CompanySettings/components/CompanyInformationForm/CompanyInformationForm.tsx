/** @format */

import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { useOfficeLocation } from "@/hooks/officeLocations/useOfficeLocation";
import type { UpdateOfficeLocationRequest } from "@/services/officeLocationService";
import LocationModal from "@/components/settings/CompanySettings/components/LocationModal";
import WorkingDaysModal from "@/components/settings/CompanySettings/components/WorkingDaysModal";
import Loader from "@/designSystem/Loader";
import {
   CompanyLogoUpload,
   LocationField,
   FormField,
   DropdownField,
} from "./components";
import { getWeekStartDayOptions } from "./constants";
import { usePermissions } from "@/contexts/PermissionContext";
import type { WeekStartDayOption } from "./types";

// Helper to map API values to UI options
const mapWeekStartDay = (apiDay: string): WeekStartDayOption => {
   const dayMap: Record<string, WeekStartDayOption> = {
      Sunday: "sunday",
      Monday: "monday",
      Saturday: "saturday",
   };
   return (dayMap[apiDay] as WeekStartDayOption) || "sunday";
};

// Reverse mappers for saving
const reverseMapWeekStartDay = (uiDay: WeekStartDayOption): string => {
   const dayMap: Record<WeekStartDayOption, string> = {
      sunday: "Sunday",
      monday: "Monday",
      saturday: "Saturday",
   };
   return dayMap[uiDay];
};

interface CompanyInformationFormProps {
   onDataChange?: (hasChanges: boolean) => void;
}

type CompanyFormSnapshot = {
   companyName: string;
   location: string;
   address: string;
   weekStartDay: WeekStartDayOption;
   defaultWorkingDays: string[];
   locationCoordinates: {
      latitude: number;
      longitude: number;
      radiusMeters: number;
   } | null;
};

type CompanyFormWindow = Window & {
   __companyFormSave?: () => void;
   __companyFormCancel?: () => void;
   __companyFormIsUploading?: boolean;
};

function CompanyInformationForm({ onDataChange }: CompanyInformationFormProps) {
   const { t } = useTranslation("settings");
   const { can } = usePermissions();
   const { useGetOfficeLocationById, useUpdateOfficeLocation } =
      useOfficeLocation();

   const canEdit = can("manage_office_info");

   // Fetch office location data (using ID 1 as per the endpoint example)
   const { data: officeLocation, isLoading } = useGetOfficeLocationById(1);
   const updateMutation = useUpdateOfficeLocation();

   const [companyName, setCompanyName] = useState("");
   const [location, setLocation] = useState("");
   const [address, setAddress] = useState("");
   const [weekStartDay, setWeekStartDay] =
      useState<WeekStartDayOption>("sunday");
   const [defaultWorkingDays, setDefaultWorkingDays] = useState<string[]>([]);
   const [resetKey, setResetKey] = useState(0);
   const [logoData, setLogoData] = useState<{
      fileId: number;
      token: string;
   } | null>(null);
   const [isUploadingLogo, setIsUploadingLogo] = useState(false);
   const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
   const [isWorkingDaysModalOpen, setIsWorkingDaysModalOpen] = useState(false);
   const [locationCoordinates, setLocationCoordinates] = useState<{
      latitude: number;
      longitude: number;
      radiusMeters: number;
   } | null>(null);

   // Initial data state for detecting changes
   const [initialData, setInitialData] = useState<CompanyFormSnapshot | null>(
      null
   );

   // Load data from API when available
   useEffect(() => {
      if (officeLocation) {
         const data = {
            companyName: officeLocation.name,
            location: officeLocation.name,
            address: officeLocation.address,
            weekStartDay: mapWeekStartDay(officeLocation.weekStartDay),
            defaultWorkingDays: officeLocation.defaultWorkingDays || [],
            locationCoordinates: officeLocation.location,
         };

         setCompanyName(data.companyName);
         setLocation((prev) => (prev ? prev : data.location));
         setAddress(data.address);
         setWeekStartDay(data.weekStartDay);
         setDefaultWorkingDays(data.defaultWorkingDays);
         setLocationCoordinates(data.locationCoordinates);
         setInitialData(data);
      }
   }, [officeLocation]);

   // Detect changes
   useEffect(() => {
      if (!initialData) return;

      const workingDaysChanged =
         JSON.stringify(defaultWorkingDays.sort()) !==
         JSON.stringify((initialData.defaultWorkingDays || []).sort());

      const locationChanged =
         JSON.stringify(locationCoordinates) !==
         JSON.stringify(initialData.locationCoordinates);

      const hasChanges =
         companyName !== initialData.companyName ||
         address !== initialData.address ||
         weekStartDay !== initialData.weekStartDay ||
         workingDaysChanged ||
         locationChanged ||
         logoData !== null; // Logo uploaded

      onDataChange?.(hasChanges);
   }, [
      companyName,
      address,
      weekStartDay,
      defaultWorkingDays,
      locationCoordinates,
      logoData,
      initialData,
      onDataChange,
   ]);

   const handleSave = useCallback(async () => {
      if (!officeLocation) return;

      const updateData: UpdateOfficeLocationRequest = {
         name: companyName,
         address: address,
         location: locationCoordinates || officeLocation.location,
         weekStartDay: reverseMapWeekStartDay(weekStartDay),
         defaultWorkingDays: defaultWorkingDays,
      };

      // Add logo if uploaded
      if (logoData) {
         updateData.logo = {
            fileId: logoData.fileId,
            token: logoData.token,
         };
      }

      await updateMutation.mutateAsync({
         id: officeLocation.id,
         data: updateData,
      });
   }, [
      officeLocation,
      updateMutation,
      companyName,
      address,
      locationCoordinates,
      weekStartDay,
      defaultWorkingDays,
      logoData,
   ]);

   const handleCancel = useCallback(() => {
      if (initialData) {
         setCompanyName(initialData.companyName);
         setLocation(initialData.location);
         setAddress(initialData.address);
         setWeekStartDay(initialData.weekStartDay);
         setDefaultWorkingDays(initialData.defaultWorkingDays);
         setLocationCoordinates(initialData.locationCoordinates);
         setLogoData(null);
         setResetKey((prev) => prev + 1);
      }
   }, [initialData]);

   const weekStartDayOptions = getWeekStartDayOptions(t);

   const handleUseCurrentLocation = () => {
      setIsLocationModalOpen(true);
   };

   const handleSaveLocation = (
      locationName: string,
      address: string,
      radius: number,
      coordinates: { lat: number; lng: number } | null
   ) => {
      setLocation(locationName);
      setAddress(address);
      if (coordinates) {
         setLocationCoordinates({
            latitude: coordinates.lat,
            longitude: coordinates.lng,
            radiusMeters: radius,
         });
      }
      setIsLocationModalOpen(false);
   };

   // Expose save and cancel handlers to parent via window globals
   useEffect(() => {
      (window as CompanyFormWindow).__companyFormSave = handleSave;
      (window as CompanyFormWindow).__companyFormCancel = handleCancel;
      (window as CompanyFormWindow).__companyFormIsUploading = isUploadingLogo;

      return () => {
         delete (window as CompanyFormWindow).__companyFormSave;
         delete (window as CompanyFormWindow).__companyFormCancel;
         delete (window as CompanyFormWindow).__companyFormIsUploading;
      };
   }, [
      companyName,
      address,
      weekStartDay,
      defaultWorkingDays,
      isUploadingLogo,
      handleSave,
      handleCancel,
   ]);

   if (isLoading) {
      return <Loader label="Loading company settings..." />;
   }

   return (
      <div className="flex flex-col gap-8">
         {/* Company Logo Section */}
         <CompanyLogoUpload
            key={resetKey}
            initialLogoUrl={officeLocation?.logoUrl}
            onUploadingChange={setIsUploadingLogo}
            onLogoChange={(data) => {
               if (data) {
                  setLogoData({ fileId: data.fileId, token: data.token });
               } else {
                  setLogoData(null);
               }
            }}
            disabled={!canEdit}
         />

         {/* Form Fields - Rows with Two Fields Each */}
         <div className="flex flex-col gap-6">
            {/* Row 1: Company Name | Address */}
            <div className="grid grid-cols-2 gap-6">
               <FormField
                  label={t("companySettings.fields.companyName")}
                  value={companyName}
                  onChange={setCompanyName}
                  placeholder={t("companySettings.placeholders.companyName")}
                  disabled={!canEdit}
               />
               <FormField
                  label={t("companySettings.fields.address")}
                  value={address}
                  onChange={setAddress}
                  placeholder={t("companySettings.placeholders.address")}
                  disabled={!canEdit}
               />
            </div>

            {/* Row 2: Location */}
            <div className="grid grid-cols-1 gap-6">
               <LocationField
                  value={location}
                  onChange={setLocation}
                  onUseCurrentLocation={handleUseCurrentLocation}
                  disabled={!canEdit}
               />
            </div>

            {/* Row 3: Week Start Day | Default Working Days */}
            <div className="grid grid-cols-2 gap-6">
               <DropdownField
                  label={t("companySettings.fields.weekStartDay")}
                  value={weekStartDay}
                  options={weekStartDayOptions}
                  onChange={setWeekStartDay}
                  disabled={!canEdit}
               />
               <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-text-sub">
                     {t("companySettings.fields.defaultWorkingDays")}
                  </label>
                  <button
                     disabled={!canEdit}
                     onClick={() => setIsWorkingDaysModalOpen(true)}
                     className={`flex items-center justify-between rounded-lg border border-border bg-surface px-4 py-2.5 text-left text-sm transition-colors hover:bg-surface-hover ${
                        !canEdit ? "cursor-not-allowed opacity-60" : ""
                     }`}>
                     <span className="text-text">
                        {defaultWorkingDays.length > 0
                           ? `${defaultWorkingDays.length} ${
                                defaultWorkingDays.length === 1
                                   ? t(
                                        "companySettings.workingDays.daySelected"
                                     )
                                   : t(
                                        "companySettings.workingDays.daysSelected"
                                     )
                             }`
                           : t("companySettings.workingDays.selectWorkingDays")}
                     </span>
                     <svg
                        className="h-4 w-4 text-text-sub"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24">
                        <path
                           strokeLinecap="round"
                           strokeLinejoin="round"
                           strokeWidth={2}
                           d="M19 9l-7 7-7-7"
                        />
                     </svg>
                  </button>
               </div>
            </div>
         </div>

         {/* Location Modal */}
         <LocationModal
            isOpen={isLocationModalOpen}
            onClose={() => setIsLocationModalOpen(false)}
            initialLocationName={location}
            initialCoordinates={
               locationCoordinates
                  ? {
                       lat: locationCoordinates.latitude,
                       lng: locationCoordinates.longitude,
                    }
                  : null
            }
            initialRadiusMeters={locationCoordinates?.radiusMeters ?? null}
            onSave={handleSaveLocation}
         />

         {/* Working Days Modal */}
         <WorkingDaysModal
            isOpen={isWorkingDaysModalOpen}
            onClose={() => setIsWorkingDaysModalOpen(false)}
            onSave={setDefaultWorkingDays}
            initialSelectedDays={defaultWorkingDays}
         />
      </div>
   );
}

export default CompanyInformationForm;
