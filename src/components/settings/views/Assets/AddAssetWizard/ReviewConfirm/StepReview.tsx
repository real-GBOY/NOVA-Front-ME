/** @format */

import { useTranslation } from "@/hooks/useTranslation";
import { AssetFormData } from "../types";
import { Edit } from "@/Icons";
import IconContainer from "@/designSystem/IconContainer";
import Button from "@/designSystem/Button";
import BadgeTag from "@/designSystem/BadgeTag";
import { getCategoryVariant, getConditionVariant } from "../../utils";

type StepReviewProps = {
	formData: AssetFormData;
	onNavigateToStep?: (step: number) => void;
};

function StepReview({ formData, onNavigateToStep }: StepReviewProps) {
	const { t } = useTranslation("settings");

	const categoryOptions = [
		{ id: "laptop", label: "Laptop" },
		{ id: "mobile", label: "Mobile" },
		{ id: "tablet", label: "Tablet" },
		{ id: "other", label: "Other" },
	];

	const conditionOptions = [
		{ id: "new", label: "New" },
		{ id: "good", label: "Good" },
		{ id: "fair", label: "Fair" },
		{ id: "poor", label: "Poor" },
		{ id: "damaged", label: "Damaged" },
	];

	const selectedCategory = categoryOptions.find(
		(opt) => opt.id === formData.category
	);
	const selectedCondition = conditionOptions.find(
		(opt) => opt.id === formData.condition
	);

	return (
		<div className='w-full max-w-[840px] min-h-[730px] rounded-2xl sm:rounded-3xl border border-border p-4 sm:p-6 bg-background flex flex-col gap-4 sm:gap-6'>
			{/* Review Header */}
			<div>
				<h3 className='text-lg sm:text-xl font-semibold text-text-strong'>
					{t("assets.addWizard.review.title")}
				</h3>
				<p className='mt-1 text-xs sm:text-sm text-text-soft'>
					{t("assets.addWizard.review.description")}
				</p>
				<div className='mt-4 sm:mt-6 border-t border-border'></div>
			</div>

			{/* Asset Information Section */}
			<div className='min-h-[292px] rounded-xl sm:rounded-2xl border border-border p-3 sm:p-4 bg-background flex flex-col gap-4 sm:gap-6'>
				<div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0'>
					<h4 className='text-xs sm:text-sm font-semibold text-text-sub uppercase tracking-wide'>
						{t("assets.addWizard.review.assetInformation")}
					</h4>
					<Button
						variant='secondary'
						onClick={() => onNavigateToStep?.(1)}
						className='flex items-center gap-0.5 w-full sm:w-[68px] h-8 rounded-lg border border-border p-1.5 text-xs sm:text-sm font-medium text-text-strong hover:bg-bg-weak transition-colors !px-1.5 !py-1.5'>
						<IconContainer
							Icon={() => <Edit size={16} active={false} />}
							className='!p-0 !border-0 !shadow-none !bg-transparent'
						/>
						<span>{t("assets.addWizard.review.edit")}</span>
					</Button>
				</div>
				<div className='space-y-4 sm:space-y-6 flex-1'>
					{/* Image */}
					{formData.image?.fileUrl && (
						<div>
							<p className='text-xs font-medium text-text-sub mb-1'>
								{t("assets.addWizard.review.image")}
							</p>
							<div className='w-16 h-16 rounded-full bg-bg-weak flex items-center justify-center overflow-hidden'>
								<img
									src={formData.image.fileUrl}
									alt='Asset preview'
									className='w-full h-full object-cover'
								/>
							</div>
						</div>
					)}

					{/* Asset Name */}
					<div>
						<p className='text-xs font-medium text-text-sub mb-1'>
							{t("assets.addWizard.assetInformation.assetName")}
						</p>
						<p className='text-sm sm:text-base font-semibold text-text-strong break-words'>
							{formData.name || "—"}
						</p>
					</div>

					{/* Category */}
					<div>
						<p className='text-xs font-medium text-text-sub mb-1'>
							{t("assets.addWizard.assetInformation.category")}
						</p>
						{selectedCategory && (
							<BadgeTag
								label={selectedCategory.label}
								variant={getCategoryVariant(selectedCategory.id)}
								size='sm'
							/>
						)}
					</div>

					{/* Serial Number */}
					<div>
						<p className='text-xs font-medium text-text-sub mb-1'>
							{t("assets.addWizard.assetInformation.serialNumber")}
						</p>
						<p className='text-sm sm:text-base font-semibold text-text-strong break-words'>
							{formData.serial || "—"}
						</p>
					</div>

					{/* Condition */}
					<div>
						<p className='text-xs font-medium text-text-sub mb-1'>
							{t("assets.addWizard.assetInformation.condition")}
						</p>
						{selectedCondition && (
							<BadgeTag
								label={selectedCondition.label}
								variant={getConditionVariant(selectedCondition.id)}
								size='sm'
							/>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}

export default StepReview;
