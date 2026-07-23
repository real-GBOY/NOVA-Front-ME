/** @format */

import { ReplyMessage } from "../types";
import { isEnglishText, cn } from "@/utilities/index";

interface ReplyPreviewProps {
	reply: ReplyMessage;
	className?: string;
	onGoToMessage?: (messageId: string) => void;
}

function ReplyPreview({ reply, className, onGoToMessage }: ReplyPreviewProps) {
	const handleClick = () => {
		if (onGoToMessage && reply.id) {
			onGoToMessage(reply.id);
		}
	};

	return (
		<div 
			className={`px-[12px] py-[8px] ${onGoToMessage ? 'cursor-pointer transition-colors' : ''} ${className}`}
			onClick={handleClick}
			role={onGoToMessage ? "button" : undefined}
			tabIndex={onGoToMessage ? 0 : undefined}
			onKeyDown={onGoToMessage ? (e) => {
				if (e.key === 'Enter' || e.key === ' ') {
					e.preventDefault();
					handleClick();
				}
			} : undefined}
		>
			<p className='text-xs text-text-sub leading-[16px] overflow-ellipsis overflow-hidden whitespace-nowrap'>
				{reply.content}
			</p>
		</div>
	);
}

export default ReplyPreview;
