/** @format */

import BadgeTag from "@/designSystem/BadgeTag";
import { getStatusVariant } from "../../../utils";
import type { Asset } from "@/services/assetService";

interface StatusCellProps {
	asset: Asset;
}

function StatusCell({ asset }: StatusCellProps) {
	const status = asset.status || "available";
	const statusLabel =
		status === "assigned"
			? "In-use"
			: status.charAt(0).toUpperCase() + status.slice(1);
	return (
		<BadgeTag
			label={statusLabel}
			variant={getStatusVariant(status)}
			size='sm'
		/>
	);
}

export default StatusCell;
