/** @format */

import { useTranslation } from "@/hooks/useTranslation";
import type { AssignedToCardProps } from "./types";

function AssignedToCard({ assignedTo }: AssignedToCardProps) {
	const { t } = useTranslation("settings");

	return (
		<div className='bg-background border border-border rounded-2xl p-4 shadow-sm'>
			<div className='flex items-center justify-between mb-4'>
				<h3 className='text-sm font-medium text-text-strong'>
					{t("assets.viewModal.assignedTo")}
				</h3>
				<button className='text-xs font-medium text-text-strong hover:text-primary transition-colors'>
					{t("assets.viewModal.viewDetails")}
				</button>
			</div>
			<div className='flex items-center gap-3'>
				<div className='w-12 h-12 rounded-full bg-bg-weak flex items-center justify-center'>
					{assignedTo.avatar ? (
						<img
							src={assignedTo.avatar}
							alt={assignedTo.name}
							className='w-full h-full rounded-full object-cover'
						/>
					) : (
						<span className='text-sm text-text-sub'>
							{assignedTo.name.charAt(0).toUpperCase()}
						</span>
					)}
				</div>
				<div className='flex-1 min-w-0'>
					<p className='text-base font-medium text-text-strong'>
						{assignedTo.name}
					</p>
					{assignedTo.jobTitle && (
						<p className='text-sm text-text-sub'>{assignedTo.jobTitle}</p>
					)}
				</div>
				{assignedTo.contractName && (
					<div className='flex-1 min-w-0'>
						<p className='text-xs text-text-soft mb-1'>
							{t("assets.viewModal.contractName")}
						</p>
						<p className='text-sm font-medium text-text-strong'>
							{assignedTo.contractName}
						</p>
					</div>
				)}
			</div>
		</div>
	);
}

export default AssignedToCard;
