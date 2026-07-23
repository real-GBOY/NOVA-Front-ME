/** @format */

import SortDropdown from "@/designSystem/SortDropdown";
import type { DropdownOption } from "../types";

type DropdownFieldProps<T extends string> = {
	label: string;
	value: T;
	options: DropdownOption<T>[];
	onChange: (value: T) => void;
	showEmptySpacer?: boolean;
	disabled?: boolean;
};

function DropdownField<T extends string>({
	label,
	value,
	options,
	onChange,
	showEmptySpacer = false,
	disabled = false,
}: DropdownFieldProps<T>) {
	const selectedOption = options.find((opt) => opt.id === value);

	return (
		<div className={showEmptySpacer ? "grid grid-rows-[auto_1fr] gap-1" : "flex flex-col gap-1"}>
			{showEmptySpacer ? (
				<div className='flex items-center justify-between h-5'>
					<label className='text-sm font-medium text-text-sub leading-5'>
						{label}
					</label>
					<div className='w-0 h-5'></div>
				</div>
			) : (
				<label className='text-sm font-medium text-text-sub'>{label}</label>
			)}
			<SortDropdown
				label={selectedOption?.label || ""}
				options={options}
				onSelect={(id) => onChange(id as T)}
				disabled={disabled}
			/>
		</div>
	);
}

export default DropdownField;
