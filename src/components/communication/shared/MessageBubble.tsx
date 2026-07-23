/** @format */

import { memo, useState } from "react";
import { ArrowTurnLeft } from "@/Icons";
import VoiceMessage from "./VoiceMessage";
import FileAttachment from "./FileAttachment";
import ReplyPreview from "./ReplyPreview";
import { ChatMessage } from "../types";
import Avatar from "@/designSystem/Avatar";
import IconButton from "@/designSystem/IconButton";
import Modal from "@/designSystem/Modal";
import { isEnglishText, cn } from "@/utilities/index";
import { useTranslation } from "@/hooks/useTranslation";

interface MessageBubbleProps {
	message: ChatMessage;
	isOwn?: boolean;
	onReply?: (message: ChatMessage) => void;
	onGoToMessage?: (messageId: string) => void;
}

function MessageBubble({
	message,
	isOwn = false,
	onReply,
	onGoToMessage,
}: MessageBubbleProps) {
	const { t } = useTranslation("common");
	const [isImageModalOpen, setIsImageModalOpen] = useState(false);
	const timeLabel = isOwn ? "mr-1" : "ml-1";
	const bubbleMaxWidth = "max-w-[70vw] sm:max-w-[520px]";
	const senderInitials = message.senderName
		? message.senderName
				.split(" ")
				.filter(Boolean)
				.slice(0, 2)
				.map((part) => part[0]?.toUpperCase())
				.join("")
		: "";
	
	const isImage = message.type === "file" && (
		message.mimeType?.startsWith("image/") || 
		/\.(jpg|jpeg|png|gif|webp)$/i.test(message.fileName || "")
	);

	// Helper to render the main message content
	// Now always fully rounded as per "message have rounded not rounded-b" instruction
	const renderMainMessageContent = () => {
		const borderRadiusClasses = "rounded-[16px]";

		if (message.type === "voice") {
			return (
				<div className={`${bubbleMaxWidth} ${borderRadiusClasses} ${isOwn ? "bg-primary border border-primary/10" : "bg-background border border-border"} overflow-hidden`}>
					<VoiceMessage
						duration={message.voiceDuration || "0:00"}
						isOwn={isOwn}
						audioUrl={message.fileUrl}
					/>
				</div>
			);
		}
		
		if (isImage) {
			return (
				<div 
					onClick={() => setIsImageModalOpen(true)}
					className={`${bubbleMaxWidth} ${borderRadiusClasses} ${isOwn ? "" : "p-1 bg-background border border-border"} overflow-hidden cursor-pointer hover:opacity-95 transition-opacity`}
				>
					<img 
						src={message.fileUrl} 
						alt={message.fileName || "Image"} 
						className="max-w-full h-auto object-cover"
						style={{ maxHeight: '300px' }}
					/>
				</div>
			);
		}
		
		if (message.type === "file") {
			return (
				<div className={`${bubbleMaxWidth} ${borderRadiusClasses} ${isOwn ? "bg-primary" : ""}`}>
					<FileAttachment
						fileName={message.fileName || ""}
						fileSize={message.fileSize || ""}
						fileUrl={message.fileUrl}
						isOwn={isOwn}
						mimeType={message.mimeType}
					/>
				</div>
			);
		}

		// Default to text message
		const isEnglish = isEnglishText(message.content);
		return (
			<div className={`${bubbleMaxWidth} ${borderRadiusClasses} px-3 py-3 ${isOwn ? "bg-primary text-background" : "bg-background border border-border text-text-strong"}`}>
				<p className={cn('text-sm', isEnglish && 'font-english')}>{message.content}</p>
			</div>
		);
	};

	const renderMessageWithReply = () => {
		// Outer container for the entire reply block
		// Background for the outer reply container is bg-primary/10 for both isOwn and !isOwn
		const containerBgClass = "bg-primary/10";
		const containerBorderClass = ""; 
		const containerShadowClass = ""; 

		return (
			<div className={`flex flex-col rounded-[16px] overflow-hidden ${bubbleMaxWidth} ${containerBgClass} ${containerBorderClass} ${containerShadowClass}`}>
				{/* Reply Preview Section (top part of the block) */}
				<ReplyPreview 
					reply={message.replyTo!} 
					className={`rounded-t-[16px] rounded-b-none bg-transparent px-[12px] py-[8px]`} 
					onGoToMessage={onGoToMessage}
				/>
				
				{/* Main Message Section (bottom part of the block) */}
				{message.type === "voice" ? (
					<div className={`${isOwn ? "bg-primary" : "bg-background border border-border"} overflow-hidden rounded-[16px]`}>
						<VoiceMessage
							duration={message.voiceDuration || "0:00"}
							isOwn={isOwn}
							audioUrl={message.fileUrl}
						/>
					</div>
				) : isImage ? (
					<div 
						onClick={() => setIsImageModalOpen(true)}
						className={`${isOwn ? "" : "p-1 bg-background border border-border"} overflow-hidden rounded-[16px] cursor-pointer hover:opacity-95 transition-opacity`}
					>
						<img 
							src={message.fileUrl} 
							alt={message.fileName || "Image"} 
							className="max-w-full h-auto object-cover"
							style={{ maxHeight: '300px' }}
						/>
					</div>
				) : message.type === "file" ? (
					<div className={`${isOwn ? "bg-primary" : "bg-background border border-border"} rounded-[16px]`}>
						<FileAttachment
							fileName={message.fileName || ""}
							fileSize={message.fileSize || ""}
							fileUrl={message.fileUrl}
							isOwn={isOwn}
							mimeType={message.mimeType}
						/>
					</div>
				) : (
					<div className={`px-3 py-3 ${isOwn ? "bg-primary text-background" : "bg-background border border-border text-text-strong"} rounded-[16px]`}>
						<p className={cn('text-sm', isEnglishText(message.content) && 'font-english')}>{message.content}</p>
					</div>
				)}
			</div>
		);
	};

	const imageModal = isImage && isImageModalOpen && (
		<Modal
			isOpen={isImageModalOpen}
			onClose={() => setIsImageModalOpen(false)}
			title={message.fileName || "Image Preview"}
			size="large"
			width="max-w-[95vw] w-full"
			contentClassName="p-6 flex items-center justify-center bg-transparent h-full w-full overflow-hidden"
		>
			<img
				src={message.fileUrl}
				alt={message.fileName || "Image"}
				className="max-w-full max-h-full object-contain rounded-lg"
			/>
		</Modal>
	);

	if (isOwn) {
		return (
			<div className='flex items-start justify-end gap-3 mb-4'>
				<div className='flex flex-col items-end flex-1'>
					{message.senderName && (
						<div className='mb-1 flex flex-row justify-end items-center gap-1 pr-1'>
							<span className={cn('text-sm font-medium text-text-strong leading-5 flex items-center', isEnglishText(message.senderName) && 'font-english')}>
								{message.senderName}
							</span>
							{message.senderRole && (
								<>
									<span className='text-xs font-normal text-text-soft leading-4 flex items-center'>
										•
									</span>
									<span className={cn('text-sm font-normal text-text-soft leading-5 flex items-center', isEnglishText(message.senderRole) && 'font-english')}>
										{message.senderRole}
									</span>
								</>
							)}
						</div>
					)}
					<div className='flex items-center justify-end gap-2 w-full'>
						<IconButton
							Icon={ArrowTurnLeft}
							ariaLabel='Reply'
							onClick={() => onReply?.(message)}
							className='w-[26px] h-[26px] p-0.5 rounded-full bg-background border border-border'
						/>
						{message.replyTo ? renderMessageWithReply() : renderMainMessageContent()}
					</div>
					<p className={`text-xs text-text-soft mt-1 ${timeLabel}`}>
						{message.timestamp}
					</p>
				</div>
				<Avatar
					src={message.senderAvatar}
					alt={message.senderName || t("messages.you")}
					size='lg'
					showOnlineIndicator={message.senderIsOnline}
					isOnline={message.senderIsOnline}
				>
					{senderInitials ? (
						<span className="text-[10px] font-semibold text-text-strong">
							{senderInitials}
						</span>
					) : null}
				</Avatar>
				{imageModal}
			</div>
		);
	}

	return (
		<div className='flex items-start gap-3'>
			<Avatar 
				src={message.senderAvatar} 
				alt={message.senderName} 
				size='lg' 
				showOnlineIndicator={message.senderIsOnline}
				isOnline={message.senderIsOnline}
			>
				{senderInitials ? (
					<span className="text-[10px] font-semibold text-text-strong">
						{senderInitials}
					</span>
				) : null}
			</Avatar>
			<div className='flex-1'>
				{message.senderName && (
					<div className='mb-1 flex flex-row items-center gap-1'>
						<span className={cn('text-sm font-medium text-text-strong leading-5 flex items-center tracking-[-0.006em]', isEnglishText(message.senderName) && 'font-english')}>
							{message.senderName}
						</span>
						{message.senderRole && (
							<>
								<span className='text-xs font-normal text-text-soft leading-4 flex items-center'>
									•
								</span>
								<span className={cn('text-sm font-normal text-text-soft leading-5 flex items-center tracking-[-0.006em]', isEnglishText(message.senderRole) && 'font-english')}>
									{message.senderRole}
								</span>
							</>
						)}
					</div>
				)}
				<div className='flex items-center gap-2'>
					{message.replyTo ? renderMessageWithReply() : renderMainMessageContent()}
					<IconButton
						Icon={ArrowTurnLeft}
						ariaLabel={t("messages.reply")}
						onClick={() => onReply?.(message)}
						className='w-[26px] h-[26px] p-0.5 rounded-full bg-background border border-border'
					/>
				</div>
				<p className={`text-xs text-text-soft mt-1 ${timeLabel}`}>
					{message.timestamp}
				</p>
			</div>
			{imageModal}
		</div>
	);
}

export default memo(MessageBubble);
