/** @format */

/**
 * Merges class names together, handling conflicts
 * Useful for combining Tailwind classes
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
	return classes.filter(Boolean).join(" ");
}

/**
 * Detects if text contains primarily English characters
 * Returns true if the text is mostly English (Latin characters, numbers, common symbols)
 */
export function isEnglishText(
	text: string | number | null | undefined
): boolean {
	if (text == null) return false;

	const str = String(text).trim();
	if (!str) return false;

	// Check if text contains primarily Latin characters, numbers, and common English symbols
	// Arabic characters are in the range \u0600-\u06FF
	const arabicPattern = /[\u0600-\u06FF]/;
	const hasArabic = arabicPattern.test(str);

	// If no Arabic characters, it's likely English
	if (!hasArabic) return true;

	// If it has Arabic, check the ratio of English vs Arabic characters
	const arabicCount = (str.match(/[\u0600-\u06FF]/g) || []).length;
	const totalChars = str.replace(/\s/g, "").length;

	// If less than 30% Arabic, consider it English
	return arabicCount / totalChars < 0.3;
}
