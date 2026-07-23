const LocationSimpleUser = ({ className, active = false, size = 20 }: { className?: string; active?: boolean; size?: number }) => (
<svg
   width={size}
   height={size}
   viewBox="0 0 24 24"
   xmlns="http://www.w3.org/2000/svg"
   className={className || (active ? "fill-primary" : "fill-icon-sub")}
>
    <path opacity="0.4" d="M12 1.25C7.16751 1.25 3.25 5.16754 3.25 10C3.25 14.2073 5.92621 17.1754 7.78067 19.2322L7.94247 19.4117C8.62466 20.1697 10.2022 21.632 10.9929 22.3568C11.5634 22.8798 12.4365 22.8798 13.007 22.3568C13.7978 21.632 15.3752 20.1697 16.0574 19.4117L16.2124 19.2397C17.9881 17.2706 20.7499 14.2078 20.7499 10C20.7499 5.16756 16.8324 1.25 12 1.25Z" className={className || (active ? "fill-primary" : "fill-icon-sub")}/>
    <path d="M9.70007 7.8C9.70007 6.52975 10.7298 5.5 12.0001 5.5C13.2703 5.5 14.3001 6.52975 14.3001 7.8C14.3001 9.07026 13.2703 10.1 12.0001 10.1C10.7298 10.1 9.70007 9.07026 9.70007 7.8Z" className={className || (active ? "fill-primary" : "fill-icon-sub")}/>
    <path d="M8.31583 13.8755C8.73112 12.262 10.2939 11.1001 12 11.1001C13.7062 11.1001 15.269 12.262 15.6843 13.8755C15.7228 14.0252 15.6899 14.1843 15.5952 14.3064C15.5005 14.4286 15.3546 14.5001 15.2001 14.5001H8.80005C8.64548 14.5001 8.49959 14.4286 8.40489 14.3064C8.31018 14.1843 8.27731 14.0252 8.31583 13.8755Z" className={className || (active ? "fill-primary" : "fill-icon-sub")}/>
   </svg>
);
export default LocationSimpleUser;
