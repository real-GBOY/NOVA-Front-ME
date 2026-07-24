/** @format */

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Link } from "react-router-dom";
import { useTranslation } from "@/hooks/useTranslation";
import { useLogin } from "@/hooks/auth/auth.mutations";
import { Button } from "@/designSystem/ui/button";
import { Input } from "@/designSystem/ui/input";
import { Label } from "@/designSystem/ui/label";
import { AlertFill, InfoCircle } from "@/Icons";

interface LoginFormData {
   email: string;
   password: string;
}

function LoginForm() {
   const { t } = useTranslation(["auth", "validation"]);
   const loginMutation = useLogin();

   const schema = yup.object({
      email: yup
         .string()
         .required(t("validation:required"))
         .email(t("validation:email")),
      password: yup.string().required(t("validation:required")),
   });

   const {
      register,
      handleSubmit,
      formState: { errors, isSubmitting },
   } = useForm<LoginFormData>({
      resolver: yupResolver(schema),
      defaultValues: {
         email: "jinx@example.com",
         password: "Jinx123!",
      },
   });

   const isLoading = isSubmitting || loginMutation.isPending;

   const onSubmit = async (data: LoginFormData) => {
      try {
         await loginMutation.mutateAsync({
            email: data.email,
            password: data.password,
         });
      } catch (error) {
         // Error is already handled by the mutation's onError
         // This prevents unhandled promise rejection
      }
   };

   return (
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
         <div className="space-y-8">
            <div className="flex flex-col items-center gap-4">
               <div className="flex justify-center mb-2 border-[3px] border-black bg-white p-1">
                  <img
                     src="https://i.postimg.cc/P5qXfsDy/image.png"
                     alt="Logo"
                     className="h-14 w-auto object-contain"
                  />
               </div>
               <div className="space-y-3 w-full">
                  <div>
                     <h2 className="font-press-start text-lg leading-loose tracking-[2px] text-black text-center uppercase">
                        {t("auth:welcomeBack")}
                     </h2>
                     <p className="font-vt323! font-normal! text-lg text-[#555555] mt-1 text-center">
                        {t("auth:enterDetailsToLogin")}
                     </p>
                  </div>
               </div>
            </div>

            <div className="grid gap-2">
               <Label htmlFor="email" className="font-vt323! font-normal! text-lg! text-black!">
                  {t("auth:emailAddress")}
               </Label>
               <Input
                  id="email"
                  type="email"
                  placeholder={t("auth:emailPlaceholder")}
                  className="rounded-none! border-[3px]! border-black! bg-white! font-vt323! font-normal! text-lg! text-black! placeholder:text-[#999999]! focus-visible:ring-0! h-12!"
                  {...register("email")}
               />
               {errors.email && (
                  <p className="text-sm text-danger">{errors.email.message}</p>
               )}
            </div>

            <div className="grid gap-2">
               <div className="flex items-center">
                  <Label htmlFor="password" className="font-vt323! font-normal! text-lg! text-black!">
                     {t("auth:password")}
                  </Label>
                  <Link
                     to="/forgot-password"
                     className="ml-auto inline-block font-vt323! font-normal! text-sm underline-offset-4 hover:underline text-[#555555] hover:text-black transition-colors">
                     {t("auth:forgotPassword")}
                  </Link>
               </div>
               <Input
                  id="password"
                  type="password"
                  placeholder={t("auth:passwordPlaceholder")}
                  className="rounded-none! border-[3px]! border-black! bg-white! font-vt323! font-normal! text-lg! text-black! placeholder:text-[#999999]! focus-visible:ring-0! h-12!"
                  {...register("password")}
               />
               {errors.password && (
                  <p className="text-sm text-danger">
                     {errors.password.message}
                  </p>
               )}
            </div>

            <Button
               type="submit"
               className="w-full rounded-none! border-[3px]! border-black! bg-black! text-white! hover:bg-black/85! font-press-start! text-sm! uppercase! h-12! shadow-[6px_6px_0_#c4c4c4]!"
               disabled={isLoading}>
               {isLoading ? t("auth:loggingIn") : t("auth:login")}
            </Button>

            <div className="flex flex-col gap-3 border-t-[3px] border-black/10 pt-6">
               <div className="flex items-start gap-2 border-[3px] border-warning bg-warning/10 p-3">
                  <AlertFill size={18} className="mt-0.5 shrink-0 fill-warning" />
                  <div className="flex flex-col gap-2 text-sm text-[#333333]">
                     <p className="font-vt323! font-normal!">
                        DEMO MODE: this is a demonstration build running on
                        fictional mock data. No real company, employee, or
                        personal information is shown, to protect the
                        privacy of the live project it is based on.
                     </p>
                     <p dir="rtl" className="font-tajawal">
                        وضع تجريبي: هذا نموذج عرض تجريبي يعمل ببيانات وهمية
                        بالكامل. لا يتم عرض أي بيانات حقيقية لأي شركة أو
                        موظف أو شخص، وذلك حفاظاً على خصوصية المشروع الفعلي
                        الذي يستند إليه.
                     </p>
                  </div>
               </div>

               <div className="flex items-start gap-2 border-[3px] border-[#c4c4c4] bg-black/[0.03] p-3">
                  <InfoCircle size={18} className="mt-0.5 shrink-0 fill-information" />
                  <div className="flex flex-col gap-2 text-sm text-[#333333]">
                     <p className="font-vt323! font-normal!">
                        This system is an all-in-one HR &amp; business
                        management platform: employee records, contracts,
                        attendance &amp; payroll, invoicing, legal case
                        tracking, and internal team communication.
                     </p>
                     <p dir="rtl" className="font-tajawal">
                        هذا النظام عبارة عن منصة متكاملة لإدارة الموارد
                        البشرية والأعمال: سجلات الموظفين، العقود، الحضور
                        والرواتب، الفواتير، متابعة القضايا القانونية،
                        والتواصل الداخلي بين الفرق.
                     </p>
                  </div>
               </div>
            </div>
         </div>
      </form>
   );
}

export default LoginForm;
