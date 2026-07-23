const Xmark = ({ className, active = false, size = 20 }: { className?: string; active?: boolean; size?: number }) => (
<svg
   width={size}
   height={size}
   viewBox="0 0 20 20"
   xmlns="http://www.w3.org/2000/svg"
   className={className || (active ? "fill-primary" : "fill-icon-sub")}
>
    <path d="M15.2442 16.4223C15.5697 16.7477 16.0973 16.7477 16.4228 16.4223C16.7482 16.0968 16.7482 15.5692 16.4228 15.2438L11.1787 9.99967L16.4228 4.7556C16.7482 4.43016 16.7482 3.90252 16.4228 3.57709C16.0973 3.25165 15.5697 3.25165 15.2442 3.57709L10.0002 8.82116L4.75608 3.57709C4.43065 3.25165 3.90301 3.25165 3.57757 3.57709C3.25214 3.90252 3.25214 4.43016 3.57757 4.7556L8.82165 9.99968L3.57757 15.2438C3.25214 15.5692 3.25214 16.0968 3.57757 16.4223C3.90301 16.7477 4.43065 16.7477 4.75609 16.4223L10.0002 11.1782L15.2442 16.4223Z" className={className || (active ? "fill-primary" : "fill-icon-sub")}/>
   </svg>
);
export default Xmark;
