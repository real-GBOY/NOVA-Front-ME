/** @format */

import Button from "@/designSystem/Button";
import { useTranslation } from "@/hooks/useTranslation";

type GeneralSettingsHeaderProps = {
	onSave: () => void;
	onCancel: () => void;
	isLoading?: boolean;
	hasChanges?: boolean;
};

function GeneralSettingsHeader({
	onSave,
	onCancel,
	isLoading,
	hasChanges = false,
}: GeneralSettingsHeaderProps) {
	const { t } = useTranslation("settings");

	return (
		<div className='flex items-start justify-between'>
			<div className='flex flex-col gap-1'>
				<h2 className='text-xl font-semibold text-text-strong'>
					{t("tabs.generalSettings")}
				</h2>
				<p className='text-sm text-text-sub'>
					{t("generalSettingsPage.description")}
				</p>
			</div>
			<div className='flex items-center gap-3'>
				<Button
					variant='secondary'
					onClick={onCancel}
					disabled={isLoading || !hasChanges}>
					{t("common.cancel", "Cancel")}
				</Button>
				<Button
					onClick={onSave}
					disabled={isLoading || !hasChanges}
					isLoading={isLoading}>
					{t("common.save", "Save")}
				</Button>
			</div>
		</div>
	);
}

export default GeneralSettingsHeader;
