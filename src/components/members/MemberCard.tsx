/** @format */

import { Briefcase, Mobile, Calender, LockCircle } from "@/Icons";
import RoleTag from "@/designSystem/RoleTag";
import PermissionTag from "@/designSystem/PermissionTag";
import MemberActionsMenu from "./MemberActionsMenu";
import { useTranslation } from "@/hooks/useTranslation";

export interface MemberCardProps {
   name: string;
   email: string;
   avatar?: string;
   avatarBg?: string;
   jobTitle: string;
   contact: string;
   joinedAt: string;
   isPermissionOverride?: boolean;
   role: string;
   roleIcon?: "warning" | "error" | null;
   onViewProfile: () => void;
   onSendMessage: () => void;
   onOverridePermissions: () => void;
   onResetPermissions: () => void;
   onDeactivate?: () => void;
   onResendInvite?: () => void;
   status?: "active" | "inactive";
}

function MemberCard({
   name,
   email,
   avatar,
   avatarBg = "bg-bg-weak",
   jobTitle,
   contact,
   joinedAt,
   isPermissionOverride = false,
   role,
   roleIcon,
   onViewProfile,
   onSendMessage,
   onOverridePermissions,
   onResetPermissions,
   onDeactivate,
   onResendInvite,
   status = "inactive",
}: MemberCardProps) {
   const { t } = useTranslation("members");

   const shadowClass =
      status === "active"
         ? "shadow-[0_2.5px_0_0_var(--color-success)] hover:shadow-[0_2.5px_0_0_var(--color-success),0_10px_20px_-5px_rgba(0,0,0,0.07)]"
         : "shadow-[0_2.5px_0_0_var(--color-stroke-sub-300)] hover:shadow-[0_2.5px_0_0_var(--color-stroke-sub-300),0_10px_20px_-5px_rgba(0,0,0,0.07)]";

   return (
      <div
         className={`bg-background border border-border rounded-[20px] p-5 flex flex-col gap-5 h-full transition-shadow ${shadowClass}`}>
         {/* Header */}
         <div className="flex items-center gap-3">
            {/* Avatar */}
            <div
               className={`relative ${avatarBg} rounded-full size-10 shrink-0 overflow-hidden`}>
               <img
                  src={avatar || "/icons/defAvatar.png"}
                  alt={name}
                  className="w-full h-full object-cover"
               />
            </div>

            {/* Name and Role */}
            <div className="flex-1 min-w-0 flex flex-col gap-0.5">
               <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-text-strong truncate">
                     {name}
                  </p>
                  <RoleTag
                     label={role}
                     showWarning={roleIcon === "warning"}
                     size="sm"
                  />
               </div>
               <p className="text-xs text-primary truncate">{email}</p>
            </div>

            {/* Menu Button */}
            <MemberActionsMenu
               onViewProfile={onViewProfile}
               onSendMessage={onSendMessage}
               onResendInvite={onResendInvite}
               onOverridePermissions={onOverridePermissions}
               onResetPermissions={onResetPermissions}
               onDeactivate={onDeactivate}
            />
         </div>

         {/* Data Section */}
         <div className="bg-bg-weak border border-border rounded-2xl p-4 flex flex-col gap-3">
            {/* First Row - Job Title & Contact */}
            <div className="flex gap-3">
               {/* Job Title */}
               <div className="flex-1 min-w-0 flex flex-col gap-2">
                  <div className="flex items-center gap-1.5">
                     <Briefcase size={16} />
                     <p className="text-sm text-text-sub">
                        {t("fields.jobTitle")}
                     </p>
                  </div>
                  <p className="text-sm text-text-strong">{jobTitle}</p>
               </div>

               {/* Contact */}
               <div className="flex-1 min-w-0 flex flex-col gap-2">
                  <div className="flex items-center gap-1.5">
                     <Mobile size={16} />
                     <p className="text-sm text-text-sub">
                        {t("fields.contact")}
                     </p>
                  </div>
                  <a
                     href={`tel:${contact}`}
                     className="text-sm text-primary underline hover:text-primary-dark transition-colors">
                     {contact}
                  </a>
               </div>
            </div>

            {/* Second Row - Joined At & Permissions */}
            <div className="flex gap-3">
               {/* Joined At */}
               <div className="flex-1 min-w-0 flex flex-col gap-2">
                  <div className="flex items-center gap-1.5">
                     <Calender size={16} />
                     <p className="text-sm text-text-sub">
                        {t("fields.joinedAt")}
                     </p>
                  </div>
                  <p className="text-sm text-text-strong truncate">
                     {joinedAt}
                  </p>
               </div>

               {/* Permissions */}
               <div className="flex-1 min-w-0 flex flex-col gap-2">
                  <div className="flex items-center gap-1.5">
                     <LockCircle size={16} />
                     <p className="text-sm text-text-sub">
                        {t("fields.permissions")}
                     </p>
                  </div>
                  <PermissionTag
                     label={
                        isPermissionOverride
                           ? t("permissions.override")
                           : t("permissions.default")
                     }
                     isOverride={isPermissionOverride}
                     size="sm"
                  />
               </div>
            </div>
         </div>
      </div>
   );
}

export default MemberCard;
