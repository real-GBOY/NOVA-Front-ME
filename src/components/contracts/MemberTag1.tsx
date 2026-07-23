/** @format */

import { MouseEvent } from "react";
import { AVATAR_SRC } from "@/components/constants";
import { buildStorageUrl } from "@/utils/storageUrl";

const resolveAvatarUrl = (avatar?: string | null) => {
   if (!avatar) return undefined;
   if (avatar.startsWith("/")) {
      if (avatar.startsWith("/uploads/")) return buildStorageUrl(avatar);
      return avatar;
   }
   return buildStorageUrl(avatar);
};

type MemberTag1Props = {
   name: string;
   jobTitle?: string | null;
   avatar?: string | null;
   avatarBg?: string;
   onClick?: (event: MouseEvent<HTMLButtonElement | HTMLDivElement>) => void;
   className?: string;
   showJobTitle?: boolean;
   variant?: "table" | "tag";
   size?: "xs" | "sm" | "md";
};

const sizeStyles = {
   xs: {
      avatar: "w-4 h-4",
      name: "text-xs",
      job: "text-[10px]",
   },
   sm: {
      avatar: "w-6 h-6",
      name: "text-xs",
      job: "text-[11px]",
   },
   md: {
      avatar: "w-10 h-10",
      name: "text-sm",
      job: "text-xs",
   },
};

function MemberTag1({
   name,
   jobTitle,
   avatar,
   avatarBg,
   onClick,
   className = "",
   showJobTitle,
   variant = "table",
   size,
}: MemberTag1Props) {
   const resolvedAvatar = resolveAvatarUrl(avatar) || AVATAR_SRC;
   const computedSize = size || (variant === "tag" ? "xs" : "md");
   const styles = sizeStyles[computedSize];
   const shouldShowJobTitle =
      typeof showJobTitle === "boolean" ? showJobTitle : variant === "table";

   const baseClasses =
      variant === "table"
         ? `flex items-center gap-3 w-full text-left rounded-lg p-1 -m-1 transition-colors group ${
              onClick ? "hover:bg-bg-weak cursor-pointer" : ""
           }`
         : `inline-flex items-center gap-1 bg-background border border-border rounded-lg ps-1 pe-2 py-1 ${
              onClick ? "cursor-pointer" : ""
           }`;

   const content = (
      <>
         <div
            className={`${styles.avatar} rounded-full flex items-center justify-center overflow-hidden ${avatarBg}`}>
            <img
               src={resolvedAvatar}
               alt={name}
               className="w-full h-full rounded-full object-cover"
               onError={(event) => {
                  const target = event.currentTarget;
                  if (target.src !== AVATAR_SRC) {
                     target.src = AVATAR_SRC;
                  }
               }}
            />
         </div>
         <div className="flex flex-col gap-0.5 min-w-0">
            <p
               className={`${
                  styles.name
               } font-medium text-text-strong truncate ${
                  onClick && variant === "table"
                     ? "group-hover:text-primary group-hover:underline transition-colors"
                     : ""
               }`}>
               {name}
            </p>
            {shouldShowJobTitle && jobTitle && (
               <p className={`${styles.job} text-primary truncate`}>
                  {jobTitle}
               </p>
            )}
         </div>
      </>
   );

   if (onClick) {
      return (
         <button
            type="button"
            onClick={onClick}
            className={`${baseClasses} ${className}`}>
            {content}
         </button>
      );
   }

   return <div className={`${baseClasses} ${className}`}>{content}</div>;
}

export default MemberTag1;
