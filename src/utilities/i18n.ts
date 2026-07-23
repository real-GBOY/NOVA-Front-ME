/** @format */

import i18n from "@/config/i18n";
import type { Namespace } from "@/config/i18n";
const DUBAI_TIME_ZONE = "Asia/Dubai";

/**
 * Get translation outside React components
 * Useful for utility functions, constants, or error messages
 *
 * @example
 * ```tsx
 * // In a utility file
 * import { translate } from "@/utilities/i18n";
 *
 * export const getErrorMessage = (code: string) => {
 *   return translate("validation", `errors.${code}`);
 * };
 * ```
 */
export const translate = (
   namespace: Namespace,
   key: string,
   options?: Record<string, string | number>
): string => {
   return i18n.t(key, { ns: namespace, ...options });
};

/**
 * Format date according to current locale
 *
 * @example
 * ```tsx
 * formatDate(new Date(), "long"); // "November 26, 2025" (en) or "٢٦ نوفمبر ٢٠٢٥" (ar)
 * formatDate(new Date(), "short"); // "11/26/2025" (en) or "٢٦/١١/٢٠٢٥" (ar)
 * ```
 */
export const formatDate = (
   date: Date | string,
   format: "short" | "medium" | "long" = "medium"
): string => {
   const dateObj = typeof date === "string" ? new Date(date) : date;
   const locale = i18n.language;

   const formats: Record<string, Intl.DateTimeFormatOptions> = {
      short: { year: "numeric", month: "2-digit", day: "2-digit" },
      medium: { year: "numeric", month: "short", day: "numeric" },
      long: { year: "numeric", month: "long", day: "numeric" },
   };
   return new Intl.DateTimeFormat(locale, {
      ...formats[format],
      timeZone: DUBAI_TIME_ZONE,
   }).format(dateObj);
};

/**
 * Format time according to current locale
 *
 * @example
 * ```tsx
 * formatTime(new Date()); // "3:45 PM" (en) or "١٥:٤٥" (ar)
 * formatTime(new Date(), true); // "15:45:30"
 * ```
 */
export const formatTime = (
   date: Date | string,
   includeSeconds = false
): string => {
   const dateObj = typeof date === "string" ? new Date(date) : date;
   const locale = i18n.language;

   const options: Intl.DateTimeFormatOptions = {
      hour: "2-digit",
      minute: "2-digit",
      ...(includeSeconds && { second: "2-digit" }),
      timeZone: DUBAI_TIME_ZONE,
   };

   return new Intl.DateTimeFormat(locale, options).format(dateObj);
};

/**
 * Format number according to current locale
 *
 * @example
 * ```tsx
 * formatNumber(1234.56); // "1,234.56" (en) or "١٬٢٣٤٫٥٦" (ar)
 * ```
 */
export const formatNumber = (
   value: number,
   options?: Intl.NumberFormatOptions
): string => {
   const locale = i18n.language;
   return new Intl.NumberFormat(locale, options).format(value);
};

/**
 * Format currency according to current locale
 *
 * @example
 * ```tsx
 * formatCurrency(1234.56, "USD"); // "$1,234.56" (en) or "١٬٢٣٤٫٥٦ US$" (ar)
 * formatCurrency(1234.56, "SAR"); // "SAR 1,234.56" (en) or "١٬٢٣٤٫٥٦ ر.س" (ar)
 * ```
 */
export const formatCurrency = (
   value: number,
   currency = "USD",
   options?: Intl.NumberFormatOptions
): string => {
   const locale = i18n.language;
   return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      ...options,
   }).format(value);
};

/**
 * Pluralize text based on count
 *
 * @example
 * ```tsx
 * // In translation file:
 * // "items": "{{count}} item",
 * // "items_plural": "{{count}} items"
 *
 * pluralize("common", "items", 1); // "1 item"
 * pluralize("common", "items", 5); // "5 items"
 * ```
 */
export const pluralize = (
   namespace: Namespace,
   key: string,
   count: number
): string => {
   return i18n.t(key, { ns: namespace, count });
};

/**
 * Get direction class for RTL/LTR support
 *
 * @example
 * ```tsx
 * <div className={getDirectionClass("ml-4", "mr-4")}>
 *   // This will apply "ml-4" for LTR and "mr-4" for RTL
 * </div>
 * ```
 */
export const getDirectionClass = (
   ltrClass: string,
   rtlClass: string
): string => {
   return i18n.dir() === "rtl" ? rtlClass : ltrClass;
};

/**
 * Check if current direction is RTL
 *
 * @example
 * ```tsx
 * const isRTL = isRTLDirection();
 * const alignment = isRTL ? "right" : "left";
 * ```
 */
export const isRTLDirection = (): boolean => {
   return i18n.dir() === "rtl";
};

/**
 * Get localized route
 * Useful for apps with language-specific routes
 *
 * @example
 * ```tsx
 * getLocalizedRoute("/members"); // "/members" (en) or "/ar/الأعضاء" (ar)
 * ```
 */
export const getLocalizedRoute = (route: string): string => {
   const locale = i18n.language;
   return locale === "en" ? route : `/${locale}${route}`;
};

export default {
   translate,
   formatDate,
   formatTime,
   formatNumber,
   formatCurrency,
   pluralize,
   getDirectionClass,
   isRTLDirection,
   getLocalizedRoute,
};
