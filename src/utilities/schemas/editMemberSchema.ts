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

// Create edit member schemas with custom validations
export const createEditMemberSchema = (
   employeeId: string | number,
   originalEmail?: string,
   originalNationalId?: string
) => {
   // Step 1: Basic Information Schema for Edit
   const stepBasicInfoSchema = yup.object({
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
            "is-unique-email-edit",
            "This email is already registered to another employee",
            async function (value) {
               if (!value) return true;
               
               // Skip uniqueness check if email hasn't changed
               if (originalEmail && value === originalEmail) {
                  return true;
               }

               try {
                  const { employeeService } = await import(
                     "@/services/employeeService"
                  );
                  const response = await employeeService.checkUnique({
                     email: value,
                     exclude_employee_id: employeeId,
                  });
                  return response.email?.is_unique ?? true;
               } catch (error) {
                  console.error("Email uniqueness check failed:", error);
                  return true;
               }
            }
         ),
      phoneNumber: yup
         .string()
         .required("Phone number is required")
         .min(8, "Phone number must be at least 8 characters")
         .max(20, "Phone number must be less than 20 characters"),
      country: yup.string().required("Country is required"),
      dateOfBirth: yup
         .string()
         .required("Date of birth is required")
         .test(
            "is-valid-date",
            "Date must be a valid date",
            (value) => !value || !isNaN(Date.parse(value))
         )
         .test(
            "is-not-future",
            "Date of birth cannot be in the future",
            (value) => isNotFutureDate(value)
         )
         .test(
            "is-old-enough",
            "Employee must be at least 18 years old",
            (value) => {
               if (!value) return true;
               const date = parseDateValue(value);
               if (!date) return true;
               const today = new Date();
               const age = today.getFullYear() - date.getFullYear();
               const monthDiff = today.getMonth() - date.getMonth();
               const dayDiff = today.getDate() - date.getDate();
               const actualAge =
                  monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)
                     ? age - 1
                     : age;
               return actualAge >= 18;
            }
         ),
      gender: yup
         .string()
         .oneOf(["Male", "Female", ""], "Please select a valid gender")
         .optional(),
      maritalStatus: yup
         .string()
         .oneOf(
            ["Single", "Married", "Divorced", "Widowed", ""],
            "Please select a valid marital status"
         )
         .optional(),
      nationalId: yup.string().optional(),
      address: yup
         .string()
         .max(200, "Address must be less than 200 characters")
         .optional(),
      documents: yup
         .array()
         .of(
            yup.object({
               fileId: yup.number().required(),
               token: yup.string().required(),
               purpose: yup.string().required(),
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
            fileId: yup.number().optional(),
            token: yup.string().optional(),
            purpose: yup.string().optional(),
            fileName: yup.string().optional(),
            fileSize: yup.number().optional(),
            fileType: yup.string().optional(),
            fileUrl: yup.string().optional(),
            key: yup.string().optional(),
         })
         .optional()
         .nullable(),
   });

   // Step 2: Work Information Schema for Edit
   const stepWorkInfoSchema = yup.object({
      jobTitle: yup.string().required("Job title is required"),
      team_ids: yup
         .array()
         .of(yup.string())
         .min(1, "At least one team is required")
         .required("At least one team is required"),
      role: yup.string().required("Role is required"),
      manager: yup.string().optional(),
      shiftId: yup.number().nullable().optional(),
      employmentType: yup
         .string()
         .required("Employment type is required")
         .oneOf(
            ["full_time", "part_time", "contract", "intern", "temporary"],
            "Please select a valid employment type"
         ),
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
      probationPeriod: yup
         .string()
         .test(
            "is-valid-days",
            "Probation period must be a valid number of days",
            (value) => {
               if (!value) return true;
               const days = parseInt(value.replace(/[^0-9]/g, ""), 10);
               return !isNaN(days) && days >= 0 && days <= 365;
            }
         )
         .optional(),
   });

   // Step 3: Residency Information Schema for Edit
   const stepResidencyInfoSchema = yup.object({
      residencyStatus: yup
         .string()
         .required("Residency status is required")
         .oneOf(
            ["Active", "Expired", "Pending", "Renewal"],
            "Please select a valid residency status"
         ),
      residencyCountry: yup
         .string()
         .required("Country of residency is required"),
      residencyType: yup
         .string()
         .required("Residency/Visa type is required")
         .min(2, "Residency type must be at least 2 characters")
         .max(50, "Residency type must be less than 50 characters"),
      residencyNumber: yup
         .string()
         .required("Residency/Visa number is required")
         .min(5, "Residency number must be at least 5 characters")
         .max(50, "Residency number must be less than 50 characters"),
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
         )
         .test(
            "expiry-not-too-old",
            "Expiry date cannot be more than 10 years in the future",
            (value) => {
               if (!value) return true;
               const date = parseDateValue(value);
               if (!date) return true;
               const today = new Date();
               const tenYearsFromNow = new Date(
                  today.getFullYear() + 10,
                  today.getMonth(),
                  today.getDate()
               );
               return date.getTime() <= tenYearsFromNow.getTime();
            }
         ),
      residencyDocument: yup
         .array()
         .of(
            yup.object({
               fileId: yup.number().required(),
               token: yup.string().required(),
               purpose: yup.string().required(),
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

   return {
      stepBasicInfoSchema,
      stepWorkInfoSchema,
      stepResidencyInfoSchema,
   };
};
