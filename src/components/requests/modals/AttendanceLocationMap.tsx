import { useEffect, useRef } from "react";
import type { AttendanceDetailResponse } from "@/types/requests";

type AttendanceLocationMapProps = {
   details?: AttendanceDetailResponse | null;
   isOpen: boolean;
   mapId: string;
   heightClassName?: string;
};

function AttendanceLocationMap({
   details,
   isOpen,
   mapId,
   heightClassName = "h-[300px]",
}: AttendanceLocationMapProps) {
   const mapRef = useRef<any>(null);

   useEffect(() => {
      if (!isOpen || !details) return;

      const initMap = async () => {
         const L = (await import("leaflet")).default;

         delete (L.Icon.Default.prototype as any)._getIconUrl;
         L.Icon.Default.mergeOptions({
            iconRetinaUrl:
               "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
            iconUrl:
               "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
            shadowUrl:
               "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
         });

         const mapContainer = document.getElementById(mapId);
         if (!mapContainer) return;

         if (mapRef.current) {
            mapRef.current.remove();
            mapRef.current = null;
         }

         const checkInLat = details.check_in.latitude;
         const checkInLng = details.check_in.longitude;
         const officeLat = details.location?.latitude;
         const officeLng = details.location?.longitude;
         const radius = details.location?.radius_meters;
         const officeName = details.location?.name;

         const defaultLat = 25.2048;
         const defaultLng = 55.2708;

         const map = L.map(mapId);
         mapRef.current = map;

         L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution:
               '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
         }).addTo(map);

         const bounds = L.latLngBounds([]);
         let hasPoints = false;

         if (checkInLat != null && checkInLng != null) {
            L.marker([checkInLat, checkInLng])
               .addTo(map)
               .bindPopup("User Check-in")
               .openPopup();
            bounds.extend([checkInLat, checkInLng]);
            hasPoints = true;
         }

         if (officeLat != null && officeLng != null && radius != null) {
            L.circle([officeLat, officeLng], {
               color: "blue",
               fillColor: "#3085d6",
               fillOpacity: 0.1,
               radius: radius,
            })
               .addTo(map)
               .bindPopup(officeName || "Office Zone");

            L.circleMarker([officeLat, officeLng], {
               radius: 5,
               color: "blue",
            }).addTo(map);

            bounds.extend([officeLat, officeLng]);
            hasPoints = true;
         }

         if (hasPoints) {
            try {
               map.fitBounds(bounds, { padding: [50, 50] });
            } catch {
               map.setView(
                  [officeLat || defaultLat, officeLng || defaultLng],
                  14
               );
            }
         } else {
            map.setView([defaultLat, defaultLng], 12);
         }
      };

      const timeout = setTimeout(() => {
         initMap();
      }, 100);

      return () => {
         clearTimeout(timeout);
         if (mapRef.current) {
            mapRef.current.remove();
            mapRef.current = null;
         }
      };
   }, [details, isOpen, mapId]);

   return (
      <div
         className={`w-full ${heightClassName} rounded-xl overflow-hidden relative border border-border`}>
         {details?.check_in?.latitude && details?.check_in?.longitude ? (
            <>
               <link
                  rel="stylesheet"
                  href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/leaflet.css"
               />
               <div id={mapId} className="w-full h-full" />
               <div className="absolute bottom-2 right-2 z-[1000] bg-background/90 p-2 rounded text-xs shadow-md">
                  <div>
                     🔵 Office Radius ({details.location?.radius_meters ?? 0}m)
                  </div>
                  <div className="flex items-center gap-1">
                     <span className="w-2 h-2 rounded-full bg-information" />
                     Check-in Point
                  </div>
               </div>
            </>
         ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-50 text-text-sub">
               No location data available
            </div>
         )}
      </div>
   );
}

export default AttendanceLocationMap;
