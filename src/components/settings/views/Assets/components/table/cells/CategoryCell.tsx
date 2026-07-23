/** @format */

import type { Asset } from "@/services/assetService";

interface CategoryCellProps {
	asset: Asset;
}

function CategoryCell({ asset }: CategoryCellProps) {
	const categoryName = asset.category_name || asset.category || "";

	if (!categoryName) return null;

	return (
		<div className='inline-flex items-center justify-center py-1 px-2 gap-0.5 h-6 bg-background border border-stroke-sub-300 rounded-md shadow-subtle'>
			<span className='text-xs font-medium leading-4 whitespace-nowrap text-text-sub'>
				{categoryName}
			</span>
		</div>
	);
}

export default CategoryCell;
