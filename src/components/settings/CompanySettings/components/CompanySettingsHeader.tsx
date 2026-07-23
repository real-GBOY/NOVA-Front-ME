/** @format */

import Button from "@/designSystem/Button";
import { useTranslation } from "@/hooks/useTranslation";

type CompanySettingsHeaderProps = {
	onSave: () => void;
	onCancel: () => void;
	isUploading?: boolean;
	hasChanges?: boolean;
	canEdit?: boolean;
};

function CompanySettingsHeader({
	onSave,
	onCancel,
	isUploading = false,
	hasChanges = false,
	canEdit = true,
}: CompanySettingsHeaderProps) {
	const { t } = useTranslation("settings");

	return (
		<div className='flex items-start justify-between'>
			<div className='flex flex-col gap-1'>
				<h2 className='text-xl font-semibold text-text-strong'>
					{t("companySettings.title")}
				</h2>
				<p className='text-sm text-text-sub'>
					{t("companySettings.description")}
				</p>
			</div>
			{hasChanges && canEdit && (
				<div className='flex items-center gap-3'>
					<Button variant='secondary' onClick={onCancel}>
						{t("common.cancel", "Cancel")}
					</Button>
					<Button onClick={onSave} disabled={isUploading}>
						{isUploading ? t("common.uploading", "Uploading...") : t("common.save", "Save")}
					</Button>
				</div>
			)}
		</div>
	);
}

export default CompanySettingsHeader;
