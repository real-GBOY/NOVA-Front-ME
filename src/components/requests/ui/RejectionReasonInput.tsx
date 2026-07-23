/** @format */

import { useEffect } from "react";
import { MAX_REASON_LENGTH } from "../constants";
import { GenericFormField } from "@/designSystem/GenericFormField";
import { useForm } from "react-hook-form";

type RejectionReasonInputProps = {
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
};

function RejectionReasonInput({
	value,
	onChange,
	placeholder,
}: RejectionReasonInputProps) {
	const form = useForm({
		defaultValues: { rejectionReason: value },
		mode: "onChange",
	});

	// Sync form value when prop changes
	useEffect(() => {
		form.setValue("rejectionReason", value);
	}, [value, form]);

	// Handle field change
	const handleFieldChange = (field: string, newValue: unknown) => {
		if (field === "rejectionReason" && typeof newValue === "string") {
			if (newValue.length <= MAX_REASON_LENGTH) {
				onChange(newValue);
			}
		}
	};

	const currentValue = form.watch("rejectionReason") || "";
	const remainingChars = MAX_REASON_LENGTH - currentValue.length;

	return (
		<GenericFormField
			fieldConfig={{
				name: "rejectionReason",
				type: "custom",
				render: () => (
					<div className='relative'>
						<textarea
							value={currentValue}
							onChange={(e) => {
								const newValue = e.target.value;
								if (newValue.length <= MAX_REASON_LENGTH) {
									form.setValue("rejectionReason", newValue, {
										shouldValidate: true,
										shouldDirty: true,
									});
									handleFieldChange("rejectionReason", newValue);
								}
							}}
							className='w-full min-h-[100px] px-3 py-2 text-sm text-text-strong bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all resize-none'
							placeholder={placeholder}
						/>
						<div className='absolute bottom-2 right-2 flex items-center gap-1 text-xs text-text-soft'>
							<span>
								{remainingChars}/{MAX_REASON_LENGTH}
							</span>
						</div>
					</div>
				),
			}}
			form={form}
			onFieldChange={handleFieldChange}
		/>
	);
}

export default RejectionReasonInput;
