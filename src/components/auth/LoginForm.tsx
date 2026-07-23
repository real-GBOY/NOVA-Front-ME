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
         email: "",
         password: "",
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
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
         <div className="space-y-6">
            <div className="flex flex-col items-center gap-4">
               <div className="flex justify-center mb-2">
                  <img
                     src="https://i.postimg.cc/FRZj99kX/2.png"
                     alt="Logo"
                     className="h-16 w-auto object-contain rounded-xl"
                  />
               </div>
               <div className="space-y-2 w-full">
                  <div>
                     <h2 className="text-2xl font-semibold text-text-main text-center">
                        {t("auth:welcomeBack")}
                     </h2>
                     <p className="text-sm text-text-main mt-1 text-center">
                        {t("auth:enterDetailsToLogin")}
                     </p>
                  </div>
               </div>
            </div>

            <div className="grid gap-2">
               <Label htmlFor="email" className="text-text-main">
                  {t("auth:emailAddress")}
               </Label>
               <Input
                  id="email"
                  type="email"
                  placeholder={t("auth:emailPlaceholder")}
                  className="bg-background/30 border-border text-text-strong/80 focus-visible:ring-0"
                  {...register("email")}
               />
               {errors.email && (
                  <p className="text-sm text-danger">{errors.email.message}</p>
               )}
            </div>

            <div className="grid gap-2">
               <div className="flex items-center">
                  <Label htmlFor="password" className="text-text-main">
                     {t("auth:password")}
                  </Label>
                  <Link
                     to="/forgot-password"
                     className="ml-auto inline-block text-sm underline-offset-4 hover:underline text-primary  hover:text-primary/80 transition-colors ">
                     {t("auth:forgotPassword")}
                  </Link>
               </div>
               <Input
                  id="password"
                  type="password"
                  placeholder={t("auth:passwordPlaceholder")}
                  className="bg-background/30 text-text-strong/80 border-border border"
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
               className="w-full text-text-main"
               disabled={isLoading}>
               {isLoading ? t("auth:loggingIn") : t("auth:login")}
            </Button>
         </div>
      </form>
   );
}

export default LoginForm;
