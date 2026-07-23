/** @format */

import { SelectBoxCircleFill, ExclamationCircleRed } from "@/Icons";
import { getConditionVariant } from "../../../utils";
import type { Asset } from "@/services/assetService";

interface ConditionCellProps {
	asset: Asset;
}

function ConditionCell({ asset }: ConditionCellProps) {
	const condition = asset.asset_condition || "good";
	const conditionLabel =
		condition === "poor"
			? "Damageed"
			: condition.charAt(0).toUpperCase() + condition.slice(1);
	const variant = getConditionVariant(condition);

	// Determine colors and icon based on variant
	const isGood = variant === "success";
	const IconComponent = isGood ? SelectBoxCircleFill : ExclamationCircleRed;

	return (
		<div className='flex items-center py-3 pr-3'>
			<div className='flex items-center gap-1 rounded-lg'>
				<IconComponent
					size={16}
					className={isGood ? "fill-green" : undefined}
				/>
				<p
					className={`text-xs font-medium leading-4 ${
						isGood ? "text-green" : "text-error"
					}`}>
					{conditionLabel}
				</p>
			</div>
		</div>
	);
}

export default ConditionCell;
