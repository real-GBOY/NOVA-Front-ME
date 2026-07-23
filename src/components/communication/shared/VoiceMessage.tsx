/** @format */

import { Play, Pause } from "@/Icons";
import { useState, useRef, useEffect } from "react";

interface VoiceMessageProps {
	duration: string;
	isOwn?: boolean;
	audioUrl?: string;
}

function VoiceMessage({ duration, isOwn = false, audioUrl }: VoiceMessageProps) {
	const [isPlaying, setIsPlaying] = useState(false);
	const [progress, setProgress] = useState(0);
	const [currentTime, setCurrentTime] = useState(0);
	const [totalDuration, setTotalDuration] = useState(0);
	const audioRef = useRef<HTMLAudioElement | null>(null);

	useEffect(() => {
		if (audioUrl) {
			const audio = new Audio(audioUrl);
			audioRef.current = audio;

			audio.addEventListener("loadedmetadata", () => {
				if (isFinite(audio.duration)) {
					setTotalDuration(audio.duration);
				}
			});

			audio.addEventListener("timeupdate", () => {
				setCurrentTime(audio.currentTime);
				if (isFinite(audio.duration)) {
					setProgress((audio.currentTime / audio.duration) * 100);
				}
			});

			audio.addEventListener("ended", () => {
				setIsPlaying(false);
				setProgress(0);
				setCurrentTime(0);
			});

			return () => {
				audio.pause();
				audio.src = "";
			};
		}
	}, [audioUrl]);

	const togglePlay = () => {
		if (!audioRef.current) return;

		if (isPlaying) {
			audioRef.current.pause();
		} else {
			audioRef.current.play();
		}
		setIsPlaying(!isPlaying);
	};

	const formatTime = (time: number) => {
		if (!isFinite(time) || isNaN(time)) return duration || "0:00";
		const minutes = Math.floor(time / 60);
		const seconds = Math.floor(time % 60);
		return `${minutes}:${seconds.toString().padStart(2, "0")}`;
	};

	// Use totalDuration if available, otherwise fallback to prop duration
	const displayTime = totalDuration ? formatTime(isPlaying ? currentTime : totalDuration) : duration;

	return (
		<div
			className={`rounded-2xl px-3 py-2 min-w-[240px] flex items-center gap-3 ${
				isOwn ? "text-background" : "text-primary"
			}`}>
			<button
				className={`w-10 h-10 ${
					isOwn ? "bg-background text-primary" : "bg-primary text-background"
				} rounded-full flex items-center justify-center border-0 transition-transform active:scale-95 shadow-sm`}
				aria-label={isPlaying ? "Pause voice message" : "Play voice message"}
				type='button'
				onClick={togglePlay}>
				{isPlaying ? (
					<Pause
						size={16}
						className="fill-current"
					/>
				) : (
					<Play
						size={16}
						active={true}
						className="fill-current ml-0.5"
					/>
				)}
			</button>
			<div className='flex-1 flex flex-col justify-center gap-1'>
				<div className='flex items-center h-8 gap-[2px] overflow-hidden'>
					{[...Array(35)].map((_, i) => {
						const barProgress = (i / 35) * 100;
						const isFilled = barProgress <= progress;
						
						return (
							<div
								key={i}
								className={`w-[3px] rounded-full transition-all duration-200 ${
									isOwn 
										? (isFilled ? "bg-background opacity-100" : "bg-background opacity-50")
										: (isFilled ? "bg-primary opacity-100" : "bg-primary opacity-30")
								}`}
								style={{
									height: "24px",
								}}></div>
						);
					})}
				</div>
			</div>
			<span
				className={`text-xs ${
					isOwn ? "text-background/90" : "text-text-soft"
				} ml-1 min-w-[35px] text-right font-medium`}>
				{displayTime}
			</span>
		</div>
	);
}

export default VoiceMessage;
