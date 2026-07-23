/** @format */

import { Paperclip } from "@/Icons";
import { ChatMessage } from "../types";

interface ReplyFileMessageProps {
	message: ChatMessage;
	isOwn?: boolean;
}

function ReplyFileMessage({ message }: ReplyFileMessageProps) {
	if (!message.replyTo || message.replyTo.type !== "file") return null;

	const fileLabel = message.replyTo.fileName || message.replyTo.content;

	return (
		<div className='flex flex-col w-full max-w-[328px] rounded-2xl border border-primary/15 overflow-hidden'>
			<div className='flex flex-row items-center px-3 py-2 gap-2 w-full bg-primary/5'>
				<Paperclip size={16} className='text-primary opacity-80 flex-shrink-0' />
				<div className='min-w-0 flex-1'>
					<p className='text-xs font-semibold text-text-strong leading-4 truncate'>
						{fileLabel}
					</p>
					{message.replyTo.fileSize && (
						<p className='text-[11px] text-text-soft'>{message.replyTo.fileSize}</p>
					)}
				</div>
			</div>

			<div className='flex flex-col items-start px-3 py-3 gap-2 bg-primary w-full'>
				<p className='text-sm font-medium text-white leading-5 w-full'>
					{message.content}
				</p>
			</div>
		</div>
	);
}

export default ReplyFileMessage;
