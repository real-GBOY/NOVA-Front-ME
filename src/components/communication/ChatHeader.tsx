/** @format */

import { ChatUser, GroupChat } from "./types";
import { IndividualChatHeader } from "./individual";
import { GroupChatHeader } from "./group";

interface ChatHeaderProps {
	user?: ChatUser;
	group?: GroupChat;
	roomAvatarUrl?: string | null; // Optional room avatar URL for fallback (same as sidebar uses)
}

function ChatHeader({ user, group, roomAvatarUrl }: ChatHeaderProps) {
	if (group) {
		return <GroupChatHeader group={group} />;
	}

	if (user) {
		return <IndividualChatHeader user={user} roomAvatarUrl={roomAvatarUrl} />;
	}

	return null;
}

export default ChatHeader;
