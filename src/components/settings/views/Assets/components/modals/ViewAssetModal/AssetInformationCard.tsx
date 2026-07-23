/** @format */

import { useTranslation } from "@/hooks/useTranslation";
import BadgeTag from "@/designSystem/BadgeTag";
import { SelectBoxCircleFill, ExclamationCircleRed } from "@/Icons";
import { getStatusVariant } from "../../../utils";
import type { AssetInformationCardProps } from "./types";

function AssetInformationCard({
	asset,
	assignedDate,
	notes,
	conditionLabel,
	isGoodCondition,
	status,
	statusLabel,
}: AssetInformationCardProps) {
	const { t } = useTranslation("settings");

	return (
		<div className='bg-bg-weak border border-border rounded-2xl p-4 shadow-sm'>
			{/* Serial Number */}
			<div className='flex flex-col gap-2 mb-4'>
				<p className='text-sm text-text-sub'>
					{t("assets.viewModal.serialNumber")}
				</p>
				<p className='text-base text-text-strong'>{asset.serial || ""}</p>
			</div>

			{/* Assigned Date */}
			{asset.status === "assigned" && (
				<div className='flex flex-col gap-2 mb-4'>
					<p className='text-sm text-text-sub'>
						{t("assets.viewModal.assignedDate")}
					</p>
					<p className='text-base text-text-strong'>{assignedDate}</p>
				</div>
			)}

			{/* Condition at Handover */}
			{asset.status === "assigned" && (
				<div className='flex flex-col gap-2 mb-4'>
					<p className='text-sm text-text-sub'>
						{t("assets.viewModal.conditionAtHandover")}
					</p>
					<div
						className={`flex items-center gap-1 rounded-lg w-fit pl-1 pr-1.5 py-1 ${
							isGoodCondition
								? "bg-success/10 border border-success/20"
								: "bg-error/10 border border-error/20"
						}`}>
						{isGoodCondition ? (
							<SelectBoxCircleFill size={16} className='fill-green' />
						) : (
							<ExclamationCircleRed size={16} />
						)}
						<p
							className={`text-xs font-medium leading-4 ${
								isGoodCondition ? "text-green" : "text-error"
							}`}>
							{conditionLabel}
						</p>
					</div>
				</div>
			)}

			{/* Current Condition */}
			<div className='flex flex-col gap-2 mb-4'>
				<p className='text-sm text-text-sub'>
					{t("assets.viewModal.currentCondition")}
				</p>
				<div
					className={`flex items-center gap-1 rounded-lg w-fit pl-1 pr-1.5 py-1 ${
						isGoodCondition
							? "bg-success/10 border border-success/20"
							: "bg-error/10 border border-error/20"
					}`}>
					{isGoodCondition ? (
						<SelectBoxCircleFill size={16} className='fill-green' />
					) : (
						<ExclamationCircleRed size={16} />
					)}
					<p
						className={`text-xs font-medium leading-4 ${
							isGoodCondition ? "text-green" : "text-error"
						}`}>
						{conditionLabel}
					</p>
				</div>
			</div>

			{/* Status */}
			<div className='flex flex-col gap-2 mb-4'>
				<p className='text-sm text-text-sub'>{t("assets.viewModal.status")}</p>
				<BadgeTag
					label={statusLabel}
					variant={getStatusVariant(status)}
					size='sm'
				/>
			</div>

			{/* Notes */}
			{notes && (
				<div className='flex flex-col gap-2'>
					<p className='text-sm text-text-sub'>{t("assets.viewModal.notes")}</p>
					<p className='text-base text-text-strong'>{notes}</p>
				</div>
			)}
		</div>
	);
}

export default AssetInformationCard;
