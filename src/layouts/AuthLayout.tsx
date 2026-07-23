/** @format */

import { Outlet, useLocation, useSearchParams } from "react-router-dom";
import { useMemo } from "react";
import type { ElementType } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { AuthIcon, CheckCircle } from "@/Icons";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import {
   Card,
   CardContent,
   CardDescription,
   CardHeader,
   CardTitle,
} from "@/designSystem/ui/card";
import { Separator } from "@/designSystem/ui/separator";
import FloatingLines from "@/designSystem/FloatingLines";

type AuthHeader = {
   title: string;
   description: string;
   Icon: ElementType;
};

function AuthLayout() {
   const { t } = useTranslation("auth");
   const { pathname } = useLocation();
   const [searchParams] = useSearchParams();
   const email = searchParams.get("email") || "";
   const isLogin = pathname === "/login";
   const isLoginLike = isLogin || pathname === "/forgot-password" || pathname === "/verification-code";
   const isResetPassword = pathname === "/reset-password";

   const header = useMemo<AuthHeader>(() => {
      switch (pathname) {
         case "/forgot-password":
            return {
               title: t("forgotPasswordTitle"),
               description: t("forgotPasswordDescription"),
               Icon: AuthIcon,
            };
         case "/verification-code":
            return {
               title: t("enterVerificationCode"),
               description: t("verificationCodeDescription", {
                  email: email || "your email",
               }),
               Icon: CheckCircle,
            };
         case "/complete-password":
            return {
               title: t("createPassword"),
               description: t("createPasswordDescription"),
               Icon: AuthIcon,
            };
         case "/reset-password":
            return {
               title: t("resetPasswordTitle"),
               description: t("resetPasswordDescription"),
               Icon: AuthIcon,
            };
         case "/login":
         default:
            return {
               title: t("welcomeBack"),
               description: t("enterDetailsToLogin"),
               Icon: AuthIcon,
            };
      }
   }, [pathname, t, email]);

   const cardBase =
      "w-full max-w-[440px] rounded-40 z-1 backdrop-blur-xl";
   const cardClass = isLoginLike
      ? `${cardBase} bg-background/80 border border-border/20 shadow-[0_24px_70px_-24px_rgba(0,0,0,0.7)] backdrop-blur-2xl`
      : `${cardBase} border border-transparent bg-background shadow-[0_16px_40px_-20px_rgba(0,0,0,0.16)] p-2`;

   return (
      <div className="min-h-screen flex items-center justify-center p-4 relative">
         <div className="w-screen h-screen z-0 absolute inset-0">
            <FloatingLines
               enabledWaves={["top", "middle", "bottom"]}
               // Array - specify line count per wave; Number - same count for all waves
               lineCount={[10, 15, 20]}
               // Array - specify line distance per wave; Number - same distance for all waves
               lineDistance={[8, 6, 4]}
               bendRadius={5.0}
               bendStrength={-0.5}
               interactive={true}
               parallax={true}
            />
         </div>

         <Card className={cardClass}>
            {!isLoginLike && !isResetPassword && (
               <>
                  <CardHeader className="items-center text-center gap-2 flex flex-col">
                     <div className="w-full flex justify-center">
                        <div className="bg-background border border-border rounded-full shadow-subtle h-16 w-16 overflow-hidden flex items-center justify-center">
                           <img
                              src="/icons/2 (1).png"
                              alt="Logo"
                              className="h-full w-full object-contain"
                           />
                        </div>
                     </div>

                     <div className="flex flex-col gap-1 items-center">
                        <CardTitle className="text-2xl font-medium text-text-strong leading-8">
                           {header.title}
                        </CardTitle>
                        <CardDescription className="text-base text-text-sub leading-6">
                           {header.description}
                        </CardDescription>
                     </div>
                  </CardHeader>
                  <Separator />
               </>
            )}
            <CardContent className={isLoginLike ? "p-8" : "pt-6"}>
               <Outlet />
            </CardContent>
         </Card>
         <div className="absolute bottom-11 left-11 right-11 flex items-center gap-3 text-text-main">
            <p className="text-sm flex-1">
               © 2025 {t("appName", { ns: "common" })}
            </p>
            <LanguageSwitcher
               variant="select"
               className="[&_select]:bg-background/90 [&_select]:text-text-strong [&_select]:border-border [&_select]:shadow-subtle [&_select]:backdrop-blur-sm"
            />
         </div>
      </div>
   );
}

export default AuthLayout;
