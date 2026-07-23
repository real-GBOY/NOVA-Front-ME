/** @format */

import { Paperclip, Microphone } from "@/Icons";
import { isEnglishText, cn } from "@/utilities/index";
import { useTranslation } from "@/hooks/useTranslation";

interface LastMessagePreviewProps {
   lastMessage: string;
   messageType?: "text" | "voice" | "file";
   isTyping?: boolean;
   hasUnread?: boolean;
}

function LastMessagePreview({
   lastMessage,
   messageType,
   isTyping,
   hasUnread,
}: LastMessagePreviewProps) {
   const { t } = useTranslation("common");
   if (isTyping) {
      return (
         <p
            className={cn(
               "text-sm font-normal text-primary leading-5 tracking-[-0.006em]",
               isEnglishText(t("messages.typing")) && "font-english"
            )}>
            {t("messages.typing")}
         </p>
      );
   }

   const textStyle = hasUnread
      ? "text-sm font-semibold text-text-strong leading-5 tracking-[-0.006em]"
      : "text-sm font-normal text-text-sub leading-5 tracking-[-0.006em]";

   if (messageType === "voice") {
      return (
         <>
            <Microphone size={16} />
            <span
               className={cn(
                  textStyle,
                  isEnglishText(t("messages.voiceMessage")) && "font-english"
               )}>
               {t("messages.voiceMessage")}
            </span>
         </>
      );
   }

   if (messageType === "file") {
      return (
         <>
            <Paperclip size={16} active={true} />
            <span
               className={cn(
                  textStyle,
                  isEnglishText(t("messages.attachment")) && "font-english"
               )}>
               {t("messages.attachment")}
            </span>
         </>
      );
   }

   const isEnglish = isEnglishText(lastMessage);
   return (
      <p className={cn(`${textStyle} truncate`, isEnglish && "font-english")}>
         {lastMessage}
      </p>
   );
}

export default LastMessagePreview;
