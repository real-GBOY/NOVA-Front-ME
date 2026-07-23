/** @format */

import { useTranslation } from "@/hooks/useTranslation";

function TermsAndConditions() {
	const { t } = useTranslation("termsAndConditions");

	return (
		<div className="flex h-screen flex-1 min-w-0 flex-col rounded-2xl bg-background">
			<div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide pr-1 py-6 mx-6">
				<div className="max-w-4xl mx-auto">
					<div className="bg-background border border-border rounded-2xl p-6 shadow-sm flex flex-col gap-6">
						{/* Introduction */}
						<div className="flex flex-col gap-4">
							<h2 className="text-lg font-semibold text-text-strong">
								{t("sections.introduction.title")}
							</h2>
							<p className="text-sm text-text-sub leading-6">
								{t("sections.introduction.content")}
							</p>
						</div>

						<div className="h-px bg-border"></div>

						{/* Acceptance */}
						<div className="flex flex-col gap-4">
							<h2 className="text-lg font-semibold text-text-strong">
								{t("sections.acceptance.title")}
							</h2>
							<p className="text-sm text-text-sub leading-6">
								{t("sections.acceptance.content")}
							</p>
						</div>

						<div className="h-px bg-border"></div>

						{/* Use of Service */}
						<div className="flex flex-col gap-4">
							<h2 className="text-lg font-semibold text-text-strong">
								{t("sections.useOfService.title")}
							</h2>
							<p className="text-sm text-text-sub leading-6 mb-2">
								{t("sections.useOfService.content")}
							</p>
							<ul className="list-disc list-inside space-y-2 text-sm text-text-sub leading-6 ms-4">
								<li>{t("sections.useOfService.items.item1")}</li>
								<li>{t("sections.useOfService.items.item2")}</li>
								<li>{t("sections.useOfService.items.item3")}</li>
								<li>{t("sections.useOfService.items.item4")}</li>
							</ul>
						</div>

						<div className="h-px bg-border"></div>

						{/* User Accounts */}
						<div className="flex flex-col gap-4">
							<h2 className="text-lg font-semibold text-text-strong">
								{t("sections.userAccounts.title")}
							</h2>
							<p className="text-sm text-text-sub leading-6">
								{t("sections.userAccounts.content")}
							</p>
						</div>

						<div className="h-px bg-border"></div>

						{/* Privacy */}
						<div className="flex flex-col gap-4">
							<h2 className="text-lg font-semibold text-text-strong">
								{t("sections.privacy.title")}
							</h2>
							<p className="text-sm text-text-sub leading-6">
								{t("sections.privacy.content")}
							</p>
						</div>

						<div className="h-px bg-border"></div>

						{/* Intellectual Property */}
						<div className="flex flex-col gap-4">
							<h2 className="text-lg font-semibold text-text-strong">
								{t("sections.intellectualProperty.title")}
							</h2>
							<p className="text-sm text-text-sub leading-6">
								{t("sections.intellectualProperty.content")}
							</p>
						</div>

						<div className="h-px bg-border"></div>

						{/* Limitation of Liability */}
						<div className="flex flex-col gap-4">
							<h2 className="text-lg font-semibold text-text-strong">
								{t("sections.limitationOfLiability.title")}
							</h2>
							<p className="text-sm text-text-sub leading-6">
								{t("sections.limitationOfLiability.content")}
							</p>
						</div>

						<div className="h-px bg-border"></div>

						{/* Termination */}
						<div className="flex flex-col gap-4">
							<h2 className="text-lg font-semibold text-text-strong">
								{t("sections.termination.title")}
							</h2>
							<p className="text-sm text-text-sub leading-6">
								{t("sections.termination.content")}
							</p>
						</div>

						<div className="h-px bg-border"></div>

						{/* Changes to Terms */}
						<div className="flex flex-col gap-4">
							<h2 className="text-lg font-semibold text-text-strong">
								{t("sections.changesToTerms.title")}
							</h2>
							<p className="text-sm text-text-sub leading-6">
								{t("sections.changesToTerms.content")}
							</p>
						</div>

						<div className="h-px bg-border"></div>

						{/* Contact Information */}
						<div className="flex flex-col gap-4">
							<h2 className="text-lg font-semibold text-text-strong">
								{t("sections.contactInformation.title")}
							</h2>
							<p className="text-sm text-text-sub leading-6">
								{t("sections.contactInformation.content")}
							</p>
						</div>

						<div className="h-px bg-border"></div>

						{/* Last Updated */}
						<div className="flex flex-col gap-4">
							<p className="text-xs text-text-soft italic">
								{t("lastUpdated")}
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default TermsAndConditions;
