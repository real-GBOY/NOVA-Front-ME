/** @format */

export type QueryParams = Record<string, unknown>;

const isEmptyValue = (value: unknown) =>
	value === undefined || value === null || value === "";

export const serializeQuery = (params?: QueryParams): string => {
	if (!params) return "";

	const parts: string[] = [];
	const append = (key: string, value: unknown) => {
		if (isEmptyValue(value)) return;
		parts.push(
			`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`
		);
	};

	Object.entries(params).forEach(([key, value]) => {
		if (isEmptyValue(value)) return;

		if (Array.isArray(value)) {
			value.forEach((item) => append(key, item));
			return;
		}

		append(key, value);
	});

	return parts.join("&");
};
