import React, { ReactNode } from "react";

interface ChatEmptyStateProps {
   message?: string;
   subMessage?: string;
   action?: ReactNode;
}

export const ChatEmptyState: React.FC<ChatEmptyStateProps> = ({
   message,
   subMessage,
   action,
}) => {
   return (
      <div
         className="content-stretch flex flex-col gap-[24px] items-center justify-center px-[24px] py-[40px] relative size-full"
         data-name="Chats"
         data-node-id="1169:467754">
         <div
            className="grid-cols-[max-content] grid-rows-[max-content] inline-grid justify-items-start leading-[0] relative shrink-0"
            data-name="25">
            <div className="w-50 relative top-10 right-2">
               <img src="/icons/25.png" alt="not" />
            </div>
         </div>
         <div
            className="content-stretch flex flex-col gap-[4px] items-center leading-[0] not-italic overflow-clip relative shrink-0 w-full whitespace-nowrap"
            data-node-id="1169:467772">
            <div
               className="flex flex-col font-[family-name:var(--typography\/family,'SF_Pro_Rounded:Medium',sans-serif)] justify-center relative shrink-0 text-[16px] text-text-strong tracking-[-0.176px]"
               data-node-id="1169:467773">
               <p className="leading-[24px]">{message || "No chat selected"}</p>
            </div>
            <div
               className="flex flex-col font-[family-name:var(--typography\/family,'SF_Pro_Rounded:Regular',sans-serif)] justify-center relative shrink-0 text-[14px] text-text-sub tracking-[-0.084px]"
               data-node-id="1169:467774">
               <p className="leading-[20px]">
                  {subMessage ||
                     "Choose a chat from the left to view messages."}
               </p>
            </div>
            {action ? (
               <div className="pt-2 flex items-center justify-center w-full">
                  {action}
               </div>
            ) : null}
         </div>
      </div>
   );
};
