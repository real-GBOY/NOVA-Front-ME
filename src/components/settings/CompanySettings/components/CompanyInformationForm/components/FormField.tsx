/** @format */

type FormFieldProps = {
	label: string;
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	type?: string;
	disabled?: boolean;
};

function FormField({
	label,
	value,
	onChange,
	placeholder,
	type = "text",
	disabled = false,
}: FormFieldProps) {
	return (
		<div className='flex flex-col gap-1'>
			<label className='text-sm font-medium text-text-sub'>{label}</label>
			<input
				type={type}
				value={value}
				onChange={(e) => onChange(e.target.value)}
				placeholder={placeholder}
				disabled={disabled}
				className={`w-full rounded-[10px] border border-border bg-background px-3 py-2.5 text-sm text-text-sub placeholder:text-text-soft focus:outline-none ${
					disabled ? "cursor-not-allowed bg-bg-weak text-text-soft" : ""
				}`}
			/>
		</div>
	);
}

export default FormField;
