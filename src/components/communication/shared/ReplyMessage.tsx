/** @format */

import { ChatMessage } from "@/components/communication/types";
import { Play } from "@/Icons";
import IconButton from "@/designSystem/IconButton";

interface ReplyMessageProps {
	message: ChatMessage;
	isOwn?: boolean;
}

function ReplyMessage({ message }: ReplyMessageProps) {
	if (!message.replyTo) return null;

	const waveformHeights = [
		20, 36, 27, 14, 24, 25, 20, 26, 36, 23, 27, 21, 20, 20, 14, 29, 36, 36, 24,
		29, 27, 27, 25, 11, 14, 14, 26, 8, 24, 24, 23, 8, 25, 25, 21, 8, 26, 26, 29,
		29, 23, 23, 11, 8, 21, 29, 21, 8, 8, 25, 11, 11, 8, 17, 8, 8,
	];

	return (
		<div className='flex flex-col w-full max-w-[328px] rounded-2xl border border-primary/15 bg-primary/5 overflow-hidden'>
			<div className='flex flex-row items-start px-3 py-2 w-full'>
				<p className='text-xs font-medium text-text-sub leading-4 flex-1'>
					{message.replyTo.content}
				</p>
			</div>
			<div className='flex flex-row items-end px-3 py-3 gap-3 bg-primary rounded-t-2xl'>
				<IconButton
					Icon={Play}
					ariaLabel='Play voice message'
					active={true}
					className='!w-9 !h-9 !rounded-full !border-0 !bg-background'
					variant='ghost'
				/>
				<div className='flex-1 flex items-center gap-0.5 h-9'>
					{waveformHeights.map((height, i) => (
						<div
							key={i}
							className='w-[1.9px] bg-background rounded-full flex-shrink-0'
							style={{ height: `${height}px` }}
						/>
					))}
				</div>
				<span className='text-xs font-medium text-text-main flex-shrink-0'>
					{message.voiceDuration || "1:24"}
				</span>
			</div>
		</div>
	);
}

export default ReplyMessage;
