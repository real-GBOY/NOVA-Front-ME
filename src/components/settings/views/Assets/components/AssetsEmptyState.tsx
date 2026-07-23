/** @format */

import React from "react";
import { useTranslation } from "@/hooks/useTranslation";

const AssetsEmptyState: React.FC = () => {
	const { t } = useTranslation("settings");

	return (
		<div className='flex w-full flex-col items-center justify-center gap-6 pt-12'>
			<img
				src='/icons/image31.png'
				alt='No assets'
				className='w-[156px] h-[117px] object-contain mt-12'
			/>
			<div className='flex flex-col items-center gap-2 text-center'>
				<p className='text-lg font-medium leading-6 text-text-strong tracking-tight'>
					{t("assets.emptyState.title")}
				</p>
				<p className='w-[308px] text-sm text-text-sub font-normal leading-5'>
					{t("assets.emptyState.description")}
				</p>
			</div>
		</div>
	);
};

export default AssetsEmptyState;
