/** @format */

import * as yup from "yup";

const toStartOfDay = (date: Date) =>
   new Date(date.getFullYear(), date.getMonth(), date.getDate());

const parseDateValue = (value: unknown) => {
   if (!value) return null;
   if (value instanceof Date) {
      return Number.isNaN(value.getTime()) ? null : value;
   }
   const parsed = new Date(String(value));
   return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const isNotFutureDate = (value: unknown) => {
   const date = parseDateValue(value);
   if (!date) return true;
   const today = toStartOfDay(new Date());
   return toStartOfDay(date).getTime() <= today.getTime();
};

const isOnOrAfterDate = (value: unknown, compareTo: unknown) => {
   const date = parseDateValue(value);
   const compareDate = parseDateValue(compareTo);
   if (!date || !compareDate) return true;
   return toStartOfDay(date).getTime() >= toStartOfDay(compareDate).getTime();
};

// Step 1: Basic Information Schema
export const stepBasicInfoSchema = yup.object({
   firstName: yup
      .string()
      .required("First name is required")
      .min(2, "First name must be at least 2 characters")
      .max(50, "First name must be less than 50 characters"),
   lastName: yup
      .string()
      .required("Last name is required")
      .min(2, "Last name must be at least 2 characters")
      .max(50, "Last name must be less than 50 characters"),
   email: yup
      .string()
      .required("Email address is required")
      .email("Please enter a valid email address")
      .test(
         "is-unique-email",
         "This email is already registered",
         async function (value) {
            if (!value) return true;

            try {
               const { employeeService } = await import(
                  "@/services/employeeService"
               );
               const response = await employeeService.checkUnique({
                  email: value,
               });
               return response.email?.is_unique ?? true;
            } catch (error) {
               // If the API call fails, we'll allow the validation to pass
               // to avoid blocking the user due to network issues
               console.error("Email uniqueness check failed:", error);
               return true;
            }
         }
      ),
   phoneNumber: yup.string().required("Phone number is required"),
   country: yup.string().required("Country is required"),
   dateOfBirth: yup
      .string()
      .required("Date of birth is required")
      .test(
         "is-valid-date",
         "Date must be a valid date",
         (value) => !value || !isNaN(Date.parse(value))
      ),
   gender: yup
      .string()
      .oneOf(["Male", "Female", ""], "Please select a valid gender")
      .optional(),
   maritalStatus: yup.string().optional(),
   nationalId: yup
      .string()
      .required()
      .test(
         "is-unique-national-id",
         "This National ID / Passport Number is already registered",
         async function (value) {
            if (!value) return true;

            try {
               const { employeeService } = await import(
                  "@/services/employeeService"
               );
               const response = await employeeService.checkUnique({
                  national_id: value,
               });
               return response.national_id?.is_unique ?? true;
            } catch (error) {
               // If the API call fails, we'll allow the validation to pass
               // to avoid blocking the user due to network issues
               console.error("National ID uniqueness check failed:", error);
               return true;
            }
         }
      ),
   address: yup.string().optional(),
   documents: yup
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
   profileImage: yup
      .object({
         // Required fields for API
         fileId: yup.number().optional(),
         token: yup.string().optional(),
         purpose: yup.string().optional(),
         // UI fields (not sent to API)
         fileName: yup.string().optional(),
         fileSize: yup.number().optional(),
         fileType: yup.string().optional(),
         fileUrl: yup.string().optional(),
         key: yup.string().optional(),
      })
      .optional()
      .nullable(),
});

// Step 2: Work Information Schema
export const stepWorkInfoSchema = yup.object({
   jobTitle: yup.string().required("Job title is required"),
   team_ids: yup
      .array()
      .of(yup.string())
      .min(1, "At least one team is required"),
   role: yup.string().required("Role is required"),
   manager: yup.string().optional(),
   shiftId: yup.number().nullable().optional(),
   employmentType: yup.string().required("Employment type is required"),
   startDate: yup
      .string()
      .required("Start date is required")
      .test(
         "is-valid-date",
         "Date must be a valid date",
         (value) => !value || !isNaN(Date.parse(value))
      )
      .test("not-in-future", "Start date cannot be in the future", (value) =>
         isNotFutureDate(value)
      ),
   hoursPerWeek: yup
      .string()
      .required("Hours per week is required")
      .matches(/^\d+$/, "Hours per week must be a number")
      .test(
         "is-valid-hours",
         "Hours per week must be between 1 and 168",
         (value) => {
            if (!value) return true;
            const hours = parseInt(value, 10);
            return hours >= 1 && hours <= 168;
         }
      ),
   probationPeriod: yup.string().optional(),
});

// Step 3: Residency Information Schema
export const stepResidencyInfoSchema = yup.object({
   residencyStatus: yup.string().required("Residency status is required"),
   residencyCountry: yup.string().required("Country of residency is required"),
   residencyType: yup.string().required("Residency/Visa type is required"),
   residencyNumber: yup.string().required("Residency/Visa number is required"),
   residencyIssueDate: yup
      .string()
      .required("Issue date is required")
      .test(
         "is-valid-date",
         "Date must be a valid date",
         (value) => !value || !isNaN(Date.parse(value))
      )
      .test("not-in-future", "Issue date cannot be in the future", (value) =>
         isNotFutureDate(value)
      ),
   residencyExpiryDate: yup
      .string()
      .required("Expiry date is required")
      .test(
         "is-valid-date",
         "Date must be a valid date",
         (value) => !value || !isNaN(Date.parse(value))
      )
      .test(
         "expiry-after-issue",
         "Expiry date cannot be before issue date",
         function (value) {
            const { residencyIssueDate } = this.parent as {
               residencyIssueDate?: unknown;
            };
            return isOnOrAfterDate(value, residencyIssueDate);
         }
      ),
   residencyDocument: yup
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
      .optional()
      .nullable(),
});

// Full member schema (for final validation or when all steps are complete)
export const memberSchema = yup.object({
   firstName: yup
      .string()
      .required("First name is required")
      .min(2, "First name must be at least 2 characters")
      .max(50, "First name must be less than 50 characters"),
   lastName: yup
      .string()
      .required("Last name is required")
      .min(2, "Last name must be at least 2 characters")
      .max(50, "Last name must be less than 50 characters"),
   email: yup
      .string()
      .required("Email address is required")
      .email("Please enter a valid email address"),
   phoneNumber: yup.string().required("Phone number is required"),
   country: yup.string().required("Country is required"),
   dateOfBirth: yup
      .string()
      .required("Date of birth is required")
      .test(
         "is-valid-date",
         "Date must be a valid date",
         (value) => !value || !isNaN(Date.parse(value))
      ),
   gender: yup
      .string()
      .oneOf(["Male", "Female", ""], "Please select a valid gender")
      .optional(),
   maritalStatus: yup.string().optional(),
   nationalId: yup.string().optional(),
   address: yup.string().optional(),
   jobTitle: yup.string().required("Job title is required"),
   team_ids: yup
      .array()
      .of(yup.string())
      .min(1, "At least one team is required"),
   role: yup.string().required("Role is required"),
   manager: yup.string().optional(),
   shiftId: yup.number().nullable().optional(),
   employmentType: yup.string().required("Employment type is required"),
   startDate: yup
      .string()
      .required("Start date is required")
      .test(
         "is-valid-date",
         "Date must be a valid date",
         (value) => !value || !isNaN(Date.parse(value))
      )
      .test("not-in-future", "Start date cannot be in the future", (value) =>
         isNotFutureDate(value)
      ),
   hoursPerWeek: yup
      .string()
      .required("Hours per week is required")
      .matches(/^\d+$/, "Hours per week must be a number")
      .test(
         "is-valid-hours",
         "Hours per week must be between 1 and 168",
         (value) => {
            if (!value) return true;
            const hours = parseInt(value, 10);
            return hours >= 1 && hours <= 168;
         }
      ),
   probationPeriod: yup.string().optional(),
   salary: yup.string().optional(),
   contractType: yup.string().optional(),
   documents: yup
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
   profileImage: yup
      .object({
         // Required fields for API
         fileId: yup.number().optional(),
         token: yup.string().optional(),
         purpose: yup.string().optional(),
         // UI fields (not sent to API)
         fileName: yup.string().optional(),
         fileSize: yup.number().optional(),
         fileType: yup.string().optional(),
         fileUrl: yup.string().optional(),
         key: yup.string().optional(),
      })
      .optional()
      .nullable(),
   // Residency Fields
   residencyStatus: yup.string().required("Residency status is required"),
   residencyCountry: yup.string().required("Country of residency is required"),
   residencyType: yup.string().required("Residency/Visa type is required"),
   residencyNumber: yup.string().required("Residency/Visa number is required"),
   residencyIssueDate: yup
      .string()
      .required("Issue date is required")
      .test(
         "is-valid-date",
         "Date must be a valid date",
         (value) => !value || !isNaN(Date.parse(value))
      )
      .test("not-in-future", "Issue date cannot be in the future", (value) =>
         isNotFutureDate(value)
      ),
   residencyExpiryDate: yup
      .string()
      .required("Expiry date is required")
      .test(
         "is-valid-date",
         "Date must be a valid date",
         (value) => !value || !isNaN(Date.parse(value))
      )
      .test(
         "expiry-after-issue",
         "Expiry date cannot be before issue date",
         function (value) {
            const { residencyIssueDate } = this.parent as {
               residencyIssueDate?: unknown;
            };
            return isOnOrAfterDate(value, residencyIssueDate);
         }
      ),
   residencyDocument: yup
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
      .optional()
      .nullable(),
});

export type MemberFormData = yup.InferType<typeof memberSchema>;
