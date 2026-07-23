/** @format */

import IconButton from "@/designSystem/IconButton";
import { CloseLine } from "@/Icons";
import type { ViewAssetModalHeaderProps } from "./types";

function ViewAssetModalHeader({ onClose }: ViewAssetModalHeaderProps) {
	return (
		<div className='flex items-center justify-between px-5 py-4 border-b border-border'>
			<div className='flex items-center gap-4'>
				{/* Navigation removed for now - can be added later if needed */}
			</div>
			<IconButton
				Icon={CloseLine}
				ariaLabel='Close'
				onClick={onClose}
				variant='ghost'
				className='!w-auto !h-auto !p-0.5 !rounded-md !border-0'
			/>
		</div>
	);
}

export default ViewAssetModalHeader;
