/** @format */

import { useTranslation } from "@/hooks/useTranslation";

function AssetsHeader() {
	const { t } = useTranslation("settings");

	return (
		<div className='space-y-1'>
			<h2 className='text-lg font-medium text-text-strong'>
				{t("assets.title")}
			</h2>
			<p className='text-sm font-normal text-text-soft'>
				{t("assets.description")}
			</p>
		</div>
	);
}

export default AssetsHeader;
