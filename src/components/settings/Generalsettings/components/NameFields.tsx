/** @format */

import type { UseFormWatch } from "react-hook-form";
import type { GeneralSettingsFormData } from "../schema";
import { useTranslation } from "@/hooks/useTranslation";

type NameFieldsProps = {
	watch: UseFormWatch<GeneralSettingsFormData>;
};

function NameFields({ watch }: NameFieldsProps) {
	const { t } = useTranslation("settings");

	return (
		<div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
			<div className='flex flex-col gap-1'>
				<label className='text-sm font-medium text-text-sub'>
					{t("generalSettingsPage.name.firstLabel")}
				</label>
				<div className='w-full rounded-[10px] border border-border bg-bg-weak px-3 py-2.5 text-sm text-text-strong'>
					{watch("firstName") || "-"}
				</div>
			</div>
			<div className='flex flex-col gap-1'>
				<label className='text-sm font-medium text-text-sub'>
					{t("generalSettingsPage.name.lastLabel")}
				</label>
				<div className='w-full rounded-[10px] border border-border bg-bg-weak px-3 py-2.5 text-sm text-text-strong'>
					{watch("lastName") || "-"}
				</div>
			</div>
		</div>
	);
}

export default NameFields;

