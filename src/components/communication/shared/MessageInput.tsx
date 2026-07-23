/** @format */

import { Paperclip, Microphone, Send, Reply, CloseLine } from "@/Icons";
import { ChatMessage } from "@/components/communication/types";
import GenericForm from "@/designSystem/GenericForm";
import IconButton from "@/designSystem/IconButton";
import { UseFormReturn } from "react-hook-form";
import { useRef, useState, useEffect } from "react";
import * as yup from "yup";
import { useFileUpload } from "@/hooks/useFileUpload";
import toast from "@/utilities/toast";
import { useTranslation } from "@/hooks/useTranslation";

interface MessageInputProps {
	value?: string;
	onChange?: (value: string) => void;
	onSend?: () => void;
	onAttachFile?: (
		fileId: number,
		token: string,
		fileName: string,
		fileUrl: string,
		fileSizeBytes: number
	) => void;
	onVoiceMessage?: (audioBlob: Blob, duration: number) => void;
	replyingTo?: ChatMessage | null;
	onCancelReply?: () => void;
	isReadOnly?: boolean;
}

const messageSchema = yup.object({
	message: yup.string().optional(),
});

type MessageFormData = yup.InferType<typeof messageSchema>;

function MessageInput({
	value = "",
	onChange,
	onSend,
	onAttachFile,
	onVoiceMessage,
	replyingTo,
	onCancelReply,
	isReadOnly = false,
}: MessageInputProps) {
	const { t } = useTranslation("common");
	const formInstanceRef = useRef<UseFormReturn<MessageFormData> | null>(null);
	const [isRecording, setIsRecording] = useState(false);
	const [recordingTime, setRecordingTime] = useState(0);
	const [recordingError, setRecordingError] = useState<string | null>(null);
	const mediaRecorderRef = useRef<MediaRecorder | null>(null);
	const audioChunksRef = useRef<Blob[]>([]);
	const streamRef = useRef<MediaStream | null>(null);
	const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);
	
	// Refs to track cancellation state
	const isRecordingCancelledRef = useRef(false);
	const isUploadCancelledRef = useRef(false);

	// File upload state - tracks pending file before user sends it
	const [pendingFile, setPendingFile] = useState<{
		file: File;
		fileId: number;
		token: string;
		fileUrl: string;
		progress: number;
		isUploading: boolean;
	} | null>(null);
	const { uploadFile } = useFileUpload();

	const getReplyContent = () => {
		if (!replyingTo) return null;
		if (replyingTo.type === "file" && replyingTo.fileName) {
			return replyingTo.fileName;
		}
		return replyingTo.content || "";
	};

	const handleSubmit = async (data: MessageFormData) => {
		if (isReadOnly) return;
		if (data.message?.trim()) {
			onSend?.();
			// Reset form after sending
			if (formInstanceRef.current) {
				formInstanceRef.current.reset({ message: "" });
			}
		}
	};

	const handleFieldChange = (field: keyof MessageFormData, value: unknown) => {
		if (field === "message") {
								onChange?.(value as string);
					}
				};
			
				const handleSendClick = () => {
					if (isReadOnly) return;
					if (formInstanceRef.current) {
						const currentValue = formInstanceRef.current.getValues("message");
						// Allow sending if there's text OR if we are uploading a file (though file upload is handled separately)
						// Actually, onSend just triggers the text send callback. File upload triggers onAttachFile.
						if (currentValue?.trim()) {
							onSend?.();
							formInstanceRef.current.reset({ message: "" });
						}
					}
				};
	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (isReadOnly) return;
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSendClick();
		}
	};

	// Format time as MM:SS
	const formatTime = (seconds: number): string => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins}:${secs.toString().padStart(2, "0")}`;
	};

	// Start recording
	const startRecording = async () => {
		if (isReadOnly) return;
		try {
			setRecordingError(null);
			isRecordingCancelledRef.current = false;
			const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
			streamRef.current = stream;

			// Determine supported mime type
			let mimeType = "audio/webm;codecs=opus";
			if (!MediaRecorder.isTypeSupported(mimeType)) {
				mimeType = "audio/webm";
				if (!MediaRecorder.isTypeSupported(mimeType)) {
					mimeType = "audio/mp4"; // Safari fallback
					if (!MediaRecorder.isTypeSupported(mimeType)) {
						mimeType = ""; // Let browser choose default
					}
				}
			}

			const options = mimeType ? { mimeType } : undefined;
			const mediaRecorder = new MediaRecorder(stream, options);
			
			mediaRecorderRef.current = mediaRecorder;
			audioChunksRef.current = [];

			mediaRecorder.ondataavailable = (event) => {
				if (event.data.size > 0) {
					audioChunksRef.current.push(event.data);
				}
			};

			mediaRecorder.onstop = () => {
				if (isRecordingCancelledRef.current) {
					cleanup();
					return;
				}

				const type = mediaRecorder.mimeType || mimeType || "audio/webm";
				const audioBlob = new Blob(audioChunksRef.current, { type });
				onVoiceMessage?.(audioBlob, recordingTime);
				cleanup();
			};

			mediaRecorder.onerror = () => {
				setRecordingError("Recording error occurred");
				stopRecording();
			};

			mediaRecorder.start();
			setIsRecording(true);
			setRecordingTime(0);

			// Start timer
			timerIntervalRef.current = setInterval(() => {
				setRecordingTime((prev) => prev + 1);
			}, 1000);
		} catch (error) {
			setRecordingError("Microphone access denied");
			console.error("Error accessing microphone:", error);
		}
	};

	// Stop recording
	const stopRecording = () => {
		if (mediaRecorderRef.current && isRecording) {
			mediaRecorderRef.current.stop();
			setIsRecording(false);
			if (timerIntervalRef.current) {
				clearInterval(timerIntervalRef.current);
				timerIntervalRef.current = null;
			}
		}
	};

	// Cancel recording
	const cancelRecording = () => {
		isRecordingCancelledRef.current = true;
		if (mediaRecorderRef.current && isRecording) {
			mediaRecorderRef.current.stop();
			setIsRecording(false);
			audioChunksRef.current = [];
			if (timerIntervalRef.current) {
				clearInterval(timerIntervalRef.current);
				timerIntervalRef.current = null;
			}
		}
		cleanup();
		setRecordingTime(0);
		setRecordingError(null);
	};

	// Cleanup function
	const cleanup = () => {
		if (streamRef.current) {
			streamRef.current.getTracks().forEach((track) => track.stop());
			streamRef.current = null;
		}
	};

	// Handle voice button click
	const handleVoiceClick = () => {
		if (isReadOnly) return;
		if (isRecording) {
			stopRecording();
		} else {
			startRecording();
		}
	};

	// Handle file attachment click
	const handleAttachClick = () => {
		if (isReadOnly) return;
		fileInputRef.current?.click();
	};

	// Handle file selection
	const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
		if (isReadOnly) return;
		const file = e.target.files?.[0];
		if (!file) return;

		// Check file size (max 10MB for chat attachments - backend limit)
		const maxSizeMB = 10;
		const fileSizeMB = file.size / (1024 * 1024);
		if (fileSizeMB > maxSizeMB) {
			toast.error(`File size must be less than ${maxSizeMB}MB`);
			return;
		}

		// Initialize pending file with uploading state
		setPendingFile({
			file,
			fileId: 0, // Will be updated after upload
			token: '',
			fileUrl: '',
			progress: 0,
			isUploading: true,
		});
		isUploadCancelledRef.current = false;

		try {
			// Upload file to S3 and get the token
			const result = await uploadFile(file, {
				purpose: "chat_attachment",
				maxSizeBytes: maxSizeMB * 1024 * 1024,
				onProgress: (progress) => {
					setPendingFile((prev) => prev ? { ...prev, progress } : null);
				},
			});

			if (isUploadCancelledRef.current) {
				setPendingFile(null);
				return;
			}

			// Update pending file with upload result
			// DO NOT call onAttachFile here - wait for user to click send
			setPendingFile({
				file,
				fileId: result.fileId,
				token: result.token,
				fileUrl: result.fileUrl,
				progress: 100,
				isUploading: false,
			});
		} catch (error) {
			console.error("File upload failed:", error);
			if (!isUploadCancelledRef.current) {
				toast.error("Failed to upload file. Please try again.");
			}
			setPendingFile(null);
		}

		// Reset input
		if (e.target) {
			e.target.value = "";
		}
	};

	// Cancel file attachment
	const handleCancelFile = () => {
		isUploadCancelledRef.current = true;
		setPendingFile(null);
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	// Send pending file attachment
	const handleSendFile = () => {
		if (isReadOnly) return;
		if (!pendingFile || pendingFile.isUploading) return;

		// Send the file with token to parent component
		onAttachFile?.(
			pendingFile.fileId,
			pendingFile.token,
			pendingFile.file.name,
			pendingFile.fileUrl,
			pendingFile.file.size
		);

		// Clear pending file
		setPendingFile(null);
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			cleanup();
			if (timerIntervalRef.current) {
				clearInterval(timerIntervalRef.current);
			}
		};
	}, []);

	const renderFields = (form: UseFormReturn<MessageFormData>) => {
		formInstanceRef.current = form;
		const { register, watch, setValue } = form;
		const messageValue = watch("message") || value;

		return (
			<div className='pt-3'>
				{/* Hidden file input */}
				<input
					ref={fileInputRef}
					type='file'
					onChange={handleFileSelect}
					accept='image/*,.pdf,.doc,.docx,.xls,.xlsx'
					className='hidden'
					disabled={isReadOnly}
				/>

				{/* Pending file attachment preview */}
				{pendingFile && (
					<div className='mb-3 p-3 rounded-lg bg-bg-weak border border-border'>
						<div className='flex items-center justify-between mb-2'>
							<div className='flex items-center gap-2 flex-1 min-w-0'>
								<Paperclip size={16} className='text-text-sub shrink-0' />
								<span className='text-sm text-text-strong truncate'>
									{pendingFile.file.name}
								</span>
							</div>
							<div className='flex items-center gap-2'>
								{!pendingFile.isUploading && (
									<button
										onClick={handleSendFile}
										className={`text-primary transition-colors ${
											isReadOnly ? "opacity-40 cursor-not-allowed" : "hover:text-primary/80"
										}`}
										type='button'
										title='Send attachment'
										disabled={isReadOnly}>
										<Send size={20} />
									</button>
								)}
								<button
									onClick={handleCancelFile}
									className='text-text-sub hover:text-text-strong'
									type='button'>
									<CloseLine size={16} />
								</button>
							</div>
						</div>
						{pendingFile.isUploading && (
							<div className='flex items-center gap-2'>
								<div className='flex-1 h-1.5 bg-border rounded-full overflow-hidden'>
									<div
										className='h-full bg-primary transition-all duration-300'
										style={{ width: `${pendingFile.progress}%` }}
									/>
								</div>
								<span className='text-xs text-text-sub'>{pendingFile.progress}%</span>
							</div>
						)}
						{!pendingFile.isUploading && (
							<p className='text-xs text-success'>Upload complete - Click send to attach</p>
						)}
					</div>
				)}

				{isRecording ? (
					<div className='flex flex-col justify-center items-start p-0 w-full bg-danger/10 border border-danger/16 rounded-2xl shadow-subtle'>
						{/* Recording Section */}
						<div className='flex flex-row items-center px-4 py-3 w-full gap-3'>
							{/* Recording Indicator */}
							<div className='w-3 h-3 rounded-full bg-danger animate-pulse flex-shrink-0'></div>
							{/* Recording Time */}
							<span className='text-sm font-medium text-danger leading-5 flex items-center'>
								{formatTime(recordingTime)}
							</span>
							{/* Waveform Animation */}
							<div className='flex-1 flex items-center gap-0.5 h-6'>
								{[...Array(20)].map((_, i) => (
									<div
										key={i}
										className='w-0.5 bg-danger rounded-full'
										style={{
											height: "16px",
											opacity: 0.7,
										}}></div>
								))}
							</div>
							{/* Cancel Button */}
							<IconButton
								Icon={CloseLine}
								ariaLabel='Cancel recording'
								onClick={cancelRecording}
								className='!w-8 !h-8 !rounded-full !border-0 !bg-transparent hover:opacity-60'
								variant='ghost'
							/>
							{/* Stop/Send Button */}
							<IconButton
								Icon={Send}
								ariaLabel='Stop and send recording'
								onClick={stopRecording}
								className='!w-8 !h-8 !rounded-full !border-0 !bg-transparent hover:opacity-60'
								variant='ghost'
							/>
						</div>
						{recordingError && (
							<div className='px-4 pb-2'>
								<p className='text-xs text-danger'>{recordingError}</p>
							</div>
						)}
					</div>
				) : replyingTo ? (
					<div className='flex flex-col justify-center items-start p-0 w-full h-20 bg-primary/10 border border-primary/16 rounded-2xl shadow-subtle'>
						{/* Reply Section */}
						<div className='flex flex-row items-center px-3 py-2 gap-2 w-full h-8'>
							<Reply
								size={16}
								className='fill-primary opacity-40 flex-shrink-0'
							/>
							{replyingTo.type === "file" && replyingTo.fileName ? (
								<>
									<Paperclip
										size={16}
										className='fill-text-sub flex-shrink-0'
									/>
									<p className='text-xs font-normal text-text-sub leading-4 flex items-center flex-shrink-0'>
										{replyingTo.fileName}
									</p>
								</>
							) : replyingTo.type === "voice" ? (
								<>
									<Microphone
										size={16}
										className='fill-text-sub flex-shrink-0'
									/>
									<p className='text-xs font-normal text-text-sub leading-4 flex items-center flex-shrink-0'>
										Voice Message
									</p>
								</>
							) : (
								<p className='text-xs font-normal text-text-sub leading-4 flex items-center flex-1'>
									{getReplyContent()}
								</p>
							)}
							<IconButton
								Icon={CloseLine}
								ariaLabel='Cancel reply'
								onClick={onCancelReply}
								className='!w-6 !h-6 !rounded-full !border-0 !bg-transparent ml-auto hover:opacity-60'
								variant='ghost'
							/>
						</div>

						{/* Message Input Section */}
						<div className='flex flex-row items-center px-4 py-3 w-full h-12 bg-background border border-primary/16 rounded-2xl shadow-subtle'>
							<input
								type='text'
								placeholder={t("communication.messages.messagePlaceholder")}
								{...register("message")}
								value={messageValue}
								onChange={(e) => {
									if (isReadOnly) return;
									const newValue = e.target.value;
									setValue("message", newValue, { shouldValidate: true });
									onChange?.(newValue);
								}}
								onKeyDown={(e) => {
									if (isReadOnly) return;
									if (e.key === "Enter" && !e.shiftKey) {
										e.preventDefault();
										onSend?.();
									}
								}}
								readOnly={isReadOnly}
								className={`flex-1 bg-transparent text-sm text-text-strong placeholder:text-text-soft focus:outline-none ${
									isReadOnly ? "cursor-not-allowed" : ""
								}`}
							/>
							<div className='flex items-center gap-4 ml-4'>
								<IconButton
									Icon={Paperclip}
									ariaLabel={t("communication.messages.attachFile")}
									onClick={handleAttachClick}
									className={`!w-8 !h-8 !rounded-full !border-0 !bg-transparent ${
										isReadOnly ? "opacity-40 cursor-not-allowed" : ""
									}`}
									variant='ghost'
									disabled={isReadOnly}
								/>
								<IconButton
									Icon={Microphone}
									ariaLabel={
										isRecording
											? t("communication.messages.stopRecording")
											: t("communication.messages.startVoiceRecording")
									}
									onClick={handleVoiceClick}
									active={isRecording}
									className={`!w-8 !h-8 !rounded-full !border-0 !bg-transparent ${
										isRecording ? "text-danger" : ""
									} ${isReadOnly ? "opacity-40 cursor-not-allowed" : ""}`}
									variant='ghost'
									disabled={isReadOnly}
								/>
								<div className='h-6 w-px bg-border' />
								<IconButton
									Icon={Send}
									ariaLabel={t("communication.messages.sendMessage")}
									onClick={handleSendClick}
									className={`!w-8 !h-8 !rounded-full !border-0 !bg-transparent ${
										isReadOnly ? "opacity-40 cursor-not-allowed" : ""
									}`}
									variant='ghost'
									disabled={isReadOnly}
								/>
							</div>
						</div>
					</div>
				) : (
					<div className='relative flex items-center rounded-2xl border border-border bg-background px-4 py-3'>
						<input
							type='text'
							placeholder={t("communication.messages.messagePlaceholder")}
							{...register("message")}
							value={messageValue}
							onChange={(e) => {
								if (isReadOnly) return;
								const newValue = e.target.value;
								setValue("message", newValue, { shouldValidate: true });
								onChange?.(newValue);
							}}
							onKeyDown={handleKeyDown}
							readOnly={isReadOnly}
							className={`flex-1 bg-transparent text-sm text-text-strong placeholder:text-text-soft focus:outline-none ${
								isReadOnly ? "cursor-not-allowed" : ""
							}`}
						/>
						<div className='flex items-center gap-4 ml-4'>
							<button
								onClick={handleAttachClick}
								className={`text-text-soft transition-all ${
									isReadOnly
										? "opacity-40 cursor-not-allowed"
										: "hover:text-text-sub cursor-pointer active:scale-95"
								}`}
								type='button'
								disabled={isReadOnly}>
								<Paperclip size={20} />
							</button>
							<button
								onClick={handleVoiceClick}
								className={`${
									isRecording
										? "text-danger"
										: "text-text-soft"
								} ${
									isReadOnly
										? "opacity-40 cursor-not-allowed"
										: "hover:text-text-sub cursor-pointer active:scale-95"
								} transition-all`}
								type='button'
								disabled={isReadOnly}>
								<Microphone size={20} active={isRecording} />
							</button>
							<div className='h-6 w-px bg-border' />
							<button
								onClick={handleSendClick}
								className={`text-stroke-sub-300 transition-all ${
									isReadOnly
										? "opacity-40 cursor-not-allowed"
										: "hover:text-text-soft cursor-pointer active:scale-95"
								}`}
								type='button'
								disabled={isReadOnly}>
								<Send size={20} />
							</button>
						</div>
					</div>
				)}
			</div>
		);
	};

	// Sync external value changes to form
	useEffect(() => {
		if (formInstanceRef.current) {
			formInstanceRef.current.setValue("message", value, { shouldValidate: false });
		}
	}, [value]);

	return (
		<GenericForm<MessageFormData>
			schema={messageSchema}
			defaultValues={{ message: "" }}
			onSubmit={handleSubmit}
			onFieldChange={handleFieldChange}
			renderFields={renderFields}
			showSubmitButton={false}
			className=''
		/>
	);
}

export default MessageInput;
