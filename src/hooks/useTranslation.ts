/** @format */

import { useTranslation as useTranslationOriginal } from "react-i18next";
import type { Namespace } from "@/config/i18n";

/**
 * Custom hook wrapper for useTranslation with better TypeScript support
 *
 * @example
 * ```tsx
 * // In a component
 * const { t } = useTranslation("members");
 * return <h1>{t("title")}</h1>; // "Members"
 *
 * // With interpolation
 * const { t } = useTranslation("validation");
 * return <p>{t("minLength", { min: 8 })}</p>; // "Minimum length is 8 characters"
 *
 * // Multiple namespaces
 * const { t } = useTranslation(["common", "members"]);
 * ```
 */
export const useTranslation = (ns?: Namespace | Namespace[]) => {
   return useTranslationOriginal(ns);
};

export default useTranslation;
