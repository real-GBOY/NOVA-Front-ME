/** @format */

import { useEffect, useState } from "react";
import SettingsSidebar from "./sidebar/SettingsSidebar";
import SettingsContent from "./SettingsContent";
import PageHeader from "@/designSystem/PageHeader";
import HeaderActions from "@/designSystem/HeaderActions";
import Drawer from "@/designSystem/Drawer";
import IconButton from "@/designSystem/IconButton";
import { HamburgerMenu } from "@/Icons";
import { useTranslation } from "@/hooks/useTranslation";

function SettingsMain() {
   const { t } = useTranslation("settings");
   const [isSidebarOpen, setIsSidebarOpen] = useState(false);
   const [isDesktop, setIsDesktop] = useState(() => {
      if (typeof window === "undefined") {
         return false;
      }
      return window.matchMedia("(min-width: 1280px)").matches;
   });

   useEffect(() => {
      if (typeof window === "undefined") {
         return;
      }
      const mediaQuery = window.matchMedia("(min-width: 1280px)");
      const handleChange = (event: MediaQueryListEvent) => {
         setIsDesktop(event.matches);
         // Close sidebar when switching to desktop view
         if (event.matches) {
            setIsSidebarOpen(false);
         }
      };

      setIsDesktop(mediaQuery.matches);
      if (mediaQuery.addEventListener) {
         mediaQuery.addEventListener("change", handleChange);
      } else {
         mediaQuery.addListener(handleChange);
      }

      return () => {
         if (mediaQuery.removeEventListener) {
            mediaQuery.removeEventListener("change", handleChange);
         } else {
            mediaQuery.removeListener(handleChange);
         }
      };
   }, []);

   const headerActions = (
      <div className="flex flex-wrap items-center gap-2">
         {!isDesktop && (
            <IconButton
               Icon={HamburgerMenu}
               ariaLabel="Open settings navigation"
               variant="ghost"
               onClick={() => setIsSidebarOpen(true)}
            />
         )}
         <HeaderActions />
      </div>
   );

   return (
      <div className="settings-page flex w-full min-h-screen bg-background gap-2 flex-col xl:flex-row">
         {isDesktop && (
            <div className="xl:p-2 xl:sticky xl:top-0 xl:h-screen xl:overflow-hidden">
               <SettingsSidebar />
            </div>
         )}

         {!isDesktop && (
            <Drawer
               isOpen={isSidebarOpen}
               onClose={() => setIsSidebarOpen(false)}
               side="left"
               width="r-drawer-w xl:max-w-[360px]"
               className="bg-bg-weak">
               <SettingsSidebar
                  className="h-full bg-bg-weak border-0 rounded-none p-0"
                  onNavigate={() => setIsSidebarOpen(false)}
               />
            </Drawer>
         )}

         <div className="flex-1 min-w-0">
            <div className="flex flex-col h-full flex-1">
               <PageHeader title={t("title")} actions={headerActions} />
               <SettingsContent />
            </div>
         </div>
      </div>
   );
}

export default SettingsMain;
