/** @format */

import { ReactNode } from "react";

interface InfoCardProps {
	title: ReactNode;
	icon?: ReactNode;
	children: ReactNode;
}

function InfoCard({ title, icon, children }: InfoCardProps) {
	return (
		<div className='rounded-2xl border border-border bg-background p-4 overflow-visible'>
			<div className='mb-5 flex items-center gap-3'>
				{icon}
				<h3 className='flex-1 w-full text-lg font-medium leading-6 text-text-strong tracking-tight'>
					{title}
				</h3>
			</div>
			<div className='flex flex-col gap-4 overflow-visible'>{children}</div>
		</div>
	);
}

export default InfoCard;
