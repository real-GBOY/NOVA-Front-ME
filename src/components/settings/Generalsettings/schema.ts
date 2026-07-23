/** @format */

import * as yup from "yup";
import { TFunction } from "i18next";
import type { ProfileImageValue } from "./types";

export const getGeneralSettingsSchema = (t: TFunction) =>
   yup.object({
      firstName: yup
         .string()
         .required(t("validation.required"))
         .min(2, t("validation.minLength", { min: 2 }))
         .max(50, t("validation.maxLength", { max: 50 })),
      lastName: yup
         .string()
         .required(t("validation.required"))
         .min(2, t("validation.minLength", { min: 2 }))
         .max(50, t("validation.maxLength", { max: 50 })),
      email: yup
         .string()
         .required(t("validation.required"))
         .email(t("validation.email")),
      phoneNumber: yup.string().required(t("validation.required")),
      language: yup.string().required(t("validation.required")),
      currentPassword: yup
         .string()
         .nullable()
         .optional()
         .test(
            "len",
            t("validation.passwordLength"),
            (val) => !val || val.length >= 8
         ),
      newPassword: yup
         .string()
         .nullable()
         .optional()
         .test(
            "len",
            t("validation.passwordLength"),
            (val) => !val || val.length >= 8
         ),
      confirmNewPassword: yup
         .string()
         .nullable()
         .optional()
         .oneOf([yup.ref("newPassword")], t("validation.passwordMatch")),
      profileImage: yup.mixed<ProfileImageValue>().nullable().optional(),
   });

export type GeneralSettingsFormData = yup.InferType<ReturnType<typeof getGeneralSettingsSchema>>;
