/** @format */

import type { Asset } from "@/services/assetService";

interface SerialNumberCellProps {
	asset: Asset;
}

function SerialNumberCell({ asset }: SerialNumberCellProps) {
	return (
		<span className='text-sm text-text-strong'>{asset.serial || "-"}</span>
	);
}

export default SerialNumberCell;
