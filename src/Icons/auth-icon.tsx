const AuthIcon = ({ className, active = false, size = 20 }: { className?: string; active?: boolean; size?: number }) => (
<svg
   width={size}
   height={size}
   viewBox="0 0 32 32"
   xmlns="http://www.w3.org/2000/svg"
   className={className || (active ? "fill-primary" : "fill-icon-sub")}
>
    <path d="M6.40002 28C6.40002 25.4539 7.41145 23.0121 9.2118 21.2118C11.0121 19.4114 13.4539 18.4 16 18.4C18.5461 18.4 20.9879 19.4114 22.7882 21.2118C24.5886 23.0121 25.6 25.4539 25.6 28H6.40002ZM16 17.2C12.022 17.2 8.80002 13.978 8.80002 10C8.80002 6.022 12.022 2.8 16 2.8C19.978 2.8 23.2 6.022 23.2 10C23.2 13.978 19.978 17.2 16 17.2Z" className={className || (active ? "fill-primary" : "fill-icon-sub")}/>
   </svg>
);
export default AuthIcon;



