/** @format */

const MailLine = ({ className, active = false, size = 20 }: { className?: string; active?: boolean; size?: number }) => (
<svg
   width={size}
   height={size}
   viewBox="0 0 20 20"
   xmlns="http://www.w3.org/2000/svg"
   className={className || (active ? "fill-primary" : "fill-icon-sub")}
>
    <path d="M2.5 5.83333L10 10.8333L17.5 5.83333M3.33333 15.8333H16.6667C17.5871 15.8333 18.3333 15.0871 18.3333 14.1667V5.83333C18.3333 4.91286 17.5871 4.16667 16.6667 4.16667H3.33333C2.41286 4.16667 1.66667 4.91286 1.66667 5.83333V14.1667C1.66667 15.0871 2.41286 15.8333 3.33333 15.8333Z" className={className || (active ? "fill-primary" : "fill-icon-sub")}/>
   </svg>
);
export default MailLine;



