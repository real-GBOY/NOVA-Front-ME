/** @format */

import { MouseEvent } from "react";
import MemberTag1 from "@/components/contracts/MemberTag1";

interface MemberTagProps {
   avatar: string;
   name: string;
   className?: string;
   jobTitle?: string | null;
   onClick?: (event: MouseEvent<HTMLButtonElement | HTMLDivElement>) => void;
}

function MemberTag2({ avatar, name, className = "", jobTitle, onClick }: MemberTagProps) {
   return (
      <div className="w-fit">

      <MemberTag1
         name={name}
         avatar={avatar}
         className={className}
         jobTitle={jobTitle}
         variant="tag"
         size="xs"
         showJobTitle={!!jobTitle}
         onClick={onClick}
         />
         </div>
   );
}

export default MemberTag2;
