/** @format */

import { Outlet, useLocation } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import MainSidebar from "@/components/MainSidebar";
import PageHeader from "@/designSystem/PageHeader";
import HeaderActions from "@/designSystem/HeaderActions";
import Drawer from "@/designSystem/Drawer";
import IconButton from "@/designSystem/IconButton";
import { HamburgerMenu } from "@/Icons";

function DashboardLayout() {
   const location = useLocation();
   const { t } = useTranslation("common");

   // Map routes to page titles using translations
   const pageTitle = useMemo(() => {
      const pathname = location.pathname;
      if (pathname.startsWith("/dashboard/members/profile"))
         return t("nav.profile");
      if (pathname.startsWith("/dashboard/members")) return t("nav.members");
      if (pathname.startsWith("/dashboard/contracts"))
         return t("nav.contracts");
      if (pathname.startsWith("/dashboard/requests")) return t("nav.requests");
      if (pathname.startsWith("/dashboard/reports")) return t("nav.reports");
      if (pathname.startsWith("/dashboard/vouchers")) return t("nav.vouchers");
      if (pathname.startsWith("/dashboard/legal-cases"))
         return t("nav.legalCases");
      if (pathname.startsWith("/dashboard/loans-advances"))
         return t("nav.loansAdvances");
      if (pathname.startsWith("/dashboard/messages"))
         return t("nav.communication");
      if (pathname.startsWith("/dashboard/help-support"))
         return t("nav.helpSupport");
      if (pathname.startsWith("/dashboard/invoices"))
         return t("nav.loansAdvances");
      if (pathname.startsWith("/dashboard/payrolls")) return t("nav.payrolls");
      if (pathname === "/dashboard") return t("nav.dashboard");
      return t("nav.dashboard");
   }, [location.pathname, t]);
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

   useEffect(() => {
      setIsSidebarOpen(false);
   }, [location.pathname]);
   useEffect(() => {
      if (isDesktop) {
         setIsSidebarOpen(false);
      }
   }, [isDesktop]);

   const headerActions = (
      <div className="flex flex-wrap items-center gap-2">
         {!isDesktop && (
            <IconButton
               Icon={HamburgerMenu}
               ariaLabel="Open navigation"
               variant="ghost"
               onClick={() => setIsSidebarOpen(true)}
            />
         )}
         <HeaderActions />
      </div>
   );

   return (
      <div className="main-page flex w-full flex-col bg-background overflow-hidden min-h-screen xl:flex-row xl:h-screen">
         {isDesktop && (
            <div className="xl:p-2 xl:sticky xl:top-0 xl:h-screen xl:overflow-hidden">
               <MainSidebar />
            </div>
         )}

         {!isDesktop && (
            <Drawer
               isOpen={isSidebarOpen}
               onClose={() => setIsSidebarOpen(false)}
               side="left"
               width="r-drawer-w xl:max-w-[360px]"
               className="bg-bg-weak">
               <MainSidebar
                  className="h-full bg-bg-weak border-0 rounded-none"
                  onNavigate={() => setIsSidebarOpen(false)}
               />
            </Drawer>
         )}

         <div className="flex-1 min-w-0 flex flex-col h-screen">
            <div className="flex flex-1 min-w-0 flex-col bg-background overflow-hidden rounded-none md:rounded-xl xl:rounded-2xl xl:h-full">
               <PageHeader title={pageTitle} actions={headerActions} />
               <div className="mx-4 md:mx-5 xl:mx-6 h-px bg-border" />
               <div className="flex-1 overflow-y-auto min-h-0 r-px-sm xl:px-6 r-py-sm xl:py-6">
                  <Outlet />
               </div>
            </div>
         </div>
      </div>
   );
}

export default DashboardLayout;
