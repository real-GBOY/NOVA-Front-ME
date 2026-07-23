const Check = ({ className, active = false, size = 20 }: { className?: string; active?: boolean; size?: number }) => (
<svg
   width={size}
   height={size}
   viewBox="0 0 20 20"
   xmlns="http://www.w3.org/2000/svg"
   className={className || (active ? "fill-primary" : "fill-icon-sub")}
>
    <path d="M18.0891 4.41107C18.4145 4.73651 18.4145 5.26414 18.0891 5.58958L8.08909 15.5896C7.76366 15.915 7.23602 15.915 6.91058 15.5896L1.91058 10.5896C1.58514 10.2641 1.58514 9.73651 1.91058 9.41107C2.23602 9.08563 2.76366 9.08563 3.08909 9.41107L7.49984 13.8218L16.9106 4.41107C17.236 4.08563 17.7637 4.08563 18.0891 4.41107Z" className={className || (active ? "fill-primary" : "fill-icon-sub")}/>
   </svg>
);
export default Check;
