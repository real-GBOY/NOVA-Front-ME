/** @format */

import Button from "@/designSystem/Button";
import { useTranslation } from "@/hooks/useTranslation";

type NotificationsSettingsHeaderProps = {
	onSave: () => void;
	onCancel: () => void;
};

function NotificationsSettingsHeader({
	onSave,
	onCancel,
}: NotificationsSettingsHeaderProps) {
	const { t } = useTranslation("settings");

	return (
		<div className='flex items-start justify-between'>
			<div className='flex flex-col gap-1'>
				<h2 className='text-xl font-semibold text-text-strong'>
					{t("notificationsSettings.title")}
				</h2>
				<p className='text-sm text-text-sub'>
					{t("notificationsSettings.description")}
				</p>
			</div>
			<div className='flex items-center gap-3'>
				<Button variant='secondary' onClick={onCancel}>
					{t("common.cancel", "Cancel")}
				</Button>
				<Button onClick={onSave}>{t("common.save", "Save")}</Button>
			</div>
		</div>
	);
}

export default NotificationsSettingsHeader;
