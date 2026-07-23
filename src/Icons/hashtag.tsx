const Hashtag = ({ className, active = false, size = 20, isRTL }: { className?: string; active?: boolean; size?: number; isRTL?: boolean }) => (
<svg
   width={size}
   height={size}
   viewBox="0 0 16 16"
   xmlns="http://www.w3.org/2000/svg"
   className={`${isRTL ? "rotate-180" : ""} ${className || (active ? "fill-primary" : "fill-icon-sub")}`}
>
    <g opacity="0.4">
    <path d="M7.64843 2.13395C7.72234 1.86788 7.56656 1.59228 7.3005 1.51837C7.03443 1.44446 6.75882 1.60024 6.68492 1.8663L3.35158 13.8663C3.27767 14.1324 3.43345 14.408 3.69952 14.4819C3.96559 14.5558 4.24119 14.4 4.3151 14.1339L7.64843 2.13395Z" className={className || (active ? "fill-primary" : "fill-icon-sub")}/>
    <path d="M12.6484 2.13395C12.7223 1.86788 12.5666 1.59228 12.3005 1.51837C12.0344 1.44446 11.7588 1.60024 11.6849 1.8663L8.35158 13.8663C8.27767 14.1324 8.43345 14.408 8.69952 14.4819C8.96559 14.5558 9.24119 14.4 9.3151 14.1339L12.6484 2.13395Z" className={className || (active ? "fill-primary" : "fill-icon-sub")}/>
    </g>
    <path d="M2.66667 4.66602C2.39053 4.66602 2.16667 4.88987 2.16667 5.16602C2.16667 5.44216 2.39053 5.66602 2.66667 5.66602H14.6669C14.943 5.66602 15.1669 5.44216 15.1669 5.16602C15.1669 4.88987 14.943 4.66602 14.6669 4.66602H2.66667Z" className={className || (active ? "fill-primary" : "fill-icon-sub")}/>
    <path d="M1.33334 10.3327C1.05719 10.3327 0.833336 10.5565 0.833336 10.8327C0.833336 11.1088 1.05719 11.3327 1.33334 11.3327H13.3333C13.6095 11.3327 13.8333 11.1088 13.8333 10.8327C13.8333 10.5565 13.6095 10.3327 13.3333 10.3327H1.33334Z" className={className || (active ? "fill-primary" : "fill-icon-sub")}/>
   </svg>
);
export default Hashtag;
