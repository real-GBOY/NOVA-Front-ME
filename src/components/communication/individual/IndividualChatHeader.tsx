/** @format */

import { ChatUser } from "../types";
import IconButton from "@/designSystem/IconButton";
import { ArrowLeftSLine } from "@/Icons";
import Avatar from "@/designSystem/Avatar";

interface IndividualChatHeaderProps {
	user: ChatUser;
	roomAvatarUrl?: string | null; // Optional room avatar URL for fallback
	onBack?: () => void;
}

function IndividualChatHeader({
	user,
	roomAvatarUrl,
	onBack,
}: IndividualChatHeaderProps) {
	// Ensure avatar is properly set - prioritize user.avatar, then roomAvatarUrl, then undefined for fallback
	const avatarSrc =
		(user.avatar && user.avatar.trim()) ||
		(roomAvatarUrl && roomAvatarUrl.trim()) ||
		undefined;

	return (
		<div className='flex items-center justify-between bg-background rounded-[14px] md:rounded-[18px] border border-border px-3 md:px-4 py-2 md:py-3 shadow-sm min-w-0'>
			<div className='flex items-center gap-2 md:gap-3 min-w-0'>
				{onBack ? (
					<IconButton
						Icon={ArrowLeftSLine}
						ariaLabel='Back to chats'
						variant='ghost'
						onClick={onBack}
						className='w-8 h-8 md:w-9 md:h-9 rounded-full border border-border'
					/>
				) : null}
				<Avatar
					src={avatarSrc}
					alt={user.name}
					size='md'
					showOnlineIndicator
					isOnline={user.isOnline}
				/>
				<div className="min-w-0">
					<h2 className='text-sm md:text-base font-semibold text-text-strong truncate'>
						{user.name}
					</h2>
					<p className='text-[11px] md:text-xs text-text-sub truncate'>
						{user.role && user.role.trim() && `${user.role} • `}
						<span className={user.isOnline ? "text-success" : "text-text-soft"}>
							{user.isOnline ? "Online" : "Offline"}
						</span>
					</p>
				</div>
			</div>
		</div>
	);
}

export default IndividualChatHeader;
