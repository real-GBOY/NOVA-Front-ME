/** @format */

import { useState, useCallback } from "react";
import type { ObjectSchema, ValidationError } from "yup";

export interface ValidationResult {
   isValid: boolean;
   errors: Record<string, string>;
}

/**
 * Hook for validating form data against a yup schema
 * Returns validation function and current validation state
 */
export function useStepValidation() {
   const [validationErrors, setValidationErrors] = useState<
      Record<string, string>
   >({});

   const validateStep = useCallback(
      async <T extends Record<string, unknown>>(
         // eslint-disable-next-line @typescript-eslint/no-explicit-any
         schema: ObjectSchema<any>,
         data: Partial<T>
      ): Promise<ValidationResult> => {
         try {
            // Validate the data against the schema
            await schema.validate(data, { abortEarly: false });

            // If validation passes, clear errors
            setValidationErrors({});
            return { isValid: true, errors: {} };
         } catch (error) {
            // If validation fails, collect all errors
            if (error instanceof Error && "inner" in error) {
               const yupError = error as ValidationError;
               const errors: Record<string, string> = {};

               yupError.inner.forEach((err) => {
                  if (err.path) {
                     errors[err.path] = err.message;
                  }
               });

               setValidationErrors(errors);
               return { isValid: false, errors };
            }

            // Handle unexpected errors
            console.error("Validation error:", error);
            return {
               isValid: false,
               errors: { _global: "An unexpected validation error occurred" },
            };
         }
      },
      []
   );

   const clearValidationErrors = useCallback(() => {
      setValidationErrors({});
   }, []);

   const clearFieldError = useCallback((fieldName: string) => {
      setValidationErrors((prev) => {
         const newErrors = { ...prev };
         delete newErrors[fieldName];
         return newErrors;
      });
   }, []);

   return {
      validateStep,
      validationErrors,
      clearValidationErrors,
      clearFieldError,
   };
}
