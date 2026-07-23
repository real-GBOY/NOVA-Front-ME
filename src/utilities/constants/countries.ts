/** @format */

import { getCountries, Country } from "react-phone-number-input";
import en from "react-phone-number-input/locale/en";

export interface CountryOption {
	id: Country;
	label: string;
}

/**
 * Get all available countries as options for select inputs
 * Uses react-phone-number-input to ensure consistency with PhoneInput component
 */
export const getAllCountries = (): CountryOption[] => {
	const countries = getCountries();
	return countries.map((country) => ({
		id: country,
		label: en[country] || country,
	}));
};

/**
 * Static list of all countries for form dropdowns
 * Sorted alphabetically by country name
 */
export const COUNTRY_OPTIONS: CountryOption[] = getAllCountries().sort((a, b) =>
	a.label.localeCompare(b.label)
);

/**
 * Static list of all countries for form dropdowns where the value is the country name
 * Sorted alphabetically by country name
 */
export const COUNTRY_NAME_OPTIONS: { id: string; label: string }[] =
	getAllCountries()
		.map((c) => ({
			id: c.label,
			label: c.label,
		}))
		.sort((a, b) => a.label.localeCompare(b.label));

