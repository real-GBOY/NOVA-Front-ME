/** @format */

import { ThumbtackSlanted, ChatHead } from "@/Icons";
import { GroupChat } from "@/components/communication/types";
import { LastMessagePreview } from "../shared";
import { getGroupInitials } from "../utils";
import { isEnglishText, cn } from "@/utilities/index";

interface GroupChatListItemProps {
	chat: GroupChat;
	onClick?: () => void;
}

function GroupChatListItem({ chat, onClick }: GroupChatListItemProps) {
	const {
		name,
		avatar,
		lastMessage,
		timestamp,
		isPinned,
		hasUnread,
		messageType,
		isTyping,
		isActive,
	} = chat;

	return (
		<div
			className={`flex flex-col items-start p-4 gap-2 h-[76px] cursor-pointer ${
				isActive ? "bg-primary/10" : "bg-background"
			} ${!isActive ? "border-b border-border" : ""}`}
			onClick={onClick}>
			{/* Person Container */}
			<div className='flex flex-row items-start p-0 gap-3 w-full'>
				{/* Group Avatar */}
				<div className='relative w-10 h-10'>
					{avatar ? (
						<img
							src={avatar}
							alt={name}
							className='w-10 h-10 rounded-full object-cover'
							onError={(e) => {
								const target = e.target as HTMLImageElement;
								if (target.src !== "/icons/defAvatar.png") {
									target.src = "/icons/defAvatar.png";
								}
							}}
						/>
					) : (
						<div className='w-10 h-10 rounded-full bg-border flex items-center justify-center'>
							<span className='text-base font-medium text-text-strong leading-6 tracking-[-0.011em] text-center'>
								{getGroupInitials(name)}
							</span>
						</div>
					)}
				</div>
				{/* Text Container */}
				<div className='flex flex-col items-start p-0 gap-1 flex-1 min-w-0'>
					{/* Name + Job title */}
					<div className='flex flex-col items-start p-0 gap-0.5 w-full'>
						{/* Group Name Row */}
						<div className='flex flex-row justify-between items-start p-0 gap-2 w-full h-5'>
							{/* Group Name */}
							<h3
								className={cn(
									"text-sm font-medium text-text-strong leading-5 tracking-[-0.006em] flex-1",
									isEnglishText(name) && "font-english"
								)}>
								{name}
							</h3>
							{/* Timestamp and Icons */}
							<div className='flex flex-row items-center gap-2'>
								<span className='text-xs font-normal text-text-soft leading-4'>
									{timestamp}
								</span>
								{isPinned && <ThumbtackSlanted size={16} />}
							</div>
						</div>
					</div>
					{/* Conversation Row */}
					<div className='flex flex-row items-center p-0 gap-6 w-full h-5'>
						{/* Message Container */}
						<div className='flex flex-row items-center p-0 gap-1 flex-1 min-w-0'>
							<LastMessagePreview
								lastMessage={lastMessage}
								messageType={messageType}
								isTyping={isTyping}
								hasUnread={hasUnread}
							/>
						</div>
						{/* Unread Indicator */}
						{hasUnread && !isPinned && (
							<div className='animate-unread-pulse'>
								<ChatHead size={16} />
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}

export default GroupChatListItem;
