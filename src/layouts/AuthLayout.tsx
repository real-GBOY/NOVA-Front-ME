/** @format */

import { Outlet, useLocation, useSearchParams } from "react-router-dom";
import { useMemo } from "react";
import type { CSSProperties, ElementType } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { AuthIcon, CheckCircle } from "@/Icons";
import {
   Card,
   CardContent,
   CardDescription,
   CardHeader,
   CardTitle,
} from "@/designSystem/ui/card";
import { Separator } from "@/designSystem/ui/separator";
import { MAIN_COLORS } from "@/services/constants/COLORS";

type AuthHeader = {
   title: string;
   description: string;
   Icon: ElementType;
};

// Auth flow always renders in light mode, regardless of the app-wide theme
// toggle. Re-declaring the light color tokens here shadows the ones the
// global ColorsProvider writes onto <html>, without touching that shared
// state (the dashboard keeps whatever theme the user picked).
const lightModeVars = Object.fromEntries(
   Object.entries(MAIN_COLORS.light).map(([key, value]) => [`--c-${key}`, value])
) as CSSProperties;
const forcedLightStyle: CSSProperties = { ...lightModeVars, colorScheme: "light" };

const LOGO_SRC = "https://i.postimg.cc/P5qXfsDy/image.png";

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

   return (
      <div
         dir="ltr"
         style={forcedLightStyle}
         className="pixel-grid-bg-light relative flex min-h-screen items-center justify-center p-4 font-vt323">
         <Card className="relative z-1 w-full max-w-[440px] rounded-none! border-[3px]! border-black! bg-white! py-0! shadow-[8px_8px_0_#c4c4c4]">
            {!isLoginLike && !isResetPassword && (
               <>
                  <CardHeader className="items-center text-center gap-3 flex flex-col px-8 pt-8">
                     <div className="w-full flex justify-center">
                        <div className="bg-white border-[3px] border-black h-16 w-16 overflow-hidden flex items-center justify-center">
                           <img
                              src={LOGO_SRC}
                              alt="Logo"
                              className="h-full w-full object-contain"
                           />
                        </div>
                     </div>

                     <div className="flex flex-col gap-3 items-center">
                        <CardTitle className="font-press-start text-lg leading-loose tracking-[2px] text-black uppercase">
                           {header.title}
                        </CardTitle>
                        <CardDescription className="font-vt323! font-normal! text-lg leading-snug text-[#555555]">
                           {header.description}
                        </CardDescription>
                     </div>
                  </CardHeader>
                  <Separator className="bg-black/15!" />
               </>
            )}
            <CardContent className="p-8!">
               <Outlet />
            </CardContent>
         </Card>
         <div className="absolute bottom-11 left-11 right-11 z-1 flex items-center gap-3 text-lg text-[#666666]">
            <p className="font-vt323! font-normal! flex-1">
               © 2025 {t("appName", { ns: "common" })}
            </p>
         </div>
      </div>
   );
}

export default AuthLayout;
