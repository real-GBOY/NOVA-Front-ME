/** @format */

import { useState, useEffect, useRef } from "react";
// Leaflet is typed as `any` via src/types/leaflet.d.ts; use loose types here to avoid conflicts
type LeafletMap = any;
type LeafletMarker = any;
type LeafletCircle = any;
import toast from "@/utilities/toast";
import apiClient from "@/config/axios";
import Button from "@/designSystem/Button";
import ConfirmModal from "@/designSystem/ConfirmModal";
import { CloseLine } from "@/Icons";
import { useTranslation } from "@/hooks/useTranslation";

type LocationModalProps = {
   isOpen: boolean;
   onClose: () => void;
   initialLocationName?: string;
   initialCoordinates?: { lat: number; lng: number } | null;
   initialRadiusMeters?: number | null;
   onSave: (
      locationName: string,
      address: string,
      radius: number,
      coordinates: { lat: number; lng: number } | null
   ) => void;
};

function LocationModal({
   isOpen,
   onClose,
   onSave,
   initialLocationName,
   initialCoordinates,
   initialRadiusMeters,
}: LocationModalProps) {
   const { t } = useTranslation("settings");
   const [locationName, setLocationName] = useState("");
   const [address, setAddress] = useState("");
   const [mapCoordinates, setMapCoordinates] = useState<{
      lat: number;
      lng: number;
   }>({
      lat: initialCoordinates?.lat ?? 25.204849,
      lng: initialCoordinates?.lng ?? 55.270783,
   }); // Dubai default fallback
   const [allowedRadius, setAllowedRadius] = useState(
      initialRadiusMeters != null ? String(initialRadiusMeters) : "200"
   );
   const [showConfirmModal, setShowConfirmModal] = useState(false);
   const mapRef = useRef<LeafletMap | null>(null);
   const markerRef = useRef<LeafletMarker | null>(null);
   const circleRef = useRef<LeafletCircle | null>(null);

   useEffect(() => {
      if (!isOpen) return;
      setLocationName(initialLocationName ?? "");
      setShowConfirmModal(false);
      if (initialCoordinates) {
         setMapCoordinates({
            lat: initialCoordinates.lat,
            lng: initialCoordinates.lng,
         });
      }
      if (initialRadiusMeters != null) {
         setAllowedRadius(String(initialRadiusMeters));
      }
   }, [isOpen, initialLocationName, initialCoordinates, initialRadiusMeters]);

   useEffect(() => {
      if (isOpen) {
         document.body.style.overflow = "hidden";
      } else {
         document.body.style.overflow = "";
      }

      return () => {
         document.body.style.overflow = "";
      };
   }, [isOpen]);

   useEffect(() => {
      const handleEscape = (e: KeyboardEvent) => {
         if (e.key === "Escape" && isOpen) {
            onClose();
         }
      };

      document.addEventListener("keydown", handleEscape);
      return () => {
         document.removeEventListener("keydown", handleEscape);
      };
   }, [isOpen, onClose]);

   // Initialize Leaflet map
   useEffect(() => {
      if (!isOpen) return;

      let map: LeafletMap | null = null;
      let marker: LeafletMarker | null = null;
      let circle: LeafletCircle | null = null;

      const initMap = async () => {
         // Dynamically import Leaflet
         const L = (await import("leaflet")).default;

         // Fix for default marker icon
         delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })
            ._getIconUrl;
         L.Icon.Default.mergeOptions({
            iconRetinaUrl:
               "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
            iconUrl:
               "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
            shadowUrl:
               "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
         });

         // Wait for the map container to be in the DOM
         const mapContainer = document.getElementById("leaflet-map");
         if (!mapContainer || mapRef.current) return;

         // Create map
         map = L.map("leaflet-map").setView(
            [mapCoordinates.lat, mapCoordinates.lng],
            15
         );
         mapRef.current = map;

         // Add tile layer
         L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution:
               '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
         }).addTo(map);

         // Add draggable marker
         marker = L.marker([mapCoordinates.lat, mapCoordinates.lng], {
            draggable: true,
         }).addTo(map);
         markerRef.current = marker;

         // Draw allowed radius circle similar to attendance requests map
         const numericRadius = Number(allowedRadius);
         circle = L.circle([mapCoordinates.lat, mapCoordinates.lng], {
            color: "blue",
            fillColor: "#3085d6",
            fillOpacity: 0.1,
            radius: Number.isFinite(numericRadius) ? Math.max(0, numericRadius) : 0,
         }).addTo(map);
         circleRef.current = circle;

         // Handle marker drag
         marker.on("dragend", async function (e: any) {
            const position = (e.target as LeafletMarker).getLatLng();
            await handleMapClick(position.lat, position.lng);
         });

         // Handle map click
         map.on("click", async function (e: any) {
            const { lat, lng } = e.latlng;
            marker?.setLatLng([lat, lng]);
            await handleMapClick(lat, lng);
         });
      };

      // Small delay to ensure DOM is ready
      const timeout = setTimeout(() => {
         initMap();
      }, 100);

      return () => {
         clearTimeout(timeout);
         if (mapRef.current) {
            mapRef.current.remove();
            mapRef.current = null;
            markerRef.current = null;
            circleRef.current = null;
         }
      };
   }, [isOpen, mapCoordinates.lat, mapCoordinates.lng, allowedRadius]);

   // Update marker & circle position when coordinates or radius change
   useEffect(() => {
      if (!mapRef.current) return;

      if (markerRef.current) {
         markerRef.current.setLatLng([mapCoordinates.lat, mapCoordinates.lng]);
      }

      const numericRadius = Number(allowedRadius);
      if (circleRef.current) {
         circleRef.current.setLatLng([mapCoordinates.lat, mapCoordinates.lng]);
         circleRef.current.setRadius(
            Number.isFinite(numericRadius) ? Math.max(0, numericRadius) : 0
         );
      }

      mapRef.current.setView([mapCoordinates.lat, mapCoordinates.lng]);
   }, [mapCoordinates, allowedRadius]);

   const handleSave = () => {
      setShowConfirmModal(true);
   };

   const handleConfirmSave = () => {
      const parsedRadius = Number(allowedRadius);
      const radius = Number.isFinite(parsedRadius)
         ? Math.max(0, parsedRadius)
         : 0;
      onSave(locationName, address, radius, mapCoordinates);
      setShowConfirmModal(false);
      onClose();
   };

   const handleMapClick = async (lat: number, lng: number) => {
      setMapCoordinates({ lat, lng });

      // Reverse geocode using Nominatim (OpenStreetMap's free geocoding service)
      try {
         const response = await apiClient.get(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
            { skipAuth: true, timeHandling: { enabled: false } }
         );
         const data = response.data;
         if (data.display_name) {
            setAddress(data.display_name);
         }
      } catch (error) {
         console.error("Error reverse geocoding:", error);
      }
   };

   const handleUseCurrentLocation = () => {
      if (!navigator.geolocation) {
         toast.error(
            "Location is not supported in this browser.",
            "GPS unavailable"
         );
         return;
      }

      navigator.geolocation.getCurrentPosition(
         async (position) => {
            const { latitude, longitude } = position.coords;
            const newCoords = { lat: latitude, lng: longitude };
            setMapCoordinates(newCoords);

            // Reverse geocode to get address
            try {
               const response = await apiClient.get(
                  `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
                  { skipAuth: true, timeHandling: { enabled: false } }
               );
               const data = response.data;
               if (data.display_name) {
                  setAddress(data.display_name);
               }
            } catch (error) {
               console.error("Error reverse geocoding:", error);
            }
         },
         (error) => {
            console.error("Error getting location:", error);
            if (error.code === error.PERMISSION_DENIED) {
               toast.error(
                  "Please allow location access in your browser settings.",
                  "GPS permission denied"
               );
            } else if (error.code === error.POSITION_UNAVAILABLE) {
               toast.error(
                  "Your GPS position is currently unavailable.",
                  "GPS unavailable"
               );
            } else if (error.code === error.TIMEOUT) {
               toast.error(
                  "Getting your GPS location took too long. Try again.",
                  "GPS timeout"
               );
            } else {
               toast.error("Could not get your current location.", "GPS error");
            }
         },
         {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
         }
      );
   };

   if (!isOpen) return null;

   return (
      <div
         className="fixed inset-0 z-50 flex items-center justify-center bg-overlay/50 backdrop-blur-sm"
         onClick={onClose}>
         {/* Modal Container */}
         <div
            className="relative bg-background border border-border rounded-2xl flex flex-col overflow-hidden w-[440px] h-[600px] shadow-lg"
            onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="flex flex-row items-center relative border-b border-border isolate h-[52px] px-5 py-4 gap-3 pl-5">
               <h2 className="text-sm font-medium text-text-strong leading-5 tracking-tight">
                  {t("companySettings.locationModal.title")}
               </h2>
               <button
                  onClick={onClose}
                  className="absolute right-4 top-4 w-6 h-6 p-0.5 rounded-md hover:bg-bg-weak transition-colors flex items-center justify-center"
                  aria-label="Close">
                  <CloseLine size={20} className="fill-icon-sub" />
               </button>
            </div>

            {/* Content */}
            <div className="flex flex-col items-start overflow-y-auto flex-1 p-4 gap-4">
               {/* Location Name Input */}
               <div className="flex flex-col items-start gap-1 w-full">
                  <label className="text-sm font-medium text-text-strong leading-5 tracking-tight">
                     {t("companySettings.locationModal.locationName")}
                  </label>
                  <input
                     type="text"
                     value={locationName}
                     readOnly
                     placeholder={t(
                        "companySettings.locationModal.placeholders.locationName"
                     )}
                     className="w-full h-10 rounded-[10px] border border-border bg-background text-sm text-text-sub placeholder:text-text-soft focus:outline-none pl-3 pr-3 py-2.5 shadow-subtle"
                  />
               </div>

               {/* Map Container */}
               <div className="relative w-full h-[240px] rounded-xl border border-border overflow-hidden">
                  {/* Leaflet Map */}
                  <link
                     rel="stylesheet"
                     href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/leaflet.css"
                  />
                  <div id="leaflet-map" className="w-full h-full" />

                  {/* Use Current Location Button */}
                  <div className="absolute top-3 right-3 z-1000">
                     <button
                        type="button"
                        onClick={handleUseCurrentLocation}
                        className="flex items-center gap-1 bg-background rounded-lg px-1.5 py-1 shadow-lg hover:bg-bg-weak transition-colors">
                        {/* Location crosshairs icon */}
                        <svg
                           width="16"
                           height="16"
                           viewBox="0 0 16 16"
                           fill="none"
                           xmlns="http://www.w3.org/2000/svg"
                           className="relative">
                           <circle
                              cx="8"
                              cy="8"
                              r="5.5"
                              stroke="currentColor"
                              strokeWidth="1"
                              className="text-icon-sub"
                           />
                           <circle
                              cx="8"
                              cy="8"
                              r="1.5"
                              fill="currentColor"
                              opacity="0.4"
                              className="text-icon-sub"
                           />
                        </svg>
                        <span className="text-text-sub px-1 text-xs leading-4">
                           {t(
                              "companySettings.locationModal.useCurrentLocation"
                           )}
                        </span>
                     </button>
                  </div>

                  {/* Radius legend - mirrors attendance map legend styling */}
                  <div className="absolute bottom-3 right-3 z-1000 bg-background/90 p-2 rounded text-xs shadow-md">
                     <div>
                        🔵{" "}
                        {t("companySettings.locationModal.allowedRadius")} (
                        {allowedRadius}m)
                     </div>
                  </div>

                  {/* Instruction text */}
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-1000">
                     <div className="bg-background/90 backdrop-blur-sm rounded-lg px-3 py-1.5 shadow-lg">
                        <span className="text-text-sub text-xs">
                           {t("companySettings.locationModal.instruction")}
                        </span>
                     </div>
                  </div>
               </div>

               {/* Allowed Radius Section */}
               <div className="flex flex-col gap-2 w-full">
                  <div className="flex items-center gap-3 h-8">
                     <label className="text-sm text-text-strong flex-1 leading-5 tracking-tight">
                        {t("companySettings.locationModal.allowedRadius")}
                     </label>
                     <input
                        type="number"
                        inputMode="numeric"
                        value={allowedRadius}
                        onChange={(e) => setAllowedRadius(e.target.value)}
                        min={0}
                        step={1}
                        className="rounded-[10px] border border-border bg-background text-sm text-text-strong text-center w-20 h-8 px-2 py-1.5 leading-5 tracking-tight shadow-subtle focus:outline-none focus:ring-1 focus:ring-primary"
                     />
                  </div>
                  <p className="text-sm text-text-sub leading-5 tracking-tight">
                     {t("companySettings.locationModal.radiusDescription")}
                  </p>
               </div>
            </div>

            {/* Footer */}
            <div className="flex flex-row items-center border-t border-border h-[68px] px-5 py-4">
               <div className="flex justify-end items-center flex-1 gap-3">
                  <Button
                     variant="secondary"
                     onClick={onClose}
                     className="rounded-xl h-9 px-2 text-sm leading-5 tracking-tight shadow-subtle">
                     {t("common:actions.cancel")}
                  </Button>
                  <Button
                     onClick={handleSave}
                     className="rounded-xl h-9 px-2 text-sm leading-5 tracking-tight">
                     {t("companySettings.locationModal.saveLocation")}
                  </Button>
               </div>
            </div>
         </div>

         <ConfirmModal
            isOpen={showConfirmModal}
            onClose={() => setShowConfirmModal(false)}
            onConfirm={handleConfirmSave}
            title={t("companySettings.locationModal.confirmTitle")}
            description={t("companySettings.locationModal.confirmMessage")}
            confirmText={t("common:actions.confirm")}
            cancelText={t("common:actions.cancel")}
            variant="primary"
            icon="info"
         />
      </div>
   );
}

export default LocationModal;
