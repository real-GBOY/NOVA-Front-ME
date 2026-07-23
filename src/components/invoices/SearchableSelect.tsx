/** @format */

import { useState, useRef, useEffect, useMemo } from "react";
import ArrowDownSLine from "@/Icons/arrow-down-s-line";
import { Xmark } from "@/Icons";
import Avatar from "@/designSystem/Avatar";
import { useDebounce } from "@/hooks/useDebounce";

type SearchableSelectProps = {
	label?: string;
	placeholder?: string;
	value: string;
	onChange: (value: string) => void;
	options: { id: string; label: string; avatarUrl?: string; searchText?: string }[];
	disabled?: boolean;
	required?: boolean;
	showTag?: boolean;
	debounceMs?: number;
	// Server-side search support
	serverSideSearch?: boolean;
	fetchOptions?: (search: string) => Promise<Array<{ id: string; label: string; avatarUrl?: string; searchText?: string }>>;
};

export default function SearchableSelect({
	label,
	placeholder = "Select...",
	value,
	onChange,
	options,
	disabled = false,
	required = false,
	showTag = false,
	debounceMs = 300,
	serverSideSearch = false,
	fetchOptions,
}: SearchableSelectProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [serverOptions, setServerOptions] = useState<Array<{ id: string; label: string; avatarUrl?: string; searchText?: string }>>([]);
	const [isLoadingOptions, setIsLoadingOptions] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);
	const dropdownRef = useRef<HTMLDivElement>(null);

	const debouncedSearch = useDebounce(searchQuery, debounceMs);

	// Use server options if server-side search is enabled, otherwise use provided options
	const displayOptions = serverSideSearch ? serverOptions : options;
	// For server-side search, we need to find the selected option from serverOptions
	// For client-side, find from options
	const selectedOption = serverSideSearch
		? serverOptions.find((opt) => opt.id === value) || options.find((opt) => opt.id === value)
		: options.find((opt) => opt.id === value);

	// Derive input display value instead of syncing with useEffect
	// When open: show search query (user typing)
	// When closed: show selected label (if not using tag mode) or empty
	const inputValue = useMemo(() => {
		if (isOpen) {
			return searchQuery;
		}
		if (showTag) {
			return "";
		}
		return selectedOption?.label || "";
	}, [isOpen, searchQuery, showTag, selectedOption]);

	// Fetch server-side options when search changes or dropdown opens
	useEffect(() => {
		if (serverSideSearch && fetchOptions && isOpen) {
			setIsLoadingOptions(true);
			fetchOptions(debouncedSearch)
				.then((fetchedOptions) => {
					setServerOptions(fetchedOptions);
					setIsLoadingOptions(false);
				})
				.catch(() => {
					setServerOptions([]);
					setIsLoadingOptions(false);
				});
		} else if (serverSideSearch && isOpen && !debouncedSearch && fetchOptions) {
			// Load initial options when dropdown opens
			setIsLoadingOptions(true);
			fetchOptions("")
				.then((fetchedOptions) => {
					setServerOptions(fetchedOptions);
					setIsLoadingOptions(false);
				})
				.catch(() => {
					setServerOptions([]);
					setIsLoadingOptions(false);
				});
		}
	}, [debouncedSearch, isOpen, serverSideSearch, fetchOptions]);

	// Fetch selected option on mount if value is set and server-side search is enabled
	useEffect(() => {
		if (serverSideSearch && fetchOptions && value && !selectedOption && !isOpen) {
			// Try to fetch the specific option by searching for it
			// This is a fallback - ideally the parent should provide the selected option
			fetchOptions("")
				.then((fetchedOptions) => {
					setServerOptions(fetchedOptions);
				})
				.catch(() => {
					setServerOptions([]);
				});
		}
	}, [value, serverSideSearch, fetchOptions, selectedOption, isOpen]);

	// Handle click outside to close dropdown
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				containerRef.current &&
				!containerRef.current.contains(event.target as Node) &&
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target as Node)
			) {
				setIsOpen(false);
				setSearchQuery(""); // Reset search for next open
			}
		};

		if (isOpen) {
			document.addEventListener("mousedown", handleClickOutside);
		}

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [isOpen]);

	// Client-side filtering for non-server-side search
	const filteredOptions = serverSideSearch
		? displayOptions
		: displayOptions.filter((opt) => {
		const haystack = `${opt.label} ${opt.searchText || ""}`.toLowerCase();
		return haystack.includes(searchQuery.toLowerCase());
	});

	return (
		<div className="space-y-2">
			{label && (
				<label className="block text-sm font-medium text-text-sub">
					{label}
					{required && <span className="text-primary"> *</span>}
				</label>
			)}
			<div
				className={`relative ${
					disabled ? "opacity-60 pointer-events-none" : ""
				}`}
				ref={containerRef}>
				<div className="flex items-center w-full gap-2 px-3 py-2.5 text-sm rounded-xl border border-border bg-background text-text-sub focus-within:ring-2 focus-within:ring-primary focus-within:border-transparent">
					{showTag && selectedOption && (
						<div className="inline-flex items-center gap-2 px-2 py-1 rounded-full bg-bg-weak border border-border text-text-strong text-sm">
							{selectedOption.avatarUrl && (
								<Avatar
									size="sm"
									src={selectedOption.avatarUrl}
									alt={selectedOption.label}
								/>
							)}
							<span className="truncate max-w-[160px]">
								{selectedOption.label}
							</span>
							<button
								type="button"
								onClick={() => {
									onChange("");
									setSearchQuery("");
								}}
								className="p-0.5 rounded-full hover:bg-bg-weak text-text-sub">
								<Xmark size={14} className="fill-text-sub" />
							</button>
						</div>
					)}
					<input
						type="text"
						value={inputValue}
						onChange={(e) => {
							setSearchQuery(e.target.value);
							setIsOpen(true);
						}}
						onFocus={() => !disabled && setIsOpen(true)}
						placeholder={placeholder}
						className="w-full bg-transparent outline-none text-text-strong placeholder:text-text-soft"
						disabled={disabled}
					/>
					<ArrowDownSLine size={20} className="shrink-0" />
				</div>
				{isOpen && !disabled && (
					<div
						ref={dropdownRef}
						className="absolute top-full mt-1 start-0 w-full bg-background border border-border rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
						<div className="flex flex-col">
							{isLoadingOptions ? (
								<div className="px-3 py-2 text-sm text-text-sub">
									Loading...
								</div>
							) : filteredOptions && filteredOptions.length > 0 ? (
								filteredOptions.map((option) => (
									<button
										key={option.id}
										type="button"
										onClick={() => {
											onChange(option.id);
											setSearchQuery(""); // Reset search for next open
											setIsOpen(false);
										}}
										className={`flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors ${
											value === option.id
												? "bg-primary/10 text-primary"
												: "text-text-strong hover:bg-bg-weak"
										}`}>
										{option.avatarUrl && (
											<Avatar
												size="sm"
												src={option.avatarUrl}
												alt={option.label}
											/>
										)}
										{option.label}
									</button>
								))
							) : (
								<div className="px-3 py-2 text-sm text-text-sub">
									No options found
								</div>
							)}
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
