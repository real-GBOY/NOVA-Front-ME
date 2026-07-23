/** @format */

import { useTranslation } from "@/hooks/useTranslation";
import Button from "@/designSystem/Button";

type LocationFieldProps = {
	value: string;
	onChange: (value: string) => void;
	onUseCurrentLocation: () => void;
	disabled?: boolean;
};

function LocationField({
	value,
	onChange,
	onUseCurrentLocation,
	disabled = false,
}: LocationFieldProps) {
	const { t } = useTranslation("settings");

	return (
		<div className='grid grid-rows-[auto_1fr] gap-1'>
			<div className='flex items-center justify-between h-5'>
				<label className='text-sm font-medium text-text-sub leading-5'>
					{t("companySettings.fields.location")}
				</label>
				<Button
					variant='secondary'
					onClick={onUseCurrentLocation}
					disabled={disabled}
					className='px-0 py-0 h-5 text-sm font-medium !text-primary bg-transparent border-0 shadow-none hover:bg-transparent hover:!text-primary whitespace-nowrap flex items-center'>
					{t("companySettings.location.useCurrent")}
				</Button>
			</div>
			<input
				type='text'
				value={value}
				onChange={(e) => onChange(e.target.value)}
				placeholder={t("companySettings.placeholders.location")}
				disabled={disabled}
				className={`w-full rounded-[10px] border border-border bg-background px-3 py-2.5 text-sm text-text-sub placeholder:text-text-soft focus:outline-none ${
					disabled ? "cursor-not-allowed bg-bg-weak text-text-soft" : ""
				}`}
			/>
		</div>
	);
}

export default LocationField;
