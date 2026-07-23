/** @format */

import { useState } from "react";
import { GroupChat } from "../types";
import { getGroupInitials } from "../utils";
import UpdateGroupAvatarModal from "./UpdateGroupAvatarModal";
import IconButton from "@/designSystem/IconButton";
import { ArrowLeftSLine } from "@/Icons";

interface GroupChatHeaderProps {
   group: GroupChat;
   onBack?: () => void;
}

function GroupChatHeader({
   group,
   onBack,
}: GroupChatHeaderProps) {
   const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
   const groupId = Number(group.id);
   // Get member avatars (first 4)
   const memberAvatars = group.members.slice(0, 4);

   return (
      <div className="flex items-center justify-between bg-background rounded-[14px] md:rounded-[16px] border border-border px-3 py-2 md:py-3">
         {/* Left Section - Avatar and Info */}
         <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
            {onBack ? (
               <IconButton
                  Icon={ArrowLeftSLine}
                  ariaLabel='Back to chats'
                  variant='ghost'
                  onClick={onBack}
                  className='w-8 h-8 md:w-9 md:h-9 rounded-full border border-border'
               />
            ) : null}
            {/* Group Avatar */}
            <button
               type="button"
               onClick={() => setIsAvatarModalOpen(true)}
               className="relative w-9 h-9 md:w-10 md:h-10 flex-shrink-0 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
               aria-label="Edit group photo">
               {group.avatar ? (
                  <img
                     src={group.avatar}
                     alt={group.name}
                     className="w-9 h-9 md:w-10 md:h-10 rounded-full object-cover"
                     onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        if (target.src !== "/icons/defAvatar.png") {
                           target.src = "/icons/defAvatar.png";
                        }
                     }}
                  />
               ) : (
                  <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-border flex items-center justify-center">
                     <span className="text-base font-medium text-text-strong leading-6 tracking-[-0.011em] text-center">
                        {getGroupInitials(group.name)}
                     </span>
                  </div>
               )}
               {/* Online Status Indicator - Bottom right */}
               <div className="absolute left-[70%] top-[55%] w-3 h-3 rounded-full border-2 border-background bg-success"></div>
            </button>

            {/* Group Name and Member Info */}
            <div className="flex flex-col gap-1 flex-1 min-w-0">
               <h2 className="text-sm md:text-base font-medium text-text-strong leading-5 tracking-[-0.006em] truncate">
                  {group.name}
               </h2>
               <div className="flex items-center gap-2">
                  <span className="text-[11px] md:text-xs font-normal text-text-soft leading-4">
                     {group.memberCount} Members
                  </span>
                  <span className="text-xs font-normal text-text-soft leading-4">
                     •
                  </span>
                  <span className="text-[11px] md:text-xs font-normal text-success leading-4">
                     {group.onlineCount} Online
                  </span>
               </div>
            </div>

            {/* Member Avatars Group */}
            <div className="hidden sm:flex items-center flex-shrink-0">
               <div className="flex items-center">
                  {memberAvatars.map((member, index) => (
                     <div
                        key={member.id}
                        className={`w-7 h-7 md:w-8 md:h-8 rounded-full border-2 border-background bg-bg-weak overflow-hidden ${
                           index > 0 ? "-ml-1.5" : ""
                        }`}>
                        <img
                           src={member.avatar || "/icons/defAvatar.png"}
                           alt={member.name}
                           className="w-full h-full object-cover rounded-full"
                           onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              if (target.src !== "/icons/defAvatar.png") {
                                 target.src = "/icons/defAvatar.png";
                              }
                           }}
                        />
                     </div>
                  ))}
                  {group.memberCount > 4 && (
                     <div className="w-7 h-7 md:w-8 md:h-8 rounded-full border-2 border-background bg-bg-weak flex items-center justify-center -ml-1.5">
                        <span className="text-xs md:text-sm font-medium text-text-sub leading-5 tracking-[-0.006em] text-center">
                           +{group.memberCount - 4}
                        </span>
                     </div>
                  )}
               </div>
            </div>
         </div>

         <UpdateGroupAvatarModal
            isOpen={isAvatarModalOpen}
            onClose={() => setIsAvatarModalOpen(false)}
            groupId={Number.isFinite(groupId) ? groupId : 0}
            groupName={group.name}
            groupAvatar={group.avatar}
         />
      </div>
   );
}

export default GroupChatHeader;
