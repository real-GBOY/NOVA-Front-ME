/** @format */

import { useTranslation } from "@/hooks/useTranslation";

interface DocumentsTabProps {
	title?: string;
	count?: number;
}

function DocumentsTab({ title, count }: DocumentsTabProps) {
	const { t } = useTranslation("members");

	const displayTitle = title || t("placeholders.documents.title");

	return (
		<div className='w-full border border-dashed border-border bg-bg-weak text-sm text-text-sub r-rounded r-p-sm xl:rounded-2xl xl:p-6'>
			<div className='mb-1 flex items-center gap-2 text-base font-semibold text-text-strong'>
				<span>{displayTitle}</span>
				{typeof count === "number" && (
					<span className='rounded-full bg-bg-weak px-2 py-0.5 text-xs font-medium text-faded'>
						{t("placeholders.documents.count", { count })}
					</span>
				)}
			</div>
			<p>{t("placeholders.documents.description")}</p>
		</div>
	);
}

export default DocumentsTab;
