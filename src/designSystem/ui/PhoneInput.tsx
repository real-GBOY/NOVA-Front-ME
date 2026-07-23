/** @format */

import { useState, useRef, useEffect } from "react";
import {
	getCountries,
	getCountryCallingCode,
	Country,
} from "react-phone-number-input";
import en from "react-phone-number-input/locale/en";
import { ArrowDownSLine, UaeFlag } from "@/Icons";
import "./PhoneInput.css";

interface PhoneInputProps {
	value?: string;
	onChange?: (value?: string) => void;
	placeholder?: string;
	className?: string;
	disabled?: boolean;
}

export default function PhoneInput({
	value,
	onChange,
	placeholder = "Enter phone number",
	className = "",
	disabled = false,
}: PhoneInputProps) {
	const countries = getCountries();
	const [selectedCountry, setSelectedCountry] = useState<Country>("AE");
	const [phoneInput, setPhoneInput] = useState("");
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	const [searchTerm, setSearchTerm] = useState("");
	const dropdownRef = useRef<HTMLDivElement>(null);
	const searchInputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target as Node)
			) {
				setIsDropdownOpen(false);
				setSearchTerm("");
			}
		};

		const handleEscape = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				setIsDropdownOpen(false);
				setSearchTerm("");
			}
		};

		if (isDropdownOpen) {
			document.addEventListener("mousedown", handleClickOutside);
			document.addEventListener("keydown", handleEscape);
			setTimeout(() => searchInputRef.current?.focus(), 100);
		}

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
			document.removeEventListener("keydown", handleEscape);
		};
	}, [isDropdownOpen]);

	useEffect(() => {
		if (value?.startsWith("+")) {
			const cleaned = value.slice(1);
			for (const country of countries) {
				const code = getCountryCallingCode(country);
				if (cleaned.startsWith(code)) {
					setSelectedCountry(country);
					setPhoneInput(cleaned.slice(code.length));
					break;
				}
			}
		}
	}, [value, countries]);

	const handleCountryChange = (country: Country) => {
		setSelectedCountry(country);
		setIsDropdownOpen(false);
		setSearchTerm("");
		const callingCode = getCountryCallingCode(country);
		const newValue = phoneInput
			? `+${callingCode}${phoneInput}`
			: `+${callingCode}`;
		onChange?.(newValue);
	};

	const handlePhoneInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const input = e.target.value.replace(/\D/g, "");
		setPhoneInput(input);
		const callingCode = getCountryCallingCode(selectedCountry);
		onChange?.(input ? `+${callingCode}${input}` : undefined);
	};

	const filteredCountries = countries.filter((country) => {
		const countryName = en[country]?.toLowerCase() || "";
		const callingCode = getCountryCallingCode(country);
		const search = searchTerm.toLowerCase();
		return (
			countryName.includes(search) ||
			callingCode.includes(search) ||
			country.toLowerCase().includes(search)
		);
	});

	const getFlagEmoji = (countryCode: string) => {
		const codePoints = countryCode
			.toUpperCase()
			.split("")
			.map((char) => 127397 + char.charCodeAt(0));
		return String.fromCodePoint(...codePoints);
	};

	const renderFlag = (countryCode: string) => {
		if (countryCode === "AE") {
			return <UaeFlag size={20} />;
		}
		return <span>{getFlagEmoji(countryCode)}</span>;
	};

	return (
		<div
			className={`phone-input-container ${className} ${
				disabled ? "is-disabled pointer-events-none" : ""
			}`}>
			<div className='phone-input-wrapper'>
				<div ref={dropdownRef} className='country-selector-wrapper'>
					<button
						type='button'
						onClick={() => !disabled && setIsDropdownOpen(!isDropdownOpen)}
						disabled={disabled}
						className='country-selector-button'>
						<span className='flag-emoji'>{renderFlag(selectedCountry)}</span>
						<span className='country-code-text'>
							+{getCountryCallingCode(selectedCountry)}
						</span>
						<ArrowDownSLine
							className={`chevron-icon ${isDropdownOpen ? "rotate-180" : ""}`}
							size={20}
						/>
					</button>

					{isDropdownOpen && !disabled && (
						<div className='country-dropdown'>
							<div className='country-dropdown-search'>
								<input
									ref={searchInputRef}
									type='text'
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
									placeholder='Search countries...'
									className='search-input'
								/>
							</div>
							<div className='country-dropdown-list'>
								{filteredCountries.map((country) => {
									const callingCode = getCountryCallingCode(country);
									const countryName = en[country];
									return (
										<button
											key={country}
											type='button'
											onClick={() => handleCountryChange(country)}
											className={`country-option ${
												selectedCountry === country ? "selected" : ""
											}`}>
											<span className='flag-emoji'>{renderFlag(country)}</span>
											<span className='country-name'>{countryName}</span>
											<span className='calling-code'>+{callingCode}</span>
										</button>
									);
								})}
							</div>
						</div>
					)}
				</div>

				<input
					type='tel'
					value={phoneInput}
					onChange={handlePhoneInputChange}
					placeholder={placeholder}
					disabled={disabled}
					className='phone-number-input'
				/>
			</div>
			{value && (
				<div className='phone-display'>
					+{getCountryCallingCode(selectedCountry)} {phoneInput}
				</div>
			)}
		</div>
	);
}
