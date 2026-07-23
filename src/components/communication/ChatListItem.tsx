/** @format */

import { ChatListItem as ChatListItemType, isGroupChat } from "./types";
import { IndividualChatListItem } from "./individual";
import { GroupChatListItem } from "./group";

interface ChatListItemProps {
	chat: ChatListItemType;
	onClick?: () => void;
}

function ChatListItem({ chat, onClick }: ChatListItemProps) {
	if (isGroupChat(chat)) {
		return <GroupChatListItem chat={chat} onClick={onClick} />;
	}

	return <IndividualChatListItem chat={chat} onClick={onClick} />;
}

export default ChatListItem;
