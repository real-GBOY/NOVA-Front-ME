/** @format */

import * as yup from "yup";
import type { TFunction } from "i18next";

const parseDateOnly = (value?: string) => {
   if (!value) return undefined;
   const datePart = value.split("T")[0];
   const [year, month, day] = datePart.split("-").map(Number);
   if (!year || !month || !day) return undefined;
   const parsed = new Date(year, month - 1, day);
   return Number.isNaN(parsed.getTime()) ? undefined : parsed;
};

export const createContractSchema = (t: TFunction) =>
   yup.object({
      // Step 1: Assign Member
      contractName: yup
         .string()
         .required(t("validation:contracts.contractNameRequired"))
         .min(2, t("validation:contracts.contractNameMin"))
         .max(100, t("validation:contracts.contractNameMax")),
      memberId: yup.string().required(t("validation:contracts.memberRequired")),
      contractType: yup
         .string()
         .required(t("validation:contracts.contractTypeRequired")),
      startDate: yup
         .string()
         .required(t("validation:contracts.startDateRequired")),
      endDate: yup
         .string()
         .required(t("validation:contracts.endDateRequired"))
         .test(
            "endDate-after-startDate",
            t("validation:contracts.endDateAfterStart"),
            function (value) {
               if (!value) return true;
               const { startDate } = this.parent as { startDate?: string };
               if (!startDate) return true;
               const start = parseDateOnly(startDate);
               const end = parseDateOnly(value);
               if (!start || !end) return false;
               return end.getTime() > start.getTime();
            }
         ),
      attachedDocuments: yup
         .array()
         .of(
            yup.object({
               // Required fields for API
               fileId: yup.number().required(),
               token: yup.string().required(),
               purpose: yup.string().required(),
               // UI fields (not sent to API)
               fileName: yup.string().optional(),
               fileSize: yup.number().optional(),
               fileType: yup.string().optional(),
               fileUrl: yup.string().optional(),
               key: yup.string().optional(),
               progress: yup.number().optional(),
               isUploading: yup.boolean().optional(),
               error: yup.string().optional(),
            })
         )
         .optional(),

      // Step 2: Compensation & Assets
      baseSalary: yup.string().optional(),
      salaryCurrency: yup.string().optional(),
      salaryCycle: yup.string().optional(),
      overtimeRate: yup.string().optional(),
      overtimeCurrency: yup.string().optional(),
      assets: yup.array().of(yup.string()).optional(),

      // Step 3: Policy & Limits
      noticePeriod: yup.string().optional(),
      sickLeave: yup.string().optional(),
      casualLeave: yup.string().optional(),
      annualLeave: yup.string().optional(),
      absenceLimit: yup.string().optional(),
   });

// Legacy export for backwards compatibility
export const contractSchema = yup.object({
   // Step 1: Assign Member
   contractName: yup
      .string()
      .required("Contract name is required")
      .min(2, "Contract name must be at least 2 characters")
      .max(100, "Contract name must be less than 100 characters"),
   memberId: yup.string().required("Member is required"),
   contractType: yup.string().required("Contract type is required"),
   startDate: yup.string().required("Start date is required"),
   endDate: yup
      .string()
      .required("End date is required")
      .test(
         "endDate-after-startDate",
         "End date must be after start date",
         function (value) {
            if (!value) return true;
            const { startDate } = this.parent as { startDate?: string };
            if (!startDate) return true;
            const start = parseDateOnly(startDate);
            const end = parseDateOnly(value);
            if (!start || !end) return false;
            return end.getTime() > start.getTime();
         }
      ),
   attachedDocuments: yup
      .array()
      .of(
         yup.object({
            // Required fields for API
            fileId: yup.number().required(),
            token: yup.string().required(),
            purpose: yup.string().required(),
            // UI fields (not sent to API)
            fileName: yup.string().optional(),
            fileSize: yup.number().optional(),
            fileType: yup.string().optional(),
            fileUrl: yup.string().optional(),
            key: yup.string().optional(),
            progress: yup.number().optional(),
            isUploading: yup.boolean().optional(),
            error: yup.string().optional(),
         })
      )
      .optional(),

   // Step 2: Compensation & Assets
   baseSalary: yup.string().optional(),
   salaryCurrency: yup.string().optional(),
   salaryCycle: yup.string().optional(),
   overtimeRate: yup.string().optional(),
   overtimeCurrency: yup.string().optional(),
   assets: yup.array().of(yup.string()).optional(),

   // Step 3: Policy & Limits
   noticePeriod: yup.string().optional(),
   sickLeave: yup.string().optional(),
   casualLeave: yup.string().optional(),
   annualLeave: yup.string().optional(),
   absenceLimit: yup.string().optional(),
});

export type ContractFormData = yup.InferType<typeof contractSchema>;
