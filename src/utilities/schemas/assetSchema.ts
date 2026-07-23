/** @format */

import * as yup from "yup";
import { TFunction } from "i18next";

export const getAssetSchema = (t: TFunction) =>
   yup.object({
      name: yup
         .string()
         .required(t("settings:assets.addWizard.validation.nameRequired"))
         .min(2, t("settings:assets.addWizard.validation.nameMin"))
         .max(50, t("settings:assets.addWizard.validation.nameMax")),
      category: yup
         .string()
         .required(t("settings:assets.addWizard.validation.categoryRequired")),
      serial: yup
         .string()
         .required(t("settings:assets.addWizard.validation.serialRequired")),
      condition: yup
         .string()
         .required(t("settings:assets.addWizard.validation.conditionRequired")),
      image: yup
         .mixed()
         .test(
            "fileRequired",
            t("settings:assets.addWizard.validation.imageRequired"),
            (value: any) => {
               // Check if image object exists and has required fields
               return value && value.fileUrl;
            }
         )
         .required(t("settings:assets.addWizard.validation.imageRequired")),
   });
