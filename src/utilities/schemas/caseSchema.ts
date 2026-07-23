/** @format */

import * as yup from "yup";
import type { TFunction } from "i18next";

export const createCaseBasicsSchema = (t: TFunction) =>
   yup.object({
      title: yup
         .string()
         .required(t("validation:legalCases.titleRequired"))
         .max(255, t("validation:legalCases.titleMax")),
      case_type_id: yup
         .number()
         .nullable()
         .transform((val) => (isNaN(val) ? undefined : val))
         .required(t("validation:legalCases.caseTypeRequired"))
         .positive(t("validation:legalCases.caseTypePositive")),
      case_number: yup
         .string()
         .max(50, t("validation:legalCases.caseNumberMax"))
         .optional(),
      client_name: yup
         .string()
         .required(t("validation:legalCases.clientNameRequired"))
         .max(255, t("validation:legalCases.clientNameMax")),
      lawyer_id: yup
         .number()
         .nullable()
         .transform((val) => (isNaN(val) ? undefined : val))
         .positive(t("validation:legalCases.lawyerIdPositive"))
         .optional(),
      status: yup
         .string()
         .required(t("validation:legalCases.statusRequired"))
         .oneOf(
            ["Open", "In Progress", "Closed", "On Hold", "Cancelled"],
            t("validation:legalCases.invalidStatus")
         )
         .default("Open"),
      start_date: yup.string().optional(),
      end_date: yup.string().optional(),
      people: yup
         .array()
         .of(
            yup.object({
               employee_id: yup
                  .number()
                  .required(t("validation:legalCases.employeeIdRequired"))
                  .positive(t("validation:legalCases.employeeIdPositive")),
               role: yup
                  .string()
                  .max(100, t("validation:legalCases.roleMax"))
                  .optional(),
            })
         )
         .optional(),
      files: yup.array().optional(), // validated in UI logic or separate step
   });

const createCaseSummarySchema = (t: TFunction) =>
   yup.object({
      summary: yup
         .string()
         .required(t("validation:legalCases.summaryRequired"))
         .max(200, t("validation:legalCases.summaryMax")),
   });

export const createCaseSchema = (t: TFunction) =>
   createCaseBasicsSchema(t).concat(createCaseSummarySchema(t));

// Legacy exports for backwards compatibility
export const caseBasicsSchema = yup.object({
   title: yup
      .string()
      .required("Title is required")
      .max(255, "Title must be less than 255 characters"),
   case_type_id: yup
      .number()
      .nullable()
      .transform((val) => (isNaN(val) ? undefined : val))
      .required("Case Type is required")
      .positive("Case Type ID must be a positive number"),
   case_number: yup
      .string()
      .max(50, "Case number must be less than 50 characters")
      .optional(),
   client_name: yup
      .string()
      .required("Client Name is required")
      .max(255, "Client name must be less than 255 characters"),
   lawyer_id: yup
      .number()
      .nullable()
      .transform((val) => (isNaN(val) ? undefined : val))
      .positive("Lawyer ID must be a positive number")
      .optional(),
   status: yup
      .string()
      .required("Status is required")
      .oneOf(
         ["Open", "In Progress", "Closed", "On Hold", "Cancelled"],
         "Invalid status"
      )
      .default("Open"),
   start_date: yup.string().optional(),
   end_date: yup.string().optional(),
   people: yup
      .array()
      .of(
         yup.object({
            employee_id: yup
               .number()
               .required("Employee ID is required")
               .positive(),
            role: yup
               .string()
               .max(100, "Role must be less than 100 characters")
               .optional(),
         })
      )
      .optional(),
   files: yup.array().optional(), // validated in UI logic or separate step
});

const caseSummarySchema = yup.object({
   summary: yup
      .string()
      .required("Case summary is required")
      .max(200, "Case summary must be less than 200 characters"),
});

export const caseSchema = caseBasicsSchema.concat(caseSummarySchema);

export type CaseFormData = yup.InferType<typeof caseSchema>;
