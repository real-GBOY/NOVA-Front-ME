/** @format */

import type { Asset } from "@/services/assetService";

interface AssetNameCellProps {
	asset: Asset;
}

function AssetNameCell({ asset }: AssetNameCellProps) {
	const categoryName = asset.category_name || asset.category || "";
	const imageUrl = asset.image_url || "";

	return (
		<div className='flex items-center gap-2 ps-4'>
			{imageUrl && (
				<img
					src={imageUrl}
					alt={categoryName}
					className='w-5 h-5 object-contain'
				/>
			)}
			<span className='text-sm font-normal text-text-strong'>{asset.name}</span>
		</div>
	);
}

export default AssetNameCell;
