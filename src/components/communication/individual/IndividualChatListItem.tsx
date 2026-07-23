/** @format */

import { ThumbtackSlanted, ChatHead } from "@/Icons";
import { IndividualChat } from "@/components/communication/types";
import Avatar from "@/designSystem/Avatar";
import { LastMessagePreview } from "../shared";
import { isEnglishText, cn } from "@/utilities/index";

interface IndividualChatListItemProps {
	chat: IndividualChat;
	onClick?: () => void;
}

function IndividualChatListItem({
	chat,
	onClick,
}: IndividualChatListItemProps) {
	const {
		user,
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
			className={`flex flex-col items-start p-4 gap-2 h-[94px] cursor-pointer ${
				isActive ? "bg-primary/10" : "bg-background"
			} ${!isActive ? "border-b border-border" : ""}`}
			onClick={onClick}>
			{/* Person Container */}
			<div className='flex flex-row items-start p-0 gap-3 w-full'>
				<Avatar
					src={user.avatar}
					alt={user.name}
					size='md'
					showOnlineIndicator={true}
					isOnline={user.isOnline}
				/>
				{/* Text Container */}
				<div className='flex flex-col items-start p-0 gap-1 flex-1 min-w-0'>
					{/* Name + Job title */}
					<div className='flex flex-col items-start p-0 gap-0.5 w-full'>
						{/* Name Row */}
						<div className='flex flex-row justify-between items-center p-0 gap-2 w-full h-5'>
							{/* Name */}
							<h3 className={cn('text-sm font-medium text-text-strong leading-5 tracking-[-0.006em] flex-1', isEnglishText(user.name) && 'font-english')}>
								{user.name}
							</h3>
							{/* Timestamp and Icons */}
							<div className='flex flex-row items-center gap-2'>
								<span className='text-xs font-normal text-text-soft leading-4'>
									{timestamp}
								</span>
								{isPinned && <ThumbtackSlanted size={16} />}
							</div>
						</div>
						{/* Job Title */}
						{user.jobTitle && user.jobTitle.trim() && (
							<p className={cn('text-xs font-normal text-text-soft leading-4 w-full h-4', isEnglishText(user.jobTitle) && 'font-english')}>
								{user.jobTitle}
							</p>
						)}
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

export default IndividualChatListItem;